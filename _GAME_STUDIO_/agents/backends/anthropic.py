"""
Anthropic Claude backend - requires API credits.
"""

import os
from .base import Backend


class AnthropicBackend(Backend):
    """Anthropic Claude API backend."""

    def __init__(self, model: str = "claude-sonnet-4-20250514"):
        super().__init__()  # Initialize token tracking
        self.model = model
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
        self.last_input_tokens = 0
        self.last_output_tokens = 0
        self.last_token_log = []

        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=messages,
        )

        # Track token usage from response
        if hasattr(response, 'usage'):
            self.last_input_tokens = getattr(response.usage, 'input_tokens', 0)
            self.last_output_tokens = getattr(response.usage, 'output_tokens', 0)
            self.last_token_log = [{
                "step": 1,
                "type": "response",
                "input_tokens": self.last_input_tokens,
                "output_tokens": self.last_output_tokens,
            }]

        # Extract text
        texts = []
        for block in response.content:
            if hasattr(block, "text"):
                texts.append(block.text)

        return "\n".join(texts)
