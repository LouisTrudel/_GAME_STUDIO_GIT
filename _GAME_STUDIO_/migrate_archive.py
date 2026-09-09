#!/usr/bin/env python3
"""
Migrate tasks_archive.json to compressed schema (T235).

Old schema (verbose):
- id, description, assignee, status, dependencies, review_notes, error,
  retry_count, created_at, started_at, completed_at, token_log,
  total_input_tokens, total_output_tokens, prompt_sent, output, ...

New schema (T232 to_archive_dict):
- id: task id
- desc: description[:100]
- agent: assignee
- outcome: ok|fail|error
- at: ISO timestamp (completed_at or created_at)
- tokens: {in, out, usd}
- friction: low|medium|high|null
"""

import json
from pathlib import Path
from datetime import datetime

ARCHIVE_PATH = Path("data/tasks_archive.json")
BACKUP_PATH = Path("data/tasks_archive.backup.json")

# Status -> outcome mapping
STATUS_TO_OUTCOME = {
    "approved": "ok",
    "completed": "ok",
    "error": "error",
    "failed": "fail",
    "blocked": "fail",
}

def compute_friction(task: dict) -> str | None:
    """Compute friction category from old task data."""
    status = task.get("status", "").lower()
    error = task.get("error")
    retry_count = task.get("retry_count", 0)
    exec_errors = task.get("exec_errors", [])
    tool_errors = task.get("tool_errors", [])
    cost_usd = task.get("cost_usd", 0) or 0
    exec_is_error = task.get("exec_is_error", False)

    # Check error conditions (matches _compute_friction_category logic)
    if exec_is_error or error or status in ("failed", "error"):
        return "high"
    if retry_count > 0:
        return "medium"
    if exec_errors or tool_errors:
        return "medium"
    if cost_usd > 1.0:
        return "low"
    return None

def migrate_task(task: dict) -> dict:
    """Convert old verbose task to compressed archive schema."""
    status = task.get("status", "").lower()
    outcome = STATUS_TO_OUTCOME.get(status, "fail")

    # Timestamp: prefer completed_at, fallback to created_at
    completed_at = task.get("completed_at")
    created_at = task.get("created_at")
    at = completed_at or created_at or datetime.now().isoformat()

    # Tokens: try new cost_* fields first, fallback to total_*
    tokens_in = task.get("cost_input_tokens") or task.get("total_input_tokens", 0) or 0
    tokens_out = task.get("cost_output_tokens") or task.get("total_output_tokens", 0) or 0
    cost_usd = task.get("cost_usd", 0) or 0

    return {
        "id": task.get("id"),
        "desc": (task.get("description") or "")[:100],
        "agent": task.get("assignee"),
        "outcome": outcome,
        "at": at,
        "tokens": {
            "in": tokens_in,
            "out": tokens_out,
            "usd": cost_usd,
        },
        "friction": compute_friction(task),
    }

def main():
    # Load current archive
    print(f"Loading {ARCHIVE_PATH}...")
    with open(ARCHIVE_PATH, "r", encoding="utf-8") as f:
        old_tasks = json.load(f)

    print(f"Found {len(old_tasks)} tasks")

    # Backup original
    print(f"Creating backup at {BACKUP_PATH}...")
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(old_tasks, f, indent=2)

    # Migrate each task
    print("Migrating to compressed schema...")
    new_tasks = [migrate_task(task) for task in old_tasks]

    # Write new archive
    print(f"Writing migrated archive...")
    with open(ARCHIVE_PATH, "w", encoding="utf-8") as f:
        json.dump(new_tasks, f, indent=2)

    # Report size reduction
    old_size = BACKUP_PATH.stat().st_size
    new_size = ARCHIVE_PATH.stat().st_size
    reduction = (1 - new_size / old_size) * 100

    print(f"\nMigration complete!")
    print(f"  Old size: {old_size:,} bytes")
    print(f"  New size: {new_size:,} bytes")
    print(f"  Reduction: {reduction:.1f}%")
    print(f"\nSample migrated task:")
    print(json.dumps(new_tasks[0], indent=2))

if __name__ == "__main__":
    main()
