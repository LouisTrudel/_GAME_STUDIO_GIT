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

# Try to import rapidfuzz once at module load
try:
    from rapidfuzz import fuzz, process
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    RAPIDFUZZ_AVAILABLE = False

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


def _fuzzy_resolve_path(path: str, threshold: int = 80) -> tuple[Path, str]:
    """Resolve path with fuzzy matching for typos.

    Returns (resolved_path, note) where note explains any correction made.
    If exact match exists, returns it immediately.
    If fuzzy match found, returns (corrected_path, "corrected: X -> Y")
    If no match, returns (original_path, "not found")
    """
    file_path = PROJECT_ROOT / path

    # Exact match - fast path
    if file_path.exists():
        return file_path, ""

    if not RAPIDFUZZ_AVAILABLE:
        return file_path, "not found (rapidfuzz unavailable for fuzzy matching)"

    # Try fuzzy matching against existing files
    path_parts = Path(path).parts

    # Get candidate paths in likely directories
    candidates = []
    search_dirs = [PROJECT_ROOT]

    # Add parent directories from the path
    if len(path_parts) > 1:
        partial = PROJECT_ROOT
        for part in path_parts[:-1]:
            # Fuzzy match each directory level
            if partial.exists():
                subdirs = [d for d in partial.iterdir() if d.is_dir()]
                subdir_names = [d.name for d in subdirs]
                if subdir_names:
                    matches = process.extract(part, subdir_names, scorer=fuzz.ratio, limit=1)
                    if matches and matches[0][1] >= threshold:
                        partial = partial / matches[0][0]
                    else:
                        partial = partial / part
                else:
                    partial = partial / part
            else:
                break
        if partial.exists():
            search_dirs = [partial]

    # Collect candidate files
    for search_dir in search_dirs:
        if search_dir.exists():
            for ext in ("*.py", "*.js", "*.ts", "*.lua", "*.json", "*.md"):
                candidates.extend(search_dir.rglob(ext))

    if not candidates:
        return file_path, "not found"

    # Get just filenames for matching
    target_name = path_parts[-1] if path_parts else path
    candidate_names = [c.name for c in candidates]

    matches = process.extract(target_name, candidate_names, scorer=fuzz.ratio, limit=3)

    if matches and matches[0][1] >= threshold:
        best_name = matches[0][0]
        # Find the actual path
        for c in candidates:
            if c.name == best_name:
                rel_path = c.relative_to(PROJECT_ROOT)
                return c, f"corrected: {path} -> {rel_path}"

    return file_path, "not found"


# =============================================================================
# BOSS TOOLS - Task delegation and studio management
# =============================================================================

@mcp.tool()
async def create_task(
    what: Annotated[str, Field(description="Deliverable in imperative form. Single sentence.")],
    files: Annotated[Optional[list[str]], Field(description="File paths with line hints. e.g., ['studio-ui.js:17-50']")] = None,
    constraints: Annotated[Optional[list[str]], Field(description="What NOT to do. e.g., ['No CSS changes']")] = None,
    assignee: Annotated[Optional[str], Field(description="Agent: Design, Code, ArtSpec, Text, Audit, Prompt, Research, Raw")] = None,
    dependencies: Annotated[Optional[list[str]], Field(description="Task IDs that must complete first")] = None,
    backend: Annotated[Optional[str], Field(description="For Raw tasks: 'gemini', 'claude', 'ollama'")] = None,
) -> str:
    """Create task with structured format: [F] files [X] constraints [>] what

    Order optimized for agent attention (10-80-10 rule):
    FILES first (orient), CONSTRAINTS middle (guard), WHAT last (execute)
    """
    from studio.agents.boss.tools import create_task as handler
    return handler(what=what, files=files, constraints=constraints, assignee=assignee, dependencies=dependencies, backend=backend)


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
    query: Annotated[str, Field(description="Search term. Examples: 'economy', 'T123', 'inventory bug'")] = "",
    max_results: Annotated[int, Field(description="Max results to return", ge=1, le=20)] = 5,
    search_logs: Annotated[bool, Field(description="Also search raw logs if tiers have no match")] = True,
    fuzzy: Annotated[bool, Field(description="Enable fuzzy matching for typos/variations")] = False,
    threshold: Annotated[int, Field(description="Fuzzy match threshold 0-100")] = 70,
) -> str:
    """Search memory tiers for relevant context.

    Uses AB tiered compression model:
    - Tier 0: Recent session messages (most detail)
    - Tier 1+: Compressed summaries from older sessions

    Call with no query to see recent memories.
    Set fuzzy=True to find results with typos (e.g., 'economi' finds 'economy').
    """
    from studio.agents.boss.tools import recall_memory as handler

    # Try exact match first
    result = handler(query=query, max_results=max_results, search_logs=search_logs)

    # If no results and fuzzy enabled, try fuzzy search
    if fuzzy and RAPIDFUZZ_AVAILABLE and "No matches" in result and query:
        fuzzy_result = await _fuzzy_memory_search(query, max_results, threshold)
        if fuzzy_result:
            return fuzzy_result

    return result


