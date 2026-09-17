"""
Broadcast module - Background loops and client notification helpers.

Handles:
- WebSocket broadcast helpers
- Agent status tracking
- Background broadcast loops for tasks, schedules, and agent stats
"""

import asyncio
import json
import threading
from datetime import datetime
from collections import Counter
from typing import Optional

from fastapi import WebSocket

from studio.core.logging_config import get_logger

logger = get_logger("Broadcast")


# Track WebSocket connections
connections: list[WebSocket] = []

# Current thinking state
current_thinking_agent: str | None = None

# Agent status tracking: {"AgentName": {"status": "idle/working/thinking", "activity": "description"}}
agent_statuses: dict[str, dict] = {}
_agent_statuses_lock = threading.Lock()

# Error tracking: {"AgentName": [{"time": "HH:MM", "error": "msg"}, ...]}
agent_errors: dict[str, list] = {}
_agent_errors_lock = threading.Lock()
MAX_ERRORS_PER_AGENT = 10  # Keep last N errors

# Terminal output buffers: {"AgentName": ["line1", "line2", ...]}
terminal_buffers: dict[str, list] = {}
_terminal_lock = threading.Lock()
MAX_TERMINAL_LINES = 500

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


async def broadcast_schedule_update():
    """Immediately broadcast current schedule state to all clients."""
    from studio.core.schedules import schedule_manager
    
    schedules = schedule_manager.get_all()
    data = json.dumps({
        "type": "schedules_update",
        "data": [s.to_dict() for s in schedules]
    })
    await broadcast_to_clients(data)


def update_agent_status_sync(agent: str, status: str, activity: str = ""):
    """Update an agent's status (called from sync code)."""
    with _agent_statuses_lock:
        agent_statuses[agent] = {"status": status, "activity": activity}
    if main_loop is not None:
        asyncio.run_coroutine_threadsafe(_broadcast_agent_statuses(), main_loop)


def broadcast_thinking_sync(agent: str | None):
    """Queue a thinking broadcast (called from sync code)."""
    global current_thinking_agent
    current_thinking_agent = agent
    # Update agent status to thinking (agents call update_agent_status_sync(idle) on completion)
    if agent:
        update_agent_status_sync(agent, "thinking", "Processing...")
    # Schedule the actual broadcast in the event loop
    if main_loop is not None:
        asyncio.run_coroutine_threadsafe(_do_broadcast_thinking(agent), main_loop)


def broadcast_live_tokens_sync(agent: str, input_tokens: int, output_tokens: int):
    """Broadcast live token update during streaming (called from sync code)."""
    if main_loop is not None:
        asyncio.run_coroutine_threadsafe(
            _do_broadcast_live_tokens(agent, input_tokens, output_tokens),
            main_loop
        )


def broadcast_error_sync(agent: str, error: str):
    """Broadcast an agent error to the UI (called from sync code)."""
    timestamp = datetime.now().strftime("%H:%M")

    # Store error
    with _agent_errors_lock:
        if agent not in agent_errors:
            agent_errors[agent] = []
        agent_errors[agent].append({"time": timestamp, "error": error[:200]})
        # Keep only last N
        agent_errors[agent] = agent_errors[agent][-MAX_ERRORS_PER_AGENT:]

    # Log it prominently
    logger.warning("[%s] ERROR: %s", agent, error[:100])

    # Broadcast to UI
    if main_loop is not None:
        asyncio.run_coroutine_threadsafe(_do_broadcast_error(agent, timestamp, error), main_loop)


async def _do_broadcast_error(agent: str, timestamp: str, error: str):
    """Send error notification to all clients."""
    data = json.dumps({
        "type": "agent_error",
        "agent": agent,
        "time": timestamp,
        "error": error[:200]
    })
    await broadcast_to_clients(data)


def get_agent_errors(agent: str = None) -> dict:
    """Get recent errors for an agent or all agents."""
    with _agent_errors_lock:
        if agent:
            return {agent: agent_errors.get(agent, [])}
        return dict(agent_errors)


# ============ TERMINAL OUTPUT ============

# Terminal log directory
from pathlib import Path
TERMINAL_LOG_DIR = Path(__file__).parent.parent / "data" / "logs" / "terminals"
TERMINAL_LOG_DIR.mkdir(parents=True, exist_ok=True)

# Buffer for history accumulation (collect lines before sending to draft)
_history_buffer: dict[str, list[str]] = {}
_history_buffer_lock = threading.Lock()
HISTORY_FLUSH_LINES = 20  # Flush to history after N lines


def _clean_ansi(text: str) -> str:
    """Strip ANSI escape codes from text."""
    import re
    return re.sub(r'\x1b\[[0-9;]*m', '', text)


