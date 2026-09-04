"""
Skill Usage Tracker

Tracks which skills agents load and how often.
Logs to /data/metrics/skill_usage.json
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional


# Data directory
DATA_DIR = Path(__file__).parent.parent.parent / "data"
METRICS_DIR = DATA_DIR / "metrics"
USAGE_FILE = METRICS_DIR / "skill_usage.json"

# Skills directory for enumerating all available skills
SKILLS_DIR = Path(__file__).parent.parent / "skills"


def _ensure_metrics_dir():
    """Ensure the metrics directory exists."""
    METRICS_DIR.mkdir(parents=True, exist_ok=True)


def _load_usage_data() -> dict:
    """Load existing usage data or return empty structure."""
    _ensure_metrics_dir()
    if USAGE_FILE.exists():
        try:
            with open(USAGE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {"events": [], "summary": {}}


def _save_usage_data(data: dict):
    """Save usage data to file."""
    _ensure_metrics_dir()
    with open(USAGE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def track_skill_load(skill_path: str, agent_name: str, task_id: Optional[str] = None, success: bool = True):
    """
    Track a skill load event.

    Args:
        skill_path: The skill path that was loaded (e.g., ':code/roblox/client')
        agent_name: The agent that loaded the skill
        task_id: Optional task context
        success: Whether the skill was found and loaded successfully
    """
    data = _load_usage_data()

    # Create event
    event = {
        "skill": skill_path,
        "agent": agent_name,
        "timestamp": datetime.now().isoformat(),
        "task_id": task_id,
        "success": success
    }
    data["events"].append(event)

    # Update summary
    if skill_path not in data["summary"]:
        data["summary"][skill_path] = {
            "total_loads": 0,
            "successful_loads": 0,
            "by_agent": {},
            "first_loaded": event["timestamp"],
            "last_loaded": None
        }

    summary = data["summary"][skill_path]
    summary["total_loads"] += 1
    if success:
        summary["successful_loads"] += 1
    summary["last_loaded"] = event["timestamp"]

    # Track by agent
    if agent_name not in summary["by_agent"]:
        summary["by_agent"][agent_name] = 0
    summary["by_agent"][agent_name] += 1

    _save_usage_data(data)


def get_all_available_skills() -> list[str]:
    """
    Enumerate all available skill files in the skills directory.
    Returns paths in colon notation (e.g., ':code/roblox/client').
    """
    skills = []
    if SKILLS_DIR.exists():
        for skill_file in SKILLS_DIR.rglob("*.md"):
            # Skip router files
            if "_routers" in str(skill_file):
                continue
            # Convert to colon notation
            rel_path = skill_file.relative_to(SKILLS_DIR)
            skill_path = ":" + str(rel_path.with_suffix("")).replace("\\", "/")
            skills.append(skill_path)

        # Also check for .lua templates
        for skill_file in SKILLS_DIR.rglob("*.lua"):
            rel_path = skill_file.relative_to(SKILLS_DIR)
            skill_path = ":" + str(rel_path.with_suffix("")).replace("\\", "/")
            skills.append(skill_path)

    return sorted(skills)


def get_most_used_skills(limit: int = 10) -> list[dict]:
    """
    Get the most frequently used skills.

    Returns list of dicts with: skill, total_loads, successful_loads, agents
    """
    data = _load_usage_data()
    summary = data.get("summary", {})

    # Sort by total loads descending
    sorted_skills = sorted(
        summary.items(),
        key=lambda x: x[1]["total_loads"],
        reverse=True
    )[:limit]

    return [
        {
            "skill": skill,
            "total_loads": info["total_loads"],
            "successful_loads": info["successful_loads"],
            "agents": list(info["by_agent"].keys()),
            "top_agent": max(info["by_agent"].items(), key=lambda x: x[1])[0] if info["by_agent"] else None
        }
        for skill, info in sorted_skills
    ]


def get_never_used_skills() -> list[str]:
    """
    Get skills that have never been loaded.
    Compares available skills against usage data.
    """
    data = _load_usage_data()
    used_skills = set(data.get("summary", {}).keys())
    available_skills = set(get_all_available_skills())

    return sorted(available_skills - used_skills)


def get_skill_usage_by_agent(agent_name: str) -> list[dict]:
    """
    Get skill usage statistics for a specific agent.
    """
    data = _load_usage_data()
    summary = data.get("summary", {})

    agent_usage = []
    for skill, info in summary.items():
        if agent_name in info.get("by_agent", {}):
            agent_usage.append({
                "skill": skill,
                "loads": info["by_agent"][agent_name],
                "last_loaded": info["last_loaded"]
            })

    return sorted(agent_usage, key=lambda x: x["loads"], reverse=True)


def get_usage_stats() -> dict:
    """
    Get overall usage statistics.
    """
    data = _load_usage_data()
    events = data.get("events", [])
    summary = data.get("summary", {})

    all_skills = get_all_available_skills()
    used_skills = list(summary.keys())
    never_used = get_never_used_skills()

    # Calculate success rate
    total_loads = len(events)
    successful_loads = sum(1 for e in events if e.get("success", True))

    # Get unique agents
    agents = set(e["agent"] for e in events)

    return {
        "total_events": total_loads,
        "successful_loads": successful_loads,
        "success_rate": round(successful_loads / total_loads * 100, 1) if total_loads > 0 else 0,
        "unique_skills_used": len(used_skills),
        "total_skills_available": len(all_skills),
        "skills_never_used": len(never_used),
        "coverage_percent": round(len(used_skills) / len(all_skills) * 100, 1) if all_skills else 0,
        "agents_active": list(agents)
    }


def get_recent_loads(limit: int = 20) -> list[dict]:
    """
    Get the most recent skill load events.
    """
    data = _load_usage_data()
    events = data.get("events", [])
    return events[-limit:][::-1]  # Most recent first