async def _fuzzy_memory_search(query: str, max_results: int, threshold: int) -> str:
    """Fuzzy search through memory tiers."""
    from studio.core.memory import memory_manager

    query_lower = query.lower()
    matches = []

    # Search through tiers
    for tier_idx in range(10):
        content = memory_manager.get_tier(tier_idx)
        if not content:
            break

        # Split into chunks and fuzzy match
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if not line.strip():
                continue

            score = fuzz.partial_ratio(query_lower, line.lower())
            if score >= threshold:
                # Get context (surrounding lines)
                start = max(0, i - 1)
                end = min(len(lines), i + 2)
                snippet = '\n'.join(lines[start:end])
                matches.append((score, tier_idx, snippet))

    if not matches:
        return ""

    # Sort by score, limit results
    matches.sort(key=lambda x: x[0], reverse=True)
    matches = matches[:max_results]

    lines = [f"=== FUZZY MEMORY RECALL: '{query}' ===\n"]
    for score, tier, snippet in matches:
        lines.append(f"[Tier {tier}] ({score}% match)")
        lines.append(f"  {snippet[:200]}")
        lines.append("")

    return '\n'.join(lines)


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
    agent_name: Annotated[str, Field(description="Your agent name (Design, Code, etc.)")],
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


@mcp.tool()
async def get_token_metrics(
    agent: Annotated[Optional[str], Field(description="Filter by agent name (optional)")] = None,
    task_id: Annotated[Optional[str], Field(description="Filter by task ID (optional)")] = None,
) -> str:
    """Get current session token usage metrics.

    Returns: total tokens, breakdown by agent, cache stats.
    Use to self-report token usage in research tasks.
    """
    from studio.core.studio_metrics import get_session_tokens

    data = get_session_tokens()

    lines = [
        f"Session: {data['session_start']}",
        f"Total: {data['total_input_tokens']:,} in / {data['total_output_tokens']:,} out",
        f"Cache: {data.get('total_cache_read_tokens', 0):,} read / {data.get('total_cache_creation_tokens', 0):,} created",
        "",
    ]

    # Filter by agent
    if agent and agent in data.get('by_agent', {}):
        a = data['by_agent'][agent]
        lines.append(f"Agent {agent}: {a.get('input', 0):,} in / {a.get('output', 0):,} out")
    elif not agent:
        lines.append("By Agent:")
        for a_name, a_data in data.get('by_agent', {}).items():
            lines.append(f"  {a_name}: {a_data.get('input', 0):,} in / {a_data.get('output', 0):,} out")

    # Filter by task
    if task_id and task_id in data.get('by_task', {}):
        t = data['by_task'][task_id]
        lines.append(f"Task {task_id}: {t.get('input', 0):,} in / {t.get('output', 0):,} out")

    return '\n'.join(lines)


