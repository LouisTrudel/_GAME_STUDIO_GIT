"""
Game Studio Server: FastAPI + WebSocket backend.

Run with: python server.py
Open: studio.html in your browser
"""

from dotenv import load_dotenv
load_dotenv()  # Load .env file

import os
import subprocess
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import json

import logging

from studio.core.hub import hub
from studio.core.tasks import task_manager
from studio.core.heartbeats import heartbeat_manager
from studio.core.studio_metrics import get_session_tokens, reset_session_tokens
from studio.studio import Studio, load_agent_role, load_agent_config, get_all_agent_names

logger = logging.getLogger(__name__)

# Track WebSocket connections
connections: list[WebSocket] = []

# Background task for broadcasting
broadcast_task = None

# Current thinking state
current_thinking_agent: str | None = None

# Agent status tracking: {"AgentName": {"status": "idle/working/thinking", "activity": "description"}}
agent_statuses: dict[str, dict] = {}

# Event loop reference (set at startup for thread-safe access)
main_loop: asyncio.AbstractEventLoop | None = None


def update_agent_status_sync(agent: str, status: str, activity: str = ""):
    """Update an agent's status (called from sync code)."""
    global agent_statuses
    agent_statuses[agent] = {"status": status, "activity": activity}
    if main_loop is not None:
        asyncio.run_coroutine_threadsafe(_broadcast_agent_statuses(), main_loop)


def broadcast_thinking_sync(agent: str | None):
    """Queue a thinking broadcast (called from sync code)."""
    global current_thinking_agent
    current_thinking_agent = agent
    # Also update agent status
    if agent:
        update_agent_status_sync(agent, "thinking", "Processing...")
    else:
        # Clear all thinking statuses when done
        for name in list(agent_statuses.keys()):
            if agent_statuses[name].get("status") == "thinking":
                agent_statuses[name] = {"status": "idle", "activity": ""}
        if main_loop is not None:
            asyncio.run_coroutine_threadsafe(_broadcast_agent_statuses(), main_loop)
    # Schedule the actual broadcast in the event loop
    if main_loop is not None:
        asyncio.run_coroutine_threadsafe(_do_broadcast_thinking(agent), main_loop)


async def _broadcast_agent_statuses():
    """Broadcast all agent statuses to connected clients."""
    data = json.dumps({
        "type": "agent_statuses",
        "data": agent_statuses
    })
    dead = []
    for ws in connections:
        try:
            await ws.send_text(data)
        except:
            dead.append(ws)
    for ws in dead:
        connections.remove(ws)


async def _do_broadcast_thinking(agent: str | None):
    """Actually broadcast thinking state to all connected clients."""
    data = json.dumps({
        "type": "thinking",
        "active": agent is not None,
        "agent": agent
    })
    dead = []
    for ws in connections:
        try:
            await ws.send_text(data)
        except:
            dead.append(ws)
    for ws in dead:
        connections.remove(ws)


async def broadcast_loop():
    """Background loop to broadcast new messages."""
    while True:
        pending = hub.get_pending()
        if pending:
            for msg in pending:
                # Skip user messages - frontend shows them immediately (optimistic UI)
                if msg.sender == "user":
                    continue
                data = json.dumps({"type": "message", "data": msg.to_dict()})
                dead = []
                for ws in connections:
                    try:
                        await ws.send_text(data)
                    except:
                        dead.append(ws)
                for ws in dead:
                    connections.remove(ws)
        await asyncio.sleep(0.1)  # Check every 100ms


async def task_broadcast_loop():
    """Broadcast task updates periodically."""
    last_hash = ""
    while True:
        # Simple change detection
        tasks = task_manager.get_all_tasks()
        current_hash = str([(t.id, t.status.value) for t in tasks])
        if current_hash != last_hash:
            last_hash = current_hash
            data = json.dumps({
                "type": "tasks_update",
                "data": [t.to_dict() for t in tasks]
            })
            dead = []
            for ws in connections:
                try:
                    await ws.send_text(data)
                except:
                    dead.append(ws)
            for ws in dead:
                connections.remove(ws)
        await asyncio.sleep(0.5)


