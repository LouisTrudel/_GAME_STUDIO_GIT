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


def _truncate_for_hub(response: str, max_chars: int = 5000) -> str:
    """Format agent response for hub display.

    For task deliverables with '---' separator:
        Extracts summary (before ---), full deliverable saved separately.
    For conversational responses:
        Returns full response (no truncation).

    Args:
        response: Full agent response
        max_chars: Safety limit for very long responses (default 5000)
    """
    # No separator = conversational response, return as-is
    if "\n---" not in response:
        if len(response) <= max_chars:
            return response
        return response[:max_chars] + "..."

    # Has separator = task deliverable, extract summary
    separator_pos = response.find("\n---")
    summary = response[:separator_pos].strip()
    return summary if summary else response[:max_chars]


class StudioAgent:
    """An agent that reads/writes to the shared hub and uses task tools."""

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
            session_enabled=not self.is_vanilla,  # Vanilla agents are stateless
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
        mcp_line = "You are a Game-Studio MCP agent. Use mcp__game-studio__* tools: search_code, read_lines (max 200 lines), edit_file, write_report."
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

        # Tools are now enforced via MCP --allowedTools flag in CLI backends
        # No need for legacy <tool> tag handlers

        return tools, handlers

    def get_context_md(self) -> str:
        """Get dynamic context portion (without trigger) for T215 metrics."""
        if self.is_boss:
            # BOSS context: purpose + memory tiers + active tasks (unified in hub)
            return hub.get_context_for_agent(self.name, limit=10)
        # Non-BOSS agents get no extra context - they work on one task at a time
        return ""

    # Class-level flag for BOSS persistent session initialization
    _boss_initialized = False

    @classmethod
    def reset_boss_initialized(cls):
        """Reset BOSS init flag (called when session is cleared)."""
        cls._boss_initialized = False

    def _build_context(self, trigger_message: str = None) -> str:
        """Build scoped context for agents.

        T356: Vanilla agents get raw trigger only.
        BOSS: Persistent session - full context on first call, just request after.
        Employees: Just the trigger (task details in description).
        """
        trigger = trigger_message or "Respond appropriately."

        # T356: Vanilla agents get raw trigger only
        if self.is_vanilla:
            logger.debug("[%s] VANILLA MODE", self.name)
            return trigger

        # BOSS: Persistent session mode
        if self.is_boss:
            # Subsequent calls: just the request (context already in session)
            if StudioAgent._boss_initialized:
                logger.debug("[%s] BOSS persistent: request only", self.name)
                return f"Client: {trigger}"

            # First call: inject full context block (gets cached)
            StudioAgent._boss_initialized = True
            sections = []

            # Active project context
            active_project = project_manager.get_active()
            if active_project:
                sections.append(f"## Project: {active_project.name}\n`{active_project.path}`")

            # Hub messages (trimmed to 24 chars each)
            messages = hub.get_history(limit=50)
            if messages:
                lines = ["## Hub"]
                for msg in messages:
                    content = msg.content[:24].replace("\n", " ")
                    if len(msg.content) > 24:
                        content += "..."
                    lines.append(f"- **{msg.sender}**: {content}")
                sections.append("\n".join(lines))

            # Friction (whole file - only contains unresolved now)
            friction_path = Path(__file__).parent.parent / "data" / "memory" / "friction.md"
            if friction_path.exists():
                try:
                    friction_content = friction_path.read_text(encoding="utf-8").strip()
                    # Skip if empty or just header
                    if friction_content and "No unresolved issues" not in friction_content:
                        # Trim to ~1KB
                        if len(friction_content) > 1000:
                            friction_content = friction_content[:1000] + "..."
                        sections.append(f"## Friction\n{friction_content}")
                except Exception:
                    pass

            # First request
            sections.append(f"## Request\n{trigger}")

            logger.debug("[%s] BOSS init: %d sections (will be cached)", self.name, len(sections))
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

            # Post truncated summary to hub (skip noisy agents)
            if self.name not in ("Compression", "Text", "Prompt"):
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
