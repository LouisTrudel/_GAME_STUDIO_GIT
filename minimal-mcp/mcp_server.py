"""
Minimal MCP Server - Memory + Compression

Tools:
  - remember(content, category) - Save to persistent memory
  - recall(category, query)     - Retrieve memory (optionally filtered)
  - compress(category)          - LLM-compress a memory file
  - task_add/task_list/task_done - Simple task tracking
  - context(content)            - Set/get project context

Usage:
  claude --mcp-config .claude/settings.json

Memory files stored in ./memory/
Tasks stored in ./tasks.json
"""

from mcp.server.mcpserver import MCPServer
from pathlib import Path
from datetime import datetime
import json
import os

mcp = MCPServer("workspace")

# === CONFIG ===

MEMORY_DIR = Path("memory")
TIER0_FILE = MEMORY_DIR / "tier0.md"
TASKS_FILE = Path("tasks.json")
CONTEXT_FILE = Path("context.md")
COMPRESS_THRESHOLD = 30_000  # 30KB triggers compression suggestion

# === HELPERS ===

def load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text())
    return {}

def save_json(path: Path, data: dict):
    path.write_text(json.dumps(data, indent=2))

def timestamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M")

def log_tier0(role: str, content: str):
    """Append to tier0 (raw conversation log)."""
    MEMORY_DIR.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%H:%M:%S")

    # Truncate very long content
    if len(content) > 3000:
        content = content[:3000] + "...[truncated]"

    entry = f"\n**[{ts}] {role}:**\n{content}\n"

    with open(TIER0_FILE, "a", encoding="utf-8") as f:
        f.write(entry)

# === TIER0 (RAW LOG) ===

@mcp.tool()
def log_user(message: str) -> str:
    """
    Log the user's message to tier0. Call at START of your response.

    Args:
        message: The user's message (copy exactly)
    """
    log_tier0("User", message)
    return "Logged user message"


@mcp.tool()
def log_response(summary: str) -> str:
    """
    Log your response summary to tier0. Call at END of every response.

    Args:
        summary: Brief summary of what you said/did (1-3 sentences)
    """
    log_tier0("Claude", summary)
    return "Logged response"


@mcp.tool()
def view_tier0(last_kb: int = 5) -> str:
    """
    View recent tier0 conversation log.

    Args:
        last_kb: KB of recent log to show (default 5)
    """
    if not TIER0_FILE.exists():
        return "No conversation logged yet."

    content = TIER0_FILE.read_text(encoding="utf-8")
    max_chars = last_kb * 1000

    if len(content) > max_chars:
        return f"[...showing last {last_kb}KB...]\n" + content[-max_chars:]
    return content


# === MEMORY TOOLS ===

@mcp.tool()
def remember(content: str, category: str = "general") -> str:
    """
    Save content to persistent memory.

    Args:
        content: What to remember (insights, decisions, findings)
        category: Memory category (general, decisions, blockers, learnings)

    Returns status and current memory size.
    """
    MEMORY_DIR.mkdir(exist_ok=True)
    file = MEMORY_DIR / f"{category}.md"

    # Append with timestamp
    entry = f"\n## [{timestamp()}]\n{content}\n"

    with open(file, "a", encoding="utf-8") as f:
        f.write(entry)

    size = file.stat().st_size
    hint = " Consider running compress() soon." if size > COMPRESS_THRESHOLD else ""

    return f"Remembered in '{category}'. Size: {size/1000:.1f}KB.{hint}"


@mcp.tool()
def recall(category: str = "general", last_kb: int = 4) -> str:
    """
    Recall memory from a category.

    Args:
        category: Which memory to recall (general, decisions, blockers, learnings)
        last_kb: How many KB of recent memory to return (default 4)

    Returns memory content or list of categories if none specified.
    """
    if category == "list":
        # List all memory categories
        if not MEMORY_DIR.exists():
            return "No memories yet."
        files = list(MEMORY_DIR.glob("*.md"))
        if not files:
            return "No memories yet."
        return "Categories: " + ", ".join(f.stem for f in files)

    file = MEMORY_DIR / f"{category}.md"
    if not file.exists():
        return f"No memories in '{category}'. Use recall('list') to see categories."

    content = file.read_text(encoding="utf-8")
    max_chars = last_kb * 1000

    if len(content) > max_chars:
        return f"[...truncated, showing last {last_kb}KB...]\n" + content[-max_chars:]
    return content