async def agent_status_broadcast_loop():
    """Continuously broadcast agent statuses while any agent is active."""
    while True:
        # Check if any agent is active
        has_active = any(
            info.get("status") in ("thinking", "working")
            for info in agent_statuses.values()
        )

        if has_active and connections:
            # Broadcast current statuses
            data = json.dumps({
                "type": "agent_statuses",
                "data": agent_statuses
            })
            dead = []
            for ws in connections:
                try:
                    await ws.send_text(data)
                except:
                    dead.append(ws)
            for ws in dead:
                connections.remove(ws)
            await asyncio.sleep(0.2)  # Fast updates while active
        else:
            await asyncio.sleep(0.5)  # Slower polling when idle


async def heartbeat_broadcast_loop():
    """Broadcast heartbeat updates periodically."""
    last_hash = ""
    while True:
        heartbeats = heartbeat_manager.get_all()
        current_hash = str([(h.id, h.status.value, h.next_run) for h in heartbeats])
        if current_hash != last_hash:
            last_hash = current_hash
            data = json.dumps({
                "type": "heartbeats_update",
                "data": [h.to_dict() for h in heartbeats]
            })
            dead = []
            for ws in connections:
                try:
                    await ws.send_text(data)
                except:
                    dead.append(ws)
            for ws in dead:
                connections.remove(ws)
        await asyncio.sleep(1)


async def heartbeat_tick_loop():
    """Check and run due heartbeats."""
    while True:
        ran = heartbeat_manager.tick()
        if ran:
            print(f"[Heartbeat] Triggered: {ran}")
        await asyncio.sleep(5)  # Check every 5 seconds


async def task_tick_loop():
    """Process ready tasks - make employees pick them up."""
    while True:
        try:
            did_work = await asyncio.to_thread(studio.tick)
            if did_work:
                await asyncio.sleep(2)  # Brief pause between task processing
            else:
                await asyncio.sleep(3)  # Check for new tasks every 3 seconds
        except Exception as e:
            print(f"[TaskTick] Error: {e}")
            await asyncio.sleep(5)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start broadcast loops on startup."""
    global broadcast_task, main_loop
    main_loop = asyncio.get_running_loop()  # Capture the event loop for thread-safe access
    broadcast_task = asyncio.create_task(broadcast_loop())
    task_broadcast = asyncio.create_task(task_broadcast_loop())
    heartbeat_broadcast = asyncio.create_task(heartbeat_broadcast_loop())
    heartbeat_tick = asyncio.create_task(heartbeat_tick_loop())
    task_tick = asyncio.create_task(task_tick_loop())
    status_broadcast = asyncio.create_task(agent_status_broadcast_loop())

    # Post server startup message to Hub
    from datetime import datetime
    hub.post("System", f"Server started at {datetime.now().strftime('%H:%M:%S')}")

    yield
    broadcast_task.cancel()
    task_broadcast.cancel()
    heartbeat_broadcast.cancel()
    heartbeat_tick.cancel()
    task_tick.cancel()
    status_broadcast.cancel()


app = FastAPI(title="Game Studio", lifespan=lifespan)

# Allow local file access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize studio
studio = Studio()
studio.set_thinking_callback(broadcast_thinking_sync)
studio.set_status_callback(update_agent_status_sync)

logger.info("Studio server initialized")


@app.get("/api/health")
async def health_check():
    """Simple health check for restart polling."""
    return {"status": "ok"}


@app.get("/api/roles")
async def get_roles():
    """Get all agent roles with their info."""
    result = {}
    for name in get_all_agent_names():
        role = load_agent_role(name)
        config = load_agent_config(name)

        # Determine tools for this agent
        if role.get("is_boss"):
            tools = ["create_task", "get_task_status"]
        elif name == "Artist":
            tools = ["get_my_tasks", "pick_task", "complete_task"]
        elif name == "Writer":
            tools = ["get_my_tasks", "pick_task", "complete_task"]
        else:
            tools = ["get_my_tasks", "pick_task", "complete_task"]

        result[name] = {
            "title": config.get("title", role.get("title", "Agent")),
            "color": config.get("color", role.get("color", "#888")),
            "backend": config.get("backend", "claude-cli"),
            "is_boss": role.get("is_boss", False),
            "tools": tools,
        }
    return result


@app.get("/api/agents/stats")
async def get_agent_stats():
    """Get live stats for all agents."""
    from collections import Counter

    agent_names = get_all_agent_names()

    # Count messages per sender
    msg_counts = Counter(m.sender for m in hub.messages)

    # Get last message time per agent
    last_active = {}
    for m in hub.messages:
        last_active[m.sender] = m.timestamp.isoformat()

    # Count tasks per agent
    task_stats = {}
    for name in agent_names:
        agent_tasks = task_manager.get_agent_tasks(name)
        task_stats[name] = {
            "assigned": len(agent_tasks),
            "in_progress": len([t for t in agent_tasks if t.status.value == "in_progress"]),
            "completed": len([t for t in agent_tasks if t.status.value in ("completed", "reviewed")]),
            "tasks": [{"id": t.id, "status": t.status.value, "description": t.description[:50]} for t in agent_tasks]
        }

    # Build result
    result = {}
    for name in agent_names:
        result[name] = {
            "message_count": msg_counts.get(name, 0),
            "last_active": last_active.get(name),
            "tasks": task_stats.get(name, {}),
            "status": "working" if task_stats.get(name, {}).get("in_progress", 0) > 0 else "idle"
        }

    return result


@app.post("/api/agents/{agent_name}/config")
async def update_agent_config(agent_name: str, config: dict):
    """Update an agent's configuration."""
    import json
    from pathlib import Path

    config_file = Path(__file__).parent / "studio" / "agents" / agent_name.lower() / "config.json"

    # Load existing config
    existing = load_agent_config(agent_name)
    existing.update(config)

    # Save
    config_file.parent.mkdir(parents=True, exist_ok=True)
    with open(config_file, "w") as f:
        json.dump(existing, f, indent=2)

    return {"status": "ok", "config": existing}


