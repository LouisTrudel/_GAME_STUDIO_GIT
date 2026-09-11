"""
Claude CLI backend with persistent sessions.

Session lifecycle:
1. Server boot: Delete old session file (fresh start)
2. First call: --session-id + full context (memTier1 + hub + trigger)
3. Subsequent calls: --resume + just trigger (session has context)

Memory is managed server-side but injected on first call.
Prompt caching works at Anthropic API level (5 min TTL).
"""

import subprocess
import json
import os
import time
import threading
import hashlib
import uuid
from pathlib import Path
from typing import Optional

from .base import Backend, INITIAL_DELAY, BACKOFF_MULTIPLIER, MAX_RETRIES
import logging

logger = logging.getLogger("PersistentCLI")

STALE_TIMEOUT_SECONDS = 1200  # 20 minutes


def get_session_uuid(agent_name: str) -> str:
    """Generate deterministic session UUID for an agent."""
    hash_bytes = hashlib.sha256(f"game-studio-persistent-{agent_name}".encode()).digest()
    return str(uuid.UUID(bytes=hash_bytes[:16]))


def _get_session_file_path(cwd: Path, session_uuid: str) -> Optional[Path]:
    """Get path to session file if it exists."""
    home = Path.home()
    claude_projects = home / ".claude" / "projects"
    if not claude_projects.exists():
        return None

    cwd_str = str(cwd.resolve())
    encoded = cwd_str.replace(":", "-").replace("\\", "-").replace("/", "-").replace("_", "-")
    session_file = claude_projects / encoded / f"{session_uuid}.jsonl"
    return session_file if session_file.exists() else None


def _delete_session_file(cwd: Path, session_uuid: str) -> bool:
    """Delete session file if it exists. Returns True if deleted."""
    session_file = _get_session_file_path(cwd, session_uuid)
    if session_file:
        try:
            session_file.unlink()
            logger.info("Deleted session file: %s", session_file.name)
            return True
        except Exception as e:
            logger.warning("Failed to delete session file: %s", e)
    return False