# =============================================================================
# QA TOOLS - Testing and bug reporting
# =============================================================================

@mcp.tool()
async def report_bug(
    title: Annotated[str, Field(description="Short bug title (e.g., 'Shop button unresponsive')")],
    assignee: Annotated[str, Field(description="Agent to fix the bug: Code, Design, ArtSpec, Text")] = "Code",
    description: Annotated[str, Field(description="Bug details: steps to reproduce, expected vs actual")] = "",
    severity: Annotated[Literal["critical", "major", "minor", "polish"], Field(description="Bug severity level")] = "major",
) -> str:
    """Report a bug found during testing.

    Creates a task for the responsible agent to fix it.
    """
    from studio.agents.audit.tools import report_bug as handler
    return handler(title=title, assignee=assignee, description=description, severity=severity)


@mcp.tool()
async def check_files(
    paths: Annotated[list[str], Field(description="List of file paths to check (relative to project root)")],
) -> str:
    """Verify that expected files exist.

    Use to confirm deliverables were created.
    Auto-corrects path typos using fuzzy matching.
    """
    results = []
    corrections = []

    for path in paths:
        file_path, correction_note = _fuzzy_resolve_path(path)

        if file_path.exists():
            size = file_path.stat().st_size
            if correction_note and "corrected" in correction_note:
                corrections.append(f"  [{correction_note}]")
                results.append(f"  [OK] {file_path.relative_to(PROJECT_ROOT)} ({size} bytes)")
            else:
                results.append(f"  [OK] {path} ({size} bytes)")
        else:
            results.append(f"  [MISSING] {path}")

    missing = sum(1 for r in results if "[MISSING]" in r)
    header = f"File check: {len(paths) - missing}/{len(paths)} found"

    output = header + "\n" + "\n".join(results)
    if corrections:
        output += "\n\nPath corrections:\n" + "\n".join(corrections)

    return output


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
    from studio.agents.audit.tools import test_summary as handler
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
    from studio.agents.structure.tools import analyze_naming as handler
    return handler(path=path, scope=scope)


@mcp.tool()
async def suggest_conventions(
    path: Annotated[str, Field(description="Directory to analyze for existing patterns")],
    language: Annotated[Literal["python", "javascript", "typescript", "lua", "auto"], Field(description="Language to generate conventions for")] = "auto",
) -> str:
    """Propose naming conventions for a codebase or module.

    Analyzes existing patterns and suggests standards to adopt.
    """
    from studio.agents.structure.tools import suggest_conventions as handler
    return handler(path=path, language=language)


@mcp.tool()
async def report_issue(
    title: Annotated[str, Field(description="Short issue title (e.g., 'Inconsistent API naming in tasks.py')")],
    description: Annotated[str, Field(description="Detailed description: what's wrong, where, and recommended fix")],
    assignee: Annotated[str, Field(description="Agent to fix the issue: Code, Design, ArtSpec, Text")],
    priority: Annotated[Literal["high", "medium", "low"], Field(description="Priority level based on impact")] = "medium",
) -> str:
    """Report a taxonomy/naming issue for another agent to fix.

    Creates a task for the responsible agent with specific rename recommendations.
    """
    from studio.agents.structure.tools import report_issue as handler
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
    from studio.agents.prompt.tools import count_tokens as handler
    return handler(path=path, text=text)


@mcp.tool()
async def list_roles() -> str:
    """List all agent role.md files with token counts."""
    from studio.agents.prompt.tools import list_roles as handler
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
    """Read a file from the reports folder.

    Auto-corrects filename typos using fuzzy matching.
    """
    from studio.core.file_tools import read_file as handler, REPORTS_DIR

    # Try direct read first
    result = handler(filename=filename)

    # If not found and fuzzy available, try fuzzy match
    if "File not found" in result and RAPIDFUZZ_AVAILABLE:
        # Get all report files
        report_files = list(REPORTS_DIR.glob("*"))
        if report_files:
            file_names = [f.name for f in report_files]
            matches = process.extract(filename, file_names, scorer=fuzz.ratio, limit=1)
            if matches and matches[0][1] >= 70:
                corrected = matches[0][0]
                result = handler(corrected)
                if "File not found" not in result:
                    return f"[corrected: {filename} -> {corrected}]\n\n{result}"

    return result


