"""
Heartbeat System - Recurring scheduled workflows.

A heartbeat is a workflow that runs on a schedule, creating a series of tasks.
Example: Every 24h, research trends → write report → review → save.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
from enum import Enum
import json

from .tasks import task_manager


class HeartbeatStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    RUNNING = "running"  # Currently executing


@dataclass
class TaskTemplate:
    """Template for a task that gets created each heartbeat run."""
    description: str
    assignee: str
    depends_on_previous: bool = True  # If True, depends on the previous task in sequence
    context: str = ""  # Additional context/instructions for the agent
    skills: list = None  # Specific skills to inject (e.g., ["economy.md", "camera.md"])
    output: str = "hub"  # Output type: "hub", "report", "code"
    parallel: bool = False  # If True, runs in parallel with previous task


@dataclass
class Heartbeat:
    id: str
    name: str
    description: str
    interval_seconds: int  # How often to run
    tasks: list[TaskTemplate]  # Task sequence to create
    status: HeartbeatStatus = HeartbeatStatus.ACTIVE
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    run_count: int = 0
    created_task_ids: list[str] = field(default_factory=list)  # Tasks from current/last run

    def __post_init__(self):
        if self.next_run is None:
            self.next_run = datetime.now()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "interval_seconds": self.interval_seconds,
            "interval_human": self._format_interval(),
            "tasks": [{
                "description": t.description,
                "assignee": t.assignee,
                "context": t.context,
                "skills": t.skills or [],
                "output": t.output,
                "parallel": t.parallel,
            } for t in self.tasks],
            "status": self.status.value,
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "next_run": self.next_run.isoformat() if self.next_run else None,
            "run_count": self.run_count,
            "created_task_ids": self.created_task_ids,
        }

    def _format_interval(self) -> str:
        """Human-readable interval."""
        s = self.interval_seconds
        if s < 60:
            return f"{s}s"
        elif s < 3600:
            return f"{s // 60}m"
        elif s < 86400:
            return f"{s // 3600}h"
        else:
            return f"{s // 86400}d"


class HeartbeatManager:
    """Manages recurring heartbeat workflows."""

    def __init__(self):
        self.heartbeats: dict[str, Heartbeat] = {}
        self._counter = 0

    def create(
        self,
        name: str,
        description: str,
        interval_seconds: int,
        tasks: list[dict],  # [{"description": str, "assignee": str}]
    ) -> Heartbeat:
        """Create a new heartbeat workflow."""
        self._counter += 1
        hb_id = f"HB{self._counter:03d}"

        task_templates = []
        for i, t in enumerate(tasks):
            is_parallel = t.get("parallel", False)
            task_templates.append(TaskTemplate(
                description=t["description"],
                assignee=t["assignee"],
                depends_on_previous=(i > 0 and not is_parallel),
                context=t.get("context", ""),
                skills=t.get("skills", []),
                output=t.get("output", "hub"),
                parallel=is_parallel,
            ))

        heartbeat = Heartbeat(
            id=hb_id,
            name=name,
            description=description,
            interval_seconds=interval_seconds,
            tasks=task_templates,
        )

        self.heartbeats[hb_id] = heartbeat
        return heartbeat

    def get(self, hb_id: str) -> Optional[Heartbeat]:
        return self.heartbeats.get(hb_id)

    def pause(self, hb_id: str) -> bool:
        hb = self.heartbeats.get(hb_id)
        if hb:
            hb.status = HeartbeatStatus.PAUSED
            return True
        return False

    def resume(self, hb_id: str) -> bool:
        hb = self.heartbeats.get(hb_id)
        if hb and hb.status == HeartbeatStatus.PAUSED:
            hb.status = HeartbeatStatus.ACTIVE
            hb.next_run = datetime.now()  # Run soon
            return True
        return False

    def delete(self, hb_id: str) -> bool:
        if hb_id in self.heartbeats:
            del self.heartbeats[hb_id]
            return True
        return False

    def get_due(self) -> list[Heartbeat]:
        """Get heartbeats that are due to run."""
        now = datetime.now()
        due = []
        for hb in self.heartbeats.values():
            if hb.status == HeartbeatStatus.ACTIVE and hb.next_run and hb.next_run <= now:
                due.append(hb)
        return due

    def run(self, hb_id: str) -> list[str]:
        """Execute a heartbeat - create its tasks. Returns created task IDs."""
        hb = self.heartbeats.get(hb_id)
        if not hb:
            return []

        hb.status = HeartbeatStatus.RUNNING
        created_ids = []
        prev_task_id = None

        for template in hb.tasks:
            deps = [prev_task_id] if template.depends_on_previous and prev_task_id else []
            task = task_manager.create_task(
                description=f"[{hb.name}] {template.description}",
                assignee=template.assignee,
                dependencies=deps,
            )
            created_ids.append(task.id)
            prev_task_id = task.id

        # Update heartbeat state
        hb.last_run = datetime.now()
        hb.next_run = datetime.now() + timedelta(seconds=hb.interval_seconds)
        hb.run_count += 1
        hb.created_task_ids = created_ids
        hb.status = HeartbeatStatus.ACTIVE

        return created_ids

    def tick(self) -> list[str]:
        """Check for due heartbeats and run them. Returns list of heartbeat IDs that ran."""
        ran = []
        for hb in self.get_due():
            self.run(hb.id)
            ran.append(hb.id)
        return ran

    def get_all(self) -> list[Heartbeat]:
        return list(self.heartbeats.values())

    def to_context_string(self) -> str:
        """Format heartbeats for agent context."""
        if not self.heartbeats:
            return "No heartbeats configured."

        lines = ["Active Heartbeats:"]
        for hb in self.heartbeats.values():
            status_icon = "▶" if hb.status == HeartbeatStatus.ACTIVE else "⏸"
            lines.append(f"  {status_icon} [{hb.id}] {hb.name} (every {hb._format_interval()})")
            if hb.next_run:
                lines.append(f"       Next: {hb.next_run.strftime('%Y-%m-%d %H:%M')}")

        return "\n".join(lines)


# Global heartbeat manager
heartbeat_manager = HeartbeatManager()


# ============ PRESET HEARTBEATS ============

def create_trend_report_heartbeat(interval_hours: int = 24) -> Heartbeat:
    """Create the Game Trends report heartbeat."""
    return heartbeat_manager.create(
        name="Game Trends Report",
        description="Research gaming trends and compile a report",
        interval_seconds=interval_hours * 3600,
        tasks=[
            {"description": "Search the web for current gaming trends, popular mechanics, and industry news", "assignee": "Designer"},
            {"description": "Write a comprehensive trend report based on the research", "assignee": "Writer"},
            {"description": "Review the report for accuracy and completeness", "assignee": "QA"},
            {"description": "Apply final edits and polish to the report", "assignee": "Writer"},
            {"description": "Save the final report and notify BOSS", "assignee": "BOSS"},
        ],
    )


def create_code_review_heartbeat(interval_hours: int = 12) -> Heartbeat:
    """Create a periodic code review heartbeat."""
    return heartbeat_manager.create(
        name="Code Review",
        description="Review recent code changes for quality",
        interval_seconds=interval_hours * 3600,
        tasks=[
            {"description": "Review recent code changes for bugs and issues", "assignee": "Programmer"},
            {"description": "Test edge cases and potential exploits", "assignee": "QA"},
            {"description": "Summarize findings for BOSS", "assignee": "Programmer"},
        ],
    )
