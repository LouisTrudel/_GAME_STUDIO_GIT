"""
StudioAgent - Individual agent wrapper for the Game Studio.

Each agent reads from the shared hub and uses task tools to communicate.

Backend: "claude-cli" (uses Claude Code CLI with MCP tools)

For custom tool enforcement, configure MCP server (mcp_server.py).
Tools are enforced at protocol level via MCP, not prompt level.
"""

import time
from pathlib import Path
from backends import Agent

from studio.core import hub, task_manager, TaskStatus
from studio.core.logging_config import get_logger
from studio.core.file_index import get_file_tree
from studio.core.projects import project_manager
from studio.loader import (
    AGENTS_DIR,
    load_agent_role_md,
    load_agent_config,
)

logger = get_logger("Agent")


def _truncate_for_hub(response: str, max_chars: int = 300) -> str:
    """Extract hub summary from agent response.

    Format expected:
        T### VERB: summary
        - file:line context
        - +added -removed
        ---
        [full deliverable]

    Extracts everything before first '---' separator.
    Falls back to first paragraph or truncation.
    """
    if len(response) <= max_chars:
        return response

    # Try to extract summary block (everything before ---)
    separator_pos = response.find("\n---")
    if separator_pos > 0:
        summary = response[:separator_pos].strip()
        if len(summary) <= max_chars:
            return summary

    # Fallback: T### VERB line + bullets
    lines = response.split('\n')
    summary_lines = []
    for line in lines:
        stripped = line.strip()
        # Stop at separator
        if stripped.startswith('---'):
            break
        # Capture T### lines and bullets
        if stripped.startswith('T') or stripped.startswith('- '):
            summary_lines.append(stripped)
        # Also capture FIXED/ADDED/etc lines (legacy or variations)
        elif any(stripped.startswith(v) for v in ('FIXED', 'ADDED', 'UPDATED', 'FOUND', 'TRACED', 'BLOCKED')):
            summary_lines.append(stripped)

    if summary_lines:
        result = '\n'.join(summary_lines)
        if len(result) <= max_chars:
            return result

    # Last resort: truncate at max_chars
    return response[:max_chars].rsplit(" ", 1)[0] + "..."


