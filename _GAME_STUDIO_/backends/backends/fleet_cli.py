"""
Fleet CLI Backend - Shared cached session for all worker agents.

- Single session shared by ALL workers (Code, Frontend, Backend, etc.)
- Agents are just role.md context prefix + task
- Auto-clears at token threshold
- MCP tools: search_code, read_lines, edit_file, write_report, create_suggestion + Bash
- Research: +WebSearch
"""

import subprocess
import json
import os
import time
import threading
from pathlib import Path

from .base import Backend, INITIAL_DELAY, BACKOFF_MULTIPLIER, MAX_RETRIES
from studio.core.logging_config import get_logger

logger = get_logger("FleetCLI")

STALE_TIMEOUT_SECONDS = 300  # 5 minutes (was 20 - too long)
SESSION_TOKEN_THRESHOLD = 150_000  # Auto-clear threshold
FLEET_SESSION_UUID = "f1ee0002-0002-0002-0002-000000000002"
DEFAULT_MAX_TURNS = 25

_cleanup_done = False


def cleanup_old_sessions():
    """Delete ALL session files and old conversation dirs on startup."""
    global _cleanup_done
    if _cleanup_done:
        return
    _cleanup_done = True

    import shutil
    cwd = Path(__file__).parent.parent.parent
    home = Path.home()
    cwd_str = str(cwd.resolve())
    encoded = cwd_str.replace(":", "-").replace("\\", "-").replace("/", "-").replace("_", "-")
    project_dir = home / ".claude" / "projects" / encoded

    if not project_dir.exists():
        return

    deleted_files = 0
    deleted_dirs = 0

    # Delete .jsonl session files
    for session_file in project_dir.glob("*.jsonl"):
        try:
            session_file.unlink()
            deleted_files += 1
        except Exception:
            pass

    # Delete old conversation directories (UUID folders)
    for item in project_dir.iterdir():
        if item.is_dir():
            try:
                shutil.rmtree(item)
                deleted_dirs += 1
            except Exception:
                pass

    if deleted_files > 0 or deleted_dirs > 0:
        logger.info("[Cleanup] Deleted %d session files, %d old dirs (fresh start)", deleted_files, deleted_dirs)


# Run cleanup on module import
cleanup_old_sessions()


