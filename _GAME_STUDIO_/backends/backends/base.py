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
        # Substep token log for granular tracking
        # Each entry: {"step": N, "type": str, "input_tokens": int, "output_tokens": int}
        self.token_log: list[dict] = []

    def _reset_token_tracking(self):
        """Reset token tracking for a new chat call."""
        self.last_input_tokens = 0
        self.last_output_tokens = 0
        self.token_log = []

    def _log_step(self, step_type: str, input_tokens: int, output_tokens: int):
        """Log a substep with token usage."""
        step_num = len(self.token_log) + 1
        self.token_log.append({
            "step": step_num,
            "type": step_type,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        })
        self.last_input_tokens += input_tokens
        self.last_output_tokens += output_tokens

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
            "total_input_tokens": self.last_input_tokens,
            "total_output_tokens": self.last_output_tokens,
            "token_log": self.token_log.copy(),
        }