@mcp.tool()
def compress(category: str = "general") -> str:
    """
    Compress a memory file using LLM summarization.

    Archives the full content, replaces with compressed bullet points.
    Uses Claude CLI for compression.

    Args:
        category: Which memory category to compress
    """
    import subprocess

    file = MEMORY_DIR / f"{category}.md"
    if not file.exists():
        return f"No memory file for '{category}'"

    content = file.read_text(encoding="utf-8")
    if len(content) < 5000:
        return f"Memory too small to compress ({len(content)} chars). Wait until >5KB."

    # Archive original
    archive_dir = MEMORY_DIR / "archive"
    archive_dir.mkdir(exist_ok=True)
    archive_file = archive_dir / f"{category}_{datetime.now():%Y%m%d_%H%M%S}.md"
    archive_file.write_text(content, encoding="utf-8")

    # Compress with Claude CLI (Haiku for speed/cost)
    prompt = f"""Compress this memory log into concise bullet points.

KEEP: Key decisions, important findings, blockers, action items
DROP: Redundant info, chatter, obvious details, timestamps

Be concise. Output ONLY bullet points.

---
{content}
---

Compressed bullets:"""

    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--model", "haiku"],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return f"Compression failed: {result.stderr[:200]}"

        compressed = result.stdout.strip()

        # Write compressed version
        header = f"# {category.title()} Memory (compressed {timestamp()})\n\n"
        file.write_text(header + compressed, encoding="utf-8")

        ratio = len(compressed) / len(content) * 100
        return f"Compressed {len(content)} -> {len(compressed)} chars ({ratio:.0f}%). Archived original."

    except subprocess.TimeoutExpired:
        return "Compression timed out"
    except FileNotFoundError:
        return "Claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code"


# === TASK TOOLS ===

@mcp.tool()
def task_add(description: str, priority: str = "normal") -> str:
    """
    Add a task to the list.

    Args:
        description: What needs to be done
        priority: low, normal, high
    """
    data = load_json(TASKS_FILE)
    tasks = data.get("tasks", [])

    task_id = f"T{len(tasks) + 1:03d}"
    tasks.append({
        "id": task_id,
        "description": description,
        "priority": priority,
        "status": "pending",
        "created": timestamp()
    })

    data["tasks"] = tasks
    save_json(TASKS_FILE, data)

    return f"Added {task_id}: {description}"


@mcp.tool()
def task_list(status: str = "pending") -> str:
    """
    List tasks.

    Args:
        status: Filter by status (pending, done, all)
    """
    data = load_json(TASKS_FILE)
    tasks = data.get("tasks", [])

    if not tasks:
        return "No tasks yet."

    if status != "all":
        tasks = [t for t in tasks if t["status"] == status]

    if not tasks:
        return f"No {status} tasks."

    lines = []
    for t in tasks:
        marker = "x" if t["status"] == "done" else " "
        pri = f"[{t['priority']}]" if t["priority"] != "normal" else ""
        lines.append(f"[{marker}] {t['id']}: {t['description']} {pri}")

    return "\n".join(lines)


@mcp.tool()
def task_done(task_id: str) -> str:
    """
    Mark a task as done.

    Args:
        task_id: Task ID (e.g., T001)
    """
    data = load_json(TASKS_FILE)
    tasks = data.get("tasks", [])

    for t in tasks:
        if t["id"].upper() == task_id.upper():
            if t["status"] == "done":
                return f"{task_id} already done"
            t["status"] = "done"
            t["completed"] = timestamp()
            save_json(TASKS_FILE, data)
            return f"{task_id} marked done"

    return f"{task_id} not found"


# === MEMORY INJECTION ===

