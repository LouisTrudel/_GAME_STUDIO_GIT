"""
Google Gemini backend - FREE tier available.

Get your free API key: https://aistudio.google.com/apikey
"""

import os
import json
import time
import urllib.request
import urllib.error

from .base import Backend


class GeminiBackend(Backend):
    """Google Gemini API backend with tool support."""

    def __init__(self, model: str = "gemini-3.5-flash-lite", agent_name: str = None):
        super().__init__()  # Initialize token tracking
        self.model = model
        self.agent_name = agent_name  # Not used by Gemini but accepted for interface compat
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")

    def _build_request(
        self,
        messages: list[dict],
        system_prompt: str,
        max_tokens: int,
        tools: list[dict] = None,
    ) -> tuple[str, list, dict]:
        """Build Gemini API request. Returns (url, contents, payload)."""
        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            content = msg["content"]
            if isinstance(content, str):
                contents.append({"role": role, "parts": [{"text": content}]})

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        payload = {
            "contents": contents,
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "generationConfig": {
                "maxOutputTokens": max_tokens,
            },
        }

        if tools:
            payload["tools"] = [{
                "functionDeclarations": [
                    {
                        "name": t["name"],
                        "description": t["description"],
                        "parameters": t["input_schema"],
                    }
                    for t in tools
                ]
            }]

        return url, contents, payload

    def _track_tokens(self, result: dict, step_type: str):
        """Track token usage from API response as a substep."""
        usage_metadata = result.get("usageMetadata", {})
        input_tokens = usage_metadata.get("promptTokenCount", 0)
        output_tokens = usage_metadata.get("candidatesTokenCount", 0)
        self._log_step(step_type, input_tokens, output_tokens)

    def _execute_tool_call(self, function_call: dict, tool_handlers: dict) -> str:
        """Execute a tool call and return the result."""
        func_name = function_call["name"]
        func_args = function_call.get("args", {})

        print(f"  [Tool] {func_name}({func_args})")

        if func_name in tool_handlers:
            try:
                return tool_handlers[func_name](**func_args)
            except Exception as e:
                return f"Error: {e}"
        return f"Unknown tool: {func_name}"

    def _extract_response(self, parts: list) -> str:
        """Extract text response from model parts."""
        texts = [p.get("text", "") for p in parts if "text" in p]
        return "".join(texts) if texts else "No response generated"

    def chat(
        self,
        messages: list[dict],
        system_prompt: str,
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send messages to Gemini and get response, with tool support."""
        # Reset token tracking
        self._reset_token_tracking()

        url, contents, payload = self._build_request(messages, system_prompt, max_tokens, tools)

        # Make request and handle tool calls
        max_iterations = 5
        for _ in range(max_iterations):
            result = self._make_request(url, payload)

            candidates = result.get("candidates", [])
            if not candidates:
                return "No response generated"

            model_content = candidates[0].get("content", {})
            parts = model_content.get("parts", [])

            # Check for function call
            function_call = None
            for part in parts:
                if "functionCall" in part:
                    function_call = part["functionCall"]
                    break

            if function_call and tool_handlers:
                self._track_tokens(result, "tool_call")
                result_text = self._execute_tool_call(function_call, tool_handlers)

                # Add model response and function result to conversation
                contents.append({"role": "model", "parts": parts})
                contents.append({
                    "role": "user",
                    "parts": [{
                        "functionResponse": {
                            "name": function_call["name"],
                            "response": {"result": result_text}
                        }
                    }]
                })
                payload["contents"] = contents
            else:
                self._track_tokens(result, "response")
                return self._extract_response(parts)

        return "Max tool iterations reached"

    def _make_request(self, url: str, payload: dict, retries: int = 3) -> dict:
        """Make HTTP request to Gemini API with retry on rate limit."""
        for attempt in range(retries):
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            try:
                with urllib.request.urlopen(req, timeout=120) as response:
                    return json.loads(response.read().decode("utf-8"))

            except urllib.error.HTTPError as e:
                error_body = e.read().decode("utf-8")

                # Rate limit - wait and retry
                if e.code == 429 and attempt < retries - 1:
                    wait_time = 10 * (attempt + 1)  # 10s, 20s, 30s
                    print(f"  [Rate limited] Waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue

                raise RuntimeError(f"Gemini API error {e.code}: {error_body}")
            except Exception as e:
                raise RuntimeError(f"Gemini request failed: {e}")
