"""
Claude CLI backend - stateless agents with controlled context.

Each call is independent:
- --no-session-persistence: No accumulation across calls
- --max-turns: Limits context growth within a call
- API-level prompt caching still works (5 min TTL on role.md prefix)

Simpler than persistent sessions, no token explosion risk.
"""

import subprocess
import json
import os
import time
import threading
from pathlib import Path

from .base import Backend, INITIAL_DELAY, BACKOFF_MULTIPLIER, MAX_RETRIES
from studio.core.logging_config import get_logger

logger = get_logger("ClaudeCLI")

STALE_TIMEOUT_SECONDS = 1200  # 20 minutes
DEFAULT_MAX_TURNS = 25  # High limit - let agents complete complex tasks


class PersistentClaudeCLI(Backend):
    """Claude CLI backend - stateless with controlled max-turns.

    Despite the legacy name, this is now stateless:
    - Each call starts fresh (--no-session-persistence)
    - Context only grows within a single call (--max-turns limits this)
    - API-level caching still provides ~66% cache hits on role.md
    """

    _running_processes: dict[str, subprocess.Popen] = {}  # agent_name -> process
    _lock = threading.Lock()

    def __init__(self, model: str = "claude", agent_name: str = None):
        super().__init__()
        self.model = model
        self.agent_name = agent_name or "default"
        self.cwd = Path(__file__).parent.parent.parent
        self._reset_metrics()
        logger.info("[%s] Stateless agent initialized", self.agent_name)

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
        self._streaming_input_tokens = 0
        self._streaming_output_tokens = 0
        self._friction_events = []  # Detailed friction log for deliverables
        self._current_turn = 0

    def _add_friction(self, category: str, detail: str):
        """Record a friction event with current turn number."""
        self._friction_events.append({
            "turn": self._current_turn,
            "category": category,
            "detail": detail[:100]
        })

    def _broadcast_live_tokens(self, input_tokens: int, output_tokens: int):
        """Broadcast live token count during streaming."""
        self._streaming_input_tokens += input_tokens
        self._streaming_output_tokens += output_tokens
        try:
            from server_modules.broadcast import broadcast_live_tokens_sync, broadcast_terminal_line_sync
            broadcast_live_tokens_sync(
                self.agent_name,
                self._streaming_input_tokens,
                self._streaming_output_tokens
            )
            broadcast_terminal_line_sync(
                self.agent_name,
                f"[tokens: in={self._streaming_input_tokens}, out={self._streaming_output_tokens}]\n"
            )
        except Exception as e:
            logger.debug("[%s] Token broadcast failed: %s", self.agent_name, e)

    def chat(
        self,
        messages: list[dict],
        system_prompt: str = "",
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send message to Claude CLI (stateless - each call is fresh)."""
        self._reset_token_tracking()
        self._reset_metrics()

        # Always send full context (stateless)
        prompt = self._build_full_prompt(messages, system_prompt)
        prompt_kb = len(prompt.encode('utf-8')) / 1024
        logger.info("[%s] STATELESS START | prompt=%.1fKB | max_turns=%d",
                    self.agent_name, prompt_kb,
                    getattr(self, 'max_turns', None) or DEFAULT_MAX_TURNS)

        try:
            response = self._run_cli(prompt)

            # Execute tool tags if present
            if tool_handlers and "<tool>" in response:
                response = self._execute_tool_tags(response, tool_handlers)

            return response

        except Exception as e:
            import traceback
            self.last_is_error = True
            self.last_error_message = str(e)
            logger.error("[%s] CLI error: %s\n%s", self.agent_name, e, traceback.format_exc())
            try:
                from server_modules.broadcast import broadcast_error_sync
                broadcast_error_sync(self.agent_name, f"{type(e).__name__}: {e}")
            except ImportError:
                pass
            return f"Error: {type(e).__name__}: {e}"

    def _build_full_prompt(self, messages: list[dict], system_prompt: str) -> str:
        """Build full initialization prompt with system context."""
        parts = []

        if system_prompt:
            parts.append(f"SYSTEM:\n{system_prompt}")

        if messages:
            last_msg = messages[-1].get("content", "")
            parts.append(f"\nUser says: {last_msg}")

        parts.append("\nRespond concisely:")
        return "\n".join(parts)

    def _run_cli(self, prompt: str) -> str:
        """Run Claude CLI subprocess."""
        import tempfile

        # Write prompt to temp file
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
        """Run with exponential backoff retry for transient errors."""
        delay = INITIAL_DELAY
        last_error = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                result = self._run_subprocess(temp_path, prompt)

                # Check for empty response that might indicate MCP failure
                if result == "No response from Claude CLI" and attempt < MAX_RETRIES:
                    logger.warning("[%s] Empty response, retrying %d/%d", self.agent_name, attempt, MAX_RETRIES)
                    time.sleep(delay)
                    delay *= BACKOFF_MULTIPLIER
                    continue

                return result

            except (RetryableError, MCPConnectionError) as e:
                last_error = e
                error_type = "MCP" if isinstance(e, MCPConnectionError) else "Transient"
                if attempt < MAX_RETRIES:
                    logger.warning("[%s] %s error, retry %d/%d: %s", self.agent_name, error_type, attempt, MAX_RETRIES, e)
                    time.sleep(delay)
                    delay *= BACKOFF_MULTIPLIER
                else:
                    try:
                        from server_modules.broadcast import broadcast_error_sync
                        broadcast_error_sync(self.agent_name, f"{error_type}: {e}")
                    except ImportError:
                        pass

        if last_error:
            raise last_error
        return "No response from Claude CLI (retries exhausted)"

    def _run_subprocess(self, temp_path: str, prompt: str) -> str:
        """Run single Claude CLI subprocess (stateless)."""
        # Kill any stale process for this agent first
        with PersistentClaudeCLI._lock:
            old_process = PersistentClaudeCLI._running_processes.get(self.agent_name)
            if old_process and old_process.poll() is None:
                logger.warning("[%s] Killing stale process PID %d", self.agent_name, old_process.pid)
                try:
                    old_process.kill()
                    old_process.wait(timeout=2)
                except Exception:
                    pass
                PersistentClaudeCLI._running_processes.pop(self.agent_name, None)

        if os.name == 'nt':
            claude_cmd = os.path.join(os.environ.get('APPDATA', ''), 'npm', 'claude.cmd')
            shell = True
        else:
            claude_cmd = "claude"
            shell = False

        cmd = [claude_cmd, "-p", "-", "--output-format", "stream-json", "--verbose"]

        # Stateless: no session persistence, fresh context each call
        cmd.append("--no-session-persistence")

        # MCP config
        # Tool scoping by agent type
        # Vanilla = no tools, pure input/output (stateless compressors, formatters)
        VANILLA_AGENTS = {"Compression", "Text", "Image", "Audio", "Video"}

        if self.agent_name in VANILLA_AGENTS:
            # Vanilla agents: NO tools, NO MCP - pure input/output
            pass  # Skip MCP config and allowedTools entirely
        else:
            # Non-vanilla: connect to MCP
            mcp_config = self.cwd / ".claude" / "settings.json"
            if mcp_config.exists():
                cmd.extend(["--mcp-config", str(mcp_config)])

            if self.agent_name == "BOSS":
                # BOSS: delegation + routine creation + awareness - NO file reading
                allowed = "mcp__game-studio__create_task,mcp__game-studio__create_routine,mcp__game-studio__recall_memory,mcp__game-studio__get_task_status,mcp__game-studio__write_report"
            elif self.agent_name == "Routine":
                # Routine agent: only routine management
                allowed = "mcp__game-studio__create_routine,mcp__game-studio__get_task_status"
            else:
                # Workers: file ops only
                allowed = "mcp__game-studio__search_code,mcp__game-studio__read_lines,mcp__game-studio__edit_file,mcp__game-studio__write_report"
            cmd.extend(["--allowedTools", allowed])

        cmd.append("--dangerously-skip-permissions")

        # Limit context growth within call (default 8 turns)
        if hasattr(self, 'max_turns') and self.max_turns:
            max_turns = self.max_turns
        else:
            max_turns = 5 if self.agent_name == "BOSS" else DEFAULT_MAX_TURNS
        cmd.extend(["--max-turns", str(max_turns)])

        # Model selection
        if hasattr(self, 'model') and self.model and self.model != "claude":
            cmd.extend(["--model", self.model])

        # Log command with key flags for verification
        flags = [f for f in cmd if f.startswith('--')]
        logger.debug("[%s] CMD flags: %s", self.agent_name, " ".join(flags))

        # Read prompt
        with open(temp_path, 'r', encoding='utf-8') as f:
            prompt_content = f.read()

        # Run process
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

        # Track running process for graceful termination
        with PersistentClaudeCLI._lock:
            PersistentClaudeCLI._running_processes[self.agent_name] = process

        try:
            # Send input
            try:
                process.stdin.write(prompt_content)
                process.stdin.close()
            except BrokenPipeError:
                process.wait()
                stderr = process.stderr.read() if process.stderr else ""
                raise RuntimeError(f"CLI exited early: {stderr[:200]}")

            # Collect output
            return self._collect_output(process, prompt)
        finally:
            # Remove from tracking when done
            with PersistentClaudeCLI._lock:
                PersistentClaudeCLI._running_processes.pop(self.agent_name, None)

    def _collect_output(self, process: subprocess.Popen, prompt: str) -> str:
        """Collect and parse stream-json output with immediate event processing."""
        text_content = []
        result_data = [None]  # Use list for nonlocal mutation in thread
        last_output_time = time.time()
        stderr_lines = []

        # Reader threads - stdout now processes events immediately
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
                    pass

        def read_stderr():
            nonlocal last_output_time
            for line in process.stderr:
                last_output_time = time.time()
                stderr_lines.append(line.strip())

        stdout_thread = threading.Thread(target=read_stdout, daemon=True)
        stderr_thread = threading.Thread(target=read_stderr, daemon=True)
        stdout_thread.start()
        stderr_thread.start()

        # Wait with stale detection
        while process.poll() is None:
            time.sleep(1)
            if time.time() - last_output_time > STALE_TIMEOUT_SECONDS:
                process.kill()
                raise TimeoutError(f"No output for {STALE_TIMEOUT_SECONDS}s")

        stdout_thread.join(timeout=5)
        stderr_thread.join(timeout=5)

        # Check exit code
        if process.returncode != 0:
            error = "\n".join(stderr_lines)
            error_lower = error.lower()

            # Rate limit - retryable
            if "rate limit" in error_lower or "overloaded" in error_lower:
                raise RetryableError(f"Rate limited: {error[:100]}")

            # MCP connection error - retryable
            if any(pattern in error_lower for pattern in MCP_ERROR_PATTERNS):
                raise MCPConnectionError(f"MCP connection failed: {error[:150]}")

            # Exit code 1 with context/token keywords = out of tokens
            if process.returncode == 1:
                if any(kw in error_lower for kw in ["context", "token", "limit", "exceeded", "capacity"]):
                    raise OutOfTokensError(
                        f"Out of tokens: Context limit exceeded. Consider breaking task into smaller steps. ({error[:100]})"
                    )

            raise RuntimeError(f"CLI error (code {process.returncode}): {error[:200]}")

        # Extract result
        return self._extract_result(result_data[0], text_content, prompt)

    def _process_event(self, event: dict, text_content: list):
        """Process stream event and accumulate text/metrics."""
        event_type = event.get("type", "")
        logger.debug("[%s] EVENT: %s", self.agent_name, event_type)

        if event_type == "assistant":
            message = event.get("message", {})
            for block in message.get("content", []):
                if block.get("type") == "text":
                    text = block.get("text", "")
                    text_content.append(text)
                    # Also broadcast to terminal (final text blocks)
                    if text:
                        try:
                            from server_modules.broadcast import broadcast_terminal_line_sync
                            broadcast_terminal_line_sync(self.agent_name, text + "\n")
                        except Exception as e:
                            logger.warning("[%s] Terminal broadcast failed: %s", self.agent_name, e)
            usage = message.get("usage", {})
            if usage.get("input_tokens"):
                input_t = usage.get("input_tokens", 0)
                output_t = usage.get("output_tokens", 0)
                self._log_step("reasoning", input_t, output_t)
                # Broadcast live tokens during streaming
                self._broadcast_live_tokens(input_t, output_t)

        elif event_type == "content_block_delta":
            delta = event.get("delta", {})
            if delta.get("type") == "text_delta":
                text = delta.get("text", "")
                text_content.append(text)
                # Stream to terminal UI
                if text:
                    try:
                        from server_modules.broadcast import broadcast_terminal_line_sync
                        broadcast_terminal_line_sync(self.agent_name, text)
                    except Exception as e:
                        logger.warning("[%s] Terminal broadcast failed: %s", self.agent_name, e)

        elif event_type == "content_block_start":
            if event.get("content_block", {}).get("type") == "tool_use":
                self._tool_use_count += 1

        elif event_type == "system":
            subtype = event.get("subtype", "")
            if subtype == "api_retry":
                self.last_retries += 1
                self._add_friction("retry", f"API retry #{self.last_retries}")
            # Detect actual MCP errors (not init/normal events)
            elif subtype == "mcp_error":
                error_msg = event.get("message", str(event))
                logger.warning("[%s] MCP error: %s", self.agent_name, error_msg[:100])
                self.last_tool_errors.append(f"MCP: {error_msg[:50]}")
                self._add_friction("mcp_error", error_msg[:80])
            # Track turn progression
            elif subtype == "turn_start":
                self._current_turn += 1

        elif event_type == "tool_result":
            # Check for MCP tool failures in results
            result = event.get("result", {})
            if isinstance(result, dict) and result.get("is_error"):
                error_content = str(result.get("content", ""))
                self._add_friction("tool_error", error_content[:80])
                if any(p in error_content.lower() for p in MCP_ERROR_PATTERNS):
                    logger.warning("[%s] MCP tool failed: %s", self.agent_name, error_content[:100])
                    self.last_tool_errors.append(f"MCP tool: {error_content[:50]}")

    def _extract_result(self, result_data: dict, text_content: list, prompt: str) -> str:
        """Extract final result and metrics."""
        if result_data:
            self.last_cost_usd = result_data.get("total_cost_usd", 0.0) or 0.0
            self.last_duration_ms = result_data.get("duration_ms", 0) or 0
            self.last_num_turns = result_data.get("num_turns", 0) or 0

            usage = result_data.get("usage", {})
            total_input = usage.get("input_tokens", 0)
            total_output = usage.get("output_tokens", 0)
            self.last_cache_creation_tokens = usage.get("cache_creation_input_tokens", 0)
            self.last_cache_read_tokens = usage.get("cache_read_input_tokens", 0)

            # Store totals
            self.last_input_tokens = total_input + self.last_cache_read_tokens
            self.last_output_tokens = total_output

            # Log final stats for verification
            cache_pct = (self.last_cache_read_tokens / max(self.last_input_tokens, 1)) * 100
            logger.info(
                "[%s] STATELESS END | turns=%d | in=%dK out=%dK | cache=%.0f%% | cost=$%.4f",
                self.agent_name,
                self.last_num_turns,
                self.last_input_tokens // 1000,
                self.last_output_tokens // 1000,
                cache_pct,
                self.last_cost_usd
            )

        # T631 FIX: Prefer accumulated text (all turns) over result (last turn only)
        # Claude CLI's result field only contains the last text block, missing earlier messages
        # text_content accumulates all text blocks from all assistant events
        if text_content:
            # Join with newlines to separate different turn outputs
            result = "\n\n".join(text_content)
            return result

        # Fallback to result text if no accumulated text
        if result_data:
            result_text = result_data.get("result", "")
            if result_text:
                return result_text

        return "No response from Claude CLI"

    def _execute_tool_tags(self, response: str, tool_handlers: dict) -> str:
        """Parse and execute <tool> tags."""
        import re

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
                self._tool_use_count += 1
            except json.JSONDecodeError as e:
                results.append(f"[{tool_name} params error]: {e}")
                self.last_tool_errors.append(f"{tool_name}: invalid JSON")
            except Exception as e:
                results.append(f"[{tool_name} error]: {e}")
                self.last_tool_errors.append(f"{tool_name}: {e}")

        cleaned = re.sub(pattern, '', response, flags=re.DOTALL).strip()
        if results:
            cleaned += "\n\n---\nTool Results:\n" + "\n".join(results)

        return cleaned

    def get_quality_metrics(self) -> dict:
        """Return quality metrics from last call."""
        # Add high turn usage friction if applicable
        if hasattr(self, 'max_turns') and self.max_turns and self._current_turn > 0:
            turn_pct = (self._current_turn / self.max_turns) * 100
            if turn_pct >= 80:
                self._add_friction("high_turns", f"Used {self._current_turn}/{self.max_turns} turns ({turn_pct:.0f}%)")

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

    def compact_session(self) -> bool:
        """No-op for backwards compatibility. Stateless agents don't need compaction."""
        return False

    @classmethod
    def terminate_agent(cls, agent_name: str, timeout: int = 5) -> dict:
        """
        Gracefully terminate a running agent process.
        
        Args:
            agent_name: Name of agent to terminate
            timeout: Seconds to wait for graceful shutdown before force kill
            
        Returns:
            dict with 'success', 'message', 'terminated'
        """
        with cls._lock:
            process = cls._running_processes.get(agent_name)
        
        if not process:
            return {
                'success': False,
                'message': f'Agent {agent_name} is not currently running',
                'terminated': False
            }
        
        logger.info(f"[TERMINATE] Stopping {agent_name} (PID: {process.pid})")
        
        try:
            # Try graceful termination first
            process.terminate()
            
            # Wait for graceful shutdown
            try:
                process.wait(timeout=timeout)
                logger.info(f"[TERMINATE] {agent_name} stopped gracefully")
                return {
                    'success': True,
                    'message': f'Agent {agent_name} terminated gracefully',
                    'terminated': True
                }
            except subprocess.TimeoutExpired:
                # Force kill if still running
                logger.warning(f"[TERMINATE] {agent_name} did not stop gracefully, force killing")
                process.kill()
                process.wait()
                return {
                    'success': True,
                    'message': f'Agent {agent_name} force killed after timeout',
                    'terminated': True
                }
        except Exception as e:
            logger.error(f"[TERMINATE] Failed to terminate {agent_name}: {e}")
            return {
                'success': False,
                'message': f'Failed to terminate {agent_name}: {e}',
                'terminated': False
            }
        finally:
            # Clean up tracking
            with cls._lock:
                cls._running_processes.pop(agent_name, None)


class RetryableError(Exception):
    """Error that should trigger retry."""
    pass


class OutOfTokensError(Exception):
    """CLI ran out of tokens (exit code 1 with context limit message)."""
    pass


class MCPConnectionError(Exception):
    """MCP server connection failed - should trigger retry."""
    pass


# MCP error patterns to detect connection issues
MCP_ERROR_PATTERNS = [
    "mcp server",
    "mcp connection",
    "failed to connect",
    "connection refused",
    "connection reset",
    "server disconnected",
    "transport error",
    "stdio transport",
    "spawn error",
    "econnrefused",
    "epipe",
]


# =============================================================================
# UTILITIES
# =============================================================================

def terminate_all_agents() -> int:
    """Kill all running agent processes. Returns count terminated."""
    terminated = 0
    with PersistentClaudeCLI._lock:
        for agent, process in list(PersistentClaudeCLI._running_processes.items()):
            try:
                if process.poll() is None:
                    process.kill()
                    process.wait(timeout=2)
                    terminated += 1
                    logger.info("[%s] Terminated", agent)
            except Exception as e:
                logger.warning("[%s] Failed to terminate: %s", agent, e)
        PersistentClaudeCLI._running_processes.clear()
    return terminated


# =============================================================================
# BACKWARDS COMPATIBILITY STUBS (sessions no longer used)
# =============================================================================

def clear_session(agent_name: str) -> bool:
    """No-op stub. Sessions no longer persist across calls."""
    logger.debug("[%s] clear_session called (no-op, stateless mode)", agent_name)
    return False


def clear_all_sessions() -> int:
    """Kill running agents. Sessions no longer persist across calls."""
    return terminate_all_agents()


def list_sessions() -> dict[str, dict]:
    """Return empty session list. Sessions no longer persist."""
    return {}


def get_session_stats() -> dict:
    """Return empty stats. Sessions no longer persist."""
    return {
        "total_sessions": 0,
        "total_size_kb": 0,
        "sessions": {},
        "note": "Stateless mode - no session persistence"
    }
