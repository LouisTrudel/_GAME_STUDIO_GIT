"""
Loader module - Agent loading and configuration helpers.

Loads agent roles, configs, and skills from the filesystem.
"""

import json
from pathlib import Path


# Agent folders
AGENTS_DIR = Path(__file__).parent / "agents"
SHARED_DIR = AGENTS_DIR / "shared"
SKILLS_DIR = Path(__file__).parent / "skills"
ROUTERS_DIR = SKILLS_DIR / "_routers"

# Agent name to router type mapping
AGENT_ROUTER_MAP = {
    "boss": "boss",
    "code": "code",
    "design": "design",
    "artspec": "artspec",
    "text": "text",
    "audit": "audit",
    "structure": "structure",
    "prompt": "prompt",
    "research": "research",
    "image": "image",
    "audio": "audio",
    "video": "video",
}


def load_markdown(filepath: Path) -> str:
    """Load a markdown file as string."""
    if filepath.exists():
        return filepath.read_text(encoding="utf-8")
    return ""


def load_agent_role_md(name: str) -> str:
    """Load agent role from markdown file.

    For BOSS agent, applies delegation fixes (T324/T325) based on config:
    - primacy_identity: Adds identity block at start (lines 1-5)
    - recency_bookend: Adds final reminder at end
    """
    agent_dir = AGENTS_DIR / name.lower()
    config = load_agent_config(name)

    # Check for BOSS delegation fixes
    fixes = config.get("delegation_fixes", {})
    use_primacy = fixes.get("primacy_identity", False)
    use_recency = fixes.get("recency_bookend", False)

    # If any fixes enabled, use modular assembly
    if use_primacy or use_recency:
        parts = []

        # Fix 1: Primacy identity at the very start
        if use_primacy:
            primacy_file = agent_dir / "fixes" / "primacy_identity.md"
            if primacy_file.exists():
                parts.append(load_markdown(primacy_file))

        # Base role content
        base_file = agent_dir / "role_base.md"
        if base_file.exists():
            parts.append(load_markdown(base_file))
        else:
            # Fallback to role.md if no role_base.md
            role_file = agent_dir / "role.md"
            parts.append(load_markdown(role_file))

        # Fix 2: Recency bookend at the very end
        if use_recency:
            recency_file = agent_dir / "fixes" / "recency_bookend.md"
            if recency_file.exists():
                parts.append(load_markdown(recency_file))

        return "\n\n".join(parts)

    # Default: just load role.md
    role_file = agent_dir / "role.md"
    return load_markdown(role_file)


def load_agent_config(name: str) -> dict:
    """Load agent config from JSON file."""
    config_file = AGENTS_DIR / name.lower() / "config.json"
    if config_file.exists():
        with open(config_file) as f:
            return json.load(f)
    return {}


def load_agent_skills(name: str) -> list[str]:
    """Load all skills for an agent."""
    skills_dir = AGENTS_DIR / name.lower() / "skills"
    skills = []
    if skills_dir.exists():
        for skill_file in skills_dir.glob("*.md"):
            skills.append(load_markdown(skill_file))
    return skills


def load_shared_skills() -> list[str]:
    """Load shared skills available to all agents."""
    skills = []
    if SHARED_DIR.exists():
        for skill_file in SHARED_DIR.glob("*.md"):
            skills.append(load_markdown(skill_file))
    return skills


def load_router_skill(agent_name: str) -> str:
    """Load the router skill for an agent type."""
    # Map agent name to router type
    router_type = AGENT_ROUTER_MAP.get(agent_name.lower())
    if not router_type:
        return ""

    router_file = ROUTERS_DIR / f"{router_type}.md"
    if router_file.exists():
        return load_markdown(router_file)
    return ""


def get_all_agent_names() -> list[str]:
    """Get list of all agent names from folders."""
    names = []
    for folder in AGENTS_DIR.iterdir():
        if folder.is_dir() and folder.name != "shared":
            # Check for role.md or role.json
            if (folder / "role.md").exists() or (folder / "role.json").exists():
                config = load_agent_config(folder.name)
                names.append(config.get("name", folder.name.upper() if folder.name == "boss" else folder.name.capitalize()))
    return names


def load_agent_role(name: str) -> dict:
    """Load agent role - for backwards compat with server.py"""
    # Try JSON first
    config_file = AGENTS_DIR / name.lower() / "role.json"
    if config_file.exists():
        with open(config_file) as f:
            return json.load(f)

    # Parse markdown frontmatter-style
    md = load_agent_role_md(name)
    config = load_agent_config(name)
    return {
        "name": config.get("name", name),
        "title": config.get("title", "Agent"),
        "color": config.get("color", "#888"),
        "is_boss": "boss" in name.lower(),
        "system_prompt": md,
    }
