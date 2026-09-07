"""
BOSS-specific tools for task management.
"""

import json
from pathlib import Path
from studio.core.tasks import task_manager, TaskStatus
from studio.core.hub import hub
from studio.core.suggestions import suggestion_manager, VALID_CATEGORIES
from studio.core.memory import memory_manager

# Projects directory (for CONTEXT.md files)
PROJECTS_DIR = Path(__file__).parent.parent.parent.parent / "projects"

# Logs directory (for raw log search fallback)
LOGS_DIR = Path(__file__).parent.parent.parent.parent / "data" / "logs"


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
                "description": "Agent to assign: Designer, Programmer, Artist, Writer, Taxonomy, Context, QA, or Raw (for direct LLM queries without agent overhead)"
            },
            "agent": {
                "type": "string",
                "description": "(Deprecated alias for assignee - use assignee instead)"
            },
            "dependencies": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of task IDs that must complete before this task can start"
            },
            "backend": {
                "type": "string",
                "description": "LLM backend for Raw tasks: 'gemini' (default, free tier), 'claude_cli' or 'claude' (Pro subscription, no rate limits), 'ollama' (local). Only used when assignee is Raw."
            }
        },
        "required": ["description"]
    }
}


def create_task(description: str = None, assignee: str = None, dependencies: list = None, title: str = None, agent: str = None, backend: str = None) -> str:
    # Support 'title' as alias for 'description' (BOSS sometimes uses it)
    desc = description or title
    if not desc:
        return "Error: description is required"

    # Support 'agent' as alias for 'assignee' (BOSS sometimes uses it)
    assignee = assignee or agent

    # Normalize assignee name to match registered agent names (e.g., "programmer" -> "Programmer")
    if assignee:
        # Special cases: BOSS, QA, and Raw are specific casing
        if assignee.lower() == "boss":
            assignee = "BOSS"
        elif assignee.lower() == "qa":
            assignee = "QA"
        elif assignee.lower() == "raw":
            assignee = "Raw"  # Pseudo-agent for direct LLM queries
        else:
            assignee = assignee.capitalize()

    task = task_manager.create_task(desc, assignee, dependencies, backend=backend)

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
        result_preview = task.output_response[:200] + "..." if task.output_response and len(task.output_response) > 200 else task.output_response
        return (
            f"{task.id} [{task.status.value}]\n"
            f"  Assignee: {task.assignee or 'None'}\n"
            f"  Description: {task.description}\n"
            f"  Dependencies: {task.dependencies or 'None'}\n"
            f"  Result: {result_preview or 'Pending'}"
        )
    else:
        if include_completed:
            return task_manager.to_context_string()
        else:
            return task_manager.to_active_context_string()


# ============ CONTEXT TOOLS ============

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
        project_dir = PROJECTS_DIR / project_id
        if not project_dir.exists():
            available = [p.name for p in PROJECTS_DIR.iterdir() if p.is_dir() and not p.name.startswith("_")]
            return f"Project '{project_id}' not found. Available: {', '.join(available) or 'none'}"
        return f"No CONTEXT.md found for project '{project_id}'."

    try:
        content = context_file.read_text(encoding="utf-8")
        return f"=== CONTEXT: {project_id} ===\n\n{content}"
    except Exception as e:
        return f"Error reading context: {e}"


# ============ ACKNOWLEDGE TOOL ============

ACKNOWLEDGE_SCHEMA = {
    "name": "acknowledge",
    "description": "Acknowledge a message when no action is needed. Use this instead of prose-only responses.",
    "input_schema": {
        "type": "object",
        "properties": {
            "message": {
                "type": "string",
                "description": "Brief acknowledgment message"
            }
        },
        "required": []
    }
}


def acknowledge(message: str = "Acknowledged") -> str:
    """Simple acknowledgment - ensures BOSS always uses a tool."""
    return f"✓ {message}"


# ============ SUGGESTION TOOL ============

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
                "description": "process|architecture|tooling|workflow|documentation|new_skill|feature"
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
    "description": "Add your analysis/opinion to a suggestion's discussion history. Use when completing a suggestion analysis task to record your findings.",
    "input_schema": {
        "type": "object",
        "properties": {
            "suggestion_id": {
                "type": "string",
                "description": "The suggestion ID (e.g., 'S001')"
            },
            "content": {
                "type": "string",
                "description": "Your analysis or opinion (max 1000 chars)"
            }
        },
        "required": ["suggestion_id", "content"]
    }
}


def add_discussion(suggestion_id: str, content: str) -> str:
    """Add Boss's analysis to a suggestion's discussion history."""
    content = (content or "")[:1000]  # Truncate to limit
    if suggestion_manager.add_discussion(suggestion_id, "BOSS", content):
        return f"Added analysis to suggestion {suggestion_id}"
    return f"Failed to add discussion - suggestion {suggestion_id} not found"


