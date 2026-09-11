"""
Claude CLI backend - Fresh context each call.

Memory is managed server-side (hub, memory tiers, task_manager).
No --resume, no session file loading - each call gets full context:
  role.md + memory_tier1 + hub_recent + trigger

Prompt caching still works (Anthropic caches first N tokens for 5 min).
Session files are created by Claude CLI but never resumed.
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


class PersistentClaudeCLI(Backend):
    """Claude CLI backend with deterministic session IDs (no resume)."""

    def __init__(self, model: str = "claude", agent_name: str = None):
        super().__init__()
        self.model = model
        self.agent_name = agent_name or "default"
        self.cwd = Path(__file__).parent.parent.parent
        self._session_uuid = get_session_uuid(self.agent_name)
        self._reset_metrics()
        logger.info("[%s] Session %s (fresh each call)", self.agent_name, self._session_uuid[:8])

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
        self._streaming_input_tokens = 0
        self._streaming_output_tokens = 0

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

    def chat(
        self,
        messages: list[dict],
        system_prompt: str = "",
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send message to Claude CLI - fresh context each call."""
        self._reset_token_tracking()
        self._reset_metrics()

        # Always send full context (we manage memory server-side, no --resume)
        prompt = self._build_full_prompt(messages, system_prompt)
        logger.info("[%s] Call (%d chars)", self.agent_name, len(prompt))

        # Run CLI
        try:
            response = self._run_cli(prompt)

            # Execute tool tags if present
            if tool_handlers and "<tool>" in response:
                response = self._execute_tool_tags(response, tool_handlers)

            return response

        except Exception as e:
            self.last_is_error = True
            self.last_error_message = str(e)
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

        raise last_error

    def _run_subprocess(self, temp_path: str, prompt: str) -> str:
        """Run single Claude CLI subprocess."""
        if os.name == 'nt':
            claude_cmd = os.path.join(os.environ.get('APPDATA', ''), 'npm', 'claude.cmd')
            shell = True
        else:
            claude_cmd = "claude"
            shell = False

        cmd = [claude_cmd, "-p", "-", "--output-format", "stream-json", "--verbose"]

        # Fresh session each call - no --resume (we manage memory server-side)
        # Session ID kept for organization but never resumed
        cmd.extend(["--session-id", self._session_uuid])

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
        # Configurable via self.max_turns, defaults based on role
        if hasattr(self, 'max_turns') and self.max_turns:
            max_turns = self.max_turns
        else:
            max_turns = 5 if self.agent_name == "BOSS" else 30
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

    def _collect_output(self, process: subprocess.Popen, prompt: str) -> str:
        """Collect and parse stream-json output."""
        text_content = []
        result_data = None
        last_output_time = time.time()

        stdout_lines = []
        stderr_lines = []

        # Reader threads
        def read_stdout():
            nonlocal last_output_time
            for line in process.stdout:
                last_output_time = time.time()
                stdout_lines.append(line.strip())

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
            if "rate limit" in error.lower() or "overloaded" in error.lower():
                raise RetryableError(f"Rate limited: {error[:100]}")
            raise RuntimeError(f"CLI error (code {process.returncode}): {error[:200]}")

        # Parse events
        for line in stdout_lines:
            if not line:
                continue
            try:
                event = json.loads(line)
                self._process_event(event, text_content)
                if event.get("type") == "result":
                    result_data = event
            except json.JSONDecodeError:
                pass

        # Extract result
        return self._extract_result(result_data, text_content, prompt)

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
                text_content.append(delta.get("text", ""))

        elif event_type == "content_block_start":
            if event.get("content_block", {}).get("type") == "tool_use":
                self._tool_use_count += 1

        elif event_type == "system" and event.get("subtype") == "api_retry":
            self.last_retries += 1

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
        if not self._is_initialized():
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


class RetryableError(Exception):
    """Error that should trigger retry."""
    pass


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
