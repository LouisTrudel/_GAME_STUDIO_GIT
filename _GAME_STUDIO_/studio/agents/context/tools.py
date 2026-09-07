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


LIST_SKILLS_SCHEMA = {
    "name": "list_skills",
    "description": "List all available skills in a category or all categories.",
    "input_schema": {
        "type": "object",
        "properties": {
            "category": {
                "type": "string",
                "description": "Skill category to list (e.g., 'code', 'design'). Omit for all."
            }
        }
    }
}


def list_skills(category: str = None) -> str:
    """List skills in the skills directory."""
    skills_dir = PROJECT_ROOT / "studio" / "skills"

    if not skills_dir.exists():
        return "Skills directory not found"

    results = []

    if category:
        cat_dir = skills_dir / category
        if not cat_dir.exists():
            return f"Category not found: {category}"
        categories = [cat_dir]
    else:
        categories = [d for d in skills_dir.iterdir() if d.is_dir() and not d.name.startswith('_')]

    for cat_dir in sorted(categories):
        cat_name = cat_dir.name
        skills = list(cat_dir.glob("**/*.md"))
        if skills:
            results.append(f"\n## {cat_name}")
            for skill in sorted(skills):
                rel_path = skill.relative_to(skills_dir)
                size = skill.stat().st_size
                tokens = size // 4
                results.append(f"  - {rel_path} (~{tokens} tokens)")

    if not results:
        return "No skills found"

    return "Available skills:" + "".join(results)


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
    "description": "Update session_memory.md with cumulative session summary. Called at 50-message intervals.",
    "input_schema": {
        "type": "object",
        "properties": {
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
        },
        "required": ["session_overview", "active_context"]
    }
}


def update_session_memory(
    session_overview: str,
    active_context: str,
    key_decisions: list = None,
    completed_milestones: list = None
) -> str:
    """Update session_memory.md with cumulative summary (T164).

    Generates markdown from structured input to maintain consistent format.
    """
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
    LIST_SKILLS_SCHEMA,
    LIST_ROLES_SCHEMA,
    UPDATE_SESSION_MEMORY_SCHEMA,
]

HANDLERS = {
    "count_tokens": count_tokens,
    "list_skills": list_skills,
    "list_roles": list_roles,
    "update_session_memory": update_session_memory,
}