@mcp.tool()
async def list_reports() -> str:
    """List all saved reports."""
    from studio.core.file_tools import list_reports as handler
    return handler()


# =============================================================================
# SMART FILE TOOLS - Token-efficient alternatives to Read/Write
# =============================================================================

@mcp.tool()
async def search_code(
    pattern: Annotated[str, Field(description="Search pattern. Examples: 'def login', 'class User', 'TODO'")],
    path: Annotated[str, Field(description="REQUIRED: File path (studio/core/tasks.py) or folder (studio/core/). Be specific!")] = "",
    context_lines: Annotated[int, Field(description="Lines of context around matches (default: 2)")] = 2,
    fuzzy: Annotated[bool, Field(description="Enable fuzzy matching for typos/variations (default: False)")] = False,
    threshold: Annotated[int, Field(description="Fuzzy match threshold 0-100 (default: 70). Higher = stricter.")] = 70,
) -> str:
    """Search for code patterns in a SPECIFIC file or folder.

    ALWAYS provide path parameter to avoid searching entire project.
    - File: path="studio/core/tasks.py" (searches one file)
    - Folder: path="studio/core/" (searches folder)

    Returns matching lines with line numbers. Use read_lines() after to get full context.
    """
    import subprocess
    import os

    if not path:
        return "ERROR: path parameter required. Specify file (studio/core/tasks.py) or folder (studio/core/)."

    search_path = PROJECT_ROOT / path
    if not search_path.exists():
        return f"ERROR: path '{path}' not found. Check spelling or use file_outline() to discover files."

    scope = "file" if search_path.is_file() else f"folder ({len(list(search_path.rglob('*.py')))} .py files)"

    # Fuzzy search mode - uses rapidfuzz
    if fuzzy:
        result = await _fuzzy_search(pattern, search_path, threshold)
        return f"[Searched: {scope}]\n{result}"

    try:
        # Try ripgrep first (fast, cross-platform)
        try:
            cmd = ["rg", "-n", f"-C{context_lines}", "--max-count", "20", pattern, str(search_path)]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0 and result.stdout:
                lines = result.stdout.strip().split('\n')
                header = f"[Searched: {scope}]\n"
                if len(lines) > 50:
                    return header + '\n'.join(lines[:50]) + f"\n\n... ({len(lines) - 50} more matches)"
                return header + result.stdout
            elif result.returncode == 1:
                return f"[Searched: {scope}]\nNo matches found for '{pattern}'"
        except FileNotFoundError:
            pass  # rg not installed, try fallback

        # Windows fallback: Python-based search
        if os.name == 'nt':
            matches = []
            pattern_lower = pattern.lower()

            # If path is a file, search only that file
            if search_path.is_file():
                files_to_search = [search_path]
            else:
                files_to_search = list(search_path.rglob("*.py"))[:50]  # Limit files

            for py_file in files_to_search:
                try:
                    with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
                        for i, line in enumerate(f, 1):
                            if pattern_lower in line.lower():
                                rel_path = py_file.relative_to(PROJECT_ROOT)
                                matches.append(f"{rel_path}:{i}: {line.rstrip()[:100]}")
                                if len(matches) >= 30:
                                    break
                except Exception:
                    continue
                if len(matches) >= 30:
                    break

            header = f"[Searched: {scope}]\n"
            if matches:
                return header + '\n'.join(matches)
            return header + f"No matches found for '{pattern}'"

        # Unix fallback: use grep
        cmd = ["grep", "-rn", f"-C{context_lines}", pattern, str(search_path)]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.stdout:
            lines = result.stdout.strip().split('\n')[:40]
            return '\n'.join(lines)
        return f"No matches found for '{pattern}'"

    except Exception as e:
        return f"Search error: {e}"


