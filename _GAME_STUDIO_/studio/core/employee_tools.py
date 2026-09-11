"""
Shared tools for all employee agents (non-BOSS).
"""

from pathlib import Path
from studio.core.tasks import task_manager, TaskStatus
from studio.core.hub import hub
from studio.core.suggestions import suggestion_manager, VALID_CATEGORIES
from studio.core.memory import memory_manager
from studio.core.history import history_manager

# Studio root for file operations
STUDIO_ROOT = Path(__file__).parent.parent.parent

GET_MY_TASKS_SCHEMA = {
    "name": "get_my_tasks",
    "description": "Get all tasks assigned to you.",
    "input_schema": {
        "type": "object",
        "properties": {},
        "required": []
    }
}


# LOG_STEP removed - caused extra turns/tokens with no practical benefit
# Step tracking can be re-added if UI displays it


def get_my_tasks(agent_name: str) -> str:
    """Wrapped to inject agent name."""
    tasks = task_manager.get_agent_tasks(agent_name)
    if not tasks:
        return "You have no assigned tasks."

    lines = [f"Your tasks ({agent_name}):"]
    for task in tasks:
        lines.append(f"  [{task.id}] {task.status.value}: {task.description}")
    return "\n".join(lines)




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


# ============ SEARCH TOOLS ============

SEARCH_FILES_SCHEMA = {
    "name": "search_files",
    "description": "Search for files by name pattern (glob). Use before reading files.",
    "input_schema": {
        "type": "object",
        "properties": {
            "pattern": {
                "type": "string",
                "description": "Glob pattern (e.g., '*.py', '**/config.json')"
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
    "description": "Search file contents for a pattern. Returns file:line matches.",
    "input_schema": {
        "type": "object",
        "properties": {
            "pattern": {
                "type": "string",
                "description": "Text pattern to search for"
            },
            "file_pattern": {
                "type": "string",
                "description": "File glob (e.g., '*.py'). Default: '**/*.py'"
            },
            "max_results": {
                "type": "integer",
                "description": "Max matches (default: 30)"
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

        for filepath in files[:100]:
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
    "description": "Read specific lines from a file (max 60 lines per call).",
    "input_schema": {
        "type": "object",
        "properties": {
            "filepath": {
                "type": "string",
                "description": "Path relative to studio root"
            },
            "start_line": {
                "type": "integer",
                "description": "First line (1-indexed)"
            },
            "end_line": {
                "type": "integer",
                "description": "Last line"
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

        if end_line - start_line > 60:
            end_line = start_line + 60

        content = full_path.read_text(encoding='utf-8', errors='ignore')
        lines = content.split('\n')
        total_lines = len(lines)

        start_line = max(1, start_line)
        end_line = min(total_lines, end_line)

        selected = lines[start_line - 1:end_line]
        result = [f"[{filepath} lines {start_line}-{end_line} of {total_lines}]"]
        for i, line in enumerate(selected, start_line):
            result.append(f"{i:4d}| {line}")

        return "\n".join(result)
    except Exception as e:
        return f"Read error: {e}"


# ============ MEMORY TOOL ============

RECALL_MEMORY_SCHEMA = {
    "name": "recall_memory",
    "description": "Search memory tiers for relevant context. Call with no query for recent memories.",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search term (keyword match)"
            },
            "max_results": {
                "type": "integer",
                "description": "Max results (default: 5)"
            }
        },
        "required": []
    }
}


def recall_memory(query: str = "", max_results: int = 5) -> str:
    """Search AC-Memory and History for context."""
    query = (query or "").strip()
    lines = []

    if len(query) < 2:
        # Return recent from both systems
        lines.append("=== RECENT MEMORY ===\n")
        ac_recent = memory_manager.get_recent(index=0, max_chars=1000)
        if ac_recent:
            lines.append("[AC-Memory - Tier 0]")
            lines.append(ac_recent)
            lines.append("")

        hist_recent = history_manager.get_recent("draft", max_chars=1000)
        if hist_recent:
            lines.append("[History - Draft]")
            lines.append(hist_recent)

        if len(lines) == 1:
            return "No recent memories."
        return "\n".join(lines)

    # Search both systems
    ac_results = memory_manager.search(query, max_tiers=10)
    hist_results = history_manager.search(query)

    if ac_results or hist_results:
        lines.append(f"=== MEMORY RECALL: '{query}' ===\n")

        for r in ac_results[:max_results]:
            tier = r.get("tier", 0)
            snippet = r.get("snippet", "")
            lines.append(f"[AC-Memory Tier {tier}]")
            lines.append(f"  {snippet}")
            lines.append("")

        for r in hist_results[:max_results]:
            tier = r.get("tier", "unknown")
            snippet = r.get("snippet", "")
            lines.append(f"[History - {tier}]")
            lines.append(f"  {snippet}")
            lines.append("")

        return "\n".join(lines)

    return f"No matches for '{query}' in memory"


# Tool bundle
TOOLS = [
    # Search tools
    SEARCH_FILES_SCHEMA,
    GREP_SCHEMA,
    READ_LINES_SCHEMA,
    RECALL_MEMORY_SCHEMA,
    # Task tools
    GET_MY_TASKS_SCHEMA,
    CREATE_SUGGESTION_SCHEMA,
    ADD_DISCUSSION_SCHEMA,
]


def make_handlers(agent_name: str) -> dict:
    """Create handlers bound to a specific agent."""
    return {
        "search_files": search_files,
        "grep": grep,
        "read_lines": read_lines,
        "recall_memory": recall_memory,
        "get_my_tasks": lambda **kwargs: get_my_tasks(agent_name),
        "create_suggestion": lambda title, content, category, related_tasks=None, files_mentioned=None, evidence=None, **kwargs: create_suggestion(
            title, content, category, agent_name, related_tasks, files_mentioned, evidence
        ),
        "add_discussion": lambda suggestion_id, content, **kwargs: add_discussion(suggestion_id, content, agent_name),
    }