def create_suggestion(
    title: str,
    content: str,
    category: str,
    related_tasks: list = None,
    files_mentioned: list = None,
    evidence: str = None
) -> str:
    """Create a suggestion for human review."""
    try:
        suggestion = suggestion_manager.create(
            source_agent="BOSS",
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


# ============ MEMORY TOOL ============

RECALL_MEMORY_SCHEMA = {
    "name": "recall_memory",
    "description": """Search memory tiers for relevant context. Uses AB tiered compression model:
- Tier 0: Recent session messages (most detail)
- Tier 1+: Compressed summaries from older sessions

Falls back to raw logs if no tier matches. Call with no query to see recent memories.""",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search term (keyword match). Examples: 'economy', 'T123', 'inventory bug'. Omit or leave empty for recent memories."
            },
            "max_results": {
                "type": "integer",
                "description": "Max results to return (default: 5)"
            },
            "search_logs": {
                "type": "boolean",
                "description": "Also search raw logs if tiers have no match (default: true)"
            }
        },
        "required": []
    }
}


def recall_memory(query: str = "", max_results: int = 5, search_logs: bool = True) -> str:
    """Search memory tiers for relevant context.

    Uses AB tiered compression model (T256):
    - Tier 0: Recent session messages (accumulated_a = raw, summary_b = compressed)
    - Tier 1+: Higher-level summaries from compression cascade

    Empty query returns recent tier 0 content.
    """
    query = (query or "").strip()

    # Handle empty query - return recent tier 0 content
    if len(query) < 2:
        recent = memory_manager.get_recent(tier_index=0, max_chars=2000)
        if recent:
            lines = ["=== MEMORY RECALL (Tier 0 - recent) ==="]
            lines.append(f"Showing most recent entries\n")
            lines.append(recent)
            return "\n".join(lines)
        else:
            return "No recent memories in Tier 0. Memory is empty."

    # Search across all tiers using AC-Memory
    results = memory_manager.search(query, max_tiers=5)

    if results:
        lines = ["=== MEMORY RECALL ==="]
        lines.append(f"Query: '{query}' | {len(results)} result(s)\n")

        for r in results[:max_results]:
            tier = r.get("tier", 0)
            location = r.get("location", "unknown")
            snippet = r.get("snippet", "")

            lines.append(f"[Tier {tier} - {location}]")
            lines.append(f"  {snippet}")
            lines.append("")

        return "\n".join(lines)

    # Fallback: search raw logs
    if search_logs:
        log_results = _search_logs(query, max_results)
        if log_results:
            return log_results

    return f"No matches for '{query}' in memory tiers" + (" or logs" if search_logs else "")


def _search_logs(query: str, max_results: int) -> str:
    """Search raw logs for query matches."""
    if not LOGS_DIR.exists():
        return ""

    query_lower = query.lower()
    matches = []

    # Search recent logs first (reverse sorted)
    log_files = sorted(LOGS_DIR.glob("*.json"), reverse=True)

    for log_file in log_files[:7]:  # Last 7 days max
        try:
            with open(log_file, encoding="utf-8") as f:
                entries = json.load(f)

            for entry in entries:
                msg = entry.get("message", "")
                if query_lower in msg.lower():
                    matches.append({
                        "date": log_file.stem,
                        "time": entry.get("timestamp", "")[:19],
                        "speaker": entry.get("speaker", "?"),
                        "message": msg[:200] + "..." if len(msg) > 200 else msg,
                    })

                    if len(matches) >= max_results:
                        break
        except (json.JSONDecodeError, IOError):
            continue

        if len(matches) >= max_results:
            break

    if not matches:
        return ""

    lines = ["=== MEMORY RECALL (LOGS tier) ==="]
    lines.append(f"Query: '{query}' | {len(matches)} result(s)\n")

    for m in matches:
        lines.append(f"[{m['date']} {m['time'][11:]}] {m['speaker']}")
        lines.append(f"  {m['message']}")
        lines.append("")

    return "\n".join(lines)


# Tool bundle
TOOLS = [
    CREATE_TASK_SCHEMA,
    GET_TASK_STATUS_SCHEMA,
    READ_CONTEXT_SCHEMA,
    ACKNOWLEDGE_SCHEMA,
    CREATE_SUGGESTION_SCHEMA,
    ADD_DISCUSSION_SCHEMA,
    RECALL_MEMORY_SCHEMA,
]

HANDLERS = {
    "create_task": create_task,
    "get_task_status": get_task_status,
    "read_context": read_context,
    "acknowledge": acknowledge,
    "create_suggestion": create_suggestion,
    "add_discussion": add_discussion,
    "recall_memory": recall_memory,
}
