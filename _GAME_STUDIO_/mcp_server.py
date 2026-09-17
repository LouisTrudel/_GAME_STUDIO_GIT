"""
Game Studio MCP Server

9 core tools:
- BOSS: create_task, create_routine, get_task_status, recall_memory
- Workers: search_code, read_lines, edit_file, write_report
- All agents: create_suggestion

Usage:
    python mcp_server.py
"""

import logging
import sys
from pathlib import Path
from typing import Annotated, Optional, Literal
from pydantic import Field

PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

# Configure logging to stderr (NEVER use print in MCP servers!)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger("game-studio-mcp")

from mcp.server import MCPServer

mcp = MCPServer("game-studio")


# =============================================================================
# BOSS TOOLS
# =============================================================================

@mcp.tool()
async def create_task(
    what: Annotated[str, Field(description="Task goal")],
    files: Annotated[Optional[list[str]], Field(description="Files to touch")] = None,
    constraints: Annotated[Optional[list[str]], Field(description="What NOT to do")] = None,
    assignee: Annotated[Optional[str], Field(description="Agent name")] = None,
    dependencies: Annotated[Optional[list[str]], Field(description="Depends on task IDs")] = None,
) -> str:
    """Create task: [F] files [X] constraints [>] goal"""
    from studio.agents.boss.tools import create_task as handler
    return handler(what=what, files=files, constraints=constraints, assignee=assignee, dependencies=dependencies)


@mcp.tool()
async def create_routine(
    name: Annotated[str, Field(description="Short name for the routine")],
    description: Annotated[str, Field(description="What this routine accomplishes")],
    interval_seconds: Annotated[int, Field(description="How often to run (1800=30m, 3600=1h, 86400=24h)", ge=60)],
    tasks: Annotated[list[dict], Field(description="Task sequence: [{description, assignee}, ...]")],
) -> str:
    """Create a scheduled routine (recurring workflow)."""
    from studio.core.routine_tools import create_routine as handler
    return handler(name=name, description=description, interval_seconds=interval_seconds, tasks=tasks)


@mcp.tool()
async def get_task_status(
    task_id: Annotated[Optional[str], Field(description="Specific task ID, or omit for all")] = None,
    include_completed: Annotated[bool, Field(description="Include APPROVED/FAILED")] = False,
) -> str:
    """Get status of tasks."""
    from studio.agents.boss.tools import get_task_status as handler
    return handler(task_id=task_id, include_completed=include_completed)


@mcp.tool()
async def recall_memory(
    query: Annotated[str, Field(description="Search term")] = "",
    max_results: Annotated[int, Field(description="Max results", ge=1, le=20)] = 5,
) -> str:
    """Search memory tiers."""
    from studio.agents.boss.tools import recall_memory as handler
    return handler(query=query, max_results=max_results, search_logs=True)


@mcp.tool()
async def create_suggestion(
    title: Annotated[str, Field(description="Short title (max 80 chars)")],
    content: Annotated[str, Field(description="Full suggestion text (max 500 chars)")],
    category: Annotated[str, Field(description="Category: process|architecture|tooling|workflow|documentation|new_skill|feature")],
    source_agent: Annotated[str, Field(description="Your agent name (e.g., 'Audit', 'Design', 'Code')")],
    related_tasks: Annotated[Optional[list[str]], Field(description="Related task IDs")] = None,
    files_mentioned: Annotated[Optional[list[str]], Field(description="Relevant file paths")] = None,
    evidence: Annotated[Optional[str], Field(description="Supporting evidence")] = None,
) -> str:
    """Create a suggestion for human review in the Learning tab."""
    from studio.agents.boss.tools import create_suggestion as handler
    return handler(title=title, content=content, category=category, source_agent=source_agent, related_tasks=related_tasks, files_mentioned=files_mentioned, evidence=evidence)


# =============================================================================
# WORKER TOOLS
# =============================================================================

