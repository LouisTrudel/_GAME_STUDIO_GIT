"""
Claude CLI backend - Uses your Claude Pro subscription via the CLI.

This backend spawns Claude Code CLI as a subprocess, giving access to:
- Your Pro subscription (no extra API costs)
- All configured MCP tools (Roblox, Chrome, etc.)
- File read/write capabilities
- Token tracking via JSON output

Uses output streaming with stale detection instead of fixed timeout.

Permanent sessions: Each agent has a deterministic UUID based on their name.
Sessions persist indefinitely for maximum context caching (5x cost reduction).
Auto-recovery handles both "session already in use" and "session not found" errors.
"""

import subprocess
import json
import os
import time
import threading
import uuid
import hashlib
from pathlib import Path

from .base import Backend, INITIAL_DELAY, BACKOFF_MULTIPLIER, MAX_RETRIES
from studio.core.logging_config import get_logger

logger = get_logger("Claude CLI")

# Stale timeout: if no output for this many seconds, consider process stuck
STALE_TIMEOUT_SECONDS = 1200  # 20 minutes

# Retryable subprocess error patterns (case-insensitive)
RETRYABLE_SUBPROCESS_ERRORS = [
    "connection reset",
    "connection refused",
    "network unreachable",
    "temporary failure",
    "timeout",
    "timed out",
    "service unavailable",
    "502",
    "503",
    "504",
    "overloaded",
    "rate limit",  # May retry rate limits
]

# Non-retryable error patterns (should fail immediately)
NON_RETRYABLE_SUBPROCESS_ERRORS = [
    "invalid api key",
    "authentication",
    "unauthorized",
    "forbidden",
    "not found",  # CLI not installed
    "not recognized",  # Windows - CLI not installed
]


def get_permanent_session_uuid(agent_name: str) -> str:
    """Generate a deterministic session UUID for an agent.

    Same agent always gets same UUID - sessions are permanent.
    """
    hash_bytes = hashlib.sha256(f"game-studio-{agent_name}".encode()).digest()
    return str(uuid.UUID(bytes=hash_bytes[:16]))


def clear_all_sessions(cwd: Path = None):
    """No-op stub for permanent sessions. Sessions persist indefinitely."""
    pass


def _session_file_exists(cwd: Path, session_uuid: str) -> bool:
    """Check if a session file exists in Claude's storage."""
    home = Path.home()
    claude_projects = home / ".claude" / "projects"

    if not claude_projects.exists():
        return False

    # Encode the cwd path like Claude does:
    # C:\Users\foo\_bar_ -> C--Users-foo--bar-
    cwd_str = str(cwd.resolve())
    encoded = cwd_str.replace(":", "-").replace("\\", "-").replace("/", "-").replace("_", "-")

    project_dir = claude_projects / encoded
    if not project_dir.exists():
        return False

    session_file = project_dir / f"{session_uuid}.jsonl"
    return session_file.exists()


