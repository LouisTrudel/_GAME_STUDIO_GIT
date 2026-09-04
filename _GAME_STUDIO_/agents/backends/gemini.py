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

    def __init__(self, model: str = "gemini-3.5-flash-lite"):
        super().__init__()  # Initialize token tracking
        self.model = model
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")

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
        self.last_input_tokens = 0
        self.last_output_tokens = 0
        self.last_token_log = []

        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            content = msg["content"]
            if isinstance(content, str):
                contents.append({"role": role, "parts": [{"text": content}]})

        # Build request
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        payload = {
            "contents": contents,
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "generationConfig": {
                "maxOutputTokens": max_tokens,
            },
        }

        # Add tools if provided
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

        # Make request and handle tool calls
        max_iterations = 5
        for _ in range(max_iterations):
            result = self._make_request(url, payload)

            # Check for function calls
            candidates = result.get("candidates", [])
            if not candidates:
                return "No response generated"

            model_content = candidates[0].get("content", {})
            parts = model_content.get("parts", [])

            # Check if there's a function call
            function_call_part = None
            function_call = None
            for part in parts:
                if "functionCall" in part:
                    function_call_part = part  # Keep the whole part (includes thought_signature)
                    function_call = part["functionCall"]
                    break

            if function_call and tool_handlers:
                # Track tokens for this tool call step
                usage_metadata = result.get("usageMetadata", {})
                step_input = usage_metadata.get("promptTokenCount", 0)
                step_output = usage_metadata.get("candidatesTokenCount", 0)
                self.last_input_tokens += step_input
                self.last_output_tokens += step_output
                if step_input or step_output:
                    self.last_token_log.append({
                        "step": len(self.last_token_log) + 1,
                        "type": "tool_call",
                        "input_tokens": step_input,
                        "output_tokens": step_output,
                    })

                # Execute the function
                func_name = function_call["name"]
                func_args = function_call.get("args", {})

                print(f"  [Tool] {func_name}({func_args})")

                if func_name in tool_handlers:
                    try:
                        result_text = tool_handlers[func_name](**func_args)
                    except Exception as e:
                        result_text = f"Error: {e}"
                else:
                    result_text = f"Unknown tool: {func_name}"

                # Add the model's response (with full parts including thought_signature)
                contents.append({
                    "role": "model",
                    "parts": parts  # Include ALL parts from model response
                })

                # Add the function response
                contents.append({
                    "role": "user",
                    "parts": [{
                        "functionResponse": {
                            "name": func_name,
                            "response": {"result": result_text}
                        }
                    }]
                })

                # Update payload and continue loop
                payload["contents"] = contents

            else:
                # No function call, extract text
                # Track token usage from usageMetadata if available
                usage_metadata = result.get("usageMetadata", {})
                step_input = usage_metadata.get("promptTokenCount", 0)
                step_output = usage_metadata.get("candidatesTokenCount", 0)
                self.last_input_tokens += step_input
                self.last_output_tokens += step_output
                if step_input or step_output:
                    self.last_token_log.append({
                        "step": len(self.last_token_log) + 1,
                        "type": "response",
                        "input_tokens": step_input,
                        "output_tokens": step_output,
                    })

                texts = [p.get("text", "") for p in parts if "text" in p]
                return "".join(texts) if texts else "No response generated"

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