async def _fuzzy_search(pattern: str, search_path: Path, threshold: int = 70) -> str:
    """Fuzzy search using rapidfuzz for typo-tolerant matching."""
    if not RAPIDFUZZ_AVAILABLE:
        return "Error: rapidfuzz not installed. Run: pip install rapidfuzz"

    matches = []
    search_dir = search_path if search_path.is_dir() else search_path.parent
    pattern_lower = pattern.lower()

    # Search common code files
    extensions = ("*.py", "*.js", "*.ts", "*.lua", "*.json", "*.md")

    for ext in extensions:
        for code_file in search_dir.rglob(ext):
            try:
                with open(code_file, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines, 1):
                        # Check each word/token in the line
                        line_lower = line.lower()
                        # Quick exact check first (fast path)
                        if pattern_lower in line_lower:
                            score = 100
                        else:
                            # Fuzzy match against line content
                            score = fuzz.partial_ratio(pattern_lower, line_lower)

                        if score >= threshold:
                            rel_path = code_file.relative_to(PROJECT_ROOT)
                            matches.append((score, f"{rel_path}:{i}: {line.rstrip()[:100]}"))
                            if len(matches) >= 30:
                                break
            except Exception:
                continue
            if len(matches) >= 30:
                break
        if len(matches) >= 30:
            break

    if matches:
        # Sort by score descending
        matches.sort(key=lambda x: x[0], reverse=True)
        result_lines = [f"[{m[0]}%] {m[1]}" for m in matches[:20]]
        return '\n'.join(result_lines)

    return f"No fuzzy matches found for '{pattern}' (threshold: {threshold}%)"


@mcp.tool()
async def read_lines(
    path: Annotated[str, Field(description="File path relative to project root")],
    start_line: Annotated[int, Field(description="First line to read (1-indexed)")],
    end_line: Annotated[int, Field(description="Last line to read (inclusive). Max 200 lines per call.")],
) -> str:
    """Read specific lines from a file - use search_code first to find what you need.

    Max 200 lines per call - covers most functions/classes with context.
    For larger sections, make multiple calls or reconsider your approach.
    Auto-corrects path typos using fuzzy matching.
    """
    file_path, correction_note = _fuzzy_resolve_path(path)

    if not file_path.exists():
        return f"File not found: {path}"

    # Show correction if path was fixed
    path_display = str(file_path.relative_to(PROJECT_ROOT)) if correction_note else path
    correction_msg = f"\n[{correction_note}]\n" if correction_note and "corrected" in correction_note else ""

    # Enforce max 200 lines
    if end_line - start_line > 200:
        return f"Too many lines requested ({end_line - start_line}). Max is 200. Use search_code to find specific sections."

    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()

        total_lines = len(lines)
        start_idx = max(0, start_line - 1)
        end_idx = min(total_lines, end_line)

        selected = lines[start_idx:end_idx]

        result = f"{correction_msg}# {path_display} (lines {start_line}-{end_line} of {total_lines})\n\n"
        for i, line in enumerate(selected, start=start_line):
            result += f"{i:4}: {line}"

        return result
    except Exception as e:
        return f"Error reading {path_display}: {e}"


