"""
Vanilla CLI Backend - Stateless, no session, no tools.

Pure input → output processing:
- No session persistence (--no-session-persistence)
- No MCP tools
- Used by: Compression, Text, Image, Audio, Video agents
- Processes input and vanishes
"""

import subprocess
import json
import os
import time
import threading
from pathlib import Path

from .base import Backend, INITIAL_DELAY, BACKOFF_MULTIPLIER, MAX_RETRIES
from studio.core.logging_config import get_logger

logger = get_logger("VanillaCLI")

STALE_TIMEOUT_SECONDS = 600  # 10 minutes (shorter for stateless)
DEFAULT_MAX_TURNS = 5  # Vanilla agents shouldn't need many turns


class VanillaCLI(Backend):
    """
    Stateless CLI backend for vanilla agents.

    - No session persistence
    - No MCP tools
    - Pure input → output
    """

    def __init__(self, model: str = "sonnet", agent_name: str = "Vanilla"):
        super().__init__()
        self.model = model
        self.agent_name = agent_name
        self.cwd = Path(__file__).parent.parent.parent
        self._reset_metrics()
        logger.info("[%s] Vanilla CLI initialized (stateless)", agent_name)

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

    def chat(
        self,
        messages: list[dict],
        system_prompt: str = "",
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send message to stateless CLI (no session)."""
        self._reset_token_tracking()
        self._reset_metrics()

        prompt = self._build_prompt(messages, system_prompt)

        logger.info("[%s] Vanilla START | prompt=%.1fKB",
                    self.agent_name, len(prompt) / 1024)

        try:
            return self._run_cli(prompt)
        except Exception as e:
            self.last_is_error = True
            self.last_error_message = str(e)
            logger.error("[%s] Error: %s", self.agent_name, e)
            return f"Error: {type(e).__name__}: {e}"

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
        """Run stateless Claude CLI."""
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
        return "No response from Vanilla CLI"

    def _run_subprocess(self, temp_path: str, prompt: str) -> str:
        """Run single stateless CLI subprocess."""
        if os.name == 'nt':
            claude_cmd = os.path.join(os.environ.get('APPDATA', ''), 'npm', 'claude.cmd')
            shell = True
        else:
            claude_cmd = "claude"
            shell = False

        cmd = [claude_cmd, "-p", "-", "--output-format", "stream-json", "--verbose"]

        # STATELESS: no session persistence
        cmd.append("--no-session-persistence")

        # NO MCP, NO tools - pure input/output
        cmd.append("--dangerously-skip-permissions")

        # Model and turns
        if self.model and self.model != "claude":
            cmd.extend(["--model", self.model])

        max_turns = getattr(self, 'max_turns', None) or DEFAULT_MAX_TURNS
        cmd.extend(["--max-turns", str(max_turns)])

        logger.debug("[%s] CMD flags: %s", self.agent_name,
                    " ".join(f for f in cmd if f.startswith('--')))

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
            raise RuntimeError(f"CLI exited early: {stderr[:200]}")

        return self._collect_output(process, prompt)

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

    def _truncate_for_terminal(self, text: str) -> str:
        """Truncate completion blocks for terminal - keep COMPLETED line, skip Summary/Friction."""
        if "COMPLETED:" not in text:
            return text

        lines = text.split('\n')
        result = []
        skip_rest = False

        for line in lines:
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
                self._log_step("processing", in_tok, out_tok)
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
                # Don't broadcast deltas - full text comes via "assistant" event

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

            logger.info("[%s] Vanilla END | turns=%d | in=%dK out=%dK | $%.4f",
                        self.agent_name,
                        self.last_num_turns,
                        self.last_input_tokens // 1000,
                        self.last_output_tokens // 1000,
                        self.last_cost_usd)

        if text_content:
            return "\n\n".join(text_content)

        if result_data:
            return result_data.get("result", "No response")

        return "No response from Vanilla CLI"

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
            "num_tool_uses": 0,  # Vanilla has no tools
        }


class RetryableError(Exception):
    """Error that should trigger retry."""
    pass
