"""
Routine agent tools for schedule/routine management.
"""

from studio.core.schedules import schedule_manager


# ============ CREATE ROUTINE ============

CREATE_ROUTINE_SCHEMA = {
    "name": "create_routine",
    "description": """Create a new scheduled routine (recurring workflow).

Tasks run sequentially by default. Set parallel:true for concurrent tasks.

Interval reference:
  30m = 1800s | 1h = 3600s | 6h = 21600s | 24h = 86400s""",
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "Short name for the routine"
            },
            "description": {
                "type": "string",
                "description": "What this routine accomplishes"
            },
            "interval_seconds": {
                "type": "integer",
                "description": "How often to run (seconds). 1800=30m, 3600=1h, 21600=6h, 86400=24h"
            },
            "tasks": {
                "type": "array",
                "description": "Task sequence to create each run",
                "items": {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string",
                            "description": "Task description with [WHAT] [CONTEXT] format"
                        },
                        "assignee": {
                            "type": "string",
                            "description": "Agent: Designer, Programmer, Writer, QA, Research, etc."
                        },
                        "parallel": {
                            "type": "boolean",
                            "description": "Run in parallel with previous task (default: false)"
                        }
                    },
                    "required": ["description", "assignee"]
                }
            }
        },
        "required": ["name", "description", "interval_seconds", "tasks"]
    }
}


def create_routine(name: str, description: str, interval_seconds: int, tasks: list) -> str:
    if not tasks:
        return "Error: At least one task is required"

    schedule = schedule_manager.create(
        name=name,
        description=description,
        interval_seconds=interval_seconds,
        tasks=tasks,
    )

    interval_human = schedule._format_interval()
    task_count = len(schedule.tasks)
    return f"Created {schedule.id}: '{name}' (every {interval_human}, {task_count} tasks)"


# ============ LIST ROUTINES ============

LIST_ROUTINES_SCHEMA = {
    "name": "list_routines",
    "description": "List all routines with their status and next run time.",
    "input_schema": {
        "type": "object",
        "properties": {},
        "required": []
    }
}


def list_routines() -> str:
    schedules = schedule_manager.get_all()
    if not schedules:
        return "No routines configured."

    lines = []
    for s in schedules:
        status_icon = "▶" if s.status.value == "active" else "⏸" if s.status.value == "paused" else "⟳"
        next_str = s.next_run.strftime("%m-%d %H:%M") if s.next_run else "N/A"
        lines.append(f"{status_icon} [{s.id}] {s.name} (every {s._format_interval()}) → next: {next_str}")

    return "\n".join(lines)


# ============ GET ROUTINE ============

GET_ROUTINE_SCHEMA = {
    "name": "get_routine",
    "description": "Get detailed info about a specific routine including task sequence and run history.",
    "input_schema": {
        "type": "object",
        "properties": {
            "schedule_id": {
                "type": "string",
                "description": "Routine ID (e.g., SCH001)"
            }
        },
        "required": ["schedule_id"]
    }
}


def get_routine(schedule_id: str) -> str:
    schedule = schedule_manager.get(schedule_id)
    if not schedule:
        return f"Routine {schedule_id} not found"

    lines = [
        f"[{schedule.id}] {schedule.name}",
        f"Status: {schedule.status.value}",
        f"Interval: {schedule._format_interval()} ({schedule.interval_seconds}s)",
        f"Run count: {schedule.run_count}",
        f"Last run: {schedule.last_run.strftime('%Y-%m-%d %H:%M') if schedule.last_run else 'Never'}",
        f"Next run: {schedule.next_run.strftime('%Y-%m-%d %H:%M') if schedule.next_run else 'N/A'}",
        "",
        "Tasks:",
    ]

    for i, task in enumerate(schedule.tasks, 1):
        parallel_mark = " [parallel]" if task.parallel else ""
        lines.append(f"  {i}. {task.assignee}: {task.description[:60]}...{parallel_mark}")

    if schedule.created_task_ids:
        lines.append("")
        lines.append(f"Last created tasks: {', '.join(schedule.created_task_ids)}")

    return "\n".join(lines)


# ============ PAUSE ROUTINE ============

PAUSE_ROUTINE_SCHEMA = {
    "name": "pause_routine",
    "description": "Temporarily pause a routine. Can be resumed later.",
    "input_schema": {
        "type": "object",
        "properties": {
            "schedule_id": {
                "type": "string",
                "description": "Routine ID to pause (e.g., SCH001)"
            }
        },
        "required": ["schedule_id"]
    }
}


def pause_routine(schedule_id: str) -> str:
    if schedule_manager.pause(schedule_id):
        return f"Paused {schedule_id}"
    return f"Failed to pause {schedule_id} - not found or already paused"


# ============ RESUME ROUTINE ============

RESUME_ROUTINE_SCHEMA = {
    "name": "resume_routine",
    "description": "Resume a paused routine. Next run will be scheduled immediately.",
    "input_schema": {
        "type": "object",
        "properties": {
            "schedule_id": {
                "type": "string",
                "description": "Routine ID to resume (e.g., SCH001)"
            }
        },
        "required": ["schedule_id"]
    }
}


def resume_routine(schedule_id: str) -> str:
    if schedule_manager.resume(schedule_id):
        return f"Resumed {schedule_id} - will run soon"
    return f"Failed to resume {schedule_id} - not found or not paused"


# ============ DELETE ROUTINE ============

DELETE_ROUTINE_SCHEMA = {
    "name": "delete_routine",
    "description": "Permanently delete a routine. Cannot be undone.",
    "input_schema": {
        "type": "object",
        "properties": {
            "schedule_id": {
                "type": "string",
                "description": "Routine ID to delete (e.g., SCH001)"
            }
        },
        "required": ["schedule_id"]
    }
}


def delete_routine(schedule_id: str) -> str:
    if schedule_manager.delete(schedule_id):
        return f"Deleted {schedule_id}"
    return f"Failed to delete {schedule_id} - not found"


# ============ TOOL BUNDLE ============

TOOLS = [
    CREATE_ROUTINE_SCHEMA,
    LIST_ROUTINES_SCHEMA,
    GET_ROUTINE_SCHEMA,
    PAUSE_ROUTINE_SCHEMA,
    RESUME_ROUTINE_SCHEMA,
    DELETE_ROUTINE_SCHEMA,
]

HANDLERS = {
    "create_routine": create_routine,
    "list_routines": list_routines,
    "get_routine": get_routine,
    "pause_routine": pause_routine,
    "resume_routine": resume_routine,
    "delete_routine": delete_routine,
}