@mcp.tool()
async def search_code(
    pattern: Annotated[str, Field(description="Search pattern")],
    path: Annotated[str, Field(description="File or folder path")],
    context_lines: Annotated[int, Field(description="Context lines")] = 2,
) -> str:
    """Search code in path."""
    import subprocess
    import os

    if not path:
        return "ERROR: path required"

    search_path = PROJECT_ROOT / path
    if not search_path.exists():
        return f"ERROR: path '{path}' not found"

    scope = "file" if search_path.is_file() else f"folder"

    try:
        # Try ripgrep first
        try:
            cmd = ["rg", "-n", f"-C{context_lines}", "--max-count", "20", pattern, str(search_path)]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0 and result.stdout:
                lines = result.stdout.strip().split('\n')
                if len(lines) > 50:
                    return '\n'.join(lines[:50]) + f"\n\n... ({len(lines) - 50} more)"
                return result.stdout
            elif result.returncode == 1:
                return f"No matches for '{pattern}'"
        except FileNotFoundError:
            pass

        # Windows fallback
        if os.name == 'nt':
            matches = []
            pattern_lower = pattern.lower()
            files = [search_path] if search_path.is_file() else list(search_path.rglob("*.py"))[:50]

            for py_file in files:
                try:
                    with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
                        for i, line in enumerate(f, 1):
                            if pattern_lower in line.lower():
                                rel = py_file.relative_to(PROJECT_ROOT)
                                matches.append(f"{rel}:{i}: {line.rstrip()[:100]}")
                                if len(matches) >= 30:
                                    break
                except:
                    continue
                if len(matches) >= 30:
                    break

            return '\n'.join(matches) if matches else f"No matches for '{pattern}'"

        return f"No matches for '{pattern}'"
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def read_lines(
    path: Annotated[str, Field(description="File path")],
    start_line: Annotated[int, Field(description="Start line (1-indexed)")],
    end_line: Annotated[int, Field(description="End line (max 200 range)")],
) -> str:
    """Read lines from file."""
    file_path = PROJECT_ROOT / path

    if not file_path.exists():
        return f"File not found: {path}"

    if end_line - start_line > 200:
        return f"Max 200 lines. Requested {end_line - start_line}."

    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()

        total = len(lines)
        start_idx = max(0, start_line - 1)
        end_idx = min(total, end_line)
        selected = lines[start_idx:end_idx]

        result = f"# {path} (lines {start_line}-{end_line} of {total})\n\n"
        for i, line in enumerate(selected, start=start_line):
            result += f"{i:4}: {line}"
        return result
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def edit_file(
    path: Annotated[str, Field(description="File path")],
    old_content: Annotated[str, Field(description="Content to replace")],
    new_content: Annotated[str, Field(description="New content")],
) -> str:
    """Replace content in file."""
    file_path = PROJECT_ROOT / path

    if not file_path.exists():
        return f"ERROR: File not found: {path}"

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if old_content not in content:
            preview = old_content[:50].replace('\n', '\\n')
            return f"ERROR: Content not found. Looking for: '{preview}...'"

        if content.count(old_content) > 1:
            return f"ERROR: Multiple matches. Add more context."

        if old_content == new_content:
            return "ERROR: old_content == new_content"

        new_file = content.replace(old_content, new_content, 1)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_file)

        old_lines = len(old_content.split('\n'))
        new_lines = len(new_content.split('\n'))
        diff = new_lines - old_lines
        diff_str = f"+{diff}" if diff > 0 else str(diff) if diff < 0 else "±0"

        return f"OK: {old_lines} → {new_lines} lines ({diff_str}) in {path}"
    except Exception as e:
        return f"ERROR: {e}"


@mcp.tool()
async def write_report(
    filename: Annotated[str, Field(description="Filename (no extension)")],
    content: Annotated[str, Field(description="Content to save")],
    format: Annotated[Literal["md", "txt", "json"], Field(description="Format")] = "md",
) -> str:
    """Save report to reports/ folder."""
    from studio.core.file_tools import write_report as handler
    return handler(filename=filename, content=content, format=format)


# =============================================================================
# SERVER ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    logger.info("Starting Game Studio MCP Server (9 tools)...")
    mcp.run(transport="stdio")
