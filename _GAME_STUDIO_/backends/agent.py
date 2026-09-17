"""
Core Agent class - multi-backend support for Claude, Gemini, Ollama.
"""

from typing import Callable
from .backends import (
    GeminiBackend,
    AnthropicBackend,
    OllamaBackend,
    BossCLI,
    FleetCLI,
    VanillaCLI,
    Backend,
    # Legacy (deprecated)
    ClaudeCLIBackend,
    PersistentClaudeCLI,
)


class Agent:
    """
    A conversational agent with pluggable LLM backends.

    Backends:
    - "boss" (BOSS agent - dedicated Haiku session with caching)
    - "fleet" (Worker agents - shared session with caching)
    - "vanilla" (Stateless - Compression, Text, Image, Audio, Video)
    - "gemini" (free tier limited)
    - "anthropic" (requires API credits)
    - "ollama" (free, local)

    Legacy aliases (deprecated):
    - "claude-cli", "claude" -> FleetCLI
    - "stateless-claude", "persistent-claude" -> VanillaCLI
    """

    BACKENDS = {
        # New architecture
        "boss": BossCLI,
        "fleet": FleetCLI,
        "vanilla": VanillaCLI,
        # Other providers
        "gemini": GeminiBackend,
        "anthropic": AnthropicBackend,
        "ollama": OllamaBackend,
        # Legacy aliases (deprecated - map to new)
        "claude-cli": FleetCLI,
        "claude": FleetCLI,
        "stateless-claude": VanillaCLI,
        "persistent-claude": VanillaCLI,
    }

    def __init__(
        self,
        name: str,
        system_prompt: str,
        backend: str = "fleet",
        model: str = None,
        max_turns: int = None,
        tools: list[dict] | None = None,
        tool_handlers: dict[str, Callable] | None = None,
        session_enabled: bool = True,
    ):
        self.name = name
        self.system_prompt = system_prompt
        self.tools = tools or []
        self.tool_handlers = tool_handlers or {}
        self.messages: list[dict] = []

        # Initialize backend
        if isinstance(backend, str):
            if backend not in self.BACKENDS:
                raise ValueError(f"Unknown backend: {backend}. Use: {list(self.BACKENDS.keys())}")
            backend_cls = self.BACKENDS[backend]
            # Pass agent_name to backend
            kwargs = {"agent_name": name}
            if model:
                kwargs["model"] = model
            self.backend = backend_cls(**kwargs)
            # Allow max_turns override
            if max_turns:
                self.backend.max_turns = max_turns
        elif isinstance(backend, Backend):
            self.backend = backend
        else:
            raise ValueError("backend must be a string or Backend instance")

        self.backend_name = backend if isinstance(backend, str) else type(backend).__name__

    def chat(self, user_message: str, max_tokens: int = 4096) -> str:
        """Send a message and get a response."""
        # Add user message to history
        self.messages.append({"role": "user", "content": user_message})

        # Get response from backend (with tools if configured)
        response = self.backend.chat(
            messages=self.messages,
            system_prompt=self.system_prompt,
            max_tokens=max_tokens,
            tools=self.tools if self.tools else None,
            tool_handlers=self.tool_handlers if self.tool_handlers else None,
        )

        # Add assistant response to history
        self.messages.append({"role": "assistant", "content": response})

        return response

    def reset(self):
        """Clear conversation history."""
        self.messages = []

    def get_history(self) -> list[dict]:
        """Return conversation history."""
        return self.messages.copy()

    def inject_message(self, role: str, content: str):
        """Manually inject a message into history."""
        self.messages.append({"role": role, "content": content})

    def get_last_token_usage(self) -> dict:
        """Get token usage from the last chat call (if backend supports it)."""
        if hasattr(self.backend, 'get_last_token_usage'):
            return self.backend.get_last_token_usage()
        return {"total_input_tokens": 0, "total_output_tokens": 0}

    def get_quality_metrics(self) -> dict:
        """Get quality metrics from the last chat call (retries, tool errors, cost, duration)."""
        if hasattr(self.backend, 'get_quality_metrics'):
            return self.backend.get_quality_metrics()
        return {"retries": 0, "tool_errors": [], "cost_usd": 0.0, "duration_ms": 0}

    def __repr__(self):
        return f"Agent(name='{self.name}', backend='{self.backend_name}', history_len={len(self.messages)})"
