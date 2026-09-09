"""
Shared tools for all employee agents (non-BOSS).
"""

from typing import Optional
from studio.core.tasks import task_manager, TaskStatus
from studio.core.hub import hub
from studio.core.suggestions import suggestion_manager, VALID_CATEGORIES

# Thread-local storage for current task context
_current_task_id: Optional[str] = None


def set_current_task(task_id: Optional[str]):
    """Set the current task context for skill tracking."""
    global _current_task_id
    _current_task_id = task_id


def get_current_task() -> Optional[str]:
    """Get the current task context."""
    return _current_task_id


GET_MY_TASKS_SCHEMA = {
    "name": "get_my_tasks",
    "description": "Get all tasks assigned to you.",
    "input_schema": {
        "type": "object",
        "properties": {},
        "required": []
    }
}


LOG_STEP_SCHEMA = {
    "name": "log_step",
    "description": "Log a checkpoint step in your current task. Call this at key progress points to track multi-step execution.",
    "input_schema": {
        "type": "object",
        "properties": {
            "description": {
                "type": "string",
                "description": "What you just completed (e.g., 'Added touch detection to collectible')"
            },
            "tokens_used": {
                "type": "integer",
                "description": "Approximate tokens used for this step (optional, defaults to 0)"
            }
        },
        "required": ["description"]
    }
}


def get_my_tasks(agent_name: str) -> str:
    """Wrapped to inject agent name."""
    tasks = task_manager.get_agent_tasks(agent_name)
    if not tasks:
        return "You have no assigned tasks."

    lines = [f"Your tasks ({agent_name}):"]
    for task in tasks:
        lines.append(f"  [{task.id}] {task.status.value}: {task.description}")
    return "\n".join(lines)


def log_step(description: str, tokens_used: int = 0) -> str:
    """Log a checkpoint step for the current task."""
    task_id = get_current_task()
    if not task_id:
        return "No active task context. Cannot log step."

    success = task_manager.log_step(task_id, description, tokens_used)
    if success:
        return f"Step logged: {description}"
    return f"Failed to log step - task {task_id} not found"


# NOTE: pick_task and complete_task removed - server handles workflow automatically
# Agents just receive tasks and respond with their work


CREATE_SUGGESTION_SCHEMA = {
    "name": "create_suggestion",
    "description": "Create a suggestion for human review in the Learning tab. Use when you notice patterns, issues, or improvements worth surfacing.",
    "input_schema": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Short summary (max 80 chars)"
            },
            "content": {
                "type": "string",
                "description": "Full suggestion text (max 500 chars)"
            },
            "category": {
                "type": "string",
                "enum": list(VALID_CATEGORIES),
                "description": "process|architecture|tooling|workflow|documentation"
            },
            "related_tasks": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Task IDs this relates to (optional)"
            },
            "files_mentioned": {
                "type": "array",
                "items": {"type": "string"},
                "description": "File paths mentioned (optional)"
            },
            "evidence": {
                "type": "string",
                "description": "Supporting evidence or data (optional)"
            }
        },
        "required": ["title", "content", "category"]
    }
}


ADD_DISCUSSION_SCHEMA = {
    "name": "add_discussion",
    "description": "Add your research/analysis to a suggestion's discussion history. Use when completing a suggestion research task to record your findings for Boss to review.",
    "input_schema": {
        "type": "object",
        "properties": {
            "suggestion_id": {
                "type": "string",
                "description": "The suggestion ID (e.g., 'S001')"
            },
            "content": {
                "type": "string",
                "description": "Your research findings or analysis (max 1000 chars)"
            }
        },
        "required": ["suggestion_id", "content"]
    }
}


def add_discussion(suggestion_id: str, content: str, agent_name: str) -> str:
    """Add an agent's analysis to a suggestion's discussion history."""
    content = (content or "")[:1000]  # Truncate to limit
    if suggestion_manager.add_discussion(suggestion_id, agent_name, content):
        return f"Added {agent_name} analysis to suggestion {suggestion_id}"
    return f"Failed to add discussion - suggestion {suggestion_id} not found"


def create_suggestion(
    title: str,
    content: str,
    category: str,
    agent_name: str,
    related_tasks: list = None,
    files_mentioned: list = None,
    evidence: str = None
) -> str:
    """Create a suggestion for human review."""
    try:
        suggestion = suggestion_manager.create(
            source_agent=agent_name,
            title=title,
            content=content,
            category=category,
            related_tasks=related_tasks,
            files_mentioned=files_mentioned,
            evidence=evidence,
        )
        return f"Suggestion created: {suggestion.id} - {suggestion.title}"
    except ValueError as e:
        return f"Failed to create suggestion: {e}"


# Tool bundle
TOOLS = [
    GET_MY_TASKS_SCHEMA,
    LOG_STEP_SCHEMA,
    CREATE_SUGGESTION_SCHEMA,
    ADD_DISCUSSION_SCHEMA,
]


def make_handlers(agent_name: str) -> dict:
    """Create handlers bound to a specific agent."""
    return {
        "get_my_tasks": lambda **kwargs: get_my_tasks(agent_name),
        "log_step": lambda description, tokens_used=0, **kwargs: log_step(description, tokens_used),
        "create_suggestion": lambda title, content, category, related_tasks=None, files_mentioned=None, evidence=None, **kwargs: create_suggestion(
            title, content, category, agent_name, related_tasks, files_mentioned, evidence
        ),
        "add_discussion": lambda suggestion_id, content, **kwargs: add_discussion(suggestion_id, content, agent_name),
    }