def _archive_terminal_line(agent: str, line: str):
    """Archive terminal line to daily log file."""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        log_file = TERMINAL_LOG_DIR / f"{agent}_{today}.log"
        timestamp = datetime.now().strftime("%H:%M:%S")
        with open(log_file, "a", encoding="utf-8") as f:
            clean_line = _clean_ansi(line)
            f.write(f"[{timestamp}] {clean_line}")
            if not clean_line.endswith("\n"):
                f.write("\n")
    except Exception as e:
        logger.debug("[TERM] Archive error: %s", e)


def _accumulate_to_history(agent: str, line: str):
    """Accumulate terminal output to history draft.

    Buffers lines and flushes periodically to avoid too many small writes.
    This replaces hub messages as the source for history narrative.
    """
    # Skip vanilla agents (no meaningful output for history)
    if agent in ("Compression", "Text", "Image", "Audio", "Video"):
        return

    clean_line = _clean_ansi(line).strip()
    if not clean_line or len(clean_line) < 5:
        return  # Skip empty/tiny lines

    with _history_buffer_lock:
        if agent not in _history_buffer:
            _history_buffer[agent] = []
        _history_buffer[agent].append(clean_line)

        # Flush when buffer is full
        if len(_history_buffer[agent]) >= HISTORY_FLUSH_LINES:
            _flush_history_buffer(agent)


def _flush_history_buffer(agent: str):
    """Flush accumulated terminal lines to history draft."""
    with _history_buffer_lock:
        if agent not in _history_buffer or not _history_buffer[agent]:
            return

        lines = _history_buffer[agent]
        _history_buffer[agent] = []

    try:
        from studio.core.history import history_manager

        timestamp = datetime.now().strftime("%H:%M")
        # Combine lines into a single entry, truncate if too long
        content = "\n".join(lines)
        if len(content) > 1000:
            content = content[:1000] + "..."

        entry = f"[{timestamp}] {agent} (terminal):\n{content}"
        history_manager.accumulate(entry)
    except Exception as e:
        logger.debug("[TERM] History accumulation error: %s", e)


def flush_all_history_buffers():
    """Flush all agent history buffers (call on shutdown or periodically)."""
    with _history_buffer_lock:
        agents = list(_history_buffer.keys())
    for agent in agents:
        _flush_history_buffer(agent)


def broadcast_terminal_line_sync(agent: str, line: str):
    """Stream terminal output line to frontend, archive to disk, and accumulate to history."""
    # Archive to disk
    _archive_terminal_line(agent, line)

    # Accumulate to history draft (replaces hub messages as history source)
    _accumulate_to_history(agent, line)

    with _terminal_lock:
        if agent not in terminal_buffers:
            terminal_buffers[agent] = []
        terminal_buffers[agent].append(line)
        # Keep last N lines
        if len(terminal_buffers[agent]) > MAX_TERMINAL_LINES:
            terminal_buffers[agent] = terminal_buffers[agent][-MAX_TERMINAL_LINES:]

    if main_loop is not None:
        asyncio.run_coroutine_threadsafe(
            _do_broadcast_terminal(agent, line), main_loop
        )
    else:
        logger.warning("[TERM] main_loop is None, cannot broadcast")


async def _do_broadcast_terminal(agent: str, line: str):
    """Send terminal line to all clients."""
    data = json.dumps({
        "type": "terminal_output",
        "agent": agent,
        "line": line
    })
    await broadcast_to_clients(data)


def get_terminal_buffer(agent: str) -> list:
    """Get terminal output history for an agent."""
    with _terminal_lock:
        return list(terminal_buffers.get(agent, []))


def clear_terminal_buffer(agent: str):
    """Clear terminal buffer for an agent."""
    with _terminal_lock:
        if agent in terminal_buffers:
            terminal_buffers[agent] = []


def broadcast_tasks_sync():
    """Trigger immediate task broadcast (called from sync code).

    Use this after creating/modifying tasks to ensure UI updates immediately
    rather than waiting for the 0.5s polling loop.
    """
    if main_loop is not None:
        asyncio.run_coroutine_threadsafe(_do_broadcast_tasks(), main_loop)


def broadcast_schedules_sync():
    """Trigger immediate schedule broadcast (called from sync code).

    Use this after creating/modifying schedules to ensure UI updates immediately.
    """
    if main_loop is not None:
        asyncio.run_coroutine_threadsafe(broadcast_schedule_update(), main_loop)


async def _do_broadcast_tasks():
    """Broadcast current task list to all clients."""
    from studio.core.tasks import task_manager
    tasks = task_manager.get_all_tasks()
    data = json.dumps({
        "type": "tasks_update",
        "data": [t.to_dict() for t in tasks]
    })
    await broadcast_to_clients(data)


