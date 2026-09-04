"""
BOSS-specific tools for task management.
"""

from studio.core.tasks import task_manager, TaskStatus
from studio.core.hub import hub


CREATE_TASK_SCHEMA = {
    "name": "create_task",
    "description": """Create a new task and assign it to an agent.

Structure your task description for optimal output:
[WHAT] Clear deliverable in imperative form
[CONTEXT] Why this is needed (optional)
[SKILLS] Recommended skills to load (e.g., :code/economy :code/roblox/server)
[CONSTRAINTS] Must-haves, limits, rules (optional)""",
    "input_schema": {
        "type": "object",
        "properties": {
            "description": {
                "type": "string",
                "description": "Clear description of what needs to be done, including skill hints"
            },
            "title": {
                "type": "string",
                "description": "Short title for the task (optional, use description instead)"
            },
            "assignee": {
                "type": "string",
                "description": "Agent to assign: Designer, Programmer, Artist, Writer, or QA"
            },
            "agent": {
                "type": "string",
                "description": "Alias for assignee"
            },
            "dependencies": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of task IDs that must complete before this task can start"
            }
        },
        "required": ["description"]
    }
}


def create_task(description: str = None, assignee: str = None, dependencies: list = None, title: str = None, agent: str = None) -> str:
    # Support 'title' as alias for 'description' (BOSS sometimes uses it)
    desc = description or title
    if not desc:
        return "Error: description is required"

    # Support 'agent' as alias for 'assignee' (BOSS sometimes uses it)
    assignee = assignee or agent

    # Normalize assignee name to match registered agent names (e.g., "programmer" -> "Programmer")
    if assignee:
        # Special cases: BOSS and QA are uppercase, others are capitalized
        if assignee.lower() == "boss":
            assignee = "BOSS"
        elif assignee.lower() == "qa":
            assignee = "QA"
        else:
            assignee = assignee.capitalize()

    task = task_manager.create_task(desc, assignee, dependencies)

    # Post to hub with @mention
    if assignee:
        hub.post("BOSS", f"@{assignee} → {task.id}: {desc}")

    return f"Created {task.id}: '{desc}' → {assignee or 'Unassigned'} [{task.status.value}]"


GET_TASK_STATUS_SCHEMA = {
    "name": "get_task_status",
    "description": "Get the current status of all tasks or a specific task.",
    "input_schema": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "Specific task ID, or omit for all tasks"
            },
            "include_completed": {
                "type": "boolean",
                "description": "Include APPROVED/FAILED tasks (default: false, only active tasks)"
            }
        },
        "required": []
    }
}


def get_task_status(task_id: str = None, include_completed: bool = False) -> str:
    if task_id:
        task = task_manager.get_task(task_id)
        if not task:
            return f"Task {task_id} not found"
        return (
            f"{task.id} [{task.status.value}]\n"
            f"  Assignee: {task.assignee or 'None'}\n"
            f"  Description: {task.description}\n"
            f"  Dependencies: {task.dependencies or 'None'}\n"
            f"  Result: {task.result or 'Pending'}"
        )
    else:
        if include_completed:
            return task_manager.to_context_string()
        else:
            return task_manager.to_active_context_string()


# Tool bundle
TOOLS = [
    CREATE_TASK_SCHEMA,
    GET_TASK_STATUS_SCHEMA,
]

HANDLERS = {
    "create_task": create_task,
    "get_task_status": get_task_status,
}
