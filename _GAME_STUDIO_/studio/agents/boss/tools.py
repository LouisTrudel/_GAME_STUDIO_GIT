"""
BOSS-specific tools for task management.
"""

import json
import subprocess
import fnmatch
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
# Studio root for file operations
STUDIO_ROOT = Path(__file__).parent.parent.parent.parent


# ============ SEARCH TOOLS ============

SEARCH_FILES_SCHEMA = {
    "name": "search_files",
    "description": "Search for files by name pattern (glob). Use before reading files to find exact paths.",
    "input_schema": {
        "type": "object",
        "properties": {
            "pattern": {
                "type": "string",
                "description": "Glob pattern (e.g., '*.py', '**/config.json', 'studio/**/tools.py')"
            },
            "max_results": {
                "type": "integer",
                "description": "Max files to return (default: 20)"
            }
        },
        "required": ["pattern"]
    }
}


def search_files(pattern: str, max_results: int = 20) -> str:
    """Search for files matching a glob pattern."""
    try:
        matches = list(STUDIO_ROOT.glob(pattern))
        # Filter out __pycache__ and .git
        matches = [m for m in matches if '__pycache__' not in str(m) and '.git' not in str(m)]
        matches = matches[:max_results]

        if not matches:
            return f"No files matching '{pattern}'"

        lines = [f"Found {len(matches)} file(s):"]
        for m in matches:
            rel = m.relative_to(STUDIO_ROOT)
            size = m.stat().st_size if m.is_file() else 0
            lines.append(f"  {rel} ({size} bytes)" if size else f"  {rel}/")

        return "\n".join(lines)
    except Exception as e:
        return f"Search error: {e}"


GREP_SCHEMA = {
    "name": "grep",
    "description": "Search file contents for a pattern. Returns matching lines with file:line format.",
    "input_schema": {
        "type": "object",
        "properties": {
            "pattern": {
                "type": "string",
                "description": "Text or regex pattern to search for"
            },
            "file_pattern": {
                "type": "string",
                "description": "File glob to search in (e.g., '*.py', 'studio/**/*.py'). Default: '**/*.py'"
            },
            "max_results": {
                "type": "integer",
                "description": "Max matches to return (default: 30)"
            }
        },
        "required": ["pattern"]
    }
}


def grep(pattern: str, file_pattern: str = "**/*.py", max_results: int = 30) -> str:
    """Search for pattern in files."""
    try:
        matches = []
        files = list(STUDIO_ROOT.glob(file_pattern))
        files = [f for f in files if f.is_file() and '__pycache__' not in str(f) and '.git' not in str(f)]

        for filepath in files[:100]:  # Limit files to search
            try:
                content = filepath.read_text(encoding='utf-8', errors='ignore')
                for i, line in enumerate(content.split('\n'), 1):
                    if pattern.lower() in line.lower():
                        rel = filepath.relative_to(STUDIO_ROOT)
                        matches.append(f"{rel}:{i}: {line.strip()[:100]}")
                        if len(matches) >= max_results:
                            break
            except Exception:
                continue
            if len(matches) >= max_results:
                break

        if not matches:
            return f"No matches for '{pattern}' in {file_pattern}"

        return f"Found {len(matches)} match(es):\n" + "\n".join(matches)
    except Exception as e:
        return f"Grep error: {e}"


READ_LINES_SCHEMA = {
    "name": "read_lines",
    "description": "Read specific lines from a file. REQUIRED: Always specify start/end lines (max 60 lines per call).",
    "input_schema": {
        "type": "object",
        "properties": {
            "filepath": {
                "type": "string",
                "description": "Path relative to studio root (e.g., 'studio/agent.py')"
            },
            "start_line": {
                "type": "integer",
                "description": "First line to read (1-indexed)"
            },
            "end_line": {
                "type": "integer",
                "description": "Last line to read (max 60 lines from start)"
            }
        },
        "required": ["filepath", "start_line", "end_line"]
    }
}


