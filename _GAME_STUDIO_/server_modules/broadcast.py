"""
Broadcast module - Background loops and client notification helpers.

Handles:
- WebSocket broadcast helpers
- Agent status tracking
- Background broadcast loops for tasks, schedules, and agent stats
"""

import asyncio
import json
from datetime import datetime
from collections import Counter
from typing import Optional

from fastapi import WebSocket


# Track WebSocket connections
connections: list[WebSocket] = []

# Current thinking state
current_thinking_agent: str | None = None

# Agent status tracking: {"AgentName": {"status": "idle/working/thinking", "activity": "description"}}
agent_statuses: dict[str, dict] = {}

# Event loop reference (set at startup for thread-safe access)
main_loop: asyncio.AbstractEventLoop | None = None

# Background task references (set at startup, cancelled on shutdown)
_broadcast_tasks: list[asyncio.Task] = []


async def broadcast_to_clients(data: str):
    """Send data to all connected WebSocket clients, removing dead connections."""
    dead = []
    for ws in connections:
        try:
            await ws.send_text(data)
        except Exception:
            dead.append(ws)
    for ws in dead:
        connections.remove(ws)


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
    await broadcast_to_clients(data)


async def _do_broadcast_thinking(agent: str | None):
    """Actually broadcast thinking state to all connected clients."""
    data = json.dumps({
        "type": "thinking",
        "active": agent is not None,
        "agent": agent
    })
    await broadcast_to_clients(data)


# ============ BROADCAST LOOPS ============

async def _message_broadcast_loop():
    """Background loop to broadcast new hub messages."""
    from studio.core.hub import hub

    while True:
        pending = hub.get_pending()
        if pending:
            for msg in pending:
                # Skip user messages - frontend shows them immediately (optimistic UI)
                if msg.sender == "user":
                    continue
                data = json.dumps({"type": "message", "data": msg.to_dict()})
                await broadcast_to_clients(data)
        await asyncio.sleep(0.1)  # Check every 100ms


async def _task_broadcast_loop():
    """Broadcast task updates periodically."""
    from studio.core.tasks import task_manager

    last_hash = ""
    while True:
        tasks = task_manager.get_all_tasks()
        current_hash = str([(t.id, t.status.value) for t in tasks])
        if current_hash != last_hash:
            last_hash = current_hash
            data = json.dumps({
                "type": "tasks_update",
                "data": [t.to_dict() for t in tasks]
            })
            await broadcast_to_clients(data)
        await asyncio.sleep(0.5)


async def _agent_status_broadcast_loop():
    """Continuously broadcast agent statuses while any agent is active."""
    while True:
        has_active = any(
            info.get("status") in ("thinking", "working")
            for info in agent_statuses.values()
        )

        if has_active and connections:
            data = json.dumps({
                "type": "agent_statuses",
                "data": agent_statuses
            })
            await broadcast_to_clients(data)
            await asyncio.sleep(0.2)  # Fast updates while active
        else:
            await asyncio.sleep(0.5)  # Slower polling when idle


async def _schedule_broadcast_loop():
    """Broadcast schedule updates periodically."""
    from studio.core.schedules import schedule_manager

    last_hash = ""
    while True:
        schedules = schedule_manager.get_all()
        current_hash = str([(s.id, s.status.value, s.next_run) for s in schedules])
        if current_hash != last_hash:
            last_hash = current_hash
            data = json.dumps({
                "type": "schedules_update",
                "data": [s.to_dict() for s in schedules]
            })
            await broadcast_to_clients(data)
        await asyncio.sleep(1)


async def _schedule_tick_loop():
    """Check and run due schedules."""
    from studio.core.schedules import schedule_manager

    while True:
        ran = schedule_manager.tick()
        if ran:
            print(f"[Schedule] Triggered: {ran}")
        await asyncio.sleep(5)  # Check every 5 seconds


async def _task_tick_loop(studio):
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


