"""
BOSS CLI Backend - Dedicated cached session for BOSS agent.

- Haiku model (fast, cheap delegation)
- Own session UUID (separate from fleet)
- Auto-clears at token threshold
- MCP tools: create_task, create_routine, recall_memory, get_task_status, write_report
"""

import subprocess
import json
import os
import time
import threading
from pathlib import Path

from .base import Backend, INITIAL_DELAY, BACKOFF_MULTIPLIER, MAX_RETRIES
from studio.core.logging_config import get_logger

logger = get_logger("BossCLI")

STALE_TIMEOUT_SECONDS = 1200  # 20 minutes
SESSION_TOKEN_THRESHOLD = 150_000  # Auto-clear threshold
BOSS_SESSION_UUID = "boss-0001-0001-0001-000000000001"


class BossCLI(Backend):
    """
    Dedicated CLI session for BOSS agent.

    - Haiku model for fast delegation
    - Persistent session with cache
    - Auto-clears when tokens exceed threshold
    """

    _cumulative_tokens: int = 0
    _session_needs_create: bool = True
    _lock = threading.Lock()

    def __init__(self, model: str = "haiku", agent_name: str = "BOSS"):
        super().__init__()
        self.model = model
        self.agent_name = agent_name
        self.cwd = Path(__file__).parent.parent.parent
        self._reset_metrics()
        logger.info("[BOSS] CLI initialized (model=%s, threshold=%dK)",
                    model, SESSION_TOKEN_THRESHOLD // 1000)

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

    def chat(
        self,
        messages: list[dict],
        system_prompt: str = "",
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send message to BOSS CLI session."""
        self._reset_token_tracking()
        self._reset_metrics()

        prompt = self._build_prompt(messages, system_prompt)

        logger.info("[BOSS] Starting | prompt=%.1fKB | cumulative=%dK/%dK",
                    len(prompt) / 1024,
                    BossCLI._cumulative_tokens // 1000,
                    SESSION_TOKEN_THRESHOLD // 1000)

        try:
            response = self._run_cli(prompt)

            # Execute tool tags if present
            if tool_handlers and "<tool>" in response:
                response = self._execute_tool_tags(response, tool_handlers)

            return response
        except Exception as e:
            self.last_is_error = True
            self.last_error_message = str(e)
            logger.error("[BOSS] Error: %s", e)
            return f"Error: {type(e).__name__}: {e}"
        finally:
            self._update_cumulative_tokens()

    def _build_prompt(self, messages: list[dict], system_prompt: str) -> str:
        """Build prompt with system context."""
        parts = []
        if system_prompt:
            parts.append(f"SYSTEM:\n{system_prompt}")
        if messages:
            last_msg = messages[-1].get("content", "")
            parts.append(f"\nUser says: {last_msg}")
        parts.append("\nRespond concisely:")
        return "\n".join(parts)

    def _run_cli(self, prompt: str) -> str:
        """Run Claude CLI with BOSS session."""
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
                    logger.warning("[BOSS] Retry %d/%d: %s", attempt, MAX_RETRIES, e)
                    time.sleep(delay)
                    delay *= BACKOFF_MULTIPLIER

        if last_error:
            raise last_error
        return "No response from BOSS CLI"

    def _run_subprocess(self, temp_path: str, prompt: str) -> str:
        """Run single BOSS CLI subprocess."""
        if os.name == 'nt':
            claude_cmd = os.path.join(os.environ.get('APPDATA', ''), 'npm', 'claude.cmd')
            shell = True
        else:
            claude_cmd = "claude"
            shell = False

        cmd = [claude_cmd, "-p", "-", "--output-format", "stream-json", "--verbose"]

        # Session management - resume if exists, create if new/cleared
        session_exists = self._session_file_exists()

        with BossCLI._lock:
            if session_exists and not BossCLI._session_needs_create:
                cmd.extend(["--resume", BOSS_SESSION_UUID])
                logger.debug("[BOSS] Resuming session")
            else:
                cmd.extend(["--session-id", BOSS_SESSION_UUID])
                BossCLI._session_needs_create = False
                logger.info("[BOSS] Creating new session")

        # MCP config
        mcp_config = self.cwd / ".claude" / "settings.json"
        if mcp_config.exists():
            cmd.extend(["--mcp-config", str(mcp_config)])

        # BOSS tools: delegation + awareness (NO file reading)
        allowed = "mcp__game-studio__create_task,mcp__game-studio__create_routine,mcp__game-studio__recall_memory,mcp__game-studio__get_task_status,mcp__game-studio__write_report"
        cmd.extend(["--allowedTools", allowed])
        cmd.append("--dangerously-skip-permissions")

        # Haiku model, limited turns
        cmd.extend(["--model", self.model])
        cmd.extend(["--max-turns", "5"])

        logger.debug("[BOSS] CMD: %s", " ".join(cmd))

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

        try:
            process.stdin.write(prompt_content)
            process.stdin.close()
        except BrokenPipeError:
            process.wait()
            stderr = process.stderr.read() if process.stderr else ""

            # Handle session errors
            if "already in use" in stderr.lower():
                logger.warning("[BOSS] Session in use, retrying with --resume")
                with BossCLI._lock:
                    BossCLI._session_needs_create = False
                return self._run_subprocess(temp_path, prompt)
            if "No conversation found" in stderr:
                logger.warning("[BOSS] Session expired, creating new")
                with BossCLI._lock:
                    BossCLI._session_needs_create = True
                return self._run_subprocess(temp_path, prompt)

            raise RuntimeError(f"CLI exited early: {stderr[:200]}")

        return self._collect_output(process, prompt)

    def _session_file_exists(self) -> bool:
        """Check if BOSS session file exists."""
        home = Path.home()
        cwd_str = str(self.cwd.resolve())
        encoded = cwd_str.replace(":", "-").replace("\\", "-").replace("/", "-").replace("_", "-")
        session_file = home / ".claude" / "projects" / encoded / f"{BOSS_SESSION_UUID}.jsonl"
        return session_file.exists()

    def _collect_output(self, process: subprocess.Popen, prompt: str) -> str:
        """Collect stream-json output."""
        text_content = []
        result_data = [None]
        last_output_time = time.time()
        stderr_lines = []

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

        while process.poll() is None:
            time.sleep(1)
            if time.time() - last_output_time > STALE_TIMEOUT_SECONDS:
                process.kill()
                raise TimeoutError(f"No output for {STALE_TIMEOUT_SECONDS}s")

        stdout_thread.join(timeout=5)
        stderr_thread.join(timeout=5)

        if process.returncode != 0:
            error = "\n".join(stderr_lines)
            if "rate limit" in error.lower() or "overloaded" in error.lower():
                raise RetryableError(f"Rate limited: {error[:100]}")
            raise RuntimeError(f"CLI error (code {process.returncode}): {error[:200]}")

        return self._extract_result(result_data[0], text_content)

    def _process_event(self, event: dict, text_content: list):
        """Process stream event."""
        event_type = event.get("type", "")

        if event_type == "assistant":
            message = event.get("message", {})
            for block in message.get("content", []):
                if block.get("type") == "text":
                    text_content.append(block.get("text", ""))
            usage = message.get("usage", {})
            if usage.get("input_tokens"):
                self._log_step("reasoning", usage.get("input_tokens", 0), usage.get("output_tokens", 0))

        elif event_type == "content_block_delta":
            delta = event.get("delta", {})
            if delta.get("type") == "text_delta":
                text_content.append(delta.get("text", ""))

        elif event_type == "content_block_start":
            if event.get("content_block", {}).get("type") == "tool_use":
                self._tool_use_count += 1

        elif event_type == "system":
            if event.get("subtype") == "api_retry":
                self.last_retries += 1

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

            cache_pct = (self.last_cache_read_tokens / max(self.last_input_tokens, 1)) * 100
            logger.info("[BOSS] Done | turns=%d | in=%dK out=%dK | cache=%.0f%% | $%.4f",
                        self.last_num_turns,
                        self.last_input_tokens // 1000,
                        self.last_output_tokens // 1000,
                        cache_pct,
                        self.last_cost_usd)

        if text_content:
            return "\n\n".join(text_content)

        if result_data:
            return result_data.get("result", "No response")

        return "No response from BOSS CLI"

    def _update_cumulative_tokens(self):
        """Track cumulative tokens and auto-clear if threshold exceeded."""
        call_tokens = self.last_input_tokens + self.last_cache_read_tokens

        with BossCLI._lock:
            BossCLI._cumulative_tokens += call_tokens

            if BossCLI._cumulative_tokens > SESSION_TOKEN_THRESHOLD:
                logger.warning("[BOSS] Threshold exceeded (%dK > %dK), clearing session",
                              BossCLI._cumulative_tokens // 1000,
                              SESSION_TOKEN_THRESHOLD // 1000)
                self._clear_session()

    def _clear_session(self):
        """Clear BOSS session file."""
        home = Path.home()
        cwd_str = str(self.cwd.resolve())
        encoded = cwd_str.replace(":", "-").replace("\\", "-").replace("/", "-").replace("_", "-")
        session_file = home / ".claude" / "projects" / encoded / f"{BOSS_SESSION_UUID}.jsonl"

        if session_file.exists():
            try:
                session_file.unlink()
                logger.info("[BOSS] Session cleared")
            except Exception as e:
                logger.warning("[BOSS] Failed to clear session: %s", e)

        BossCLI._cumulative_tokens = 0
        BossCLI._session_needs_create = True

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
            except Exception as e:
                results.append(f"[{tool_name} error]: {e}")
                self.last_tool_errors.append(f"{tool_name}: {e}")

        cleaned = re.sub(pattern, '', response, flags=re.DOTALL).strip()
        if results:
            cleaned += "\n\n---\nTool Results:\n" + "\n".join(results)

        return cleaned

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
        }

    @classmethod
    def get_session_stats(cls) -> dict:
        """Get BOSS session statistics."""
        return {
            "session_id": BOSS_SESSION_UUID[:12],
            "cumulative_tokens": cls._cumulative_tokens,
            "threshold": SESSION_TOKEN_THRESHOLD,
            "headroom": SESSION_TOKEN_THRESHOLD - cls._cumulative_tokens,
        }


class RetryableError(Exception):
    """Error that should trigger retry."""
    pass