async def _do_broadcast_live_tokens(agent: str, input_tokens: int, output_tokens: int):
    """Broadcast live token count to clients."""
    data = json.dumps({
        "type": "live_tokens",
        "agent": agent,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
    })
    await broadcast_to_clients(data)


async def _broadcast_agent_statuses():
    """Broadcast all agent statuses to connected clients."""
    with _agent_statuses_lock:
        statuses_copy = dict(agent_statuses)
    data = json.dumps({
        "type": "agent_statuses",
        "data": statuses_copy
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
    """Broadcast task updates periodically.

    Reloads from disk to sync with changes from MCP server (separate process).
    """
    from studio.core.tasks import task_manager

    last_hash = ""
    while True:
        # Reload from disk to catch changes from MCP server
        task_manager.reload_from_disk()

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
    """Continuously broadcast agent statuses on change."""
    last_hash = ""
    while True:
        with _agent_statuses_lock:
            statuses_copy = dict(agent_statuses)

        current_hash = str(statuses_copy)
        if current_hash != last_hash and connections:
            last_hash = current_hash
            data = json.dumps({
                "type": "agent_statuses",
                "data": statuses_copy
            })
            await broadcast_to_clients(data)
        await asyncio.sleep(0.3)


async def _schedule_broadcast_loop():
    """Broadcast schedule updates periodically.

    Reloads from disk to sync with changes from MCP server (separate process).
    """
    from studio.core.schedules import schedule_manager

    last_hash = ""
    while True:
        # Reload from disk to catch changes from MCP server
        schedule_manager.reload_from_disk()

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
            logger.info("Schedule triggered: %s", ran)
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
            logger.error("TaskTick error: %s", e)
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
        input_tokens = agent_tokens.get("input", 0)
        output_tokens = agent_tokens.get("output", 0)
        cache_read = agent_tokens.get("cache_read", 0)
        cache_creation = agent_tokens.get("cache_creation", 0)
        total_tokens = input_tokens + output_tokens
        result[name] = {
            "message_count": msg_counts.get(name, 0),
            "last_active": last_active.get(name),
            "tasks": task_stats.get(name, {}),
            "status": "working" if task_stats.get(name, {}).get("in_progress", 0) > 0 else "idle",
            "tokens": total_tokens,
            "tokens_input": input_tokens,
            "tokens_output": output_tokens,
            "tokens_cache_read": cache_read,
            "tokens_cache_creation": cache_creation,
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
            logger.error("Memory stats broadcast error: %s", e)

        await asyncio.sleep(60)  # Update every minute


async def _history_flush_loop():
    """Periodically flush terminal history buffers to draft."""
    while True:
        await asyncio.sleep(30)  # Flush every 30 seconds
        try:
            flush_all_history_buffers()
        except Exception as e:
            logger.debug("History flush error: %s", e)


async def _session_stats_broadcast_loop():
    """Broadcast CLI session stats (BOSS + Fleet) periodically."""
    last_hash = ""
    while True:
        try:
            if connections:
                from backends.backends.boss_cli import BossCLI, SESSION_TOKEN_THRESHOLD as BOSS_THRESHOLD
                from backends.backends.fleet_cli import FleetCLI, SESSION_TOKEN_THRESHOLD as FLEET_THRESHOLD

                boss_stats = BossCLI.get_session_stats()
                fleet_stats = FleetCLI.get_session_stats()

                stats = {
                    "boss": {
                        "cumulative_tokens": boss_stats["cumulative_tokens"],
                        "threshold": BOSS_THRESHOLD,
                        "usage_pct": round((boss_stats["cumulative_tokens"] / BOSS_THRESHOLD) * 100, 1),
                    },
                    "fleet": {
                        "cumulative_tokens": fleet_stats["cumulative_tokens"],
                        "threshold": FLEET_THRESHOLD,
                        "usage_pct": round((fleet_stats["cumulative_tokens"] / FLEET_THRESHOLD) * 100, 1),
                    }
                }

                current_hash = str(stats)
                if current_hash != last_hash:
                    last_hash = current_hash
                    data = json.dumps({
                        "type": "session_stats_update",
                        "data": stats
                    })
                    await broadcast_to_clients(data)
        except Exception as e:
            logger.debug("Session stats broadcast error: %s", e)

        await asyncio.sleep(2)  # Update every 2 seconds


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
        asyncio.create_task(_session_stats_broadcast_loop()),
        asyncio.create_task(_history_flush_loop()),
    ]
    return _broadcast_tasks


def stop_broadcast_loops():
    """Cancel all background broadcast loops and flush history buffers."""
    # Flush any pending terminal output to history
    flush_all_history_buffers()

    for task in _broadcast_tasks:
        task.cancel()
