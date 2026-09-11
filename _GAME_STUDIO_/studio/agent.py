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
    """Truncate agent response for hub chat.

    Full deliverables go to files - hub just needs confirmation/summary.
    Extracts DONE: line + bullets if present, otherwise first paragraph.
    Output tokens cost 5x input - keep hub responses minimal.
    """
    if len(response) <= max_chars:
        return response

    # Try to extract DONE: summary + bullet points
    lines = response.split('\n')
    summary_lines = []
    for line in lines:
        stripped = line.strip()
        # Capture DONE: line and bullet points
        if stripped.startswith('DONE:') or stripped.startswith('- '):
            summary_lines.append(stripped)
        # Stop at empty line after bullets (start of actual work)
        elif summary_lines and not stripped:
            break

    if summary_lines:
        result = '\n'.join(summary_lines)
        if len(result) <= max_chars:
            return result

    # Fallback: first paragraph
    first_para_end = response.find("\n\n")
    if first_para_end > 0 and first_para_end <= max_chars:
        return response[:first_para_end] + "  ..."

    # Last resort: truncate at max_chars
    return response[:max_chars].rsplit(" ", 1)[0] + "  ..."


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
        """Build system prompt from role only."""
        if role_md:
            return "## ROLE\n\n" + role_md
        return ""

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
        parts = []

        if self.is_boss:
            context = hub.get_context_for_agent(self.name, limit=10)
            parts.append(f"RECENT MESSAGES:\n{context}")
            task_context = task_manager.to_active_context_string()
            parts.append(task_context)
        # Non-BOSS agents get no extra context - they work on one task at a time
        # Full task details come in ## TASK section

        return "\n\n".join(parts)

    def _build_context(self, trigger_message: str = None) -> str:
        """Build scoped context with section markers for user message.

        Uses ## CONTEXT and ## TASK markers for consistency with system prompt.
        T356: Vanilla agents skip context injection - only get the trigger message.
        T444: BOSS gets full context only on first call, incremental after.
        """
        sections = []

        # T356: Vanilla agents get raw trigger only, no context injection
        if self.is_vanilla:
            logger.debug("[%s] VANILLA MODE - skipping context injection", self.name)
            return trigger_message or "Respond appropriately."

        # T444: BOSS incremental mode - skip static context after initialization
        if self.is_boss and StudioAgent._boss_initialized:
            logger.debug("[%s] INCREMENTAL MODE - skipping FILES/MEMORY", self.name)
            # Only inject recent messages + task (memory/files already in session)
            recent_context = hub.get_incremental_context_for_boss()
            if recent_context:
                sections.append("### RECENT\n\n" + recent_context)
            trigger = trigger_message or "Respond appropriately."
            sections.append("## TASK\n\n" + trigger)
            return "\n\n".join(sections)

        # Debug: confirm non-vanilla path
        logger.debug("[%s] Building context (is_vanilla=%s, is_boss=%s)", self.name, self.is_vanilla, self.is_boss)

        # BOSS gets file tree + context for orchestration
        # Employees get just the task - file paths come in task description
        if self.is_boss:
            # ## FILES - File tree for orientation (T402)
            active_project = project_manager.get_active()
            project_id = active_project.id if active_project else None
            file_tree = get_file_tree(project_id)
            if file_tree:
                sections.append("## FILES\n\n```\n" + file_tree + "\n```")

            # ## CONTEXT - Hub messages + active tasks
            context_md = self.get_context_md()
            if context_md:
                sections.append("## CONTEXT\n\n" + context_md)

        # ## TASK - The trigger/instruction for this turn
        trigger = trigger_message or "Respond appropriately."
        sections.append("## TASK\n\n" + trigger)

        # T444: Mark BOSS as initialized after first full context build
        if self.is_boss:
            StudioAgent._boss_initialized = True
            logger.info("[%s] BOSS initialized - subsequent calls use incremental mode", self.name)

        return "\n\n".join(sections)

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

            # Post full response to hub (truncation happens when injecting into agent context)
            hub.post(self.name, response)
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
