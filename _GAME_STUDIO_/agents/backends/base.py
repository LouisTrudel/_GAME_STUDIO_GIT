"""
Base backend interface.
"""

from abc import ABC, abstractmethod


class Backend(ABC):
    """Abstract base for LLM backends."""

    def __init__(self):
        # Token tracking - all backends should update these
        self.last_input_tokens = 0
        self.last_output_tokens = 0
        self.last_token_log = []

    @abstractmethod
    def chat(
        self,
        messages: list[dict],
        system_prompt: str,
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send messages and get a response."""
        pass

    def get_last_token_usage(self) -> dict:
        """Get token usage from the last chat call."""
        return {
            "token_log": self.last_token_log,
            "total_input_tokens": self.last_input_tokens,
            "total_output_tokens": self.last_output_tokens,
        }