class ClaudeCLIBackend(Backend):
    """Claude CLI backend using subprocess with streaming output and stale detection."""

    def __init__(self, model: str = "claude", agent_name: str = None):
        super().__init__()  # Initialize token tracking from base
        self.model = model
        self.agent_name = agent_name
        self.cwd = Path(__file__).parent.parent.parent
        self._reset_quality_metrics()
        self._session_uuid = None
        self._session_is_new = True
        logger.info("Backend initialized (stale timeout: %ds)", STALE_TIMEOUT_SECONDS)

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
        """Build the full prompt with system context and conversation.

        Note: Tool schemas are no longer injected into the prompt.
        The ClaudeCLIBackend relies on Claude Code's native MCP tools.
        For custom app tools, use InstructorBackend instead which enforces
        structured output via Pydantic models.
        """
        prompt_parts = []

        # Add full system prompt (no truncation)
        if system_prompt:
            prompt_parts.append(f"SYSTEM:\n{system_prompt}")

        # Note: tools parameter is ignored - Claude CLI uses MCP tools natively
        # Custom tool schemas were previously injected here with <tool> tag syntax
        # That system has been replaced by InstructorBackend for guaranteed structure

        # Add conversation history (last message only to keep it short)
        if messages:
            last_msg = messages[-1]
            prompt_parts.append(f"\nUser says: {last_msg.get('content', '')}")

        prompt_parts.append("\nRespond concisely:")
        return "\n".join(prompt_parts)

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
        # Reset session retry flags for this call
        self._session_retry_attempted = False
        self._force_resume = False

        full_prompt = self._build_prompt(messages, system_prompt, tools)
        self._prompt_text = full_prompt

        # Debug: Show what's actually being sent
        logger.debug("Prompt length: %d chars", len(full_prompt))
        logger.debug("System prompt length: %d chars", len(system_prompt) if system_prompt else 0)
        if system_prompt and len(system_prompt) > 100:
            logger.debug("System prompt preview: %s...", system_prompt[:150])

        import tempfile

        # Write prompt to temp file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write(full_prompt)
            temp_path = f.name

        try:
            # Run with streaming output and retry on transient failures
            response = self._run_with_retry(temp_path, full_prompt)

            # Parse and execute <tool> tags if present (BOSS uses text-based tool syntax)
            if tool_handlers and "<tool>" in response:
                response = self._execute_tool_tags(response, tool_handlers)

            return response

        except StaleProcessError as e:
            return f"Error: Process stale - no output for {STALE_TIMEOUT_SECONDS // 60} minutes. {e}"
        except Exception as e:
            return f"Error: {type(e).__name__}: {e}"
        finally:
            # Clean up temp file
            try:
                os.unlink(temp_path)
            except Exception:
                pass

    def _run_with_retry(self, temp_path: str, full_prompt: str) -> str:
        """Run with exponential backoff retry on transient failures.

        Retries for: network errors, rate limits, server errors
        Does NOT retry for: auth errors, CLI not found
        Backoff: 2s -> 4s -> 8s (3 attempts max)
        """
        delay = INITIAL_DELAY
        last_error = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                return self._run_with_streaming(temp_path, full_prompt)
            except RetryableSubprocessError as e:
                last_error = e
                if attempt < MAX_RETRIES:
                    logger.warning("[Retry] Attempt %d/%d failed: %s", attempt, MAX_RETRIES, e)
                    logger.warning("[Retry] Waiting %ds before retry...", delay)
                    time.sleep(delay)
                    delay *= BACKOFF_MULTIPLIER
                else:
                    logger.error("[Retry] All %d attempts failed", MAX_RETRIES)
            except (StaleProcessError, RuntimeError):
                # These are not retryable, re-raise immediately
                raise

        raise last_error

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

        # Permanent sessions: deterministic UUID per agent, always resume if exists
        if self.agent_name:
            session_uuid = get_permanent_session_uuid(self.agent_name)
            self._session_uuid = session_uuid
            session_exists = _session_file_exists(self.cwd, session_uuid)

            # Check if we're retrying after "session already in use" error
            force_resume = getattr(self, '_force_resume', False)

            if session_exists or force_resume:
                cmd.extend(["--resume", session_uuid])
                self._session_is_new = False
                logger.debug("Resuming permanent session for %s: %s", self.agent_name, session_uuid[:8])
            else:
                cmd.extend(["--session-id", session_uuid])
                self._session_is_new = True
                logger.info("Creating permanent session for %s: %s", self.agent_name, session_uuid[:8])

        # Add MCP server config for custom tools (create_task, acknowledge, etc.)
        mcp_config_path = (self.cwd / ".claude" / "settings.json").resolve()
        if mcp_config_path.exists():
            cmd.extend(["--mcp-config", str(mcp_config_path)])
            logger.debug("MCP config: %s", mcp_config_path)
        else:
            logger.warning("MCP config not found at %s", mcp_config_path)

        # Add permission flags based on agent role
        # All agents need --dangerously-skip-permissions to use MCP tools
        cmd.append("--dangerously-skip-permissions")

        # CRITICAL: --allowedTools only auto-approves, does NOT block other tools
        # Must use --disallowedTools to actually remove tools from context

        # Block token-heavy default tools - agents use MCP tools instead
        # Read/Write/Glob/Grep can read entire files, causing token explosion
        blocked = "Read,Write,Glob,Grep,NotebookEdit"
        cmd.extend(["--disallowedTools", blocked])

        # Auto-approve our tools (no permission prompts)
        if self.agent_name == "BOSS":
            # BOSS: MCP tools + limited bash (no file access)
            allowed = "mcp__game-studio__*,Bash(git *),Bash(ls *),Task"
        else:
            # Employees: MCP tools + Edit (surgical) + Bash (run code)
            allowed = "mcp__game-studio__*,Edit,Bash"
        cmd.extend(["--allowedTools", allowed])

        # Limit turns to prevent token explosion from excessive tool use
        # Configurable via self.max_turns, defaults based on role
        # BOSS: 5 (mostly delegates), Employees: 30 (enough for read+edit cycles)
        if hasattr(self, 'max_turns') and self.max_turns:
            max_turns = self.max_turns
        else:
            max_turns = 5 if self.agent_name == "BOSS" else 30
        cmd.extend(["--max-turns", str(max_turns)])

        # Model selection - use haiku for cheaper exploration
        # Supported: sonnet, opus, haiku (default: sonnet)
        if self.model and self.model != "claude":
            cmd.extend(["--model", self.model])

        # Debug: print full command
        logger.debug("Command: %s", ' '.join(cmd))

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

        # Send input and close stdin (catch BrokenPipeError if process exits early)
        try:
            process.stdin.write(prompt_content)
            process.stdin.close()
        except BrokenPipeError:
            # Process exited before we could write - check for session errors
            process.wait()
            stderr_output = process.stderr.read() if process.stderr else ""

            # Handle session errors with auto-retry
            if self.agent_name and not getattr(self, '_session_retry_attempted', False):
                self._session_retry_attempted = True

                if "already in use" in stderr_output.lower():
                    logger.warning("Session exists for %s, retrying with --resume", self.agent_name)
                    self._force_resume = True
                    return self._run_with_streaming(temp_path, full_prompt)

                if "No conversation found" in stderr_output:
                    logger.warning("Session expired for %s, retrying with --session-id", self.agent_name)
                    self._force_resume = False
                    return self._run_with_streaming(temp_path, full_prompt)

            # Check if error is retryable
            if _is_retryable_subprocess_error(stderr_output):
                raise RetryableSubprocessError(f"CLI failed (retryable): {stderr_output[:200]}")
            return f"Error: Claude CLI exited unexpectedly. {stderr_output[:200]}"

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
        heartbeat_interval = 30  # Log "still thinking" every 30 seconds
        last_heartbeat = time.time()

        while process.poll() is None:
            time.sleep(1)  # Check every second

            now = time.time()
            elapsed_since_output = now - last_output_time

            # Heartbeat log to show we're still alive
            if now - last_heartbeat >= heartbeat_interval:
                last_heartbeat = now
                total_elapsed = now - last_output_time
                logger.info("Still thinking... (%ds since last output)", int(total_elapsed))

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
                # Non-retryable: CLI not installed
                raise RuntimeError("Claude CLI not found. Make sure 'claude' works in your terminal.")

            # Handle session errors with auto-retry (internal retry, not exponential backoff)
            if self.agent_name and not getattr(self, '_session_retry_attempted', False):
                self._session_retry_attempted = True

                if "already in use" in error.lower():
                    # Used --session-id but session exists, retry with --resume
                    logger.warning("Session exists for %s, retrying with --resume", self.agent_name)
                    self._force_resume = True
                    return self._run_with_streaming(temp_path, full_prompt)

                if "No conversation found" in error:
                    # Used --resume but session gone, retry with --session-id
                    logger.warning("Session expired for %s, retrying with --session-id", self.agent_name)
                    self._force_resume = False
                    return self._run_with_streaming(temp_path, full_prompt)

            # Check if error is retryable (rate limits, network issues, etc.)
            if _is_retryable_subprocess_error(error):
                raise RetryableSubprocessError(f"CLI error (code {process.returncode}): {error[:200]}")

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
                logger.warning("API retry #%s - %s", event.get('attempt', '?'), error_cat)

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
                tool_input = content_block.get("input", {})
                # Log tool call attempt (visible debug)
                logger.debug("TOOL CALL: %s", tool_name)
                if tool_input:
                    input_preview = str(tool_input)[:100]
                    logger.debug("  input: %s...", input_preview)
                self._pending_tool = tool_name
                self._tool_use_count = getattr(self, '_tool_use_count', 0) + 1

        # Handle tool results with errors
        elif event_type == "tool_result":
            tool_name = getattr(self, '_pending_tool', 'tool')
            # Check for tool errors in various formats
            is_error = event.get("isError", False) or event.get("is_error", False)
            content = event.get("content", "")
            if isinstance(content, list) and content:
                content = content[0].get("text", str(content)) if isinstance(content[0], dict) else str(content)

            if is_error:
                logger.error("TOOL ERROR: %s - %s", tool_name, str(content)[:150])
                self.last_tool_errors.append(str(content)[:200])
            else:
                logger.debug("TOOL OK: %s", tool_name)

            # Log tool result (estimate tokens from content size)
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
            logger.debug("Raw result event keys: %s", list(result_data.keys()))
            if "usage" in result_data:
                logger.debug("usage keys: %s", list(result_data['usage'].keys()))
            logger.debug("Full result: %s", json.dumps(result_data, indent=2)[:3000])

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

    def _execute_tool_tags(self, response: str, tool_handlers: dict) -> str:
        """Parse and execute <tool> tags in response text.

        BOSS outputs tool calls as text syntax when MCP isn't available:
        <tool>create_task</tool>
        <params>{"description": "...", "assignee": "Code"}</params>

        This method parses those tags, executes the handlers, and returns
        a cleaned response with tool results appended.
        """
        import re

        # Pattern to match <tool>name</tool> followed by <params>json</params>
        pattern = r'<tool>(\w+)</tool>\s*<params>(.*?)</params>'
        matches = re.findall(pattern, response, re.DOTALL)

        if not matches:
            return response

        results = []
        for tool_name, params_str in matches:
            handler = tool_handlers.get(tool_name)
            if not handler:
                results.append(f"[Tool '{tool_name}' not found]")
                continue

            try:
                params = json.loads(params_str) if params_str.strip() else {}
                result = handler(**params)
                results.append(f"[{tool_name}]: {result}")
                self._tool_use_count = getattr(self, '_tool_use_count', 0) + 1
            except json.JSONDecodeError as e:
                results.append(f"[{tool_name} params error]: {e}")
                self.last_tool_errors.append(f"{tool_name}: invalid JSON")
            except Exception as e:
                results.append(f"[{tool_name} error]: {e}")
                self.last_tool_errors.append(f"{tool_name}: {e}")

        # Strip tool tags from response and append results
        cleaned = re.sub(pattern, '', response, flags=re.DOTALL).strip()
        if results:
            cleaned += "\n\n---\nTool Results:\n" + "\n".join(results)

        return cleaned

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

    def clear_session(self) -> bool:
        """No-op for permanent sessions. Sessions persist indefinitely."""
        return False

    def get_session_info(self) -> dict:
        """Get current session info for debugging."""
        return {
            "agent": self.agent_name,
            "session_uuid": self._session_uuid[:8] if self._session_uuid else None,
            "is_new": self._session_is_new,
        }


class StaleProcessError(Exception):
    """Raised when a process produces no output for too long."""
    pass


class RetryableSubprocessError(Exception):
    """Raised when subprocess fails with a retryable error."""
    pass


def _is_retryable_subprocess_error(error_text: str) -> bool:
    """Check if subprocess error is retryable based on error text."""
    error_lower = error_text.lower()

    # First check for non-retryable patterns
    for pattern in NON_RETRYABLE_SUBPROCESS_ERRORS:
        if pattern in error_lower:
            return False

    # Then check for retryable patterns
    for pattern in RETRYABLE_SUBPROCESS_ERRORS:
        if pattern in error_lower:
            return True

    return False