@mcp.tool()
async def file_outline(
    path: Annotated[str, Field(description="File path relative to project root")],
) -> str:
    """Get structure of a file (functions, classes, imports) WITHOUT reading full content.

    Use this to understand file structure before deciding what to read.
    Auto-corrects path typos using fuzzy matching.
    """
    file_path, correction_note = _fuzzy_resolve_path(path)

    if not file_path.exists():
        return f"File not found: {path}"

    # Show correction if path was fixed
    path_display = str(file_path.relative_to(PROJECT_ROOT)) if correction_note else path
    correction_msg = f"[{correction_note}]\n" if correction_note and "corrected" in correction_note else ""

    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()

        outline = [f"{correction_msg}# {path_display} ({len(lines)} lines)\n"]

        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            # Python patterns
            if stripped.startswith('def ') or stripped.startswith('async def '):
                outline.append(f"{i:4}: {stripped.split('(')[0]}(...)")
            elif stripped.startswith('class '):
                outline.append(f"{i:4}: {stripped.split('(')[0].split(':')[0]}")
            elif stripped.startswith('import ') or stripped.startswith('from '):
                if len(outline) < 20:  # Limit imports shown
                    outline.append(f"{i:4}: {stripped}")
            # JS/TS patterns
            elif 'function ' in stripped or stripped.startswith('export '):
                outline.append(f"{i:4}: {stripped[:60]}...")
            # Lua patterns
            elif stripped.startswith('function ') or stripped.startswith('local function'):
                outline.append(f"{i:4}: {stripped.split('(')[0]}(...)")

        if len(outline) == 1:
            outline.append("(no functions/classes detected - may be config or data file)")

        return '\n'.join(outline)
    except Exception as e:
        return f"Error reading {path}: {e}"


@mcp.tool()
async def edit_file(
    path: Annotated[str, Field(description="File path relative to project root")],
    old_content: Annotated[str, Field(description="Exact content to find and replace (must match exactly, or use fuzzy=True)")],
    new_content: Annotated[str, Field(description="New content to replace it with")],
    fuzzy: Annotated[bool, Field(description="Enable fuzzy matching for whitespace/minor differences (default: False)")] = False,
    threshold: Annotated[int, Field(description="Fuzzy match threshold 0-100 (default: 90). Higher = stricter.")] = 90,
) -> str:
    """Replace content in a file - safe string-based editing.

    SAFER than line-based edits because:
    - Fails if old_content not found (no silent corruption)
    - Fails if multiple matches (forces you to be specific)
    - Works correctly across multiple edits (no line number shift issues)

    Use search_code + read_lines first to find the exact content to replace.
    Include enough context (surrounding lines) to make old_content unique.

    Fuzzy mode: Set fuzzy=True to handle whitespace/minor differences.
    """
    file_path = PROJECT_ROOT / path

    if not file_path.exists():
        return f"ERROR: File not found: {path}"

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        actual_old_content = old_content
        fuzzy_note = ""

        # Exact match first
        if old_content not in content:
            if fuzzy:
                # Try fuzzy matching
                match_result = _fuzzy_find_content(content, old_content, threshold)
                if match_result:
                    actual_old_content, score = match_result
                    fuzzy_note = f" (fuzzy match {score}%)"
                else:
                    preview = old_content[:50].replace('\n', '\\n')
                    return f"ERROR: No fuzzy match found (threshold={threshold}%). Looking for: '{preview}...'"
            else:
                # Try to help with diagnostics
                preview = old_content[:50].replace('\n', '\\n')
                hint = ""
                # Check for whitespace issues
                normalized_old = ' '.join(old_content.split())
                normalized_content = ' '.join(content.split())
                if normalized_old in normalized_content:
                    hint = "\nHINT: Content exists but whitespace differs. Try fuzzy=True"
                return f"ERROR: Content not found in {path}. Looking for: '{preview}...'{hint}\nUse read_lines to verify exact content."

        # Validate: content must be unique
        match_count = content.count(actual_old_content)
        if match_count > 1:
            return f"ERROR: Found {match_count} matches in {path}. Include more surrounding context to make it unique."

        # Validate: new content must be different
        if actual_old_content == new_content:
            return f"ERROR: old_content and new_content are identical. Nothing to change."

        # Perform replacement
        new_file_content = content.replace(actual_old_content, new_content, 1)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_file_content)

        # Report what changed
        old_lines = len(actual_old_content.split('\n'))
        new_lines = len(new_content.split('\n'))
        diff = new_lines - old_lines
        diff_str = f"+{diff}" if diff > 0 else str(diff) if diff < 0 else "±0"

        return f"OK: Replaced {old_lines} lines with {new_lines} lines ({diff_str}) in {path}{fuzzy_note}"
    except Exception as e:
        return f"ERROR: {e}"


