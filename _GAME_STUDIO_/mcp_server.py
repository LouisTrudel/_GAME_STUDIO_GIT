"""
Game Studio MCP Server

Exposes all studio tools via Model Context Protocol.
Claude CLI connects to this server and gets REAL tool enforcement.

Usage:
    python mcp_server.py

Configure in Claude settings:
    {
        "mcpServers": {
            "game-studio": {
                "command": "python",
                "args": ["C:/Users/lou/__MY_WORK__/_GAME_STUDIO_GIT/_GAME_STUDIO_/mcp_server.py"]
            }
        }
    }

Install:
    pip install "mcp[cli]"
"""

import logging
import sys
from pathlib import Path
from typing import Annotated, Optional, Literal
from pydantic import Field

# Add project root to path for imports
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

# Configure logging to stderr (NEVER use print in MCP servers!)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger("game-studio-mcp")

# Import MCP SDK
from mcp.server import MCPServer

# Pre-import common modules to avoid lazy loading delays on first tool call
logger.info("Pre-loading studio modules...")
try:
    from studio.agents.boss import tools as boss_tools
    from studio.core import tasks, hub, employee_tools
    logger.info("Studio modules pre-loaded successfully")
except Exception as e:
    logger.warning("Failed to pre-load some modules: %s", e)

# Initialize MCP server
mcp = MCPServer("game-studio")


# =============================================================================
# BOSS TOOLS - Task delegation and studio management
# =============================================================================

@mcp.tool()
async def create_task(
    description: Annotated[str, Field(description="Clear description of what needs to be done")],
    assignee: Annotated[Optional[str], Field(description="Agent: Designer, Programmer, Artist, Writer, QA, Context, Research, Raw")] = None,
    dependencies: Annotated[Optional[list[str]], Field(description="Task IDs that must complete first")] = None,
    backend: Annotated[Optional[str], Field(description="LLM backend for Raw tasks: 'gemini', 'claude_cli', 'ollama'")] = None,
) -> str:
    """Create a new task and assign it to an agent.

    Structure your task description for optimal output:
    [WHAT] Clear deliverable in imperative form
    [CONTEXT] Why this is needed (optional)
    [CONSTRAINTS] Must-haves, limits, rules (optional)
    """
    from studio.agents.boss.tools import create_task as handler
    return handler(description=description, assignee=assignee, dependencies=dependencies, backend=backend)


@mcp.tool()
async def get_task_status(
    task_id: Annotated[Optional[str], Field(description="Specific task ID, or omit for all tasks")] = None,
    include_completed: Annotated[bool, Field(description="Include APPROVED/FAILED tasks")] = False,
) -> str:
    """Get the current status of all tasks or a specific task."""
    from studio.agents.boss.tools import get_task_status as handler
    return handler(task_id=task_id, include_completed=include_completed)


@mcp.tool()
async def acknowledge(
    message: Annotated[str, Field(description="Brief acknowledgment message")] = "Acknowledged",
) -> str:
    """Acknowledge a message when no action is needed.

    Use this instead of prose-only responses.
    """
    from studio.agents.boss.tools import acknowledge as handler
    return handler(message=message)


@mcp.tool()
async def create_suggestion(
    title: Annotated[str, Field(description="Short summary (max 80 chars)")],
    content: Annotated[str, Field(description="Full suggestion text (max 500 chars)")],
    category: Annotated[str, Field(description="process|architecture|tooling|workflow|documentation|new_skill|feature")],
    related_tasks: Annotated[Optional[list[str]], Field(description="Task IDs this relates to")] = None,
    files_mentioned: Annotated[Optional[list[str]], Field(description="File paths mentioned")] = None,
    evidence: Annotated[Optional[str], Field(description="Supporting evidence or data")] = None,
) -> str:
    """Create a suggestion for human review in the Learning tab.

    Use when you notice patterns, issues, or improvements worth surfacing.
    """
    from studio.agents.boss.tools import create_suggestion as handler
    return handler(
        title=title, content=content, category=category,
        related_tasks=related_tasks, files_mentioned=files_mentioned, evidence=evidence
    )


@mcp.tool()
async def add_discussion(
    suggestion_id: Annotated[str, Field(description="The suggestion ID (e.g., 'S001')")],
    content: Annotated[str, Field(description="Your analysis or opinion (max 1000 chars)")],
) -> str:
    """Add your analysis/opinion to a suggestion's discussion history.

    Use when completing a suggestion analysis task to record your findings.
    """
    from studio.agents.boss.tools import add_discussion as handler
    return handler(suggestion_id=suggestion_id, content=content)