@app.get("/api/history")
async def get_history():
    """Get message history."""
    return [m.to_dict() for m in hub.get_history()]


@app.get("/api/tasks")
async def get_tasks():
    """Get all tasks."""
    return [t.to_dict() for t in task_manager.get_all_tasks()]


@app.get("/api/tasks/summary")
async def get_task_summary():
    """Get task status counts."""
    return task_manager.get_status_summary()


@app.post("/api/tasks/clear")
async def clear_all_tasks():
    """Clear all tasks."""
    task_manager.clear()
    return {"status": "ok", "message": "All tasks cleared"}


@app.post("/api/tasks/clear-completed")
async def clear_completed_tasks():
    """Clear only completed/reviewed tasks."""
    count = task_manager.clear_completed()
    return {"status": "ok", "cleared": count}


@app.post("/api/tasks/{task_id}/cancel")
async def cancel_task(task_id: str):
    """Cancel a specific task."""
    if task_manager.cancel_task(task_id):
        return {"success": True, "message": f"Task {task_id} cancelled"}
    return {"success": False, "error": "Task not found or cannot be cancelled"}


@app.post("/api/tasks/{task_id}/retry")
async def retry_task(task_id: str):
    """Retry a failed task by resetting it to READY."""
    if task_manager.retry_task(task_id):
        return {"success": True, "message": f"Task {task_id} queued for retry"}
    return {"success": False, "error": "Task not found or not in failed state"}


