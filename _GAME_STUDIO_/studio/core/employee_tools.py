"""
Shared tools for all employee agents (non-BOSS).
"""

from pathlib import Path
from typing import Optional
from datetime import datetime
from studio.core.tasks import task_manager, TaskStatus
from studio.core.hub import hub
from studio.core.skill_tracker import track_skill_load
from studio.core.suggestions import suggestion_manager, VALID_CATEGORIES

# Skills directory
SKILLS_DIR = Path(__file__).parent.parent / "skills"
# Projects directory (for CONTEXT.md files)
PROJECTS_DIR = Path(__file__).parent.parent.parent / "projects"

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


# ============ CONTEXT TOOLS (Shared Brain) ============

READ_CONTEXT_SCHEMA = {
    "name": "read_context",
    "description": "Read a project's CONTEXT.md (shared brain). Contains cross-agent signals, decisions, and blockers. NOTE: This reads projects/<project_id>/CONTEXT.md only - NOT for reading studio/docs/ files.",
    "input_schema": {
        "type": "object",
        "properties": {
            "project_id": {
                "type": "string",
                "description": "Project folder name (e.g., 'default'). Reads projects/<project_id>/CONTEXT.md"
            }
        },
        "required": []
    }
}


def read_context(project_id: str = "default") -> str:
    """Read the CONTEXT.md for a project."""
    context_file = PROJECTS_DIR / project_id / "CONTEXT.md"

    if not context_file.exists():
        # Check if project exists at all
        project_dir = PROJECTS_DIR / project_id
        if not project_dir.exists():
            return f"Project '{project_id}' not found. Available: {', '.join(p.name for p in PROJECTS_DIR.iterdir() if p.is_dir() and not p.name.startswith('_'))}"
        return f"No CONTEXT.md found for project '{project_id}'. Create one from projects/_template/CONTEXT.md"

    try:
        content = context_file.read_text(encoding="utf-8")
        return f"=== CONTEXT: {project_id} ===\n\n{content}"
    except Exception as e:
        return f"Error reading context: {e}"


SIGNAL_AGENT_SCHEMA = {
    "name": "signal_agent",
    "description": "Add a cross-agent signal to CONTEXT.md. Use when another agent needs to know something for their work.",
    "input_schema": {
        "type": "object",
        "properties": {
            "to_agent": {
                "type": "string",
                "description": "Target agent (Programmer, Designer, Artist, Writer, QA)"
            },
            "message": {
                "type": "string",
                "description": "What they need to know (be specific)"
            },
            "project_id": {
                "type": "string",
                "description": "Project ID. Defaults to 'default' if not specified."
            }
        },
        "required": ["to_agent", "message"]
    }
}


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


def signal_agent(to_agent: str, message: str, from_agent: str, project_id: str = "default") -> str:
    """Append a signal to CONTEXT.md for another agent."""
    context_file = PROJECTS_DIR / project_id / "CONTEXT.md"

    # Create project dir if needed
    context_file.parent.mkdir(parents=True, exist_ok=True)

    # If no context file, create from template
    if not context_file.exists():
        template = PROJECTS_DIR / "_template" / "CONTEXT.md"
        if template.exists():
            content = template.read_text(encoding="utf-8").replace("{PROJECT_NAME}", project_id)
        else:
            content = f"# Project: {project_id}\n\n## Cross-Agent Signals\n\n"
        context_file.write_text(content, encoding="utf-8")

    # Read current content
    content = context_file.read_text(encoding="utf-8")

    # Format the signal
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    signal = f"- [{from_agent.upper()} -> {to_agent.upper()}] {message} ({timestamp})"

    # Insert after "## Cross-Agent Signals" header
    marker = "## Cross-Agent Signals"
    if marker in content:
        # Find the next section or end of file
        marker_pos = content.find(marker) + len(marker)
        next_section = content.find("\n## ", marker_pos)
        if next_section == -1:
            next_section = len(content)

        # Get the signals section
        before = content[:marker_pos]
        signals_section = content[marker_pos:next_section]
        after = content[next_section:]

        # Append signal
        if signals_section.strip().endswith("- (none yet)"):
            signals_section = "\n\n" + signal + "\n"
        else:
            signals_section = signals_section.rstrip() + "\n" + signal + "\n"

        content = before + signals_section + after
    else:
        # Append at end if no marker
        content += f"\n\n## Cross-Agent Signals\n\n{signal}\n"

    context_file.write_text(content, encoding="utf-8")
    return f"Signal added: {from_agent} -> {to_agent}: {message}"


# Tool bundle - workflow tools removed (server handles pick/complete automatically)
TOOLS = [
    GET_MY_TASKS_SCHEMA,
    LOG_STEP_SCHEMA,
    LOAD_SKILL_SCHEMA,
    LIST_SKILLS_SCHEMA,
    READ_CONTEXT_SCHEMA,
    SIGNAL_AGENT_SCHEMA,
    CREATE_SUGGESTION_SCHEMA,
    ADD_DISCUSSION_SCHEMA,
]


def make_handlers(agent_name: str) -> dict:
    """Create handlers bound to a specific agent."""
    return {
        "get_my_tasks": lambda **kwargs: get_my_tasks(agent_name),
        "log_step": lambda description, tokens_used=0, **kwargs: log_step(description, tokens_used),
        "load_skill": lambda skill_path, **kwargs: load_skill(skill_path, agent_name),
        "list_skills": lambda category="", **kwargs: list_skills(category),
        "read_context": lambda project_id="default", path=None, **kwargs: read_context(path or project_id),
        "signal_agent": lambda to_agent, message, project_id="default", **kwargs: signal_agent(to_agent, message, agent_name, project_id),
        "create_suggestion": lambda title, content, category, related_tasks=None, files_mentioned=None, evidence=None, **kwargs: create_suggestion(
            title, content, category, agent_name, related_tasks, files_mentioned, evidence
        ),
        "add_discussion": lambda suggestion_id, content, **kwargs: add_discussion(suggestion_id, content, agent_name),
    }