@mcp.tool()
async def recall_memory(
    query: Annotated[str, Field(description="Search term (keyword match). Examples: 'economy', 'T123', 'inventory bug'")] = "",
    max_results: Annotated[int, Field(description="Max results to return", ge=1, le=20)] = 5,
    search_logs: Annotated[bool, Field(description="Also search raw logs if tiers have no match")] = True,
) -> str:
    """Search memory tiers for relevant context.

    Uses AB tiered compression model:
    - Tier 0: Recent session messages (most detail)
    - Tier 1+: Compressed summaries from older sessions

    Call with no query to see recent memories.
    """
    from studio.agents.boss.tools import recall_memory as handler
    return handler(query=query, max_results=max_results, search_logs=search_logs)


@mcp.tool()
async def git_commit(
    auto_push: Annotated[bool, Field(description="Push to origin after commit")] = True,
    message: Annotated[Optional[str], Field(description="Custom commit message (auto-generated if not provided)")] = None,
) -> str:
    """Commit and push all staged changes to git.

    Auto-generates a descriptive commit message based on changed files.
    """
    from studio.agents.boss.tools import git_commit as handler
    return handler(auto_push=auto_push, message=message)


# =============================================================================
# EMPLOYEE TOOLS - Task execution and collaboration
# =============================================================================

@mcp.tool()
async def get_my_tasks(
    agent_name: Annotated[str, Field(description="Your agent name (Designer, Programmer, etc.)")],
) -> str:
    """Get all tasks assigned to you."""
    from studio.core.employee_tools import get_my_tasks as handler
    return handler(agent_name=agent_name)


@mcp.tool()
async def log_step(
    description: Annotated[str, Field(description="What you just completed (e.g., 'Added touch detection to collectible')")],
    tokens_used: Annotated[int, Field(description="Approximate tokens used for this step", ge=0)] = 0,
) -> str:
    """Log a checkpoint step in your current task.

    Call this at key progress points to track multi-step execution.
    """
    from studio.core.employee_tools import log_step as handler
    return handler(description=description, tokens_used=tokens_used)


# =============================================================================
# QA TOOLS - Testing and bug reporting
# =============================================================================

@mcp.tool()
async def report_bug(
    title: Annotated[str, Field(description="Short bug title (e.g., 'Shop button unresponsive')")],
    assignee: Annotated[str, Field(description="Agent to fix the bug: Programmer, Designer, Artist, Writer")] = "Programmer",
    description: Annotated[str, Field(description="Bug details: steps to reproduce, expected vs actual")] = "",
    severity: Annotated[Literal["critical", "major", "minor", "polish"], Field(description="Bug severity level")] = "major",
) -> str:
    """Report a bug found during testing.

    Creates a task for the responsible agent to fix it.
    """
    from studio.agents.qa.tools import report_bug as handler
    return handler(title=title, assignee=assignee, description=description, severity=severity)


@mcp.tool()
async def check_files(
    paths: Annotated[list[str], Field(description="List of file paths to check (relative to project root)")],
) -> str:
    """Verify that expected files exist.

    Use to confirm deliverables were created.
    """
    from studio.agents.qa.tools import check_files as handler
    return handler(paths=paths)


@mcp.tool()
async def test_summary(
    task_id: Annotated[str, Field(description="The testing task ID you completed (e.g., T005)")],
    passed: Annotated[bool, Field(description="True if all tests passed, False if bugs were found")],
    summary: Annotated[str, Field(description="Brief summary of what was tested and findings")],
    bugs_reported: Annotated[Optional[list[str]], Field(description="List of bug task IDs created (if any)")] = None,
) -> str:
    """Submit a test summary after completing a testing task.

    Reports findings to BOSS. Always call this at the end of testing.
    """
    from studio.agents.qa.tools import test_summary as handler
    return handler(task_id=task_id, passed=passed, summary=summary, bugs_reported=bugs_reported)


# =============================================================================
# ROUTINE TOOLS - Schedule management
# =============================================================================

@mcp.tool()
async def create_routine(
    name: Annotated[str, Field(description="Short name for the routine")],
    description: Annotated[str, Field(description="What this routine accomplishes")],
    interval_seconds: Annotated[int, Field(description="How often to run (1800=30m, 3600=1h, 21600=6h, 86400=24h)", ge=60)],
    tasks: Annotated[list[dict], Field(description="Task sequence: [{description, assignee, parallel?}, ...]")],
) -> str:
    """Create a new scheduled routine (recurring workflow).

    Tasks run sequentially by default. Set parallel:true for concurrent tasks.
    """
    from studio.agents.routine.tools import create_routine as handler
    return handler(name=name, description=description, interval_seconds=interval_seconds, tasks=tasks)


@mcp.tool()
async def list_routines() -> str:
    """List all routines with their status and next run time."""
    from studio.agents.routine.tools import list_routines as handler
    return handler()


@mcp.tool()
async def get_routine(
    schedule_id: Annotated[str, Field(description="Routine ID (e.g., SCH001)")],
) -> str:
    """Get detailed info about a specific routine including task sequence and run history."""
    from studio.agents.routine.tools import get_routine as handler
    return handler(schedule_id=schedule_id)