class StudioAgent:
    """An agent that reads/writes to the shared hub and uses task tools."""

    # Class-level tracking for BOSS initialization (persists across calls)
    _boss_initialized: bool = False

    def __init__(self, name: str, backend: str = "claude-cli"):
        self.name_raw = name
        config = load_agent_config(name)

        self.name = config.get("name", name)
        self.title = config.get("title", "Agent")
        self.color = config.get("color", "#888")
        self.model = config.get("model", "claude")
        self.max_turns = config.get("max_turns", None)  # Limits Claude CLI tool loops
        self.is_boss = "boss" in name.lower()
        self.is_vanilla = config.get("vanilla", False)

        # Override backend from config if specified
        backend = config.get("backend", backend)

        # Load role from markdown
        self._role_md = load_agent_role_md(name)
        logger.info("[%s] Loaded role.md: %d chars, is_vanilla=%s", self.name, len(self._role_md), self.is_vanilla)

        # Build system prompt from role only (skills system removed)
        system_prompt = self._build_system_prompt(self._role_md)

        # Load tool handlers (MCP server handles tool enforcement now)
        _, handlers = self._load_tools()

        self.agent = Agent(
            name=self.name,
            system_prompt=system_prompt,
            backend=backend,
            model=self.model,
            max_turns=self.max_turns,
            tools=[],
            tool_handlers=handlers,
        )
        logger.info("[%s] Using backend: %s", self.name, backend)

    def get_role_md(self) -> str:
        """Get raw role.md content."""
        return self._role_md

    def get_skills_content(self) -> str:
        """Get combined skills content - returns empty (skills system removed)."""
        return ""

    def _build_system_prompt(self, role_md: str) -> str:
        """Build system prompt from role + MCP awareness."""
        mcp_line = "You are a Game-Studio MCP agent. Use mcp__game-studio__* tools: search_code, read_lines (max 200 lines), file_outline."
        if role_md:
            return mcp_line + "\n\n## ROLE\n\n" + role_md
        return mcp_line

    def _load_tools(self) -> tuple[list, dict]:
        """Load tools for this agent."""
        tools = []
        handlers = {}

        # All agents get file tools
        from studio.core.file_tools import FILE_TOOLS, FILE_HANDLERS
        tools.extend(FILE_TOOLS)
        handlers.update(FILE_HANDLERS)

        if self.is_boss:
            from studio.agents.boss.tools import TOOLS, HANDLERS
            tools.extend(TOOLS)
            handlers.update(HANDLERS)
        else:
            # All employees get base employee tools
            from studio.core.employee_tools import TOOLS as EMP_TOOLS, make_handlers
            tools.extend(EMP_TOOLS)
            handlers.update(make_handlers(self.name))

            # Check for agent-specific tools (dynamic import)
            agent_tools_file = AGENTS_DIR / self.name_raw.lower() / "tools.py"
            if agent_tools_file.exists():
                import importlib
                module_name = f"studio.agents.{self.name_raw.lower()}.tools"
                try:
                    agent_module = importlib.import_module(module_name)
                    if hasattr(agent_module, "TOOLS") and hasattr(agent_module, "HANDLERS"):
                        tools.extend(agent_module.TOOLS)
                        handlers.update(agent_module.HANDLERS)
                except ImportError:
                    pass  # Agent has tools.py but no TOOLS/HANDLERS exports

        return tools, handlers

    def get_context_md(self) -> str:
        """Get dynamic context portion (without trigger) for T215 metrics."""
        if self.is_boss:
            # BOSS context: purpose + memory tiers + active tasks (unified in hub)
            return hub.get_context_for_agent(self.name, limit=10)
        # Non-BOSS agents get no extra context - they work on one task at a time
        return ""

    def _build_context(self, trigger_message: str = None) -> str:
        """Build scoped context for agents.

        T356: Vanilla agents get raw trigger only.
        BOSS incremental: trigger only (session has history via --resume).
        BOSS init: purpose + memory + trimmed hub + trigger.
        """
        trigger = trigger_message or "Respond appropriately."

        # T356: Vanilla agents get raw trigger only
        if self.is_vanilla:
            logger.debug("[%s] VANILLA MODE", self.name)
            return trigger

        # BOSS INCREMENTAL: Session already has history, just send trigger
        if self.is_boss and StudioAgent._boss_initialized:
            logger.debug("[%s] INCREMENTAL - trigger only", self.name)
            return trigger

        # BOSS INIT: First call - full context injected into session
        # Subsequent calls just append trigger (session remembers via --resume)
        if self.is_boss:
            from studio.core.memory import memory_manager
            sections = []

            # Purpose block (strategic context)
            sections.append(hub._get_boss_purpose_block())

            # Memory tiers (unified source - no duplicate hub access)
            # tier0 = messages.json (recent chat)
            # tier1 = compressed recent history
            tier0 = memory_manager.get_tier(0)
            tier1 = memory_manager.get_tier(1)
            if tier0 or tier1:
                memory_block = "## MEMORY\n"
                if tier1:
                    memory_block += "### Compressed\n" + tier1 + "\n\n"
                if tier0:
                    memory_block += "### Recent Chat\n" + tier0
                sections.append(memory_block)

            # User message
            sections.append(f"## USER MESSAGE\n{trigger}")

            StudioAgent._boss_initialized = True
            logger.info("[%s] BOSS initialized", self.name)
            return "\n\n".join(sections)

        # Non-BOSS employees: just the trigger (task details in description)
        return trigger

    def respond(self, trigger_message: str = None, full_prompt: str = None) -> str:
        """Generate a response based on scoped context.

        Args:
            trigger_message: Simple trigger (will build context internally)
            full_prompt: Pre-built full prompt (T226: bypasses _build_context for optimized prompts)
        """
        try:
            # T226: Use pre-built prompt if provided, otherwise build internally
            prompt = full_prompt if full_prompt else self._build_context(trigger_message)

            logger.info("[%s] Thinking...", self.name)
            start = time.time()
            response = self.agent.chat(prompt)
            elapsed = time.time() - start

            # Get token usage for logging (callers handle track_tokens with task context)
            usage = self.agent.get_last_token_usage()
            tokens_in = usage.get("total_input_tokens", 0)
            tokens_out = usage.get("total_output_tokens", 0)
            logger.info("[%s] Done. (%.1fs, %d+%d tokens)", self.name, elapsed, tokens_in, tokens_out)

            # Post truncated summary to hub (full deliverable saved separately)
            hub_message = _truncate_for_hub(response)
            hub.post(self.name, hub_message)
            return response

        except Exception as e:
            error_msg = f"Error: {e}"
            logger.error("[%s] %s", self.name, error_msg)
            hub.post(self.name, error_msg)
            return error_msg

    def get_last_token_usage(self) -> dict:
        """Get token usage from last respond() call."""
        return self.agent.get_last_token_usage()

    def get_quality_metrics(self) -> dict:
        """Get quality metrics from last respond() call (retries, tool errors, cost, duration)."""
        return self.agent.get_quality_metrics()
