"""
Routine tools for schedule/routine management.
Used by BOSS agent and MCP server.
"""

from studio.core.schedules import schedule_manager


def create_routine(name: str, description: str, interval_seconds: int, tasks: list) -> str:
    """Create a new scheduled routine."""
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


def list_routines() -> str:
    """List all routines with their status and next run time."""
    schedules = schedule_manager.get_all()
    if not schedules:
        return "No routines configured."

    lines = []
    for s in schedules:
        status_icon = "▶" if s.status.value == "active" else "⏸" if s.status.value == "paused" else "⟳"
        next_str = s.next_run.strftime("%m-%d %H:%M") if s.next_run else "N/A"
        lines.append(f"{status_icon} [{s.id}] {s.name} (every {s._format_interval()}) → next: {next_str}")

    return "\n".join(lines)


def get_routine(schedule_id: str) -> str:
    """Get detailed info about a specific routine."""
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


def pause_routine(schedule_id: str) -> str:
    """Temporarily pause a routine."""
    if schedule_manager.pause(schedule_id):
        return f"Paused {schedule_id}"
    return f"Failed to pause {schedule_id} - not found or already paused"


def resume_routine(schedule_id: str) -> str:
    """Resume a paused routine."""
    if schedule_manager.resume(schedule_id):
        return f"Resumed {schedule_id} - will run soon"
    return f"Failed to resume {schedule_id} - not found or not paused"


def delete_routine(schedule_id: str) -> str:
    """Permanently delete a routine."""
    if schedule_manager.delete(schedule_id):
        return f"Deleted {schedule_id}"
    return f"Failed to delete {schedule_id} - not found"