@mcp.tool()
async def pause_routine(
    schedule_id: Annotated[str, Field(description="Routine ID to pause (e.g., SCH001)")],
) -> str:
    """Temporarily pause a routine. Can be resumed later."""
    from studio.agents.routine.tools import pause_routine as handler
    return handler(schedule_id=schedule_id)


@mcp.tool()
async def resume_routine(
    schedule_id: Annotated[str, Field(description="Routine ID to resume (e.g., SCH001)")],
) -> str:
    """Resume a paused routine. Next run will be scheduled immediately."""
    from studio.agents.routine.tools import resume_routine as handler
    return handler(schedule_id=schedule_id)


@mcp.tool()
async def delete_routine(
    schedule_id: Annotated[str, Field(description="Routine ID to delete (e.g., SCH001)")],
) -> str:
    """Permanently delete a routine. Cannot be undone."""
    from studio.agents.routine.tools import delete_routine as handler
    return handler(schedule_id=schedule_id)


# =============================================================================
# TAXONOMY TOOLS - Naming analysis
# =============================================================================

@mcp.tool()
async def analyze_naming(
    path: Annotated[str, Field(description="File or directory path to analyze (relative to project root)")],
    scope: Annotated[Literal["functions", "variables", "files", "all"], Field(description="What to analyze")] = "all",
) -> str:
    """Scan a file or directory for naming inconsistencies.

    Checks for:
    - Mixed naming conventions (camelCase vs snake_case)
    - Inconsistent prefixes (get_ vs fetch_ vs load_)
    - Unclear or abbreviated names
    """
    from studio.agents.taxonomy.tools import analyze_naming as handler
    return handler(path=path, scope=scope)


@mcp.tool()
async def suggest_conventions(
    path: Annotated[str, Field(description="Directory to analyze for existing patterns")],
    language: Annotated[Literal["python", "javascript", "typescript", "lua", "auto"], Field(description="Language to generate conventions for")] = "auto",
) -> str:
    """Propose naming conventions for a codebase or module.

    Analyzes existing patterns and suggests standards to adopt.
    """
    from studio.agents.taxonomy.tools import suggest_conventions as handler
    return handler(path=path, language=language)


@mcp.tool()
async def report_issue(
    title: Annotated[str, Field(description="Short issue title (e.g., 'Inconsistent API naming in tasks.py')")],
    description: Annotated[str, Field(description="Detailed description: what's wrong, where, and recommended fix")],
    assignee: Annotated[str, Field(description="Agent to fix the issue: Programmer, Designer, Artist, Writer")],
    priority: Annotated[Literal["high", "medium", "low"], Field(description="Priority level based on impact")] = "medium",
) -> str:
    """Report a taxonomy/naming issue for another agent to fix.

    Creates a task for the responsible agent with specific rename recommendations.
    """
    from studio.agents.taxonomy.tools import report_issue as handler
    return handler(title=title, description=description, assignee=assignee, priority=priority)


# =============================================================================
# CONTEXT TOOLS - Prompt optimization
# =============================================================================

@mcp.tool()
async def count_tokens(
    path: Annotated[Optional[str], Field(description="File path relative to project root (e.g., 'studio/agents/designer/role.md')")] = None,
    text: Annotated[Optional[str], Field(description="Raw text to count (use instead of path for inline text)")] = None,
) -> str:
    """Estimate token count for a file or text.

    Use to check token budgets.
    """
    from studio.agents.context.tools import count_tokens as handler
    return handler(path=path, text=text)


@mcp.tool()
async def list_roles() -> str:
    """List all agent role.md files with token counts."""
    from studio.agents.context.tools import list_roles as handler
    return handler()




# =============================================================================
# FILE TOOLS - Report management
# =============================================================================

@mcp.tool()
async def write_report(
    filename: Annotated[str, Field(description="Name for the file (without extension), e.g., 'roblox-analysis'")],
    content: Annotated[str, Field(description="The full content to save")],
    format: Annotated[Literal["md", "txt", "json"], Field(description="File format")] = "md",
) -> str:
    """Save a long document or report to a file.

    Use this for outputs that are too long for chat.
    """
    from studio.core.file_tools import write_report as handler
    return handler(filename=filename, content=content, format=format)


@mcp.tool()
async def read_file(
    filename: Annotated[str, Field(description="The filename to read (with extension)")],
) -> str:
    """Read a file from the reports folder."""
    from studio.core.file_tools import read_file as handler
    return handler(filename=filename)


@mcp.tool()
async def list_reports() -> str:
    """List all saved reports."""
    from studio.core.file_tools import list_reports as handler
    return handler()


# =============================================================================
# SERVER ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    logger.info("Starting Game Studio MCP Server...")
    logger.info(f"Project root: {PROJECT_ROOT}")
    mcp.run(transport="stdio")
