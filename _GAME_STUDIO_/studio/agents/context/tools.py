"""
Context Engineer tools for prompt optimization and review.

Includes session memory summarization (T164) - Context agent maintains
the cumulative session_memory.md file.
"""

import json
import subprocess
from datetime import datetime
from pathlib import Path

# Project root for file operations
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
SESSION_MEMORY_FILE = PROJECT_ROOT / "data" / "session_memory.md"


COUNT_TOKENS_SCHEMA = {
    "name": "count_tokens",
    "description": "Estimate token count for a file or text. Use to check token budgets.",
    "input_schema": {
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "File path relative to project root (e.g., 'studio/agents/designer/role.md')"
            },
            "text": {
                "type": "string",
                "description": "Raw text to count (use instead of path for inline text)"
            }
        }
    }
}


def count_tokens(path: str = None, text: str = None) -> str:
    """Estimate tokens using ~4 chars per token heuristic."""
    if path:
        full_path = PROJECT_ROOT / path
        if not full_path.exists():
            return f"File not found: {path}"
        text = full_path.read_text(encoding="utf-8")

    if not text:
        return "Provide either 'path' or 'text'"

    # Rough estimate: ~4 chars per token for English text
    char_count = len(text)
    token_estimate = char_count // 4
    line_count = text.count('\n') + 1

    return f"~{token_estimate} tokens | {char_count} chars | {line_count} lines"


LIST_ROLES_SCHEMA = {
    "name": "list_roles",
    "description": "List all agent role.md files with token counts.",
    "input_schema": {
        "type": "object",
        "properties": {}
    }
}


def list_roles() -> str:
    """List all agent roles with token estimates."""
    agents_dir = PROJECT_ROOT / "studio" / "agents"

    if not agents_dir.exists():
        return "Agents directory not found"

    results = ["Agent roles:"]

    for agent_dir in sorted(agents_dir.iterdir()):
        if not agent_dir.is_dir():
            continue
        role_file = agent_dir / "role.md"
        if role_file.exists():
            size = role_file.stat().st_size
            tokens = size // 4
            status = "OK" if tokens < 1000 else "OVER BUDGET"
            results.append(f"  - {agent_dir.name}/role.md: ~{tokens} tokens [{status}]")

    return "\n".join(results)


UPDATE_SESSION_MEMORY_SCHEMA = {
    "name": "update_session_memory",
    "description": "Update session_memory.md with cumulative session summary. Called at 50-message intervals. Use 'content' for raw markdown OR structured params (session_overview, active_context, etc).",
    "input_schema": {
        "type": "object",
        "properties": {
            "content": {
                "type": "string",
                "description": "Raw markdown content to write directly (overrides all other params if provided)"
            },
            "session_overview": {
                "type": "string",
                "description": "Current session focus and objectives (bullet points)"
            },
            "key_decisions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "decision": {"type": "string"},
                        "rationale": {"type": "string"},
                        "task": {"type": "string"}
                    }
                },
                "description": "Architectural choices, patterns adopted (max 10)"
            },
            "active_context": {
                "type": "string",
                "description": "In-flight work, blockers, pending items (bullet points)"
            },
            "completed_milestones": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Significant deliverables (max 15)"
            }
        }
    }
}


def update_session_memory(
    content: str = None,
    session_overview: str = None,
    active_context: str = None,
    key_decisions: list = None,
    completed_milestones: list = None
) -> str:
    """Update session_memory.md with cumulative summary (T164).

    Two modes:
    - content: Raw markdown written directly (simple override)
    - structured: session_overview + active_context build formatted markdown

    Backward compatible: structured params still work as before.
    """
    # Mode 1: Raw content override
    if content:
        SESSION_MEMORY_FILE.parent.mkdir(parents=True, exist_ok=True)
        SESSION_MEMORY_FILE.write_text(content, encoding="utf-8")
        # Extract first line for commit message
        first_line = content.split('\n')[0].strip('#- •').strip()[:72]
        _auto_commit_session_memory(first_line or "memory update")
        return f"Session memory updated ({len(content)} chars) [raw content mode]"

    # Mode 2: Structured params (original behavior)
    if not session_overview or not active_context:
        return "Error: Provide 'content' OR both 'session_overview' and 'active_context'"

    key_decisions = key_decisions or []
    completed_milestones = completed_milestones or []

    # Build key decisions table
    if key_decisions:
        decision_rows = []
        for d in key_decisions[-10:]:  # Max 10 decisions
            decision = d.get("decision", "-")
            rationale = d.get("rationale", "-")
            task = d.get("task", "-")
            decision_rows.append(f"| {decision} | {rationale} | {task} |")
        decisions_table = "\n".join(decision_rows)
    else:
        decisions_table = "| - | - | - |"

    # Build milestones list
    if completed_milestones:
        milestones = "\n".join(f"- {m}" for m in completed_milestones[-15:])
    else:
        milestones = "- Session initialized"

    # Generate markdown
    content = f"""# Session Memory

> AI-curated cumulative summary. Updated every 50 messages by Context agent.
> Recent 20 raw messages injected separately via `get_context_for_agent()`.

## Session Overview

*Current session focus and objectives.*

{session_overview}

## Key Decisions

*Architectural choices, tool selections, design patterns adopted.*

| Decision | Rationale | Task |
|----------|-----------|------|
{decisions_table}

## Active Context

*In-flight work, blockers, pending items.*

{active_context}

## Completed Milestones

*Significant deliverables and their outcomes.*

{milestones}

---

*Last updated: {datetime.now().strftime("%Y-%m-%d %H:%M")}*
*Message count at update: 50*
"""

    # Write to file
    SESSION_MEMORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    SESSION_MEMORY_FILE.write_text(content, encoding="utf-8")

    # T219: Auto git commit after session memory update
    _auto_commit_session_memory(session_overview)

    return f"Session memory updated ({len(content)} chars)"


def _auto_commit_session_memory(summary: str) -> None:
    """Auto-commit session_memory.md with summary as commit message (T219).

    Runs server-side subprocess, fails silently if nothing to commit.
    """
    try:
        # Stage the session memory file
        subprocess.run(
            ["git", "add", str(SESSION_MEMORY_FILE)],
            cwd=PROJECT_ROOT,
            capture_output=True,
            timeout=5
        )

        # Truncate summary to first line, max 72 chars for commit message
        first_line = summary.split('\n')[0].strip('- •').strip()[:72]
        commit_msg = f"session: {first_line}" if first_line else "session: memory update"

        # Commit (--allow-empty for blank commits per spec)
        subprocess.run(
            ["git", "commit", "-m", commit_msg, "--allow-empty"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            timeout=10
        )
    except Exception:
        # Fail silently per spec
        pass


# Tool bundle
TOOLS = [
    COUNT_TOKENS_SCHEMA,
    LIST_ROLES_SCHEMA,
    UPDATE_SESSION_MEMORY_SCHEMA,
]

HANDLERS = {
    "count_tokens": count_tokens,
    "list_roles": list_roles,
    "update_session_memory": update_session_memory,
}