def read_lines(filepath: str, start_line: int, end_line: int) -> str:
    """Read specific lines from a file."""
    try:
        full_path = STUDIO_ROOT / filepath
        if not full_path.exists():
            return f"File not found: {filepath}"

        # Enforce 60 line limit
        if end_line - start_line > 60:
            end_line = start_line + 60

        content = full_path.read_text(encoding='utf-8', errors='ignore')
        lines = content.split('\n')
        total_lines = len(lines)

        # Bounds check
        start_line = max(1, start_line)
        end_line = min(total_lines, end_line)

        selected = lines[start_line - 1:end_line]
        result = [f"[{filepath} lines {start_line}-{end_line} of {total_lines}]"]
        for i, line in enumerate(selected, start_line):
            result.append(f"{i:4d}| {line}")

        return "\n".join(result)
    except Exception as e:
        return f"Read error: {e}"


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
                "description": "Agent to assign: Design, Code, ArtSpec, Text, Structure, Prompt, Audit, or Raw (for direct LLM queries without agent overhead)"
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
            # Check archive for completed tasks
            archived = task_manager.get_archived_task(task_id)
            if archived:
                desc = archived.get("description", "")[:100]
                result = archived.get("result", "")[:200]
                return (
                    f"{task_id} [ARCHIVED - {archived.get('status', 'completed')}]\n"
                    f"  Assignee: {archived.get('assignee', 'None')}\n"
                    f"  Description: {desc}...\n"
                    f"  Result: {result or 'N/A'}"
                )
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
    hub.post("BOSS", message)
    return f"✓ {message}"


# ============ CLARIFY TOOL ============

CLARIFY_SCHEMA = {
    "name": "clarify",
    "description": "Ask the user for clarification when a request is ambiguous or missing details. Use before creating tasks if requirements are unclear.",
    "input_schema": {
        "type": "object",
        "properties": {
            "question": {
                "type": "string",
                "description": "The clarifying question to ask the user"
            },
            "options": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Optional list of choices to present (e.g., ['Option A', 'Option B'])"
            },
            "context": {
                "type": "string",
                "description": "Brief context about why you need this info"
            }
        },
        "required": ["question"]
    }
}


def clarify(question: str, options: list = None, context: str = None) -> str:
    """Ask user for clarification before proceeding."""
    parts = []
    if context:
        parts.append(f"Context: {context}")
    parts.append(f"❓ {question}")
    if options:
        parts.append("Options: " + " | ".join(options))

    # Post to hub so user sees it
    hub.post("BOSS", "\n".join(parts))
    return "Awaiting user clarification"


# ============ CANCEL TASK TOOL ============

CANCEL_TASK_SCHEMA = {
    "name": "cancel_task",
    "description": "Cancel a pending or in-progress task. Use when a task is no longer needed.",
    "input_schema": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "The task ID to cancel (e.g., 'T001')"
            },
            "reason": {
                "type": "string",
                "description": "Why the task is being cancelled"
            }
        },
        "required": ["task_id"]
    }
}


def cancel_task(task_id: str, reason: str = None) -> str:
    """Cancel an existing task."""
    task = task_manager.get_task(task_id)
    if not task:
        return f"Task {task_id} not found"

    if task.status.value in ("approved", "completed"):
        return f"Cannot cancel {task_id} - already {task.status.value}"

    task_manager.update_task(task_id, status="cancelled")
    msg = f"Cancelled {task_id}"
    if reason:
        msg += f": {reason}"
    hub.post("BOSS", msg)
    return msg


# ============ REASSIGN TASK TOOL ============

REASSIGN_TASK_SCHEMA = {
    "name": "reassign_task",
    "description": "Reassign a task to a different agent.",
    "input_schema": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "The task ID to reassign"
            },
            "new_assignee": {
                "type": "string",
                "description": "New agent: Design, Code, ArtSpec, Text, Structure, Prompt, Audit, Research"
            },
            "reason": {
                "type": "string",
                "description": "Why reassigning (optional)"
            }
        },
        "required": ["task_id", "new_assignee"]
    }
}