@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a completed or failed task."""
    if task_manager.delete_task(task_id):
        return {"success": True, "message": f"Task {task_id} deleted"}
    return {"success": False, "error": "Task not found or cannot be deleted"}


@app.get("/api/reports")
async def get_reports():
    """List all saved reports."""
    from pathlib import Path
    reports_dir = Path(__file__).parent / "reports"
    if not reports_dir.exists():
        return []

    reports = []
    for f in sorted(reports_dir.glob("*.*"), key=lambda x: x.stat().st_mtime, reverse=True):
        reports.append({
            "name": f.name,
            "size": f.stat().st_size,
            "modified": f.stat().st_mtime,
        })
    return reports


@app.get("/api/reports/{filename}")
async def get_report(filename: str):
    """Read a specific report."""
    from pathlib import Path
    filepath = Path(__file__).parent / "reports" / filename
    if not filepath.exists():
        return {"error": "File not found"}
    return {"name": filename, "content": filepath.read_text(encoding="utf-8")}


@app.get("/api/heartbeats")
async def get_heartbeats():
    """Get all heartbeats."""
    return [h.to_dict() for h in heartbeat_manager.get_all()]


@app.post("/api/heartbeats")
async def create_heartbeat(data: dict):
    """Create a new heartbeat."""
    hb = heartbeat_manager.create(
        name=data["name"],
        description=data.get("description", ""),
        interval_seconds=data["interval_seconds"],
        tasks=data["tasks"],
    )
    return hb.to_dict()


@app.post("/api/heartbeats/{hb_id}/pause")
async def pause_heartbeat(hb_id: str):
    """Pause a heartbeat."""
    if heartbeat_manager.pause(hb_id):
        return {"status": "paused"}
    return {"error": "not found"}


@app.post("/api/heartbeats/{hb_id}/resume")
async def resume_heartbeat(hb_id: str):
    """Resume a heartbeat."""
    if heartbeat_manager.resume(hb_id):
        return {"status": "resumed"}
    return {"error": "not found"}


@app.post("/api/heartbeats/{hb_id}/trigger")
async def trigger_heartbeat(hb_id: str):
    """Manually trigger a heartbeat."""
    task_ids = heartbeat_manager.run(hb_id)
    if task_ids:
        return {"status": "triggered", "tasks": task_ids}
    return {"error": "not found"}


@app.delete("/api/heartbeats/{hb_id}")
async def delete_heartbeat(hb_id: str):
    """Delete a heartbeat."""
    if heartbeat_manager.delete(hb_id):
        return {"status": "deleted"}
    return {"error": "not found"}


# ============ TOKEN TRACKING ============

@app.get("/api/tokens/session")
async def get_token_session():
    """Get current session token usage stats."""
    return get_session_tokens()


@app.post("/api/tokens/reset")
async def reset_token_session():
    """Reset session token tracking."""
    reset_session_tokens()
    return {"status": "ok", "message": "Session token tracking reset"}


# ============ FILE EXPLORER ============

PROJECT_ROOT = Path(__file__).parent

IGNORED_DIRS = {'.git', '__pycache__', '.venv', 'venv', 'node_modules', '.idea', '.vscode'}
IGNORED_FILES = {'.env', '.gitignore', '*.pyc', '*.pyo'}


def should_ignore(name: str) -> bool:
    """Check if file/dir should be ignored."""
    if name in IGNORED_DIRS:
        return True
    if name.startswith('.'):
        return True
    for pattern in IGNORED_FILES:
        if pattern.startswith('*'):
            if name.endswith(pattern[1:]):
                return True
        elif name == pattern:
            return True
    return False


def scan_directory(path: Path, relative_to: Path) -> list:
    """Recursively scan directory and return file tree."""
    items = []
    try:
        for entry in sorted(path.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower())):
            if should_ignore(entry.name):
                continue

            rel_path = str(entry.relative_to(relative_to)).replace('\\', '/')

            if entry.is_dir():
                children = scan_directory(entry, relative_to)
                items.append({
                    "name": entry.name,
                    "path": rel_path,
                    "type": "folder",
                    "children": children,
                })
            else:
                items.append({
                    "name": entry.name,
                    "path": rel_path,
                    "type": "file",
                    "size": entry.stat().st_size,
                })
    except PermissionError:
        pass
    return items


@app.get("/api/files")
async def get_files():
    """Get file tree of project."""
    tree = scan_directory(PROJECT_ROOT, PROJECT_ROOT)
    return {"root": str(PROJECT_ROOT), "tree": tree}


@app.get("/api/files/read")
async def read_file(path: str):
    """Read contents of a file."""
    try:
        file_path = PROJECT_ROOT / path
        # Security: ensure path is within project
        file_path = file_path.resolve()
        if not str(file_path).startswith(str(PROJECT_ROOT.resolve())):
            return {"error": "Access denied"}

        if not file_path.exists():
            return {"error": "File not found"}

        if not file_path.is_file():
            return {"error": "Not a file"}

        # Check file size
        if file_path.stat().st_size > 1_000_000:  # 1MB limit
            return {"error": "File too large"}

        # Try to read as text
        try:
            content = file_path.read_text(encoding='utf-8')
            return {"path": path, "content": content}
        except UnicodeDecodeError:
            return {"error": "Binary file cannot be displayed"}

    except Exception as e:
        return {"error": str(e)}


@app.post("/api/restart")
async def restart_server():
    """Restart the server by spawning a new process then exiting."""
    import sys
    import subprocess
    import threading

    def delayed_restart():
        import time
        time.sleep(0.5)  # Give time for response to be sent

        # Spawn new server process before exiting
        python_exe = sys.executable
        script_path = str(PROJECT_ROOT / "server.py")

        # Start new process detached from current
        subprocess.Popen(
            [python_exe, script_path],
            cwd=str(PROJECT_ROOT),
            creationflags=subprocess.CREATE_NEW_CONSOLE,  # Windows: new console window
            start_new_session=True
        )

        time.sleep(0.3)  # Give new process time to start
        os._exit(0)  # Exit current process

    threading.Thread(target=delayed_restart, daemon=True).start()
    return {"status": "restarting", "message": "Server restarting..."}


@app.post("/api/files/open-explorer")
async def open_in_explorer(data: dict):
    """Open file or folder in Windows Explorer."""
    try:
        path = data.get("path", "")
        file_path = PROJECT_ROOT / path if path else PROJECT_ROOT
        file_path = file_path.resolve()

        # Security check
        if not str(file_path).startswith(str(PROJECT_ROOT.resolve())):
            return {"error": "Access denied"}

        if file_path.is_file():
            # Open explorer with file selected
            subprocess.Popen(f'explorer /select,"{file_path}"')
        else:
            # Open folder
            subprocess.Popen(f'explorer "{file_path}"')

        return {"status": "opened"}
    except Exception as e:
        return {"error": str(e)}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time chat."""
    await websocket.accept()
    connections.append(websocket)
    print(f"Client connected. Total: {len(connections)}")

    # Send current tasks
    tasks_data = json.dumps({
        "type": "tasks_update",
        "data": [t.to_dict() for t in task_manager.get_all_tasks()]
    })
    await websocket.send_text(tasks_data)

    # Send current heartbeats
    heartbeats_data = json.dumps({
        "type": "heartbeats_update",
        "data": [h.to_dict() for h in heartbeat_manager.get_all()]
    })
    await websocket.send_text(heartbeats_data)

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "user_message":
                content = msg.get("content", "").strip()
                if content:
                    print(f"User: {content}")
                    await asyncio.to_thread(
                        studio.handle_user_message, content
                    )

            elif msg.get("type") == "poke_agent":
                agent_name = msg.get("agent")
                prompt = msg.get("prompt")
                if agent_name:
                    print(f"Poking {agent_name}")
                    await asyncio.to_thread(
                        studio.agent_respond, agent_name, prompt
                    )

            elif msg.get("type") == "tick":
                # Manual tick to process tasks
                await asyncio.to_thread(studio.tick)

            elif msg.get("type") == "create_heartbeat":
                # Create a new heartbeat
                hb = heartbeat_manager.create(
                    name=msg["name"],
                    description=msg.get("description", ""),
                    interval_seconds=msg["interval_seconds"],
                    tasks=msg["tasks"],
                )
                print(f"[Heartbeat] Created: {hb.name}")

            elif msg.get("type") == "pause_heartbeat":
                heartbeat_manager.pause(msg["id"])

            elif msg.get("type") == "resume_heartbeat":
                heartbeat_manager.resume(msg["id"])

            elif msg.get("type") == "trigger_heartbeat":
                task_ids = heartbeat_manager.run(msg["id"])
                print(f"[Heartbeat] Manually triggered: {msg['id']} -> {task_ids}")
                await asyncio.to_thread(studio.tick)

            elif msg.get("type") == "delete_heartbeat":
                heartbeat_manager.delete(msg["id"])

    except WebSocketDisconnect:
        connections.remove(websocket)
        print(f"Client disconnected. Total: {len(connections)}")


if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("  GAME STUDIO SERVER")
    print("=" * 50)
    print("Open studio.html in your browser")
    print("Server: http://127.0.0.1:8000")
    print("=" * 50)
    uvicorn.run(app, host="127.0.0.1", port=8000)