class FleetCLI(Backend):
    """
    Shared CLI session for all worker agents.

    Workers share ONE session for maximum cache reuse.
    The "agent" is just the role.md context prefix.

    IMPORTANT: Only ONE Fleet agent can use the session at a time.
    _session_semaphore ensures serialized access to prevent "session in use" errors.
    """

    _cumulative_tokens: int = 0
    _session_needs_create: bool = True
    _running_processes: dict[str, subprocess.Popen] = {}
    _lock = threading.Lock()
    _session_semaphore = threading.Semaphore(1)  # Only one agent at a time

    def __init__(self, model: str = "sonnet", agent_name: str = "Worker"):
        super().__init__()
        self.model = model
        self.agent_name = agent_name
        self.cwd = Path(__file__).parent.parent.parent
        self._reset_metrics()
        logger.info("[%s] Fleet CLI initialized (shared session)", agent_name)

    def _reset_metrics(self):
        """Reset metrics for new call."""
        self.last_retries = 0
        self.last_tool_errors = []
        self.last_cost_usd = 0.0
        self.last_duration_ms = 0
        self.last_num_turns = 0
        self.last_cache_creation_tokens = 0
        self.last_cache_read_tokens = 0
        self.last_is_error = False
        self.last_error_message = None
        self._tool_use_count = 0
        self._friction_events = []

    def _add_friction(self, category: str, detail: str):
        """Record a friction event."""
        self._friction_events.append({
            "category": category,
            "detail": detail[:100]
        })

    def chat(
        self,
        messages: list[dict],
        system_prompt: str = "",
        max_tokens: int = 4096,
        tools: list[dict] = None,  # Deprecated - MCP tools via --allowedTools
        tool_handlers: dict = None,  # Deprecated - MCP handles tools
    ) -> str:
        """Send message to Fleet CLI session.

        SERIALIZED ACCESS: Only one Fleet agent can use the shared session at a time.
        Other agents wait in queue via _session_semaphore.
        """
        # Acquire session lock - wait for other Fleet agents to finish
        logger.debug("[%s] Waiting for session semaphore...", self.agent_name)
        FleetCLI._session_semaphore.acquire()
        logger.debug("[%s] Acquired session semaphore", self.agent_name)

        try:
            self._reset_token_tracking()
            self._reset_metrics()

            # Pre-check: clear session if already over threshold
            with FleetCLI._lock:
                if FleetCLI._cumulative_tokens > SESSION_TOKEN_THRESHOLD:
                    logger.warning("[Fleet] Pre-run threshold exceeded (%dK > %dK), clearing session",
                                  FleetCLI._cumulative_tokens // 1000,
                                  SESSION_TOKEN_THRESHOLD // 1000)
                    self._clear_session()

            prompt = self._build_prompt(messages, system_prompt)

            logger.info("[%s] Fleet START | prompt=%.1fKB | cumulative=%dK/%dK",
                        self.agent_name,
                        len(prompt) / 1024,
                        FleetCLI._cumulative_tokens // 1000,
                        SESSION_TOKEN_THRESHOLD // 1000)

            try:
                response = self._run_cli(prompt)
                return response
            except Exception as e:
                self.last_is_error = True
                self.last_error_message = str(e)
                logger.error("[%s] Error: %s", self.agent_name, e)
                return f"Error: {type(e).__name__}: {e}"
            finally:
                self._update_cumulative_tokens()
        finally:
            # Always release semaphore
            FleetCLI._session_semaphore.release()
            logger.debug("[%s] Released session semaphore", self.agent_name)

    def _build_prompt(self, messages: list[dict], system_prompt: str) -> str:
        """Build prompt with system context (agent role.md prefix)."""
        parts = []
        if system_prompt:
            parts.append(f"SYSTEM:\n{system_prompt}")
        if messages:
            last_msg = messages[-1].get("content", "")
            parts.append(f"\nUser says: {last_msg}")
        parts.append("\nRespond concisely:")
        return "\n".join(parts)

    def _run_cli(self, prompt: str) -> str:
        """Run Claude CLI with Fleet session."""
        import tempfile

        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write(prompt)
            temp_path = f.name

        try:
            return self._run_with_retry(temp_path, prompt)
        finally:
            try:
                os.unlink(temp_path)
            except Exception:
                pass

    def _run_with_retry(self, temp_path: str, prompt: str) -> str:
        """Run with exponential backoff retry."""
        delay = INITIAL_DELAY
        last_error = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                return self._run_subprocess(temp_path, prompt)
            except RetryableError as e:
                last_error = e
                if attempt < MAX_RETRIES:
                    logger.warning("[%s] Retry %d/%d: %s", self.agent_name, attempt, MAX_RETRIES, e)
                    time.sleep(delay)
                    delay *= BACKOFF_MULTIPLIER

        if last_error:
            raise last_error
        return "No response from Fleet CLI"

    def _run_subprocess(self, temp_path: str, prompt: str) -> str:
        """Run single Fleet CLI subprocess."""
        # Kill any stale process for this agent
        with FleetCLI._lock:
            old_process = FleetCLI._running_processes.get(self.agent_name)
            if old_process and old_process.poll() is None:
                logger.warning("[%s] Killing stale process PID %d", self.agent_name, old_process.pid)
                try:
                    old_process.kill()
                    old_process.wait(timeout=2)
                except Exception:
                    pass

        if os.name == 'nt':
            claude_cmd = os.path.join(os.environ.get('APPDATA', ''), 'npm', 'claude.cmd')
            shell = True
        else:
            claude_cmd = "claude"
            shell = False

        cmd = [claude_cmd, "-p", "-", "--output-format", "stream-json", "--verbose"]

        # Session management - resume if exists, create if not
        if self._session_file_exists():
            cmd.extend(["--resume", FLEET_SESSION_UUID])
        else:
            cmd.extend(["--session-id", FLEET_SESSION_UUID])

        # MCP config
        mcp_config = self.cwd / ".claude" / "settings.json"
        if mcp_config.exists():
            cmd.extend(["--mcp-config", str(mcp_config)])

        # Worker tools: MCP + Bash (all workers)
        base_tools = "mcp__game-studio__search_code,mcp__game-studio__read_lines,mcp__game-studio__edit_file,mcp__game-studio__write_report,mcp__game-studio__create_suggestion,Bash"

        # Research also gets WebSearch
        if self.agent_name == "Research":
            allowed = f"{base_tools},WebSearch"
        else:
            allowed = base_tools

        cmd.extend(["--allowedTools", allowed])
        cmd.append("--dangerously-skip-permissions")

        # Model and turns
        if self.model and self.model != "claude":
            cmd.extend(["--model", self.model])

        max_turns = getattr(self, 'max_turns', None) or DEFAULT_MAX_TURNS
        cmd.extend(["--max-turns", str(max_turns)])

        logger.debug("[%s] CMD: %s", self.agent_name, " ".join(cmd))

        # Read prompt
        with open(temp_path, 'r', encoding='utf-8') as f:
            prompt_content = f.read()

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

        # Track running process
        with FleetCLI._lock:
            FleetCLI._running_processes[self.agent_name] = process

        try:
            try:
                process.stdin.write(prompt_content)
                process.stdin.close()
            except BrokenPipeError:
                process.wait()
                stderr = process.stderr.read() if process.stderr else ""

                # Handle session errors
                if "already in use" in stderr.lower():
                    logger.warning("[%s] Session in use, retrying with --resume", self.agent_name)
                    with FleetCLI._lock:
                        FleetCLI._session_needs_create = False
                    return self._run_subprocess(temp_path, prompt)
                if "No conversation found" in stderr:
                    logger.warning("[%s] Session expired, creating new", self.agent_name)
                    with FleetCLI._lock:
                        FleetCLI._session_needs_create = True
                    return self._run_subprocess(temp_path, prompt)

                raise RuntimeError(f"CLI exited early: {stderr[:200]}")

            return self._collect_output(process, prompt)
        finally:
            with FleetCLI._lock:
                FleetCLI._running_processes.pop(self.agent_name, None)

    def _session_file_exists(self) -> bool:
        """Check if Fleet session file exists."""
        home = Path.home()
        cwd_str = str(self.cwd.resolve())
        encoded = cwd_str.replace(":", "-").replace("\\", "-").replace("/", "-").replace("_", "-")
        session_file = home / ".claude" / "projects" / encoded / f"{FLEET_SESSION_UUID}.jsonl"
        return session_file.exists()

    def _collect_output(self, process: subprocess.Popen, prompt: str) -> str:
        """Collect stream-json output."""
        text_content = []
        result_data = [None]
        last_output_time = time.time()
        stderr_lines = []
        non_json_stdout = []  # Capture non-JSON stdout for error reporting

        def read_stdout():
            nonlocal last_output_time
            for line in process.stdout:
                last_output_time = time.time()
                line = line.strip()
                if not line:
                    continue
                try:
                    event = json.loads(line)
                    self._process_event(event, text_content)
                    if event.get("type") == "result":
                        result_data[0] = event
                except json.JSONDecodeError:
                    non_json_stdout.append(line)  # Keep for error context

        def read_stderr():
            nonlocal last_output_time
            for line in process.stderr:
                last_output_time = time.time()
                line_stripped = line.strip()
                stderr_lines.append(line_stripped)
                # Log stderr in real-time for debugging
                if line_stripped:
                    logger.debug("[%s] stderr: %s", self.agent_name, line_stripped[:200])

        stdout_thread = threading.Thread(target=read_stdout, daemon=True)
        stderr_thread = threading.Thread(target=read_stderr, daemon=True)
        stdout_thread.start()
        stderr_thread.start()

        wait_count = 0
        while process.poll() is None:
            time.sleep(1)
            wait_count += 1
            if wait_count % 10 == 0:  # Log every 10 seconds
                logger.info("[%s] Running... (%ds, last_output=%ds ago)",
                           self.agent_name, wait_count, int(time.time() - last_output_time))
            if time.time() - last_output_time > STALE_TIMEOUT_SECONDS:
                logger.error("[%s] STALE - no output for %ds, killing", self.agent_name, STALE_TIMEOUT_SECONDS)
                process.kill()
                raise TimeoutError(f"No output for {STALE_TIMEOUT_SECONDS}s")

        stdout_thread.join(timeout=5)
        stderr_thread.join(timeout=5)
        logger.info("[%s] Process done | code=%d | wait=%ds | stderr_lines=%d",
                   self.agent_name, process.returncode, wait_count, len(stderr_lines))

        if process.returncode != 0:
            error = "\n".join(stderr_lines)
            # Use non-JSON stdout as fallback if stderr is empty
            if not error.strip() and non_json_stdout:
                error = "\n".join(non_json_stdout)
            error_lower = error.lower()

            if "rate limit" in error_lower or "overloaded" in error_lower:
                raise RetryableError(f"Rate limited: {error[:100]}")

            # MCP connection errors
            if any(p in error_lower for p in MCP_ERROR_PATTERNS):
                raise RetryableError(f"MCP connection failed: {error[:150]}")

            # Session locked - clear and retry
            if "already in use" in error_lower:
                logger.warning("[%s] Session locked, clearing and retrying", self.agent_name)
                self._clear_session()
                raise RetryableError("Session locked, cleared")

            # Session not found - clear and retry
            if "no conversation found" in error_lower or "session" in error_lower:
                logger.warning("[%s] Session error: %s", self.agent_name, error[:100])
                self._clear_session()
                raise RetryableError(f"Session error, cleared: {error[:50]}")

            # Unknown code 1 with empty/vague error - likely session issue, clear and retry
            if process.returncode == 1 and len(error.strip()) < 20:
                logger.warning("[%s] Unknown code 1 error (likely session), clearing: %s", self.agent_name, error[:50])
                self._clear_session()
                raise RetryableError(f"Unknown error, session cleared: {error[:30]}")

            raise RuntimeError(f"CLI error (code {process.returncode}): {error[:200]}")

        # Log MCP-related stderr even on success (for debugging)
        if stderr_lines:
            mcp_errors = [l for l in stderr_lines if 'mcp' in l.lower() or 'tool' in l.lower()]
            if mcp_errors:
                logger.warning("[%s] MCP stderr: %s", self.agent_name, "; ".join(mcp_errors[:3]))

        # Log if no tools were used (suspicious for most tasks)
        if self._tool_use_count == 0:
            logger.warning("[%s] No tool calls detected in this run", self.agent_name)

        return self._extract_result(result_data[0], text_content)

    def _truncate_for_terminal(self, text: str) -> str:
        """Truncate completion blocks for terminal - keep COMPLETED line, skip Summary/Friction."""
        if "COMPLETED:" not in text:
            return text

        lines = text.split('\n')
        result = []
        skip_rest = False

        for line in lines:
            # Skip Summary/Friction sections
            if line.strip().startswith("## Summary") or line.strip().startswith("## Friction"):
                skip_rest = True
                continue
            if skip_rest:
                continue
            result.append(line)

        return '\n'.join(result).strip()

    def _process_event(self, event: dict, text_content: list):
        """Process stream event."""
        event_type = event.get("type", "")

        # Debug: log ALL events to understand stream structure
        if event_type not in ("content_block_delta",):  # Skip noisy delta events
            logger.debug("[%s] Event: %s", self.agent_name, event_type)

        if event_type == "assistant":
            message = event.get("message", {})
            for block in message.get("content", []):
                if block.get("type") == "text":
                    text = block.get("text", "")
                    text_content.append(text)
                    # Broadcast to terminal (truncate completion blocks)
                    if text:
                        try:
                            from server_modules.broadcast import broadcast_terminal_line_sync
                            terminal_text = self._truncate_for_terminal(text)
                            if terminal_text:
                                broadcast_terminal_line_sync(self.agent_name, terminal_text + "\n")
                        except Exception:
                            pass
            usage = message.get("usage", {})
            if usage.get("input_tokens"):
                in_tok = usage.get("input_tokens", 0)
                out_tok = usage.get("output_tokens", 0)
                self._log_step("reasoning", in_tok, out_tok)
                # Broadcast turn token counts
                try:
                    from server_modules.broadcast import broadcast_terminal_line_sync
                    turn_num = len(self.token_log)
                    broadcast_terminal_line_sync(self.agent_name, f"[turn {turn_num} | in:{in_tok} out:{out_tok}]\n")
                except Exception:
                    pass

        elif event_type == "content_block_delta":
            delta = event.get("delta", {})
            if delta.get("type") == "text_delta":
                text = delta.get("text", "")
                text_content.append(text)
                # Don't broadcast deltas - they're partial and hard to filter
                # Full text is broadcast via "assistant" event

        elif event_type == "content_block_start":
            content_block = event.get("content_block", {})
            block_type = content_block.get("type", "")
            logger.info("[%s] content_block_start: type=%s", self.agent_name, block_type)
            if block_type == "tool_use":
                self._tool_use_count += 1
                tool_name = content_block.get("name", "unknown")
                tool_input = content_block.get("input", {})
                logger.info("[%s] TOOL CALL: %s %s", self.agent_name, tool_name, str(tool_input)[:100])
                try:
                    from server_modules.broadcast import broadcast_terminal_line_sync
                    broadcast_terminal_line_sync(self.agent_name, f"[tool: {tool_name}]\n")
                except Exception:
                    pass

        elif event_type == "system":
            if event.get("subtype") == "api_retry":
                self.last_retries += 1
                self._add_friction("retry", f"API retry #{self.last_retries}")

    def _extract_result(self, result_data: dict, text_content: list) -> str:
        """Extract final result and metrics."""
        if result_data:
            self.last_cost_usd = result_data.get("total_cost_usd", 0.0) or 0.0
            self.last_duration_ms = result_data.get("duration_ms", 0) or 0
            self.last_num_turns = result_data.get("num_turns", 0) or 0

            usage = result_data.get("usage", {})
            self.last_input_tokens = usage.get("input_tokens", 0)
            self.last_output_tokens = usage.get("output_tokens", 0)
            self.last_cache_creation_tokens = usage.get("cache_creation_input_tokens", 0)
            self.last_cache_read_tokens = usage.get("cache_read_input_tokens", 0)

            total_input = self.last_cache_read_tokens + self.last_input_tokens
            cache_pct = (self.last_cache_read_tokens / max(total_input, 1)) * 100
            logger.info("[%s] Fleet END | turns=%d | in=%dK out=%dK | cache=%.0f%% | $%.4f",
                        self.agent_name,
                        self.last_num_turns,
                        self.last_input_tokens // 1000,
                        self.last_output_tokens // 1000,
                        cache_pct,
                        self.last_cost_usd)

        if text_content:
            return "\n\n".join(text_content)

        if result_data:
            return result_data.get("result", "No response")

        return "No response from Fleet CLI"

    def _update_cumulative_tokens(self):
        """Track cumulative tokens and auto-clear if threshold exceeded."""
        # Only count NEW tokens (input + cache_creation), not cache reads
        # cache_read_tokens is the existing context, not new content
        new_tokens = self.last_input_tokens + self.last_cache_creation_tokens

        with FleetCLI._lock:
            FleetCLI._cumulative_tokens += new_tokens

            if FleetCLI._cumulative_tokens > SESSION_TOKEN_THRESHOLD:
                logger.warning("[Fleet] Threshold exceeded (%dK > %dK), clearing session",
                              FleetCLI._cumulative_tokens // 1000,
                              SESSION_TOKEN_THRESHOLD // 1000)
                self._clear_session()

    def _clear_session(self):
        """Clear Fleet session file."""
        home = Path.home()
        cwd_str = str(self.cwd.resolve())
        encoded = cwd_str.replace(":", "-").replace("\\", "-").replace("/", "-").replace("_", "-")
        session_file = home / ".claude" / "projects" / encoded / f"{FLEET_SESSION_UUID}.jsonl"

        if session_file.exists():
            try:
                session_file.unlink()
                logger.info("[Fleet] Session cleared")
            except Exception as e:
                logger.warning("[Fleet] Failed to clear session: %s", e)

        FleetCLI._cumulative_tokens = 0
        FleetCLI._session_needs_create = True

    def get_quality_metrics(self) -> dict:
        """Return quality metrics."""
        return {
            "retries": self.last_retries,
            "tool_errors": self.last_tool_errors.copy(),
            "cost_usd": self.last_cost_usd,
            "duration_ms": self.last_duration_ms,
            "input_tokens": self.last_input_tokens,
            "output_tokens": self.last_output_tokens,
            "token_log": self.token_log.copy(),
            "num_turns": self.last_num_turns,
            "cache_creation_input_tokens": self.last_cache_creation_tokens,
            "cache_read_input_tokens": self.last_cache_read_tokens,
            "is_error": self.last_is_error,
            "error_message": self.last_error_message,
            "num_tool_uses": self._tool_use_count,
            "friction_events": self._friction_events.copy(),
        }

    @classmethod
    def get_session_stats(cls) -> dict:
        """Get Fleet session statistics."""
        return {
            "session_id": FLEET_SESSION_UUID[:12],
            "cumulative_tokens": cls._cumulative_tokens,
            "threshold": SESSION_TOKEN_THRESHOLD,
            "headroom": SESSION_TOKEN_THRESHOLD - cls._cumulative_tokens,
        }

    @classmethod
    def terminate_agent(cls, agent_name: str, timeout: int = 5) -> dict:
        """Gracefully terminate a running agent process."""
        with cls._lock:
            process = cls._running_processes.get(agent_name)

        if not process:
            return {'success': False, 'message': f'{agent_name} not running', 'terminated': False}

        logger.info("[TERMINATE] Stopping %s (PID: %d)", agent_name, process.pid)

        try:
            process.terminate()
            try:
                process.wait(timeout=timeout)
                return {'success': True, 'message': f'{agent_name} terminated', 'terminated': True}
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
                return {'success': True, 'message': f'{agent_name} force killed', 'terminated': True}
        except Exception as e:
            return {'success': False, 'message': str(e), 'terminated': False}
        finally:
            with cls._lock:
                cls._running_processes.pop(agent_name, None)


class RetryableError(Exception):
    """Error that should trigger retry."""
    pass


# MCP error patterns
MCP_ERROR_PATTERNS = [
    "mcp server", "mcp connection", "failed to connect", "connection refused",
    "connection reset", "server disconnected", "transport error", "stdio transport",
    "spawn error", "econnrefused", "epipe",
]


def terminate_all_fleet_agents() -> int:
    """Kill all running fleet agent processes."""
    terminated = 0
    with FleetCLI._lock:
        for agent, process in list(FleetCLI._running_processes.items()):
            try:
                if process.poll() is None:
                    process.kill()
                    process.wait(timeout=2)
                    terminated += 1
                    logger.info("[%s] Terminated", agent)
            except Exception as e:
                logger.warning("[%s] Failed to terminate: %s", agent, e)
        FleetCLI._running_processes.clear()
    return terminated
