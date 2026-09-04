"""
Core Agent class - multi-backend support for Claude, Gemini, Ollama.
"""

from typing import Callable
from .backends import GeminiBackend, AnthropicBackend, OllamaBackend, ClaudeCLIBackend, Backend


class Agent:
    """
    A conversational agent with pluggable LLM backends.

    Backends:
    - "claude-cli" (uses Claude Pro subscription via CLI)
    - "gemini" (free tier limited)
    - "anthropic" (requires API credits)
    - "ollama" (free, local)
    """

    BACKENDS = {
        "claude-cli": ClaudeCLIBackend,
        "claude": ClaudeCLIBackend,  # Alias
        "gemini": GeminiBackend,
        "anthropic": AnthropicBackend,
        "ollama": OllamaBackend,
    }

    def __init__(
        self,
        name: str,
        system_prompt: str,
        backend: str = "gemini",
        model: str = None,
        tools: list[dict] | None = None,
        tool_handlers: dict[str, Callable] | None = None,
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
            # Use default model if not specified
            if model:
                self.backend = backend_cls(model=model)
            else:
                self.backend = backend_cls()
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
        return {"token_log": [], "total_input_tokens": 0, "total_output_tokens": 0}

    def __repr__(self):
        return f"Agent(name='{self.name}', backend='{self.backend_name}', history_len={len(self.messages)})"
