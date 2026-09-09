"""
Task Management System for the Game Studio.

Tasks flow:
1. BOSS receives user request
2. BOSS breaks it into tasks with dependencies
3. Tasks are assigned to agents
4. Agents execute tasks (parallel where possible)
5. Completed tasks are auto-approved
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from pathlib import Path
import json

from .paths import get_base_path


# Stale task threshold: if a task is IN_PROGRESS for longer than this, recover it
STALE_TASK_MINUTES = 35  # 30 min timeout + 5 min grace

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

def _track_failed(task_id: str, assignee: Optional[str], reason: str):
    try:
        from studio.core.studio_metrics import track_task_failed
        track_task_failed(task_id, assignee, reason)
    except ImportError:
        pass


def _log_to_memory(task_id: str, task: "Task", outcome: str):
    """Log completed/failed task to memory hot tier (T248)."""
    try:
        from studio.core.memory import memory_manager

        # Extract tags from description (simple keyword extraction)
        desc_lower = task.description.lower()
        tags = []
        keywords = ["fix", "add", "create", "update", "refactor", "test", "review", "implement"]
        for kw in keywords:
            if kw in desc_lower:
                tags.append(kw)

        # Add agent as tag
        if task.assignee:
            tags.append(task.assignee.lower())

        memory_manager.add_hot(
            content=f"[{task_id}] {task.description[:200]}",
            source="task",
            tags=tags,
            task_ids=[task_id],
            agent=task.assignee,
            outcome=outcome,
        )
    except ImportError:
        pass  # Memory module not available
    except Exception as e:
        print(f"[Tasks] Failed to log to memory: {e}")

# Default paths (used when no project is active)
# Actual paths are resolved dynamically via TaskManager._get_tasks_file() etc.
DEFAULT_TASKS_FILE = Path(__file__).parent.parent.parent / "data" / "tasks.json"
DEFAULT_ARCHIVE_FILE = Path(__file__).parent.parent.parent / "data" / "tasks_archive.json"
DEFAULT_DELIVERABLES_DIR = Path(__file__).parent.parent.parent / "data" / "deliverables"

# Legacy module-level paths for backwards compatibility
# NOTE: These are deprecated - use task_manager methods instead
TASKS_FILE = DEFAULT_TASKS_FILE
ARCHIVE_FILE = DEFAULT_ARCHIVE_FILE
DELIVERABLES_DIR = DEFAULT_DELIVERABLES_DIR


def save_deliverable(task_id: str, content: str, description: str = "", project_name: Optional[str] = None) -> bool:
    """
    Save task deliverable to data/deliverables/T###.md.

    Preserves deliverable content permanently for reference and training data.

    T332: Project-aware paths - when project is active, saves to
    projects/<project_id>/deliverables/T###.md

    Args:
        task_id: Task ID (e.g., "T163")
        content: The deliverable content (agent's response)
        description: Optional task description for the header
        project_name: Optional project folder name for project-specific storage

    Returns:
        True if saved successfully, False otherwise
    """
    try:
        # T332: Use project-aware path
        base = get_base_path(project_name)
        deliverables_dir = base / "deliverables"
        deliverables_dir.mkdir(parents=True, exist_ok=True)
        filepath = deliverables_dir / f"{task_id}.md"

        # Format with metadata header
        header = f"# {task_id} Deliverable\n\n"
        if description:
            header += f"> {description[:200]}{'...' if len(description) > 200 else ''}\n\n"
        header += f"*Completed: {datetime.now().isoformat()}*\n\n---\n\n"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(header + content)

        print(f"[Tasks] Saved deliverable: {filepath}")
        return True
    except Exception as e:
        print(f"[Tasks] Failed to save deliverable {task_id}: {e}")
        return False


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
    """
    Task data schema (T115 refactor):

    Core fields: id, description, assignee, status, dependencies

    input: Raw content injected into agent context
        - role_md: Agent's role.md content
        - skills: Combined skills content
        - task_prompt: The trigger/task description sent

    output: What the agent produced
        - response: Full agent response text

    execution: Runtime metrics
        - steps: List of checkpoints
        - errors: Tool errors encountered
        - duration_ms: Total time
        - num_turns: LLM conversation turns
        - num_tool_uses: Tool invocations
        - api_retries: Rate limit retries

    cost: Token and USD tracking
        - input_tokens: Tokens sent
        - output_tokens: Tokens received
        - cache_creation_tokens: Cache write tokens
        - cache_read_tokens: Cache read tokens
        - cost_usd: Actual API cost
    """
    id: str
    description: str
    assignee: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    dependencies: list[str] = field(default_factory=list)

    # Timestamps
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # Claim tracking (for stale task recovery)
    claimed_by: Optional[str] = None
    claimed_at: Optional[datetime] = None

    # Retry tracking
    retry_count: int = 0
    error: Optional[str] = None

    # Backend selection (for Raw pseudo-agent)
    backend: Optional[str] = None  # e.g., "gemini", "ollama", "openai"

    # === NEW NESTED SCHEMA (T115) ===

    # input: Raw content injected into agent
    input_role_md: Optional[str] = None        # Agent's role.md content
    input_skills: Optional[str] = None          # Combined skills content
    input_task_prompt: Optional[str] = None     # Trigger message sent

    # output: What the agent produced
    output_response: Optional[str] = None       # Full agent response

    # execution: Runtime metrics
    exec_steps: list[dict] = field(default_factory=list)       # [{timestamp, description, tokens}]
    exec_errors: list[str] = field(default_factory=list)       # Tool errors
    exec_duration_ms: int = 0
    exec_num_turns: int = 0
    exec_num_tool_uses: int = 0
    exec_api_retries: int = 0
    exec_is_error: bool = False
    exec_error_message: Optional[str] = None
    exec_context_injected: dict[str, int] = field(default_factory=dict)  # T215: {role_md, skills, context_md, task_prompt} char counts

    # cost: Token and USD tracking
    cost_input_tokens: int = 0
    cost_output_tokens: int = 0
    cost_cache_creation_tokens: int = 0
    cost_cache_read_tokens: int = 0
    cost_usd: float = 0.0

    # === LEGACY FIELDS (for migration compatibility) ===
    # These will be removed after migration is complete
    # result field REMOVED per T207 - use output_response instead
    total_input_tokens: int = 0                # -> cost_input_tokens
    total_output_tokens: int = 0               # -> cost_output_tokens
    token_log: list[dict] = field(default_factory=list)
    api_retries: int = 0                       # -> exec_api_retries
    tool_errors: list[str] = field(default_factory=list)  # -> exec_errors
    cost_usd_legacy: float = 0.0               # -> cost_usd (rename collision)
    duration_ms: int = 0                       # -> exec_duration_ms
    num_turns: int = 0                         # -> exec_num_turns
    cache_creation_tokens: int = 0             # -> cost_cache_creation_tokens
    cache_read_tokens: int = 0                 # -> cost_cache_read_tokens
    is_error: bool = False                     # -> exec_is_error
    error_message: Optional[str] = None        # -> exec_error_message
    num_tool_uses: int = 0                     # -> exec_num_tool_uses
    prompt_sent: Optional[str] = None          # -> input_task_prompt (different purpose)
    full_prompt_length: int = 0                # -> can compute from input_*
    system_prompt_length: int = 0              # -> can compute from input_role_md
    tool_count: int = 0                        # -> kept for now
    message_count: int = 0                     # -> kept for now
    estimated_context_tokens: int = 0          # -> can compute
    steps: list[dict] = field(default_factory=list)  # -> exec_steps

    def to_dict(self) -> dict:
        """Serialize task to optimized slim schema (T199).

        Optimized for ~97% size reduction:
        - Removed: input.role_md, input.skills, input.task_prompt (huge, redundant)
        - Removed: result duplicate, token_log, legacy flat fields
        - Kept: core fields, cost.*, execution.errors only
        - Added: friction.category, outcome enums (for taxonomy analysis)
        """
        return {
            # Core fields
            "id": self.id,
            "description": self.description,
            "assignee": self.assignee,
            "status": self.status.value,
            "dependencies": self.dependencies,
            "error": self.error,
            "retry_count": self.retry_count,
            "backend": self.backend,

            # Timestamps
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,

            # Execution: errors + context metrics
            "execution": {
                "errors": self.exec_errors or self.tool_errors,
                "context_injected": self.exec_context_injected,  # T215: char counts per input source
            },

            # Cost tracking (full - needed for optimization)
            "cost": {
                "input_tokens": self.cost_input_tokens or self.total_input_tokens,
                "output_tokens": self.cost_output_tokens or self.total_output_tokens,
                "cache_creation_tokens": self.cost_cache_creation_tokens or self.cache_creation_tokens,
                "cache_read_tokens": self.cost_cache_read_tokens or self.cache_read_tokens,
                "usd": self.cost_usd,
            },

            # Friction category (T207) - computed from execution state
            "friction": self._compute_friction_category(),
        }

    def _compute_friction_category(self) -> Optional[str]:
        """Derive friction category from execution data (T207).

        Categories enable filtering archived tasks by problem type:
        - 'error': Task failed/errored (infrastructure issues)
        - 'retry': retry_count > 0 (flaky tasks)
        - 'tool_error': exec_errors not empty (tool reliability)
        - 'high_cost': cost_usd > 1.0 (optimization targets)
        - None: Clean execution (baseline)
        """
        if self.exec_is_error or self.error or self.status in (TaskStatus.FAILED, TaskStatus.ERROR):
            return "error"
        if self.retry_count > 0:
            return "retry"
        if self.exec_errors or self.tool_errors:
            return "tool_error"
        if self.cost_usd > 1.0:
            return "high_cost"
        return None

    def to_archive_dict(self) -> dict:
        """Compressed archive schema (T230 spec).

        ~72% size reduction vs to_dict():
        - id: task id
        - desc: description truncated to 100 chars
        - agent: assignee
        - outcome: ok|fail|error
        - at: ISO timestamp (completed_at or created_at)
        - tokens: {in, out, usd}
        - friction: low|medium|high|null
        """
        # Map status to outcome
        if self.status in (TaskStatus.COMPLETED, TaskStatus.APPROVED):
            outcome = "ok"
        elif self.status == TaskStatus.ERROR:
            outcome = "error"
        else:  # FAILED, BLOCKED, or unexpected
            outcome = "fail"

        # Map friction category to severity level
        friction_category = self._compute_friction_category()
        if friction_category is None:
            friction = None
        elif friction_category == "error":
            friction = "high"
        elif friction_category in ("retry", "tool_error"):
            friction = "medium"
        else:  # high_cost or unknown
            friction = "low"

        return {
            "id": self.id,
            "desc": self.description[:100],
            "agent": self.assignee,
            "outcome": outcome,
            "at": (self.completed_at or self.created_at).isoformat(),
            "tokens": {
                "in": self.cost_input_tokens or self.total_input_tokens,
                "out": self.cost_output_tokens or self.total_output_tokens,
                "usd": self.cost_usd,
            },
            "friction": friction,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Task":
        """Deserialize task from dict, supporting both old and new schema."""
        # Extract nested structures (new schema) or use defaults
        input_data = data.get("input", {})
        output_data = data.get("output", {})
        execution_data = data.get("execution", {})
        cost_data = data.get("cost", {})

        return cls(
            # Core fields
            id=data["id"],
            description=data["description"],
            assignee=data.get("assignee"),
            status=TaskStatus(data["status"]),
            dependencies=data.get("dependencies", []),
            error=data.get("error"),
            retry_count=data.get("retry_count", 0),
            backend=data.get("backend"),

            # Timestamps
            created_at=datetime.fromisoformat(data["created_at"]),
            started_at=datetime.fromisoformat(data["started_at"]) if data.get("started_at") else None,
            completed_at=datetime.fromisoformat(data["completed_at"]) if data.get("completed_at") else None,
            claimed_by=data.get("claimed_by"),
            claimed_at=datetime.fromisoformat(data["claimed_at"]) if data.get("claimed_at") else None,

            # NEW: Input (raw content)
            input_role_md=input_data.get("role_md"),
            input_skills=input_data.get("skills"),
            input_task_prompt=input_data.get("task_prompt"),

            # NEW: Output
            output_response=output_data.get("response"),

            # NEW: Execution metrics
            exec_steps=execution_data.get("steps", []),
            exec_errors=execution_data.get("errors", []),
            exec_duration_ms=execution_data.get("duration_ms", 0),
            exec_num_turns=execution_data.get("num_turns", 0),
            exec_num_tool_uses=execution_data.get("num_tool_uses", 0),
            exec_api_retries=execution_data.get("api_retries", 0),
            exec_is_error=execution_data.get("is_error", False),
            exec_error_message=execution_data.get("error_message"),
            exec_context_injected=execution_data.get("context_injected", {}),  # T215

            # NEW: Cost tracking
            cost_input_tokens=cost_data.get("input_tokens", 0),
            cost_output_tokens=cost_data.get("output_tokens", 0),
            cost_cache_creation_tokens=cost_data.get("cache_creation_tokens", 0),
            cost_cache_read_tokens=cost_data.get("cache_read_tokens", 0),
            cost_usd=cost_data.get("usd", 0.0),

            # LEGACY: Load from flat fields for backwards compatibility
            # result field REMOVED per T207 - backwards compat via output_response
            total_input_tokens=data.get("total_input_tokens", 0),
            total_output_tokens=data.get("total_output_tokens", 0),
            token_log=data.get("token_log", []),
            api_retries=data.get("api_retries", 0),
            tool_errors=data.get("tool_errors", []),
            duration_ms=data.get("duration_ms", 0),
            num_turns=data.get("num_turns", 0),
            cache_creation_tokens=data.get("cache_creation_tokens", 0),
            cache_read_tokens=data.get("cache_read_tokens", 0),
            is_error=data.get("is_error", False),
            error_message=data.get("error_message"),
            num_tool_uses=data.get("num_tool_uses", 0),
            prompt_sent=data.get("prompt_sent"),
            full_prompt_length=data.get("full_prompt_length", 0),
            system_prompt_length=data.get("system_prompt_length", 0),
            tool_count=data.get("tool_count", 0),
            message_count=data.get("message_count", 0),
            estimated_context_tokens=data.get("estimated_context_tokens", 0),
            steps=data.get("steps", []),
        )


class TaskManager:
    """Manages task lifecycle and dependencies.

    T332: Supports project-aware paths. When _project_name is set,
    tasks are stored in projects/<name>/tasks.json instead of data/tasks.json.
    """

    def __init__(self, project_name: Optional[str] = None):
        self._project_name = project_name
        self.tasks: dict[str, Task] = {}
        self._counter = 0
        self._load_tasks()
        # Reset any stale IN_PROGRESS tasks from previous crash
        self.reset_in_progress_tasks()

    def _get_tasks_file(self) -> Path:
        """Get tasks.json path for current project context.

        T332: Routes to projects/<project_id>/tasks.json when project is active,
        otherwise uses data/tasks.json.
        """
        base = get_base_path(self._project_name)
        return base / "tasks.json"

    def _get_archive_file(self) -> Path:
        """Get tasks_archive.json path for current project context.

        T332: Routes to projects/<project_id>/tasks_archive.json when project is active,
        otherwise uses data/tasks_archive.json.
        """
        base = get_base_path(self._project_name)
        return base / "tasks_archive.json"

    def _get_deliverables_dir(self) -> Path:
        """Get deliverables directory for current project context.

        T332: Routes to projects/<project_id>/deliverables/ when project is active,
        otherwise uses data/deliverables/.
        """
        base = get_base_path(self._project_name)
        return base / "deliverables"

    def set_project(self, project_name: Optional[str]):
        """Switch to a different project's task storage.

        T332: When user switches projects, this method:
        1. Saves current tasks to current project path
        2. Updates _project_name
        3. Reloads tasks from new project path
        4. Resets any stale IN_PROGRESS tasks

        Args:
            project_name: Project folder name (e.g., "P001"), or None for default.
        """
        if project_name == self._project_name:
            return  # No change

        # Save current tasks before switching (if any loaded)
        if self.tasks:
            self._save_tasks()

        self._project_name = project_name
        self.tasks.clear()
        self._counter = 0
        self._load_tasks()
        self.reset_in_progress_tasks()
        print(f"[Tasks] Switched to project: {project_name or 'default'}")

    def _load_tasks(self):
        """Load tasks from file.

        T332: Uses project-aware path via _get_tasks_file().
        """
        tasks_file = self._get_tasks_file()
        if tasks_file.exists():
            try:
                with open(tasks_file) as f:
                    data = json.load(f)
                for task_data in data.get("tasks", []):
                    task = Task.from_dict(task_data)
                    self.tasks[task.id] = task
                self._counter = data.get("counter", 0)
                print(f"[Tasks] Loaded {len(self.tasks)} tasks from {tasks_file}")
            except Exception as e:
                print(f"[Tasks] Failed to load from {tasks_file}: {e}")

    def _save_tasks(self):
        """Save tasks to file.

        T332: Uses project-aware path via _get_tasks_file().
        """
        tasks_file = self._get_tasks_file()
        try:
            tasks_file.parent.mkdir(parents=True, exist_ok=True)
            data = {
                "counter": self._counter,
                "tasks": [t.to_dict() for t in self.tasks.values()]
            }
            with open(tasks_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"[Tasks] Failed to save to {tasks_file}: {e}")

    def create_task(
        self,
        description: str,
        assignee: str = None,
        dependencies: list[str] = None,
        backend: str = None,
    ) -> Task:
        """Create a new task."""
        self._counter += 1
        task_id = f"T{self._counter:03d}"

        task = Task(
            id=task_id,
            description=description,
            assignee=assignee,
            dependencies=dependencies or [],
            backend=backend,
        )

        # Check if ready immediately (no dependencies or all dependencies already satisfied)
        if not task.dependencies:
            task.status = TaskStatus.READY
        elif self._all_dependencies_satisfied(task.dependencies):
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
        # Raw pseudo-agent allows short prompts (e.g., "Say hello")
        if len(desc) < 10 and task.assignee != "Raw":
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

    def start_task(self, task_id: str, claimed_by: str = None) -> bool:
        """Mark task as in progress and record claim."""
        task = self.tasks.get(task_id)
        if task and task.status == TaskStatus.READY:
            task.status = TaskStatus.IN_PROGRESS
            task.started_at = datetime.now()
            task.claimed_by = claimed_by or task.assignee
            task.claimed_at = datetime.now()
            self._save_tasks()
            return True
        return False

    def reset_task(self, task_id: str) -> bool:
        """Reset task back to READY (for retries after errors)."""
        task = self.tasks.get(task_id)
        if task and task.status == TaskStatus.IN_PROGRESS:
            task.status = TaskStatus.READY
            task.started_at = None
            task.claimed_by = None
            task.claimed_at = None
            self._save_tasks()
            return True
        return False

    def complete_task(self, task_id: str, result: str) -> bool:
        """Mark task as completed (approved) with result. No review gate."""
        task = self.tasks.get(task_id)
        if task and task.status == TaskStatus.IN_PROGRESS:
            task.status = TaskStatus.APPROVED  # Direct to approved, no review loop
            # Store in output_response (T115/T207)
            task.output_response = result
            task.completed_at = datetime.now()
            self._update_dependents(task_id)
            self._save_tasks()
            # Track metrics
            _track_completed(task_id, task.assignee)
            # T163/T332: Save deliverable (project-aware path)
            save_deliverable(task_id, result, task.description, self._project_name)
            # T248: Log to memory hot tier
            _log_to_memory(task_id, task, "success")
            return True
        return False

    def fail_task(self, task_id: str, reason: str) -> bool:
        """Mark task as failed."""
        task = self.tasks.get(task_id)
        if task:
            task.status = TaskStatus.FAILED
            task.error = reason
            task.completed_at = datetime.now()
            self._block_dependents(task_id)
            self._save_tasks()
            # Track metrics
            _track_failed(task_id, task.assignee, reason)
            # T248: Log to memory hot tier
            _log_to_memory(task_id, task, "failure")
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

    def log_tokens(self, task_id: str, input_tokens: int, output_tokens: int, token_log: list[dict] = None) -> bool:
        """Log token usage for a task with optional substep breakdown."""
        task = self.tasks.get(task_id)
        if task:
            # NEW: Use cost_ fields (T115)
            task.cost_input_tokens = input_tokens
            task.cost_output_tokens = output_tokens

            # LEGACY: Keep old fields populated
            task.total_input_tokens = input_tokens
            task.total_output_tokens = output_tokens
            if token_log:
                task.token_log = token_log
            self._save_tasks()
            return True
        return False

    def log_step(self, task_id: str, description: str, tokens_used: int = 0) -> bool:
        """Log a checkpoint step for a task. Called by agents at key progress points."""
        task = self.tasks.get(task_id)
        if task:
            step = {
                "timestamp": datetime.now().isoformat(),
                "description": description,
                "tokens": tokens_used
            }
            task.steps.append(step)
            self._save_tasks()
            return True
        return False

    def log_quality_metrics(self, task_id: str, metrics: dict) -> bool:
        """Log quality metrics from stream-json parsing."""
        task = self.tasks.get(task_id)
        if task:
            # NEW: Use exec_ fields (T115)
            task.exec_api_retries = metrics.get("retries", 0)
            task.exec_errors = metrics.get("tool_errors", [])
            task.exec_duration_ms = metrics.get("duration_ms", 0)
            task.exec_num_turns = metrics.get("num_turns", 0)
            task.exec_num_tool_uses = metrics.get("num_tool_uses", 0)
            task.exec_is_error = metrics.get("is_error", False)
            task.exec_error_message = metrics.get("error_message")

            # NEW: Use cost_ fields (T115)
            task.cost_usd = metrics.get("cost_usd", 0.0)
            task.cost_cache_creation_tokens = metrics.get("cache_creation_input_tokens", 0)
            task.cost_cache_read_tokens = metrics.get("cache_read_input_tokens", 0)

            # LEGACY: Keep old fields populated for backwards compat
            task.api_retries = task.exec_api_retries
            task.tool_errors = task.exec_errors
            task.duration_ms = task.exec_duration_ms
            task.num_turns = task.exec_num_turns
            task.cache_creation_tokens = task.cost_cache_creation_tokens
            task.cache_read_tokens = task.cost_cache_read_tokens
            task.is_error = task.exec_is_error
            task.error_message = task.exec_error_message
            task.num_tool_uses = task.exec_num_tool_uses

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

    def log_input(self, task_id: str, role_md: str, skills: str, task_prompt: str) -> bool:
        """Log raw input content injected into agent (T115)."""
        task = self.tasks.get(task_id)
        if task:
            task.input_role_md = role_md
            task.input_skills = skills
            task.input_task_prompt = task_prompt
            self._save_tasks()
            return True
        return False

    def log_output(self, task_id: str, response: str) -> bool:
        """Log raw output from agent (T115)."""
        task = self.tasks.get(task_id)
        if task:
            task.output_response = response
            self._save_tasks()
            return True
        return False

    def log_context_metrics(self, task_id: str, metrics: dict) -> bool:
        """Log injected context metrics (T108)."""
        task = self.tasks.get(task_id)
        if task:
            task.full_prompt_length = metrics.get("full_prompt_length", 0)
            task.system_prompt_length = metrics.get("system_prompt_length", 0)
            task.tool_count = metrics.get("tool_count", 0)
            task.message_count = metrics.get("message_count", 0)
            task.estimated_context_tokens = metrics.get("estimated_context_tokens", 0)
            self._save_tasks()
            return True
        return False

    def log_context_injected(self, task_id: str, role_md: str, skills: str, context_md: str, task_prompt: str) -> bool:
        """Log char counts of context injected at dispatch time (T215)."""
        task = self.tasks.get(task_id)
        if task:
            task.exec_context_injected = {
                "role_md": len(role_md) if role_md else 0,
                "skills": len(skills) if skills else 0,
                "context_md": len(context_md) if context_md else 0,
                "task_prompt": len(task_prompt) if task_prompt else 0,
            }
            self._save_tasks()
            return True
        return False

    def _all_dependencies_satisfied(self, dependencies: list[str]) -> bool:
        """Check if all dependencies are already completed/approved (including archived)."""
        for dep_id in dependencies:
            # Check active tasks
            dep_task = self.tasks.get(dep_id)
            if dep_task:
                if dep_task.status not in (TaskStatus.COMPLETED, TaskStatus.APPROVED):
                    return False
                continue

            # Check archive for completed dependencies
            if not self._is_in_archive(dep_id):
                return False  # Dependency not found anywhere

        return True

    def _is_in_archive(self, task_id: str) -> bool:
        """Check if a task ID exists in the archive (completed).

        T332: Uses project-aware path via _get_archive_file().
        """
        archive_file = self._get_archive_file()
        if not archive_file.exists():
            return False
        try:
            with open(archive_file, "r") as f:
                archive_data = json.load(f)
            return any(t.get("id") == task_id for t in archive_data)
        except (json.JSONDecodeError, IOError):
            return False

    def _update_dependents(self, completed_task_id: str):
        """Check if any pending tasks can now be started."""
        for task in self.tasks.values():
            if task.status == TaskStatus.PENDING:
                if completed_task_id in task.dependencies:
                    # Reuse shared logic for consistency
                    if self._all_dependencies_satisfied(task.dependencies):
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
            task.output_response = None
            task.retry_count = 0
            task.started_at = None
            task.completed_at = None
            task.claimed_by = None
            task.claimed_at = None
            self._save_tasks()
            return True
        return False

    def delete_task(self, task_id: str) -> bool:
        """Delete a task. Works for any status - confirmation is handled by UI."""
        task = self.tasks.get(task_id)
        if task:
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
                task.started_at = None
                task.claimed_by = None
                task.claimed_at = None
                reset_ids.append(task.id)
                print(f"[Tasks] Reset stale IN_PROGRESS task {task.id} -> READY")

        if reset_ids:
            self._save_tasks()
            print(f"[Tasks] Reset {len(reset_ids)} stale tasks on startup: {reset_ids}")

        return reset_ids

    def recover_stale_tasks(self) -> list[str]:
        """
        Recover tasks that have been IN_PROGRESS for too long.

        If a task has been claimed for longer than STALE_TASK_MINUTES,
        assume the agent crashed and reset it to READY for re-dispatch.

        Call this periodically (e.g., every tick or every minute).
        Returns list of task IDs that were recovered.
        """
        now = datetime.now()
        threshold = timedelta(minutes=STALE_TASK_MINUTES)
        recovered_ids = []

        for task in self.tasks.values():
            if task.status == TaskStatus.IN_PROGRESS and task.claimed_at:
                elapsed = now - task.claimed_at
                if elapsed > threshold:
                    old_claimer = task.claimed_by
                    task.status = TaskStatus.READY
                    task.started_at = None
                    task.claimed_by = None
                    task.claimed_at = None
                    # Don't reset retry_count - this is a recovery, not a fresh start
                    recovered_ids.append(task.id)
                    print(f"[Tasks] Recovered stale task {task.id} (claimed by {old_claimer} for {elapsed.total_seconds()//60:.0f}min)")

        if recovered_ids:
            self._save_tasks()
            print(f"[Tasks] Recovered {len(recovered_ids)} stale tasks: {recovered_ids}")

        return recovered_ids

    def to_context_string(self) -> str:
        """Format ALL tasks for agent context."""
        if not self.tasks:
            return "No tasks yet."

        lines = ["Current Tasks:"]
        for task in self.tasks.values():
            deps = f" (after: {', '.join(task.dependencies)})" if task.dependencies else ""
            agent = task.assignee or "Unassigned"
            lines.append(
                f"  {task.id}-{agent} ({task.status.value.upper()}): "
                f"{task.description}{deps}"
            )
            if task.output_response:
                preview = task.output_response[:100] + "..." if len(task.output_response) > 100 else task.output_response
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
            agent = task.assignee or "Unassigned"
            lines.append(
                f"  {task.id}-{agent} ({task.status.value.upper()}): "
                f"{task.description[:80]}{deps}"
            )

        return "\n".join(lines)

    def archive_old_tasks(self, keep_recent: int = 10) -> int:
        """
        Archive completed tasks to reduce context size.
        Keeps the most recent `keep_recent` approved/failed tasks, archives the rest.
        Returns number of tasks archived.

        T332: Uses project-aware path via _get_archive_file().
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

        # Load existing archive (project-aware path)
        archive_file = self._get_archive_file()
        archive_data = []
        if archive_file.exists():
            try:
                with open(archive_file, "r") as f:
                    archive_data = json.load(f)
            except (json.JSONDecodeError, IOError):
                archive_data = []

        # Add to archive (compressed schema per T230)
        for task in to_archive:
            archive_data.append(task.to_archive_dict())
            del self.tasks[task.id]

        # Save archive (project-aware path)
        archive_file.parent.mkdir(parents=True, exist_ok=True)
        with open(archive_file, "w") as f:
            json.dump(archive_data, f, indent=2)

        # Save active tasks
        self._save_tasks()

        print(f"[Tasks] Archived {len(to_archive)} old tasks, kept {keep_recent} recent")
        return len(to_archive)

    def get_archive_stats(self) -> dict:
        """Get stats about archived tasks (supports both old and compressed schema).

        T332: Uses project-aware path via _get_archive_file().
        """
        archive_file = self._get_archive_file()
        if not archive_file.exists():
            return {"archived_count": 0, "total_tokens": 0, "total_usd": 0.0}

        try:
            with open(archive_file, "r") as f:
                archive_data = json.load(f)

            total_tokens = 0
            total_usd = 0.0
            for t in archive_data:
                # Compressed schema (T230): tokens.in, tokens.out, tokens.usd
                if "tokens" in t:
                    total_tokens += t["tokens"].get("in", 0) + t["tokens"].get("out", 0)
                    total_usd += t["tokens"].get("usd", 0.0)
                # Legacy schema: total_input_tokens, total_output_tokens
                else:
                    total_tokens += t.get("total_input_tokens", 0) + t.get("total_output_tokens", 0)
                    total_usd += t.get("cost", {}).get("usd", 0.0)

            return {
                "archived_count": len(archive_data),
                "total_tokens": total_tokens,
                "total_usd": total_usd
            }
        except (json.JSONDecodeError, IOError):
            return {"archived_count": 0, "total_tokens": 0, "total_usd": 0.0}


# Global task manager
task_manager = TaskManager()
