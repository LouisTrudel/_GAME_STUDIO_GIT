"""
Context Engineer tools for prompt optimization and review.
"""

from pathlib import Path

# Project root for file operations
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent


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


# Tool bundle
TOOLS = [
    COUNT_TOKENS_SCHEMA,
    LIST_SKILLS_SCHEMA,
    LIST_ROLES_SCHEMA,
]

HANDLERS = {
    "count_tokens": count_tokens,
    "list_skills": list_skills,
    "list_roles": list_roles,
}
