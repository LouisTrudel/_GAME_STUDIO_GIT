"""
Project-aware path utilities.

T321: Provides base path resolution for project-specific data storage.
T327: URL-based project routing uses these paths via get_base_path(project_id).

When a project is active, memory/history data lives in:
  projects/<project_id>/memory/
  projects/<project_id>/history/

When no project is active (or project_id is None/"default"):
  data/memory/
  data/history/

URL Routing (T327):
  ?project=P001 -> Frontend extracts param, includes in API calls
  Backend routes call hub.set_active_project(project_id)
  Memory/history managers switch to project-specific paths
"""

from pathlib import Path
from typing import Optional, Any
import json
import os


# Base directories
REPO_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = REPO_ROOT / "data"
PROJECTS_DIR = REPO_ROOT / "projects"


def get_base_path(project_name: Optional[str] = None) -> Path:
    """Get base path for project-specific data storage.

    Args:
        project_name: Project folder name (e.g., "my_game").
                      None or "default" uses legacy data/ path.

    Returns:
        Path to base directory for memory/history storage.

    Examples:
        get_base_path(None) -> data/
        get_base_path("default") -> data/
        get_base_path("my_game") -> projects/my_game/
    """
    if not project_name or project_name == "default":
        return DATA_DIR
    return PROJECTS_DIR / project_name


def get_memory_dir(project_name: Optional[str] = None) -> Path:
    """Get memory directory for a project.

    Args:
        project_name: Project folder name.

    Returns:
        Path to memory directory (e.g., data/memory/ or projects/my_game/memory/)
    """
    return get_base_path(project_name) / "memory"


def get_history_dir(project_name: Optional[str] = None) -> Path:
    """Get history directory for a project.

    Args:
        project_name: Project folder name.

    Returns:
        Path to history directory (e.g., data/history/ or projects/my_game/history/)
    """
    return get_base_path(project_name) / "history"


def ensure_project_dirs(project_name: str) -> bool:
    """Ensure memory and history directories exist for a project.

    Args:
        project_name: Project folder name.

    Returns:
        True if directories were created or already exist.
    """
    if not project_name or project_name == "default":
        return True  # Default dirs handled elsewhere

    memory_dir = get_memory_dir(project_name)
    history_dir = get_history_dir(project_name)

    memory_dir.mkdir(parents=True, exist_ok=True)
    history_dir.mkdir(parents=True, exist_ok=True)

    return True


def atomic_json_write(filepath: Path, data: Any, indent: int = 2) -> bool:
    """Write JSON data atomically to prevent corruption on crash.

    Uses write-to-temp-then-rename pattern:
    1. Write to .tmp file
    2. Flush and fsync to ensure data on disk
    3. Atomic rename to target (overwrites existing)

    Args:
        filepath: Target JSON file path
        data: Data to serialize as JSON
        indent: JSON indentation (default 2)

    Returns:
        True on success, False on failure
    """
    temp_file = filepath.with_suffix('.json.tmp')

    try:
        filepath.parent.mkdir(parents=True, exist_ok=True)

        # Write to temp file
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=indent)
            f.flush()
            os.fsync(f.fileno())  # Force write to disk

        # Atomic rename
        os.replace(temp_file, filepath)
        return True

    except Exception as e:
        # Log error but don't raise - let caller handle
        print(f"[atomic_json_write] Failed to save {filepath}: {e}")
        return False
