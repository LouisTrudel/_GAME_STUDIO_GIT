"""
Schedule System - Recurring scheduled workflows.

A schedule is a workflow that runs on a schedule, creating a series of tasks.
Example: Every 24h, research trends -> write report -> review -> save.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
from enum import Enum
from pathlib import Path
import json

from .tasks import task_manager


SCHEDULES_FILE = Path(__file__).parent.parent.parent / "data" / "schedules.json"


class ScheduleStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    RUNNING = "running"  # Currently executing


@dataclass
class TaskTemplate:
    """Template for a task that gets created each schedule run."""
    description: str
    assignee: str
    depends_on_previous: bool = True  # If True, depends on the previous task in sequence
    context: str = ""  # Additional context/instructions for the agent
    skills: list = None  # Specific skills to inject (e.g., ["economy.md", "camera.md"])
    output: str = "hub"  # Output type: "hub", "report", "code"
    parallel: bool = False  # If True, runs in parallel with previous task


class ScheduleType(Enum):
    TASKS = "tasks"      # Creates agent tasks
    SCRIPT = "script"    # Runs a Python module directly


@dataclass
class Schedule:
    id: str
    name: str
    description: str
    interval_seconds: int  # How often to run
    tasks: list[TaskTemplate]  # Task sequence to create (for TASKS type)
    status: ScheduleStatus = ScheduleStatus.ACTIVE
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    run_count: int = 0
    created_task_ids: list[str] = field(default_factory=list)  # Tasks from current/last run
    schedule_type: ScheduleType = ScheduleType.TASKS
    script_module: Optional[str] = None  # Python module path (for SCRIPT type)

    def __post_init__(self):
        if self.next_run is None:
            self.next_run = datetime.now()

    def to_dict(self) -> dict:
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "interval_seconds": self.interval_seconds,
            "interval_human": self._format_interval(),
            "schedule_type": self.schedule_type.value,
            "status": self.status.value,
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "next_run": self.next_run.isoformat() if self.next_run else None,
            "run_count": self.run_count,
        }
        if self.schedule_type == ScheduleType.TASKS:
            result["tasks"] = [{
                "description": t.description,
                "assignee": t.assignee,
                "context": t.context,
                "skills": t.skills or [],
                "output": t.output,
                "parallel": t.parallel,
            } for t in self.tasks]
            result["created_task_ids"] = self.created_task_ids
        elif self.schedule_type == ScheduleType.SCRIPT:
            result["script_module"] = self.script_module
        return result

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


class ScheduleManager:
    """Manages recurring schedule workflows."""

    def __init__(self):
        self.schedules: dict[str, Schedule] = {}
        self._counter = 0
        self._load_schedules()

    def _load_schedules(self):
        """Load schedules from file."""
        if SCHEDULES_FILE.exists():
            try:
                with open(SCHEDULES_FILE) as f:
                    data = json.load(f)
                for s_data in data.get("schedules", []):
                    sched_type = ScheduleType(s_data.get("schedule_type", "tasks"))

                    # Rebuild TaskTemplates (for tasks type)
                    task_templates = []
                    if sched_type == ScheduleType.TASKS:
                        for i, t in enumerate(s_data.get("tasks", [])):
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

                    schedule = Schedule(
                        id=s_data["id"],
                        name=s_data["name"],
                        description=s_data["description"],
                        interval_seconds=s_data["interval_seconds"],
                        tasks=task_templates,
                        status=ScheduleStatus(s_data["status"]),
                        last_run=datetime.fromisoformat(s_data["last_run"]) if s_data.get("last_run") else None,
                        next_run=datetime.fromisoformat(s_data["next_run"]) if s_data.get("next_run") else None,
                        run_count=s_data.get("run_count", 0),
                        created_task_ids=s_data.get("created_task_ids", []),
                        schedule_type=sched_type,
                        script_module=s_data.get("script_module"),
                    )
                    self.schedules[schedule.id] = schedule
                self._counter = data.get("counter", 0)
                print(f"[Schedules] Loaded {len(self.schedules)} schedules from history")
            except Exception as e:
                print(f"[Schedules] Failed to load: {e}")

    def _save_schedules(self):
        """Save schedules to file."""
        try:
            SCHEDULES_FILE.parent.mkdir(parents=True, exist_ok=True)
            data = {
                "counter": self._counter,
                "schedules": [s.to_dict() for s in self.schedules.values()]
            }
            with open(SCHEDULES_FILE, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"[Schedules] Failed to save: {e}")

    def create(
        self,
        name: str,
        description: str,
        interval_seconds: int,
        tasks: list[dict],  # [{"description": str, "assignee": str}]
    ) -> Schedule:
        """Create a new schedule workflow."""
        self._counter += 1
        schedule_id = f"SCH{self._counter:03d}"

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

        schedule = Schedule(
            id=schedule_id,
            name=name,
            description=description,
            interval_seconds=interval_seconds,
            tasks=task_templates,
        )

        self.schedules[schedule_id] = schedule
        self._save_schedules()
        return schedule

    def create_script(
        self,
        name: str,
        description: str,
        interval_seconds: int,
        script_module: str,  # e.g., "studio.routines.gemini_research_routine"
    ) -> Schedule:
        """Create a schedule that runs a Python script directly."""
        self._counter += 1
        schedule_id = f"SCH{self._counter:03d}"

        schedule = Schedule(
            id=schedule_id,
            name=name,
            description=description,
            interval_seconds=interval_seconds,
            tasks=[],
            schedule_type=ScheduleType.SCRIPT,
            script_module=script_module,
        )

        self.schedules[schedule_id] = schedule
        self._save_schedules()
        return schedule

    def get(self, schedule_id: str) -> Optional[Schedule]:
        return self.schedules.get(schedule_id)

    def pause(self, schedule_id: str) -> bool:
        schedule = self.schedules.get(schedule_id)
        if schedule:
            schedule.status = ScheduleStatus.PAUSED
            self._save_schedules()
            return True
        return False

    def resume(self, schedule_id: str) -> bool:
        schedule = self.schedules.get(schedule_id)
        if schedule and schedule.status == ScheduleStatus.PAUSED:
            schedule.status = ScheduleStatus.ACTIVE
            schedule.next_run = datetime.now()  # Run soon
            self._save_schedules()
            return True
        return False

    def delete(self, schedule_id: str) -> bool:
        if schedule_id in self.schedules:
            del self.schedules[schedule_id]
            self._save_schedules()
            return True
        return False

    def get_due(self) -> list[Schedule]:
        """Get schedules that are due to run."""
        now = datetime.now()
        due = []
        for schedule in self.schedules.values():
            if schedule.status == ScheduleStatus.ACTIVE and schedule.next_run and schedule.next_run <= now:
                due.append(schedule)
        return due

    def run(self, schedule_id: str) -> list[str]:
        """Execute a schedule. Returns created task IDs (for TASKS) or empty list (for SCRIPT)."""
        schedule = self.schedules.get(schedule_id)
        if not schedule:
            return []

        schedule.status = ScheduleStatus.RUNNING
        created_ids = []

        if schedule.schedule_type == ScheduleType.SCRIPT:
            # Run Python script directly
            self._run_script(schedule)
        else:
            # Create agent tasks
            prev_task_id = None
            for template in schedule.tasks:
                deps = [prev_task_id] if template.depends_on_previous and prev_task_id else []
                task = task_manager.create_task(
                    description=f"[{schedule.name}] {template.description}",
                    assignee=template.assignee,
                    dependencies=deps,
                )
                created_ids.append(task.id)
                prev_task_id = task.id
            schedule.created_task_ids = created_ids

        # Update schedule state
        schedule.last_run = datetime.now()
        schedule.next_run = datetime.now() + timedelta(seconds=schedule.interval_seconds)
        schedule.run_count += 1
        schedule.status = ScheduleStatus.ACTIVE
        self._save_schedules()

        return created_ids

    def _run_script(self, schedule: Schedule):
        """Run a script-type schedule. Executes the module's run_routine() function."""
        import importlib
        import traceback

        if not schedule.script_module:
            print(f"[Schedule {schedule.id}] ERROR: No script_module specified")
            return

        try:
            print(f"[Schedule {schedule.id}] Running script: {schedule.script_module}")
            module = importlib.import_module(schedule.script_module)

            if hasattr(module, "run_routine"):
                result = module.run_routine()
                if result and result.get("error"):
                    print(f"[Schedule {schedule.id}] Script error: {result['error']}")
                else:
                    print(f"[Schedule {schedule.id}] Script completed successfully")
            else:
                print(f"[Schedule {schedule.id}] WARNING: Module has no run_routine() function")
        except Exception as e:
            print(f"[Schedule {schedule.id}] FAILED: {e}")
            traceback.print_exc()

    def tick(self) -> list[str]:
        """Check for due schedules and run them. Returns list of schedule IDs that ran."""
        ran = []
        for schedule in self.get_due():
            self.run(schedule.id)
            ran.append(schedule.id)
        return ran

    def get_all(self) -> list[Schedule]:
        return list(self.schedules.values())

    def to_context_string(self) -> str:
        """Format schedules for agent context."""
        if not self.schedules:
            return "No schedules configured."

        lines = ["Active Schedules:"]
        for schedule in self.schedules.values():
            status_icon = ">" if schedule.status == ScheduleStatus.ACTIVE else "||"
            lines.append(f"  {status_icon} [{schedule.id}] {schedule.name} (every {schedule._format_interval()})")
            if schedule.next_run:
                lines.append(f"       Next: {schedule.next_run.strftime('%Y-%m-%d %H:%M')}")

        return "\n".join(lines)


