"""
Claude CLI backend - Uses your Claude Pro subscription via the CLI.

This backend spawns Claude Code CLI as a subprocess, giving access to:
- Your Pro subscription (no extra API costs)
- All configured MCP tools (Roblox, Chrome, etc.)
- File read/write capabilities
- Token tracking via JSON output
"""

import subprocess
import json
import os
from pathlib import Path

from .base import Backend


class ClaudeCLIBackend(Backend):
    """Claude CLI backend using subprocess with token tracking."""

    def __init__(self, model: str = "claude"):
        super().__init__()  # Initialize token tracking from base
        self.model = model
        self.cwd = Path(__file__).parent.parent.parent
        print(f"  [Claude CLI] Backend initialized")

    def chat(
        self,
        messages: list[dict],
        system_prompt: str,
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send messages to Claude CLI and get response with token tracking."""

        # Reset token tracking
        self.last_token_log = []
        self.last_input_tokens = 0
        self.last_output_tokens = 0

        # Build the prompt with system context and conversation
        prompt_parts = []

        # Add system prompt (shortened for CLI)
        prompt_parts.append(f"SYSTEM: {system_prompt[:2000]}")

        # Add tool descriptions if provided
        if tools:
            tool_desc = "\n\nAvailable tools:\n"
            for tool in tools:
                tool_desc += f"- {tool['name']}: {tool['description']}\n"
            tool_desc += "\nTo use a tool: <tool>name</tool><params>{...}</params>"
            prompt_parts.append(tool_desc)

        # Add conversation history (last message only to keep it short)
        if messages:
            last_msg = messages[-1]
            prompt_parts.append(f"\nUser says: {last_msg.get('content', '')}")

        prompt_parts.append("\nRespond concisely:")

        full_prompt = "\n".join(prompt_parts)

        # Save prompt for token estimation (Claude CLI doesn't report actual usage)
        self._prompt_text = full_prompt

        try:
            import tempfile

            # Write prompt to temp file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
                f.write(full_prompt)
                temp_path = f.name

            if os.name == 'nt':
                # Windows: use cmd /c with the .cmd version of claude
                claude_cmd = os.path.join(os.environ.get('APPDATA', ''), 'npm', 'claude.cmd')

                # Read the prompt content directly and pass via stdin
                with open(temp_path, 'r', encoding='utf-8') as f:
                    prompt_content = f.read()

                # Use text format with UTF-8 encoding (Windows defaults to cp1252)
                # Include --output-format json for token tracking
                result = subprocess.run(
                    [claude_cmd, "-p", "-", "--output-format", "json", "--dangerously-skip-permissions"],
                    input=prompt_content,
                    capture_output=True,
                    text=True,
                    encoding='utf-8',
                    timeout=180,
                    cwd=str(self.cwd),
                    shell=True,  # Needed for .cmd on Windows
                )
            else:
                # Unix: direct call with stdin
                with open(temp_path, 'r') as f:
                    result = subprocess.run(
                        ["claude", "-p", "-", "--output-format", "json", "--dangerously-skip-permissions"],
                        stdin=f,
                        capture_output=True,
                        text=True,
                        timeout=180,
                        cwd=str(self.cwd),
                    )

            os.unlink(temp_path)

            raw_output = (result.stdout or "").strip()
            error = (result.stderr or "").strip()

            if result.returncode != 0:
                if "not recognized" in error or "not found" in error.lower():
                    return "Error: Claude CLI not found. Make sure 'claude' works in your terminal."
                return f"Error (code {result.returncode}): {error[:200]}"

            if not raw_output:
                return "No response from Claude CLI (empty output)"

            # Try to parse as JSON, fall back to plain text
            response = self._parse_output(raw_output)

            # Handle tool calls if we have handlers
            if tools and tool_handlers:
                response = self._handle_tool_calls(response, tool_handlers)

            return response

        except subprocess.TimeoutExpired:
            return "Error: Claude CLI timed out (3 min limit)"
        except Exception as e:
            return f"Error: {type(e).__name__}: {e}"

    def _parse_output(self, raw_output: str) -> str:
        """Parse output and estimate tokens (Claude CLI doesn't report actual usage)."""
        result_text = raw_output

        # Try JSON parsing for result extraction
        try:
            data = json.loads(raw_output)
            result_text = data.get("result", "") or raw_output
        except json.JSONDecodeError:
            pass

        # ALWAYS estimate tokens - Claude CLI JSON output doesn't include usage data
        # Use ~4 chars per token as rough estimate (conservative for Claude)
        prompt_text = getattr(self, '_prompt_text', '')
        self.last_input_tokens = max(1, len(prompt_text) // 4)
        self.last_output_tokens = max(1, len(result_text) // 4)

        self.last_token_log = [{
            "step": 1,
            "type": "response",
            "input_tokens": self.last_input_tokens,
            "output_tokens": self.last_output_tokens,
            "estimated": True,  # Flag that these are estimates (CLI doesn't report actual)
        }]

        return result_text

    def _handle_tool_calls(self, response: str, handlers: dict) -> str:
        """Parse and execute tool calls from response."""
        import re

        # Find tool calls with proper JSON extraction (handles nested braces)
        tool_pattern = r'<tool>(\w+)</tool>\s*<params>(.*?)</params>'
        matches = re.findall(tool_pattern, response, re.DOTALL)

        if not matches:
            return response

        results = []
        for tool_name, params_str in matches:
            if tool_name in handlers:
                try:
                    # Clean up the params string (remove extra whitespace, newlines)
                    params_str = params_str.strip()
                    params = json.loads(params_str)
                    result = handlers[tool_name](**params)
                    results.append(f"[{tool_name}]: {result}")
                except json.JSONDecodeError as e:
                    results.append(f"[{tool_name}]: JSON parse error - {e}")
                except Exception as e:
                    results.append(f"[{tool_name}]: Error - {e}")
            else:
                results.append(f"[{tool_name}]: Unknown tool")

        clean_response = re.sub(tool_pattern, '', response).strip()
        if results:
            clean_response += "\n\nTool results:\n" + "\n".join(results)

        return clean_response
