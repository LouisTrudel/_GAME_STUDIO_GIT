"""
Shared tools for all employee agents (non-BOSS).
"""

from pathlib import Path
from typing import Optional
from studio.core.tasks import task_manager, TaskStatus
from studio.core.hub import hub
from studio.core.skill_tracker import track_skill_load

# Skills directory
SKILLS_DIR = Path(__file__).parent.parent / "skills"

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


def get_my_tasks(agent_name: str) -> str:
    """Wrapped to inject agent name."""
    tasks = task_manager.get_agent_tasks(agent_name)
    if not tasks:
        return "You have no assigned tasks."

    lines = [f"Your tasks ({agent_name}):"]
    for task in tasks:
        lines.append(f"  [{task.id}] {task.status.value}: {task.description}")
        if task.review_notes and task.status == TaskStatus.READY:
            lines.append(f"       Feedback: {task.review_notes}")
    return "\n".join(lines)


# NOTE: pick_task and complete_task removed - server handles workflow automatically
# Agents just receive tasks and respond with their work


# ============ SKILL TOOLS ============

LOAD_SKILL_SCHEMA = {
    "name": "load_skill",
    "description": "Load a skill or template into context. Use paths from your router skill (e.g., ':code/roblox/client' or ':templates/remote').",
    "input_schema": {
        "type": "object",
        "properties": {
            "skill_path": {
                "type": "string",
                "description": "Skill path like ':code/roblox/client' or 'templates/datastore'"
            }
        },
        "required": ["skill_path"]
    }
}


def load_skill(skill_path: str, agent_name: str = "unknown") -> str:
    """Load a skill file and return its content. Tracks usage for analytics."""
    # Clean the path - remove leading colon if present
    path = skill_path.lstrip(":")

    # Convert to file path
    skill_file = SKILLS_DIR / path.replace("/", Path("/").anchor and "/" or "\\")

    # Try with .md extension first, then .lua for templates
    if not skill_file.suffix:
        if (skill_file.with_suffix(".md")).exists():
            skill_file = skill_file.with_suffix(".md")
        elif (skill_file.with_suffix(".lua")).exists():
            skill_file = skill_file.with_suffix(".lua")

    if not skill_file.exists():
        # Track failed load
        track_skill_load(skill_path, agent_name, get_current_task(), success=False)
        # Try looking in subdirectories
        possible_paths = list(SKILLS_DIR.rglob(f"{path.split('/')[-1]}.md"))
        if possible_paths:
            return f"Skill not found at '{skill_path}'. Did you mean: {', '.join(str(p.relative_to(SKILLS_DIR)) for p in possible_paths[:3])}"
        return f"Skill not found: {skill_path}"

    try:
        content = skill_file.read_text(encoding="utf-8")
        # Track successful load
        track_skill_load(skill_path, agent_name, get_current_task(), success=True)
        return f"=== SKILL: {skill_path} ===\n\n{content}"
    except Exception as e:
        # Track failed load
        track_skill_load(skill_path, agent_name, get_current_task(), success=False)
        return f"Error loading skill: {e}"


LIST_SKILLS_SCHEMA = {
    "name": "list_skills",
    "description": "List available skills in a category.",
    "input_schema": {
        "type": "object",
        "properties": {
            "category": {
                "type": "string",
                "description": "Category to list (e.g., 'code', 'code/patterns', 'templates'). Leave empty for root categories."
            }
        },
        "required": []
    }
}


def list_skills(category: str = "") -> str:
    """List skills in a category."""
    if category:
        target_dir = SKILLS_DIR / category.replace("/", Path("/").anchor and "/" or "\\")
    else:
        target_dir = SKILLS_DIR

    if not target_dir.exists():
        return f"Category not found: {category}"

    lines = [f"Skills in '{category or 'root'}':"]

    # List subdirectories
    dirs = sorted([d for d in target_dir.iterdir() if d.is_dir() and not d.name.startswith("_")])
    if dirs:
        lines.append("\nCategories:")
        for d in dirs:
            skill_count = len(list(d.rglob("*.md"))) + len(list(d.rglob("*.lua")))
            lines.append(f"  {d.name}/ ({skill_count} files)")

    # List files
    files = sorted([f for f in target_dir.iterdir() if f.is_file() and f.suffix in (".md", ".lua")])
    if files:
        lines.append("\nSkills:")
        for f in files:
            lines.append(f"  :{category + '/' if category else ''}{f.stem}")

    if len(lines) == 1:
        return f"No skills found in '{category or 'root'}'"

    return "\n".join(lines)


# Tool bundle - workflow tools removed (server handles pick/complete automatically)
TOOLS = [
    GET_MY_TASKS_SCHEMA,
    LOAD_SKILL_SCHEMA,
    LIST_SKILLS_SCHEMA,
]


def make_handlers(agent_name: str) -> dict:
    """Create handlers bound to a specific agent."""
    return {
        "get_my_tasks": lambda **kwargs: get_my_tasks(agent_name),
        "load_skill": lambda skill_path, **kwargs: load_skill(skill_path, agent_name),
        "list_skills": lambda category="", **kwargs: list_skills(category),
    }
