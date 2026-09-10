"""
Studio Metrics Tracker

Tracks studio performance over time:
- Tasks created/completed/rejected by agent, by day
- QA pass rate, average revisions per task
- Token usage per agent, per task, per session
- Aggregation helpers for analytics

Logs to /data/metrics/studio_metrics.json
"""

import json
import threading
from pathlib import Path
from datetime import datetime, date
from typing import Optional

from .logging_config import get_logger

logger = get_logger("Metrics")

# Thread lock for session token access
_session_lock = threading.Lock()

# Data directory
DATA_DIR = Path(__file__).parent.parent.parent / "data"
METRICS_DIR = DATA_DIR / "metrics"
METRICS_FILE = METRICS_DIR / "studio_metrics.json"
TOKENS_FILE = METRICS_DIR / "token_usage.json"


# ============ SESSION TOKEN TRACKING ============

# In-memory session token tracker (resets on server restart)
_session_tokens = {
    "session_start": datetime.now().isoformat(),
    "total_input_tokens": 0,
    "total_output_tokens": 0,
    "by_agent": {},  # {agent_name: {input: int, output: int, calls: int}}
    "by_task": {},   # {task_id: {input: int, output: int}}
    "calls": [],     # Recent calls log (last 100)
}


def track_tokens(agent: str, input_tokens: int, output_tokens: int, task_id: str = None):
    """
    Track token usage for any LLM call.

    Args:
        agent: Name of the agent making the call
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens
        task_id: Optional task ID if this is task-related
    """
    global _session_tokens

    # Skip if no tokens to track
    if not input_tokens and not output_tokens:
        return

    with _session_lock:
        # Update session totals
        _session_tokens["total_input_tokens"] += input_tokens
        _session_tokens["total_output_tokens"] += output_tokens

        # Update per-agent stats
        if agent not in _session_tokens["by_agent"]:
            _session_tokens["by_agent"][agent] = {"input": 0, "output": 0, "calls": 0}
        _session_tokens["by_agent"][agent]["input"] += input_tokens
        _session_tokens["by_agent"][agent]["output"] += output_tokens
        _session_tokens["by_agent"][agent]["calls"] += 1

        # Update per-task stats if applicable
        if task_id:
            if task_id not in _session_tokens["by_task"]:
                _session_tokens["by_task"][task_id] = {"input": 0, "output": 0}
            _session_tokens["by_task"][task_id]["input"] += input_tokens
            _session_tokens["by_task"][task_id]["output"] += output_tokens

        # Log the call (keep last 100)
        _session_tokens["calls"].append({
            "timestamp": datetime.now().isoformat(),
            "agent": agent,
            "task_id": task_id,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        })
        if len(_session_tokens["calls"]) > 100:
            _session_tokens["calls"] = _session_tokens["calls"][-100:]

        # Persist to file (inside lock to prevent concurrent writes)
        _save_token_usage_unlocked()


def _save_token_usage_unlocked():
    """Persist token usage to file. Must be called while holding _session_lock."""
    try:
        METRICS_DIR.mkdir(parents=True, exist_ok=True)
        with open(TOKENS_FILE, "w", encoding="utf-8") as f:
            json.dump(_session_tokens, f, indent=2)
    except Exception as e:
        logger.error("Failed to save token usage: %s", e)


def get_session_tokens() -> dict:
    """Get current session token usage stats."""
    with _session_lock:
        return {
            "session_start": _session_tokens["session_start"],
            "total_input_tokens": _session_tokens["total_input_tokens"],
            "total_output_tokens": _session_tokens["total_output_tokens"],
            "total_tokens": _session_tokens["total_input_tokens"] + _session_tokens["total_output_tokens"],
            "by_agent": dict(_session_tokens["by_agent"]),
            "by_task": dict(_session_tokens["by_task"]),
            "recent_calls": list(_session_tokens["calls"][-20:]),
        }