def _fuzzy_find_content(content: str, target: str, threshold: int) -> tuple[str, int] | None:
    """Find content in file using fuzzy matching.

    Slides a window of similar size to target through content,
    looking for best fuzzy match above threshold.

    Returns (matched_content, score) or None if no match found.
    """
    if not RAPIDFUZZ_AVAILABLE:
        return None

    target_lines = target.split('\n')
    target_len = len(target_lines)
    content_lines = content.split('\n')

    best_match = None
    best_score = 0
    best_start = 0

    # Slide window through content
    for i in range(len(content_lines) - target_len + 1):
        window = '\n'.join(content_lines[i:i + target_len])
        score = fuzz.ratio(target, window)

        if score > best_score:
            best_score = score
            best_match = window
            best_start = i

    if best_score >= threshold:
        return (best_match, best_score)

    return None


@mcp.tool()
async def edit_lines(
    path: Annotated[str, Field(description="File path relative to project root")],
    start_line: Annotated[int, Field(description="First line to replace (1-indexed)")],
    end_line: Annotated[int, Field(description="Last line to replace (inclusive)")],
    new_content: Annotated[str, Field(description="New content to insert")],
) -> str:
    """DEPRECATED: Use edit_file instead for safer string-based editing.

    This line-based edit is fragile - line numbers shift after edits.
    Kept for backwards compatibility but edit_file is recommended.
    """
    file_path = PROJECT_ROOT / path

    if not file_path.exists():
        return f"ERROR: File not found: {path}"

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Validate range
        if start_line < 1 or end_line > len(lines) or start_line > end_line:
            return f"ERROR: Invalid line range {start_line}-{end_line}. File has {len(lines)} lines."

        # Get old content for verification message
        old_content = ''.join(lines[start_line-1:end_line])

        # Replace lines
        new_lines = [line if line.endswith('\n') else line + '\n' for line in new_content.split('\n')]
        # Don't add newline to last line if original didn't have one
        if new_content and not new_content.endswith('\n') and new_lines:
            new_lines[-1] = new_lines[-1].rstrip('\n')

        lines[start_line-1:end_line] = new_lines

        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        return f"OK: Replaced lines {start_line}-{end_line} in {path} (consider using edit_file for safer edits)"
    except Exception as e:
        return f"ERROR: {e}"


# =============================================================================
# SESSION MANAGEMENT (optional - sessions auto-compact)
# =============================================================================

@mcp.tool()
async def session_stats() -> str:
    """View agent session statistics.

    Sessions auto-compact, so clearing is rarely needed.
    Use this to monitor session sizes.
    """
    try:
        from backends.backends.persistent_claude_cli import get_session_stats
        stats = get_session_stats()

        lines = [f"Active sessions: {stats['total_sessions']}",
                 f"Total size: {stats['total_size_kb']} KB", ""]

        for agent, info in stats['sessions'].items():
            if info['exists']:
                lines.append(f"  {agent}: {info['size_kb']} KB")

        return '\n'.join(lines)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def clear_agent_session(
    agent_name: Annotated[str, Field(description="Agent name to clear (e.g., 'Code', 'BOSS')")],
) -> str:
    """Clear a specific agent's session.

    Only use if an agent seems stuck or confused.
    Sessions auto-compact, so this is rarely needed.
    """
    try:
        from backends.backends.persistent_claude_cli import clear_session
        if clear_session(agent_name):
            return f"Session cleared for {agent_name}. Next task will reinitialize."
        return f"No session found for {agent_name}"
    except Exception as e:
        return f"Error: {e}"


# =============================================================================
# SERVER ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    logger.info("Starting Game Studio MCP Server...")
    logger.info(f"Project root: {PROJECT_ROOT}")
    mcp.run(transport="stdio")
