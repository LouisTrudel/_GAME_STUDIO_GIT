"""
File tree indexing for agent context injection.

T402: Reduces exploratory tool calls by injecting cached file tree into agent context.
Research showed 80% of tokens wasted on orientation - this provides upfront structure.

Project-aware: uses active project path when set, otherwise REPO_ROOT.
"""

import time
from pathlib import Path
from typing import Optional

from .paths import REPO_ROOT, get_base_path
from .projects import project_manager

# Cache: {project_id: (timestamp, tree_string)}
_cache: dict[str, tuple[float, str]] = {}
CACHE_TTL = 300  # 5 minutes

# Directories to skip
SKIP_DIRS = {"__pycache__", "node_modules", ".git", ".venv", "venv", ".idea", ".vscode"}
SKIP_EXTENSIONS = {".pyc", ".pyo", ".so", ".dll", ".exe"}


def get_file_tree(
    project_id: Optional[str] = None,
    max_depth: int = 3,
    max_files: int = 50
) -> str:
    """Get file tree for injection into agent context.

    Args:
        project_id: If provided, scan projects/{ID}/ directory.
                   If None, scan REPO_ROOT with studio-relevant paths.
        max_depth: Maximum directory depth to traverse.
        max_files: Maximum files to include.

    Returns:
        Formatted file tree string for context injection.
    """
    cache_key = project_id or "default"

    # Check cache
    if cache_key in _cache:
        timestamp, tree = _cache[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            return tree

    # Determine root path
    if project_id and project_id != "default":
        project = project_manager.get(project_id)
        if project:
            root = Path(project.path)
        else:
            root = get_base_path(project_id)
    else:
        root = REPO_ROOT

    # Build tree
    if root.exists():
        tree = _build_tree(root, max_depth, max_files)
    else:
        tree = f"(path not found: {root})"

    # Cache and return
    _cache[cache_key] = (time.time(), tree)
    return tree


def _build_tree(root: Path, max_depth: int, max_files: int) -> str:
    """Build formatted file tree string."""
    lines = []
    file_count = [0]  # Use list for closure mutation

    def walk(path: Path, prefix: str, depth: int):
        if depth > max_depth or file_count[0] >= max_files:
            return

        try:
            entries = sorted(path.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
        except PermissionError:
            return

        # Filter entries
        dirs = []
        files = []
        for entry in entries:
            if entry.name.startswith('.') and entry.name not in {'.env.example'}:
                continue
            if entry.is_dir():
                if entry.name not in SKIP_DIRS:
                    dirs.append(entry)
            else:
                if entry.suffix not in SKIP_EXTENSIONS:
                    files.append(entry)

        items = dirs + files
        for i, entry in enumerate(items):
            if file_count[0] >= max_files:
                lines.append(f"{prefix}... ({max_files} file limit)")
                return

            is_last = i == len(items) - 1
            connector = "└── " if is_last else "├── "

            if entry.is_dir():
                lines.append(f"{prefix}{connector}{entry.name}/")
                new_prefix = prefix + ("    " if is_last else "│   ")
                walk(entry, new_prefix, depth + 1)
            else:
                lines.append(f"{prefix}{connector}{entry.name}")
                file_count[0] += 1

    lines.append(f"{root.name}/")
    walk(root, "", 1)

    return "\n".join(lines)


def clear_cache(project_id: Optional[str] = None):
    """Clear file tree cache."""
    if project_id:
        _cache.pop(project_id, None)
    else:
        _cache.clear()
