"""
BOSS-specific tools for task management.
"""

import json
from pathlib import Path
from studio.core.tasks import task_manager, TaskStatus
from studio.core.hub import hub
from studio.core.suggestions import suggestion_manager, VALID_CATEGORIES
from studio.core.memory import memory_manager
from studio.core.history import history_manager
from studio.core.projects import project_manager
from studio.routines.git_commit_routine import run_routine as git_commit_routine

# Logs directory (for raw log search fallback)
LOGS_DIR = Path(__file__).parent.parent.parent.parent / "data" / "logs"


def _get_active_project_context() -> str:
    """Get active project path context for task descriptions."""
    project = project_manager.get_active()
    if project and project.path:
        return f"[PROJECT_PATH] {project.path}"
    return ""


CREATE_TASK_SCHEMA = {
    "name": "create_task",
    "description": """Create a new task and assign it to an agent.

Structure your task description for optimal output:
[WHAT] Clear deliverable in imperative form
[CONTEXT] Why this is needed (optional)
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

    # Normalize assignee name to match registered agent names (e.g., "code" -> "Code")
    if assignee:
        # Special cases: BOSS and Raw are specific casing
        if assignee.lower() == "boss":
            assignee = "BOSS"
        elif assignee.lower() == "raw":
            assignee = "Raw"  # Pseudo-agent for direct LLM queries
        else:
            assignee = assignee.capitalize()

    # Inject active project path into description if not already present
    # This ensures agents know where project files should be saved/read
    project_ctx = _get_active_project_context()
    if project_ctx and "[PROJECT_PATH]" not in desc:
        desc = f"{desc} {project_ctx}"

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


# ============ GIT COMMIT TOOL ============

GIT_COMMIT_SCHEMA = {
    "name": "git_commit",
    "description": "Commit and push all staged changes to git. Auto-generates a descriptive commit message based on changed files.",
    "input_schema": {
        "type": "object",
        "properties": {
            "auto_push": {
                "type": "boolean",
                "description": "Push to origin after commit (default: true)"
            },
            "message": {
                "type": "string",
                "description": "Custom commit message (optional, auto-generated if not provided)"
            }
        },
        "required": []
    }
}


def git_commit(auto_push: bool = True, message: str = None) -> str:
    """Execute git commit routine."""
    try:
        result = git_commit_routine(auto_push=auto_push)

        if result.get("error") and not result.get("committed"):
            return f"Git commit skipped: {result['error']}"

        summary = []
        if result.get("committed"):
            commit_line = result.get("commit_message", "").split("\n")[0]
            summary.append(f"Committed: {commit_line}")
        if result.get("pushed"):
            summary.append("Pushed to origin")
        elif result.get("committed") and result.get("error"):
            summary.append(f"Push failed: {result['error']}")

        return "\n".join(summary) if summary else "No changes to commit"
    except Exception as e:
        return f"Git commit failed: {e}"


# ============ MEMORY TOOL ============

RECALL_MEMORY_SCHEMA = {
    "name": "recall_memory",
    "description": """Search memory tiers for relevant context:
- Tier 0: Raw session buffer
- Tier 1-2: Injected into prompts (Recent/Archive)
- Tier 3-10: Reference only (searchable, not auto-injected)

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
    """Search both AC-Memory (bullets) and History (narrative) for context.

    AC-Memory: Tier 0-2 injected, Tier 3-10 reference only
    History: draft → chapter → book → collection (narrative tiers)

    Empty query returns recent content from both systems.
    """
    query = (query or "").strip()
    lines = []

    # Handle empty query - return recent from both systems
    if len(query) < 2:
        lines.append("=== RECENT MEMORY ===\n")

        # AC-Memory recent
        ac_recent = memory_manager.get_recent(index=0, max_chars=1000)
        if ac_recent:
            lines.append("[AC-Memory - Tier 0]")
            lines.append(ac_recent)
            lines.append("")

        # History recent
        hist_recent = history_manager.get_recent("draft", max_chars=1000)
        if hist_recent:
            lines.append("[History - Draft]")
            lines.append(hist_recent)

        if len(lines) == 1:
            return "No recent memories. Both systems empty."

        return "\n".join(lines)

    # Search both systems
    ac_results = memory_manager.search(query, max_tiers=10)
    hist_results = history_manager.search(query)

    if ac_results or hist_results:
        lines.append(f"=== MEMORY RECALL: '{query}' ===\n")

        # AC-Memory results
        for r in ac_results[:max_results]:
            tier = r.get("tier", 0)
            snippet = r.get("snippet", "")
            lines.append(f"[AC-Memory Tier {tier}]")
            lines.append(f"  {snippet}")
            lines.append("")

        # History results
        for r in hist_results[:max_results]:
            tier = r.get("tier", "unknown")
            snippet = r.get("snippet", "")
            lines.append(f"[History - {tier}]")
            lines.append(f"  {snippet}")
            lines.append("")

        return "\n".join(lines)

    # Fallback: search raw logs
    if search_logs:
        log_results = _search_logs(query, max_results)
        if log_results:
            return log_results

    return f"No matches for '{query}' in AC-Memory, History, or logs"


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
    ACKNOWLEDGE_SCHEMA,
    CREATE_SUGGESTION_SCHEMA,
    ADD_DISCUSSION_SCHEMA,
    RECALL_MEMORY_SCHEMA,
    GIT_COMMIT_SCHEMA,
]

HANDLERS = {
    "create_task": create_task,
    "get_task_status": get_task_status,
    "acknowledge": acknowledge,
    "create_suggestion": create_suggestion,
    "add_discussion": add_discussion,
    "recall_memory": recall_memory,
    "git_commit": git_commit,
}