def _compute_agent_stats(include_task_details: bool = False) -> dict:
    """Compute stats for all agents. Used by broadcast loop and REST endpoint."""
    from studio.core.hub import hub
    from studio.core.tasks import task_manager
    from studio.core.studio_metrics import get_session_tokens
    from studio.studio import get_all_agent_names

    agent_names = get_all_agent_names()
    msg_counts = Counter(m.sender for m in hub.messages)

    # Get last message time per agent
    last_active = {}
    for m in hub.messages:
        last_active[m.sender] = m.timestamp.isoformat()

    # Count tasks per agent (using enum comparison)
    from studio.core.tasks import TaskStatus
    task_stats = {}
    for name in agent_names:
        agent_tasks = task_manager.get_agent_tasks(name)
        stats_entry = {
            "assigned": len(agent_tasks),
            "in_progress": len([t for t in agent_tasks if t.status == TaskStatus.IN_PROGRESS]),
            "completed": len([t for t in agent_tasks if t.status in (TaskStatus.COMPLETED, TaskStatus.APPROVED)]),
        }
        if include_task_details:
            stats_entry["tasks"] = [
                {"id": t.id, "status": t.status.value, "description": t.description[:50]}
                for t in agent_tasks
            ]
        task_stats[name] = stats_entry

    # Get token usage per agent
    session_tokens = get_session_tokens()
    tokens_by_agent = session_tokens.get("by_agent", {})

    # Calculate uptime
    try:
        session_start = datetime.fromisoformat(session_tokens.get("session_start", datetime.now().isoformat()))
        uptime_seconds = int((datetime.now() - session_start).total_seconds())
    except Exception:
        uptime_seconds = 0

    # Build result
    result = {}
    for name in agent_names:
        agent_tokens = tokens_by_agent.get(name, {})
        total_tokens = agent_tokens.get("input", 0) + agent_tokens.get("output", 0)
        result[name] = {
            "message_count": msg_counts.get(name, 0),
            "last_active": last_active.get(name),
            "tasks": task_stats.get(name, {}),
            "status": "working" if task_stats.get(name, {}).get("in_progress", 0) > 0 else "idle",
            "tokens": total_tokens,
            "uptime_seconds": uptime_seconds
        }

    return result


async def _agent_stats_broadcast_loop():
    """Broadcast agent stats periodically for real-time card updates."""
    last_hash = ""
    while True:
        if connections:
            stats = _compute_agent_stats(include_task_details=False)

            current_hash = str(stats)
            if current_hash != last_hash:
                last_hash = current_hash
                data = json.dumps({
                    "type": "agent_stats_update",
                    "data": stats
                })
                await broadcast_to_clients(data)
        await asyncio.sleep(2)  # Update every 2 seconds


async def _suggestions_broadcast_loop():
    """Broadcast suggestion updates periodically."""
    from studio.core.suggestions import suggestion_manager

    last_hash = ""
    while True:
        suggestions = suggestion_manager.get_all()
        current_hash = str([(s.id, s.status.value) for s in suggestions])
        if current_hash != last_hash:
            last_hash = current_hash
            data = json.dumps({
                "type": "suggestions_update",
                "data": [s.to_dict() for s in suggestions]
            })
            await broadcast_to_clients(data)
        await asyncio.sleep(1)


async def _projects_broadcast_loop():
    """Broadcast project updates periodically."""
    from studio.core.projects import project_manager

    last_hash = ""
    while True:
        projects = project_manager.get_all(include_archived=True)
        current_hash = str([(p.id, p.status.value, p.updated_at) for p in projects])
        if current_hash != last_hash:
            last_hash = current_hash
            data = json.dumps({
                "type": "projects_update",
                "data": {
                    "projects": [p.to_dict() for p in projects],
                    "active_project_id": project_manager.active_project_id,
                }
            })
            await broadcast_to_clients(data)
        await asyncio.sleep(1)


async def _memory_compression_loop():
    """Broadcast memory stats periodically.

    Note: Auto-compression happens in memory_manager.append() when
    tier threshold is exceeded - no separate loop needed.
    """
    from studio.core.memory import memory_manager

    while True:
        try:
            if connections:
                stats = memory_manager.get_stats()
                data = json.dumps({
                    "type": "memory_stats_update",
                    "data": stats
                })
                await broadcast_to_clients(data)
        except Exception as e:
            print(f"[Memory] Stats broadcast error: {e}")

        await asyncio.sleep(60)  # Update every minute


def start_broadcast_loops(studio) -> list[asyncio.Task]:
    """Start all background broadcast loops. Returns list of tasks."""
    global main_loop, _broadcast_tasks
    main_loop = asyncio.get_running_loop()

    _broadcast_tasks = [
        asyncio.create_task(_message_broadcast_loop()),
        asyncio.create_task(_task_broadcast_loop()),
        asyncio.create_task(_schedule_broadcast_loop()),
        asyncio.create_task(_schedule_tick_loop()),
        asyncio.create_task(_task_tick_loop(studio)),
        asyncio.create_task(_agent_status_broadcast_loop()),
        asyncio.create_task(_agent_stats_broadcast_loop()),
        asyncio.create_task(_suggestions_broadcast_loop()),
        asyncio.create_task(_projects_broadcast_loop()),
        asyncio.create_task(_memory_compression_loop()),
    ]
    return _broadcast_tasks


def stop_broadcast_loops():
    """Cancel all background broadcast loops."""
    for task in _broadcast_tasks:
        task.cancel()
