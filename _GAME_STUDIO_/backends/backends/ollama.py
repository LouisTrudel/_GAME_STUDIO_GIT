"""
Ollama backend - FREE, runs locally.

Install: https://ollama.com
Then: ollama pull llama3
"""

import json
import urllib.request
import urllib.error

from .base import Backend, with_retry


class OllamaBackend(Backend):
    """Ollama local LLM backend."""

    def __init__(self, model: str = "llama3", host: str = "http://localhost:11434", agent_name: str = None):
        super().__init__()  # Initialize token tracking
        self.model = model
        self.host = host
        self.agent_name = agent_name  # Not used by Ollama but accepted for interface compat

    def chat(
        self,
        messages: list[dict],
        system_prompt: str,
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send messages to Ollama and get response."""

        # Reset token tracking
        self._reset_token_tracking()

        # Prepend system message
        ollama_messages = [{"role": "system", "content": system_prompt}]

        for msg in messages:
            content = msg["content"]
            if isinstance(content, str):
                ollama_messages.append({
                    "role": msg["role"],
                    "content": content,
                })

        # Build request
        url = f"{self.host}/api/chat"
        payload = {
            "model": self.model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
            },
        }

        result = self._make_request(url, payload)

        # Track token usage from Ollama response as single step
        # Ollama returns prompt_eval_count (input) and eval_count (output)
        input_tokens = result.get("prompt_eval_count", 0)
        output_tokens = result.get("eval_count", 0)
        self._log_step("response", input_tokens, output_tokens)

        return result.get("message", {}).get("content", "No response")

    @with_retry
    def _make_request(self, url: str, payload: dict) -> dict:
        """Make HTTP request to Ollama with retry on transient failures."""
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=120) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.URLError as e:
            # URLError is retryable (Ollama might be starting up)
            raise ConnectionError(f"Ollama connection failed: {e}")
        except Exception as e:
            raise RuntimeError(f"Ollama request failed: {e}")