class PersistentClaudeCLI(Backend):
    """Claude CLI backend with persistent sessions (cleared on boot)."""

    # Class-level: tracks which agents are initialized THIS boot
    # Resets when module reloads (server restart)
    _initialized: dict[str, bool] = {}
    _initialized_sessions: dict[str, bool] = {}
    _task_counts: dict[str, int] = {}
    _running_processes: dict[str, subprocess.Popen] = {}  # agent_name -> process
    _lock = threading.Lock()

    # Reinitialize session after N tasks to refresh role.md context
    REINIT_AFTER_TASKS = 20

    def __init__(self, model: str = "claude", agent_name: str = None):
        super().__init__()
        self.model = model
        self.agent_name = agent_name or "default"
        self.cwd = Path(__file__).parent.parent.parent
        self._session_uuid = get_session_uuid(self.agent_name)
        self._reset_metrics()

        # Delete old session file on boot (fresh start)
        if self.agent_name not in PersistentClaudeCLI._initialized:
            _delete_session_file(self.cwd, self._session_uuid)
            PersistentClaudeCLI._initialized[self.agent_name] = False

        logger.info("[%s] Session %s", self.agent_name, self._session_uuid[:8])

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
            from server_modules.broadcast import broadcast_live_tokens_sync
            broadcast_live_tokens_sync(
                self.agent_name,
                self._streaming_input_tokens,
                self._streaming_output_tokens
            )
        except ImportError:
            pass  # Server not running (e.g., CLI mode)

    def is_initialized(self) -> bool:
        """Check if this agent has been initialized this boot (public API)."""
        return PersistentClaudeCLI._initialized.get(self.agent_name, False)

    def _mark_initialized(self):
        """Mark agent as initialized."""
        PersistentClaudeCLI._initialized[self.agent_name] = True

    def chat(
        self,
        messages: list[dict],
        system_prompt: str = "",
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send message to Claude CLI with session persistence."""
        self._reset_token_tracking()
        self._reset_metrics()

        # First call: full context + --session-id
        # Subsequent: just message + --resume
        if self.is_initialized():
            # Incremental: just the user message
            prompt = messages[-1].get("content", "") if messages else ""
            is_init = False
            logger.info("[%s] Incremental (%d chars)", self.agent_name, len(prompt))
        else:
            # Init: full context (system + message)
            prompt = self._build_full_prompt(messages, system_prompt)
            is_init = True
            logger.info("[%s] Init (%d chars)", self.agent_name, len(prompt))

        # Run CLI
        try:
            response = self._run_cli(prompt, is_init=is_init)

            # Mark as initialized after successful first call
            if is_init:
                self._mark_initialized()

            # Execute tool tags if present
            if tool_handlers and "<tool>" in response:
                response = self._execute_tool_tags(response, tool_handlers)

            return response

        except Exception as e:
            import traceback
            self.last_is_error = True
            self.last_error_message = str(e)
            logger.error("[%s] CLI error: %s\n%s", self.agent_name, e, traceback.format_exc())
            # Broadcast error to UI
            try:
                from server_modules.broadcast import broadcast_error_sync
                broadcast_error_sync(self.agent_name, f"{type(e).__name__}: {e}")
            except ImportError:
                pass  # Server modules not available
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

    def _run_cli(self, prompt: str, is_init: bool = False) -> str:
        """Run Claude CLI subprocess."""
        import tempfile

        # Write prompt to temp file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write(prompt)
            temp_path = f.name

        try:
            return self._run_with_retry(temp_path, prompt, is_init)
        finally:
            try:
                os.unlink(temp_path)
            except Exception:
                pass

    def _run_with_retry(self, temp_path: str, prompt: str, is_init: bool) -> str:
        """Run with exponential backoff retry for transient errors."""
        delay = INITIAL_DELAY
        last_error = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                result = self._run_subprocess(temp_path, prompt, is_init)

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
                    # Final attempt failed - broadcast error
                    try:
                        from server_modules.broadcast import broadcast_error_sync
                        broadcast_error_sync(self.agent_name, f"{error_type}: {e}")
                    except ImportError:
                        pass

        if last_error:
            raise last_error
        return "No response from Claude CLI (retries exhausted)"

    def _run_subprocess(self, temp_path: str, prompt: str, is_init: bool) -> str:
        """Run single Claude CLI subprocess."""
        if os.name == 'nt':
            claude_cmd = os.path.join(os.environ.get('APPDATA', ''), 'npm', 'claude.cmd')
            shell = True
        else:
            claude_cmd = "claude"
            shell = False

        cmd = [claude_cmd, "-p", "-", "--output-format", "stream-json", "--verbose"]

        # Session handling: init creates new, subsequent resumes
        if is_init:
            cmd.extend(["--session-id", self._session_uuid])
        else:
            cmd.extend(["--resume", self._session_uuid])

        # MCP config
        mcp_config = self.cwd / ".claude" / "settings.json"
        if mcp_config.exists():
            cmd.extend(["--mcp-config", str(mcp_config)])

        cmd.append("--dangerously-skip-permissions")

        # Auto-approve tools (no permission prompts)
        if self.agent_name == "BOSS":
            # BOSS: MCP tools + Bash (for git) - no Read/Write/Edit (delegates instead)
            allowed = "mcp__game-studio__*,Bash,Task"
        else:
            # Employees: Full tool access
            allowed = "mcp__game-studio__*,Read,Write,Edit,Glob,Grep,Bash"
        cmd.extend(["--allowedTools", allowed])

        # Limit exploration to prevent token explosion
        # Reserve 2 turns for formatting (work gets max_turns - 2)
        if hasattr(self, 'max_turns') and self.max_turns:
            max_turns = max(self.max_turns - 2, 3)  # Reserve 2, min 3
        else:
            max_turns = 5 if self.agent_name == "BOSS" else 28  # 30-2 for employees
        cmd.extend(["--max-turns", str(max_turns)])

        # Model selection - use haiku for cheaper exploration
        if hasattr(self, 'model') and self.model and self.model != "claude":
            cmd.extend(["--model", self.model])

        logger.debug("[%s] CMD: %s", self.agent_name, " ".join(cmd[:5]))

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

        if event_type == "assistant":
            message = event.get("message", {})
            for block in message.get("content", []):
                if block.get("type") == "text":
                    text_content.append(block.get("text", ""))
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
                    from server_modules.broadcast import broadcast_terminal_line_sync
                    broadcast_terminal_line_sync(self.agent_name, text)

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

            # Use result text if available
            result_text = result_data.get("result", "")
            if result_text:
                return result_text

        # Fallback to accumulated text
        result = "".join(text_content)
        if not result:
            return "No response from Claude CLI"

        return result

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

    def reset_session(self):
        """Force session reset - next call will reinitialize with full context."""
        with self._lock:
            self._initialized_sessions[self.agent_name] = False
        logger.info("[%s] Session marked for reinitialization", self.agent_name)

    def compact_session(self) -> bool:
        """Compact or reinit session after task completion.

        Called after each task completes:
        - Normal: Compact (summarize conversation, keep role.md)
        - Every N tasks: Full reinit (clear session, fresh role.md injection)

        Returns True if operation succeeded.
        """
        if not self.is_initialized():
            logger.debug("[%s] Not initialized, skipping compact", self.agent_name)
            return False

        # Increment task counter
        with self._lock:
            count = self._task_counts.get(self.agent_name, 0) + 1
            self._task_counts[self.agent_name] = count

        # Check if time for full reinit
        if count >= self.REINIT_AFTER_TASKS:
            logger.info("[%s] %d tasks reached - full reinit for fresh role.md", self.agent_name, count)
            return self._full_reinit()

        # Normal compaction
        try:
            logger.info("[%s] Compacting session (task %d/%d)...",
                       self.agent_name, count, self.REINIT_AFTER_TASKS)
            self._run_cli("/compact")
            logger.info("[%s] Session compacted", self.agent_name)
            return True
        except Exception as e:
            logger.warning("[%s] Compact failed: %s", self.agent_name, e)
            return False

    def _full_reinit(self) -> bool:
        """Clear session entirely for fresh role.md injection.

        Deletes session file and resets state. Next call will:
        1. Create new session
        2. Inject fresh role.md (primacy position)
        3. Start with clean conversation history
        """
        try:
            # Clear the session file
            if clear_session(self.agent_name):
                logger.info("[%s] Session cleared", self.agent_name)

            # Reset task counter
            with self._lock:
                self._task_counts[self.agent_name] = 0
                self._initialized_sessions[self.agent_name] = False

            logger.info("[%s] Full reinit complete - next call injects fresh role.md", self.agent_name)
            return True
        except Exception as e:
            logger.warning("[%s] Full reinit failed: %s", self.agent_name, e)
            return False

    @classmethod
    def reset_all_sessions(cls):
        """Reset all session states - all agents will reinitialize."""
        with cls._lock:
            cls._initialized_sessions.clear()
            cls._task_counts.clear()
        logger.info("All sessions marked for reinitialization")

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
# SESSION MANAGEMENT UTILITIES (not auto-enabled)
# =============================================================================

def list_sessions() -> dict[str, dict]:
    """List all agent sessions with metadata.

    Returns dict of agent_name -> {uuid, file_path, size_kb, exists}
    """
    from pathlib import Path

    cwd = Path(__file__).parent.parent.parent
    home = Path.home()
    claude_projects = home / ".claude" / "projects"

    # Encode cwd path like Claude does
    cwd_str = str(cwd.resolve())
    encoded = cwd_str.replace(":", "-").replace("\\", "-").replace("/", "-").replace("_", "-")
    project_dir = claude_projects / encoded

    sessions = {}

    # Known agents
    agents = ["BOSS", "Code", "Design", "ArtSpec", "Text", "Audit",
              "Prompt", "Research", "Routine", "Structure", "Image", "Audio", "Video"]

    for agent in agents:
        uuid = get_session_uuid(agent)
        session_file = project_dir / f"{uuid}.jsonl"

        sessions[agent] = {
            "uuid": uuid[:8],
            "file_path": str(session_file),
            "exists": session_file.exists(),
            "size_kb": round(session_file.stat().st_size / 1024, 1) if session_file.exists() else 0
        }

    return sessions


def clear_session(agent_name: str) -> bool:
    """Clear a specific agent's session file.

    The agent will reinitialize with full context on next call.
    """
    from pathlib import Path

    cwd = Path(__file__).parent.parent.parent
    home = Path.home()
    claude_projects = home / ".claude" / "projects"

    cwd_str = str(cwd.resolve())
    encoded = cwd_str.replace(":", "-").replace("\\", "-").replace("/", "-").replace("_", "-")
    project_dir = claude_projects / encoded

    uuid = get_session_uuid(agent_name)
    session_file = project_dir / f"{uuid}.jsonl"

    if session_file.exists():
        session_file.unlink()
        # Also clear in-memory state
        with PersistentClaudeCLI._lock:
            PersistentClaudeCLI._initialized_sessions.pop(agent_name, None)
        logger.info("[%s] Session cleared", agent_name)
        return True
    return False


def clear_all_sessions() -> int:
    """Clear all agent session files.

    Returns number of sessions cleared.
    """
    sessions = list_sessions()
    cleared = 0

    for agent, info in sessions.items():
        if info["exists"]:
            if clear_session(agent):
                cleared += 1

    return cleared


def get_session_stats() -> dict:
    """Get aggregate session statistics."""
    sessions = list_sessions()

    total_size = sum(s["size_kb"] for s in sessions.values())
    active_count = sum(1 for s in sessions.values() if s["exists"])

    return {
        "total_sessions": active_count,
        "total_size_kb": round(total_size, 1),
        "sessions": sessions
    }
