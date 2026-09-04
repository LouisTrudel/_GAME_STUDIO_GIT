"""
QA-specific tools for testing and verification.
QA is a worker that gets assigned testing tasks by BOSS.
"""

from studio.core.tasks import task_manager, TaskStatus
from studio.core.hub import hub


REPORT_BUG_SCHEMA = {
    "name": "report_bug",
    "description": """Report a bug found during testing. Creates a task for the responsible agent to fix it.

Use after testing when you find issues that need fixing.""",
    "input_schema": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Short bug title (e.g., 'Shop button unresponsive')"
            },
            "description": {
                "type": "string",
                "description": "Bug details: steps to reproduce, expected vs actual, severity"
            },
            "assignee": {
                "type": "string",
                "description": "Agent to fix the bug: Programmer, Designer, Artist, Writer"
            },
            "severity": {
                "type": "string",
                "enum": ["critical", "major", "minor", "polish"],
                "description": "Bug severity level"
            }
        },
        "required": ["title", "description", "assignee"]
    }
}


def report_bug(title: str, description: str, assignee: str, severity: str = "major") -> str:
    # Normalize assignee (BOSS and QA are uppercase, others capitalized)
    if assignee.lower() == "boss":
        assignee = "BOSS"
    elif assignee.lower() == "qa":
        assignee = "QA"
    else:
        assignee = assignee.capitalize()

    full_desc = f"[BUG - {severity.upper()}] {title}\n\n{description}"
    task = task_manager.create_task(full_desc, assignee)

    hub.post("QA", f"@{assignee} Bug reported: {task.id} - {title}")
    return f"Bug {task.id} created and assigned to {assignee}: {title}"


CHECK_FILES_SCHEMA = {
    "name": "check_files",
    "description": "Verify that expected files exist. Use to confirm deliverables were created.",
    "input_schema": {
        "type": "object",
        "properties": {
            "paths": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of file paths to check (relative to project root)"
            }
        },
        "required": ["paths"]
    }
}


def check_files(paths: list) -> str:
    from pathlib import Path

    project_root = Path(__file__).parent.parent.parent.parent
    results = []

    for path in paths:
        full_path = project_root / path
        if full_path.exists():
            size = full_path.stat().st_size
            results.append(f"  [OK] {path} ({size} bytes)")
        else:
            results.append(f"  [MISSING] {path}")

    missing = sum(1 for r in results if "[MISSING]" in r)
    header = f"File check: {len(paths) - missing}/{len(paths)} found"

    return header + "\n" + "\n".join(results)


TEST_SUMMARY_SCHEMA = {
    "name": "test_summary",
    "description": "Submit a test summary after completing a testing task. Reports findings to BOSS.",
    "input_schema": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "The testing task ID you completed (e.g., T005)"
            },
            "passed": {
                "type": "boolean",
                "description": "True if all tests passed, False if bugs were found"
            },
            "summary": {
                "type": "string",
                "description": "Brief summary of what was tested and findings"
            },
            "bugs_reported": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of bug task IDs created (if any)"
            }
        },
        "required": ["task_id", "passed", "summary"]
    }
}


def test_summary(task_id: str, passed: bool, summary: str, bugs_reported: list = None) -> str:
    status = "PASSED" if passed else "FAILED"
    bugs = f" | Bugs: {', '.join(bugs_reported)}" if bugs_reported else ""

    hub.post("QA", f"@BOSS Testing {task_id} {status}{bugs}: {summary}")
    return f"Test summary submitted for {task_id}: {status}"


# Tool bundle
TOOLS = [
    REPORT_BUG_SCHEMA,
    CHECK_FILES_SCHEMA,
    TEST_SUMMARY_SCHEMA,
]

HANDLERS = {
    "report_bug": report_bug,
    "check_files": check_files,
    "test_summary": test_summary,
}