def reassign_task(task_id: str, new_assignee: str, reason: str = None) -> str:
    """Reassign a task to a different agent."""
    task = task_manager.get_task(task_id)
    if not task:
        return f"Task {task_id} not found"

    if task.status.value in ("approved", "completed", "cancelled"):
        return f"Cannot reassign {task_id} - status is {task.status.value}"

    old_assignee = task.assignee

    # Normalize assignee name
    if new_assignee.lower() == "boss":
        new_assignee = "BOSS"
    else:
        new_assignee = new_assignee.capitalize()

    task_manager.update_task(task_id, assignee=new_assignee, status="pending")

    msg = f"Reassigned {task_id}: {old_assignee} → {new_assignee}"
    if reason:
        msg += f" ({reason})"
    hub.post("BOSS", f"@{new_assignee} ← {msg}")
    return msg


# ============ DELEGATE CHAIN TOOL ============

DELEGATE_CHAIN_SCHEMA = {
    "name": "delegate_chain",
    "description": "Create multiple dependent tasks in sequence. Each task waits for the previous one to complete.",
    "input_schema": {
        "type": "object",
        "properties": {
            "tasks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "description": {"type": "string"},
                        "assignee": {"type": "string"}
                    },
                    "required": ["description", "assignee"]
                },
                "description": "List of tasks in order. Each depends on the previous."
            },
            "name": {
                "type": "string",
                "description": "Optional name for this task chain"
            }
        },
        "required": ["tasks"]
    }
}


def delegate_chain(tasks: list, name: str = None) -> str:
    """Create a chain of dependent tasks."""
    if not tasks or len(tasks) < 2:
        return "Error: delegate_chain requires at least 2 tasks"

    created = []
    prev_id = None

    for i, t in enumerate(tasks):
        desc = t.get("description", "")
        assignee = t.get("assignee", "")

        # Normalize assignee
        if assignee.lower() == "boss":
            assignee = "BOSS"
        else:
            assignee = assignee.capitalize()

        # Add project context
        project_ctx = _get_active_project_context()
        if project_ctx and "[PROJECT_PATH]" not in desc:
            desc = f"{desc} {project_ctx}"

        # Create with dependency on previous
        deps = [prev_id] if prev_id else None
        task = task_manager.create_task(desc, assignee, deps)
        created.append(task.id)
        prev_id = task.id

    chain_name = name or f"Chain of {len(created)} tasks"
    chain_str = " → ".join(created)
    hub.post("BOSS", f"Created chain '{chain_name}': {chain_str}")

    return f"Created {len(created)} tasks: {chain_str}"


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
    # Search tools (use before reading)
    SEARCH_FILES_SCHEMA,
    GREP_SCHEMA,
    READ_LINES_SCHEMA,
    # Task management
    CREATE_TASK_SCHEMA,
    GET_TASK_STATUS_SCHEMA,
    CANCEL_TASK_SCHEMA,
    REASSIGN_TASK_SCHEMA,
    DELEGATE_CHAIN_SCHEMA,
    # Communication
    ACKNOWLEDGE_SCHEMA,
    CLARIFY_SCHEMA,
    # Memory & suggestions
    RECALL_MEMORY_SCHEMA,
    CREATE_SUGGESTION_SCHEMA,
    ADD_DISCUSSION_SCHEMA,
    # Git
    GIT_COMMIT_SCHEMA,
]

HANDLERS = {
    "search_files": search_files,
    "grep": grep,
    "read_lines": read_lines,
    "create_task": create_task,
    "get_task_status": get_task_status,
    "acknowledge": acknowledge,
    "clarify": clarify,
    "cancel_task": cancel_task,
    "reassign_task": reassign_task,
    "delegate_chain": delegate_chain,
    "create_suggestion": create_suggestion,
    "add_discussion": add_discussion,
    "recall_memory": recall_memory,
    "git_commit": git_commit,
}
