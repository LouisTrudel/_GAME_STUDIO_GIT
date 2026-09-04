"""
Task Management System for the Game Studio.

Tasks flow:
1. BOSS receives user request
2. BOSS breaks it into tasks with dependencies
3. Tasks are assigned to agents
4. Agents execute tasks (parallel where possible)
5. QA reviews completed work
6. If QA approves → task is done
7. If QA rejects → task goes back to original agent for fixes
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from pathlib import Path
import json

# Import metrics tracking (lazy to avoid circular imports)
def _track_created(task_id: str, assignee: Optional[str]):
    try:
        from studio.core.studio_metrics import track_task_created
        track_task_created(task_id, assignee)
    except ImportError:
        pass

def _track_completed(task_id: str, assignee: str):
    try:
        from studio.core.studio_metrics import track_task_completed
        track_task_completed(task_id, assignee)
    except ImportError:
        pass

def _track_rejected(task_id: str, assignee: str):
    try:
        from studio.core.studio_metrics import track_task_rejected
        track_task_rejected(task_id, assignee)
    except ImportError:
        pass

def _track_failed(task_id: str, assignee: Optional[str], reason: str):
    try:
        from studio.core.studio_metrics import track_task_failed
        track_task_failed(task_id, assignee, reason)
    except ImportError:
        pass

def _track_qa_review(task_id: str, assignee: str, approved: bool):
    try:
        from studio.core.studio_metrics import track_qa_review
        track_qa_review(task_id, assignee, approved)
    except ImportError:
        pass


TASKS_FILE = Path(__file__).parent.parent.parent / "data" / "tasks.json"
ARCHIVE_FILE = Path(__file__).parent.parent.parent / "data" / "tasks_archive.json"


class TaskStatus(Enum):
    PENDING = "pending"          # Waiting for dependencies
    READY = "ready"              # Dependencies met, can be picked up
    IN_PROGRESS = "in_progress"  # Agent is working on it
    COMPLETED = "completed"      # Done, awaiting QA review
    APPROVED = "approved"        # QA approved, task is done
    REVISION = "revision"        # QA rejected, needs rework
    FAILED = "failed"            # Something went wrong
    BLOCKED = "blocked"          # Dependency failed
    ERROR = "error"              # Execution error (malformed task, timeout, etc.)


@dataclass
class Task:
    id: str
    description: str
    assignee: Optional[str] = None  # Agent name
    status: TaskStatus = TaskStatus.PENDING
    dependencies: list[str] = field(default_factory=list)  # Task IDs
    result: Optional[str] = None
    review_notes: Optional[str] = None
    error: Optional[str] = None  # Error message if task failed
    retry_count: int = 0  # Number of retry attempts for transient errors
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    # Token tracking
    token_log: list = field(default_factory=list)  # Per-step token breakdown
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    # Full prompt/response for analytics
    prompt_sent: Optional[str] = None  # Full context sent to agent

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "description": self.description,
            "assignee": self.assignee,
            "status": self.status.value,
            "dependencies": self.dependencies,
            "result": self.result,
            "review_notes": self.review_notes,
            "error": self.error,
            "retry_count": self.retry_count,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "token_log": self.token_log,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "prompt_sent": self.prompt_sent,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Task":
        return cls(
            id=data["id"],
            description=data["description"],
            assignee=data.get("assignee"),
            status=TaskStatus(data["status"]),
            dependencies=data.get("dependencies", []),
            result=data.get("result"),
            review_notes=data.get("review_notes"),
            error=data.get("error"),
            retry_count=data.get("retry_count", 0),
            created_at=datetime.fromisoformat(data["created_at"]),
            started_at=datetime.fromisoformat(data["started_at"]) if data.get("started_at") else None,
            completed_at=datetime.fromisoformat(data["completed_at"]) if data.get("completed_at") else None,
            token_log=data.get("token_log", []),
            total_input_tokens=data.get("total_input_tokens", 0),
            total_output_tokens=data.get("total_output_tokens", 0),
            prompt_sent=data.get("prompt_sent"),
        )


class TaskManager:
    """Manages task lifecycle and dependencies."""

    def __init__(self):
        self.tasks: dict[str, Task] = {}
        self._counter = 0
        self._load_tasks()
        # Reset any stale IN_PROGRESS tasks from previous crash
        self.reset_in_progress_tasks()

    def _load_tasks(self):
        """Load tasks from file."""
        if TASKS_FILE.exists():
            try:
                with open(TASKS_FILE) as f:
                    data = json.load(f)
                for task_data in data.get("tasks", []):
                    task = Task.from_dict(task_data)
                    self.tasks[task.id] = task
                self._counter = data.get("counter", 0)
                print(f"[Tasks] Loaded {len(self.tasks)} tasks from history")
            except Exception as e:
                print(f"[Tasks] Failed to load history: {e}")

    def _save_tasks(self):
        """Save tasks to file."""
        try:
            TASKS_FILE.parent.mkdir(parents=True, exist_ok=True)
            data = {
                "counter": self._counter,
                "tasks": [t.to_dict() for t in self.tasks.values()]
            }
            with open(TASKS_FILE, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"[Tasks] Failed to save: {e}")

    def create_task(
        self,
        description: str,
        assignee: str = None,
        dependencies: list[str] = None,
    ) -> Task:
        """Create a new task."""
        self._counter += 1
        task_id = f"T{self._counter:03d}"

        task = Task(
            id=task_id,
            description=description,
            assignee=assignee,
            dependencies=dependencies or [],
        )

        # Check if ready immediately (no dependencies)
        if not task.dependencies:
            task.status = TaskStatus.READY

        self.tasks[task_id] = task
        self._save_tasks()
        # Track metrics
        _track_created(task_id, assignee)
        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        return self.tasks.get(task_id)

    def validate_task(self, task_id: str) -> tuple[bool, str]:
        """
        Validate task before dispatch.
        Returns (is_valid, error_message).
        """
        task = self.tasks.get(task_id)
        if not task:
            return False, f"Task {task_id} not found"

        # Check description is non-empty and meaningful
        desc = (task.description or "").strip()
        if not desc:
            return False, "Empty task description"
        if len(desc) < 10:
            return False, f"Task description too short: '{desc}'"
        if desc == "..." or desc.startswith("..."):
            return False, f"Incomplete task description: '{desc}'"

        # Check assignee
        if not task.assignee:
            return False, "No assignee specified"

        return True, ""

    def get_ready_tasks(self) -> list[Task]:
        """Get all tasks that are ready to be worked on."""
        return [t for t in self.tasks.values() if t.status == TaskStatus.READY]

    def get_agent_tasks(self, agent_name: str) -> list[Task]:
        """Get all tasks assigned to an agent."""
        return [t for t in self.tasks.values() if t.assignee == agent_name]

    def get_pending_review(self) -> list[Task]:
        """Get tasks waiting for QA review."""
        return [t for t in self.tasks.values() if t.status == TaskStatus.COMPLETED]

    def start_task(self, task_id: str) -> bool:
        """Mark task as in progress."""
        task = self.tasks.get(task_id)
        if task and task.status == TaskStatus.READY:
            task.status = TaskStatus.IN_PROGRESS
            task.started_at = datetime.now()
            self._save_tasks()
            return True
        return False

    def reset_task(self, task_id: str) -> bool:
        """Reset task back to READY (for retries after errors)."""
        task = self.tasks.get(task_id)
        if task and task.status == TaskStatus.IN_PROGRESS:
            task.status = TaskStatus.READY
            task.started_at = None
            self._save_tasks()
            return True
        return False

    def complete_task(self, task_id: str, result: str) -> bool:
        """Mark task as completed (approved) with result. No review gate."""
        task = self.tasks.get(task_id)
        if task and task.status == TaskStatus.IN_PROGRESS:
            task.status = TaskStatus.APPROVED  # Direct to approved, no review loop
            task.result = result
            task.completed_at = datetime.now()
            self._update_dependents(task_id)
            self._save_tasks()
            # Track metrics
            _track_completed(task_id, task.assignee)
            return True
        return False

    def fail_task(self, task_id: str, reason: str) -> bool:
        """Mark task as failed."""
        task = self.tasks.get(task_id)
        if task:
            task.status = TaskStatus.FAILED
            task.result = f"FAILED: {reason}"
            task.completed_at = datetime.now()
            self._block_dependents(task_id)
            self._save_tasks()
            # Track metrics
            _track_failed(task_id, task.assignee, reason)
            return True
        return False

    def set_error(self, task_id: str, error_msg: str) -> bool:
        """Mark task as error (execution failed, malformed, timeout, etc.)."""
        task = self.tasks.get(task_id)
        if task:
            task.status = TaskStatus.ERROR
            task.error = error_msg
            task.completed_at = datetime.now()
            self._save_tasks()
            print(f"[Tasks] {task_id} ERROR: {error_msg}")
            # Track metrics (errors count as failures)
            _track_failed(task_id, task.assignee, error_msg)
            return True
        return False

    def increment_retry(self, task_id: str, max_retries: int = 3) -> bool:
        """
        Increment retry count for a task.
        Returns True if task can still be retried, False if max retries exceeded.
        """
        task = self.tasks.get(task_id)
        if task:
            task.retry_count += 1
            self._save_tasks()
            if task.retry_count >= max_retries:
                return False  # Max retries exceeded
            return True  # Can still retry
        return False

    def get_retry_count(self, task_id: str) -> int:
        """Get current retry count for a task."""
        task = self.tasks.get(task_id)
        return task.retry_count if task else 0

    def log_tokens(self, task_id: str, token_log: list, input_tokens: int, output_tokens: int) -> bool:
        """Log token usage for a task."""
        task = self.tasks.get(task_id)
        if task:
            task.token_log = token_log
            task.total_input_tokens = input_tokens
            task.total_output_tokens = output_tokens
            self._save_tasks()
            return True
        return False

    def save_prompt(self, task_id: str, prompt: str) -> bool:
        """Save the full prompt sent to agent for this task."""
        task = self.tasks.get(task_id)
        if task:
            task.prompt_sent = prompt
            self._save_tasks()
            return True
        return False

    def review_task(self, task_id: str, approved: bool, notes: str = None) -> bool:
        """QA reviews a completed task."""
        task = self.tasks.get(task_id)
        if task and task.status == TaskStatus.COMPLETED:
            # Track QA review metrics
            _track_qa_review(task_id, task.assignee, approved)
            if approved:
                task.status = TaskStatus.APPROVED
                task.review_notes = notes or "QA Approved"
            else:
                # Send back to original agent for rework
                task.status = TaskStatus.READY
                task.review_notes = notes or "QA: Needs revision"
                # Track rejection
                _track_rejected(task_id, task.assignee)
            self._save_tasks()
            return True
        return False

    def _update_dependents(self, completed_task_id: str):
        """Check if any pending tasks can now be started."""
        for task in self.tasks.values():
            if task.status == TaskStatus.PENDING:
                if completed_task_id in task.dependencies:
                    # Check if ALL dependencies are now completed/approved
                    all_done = all(
                        self.tasks.get(dep_id) and
                        self.tasks[dep_id].status in (TaskStatus.COMPLETED, TaskStatus.APPROVED)
                        for dep_id in task.dependencies
                    )
                    if all_done:
                        task.status = TaskStatus.READY

    def _block_dependents(self, failed_task_id: str):
        """Block tasks that depend on a failed task."""
        for task in self.tasks.values():
            if failed_task_id in task.dependencies:
                if task.status in (TaskStatus.PENDING, TaskStatus.READY):
                    task.status = TaskStatus.BLOCKED

    def get_all_tasks(self) -> list[Task]:
        """Get all tasks."""
        return list(self.tasks.values())

    def get_status_summary(self) -> dict:
        """Get count of tasks by status."""
        summary = {s.value: 0 for s in TaskStatus}
        for task in self.tasks.values():
            summary[task.status.value] += 1
        return summary

    def clear(self):
        """Clear all tasks."""
        self.tasks.clear()
        self._counter = 0
        self._save_tasks()

    def clear_completed(self):
        """Clear only approved/completed tasks, keep active ones."""
        to_remove = [
            task_id for task_id, task in self.tasks.items()
            if task.status in (TaskStatus.APPROVED, TaskStatus.COMPLETED, TaskStatus.FAILED)
        ]
        for task_id in to_remove:
            del self.tasks[task_id]
        self._save_tasks()
        return len(to_remove)

    def cancel_task(self, task_id: str) -> bool:
        """Cancel a task (remove it from the system)."""
        if task_id in self.tasks:
            del self.tasks[task_id]
            self._save_tasks()
            return True
        return False

    def retry_task(self, task_id: str) -> bool:
        """Retry a failed/error task by resetting it to READY."""
        task = self.tasks.get(task_id)
        if task and task.status in (TaskStatus.FAILED, TaskStatus.ERROR):
            task.status = TaskStatus.READY
            task.error = None
            task.result = None
            task.retry_count = 0
            task.started_at = None
            task.completed_at = None
            self._save_tasks()
            return True
        return False

    def delete_task(self, task_id: str) -> bool:
        """Delete a task (only allowed for APPROVED/FAILED/ERROR tasks)."""
        task = self.tasks.get(task_id)
        if task and task.status in (TaskStatus.APPROVED, TaskStatus.FAILED, TaskStatus.ERROR):
            del self.tasks[task_id]
            self._save_tasks()
            return True
        return False

    def reset_in_progress_tasks(self) -> list[str]:
        """
        Reset all IN_PROGRESS tasks to READY on server startup.

        If the server crashes mid-task, agents lose context. Stale IN_PROGRESS
        tasks block the queue, so we reset them to READY with retry_count=0.
        Does NOT touch COMPLETED/APPROVED/ERROR tasks.

        Returns list of task IDs that were reset.
        """
        reset_ids = []
        for task in self.tasks.values():
            if task.status == TaskStatus.IN_PROGRESS:
                task.status = TaskStatus.READY
                task.retry_count = 0
                task.started_at = None  # Clear stale start time
                reset_ids.append(task.id)
                print(f"[Tasks] Reset stale IN_PROGRESS task {task.id} -> READY")

        if reset_ids:
            self._save_tasks()
            print(f"[Tasks] Reset {len(reset_ids)} stale tasks on startup: {reset_ids}")

        return reset_ids

    def to_context_string(self) -> str:
        """Format ALL tasks for agent context."""
        if not self.tasks:
            return "No tasks yet."

        lines = ["Current Tasks:"]
        for task in self.tasks.values():
            deps = f" (after: {', '.join(task.dependencies)})" if task.dependencies else ""
            lines.append(
                f"  [{task.id}] {task.status.value.upper()} - {task.assignee or 'Unassigned'}: "
                f"{task.description}{deps}"
            )
            if task.result:
                preview = task.result[:100] + "..." if len(task.result) > 100 else task.result
                lines.append(f"         Result: {preview}")
        return "\n".join(lines)

    def to_active_context_string(self) -> str:
        """Format only ACTIVE tasks (not approved/failed) - saves tokens."""
        active_statuses = {TaskStatus.PENDING, TaskStatus.READY, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED}
        active_tasks = [t for t in self.tasks.values() if t.status in active_statuses]

        if not active_tasks:
            return "No active tasks."

        lines = [f"Active Tasks ({len(active_tasks)}):"]
        for task in active_tasks:
            deps = f" (after: {', '.join(task.dependencies)})" if task.dependencies else ""
            lines.append(
                f"  [{task.id}] {task.status.value.upper()} - {task.assignee or 'Unassigned'}: "
                f"{task.description[:80]}{deps}"
            )

        return "\n".join(lines)

    def archive_old_tasks(self, keep_recent: int = 10) -> int:
        """
        Archive completed tasks to reduce context size.
        Keeps the most recent `keep_recent` approved/failed tasks, archives the rest.
        Returns number of tasks archived.
        """
        # Statuses to archive
        archive_statuses = {TaskStatus.APPROVED, TaskStatus.FAILED, TaskStatus.ERROR}

        # Separate active from archivable
        archivable = [t for t in self.tasks.values() if t.status in archive_statuses]

        if len(archivable) <= keep_recent:
            return 0  # Nothing to archive

        # Sort by completed_at, keep most recent
        archivable.sort(key=lambda t: t.completed_at or t.created_at, reverse=True)
        to_archive = archivable[keep_recent:]

        # Load existing archive
        archive_data = []
        if ARCHIVE_FILE.exists():
            try:
                with open(ARCHIVE_FILE, "r") as f:
                    archive_data = json.load(f)
            except (json.JSONDecodeError, IOError):
                archive_data = []

        # Add to archive
        for task in to_archive:
            archive_data.append(task.to_dict())
            del self.tasks[task.id]

        # Save archive
        ARCHIVE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(ARCHIVE_FILE, "w") as f:
            json.dump(archive_data, f, indent=2)

        # Save active tasks
        self._save_tasks()

        print(f"[Tasks] Archived {len(to_archive)} old tasks, kept {keep_recent} recent")
        return len(to_archive)

    def get_archive_stats(self) -> dict:
        """Get stats about archived tasks."""
        if not ARCHIVE_FILE.exists():
            return {"archived_count": 0, "total_tokens": 0}

        try:
            with open(ARCHIVE_FILE, "r") as f:
                archive_data = json.load(f)

            total_tokens = sum(
                (t.get("total_input_tokens", 0) + t.get("total_output_tokens", 0))
                for t in archive_data
            )
            return {
                "archived_count": len(archive_data),
                "total_tokens": total_tokens
            }
        except (json.JSONDecodeError, IOError):
            return {"archived_count": 0, "total_tokens": 0}


# Global task manager
task_manager = TaskManager()
