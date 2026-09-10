"""
Anthropic Claude backend - requires API credits.
"""

import os
import logging
from .base import Backend, with_retry

logger = logging.getLogger(__name__)


class AnthropicBackend(Backend):
    """Anthropic Claude API backend."""

    def __init__(self, model: str = "claude-sonnet-4-20250514", agent_name: str = None):
        super().__init__()  # Initialize token tracking
        self.model = model
        self.agent_name = agent_name  # Not used by Anthropic but accepted for interface compat
        # Import here to avoid requiring anthropic if not used
        from anthropic import Anthropic
        self.client = Anthropic()
        # Store exception types for error handling
        import anthropic
        self._api_error = anthropic.APIError
        self._rate_limit_error = anthropic.RateLimitError
        self._auth_error = anthropic.AuthenticationError

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

        response = self._make_request(system_prompt, messages, max_tokens)

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

    @with_retry
    def _make_request(self, system_prompt: str, messages: list, max_tokens: int):
        """Make API request to Anthropic with retry on transient failures."""
        try:
            return self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages,
            )
        except self._rate_limit_error as e:
            # Rate limit is retryable
            logger.warning("Anthropic rate limit: %s", e)
            raise ConnectionError(f"Rate limited: {e}") from e
        except self._auth_error as e:
            # Auth errors should NOT be retried
            logger.error("Anthropic auth error: %s", e)
            raise RuntimeError(f"AUTH_ERROR: {e}") from e
        except self._api_error as e:
            # Other API errors - check if retryable
            error_str = str(e).lower()
            if "overloaded" in error_str or "server" in error_str:
                raise ConnectionError(f"Anthropic server error: {e}") from e
            logger.error("Anthropic API error: %s", e)
            raise RuntimeError(f"API_ERROR: {e}") from e
        except Exception as e:
            # Network errors are retryable
            logger.warning("Network error calling Anthropic: %s", e)
            raise ConnectionError(f"Network error: {e}") from e
