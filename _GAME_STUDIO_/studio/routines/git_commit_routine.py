"""
Git Commit Routine - Automated commit and push.

1. Checks for uncommitted changes
2. Stages all changes
3. Generates descriptive commit message
4. Commits and pushes to origin

Self-contained and resilient to failures.
Schedule: Daily or on-demand via schedule_manager.create_script()
"""

import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

# Project root
ROOT = Path(__file__).parent.parent.parent


def run_git(args: list[str], cwd: Path = ROOT) -> tuple[bool, str]:
    """Run a git command and return (success, output)."""
    try:
        result = subprocess.run(
            ["git"] + args,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=60,
        )
        output = result.stdout.strip() or result.stderr.strip()
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, "Command timed out"
    except Exception as e:
        return False, str(e)


def get_status() -> dict:
    """Get git status summary."""
    ok, output = run_git(["status", "--porcelain"])
    if not ok:
        return {"error": output, "has_changes": False}

    lines = [l for l in output.split("\n") if l.strip()]

    staged = []
    unstaged = []
    untracked = []

    for line in lines:
        if len(line) < 3:
            continue
        index_status = line[0]
        work_status = line[1]
        filename = line[3:]

        if index_status == "?":
            untracked.append(filename)
        elif index_status != " ":
            staged.append(filename)
        elif work_status != " ":
            unstaged.append(filename)

    return {
        "has_changes": bool(lines),
        "staged": staged,
        "unstaged": unstaged,
        "untracked": untracked,
        "total_files": len(lines),
    }


def get_diff_summary() -> str:
    """Get a summary of changes for the commit message."""
    # Get diff stats
    ok, stat_output = run_git(["diff", "--stat", "HEAD"])
    if not ok or not stat_output:
        ok, stat_output = run_git(["diff", "--stat", "--cached"])

    # Get list of changed files for categorization
    ok, files_output = run_git(["diff", "--name-only", "HEAD"])
    if not ok or not files_output:
        ok, files_output = run_git(["diff", "--name-only", "--cached"])

    files = [f for f in files_output.split("\n") if f.strip()] if ok else []

    # Categorize changes
    categories = {
        "studio/": [],
        "data/": [],
        "projects/": [],
        "reports/": [],
        "tests/": [],
        "other": [],
    }

    for f in files:
        categorized = False
        for prefix in categories:
            if prefix != "other" and f.startswith(prefix):
                categories[prefix].append(f)
                categorized = True
                break
        if not categorized:
            categories["other"].append(f)

    return {
        "files": files,
        "categories": {k: v for k, v in categories.items() if v},
        "file_count": len(files),
    }


def generate_commit_message(status: dict, diff: dict) -> str:
    """Generate a descriptive commit message based on changes."""
    categories = diff.get("categories", {})
    file_count = diff.get("file_count", 0)

    # Build message components
    parts = []

    if "studio/" in categories:
        studio_files = categories["studio/"]
        if any("routine" in f for f in studio_files):
            parts.append("routines")
        if any("core/" in f for f in studio_files):
            parts.append("core systems")
        if any("backend" in f for f in studio_files):
            parts.append("backends")
        if not parts:
            parts.append("studio")

    if "data/" in categories:
        parts.append("data")

    if "projects/" in categories:
        parts.append("projects")

    if "reports/" in categories:
        parts.append("reports")

    if "tests/" in categories:
        parts.append("tests")

    if "other" in categories:
        other_files = categories["other"]
        # Check for specific important files
        for f in other_files:
            if f.endswith(".md"):
                parts.append("docs")
                break
            elif f.endswith(".json"):
                parts.append("config")
                break

    # Construct message
    if not parts:
        parts = ["changes"]

    summary = ", ".join(parts[:3])  # Max 3 categories in summary
    if len(parts) > 3:
        summary += f" +{len(parts) - 3} more"

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    message = f"Auto-commit: {summary} ({file_count} files)\n\n"
    message += f"Timestamp: {timestamp}\n"

    # Add file breakdown
    if categories:
        message += "\nChanges:\n"
        for cat, files in categories.items():
            if files:
                cat_name = cat.rstrip("/") if cat != "other" else "root"
                message += f"- {cat_name}: {len(files)} file(s)\n"

    return message


