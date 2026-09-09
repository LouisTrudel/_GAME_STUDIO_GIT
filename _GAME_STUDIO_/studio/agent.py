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
from studio.loader import (
    AGENTS_DIR,
    load_agent_role_md,
    load_agent_config,
)


class StudioAgent:
    """An agent that reads/writes to the shared hub and uses task tools."""

    def __init__(self, name: str, backend: str = "claude-cli"):
        self.name_raw = name
        config = load_agent_config(name)

        self.name = config.get("name", name)
        self.title = config.get("title", "Agent")
        self.color = config.get("color", "#888")
        self.model = config.get("model", "claude")
        self.is_boss = "boss" in name.lower()
        self.is_vanilla = config.get("vanilla", False)

        # Override backend from config if specified
        backend = config.get("backend", backend)

        # Load role from markdown
        self._role_md = load_agent_role_md(name)
        print(f"  [{self.name}] Loaded role.md: {len(self._role_md)} chars, is_vanilla={self.is_vanilla}")

        # Build system prompt from role only (skills system removed)
        system_prompt = self._build_system_prompt(self._role_md)

        # Load tool handlers (MCP server handles tool enforcement now)
        _, handlers = self._load_tools()

        self.agent = Agent(
            name=self.name,
            system_prompt=system_prompt,
            backend=backend,
            model=self.model,
            tools=[],
            tool_handlers=handlers,
        )
        print(f"  [{self.name}] Using backend: {backend}")

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
        else:
            my_tasks = task_manager.get_agent_tasks(self.name)
            if my_tasks:
                task_lines = [f"YOUR TASKS ({self.name}):"]
                for task in my_tasks:
                    task_lines.append(f"  [{task.id}] {task.status.value}: {task.description}")
                parts.append("\n".join(task_lines))
            else:
                parts.append("You have no assigned tasks.")

        return "\n\n".join(parts)

    def _build_context(self, trigger_message: str = None) -> str:
        """Build scoped context with section markers for user message.

        Uses ## CONTEXT and ## TASK markers for consistency with system prompt.
        T356: Vanilla agents skip context injection - only get the trigger message.
        """
        sections = []

        # T356: Vanilla agents get raw trigger only, no context injection
        if self.is_vanilla:
            print(f"  [{self.name}] VANILLA MODE - skipping context injection")
            return trigger_message or "Respond appropriately."

        # Debug: confirm non-vanilla path
        print(f"  [{self.name}] Building context (is_vanilla={self.is_vanilla}, is_boss={self.is_boss})")

        # ## CONTEXT - Dynamic context (tasks, hub messages)
        context_md = self.get_context_md()
        if context_md:
            sections.append("## CONTEXT\n\n" + context_md)

        # ## TASK - The trigger/instruction for this turn
        trigger = trigger_message or "Respond appropriately."
        sections.append("## TASK\n\n" + trigger)

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

            print(f"[{self.name}] Thinking...")
            start = time.time()
            response = self.agent.chat(prompt)
            elapsed = time.time() - start

            # Get token usage
            usage = self.agent.get_last_token_usage()
            tokens_in = usage.get("total_input_tokens", 0)
            tokens_out = usage.get("total_output_tokens", 0)
            print(f"[{self.name}] Done. ({elapsed:.1f}s, {tokens_in}+{tokens_out} tokens)")

            hub.post(self.name, response)
            return response

        except Exception as e:
            error_msg = f"Error: {e}"
            print(f"[{self.name}] {error_msg}")
            hub.post(self.name, error_msg)
            return error_msg

    def get_last_token_usage(self) -> dict:
        """Get token usage from last respond() call."""
        return self.agent.get_last_token_usage()

    def get_quality_metrics(self) -> dict:
        """Get quality metrics from last respond() call (retries, tool errors, cost, duration)."""
        return self.agent.get_quality_metrics()
