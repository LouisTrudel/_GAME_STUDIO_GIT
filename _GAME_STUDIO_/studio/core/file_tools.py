"""
File tools for agents to read/write documents.
"""

from pathlib import Path
from datetime import datetime

REPORTS_DIR = Path(__file__).parent.parent.parent / "reports"
REPORTS_DIR.mkdir(exist_ok=True)


WRITE_REPORT_SCHEMA = {
    "name": "write_report",
    "description": "Save a long document or report to a file. Use this for outputs that are too long for chat.",
    "input_schema": {
        "type": "object",
        "properties": {
            "filename": {
                "type": "string",
                "description": "Name for the file (without extension), e.g., 'roblox-analysis' or 'game-design-doc'"
            },
            "content": {
                "type": "string",
                "description": "The full content to save"
            },
            "format": {
                "type": "string",
                "description": "File format: md, txt, or json",
                "enum": ["md", "txt", "json"]
            }
        },
        "required": ["filename", "content"]
    }
}


def write_report(filename: str, content: str, format: str = "md") -> str:
    """Save a report to the reports folder."""
    safe_filename = "".join(c if c.isalnum() or c in "_-" else "_" for c in filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = REPORTS_DIR / f"{safe_filename}_{timestamp}.{format}"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    size_kb = filepath.stat().st_size / 1024
    return f"Report saved: {filepath.name} ({size_kb:.1f}KB)"


READ_FILE_SCHEMA = {
    "name": "read_file",
    "description": "Read a file from the reports folder.",
    "input_schema": {
        "type": "object",
        "properties": {
            "filename": {
                "type": "string",
                "description": "The filename to read (with extension)"
            }
        },
        "required": ["filename"]
    }
}


def read_file(filename: str) -> str:
    """Read a file from the reports folder."""
    filepath = REPORTS_DIR / filename
    if not filepath.exists():
        # Try to find partial match
        matches = list(REPORTS_DIR.glob(f"*{filename}*"))
        if matches:
            filepath = matches[0]
        else:
            return f"File not found: {filename}"

    content = filepath.read_text(encoding="utf-8")
    if len(content) > 10000:
        return content[:10000] + f"\n\n... [truncated, full file is {len(content)} chars]"
    return content


LIST_REPORTS_SCHEMA = {
    "name": "list_reports",
    "description": "List all saved reports.",
    "input_schema": {
        "type": "object",
        "properties": {},
        "required": []
    }
}


def list_reports() -> str:
    """List all reports in the reports folder."""
    files = list(REPORTS_DIR.glob("*.*"))
    if not files:
        return "No reports saved yet."

    lines = ["Saved reports:"]
    for f in sorted(files, key=lambda x: x.stat().st_mtime, reverse=True)[:20]:
        size = f.stat().st_size / 1024
        lines.append(f"  - {f.name} ({size:.1f}KB)")
    return "\n".join(lines)


# Tool bundle - available to all agents
FILE_TOOLS = [
    WRITE_REPORT_SCHEMA,
    READ_FILE_SCHEMA,
    LIST_REPORTS_SCHEMA,
]

FILE_HANDLERS = {
    "write_report": write_report,
    "read_file": read_file,
    "list_reports": list_reports,
}