def stage_all() -> tuple[bool, str]:
    """Stage all changes."""
    return run_git(["add", "-A"])


def commit(message: str) -> tuple[bool, str]:
    """Create commit with message."""
    return run_git(["commit", "-m", message])


def push(remote: str = "origin", branch: Optional[str] = None) -> tuple[bool, str]:
    """Push to remote."""
    # Get current branch if not specified
    if branch is None:
        ok, branch = run_git(["rev-parse", "--abbrev-ref", "HEAD"])
        if not ok:
            branch = "main"
        branch = branch.strip()

    return run_git(["push", remote, branch])


def run_routine(
    auto_push: bool = True,
    remote: str = "origin",
    branch: Optional[str] = None,
) -> dict:
    """
    Execute the full git commit routine.

    Args:
        auto_push: Whether to push after commit (default: True)
        remote: Remote name (default: "origin")
        branch: Branch to push (default: current branch)

    Returns:
        dict with status, details, and any errors.
    """
    result = {
        "timestamp": datetime.now().isoformat(),
        "status_check": None,
        "staged": False,
        "committed": False,
        "pushed": False,
        "commit_message": None,
        "error": None,
    }

    # Step 1: Check status
    print("[Git Routine] Step 1: Checking git status...")
    status = get_status()
    result["status_check"] = status

    if status.get("error"):
        result["error"] = f"Status check failed: {status['error']}"
        print(f"[Git Routine] FAILED: {result['error']}")
        return result

    if not status["has_changes"]:
        result["error"] = "Nothing to commit - working tree clean"
        print(f"[Git Routine] SKIPPED: {result['error']}")
        return result

    print(f"[Git Routine] Found {status['total_files']} changed file(s)")

    # Step 2: Get diff summary for commit message
    print("[Git Routine] Step 2: Analyzing changes...")
    diff = get_diff_summary()

    # Step 3: Stage all changes
    print("[Git Routine] Step 3: Staging changes...")
    ok, output = stage_all()
    if not ok:
        result["error"] = f"Failed to stage changes: {output}"
        print(f"[Git Routine] FAILED: {result['error']}")
        return result
    result["staged"] = True
    print("[Git Routine] Changes staged")

    # Step 4: Generate and create commit
    print("[Git Routine] Step 4: Creating commit...")
    message = generate_commit_message(status, diff)
    result["commit_message"] = message

    ok, output = commit(message)
    if not ok:
        # Check if it's just "nothing to commit"
        if "nothing to commit" in output.lower():
            result["error"] = "Nothing to commit after staging"
            print(f"[Git Routine] SKIPPED: {result['error']}")
            return result
        result["error"] = f"Commit failed: {output}"
        print(f"[Git Routine] FAILED: {result['error']}")
        return result
    result["committed"] = True
    print(f"[Git Routine] Committed: {message.split(chr(10))[0]}")

    # Step 5: Push (if enabled)
    if auto_push:
        print("[Git Routine] Step 5: Pushing to remote...")
        ok, output = push(remote, branch)
        if not ok:
            result["error"] = f"Push failed: {output}"
            result["pushed"] = False
            print(f"[Git Routine] WARNING: {result['error']}")
            # Don't return - commit succeeded, push is secondary
        else:
            result["pushed"] = True
            print(f"[Git Routine] Pushed to {remote}")

    print("[Git Routine] SUCCESS")
    return result


if __name__ == "__main__":
    print("=" * 60)
    print("GIT COMMIT ROUTINE")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 60)

    result = run_routine()

    print("\n" + "=" * 60)
    if result["error"] and not result["committed"]:
        print(f"ROUTINE FAILED: {result['error']}")
        sys.exit(1)
    elif result["error"]:
        # Committed but push failed
        print(f"ROUTINE PARTIAL: Committed but push failed")
        print(f"Warning: {result['error']}")
        sys.exit(0)
    else:
        print("ROUTINE COMPLETED")
        print(f"Commit: {result['commit_message'].split(chr(10))[0] if result['commit_message'] else 'N/A'}")
        print(f"Pushed: {result['pushed']}")
        sys.exit(0)
