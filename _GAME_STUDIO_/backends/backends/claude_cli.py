"""
Claude CLI backend - Uses your Claude Pro subscription via the CLI.

This backend spawns Claude Code CLI as a subprocess, giving access to:
- Your Pro subscription (no extra API costs)
- All configured MCP tools (Roblox, Chrome, etc.)
- File read/write capabilities
- Token tracking via JSON output

Uses output streaming with stale detection instead of fixed timeout.
"""

import subprocess
import json
import os
import time
import threading
from pathlib import Path

from .base import Backend


# Stale timeout: if no output for this many seconds, consider process stuck
STALE_TIMEOUT_SECONDS = 1200  # 20 minutes


class ClaudeCLIBackend(Backend):
    """Claude CLI backend using subprocess with streaming output and stale detection."""

    def __init__(self, model: str = "claude", agent_name: str = None):
        super().__init__()  # Initialize token tracking from base
        self.model = model
        self.agent_name = agent_name
        self.cwd = Path(__file__).parent.parent.parent
        self._reset_quality_metrics()
        print(f"  [Claude CLI] Backend initialized (stale timeout: {STALE_TIMEOUT_SECONDS}s)")

    def _reset_quality_metrics(self):
        """Reset all quality metrics to initial state."""
        self.last_retries = 0
        self.last_tool_errors = []
        self.last_cost_usd = 0.0
        self.last_duration_ms = 0
        self.last_num_turns = 0
        self.last_cache_creation_tokens = 0
        self.last_cache_read_tokens = 0
        self.last_is_error = False
        self.last_error_message = None

    def _build_prompt(self, messages: list[dict], system_prompt: str, tools: list[dict] = None) -> str:
        """Build the full prompt with system context, tools, and conversation."""
        prompt_parts = []

        # Add system prompt (shortened for CLI)
        prompt_parts.append(f"SYSTEM: {system_prompt[:2000]}")

        # Add tool descriptions if provided
        if tools:
            prompt_parts.append(self._format_tools_description(tools))

        # Add conversation history (last message only to keep it short)
        if messages:
            last_msg = messages[-1]
            prompt_parts.append(f"\nUser says: {last_msg.get('content', '')}")

        prompt_parts.append("\nRespond concisely:")
        return "\n".join(prompt_parts)

    def _format_tools_description(self, tools: list[dict]) -> str:
        """Format tool definitions into prompt-ready description."""
        tool_desc = "\n\n## Available Tools\n"
        for tool in tools:
            tool_desc += f"\n### {tool['name']}\n{tool['description']}\n"
            if 'input_schema' in tool:
                schema = tool['input_schema']
                props = schema.get('properties', {})
                required = schema.get('required', [])
                if props:
                    tool_desc += "Parameters:\n"
                    for param, details in props.items():
                        req = " (required)" if param in required else ""
                        desc = details.get('description', '')
                        tool_desc += f"  - {param}{req}: {desc}\n"
        tool_desc += "\n**To use a tool, output:**\n```\n<tool>tool_name</tool>\n<params>{\"param\": \"value\"}</params>\n```"
        return tool_desc

    def chat(
        self,
        messages: list[dict],
        system_prompt: str,
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send messages to Claude CLI and get response with streaming output."""
        self._reset_token_tracking()
        self._reset_quality_metrics()

        full_prompt = self._build_prompt(messages, system_prompt, tools)
        self._prompt_text = full_prompt

        try:
            import tempfile

            # Write prompt to temp file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
                f.write(full_prompt)
                temp_path = f.name

            # Run with streaming output
            response = self._run_with_streaming(temp_path, full_prompt)

            # Clean up temp file
            try:
                os.unlink(temp_path)
            except Exception:
                pass

            # Handle tool calls if we have handlers
            if tool_handlers:
                response = self._handle_tool_calls(response, tool_handlers)

            return response

        except StaleProcessError as e:
            return f"Error: Process stale - no output for {STALE_TIMEOUT_SECONDS // 60} minutes. {e}"
        except Exception as e:
            return f"Error: {type(e).__name__}: {e}"

    def _run_with_streaming(self, temp_path: str, full_prompt: str) -> str:
        """Run Claude CLI with stream-json output and line-by-line parsing."""

        if os.name == 'nt':
            # Windows
            claude_cmd = os.path.join(os.environ.get('APPDATA', ''), 'npm', 'claude.cmd')
            cmd = [claude_cmd, "-p", "-", "--output-format", "stream-json", "--verbose"]
            shell = True
        else:
            # Unix
            cmd = ["claude", "-p", "-", "--output-format", "stream-json", "--verbose"]
            shell = False

        # Add permission flags based on agent role
        # BOSS gets restricted tools (architectural enforcement - cannot execute)
        # All other agents get full tool access
        if self.agent_name == "BOSS":
            # BOSS: Use --disallowedTools to block execution tools
            # This is architectural enforcement - BOSS delegates, never executes
            cmd.extend(["--disallowedTools", "Edit,Write,Bash,MultiEdit,NotebookEdit"])
        else:
            # Other agents: Full tool access (they do the actual work)
            cmd.append("--dangerously-skip-permissions")

        # Read prompt content
        with open(temp_path, 'r', encoding='utf-8') as f:
            prompt_content = f.read()

        # Start process with pipes
        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            cwd=str(self.cwd),
            shell=shell,
        )

        # Send input and close stdin
        process.stdin.write(prompt_content)
        process.stdin.close()

        # Reset quality metrics
        self.last_retries = 0
        self.last_tool_errors = []
        self.last_cost_usd = 0.0
        self.last_duration_ms = 0
        self._tool_use_count = 0  # Track number of tool uses

        # Collect stream events
        stream_events = []
        text_content = []
        result_data = None
        last_output_time = time.time()

        # Use threads to read stdout and stderr without blocking
        stdout_done = threading.Event()
        stderr_done = threading.Event()
        stderr_chunks = []

        def read_stdout():
            nonlocal last_output_time, result_data
            try:
                while True:
                    line = process.stdout.readline()
                    if not line:
                        break
                    last_output_time = time.time()
                    line = line.strip()
                    if not line:
                        continue
                    # Parse each JSON line
                    try:
                        event = json.loads(line)
                        stream_events.append(event)
                        self._process_stream_event(event, text_content)
                        if event.get("type") == "result":
                            result_data = event
                    except json.JSONDecodeError:
                        # Non-JSON line, skip
                        pass
            finally:
                stdout_done.set()

        def read_stderr():
            nonlocal last_output_time
            try:
                while True:
                    line = process.stderr.readline()
                    if not line:
                        break
                    stderr_chunks.append(line)
                    last_output_time = time.time()
            finally:
                stderr_done.set()

        stdout_thread = threading.Thread(target=read_stdout, daemon=True)
        stderr_thread = threading.Thread(target=read_stderr, daemon=True)
        stdout_thread.start()
        stderr_thread.start()

        # Monitor for completion or stale
        while process.poll() is None:
            time.sleep(1)  # Check every second

            elapsed_since_output = time.time() - last_output_time

            if elapsed_since_output > STALE_TIMEOUT_SECONDS:
                # Process is stale - kill it
                process.kill()
                process.wait()
                raise StaleProcessError(f"No output for {elapsed_since_output:.0f}s")

        # Wait for reader threads to finish
        stdout_thread.join(timeout=5)
        stderr_thread.join(timeout=5)

        error = "".join(stderr_chunks).strip()

        if process.returncode != 0:
            if "not recognized" in error or "not found" in error.lower():
                return "Error: Claude CLI not found. Make sure 'claude' works in your terminal."
            return f"Error (code {process.returncode}): {error[:200]}"

        # Extract final result
        return self._extract_result(result_data, text_content, full_prompt)

    def _process_stream_event(self, event: dict, text_content: list):
        """Process a single stream-json event and accumulate metrics."""
        event_type = event.get("type", "")

        # Handle system events (api_retry)
        if event_type == "system":
            subtype = event.get("subtype", "")
            if subtype == "api_retry":
                self.last_retries += 1
                error_cat = event.get("error", "unknown")
                print(f"  [Claude CLI] API retry #{event.get('attempt', '?')} - {error_cat}")

        # Handle assistant message events - these contain usage data
        elif event_type == "assistant":
            message = event.get("message", {})
            # Extract token usage from message
            usage = message.get("usage", {})
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)
            if input_tokens > 0 or output_tokens > 0:
                self._log_step("reasoning", input_tokens, output_tokens)
            # Also accumulate text content
            for block in message.get("content", []):
                if block.get("type") == "text":
                    text_content.append(block.get("text", ""))

        elif event_type == "content_block_delta":
            # Streaming text delta
            delta = event.get("delta", {})
            if delta.get("type") == "text_delta":
                text_content.append(delta.get("text", ""))

        # Handle tool use events
        elif event_type == "content_block_start":
            content_block = event.get("content_block", {})
            if content_block.get("type") == "tool_use":
                tool_name = content_block.get("name", "unknown")
                # Log tool call start (no tokens yet, will be in result)
                self._pending_tool = tool_name
                self._tool_use_count = getattr(self, '_tool_use_count', 0) + 1

        # Handle tool results with errors
        elif event_type == "tool_result":
            tool_name = getattr(self, '_pending_tool', 'tool')
            # Check for tool errors in various formats
            is_error = event.get("isError", False) or event.get("is_error", False)
            if is_error:
                content = event.get("content", "")
                if isinstance(content, list) and content:
                    content = content[0].get("text", str(content))
                self.last_tool_errors.append(str(content)[:200])
            # Log tool result (estimate tokens from content size)
            content = event.get("content", "")
            if isinstance(content, list):
                content = str(content)
            estimated_tokens = max(1, len(str(content)) // 4)
            self._log_step(f"tool:{tool_name}", 0, estimated_tokens)

    def _parse_result_metrics(self, result_data: dict):
        """Extract metrics from result event into instance variables."""
        # Cost and duration are at top level
        self.last_cost_usd = result_data.get("total_cost_usd", 0.0) or 0.0
        self.last_duration_ms = result_data.get("duration_ms", 0) or 0
        self.last_num_turns = result_data.get("num_turns", 0) or 0

        # Check error status
        self.last_is_error = result_data.get("is_error", False)
        if self.last_is_error:
            self.last_error_message = result_data.get("result", "Unknown error")

        # Token counts are nested in usage object
        usage = result_data.get("usage", {})
        total_input = usage.get("input_tokens", 0)
        total_output = usage.get("output_tokens", 0)
        self.last_cache_creation_tokens = usage.get("cache_creation_input_tokens", 0)
        self.last_cache_read_tokens = usage.get("cache_read_input_tokens", 0)

        return total_input, total_output

    def _reconcile_token_counts(self, total_input: int, total_output: int):
        """Reconcile actual token counts with logged substeps."""
        # Calculate effective input (non-cached + cached reads count partially)
        effective_input = total_input + self.last_cache_read_tokens

        # If we have substeps logged, add a "synthesis" step for remaining tokens
        logged_input = sum(s.get("input_tokens", 0) for s in self.token_log)
        logged_output = sum(s.get("output_tokens", 0) for s in self.token_log)

        if effective_input > logged_input or total_output > logged_output:
            remaining_input = max(0, effective_input - logged_input)
            remaining_output = max(0, total_output - logged_output)
            if remaining_input > 0 or remaining_output > 0:
                self._log_step("synthesis", remaining_input, remaining_output)

        # Store final totals (include cache reads in input for billing awareness)
        if effective_input > 0:
            self.last_input_tokens = effective_input
        if total_output > 0:
            self.last_output_tokens = total_output

    def _extract_result(self, result_data: dict, text_content: list, full_prompt: str) -> str:
        """Extract final result text and actual token counts from result event."""
        if result_data:
            # DEBUG: Print raw result event (temporary - for T103 verification)
            print(f"\n  [DEBUG] Raw result event keys: {list(result_data.keys())}")
            if "usage" in result_data:
                print(f"  [DEBUG] usage keys: {list(result_data['usage'].keys())}")
            print(f"  [DEBUG] Full result: {json.dumps(result_data, indent=2)[:3000]}")

            # Extract metrics from result event
            total_input, total_output = self._parse_result_metrics(result_data)
            self._reconcile_token_counts(total_input, total_output)

            # Check if result itself is an error
            if self.last_is_error:
                return f"Error: {self.last_error_message}"

            # Get result text from result event
            result_text = result_data.get("result", "")
            if result_text:
                return result_text

        # Fallback: combine accumulated text content
        result_text = "".join(text_content) if text_content else ""

        # Estimate tokens if we didn't get actual counts and no substeps logged
        if self.last_input_tokens == 0 and not self.token_log:
            estimated_input = max(1, len(full_prompt) // 4)
            estimated_output = max(1, len(result_text) // 4)
            self._log_step("response", estimated_input, estimated_output)

        if not result_text:
            return "No response from Claude CLI (empty output)"

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


    def get_quality_metrics(self) -> dict:
        """Return quality metrics from the last chat call for task tracking."""
        return {
            "retries": self.last_retries,
            "tool_errors": self.last_tool_errors.copy(),
            "cost_usd": self.last_cost_usd,
            "duration_ms": self.last_duration_ms,
            "input_tokens": self.last_input_tokens,
            "output_tokens": self.last_output_tokens,
            "token_log": self.token_log.copy(),
            # Extended metrics from T106
            "num_turns": self.last_num_turns,
            "cache_creation_input_tokens": self.last_cache_creation_tokens,
            "cache_read_input_tokens": self.last_cache_read_tokens,
            "is_error": self.last_is_error,
            "error_message": self.last_error_message,
            "num_tool_uses": getattr(self, '_tool_use_count', 0),
        }


class StaleProcessError(Exception):
    """Raised when a process produces no output for too long."""
    pass