# Global schedule manager
schedule_manager = ScheduleManager()


# ============ PRESET SCHEDULES ============

def create_trend_report_schedule(interval_hours: int = 24) -> Schedule:
    """Create the Game Trends report schedule."""
    return schedule_manager.create(
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


def create_code_review_schedule(interval_hours: int = 12) -> Schedule:
    """Create a periodic code review schedule."""
    return schedule_manager.create(
        name="Code Review",
        description="Review recent code changes for quality",
        interval_seconds=interval_hours * 3600,
        tasks=[
            {"description": "Review recent code changes for bugs and issues", "assignee": "Programmer"},
            {"description": "Test edge cases and potential exploits", "assignee": "QA"},
            {"description": "Summarize findings for BOSS", "assignee": "Programmer"},
        ],
    )


def create_taxonomy_review_schedule(interval_hours: int = 24) -> Schedule:
    """Create daily codebase organization review.

    Spec from Designer:
    - Taxonomy scans at 06:00 UTC daily
    - Output: /reports/codebase_review_YYYY-MM-DD.md
    - Format: Priority sections (High/Medium/Low) with checkboxes
    - Auto-creates Programmer task to apply recommendations
    """
    today = datetime.now().strftime("%Y-%m-%d")
    report_path = f"reports/codebase_review_{today}.md"

    return schedule_manager.create(
        name="Daily Codebase Review",
        description="Taxonomy analyzes codebase structure, Programmer applies fixes",
        interval_seconds=interval_hours * 3600,
        tasks=[
            {
                "description": f"[WHAT] Analyze codebase for structural issues [CONTEXT] Scan all files for: file sizes (>400 lines warn, logic files >1500 action), function lengths (>50 lines), duplicate code (>15 lines), naming inconsistencies, dead code, missing types [OUTPUT] Write report to {report_path} using this format:\n\n# Codebase Review - {today}\n\n## Priority: High\n- [ ] **Action** `file:lines` → description\n  - Rationale: why\n  - Files affected: N\n\n## Priority: Medium\n(same format)\n\n## Priority: Low\n(same format)\n\n## Stats\n- Files scanned: N\n- Issues found: N\n\n[CONSTRAINTS] Max 20 items, include exact file paths and line numbers, cap at top 20 by priority if >20 issues found",
                "assignee": "Taxonomy",
                "output": "report",
            },
            {
                "description": f"[WHAT] Apply codebase review recommendations [CONTEXT] See {report_path} [CONSTRAINTS] Address High priority first, create follow-up tasks for Medium/Low if needed",
                "assignee": "Programmer",
            },
        ],
    )


def create_gemini_research_schedule(interval_minutes: int = 30) -> Schedule:
    """Create automated Gemini research routine.

    Runs on a loop:
    1. Tests Gemini backend health
    2. Picks a rotating game dev topic
    3. Runs web research with grounding
    4. Saves report to reports/research/
    """
    return schedule_manager.create_script(
        name="Gemini Research",
        description="Automated game dev research - health check, web search, save report",
        interval_seconds=interval_minutes * 60,
        script_module="studio.routines.gemini_research_routine",
    )


def create_git_commit_schedule(interval_hours: int = 24) -> Schedule:
    """Create automated git commit/push routine.

    Runs daily (default) or on configured interval:
    1. Checks for uncommitted changes
    2. Stages all changes
    3. Generates descriptive commit message
    4. Commits and pushes to origin

    Returns None if no changes to commit.
    """
    return schedule_manager.create_script(
        name="Git Auto-Commit",
        description="Stage, commit, and push changes to origin",
        interval_seconds=interval_hours * 3600,
        script_module="studio.routines.git_commit_routine",
    )