def reset_session_tokens():
    """Reset session token tracking (called on server restart)."""
    global _session_tokens
    with _session_lock:
        _session_tokens = {
            "session_start": datetime.now().isoformat(),
            "total_input_tokens": 0,
            "total_output_tokens": 0,
            "by_agent": {},
            "by_task": {},
            "calls": [],
        }
        # Persist reset to disk
        _save_token_usage_unlocked()


def _save_token_usage():
    """Persist token usage to file (thread-safe wrapper)."""
    with _session_lock:
        _save_token_usage_unlocked()


def _ensure_metrics_dir():
    """Ensure the metrics directory exists."""
    METRICS_DIR.mkdir(parents=True, exist_ok=True)


def _load_metrics() -> dict:
    """Load existing metrics data or return empty structure."""
    _ensure_metrics_dir()
    defaults = {
        "events": [],
        "by_day": {},
        "by_agent": {},
        "qa_stats": {
            "total_reviews": 0,
            "approvals": 0,
            "rejections": 0,
            "revisions_per_task": {}
        }
    }
    if METRICS_FILE.exists():
        try:
            with open(METRICS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            # Merge with defaults to ensure all required keys exist
            for key, value in defaults.items():
                if key not in data:
                    data[key] = value
            return data
        except (json.JSONDecodeError, IOError):
            pass
    return defaults


def _save_metrics(data: dict):
    """Save metrics data to file."""
    _ensure_metrics_dir()
    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def _get_today() -> str:
    """Get today's date as string."""
    return date.today().isoformat()


def _ensure_day_entry(data: dict, day: str):
    """Ensure a day entry exists in by_day."""
    if day not in data["by_day"]:
        data["by_day"][day] = {
            "tasks_created": 0,
            "tasks_completed": 0,
            "tasks_rejected": 0,
            "tasks_failed": 0,
            "by_agent": {}
        }


def _ensure_agent_entry(data: dict, agent: str):
    """Ensure an agent entry exists in by_agent."""
    if agent not in data["by_agent"]:
        data["by_agent"][agent] = {
            "tasks_assigned": 0,
            "tasks_completed": 0,
            "tasks_rejected": 0,
            "tasks_failed": 0,
            "total_revisions": 0,
            "qa_approvals": 0,
            "qa_rejections": 0
        }


def _ensure_day_agent(data: dict, day: str, agent: str):
    """Ensure agent entry in day stats."""
    _ensure_day_entry(data, day)
    if agent not in data["by_day"][day]["by_agent"]:
        data["by_day"][day]["by_agent"][agent] = {
            "created": 0,
            "completed": 0,
            "rejected": 0,
            "failed": 0
        }


# === Event Tracking Functions ===

def track_task_created(task_id: str, assignee: Optional[str] = None):
    """Track when a task is created."""
    data = _load_metrics()
    day = _get_today()

    event = {
        "type": "task_created",
        "task_id": task_id,
        "assignee": assignee,
        "timestamp": datetime.now().isoformat()
    }
    data["events"].append(event)

    # Update day stats
    _ensure_day_entry(data, day)
    data["by_day"][day]["tasks_created"] += 1

    # Update agent stats if assigned
    if assignee:
        _ensure_agent_entry(data, assignee)
        data["by_agent"][assignee]["tasks_assigned"] += 1
        _ensure_day_agent(data, day, assignee)
        data["by_day"][day]["by_agent"][assignee]["created"] += 1

    _save_metrics(data)


def track_task_completed(task_id: str, assignee: str):
    """Track when a task is completed (submitted for review)."""
    data = _load_metrics()
    day = _get_today()

    event = {
        "type": "task_completed",
        "task_id": task_id,
        "assignee": assignee,
        "timestamp": datetime.now().isoformat()
    }
    data["events"].append(event)

    # Update day stats
    _ensure_day_entry(data, day)
    data["by_day"][day]["tasks_completed"] += 1

    # Update agent stats
    _ensure_agent_entry(data, assignee)
    data["by_agent"][assignee]["tasks_completed"] += 1
    _ensure_day_agent(data, day, assignee)
    data["by_day"][day]["by_agent"][assignee]["completed"] += 1

    _save_metrics(data)


def track_task_rejected(task_id: str, assignee: str):
    """Track when a task is rejected by QA and sent back for revision."""
    data = _load_metrics()
    day = _get_today()

    event = {
        "type": "task_rejected",
        "task_id": task_id,
        "assignee": assignee,
        "timestamp": datetime.now().isoformat()
    }
    data["events"].append(event)

    # Update day stats
    _ensure_day_entry(data, day)
    data["by_day"][day]["tasks_rejected"] += 1

    # Update agent stats
    _ensure_agent_entry(data, assignee)
    data["by_agent"][assignee]["tasks_rejected"] += 1
    data["by_agent"][assignee]["total_revisions"] += 1
    _ensure_day_agent(data, day, assignee)
    data["by_day"][day]["by_agent"][assignee]["rejected"] += 1

    # Track revisions per task
    if task_id not in data["qa_stats"]["revisions_per_task"]:
        data["qa_stats"]["revisions_per_task"][task_id] = 0
    data["qa_stats"]["revisions_per_task"][task_id] += 1

    _save_metrics(data)


def track_task_failed(task_id: str, assignee: Optional[str] = None, reason: str = ""):
    """Track when a task fails (error, blocked, etc.)."""
    data = _load_metrics()
    day = _get_today()

    event = {
        "type": "task_failed",
        "task_id": task_id,
        "assignee": assignee,
        "reason": reason,
        "timestamp": datetime.now().isoformat()
    }
    data["events"].append(event)

    # Update day stats
    _ensure_day_entry(data, day)
    data["by_day"][day]["tasks_failed"] += 1

    # Update agent stats if assigned
    if assignee:
        _ensure_agent_entry(data, assignee)
        data["by_agent"][assignee]["tasks_failed"] += 1
        _ensure_day_agent(data, day, assignee)
        data["by_day"][day]["by_agent"][assignee]["failed"] += 1

    _save_metrics(data)


def track_qa_review(task_id: str, assignee: str, approved: bool):
    """Track QA review outcome."""
    data = _load_metrics()

    event = {
        "type": "qa_review",
        "task_id": task_id,
        "assignee": assignee,
        "approved": approved,
        "timestamp": datetime.now().isoformat()
    }
    data["events"].append(event)

    # Update QA stats
    data["qa_stats"]["total_reviews"] += 1
    if approved:
        data["qa_stats"]["approvals"] += 1
    else:
        data["qa_stats"]["rejections"] += 1

    # Update agent QA stats
    _ensure_agent_entry(data, assignee)
    if approved:
        data["by_agent"][assignee]["qa_approvals"] += 1
    else:
        data["by_agent"][assignee]["qa_rejections"] += 1

    _save_metrics(data)


# === Aggregation Functions ===

def get_metrics() -> dict:
    """
    Get comprehensive studio metrics.

    Returns dict with:
    - summary: Overall counts
    - by_day: Daily breakdown (last 30 days)
    - by_agent: Per-agent statistics
    - qa_stats: QA pass rate and revision metrics
    """
    data = _load_metrics()

    # Calculate summary
    total_created = sum(d["tasks_created"] for d in data["by_day"].values())
    total_completed = sum(d["tasks_completed"] for d in data["by_day"].values())
    total_rejected = sum(d["tasks_rejected"] for d in data["by_day"].values())
    total_failed = sum(d["tasks_failed"] for d in data["by_day"].values())

    # Calculate QA pass rate
    total_reviews = data["qa_stats"]["total_reviews"]
    approvals = data["qa_stats"]["approvals"]
    qa_pass_rate = round(approvals / total_reviews * 100, 1) if total_reviews > 0 else 0

    # Calculate average revisions per task
    revisions = data["qa_stats"]["revisions_per_task"]
    if revisions:
        avg_revisions = round(sum(revisions.values()) / len(revisions), 2)
    else:
        avg_revisions = 0

    # Get last 30 days of data (sorted)
    sorted_days = sorted(data["by_day"].keys(), reverse=True)[:30]
    recent_by_day = {day: data["by_day"][day] for day in sorted_days}

    return {
        "summary": {
            "total_tasks_created": total_created,
            "total_tasks_completed": total_completed,
            "total_tasks_rejected": total_rejected,
            "total_tasks_failed": total_failed,
            "completion_rate": round(total_completed / total_created * 100, 1) if total_created > 0 else 0
        },
        "qa_stats": {
            "total_reviews": total_reviews,
            "approvals": approvals,
            "rejections": data["qa_stats"]["rejections"],
            "pass_rate": qa_pass_rate,
            "average_revisions_per_task": avg_revisions
        },
        "by_day": recent_by_day,
        "by_agent": data["by_agent"]
    }


def get_agent_metrics(agent_name: str) -> dict:
    """Get metrics for a specific agent."""
    data = _load_metrics()

    if agent_name not in data["by_agent"]:
        return {
            "agent": agent_name,
            "tasks_assigned": 0,
            "tasks_completed": 0,
            "tasks_rejected": 0,
            "tasks_failed": 0,
            "completion_rate": 0,
            "qa_pass_rate": 0,
            "average_revisions": 0
        }

    stats = data["by_agent"][agent_name]
    total_qa = stats["qa_approvals"] + stats["qa_rejections"]

    return {
        "agent": agent_name,
        "tasks_assigned": stats["tasks_assigned"],
        "tasks_completed": stats["tasks_completed"],
        "tasks_rejected": stats["tasks_rejected"],
        "tasks_failed": stats["tasks_failed"],
        "total_revisions": stats["total_revisions"],
        "completion_rate": round(stats["tasks_completed"] / stats["tasks_assigned"] * 100, 1) if stats["tasks_assigned"] > 0 else 0,
        "qa_pass_rate": round(stats["qa_approvals"] / total_qa * 100, 1) if total_qa > 0 else 0,
        "average_revisions": round(stats["total_revisions"] / stats["tasks_completed"], 2) if stats["tasks_completed"] > 0 else 0
    }


def get_daily_metrics(day: str = None) -> dict:
    """Get metrics for a specific day (defaults to today)."""
    data = _load_metrics()
    day = day or _get_today()

    if day not in data["by_day"]:
        return {
            "date": day,
            "tasks_created": 0,
            "tasks_completed": 0,
            "tasks_rejected": 0,
            "tasks_failed": 0,
            "by_agent": {}
        }

    day_data = data["by_day"][day]
    return {
        "date": day,
        **day_data
    }


def get_recent_events(limit: int = 50) -> list:
    """Get the most recent metric events."""
    data = _load_metrics()
    return data["events"][-limit:][::-1]


def get_top_performers(limit: int = 5) -> list:
    """Get agents ranked by completion rate."""
    data = _load_metrics()

    rankings = []
    for agent, stats in data["by_agent"].items():
        if stats["tasks_assigned"] > 0:
            rankings.append({
                "agent": agent,
                "tasks_completed": stats["tasks_completed"],
                "tasks_assigned": stats["tasks_assigned"],
                "completion_rate": round(stats["tasks_completed"] / stats["tasks_assigned"] * 100, 1),
                "qa_pass_rate": round(stats["qa_approvals"] / (stats["qa_approvals"] + stats["qa_rejections"]) * 100, 1) if (stats["qa_approvals"] + stats["qa_rejections"]) > 0 else 0
            })

    return sorted(rankings, key=lambda x: (x["completion_rate"], x["qa_pass_rate"]), reverse=True)[:limit]
