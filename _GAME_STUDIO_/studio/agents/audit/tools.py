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
                "description": "Agent to fix the bug: Code, Design, ArtSpec, Text"
            },
            "severity": {
                "type": "string",
                "enum": ["critical", "major", "minor", "polish"],
                "description": "Bug severity level"
            }
        },
        "required": ["title", "assignee"]
    }
}


def report_bug(title: str, assignee: str = "Code", description: str = "", severity: str = "major", **kwargs) -> str:
    # Handle alternate parameter names
    # 'steps' is sometimes passed instead of 'description'
    if not description and "steps" in kwargs:
        description = kwargs["steps"]

    # Normalize assignee (BOSS is uppercase, others capitalized)
    if assignee.lower() == "boss":
        assignee = "BOSS"
    else:
        assignee = assignee.capitalize()

    full_desc = f"[BUG - {severity.upper()}] {title}"
    if description:
        full_desc += f"\n\n{description}"
    task = task_manager.create_task(full_desc, assignee)

    hub.post("Audit", f"@{assignee} Bug reported: {task.id} - {title}")
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


def test_summary(task_id: str, passed: bool = None, summary: str = "", bugs_reported: list = None, **kwargs) -> str:
    # Handle alternate parameter names
    # 'failed' is sometimes passed instead of 'passed' (inverse logic)
    if passed is None:
        if "failed" in kwargs:
            passed = not kwargs["failed"]
        else:
            passed = True  # Default to passed if not specified

    status = "PASSED" if passed else "FAILED"
    bugs = f" | Bugs: {', '.join(bugs_reported)}" if bugs_reported else ""

    hub.post("Audit", f"@BOSS Testing {task_id} {status}{bugs}: {summary}")
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