@mcp.tool()
def inject_memory() -> str:
    """
    Load memory context from previous sessions. Call this at session start.

    Returns episodic history (what happened) + narrative context (the story).
    """
    mode = "full"
    EPISODIC_DIR = MEMORY_DIR / "episodic"
    NARRATIVE_DIR = MEMORY_DIR / "narrative"
    SEMANTIC_DIR = MEMORY_DIR / "semantic"

    LIMITS = {
        "tier0_tail": 5_000,
        "tier1_full": 15_000,
        "draft_tail": 5_000,
        "chapter_full": 20_000,
        "semantic": 3_000,
    }

    def read_file(path, max_chars=None):
        if not path.exists():
            return ""
        content = path.read_text(encoding="utf-8").strip()
        if max_chars and len(content) > max_chars:
            return content[:max_chars] + "\n\n[...truncated...]"
        return content

    def read_tail(path, max_chars):
        if not path.exists():
            return ""
        content = path.read_text(encoding="utf-8").strip()
        if len(content) <= max_chars:
            return content
        return "[...earlier content...]\n\n" + content[-max_chars:]

    sections = []

    # Episodic
    if mode in ("full", "episodic"):
        tier0 = read_tail(EPISODIC_DIR / "tier0.md", LIMITS["tier0_tail"])
        if tier0:
            sections.append(f"## Recent Events\n{tier0}")

        tier1 = read_file(EPISODIC_DIR / "tier1.md", LIMITS["tier1_full"])
        if tier1:
            sections.append(f"## Event History\n{tier1}")

    # Narrative
    if mode in ("full", "narrative"):
        draft = read_tail(NARRATIVE_DIR / "draft.md", LIMITS["draft_tail"])
        if draft:
            sections.append(f"## Current Session\n{draft}")

        chapter = read_file(NARRATIVE_DIR / "chapter.md", LIMITS["chapter_full"])
        if chapter:
            sections.append(f"## Story So Far\n{chapter}")

    # Semantic
    if mode in ("full", "minimal", "semantic"):
        if SEMANTIC_DIR.exists():
            for md_file in SEMANTIC_DIR.glob("*.md"):
                content = read_file(md_file, LIMITS["semantic"])
                if content:
                    sections.append(f"## {md_file.stem.title()}\n{content}")

    # Minimal mode: just tier1
    if mode == "minimal":
        tier1 = read_file(EPISODIC_DIR / "tier1.md", LIMITS["tier1_full"])
        if tier1:
            sections.insert(0, f"## History\n{tier1}")

    if not sections:
        return "No memory context yet. Start working and it will accumulate."

    total = sum(len(s) for s in sections)
    return f"# Memory Context (~{total//4} tokens)\n\n" + "\n\n---\n\n".join(sections)


# === COMPRESS TOOL ===

@mcp.tool()
def compress_memory() -> str:
    """
    Manually trigger memory compression. Use when memory feels bloated.

    Compresses episodic (tier0→tier1) and narrative (draft→chapter) if thresholds exceeded.
    """
    import subprocess

    try:
        result = subprocess.run(
            ["python", "hooks/compress.py"],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=Path(__file__).parent,
            shell=True
        )
        # Parse output for summary
        output = result.stderr or result.stdout
        if "Compressed" in output:
            return f"Compression complete.\n{output}"
        elif "Rate limited" in output:
            return "Rate limited - compression ran recently. Try again in ~60s."
        elif "Another compression" in output:
            return "Compression already in progress."
        else:
            return f"Compression finished.\n{output}"
    except subprocess.TimeoutExpired:
        return "Compression timed out (>5min)"
    except Exception as e:
        return f"Compression error: {e}"


# === CONTEXT TOOL ===

@mcp.tool()
def context(content: str = None) -> str:
    """
    Get or set project context.

    Args:
        content: If provided, sets new context. If empty, returns current context.

    Use this at session start to establish what you're working on.
    """
    if content:
        CONTEXT_FILE.write_text(content, encoding="utf-8")
        return "Context updated."

    if CONTEXT_FILE.exists():
        return CONTEXT_FILE.read_text(encoding="utf-8")

    return "No context set. Call context('describe your project here') to set one."


# === RUN ===

if __name__ == "__main__":
    mcp.run(transport="stdio")
