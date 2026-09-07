"""
Anthropic Claude backend - requires API credits.
"""

import os
from .base import Backend


class AnthropicBackend(Backend):
    """Anthropic Claude API backend."""

    def __init__(self, model: str = "claude-sonnet-4-20250514", agent_name: str = None):
        super().__init__()  # Initialize token tracking
        self.model = model
        self.agent_name = agent_name  # Not used by Anthropic but accepted for interface compat
        # Import here to avoid requiring anthropic if not used
        from anthropic import Anthropic
        self.client = Anthropic()

    def chat(
        self,
        messages: list[dict],
        system_prompt: str,
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send messages to Claude and get response."""

        # Reset token tracking
        self._reset_token_tracking()

        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=messages,
        )

        # Track token usage from response as a single "response" step
        if hasattr(response, 'usage'):
            input_tokens = getattr(response.usage, 'input_tokens', 0)
            output_tokens = getattr(response.usage, 'output_tokens', 0)
            self._log_step("response", input_tokens, output_tokens)

        # Extract text
        texts = []
        for block in response.content:
            if hasattr(block, "text"):
                texts.append(block.text)

        return "\n".join(texts)
