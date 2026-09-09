"""
Message Hub: Shared communication channel for all agents.

Includes session summarization for context compression - older messages
get summarized to reduce token usage while preserving key decisions.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional
from queue import Queue

from .message_logger import message_logger
from .memory import memory_manager
from .history import history_manager
from .projects import project_manager
from .paths import get_base_path
from .tasks import task_manager


# T330: Default paths (used when no project is active)
# Actual paths are resolved dynamically via _get_messages_file() and _get_session_memory_file()
DEFAULT_MESSAGES_FILE = Path(__file__).parent.parent.parent / "data" / "messages.json"
DEFAULT_SESSION_MEMORY_FILE = Path(__file__).parent.parent.parent / "data" / "session_memory.md"
MAX_MESSAGES = 50  # Rolling buffer size per T159 spec
# Messages older than this threshold get summarized
SUMMARIZE_THRESHOLD = 20  # Keep last 20 raw, summarize older
# Trigger Context agent summarization at this threshold
SUMMARIZE_TRIGGER = 50


@dataclass
class Message:
    sender: str  # "user", "BOSS", "Designer", etc.
    content: str
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        return {
            "sender": self.sender,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Message":
        return cls(
            sender=data["sender"],
            content=data["content"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
        )


class Hub:
    """Central message hub - all agents read/write here."""

    def __init__(self):
        self.messages: list[Message] = []
        # Queue for new messages to broadcast
        self.outbox: Queue = Queue()
        # Track message count since last summarization
        self._messages_since_summary: int = 0
        # Callback for triggering summarization (set by Studio)
        self._summarize_callback = None
        # Flag to prevent re-triggering summarization while in progress
        self._summarization_in_progress: bool = False
        # Sync managers with persisted active project (T3xx: startup initialization)
        self._sync_with_active_project()
        # Load saved history
        self._load_history()

    def _sync_with_active_project(self):
        """Sync memory/history/task managers with persisted active project on startup.

        T3xx: When server restarts, project_manager loads active_project_id from disk,
        but memory/history/task managers start at default paths. This method syncs them.
        """
        if project_manager.active_project_id:
            project = project_manager.get(project_manager.active_project_id)
            if project:
                project_folder = project_manager.active_project_id
                memory_manager.set_project(project_folder)
                history_manager.set_project(project_folder)
                task_manager.set_project(project_folder)
                print(f"[Hub] Synced managers with persisted project: {project.name} ({project_folder})")

    def _get_messages_file(self) -> Path:
        """Get messages.json path for current project context.

        T330: Routes to projects/<project_id>/data/messages.json when project is active,
        otherwise uses data/messages.json.
        """
        project_id = project_manager.active_project_id
        base = get_base_path(project_id)
        # For projects, data lives in projects/<id>/data/
        if project_id and project_id != "default":
            return base / "data" / "messages.json"
        return base / "messages.json"

    def _get_session_memory_file(self) -> Path:
        """Get session_memory.md path for current project context.

        T330: Routes to projects/<project_id>/data/session_memory.md when project is active,
        otherwise uses data/session_memory.md.
        """
        project_id = project_manager.active_project_id
        base = get_base_path(project_id)
        if project_id and project_id != "default":
            return base / "data" / "session_memory.md"
        return base / "session_memory.md"

    def set_summarize_callback(self, callback):
        """Set callback for Context agent summarization.

        callback(messages: list[dict], current_summary: str) -> str (new summary)
        """
        self._summarize_callback = callback

    def set_active_project(self, project_id: str) -> bool:
        """Set the active project and switch memory/history/messages/tasks paths.

        T321: When user selects a project in Hub dropdown, this method:
        1. Updates project_manager.active_project_id
        2. Switches memory_manager to project-specific paths
        3. Switches history_manager to project-specific paths
        T330: Also reloads messages from project-specific messages.json
        T332: Also switches task_manager to project-specific tasks.json

        Args:
            project_id: Project ID (e.g., "P001") or None for default.

        Returns:
            True if project was switched successfully.
        """
        if not project_id:
            # Switch to default/no project
            memory_manager.set_project(None)
            history_manager.set_project(None)
            task_manager.set_project(None)  # T332
            project_manager.active_project_id = None
            project_manager._save()
            # T330: Reload messages from default path
            self._load_history()
            print("[Hub] Switched to default project (no project)")
            return True

        # Get project to extract folder name
        project = project_manager.get(project_id)
        if not project:
            print(f"[Hub] Project not found: {project_id}")
            return False

        # Use project ID as folder name within projects/
        project_folder = project_id

        # Update project manager
        if not project_manager.set_active(project_id):
            return False

        # Switch memory, history, and tasks managers (T332)
        memory_manager.set_project(project_folder)
        history_manager.set_project(project_folder)
        task_manager.set_project(project_folder)

        # T330: Reload messages from project-specific path
        self._load_history()

        print(f"[Hub] Switched to project: {project.name} ({project_id})")
        return True

    def get_active_project(self) -> Optional[dict]:
        """Get the currently active project info.

        Returns:
            Project dict or None if no project is active.
        """
        project = project_manager.get_active()
        return project.to_dict() if project else None

    def _load_history(self):
        """Load message history from messages.json.

        T330: Uses project-aware path via _get_messages_file().
        """
        messages_file = self._get_messages_file()
        if messages_file.exists():
            try:
                with open(messages_file) as f:
                    data = json.load(f)
                self.messages = [Message.from_dict(m) for m in data.get("messages", [])]
                print(f"[Hub] Loaded {len(self.messages)} messages from {messages_file}")
            except Exception as e:
                print(f"[Hub] Failed to load {messages_file}: {e}")
                self.messages = []
        else:
            # T330: Clear messages when switching to project with no history
            self.messages = []
            print(f"[Hub] No messages found at {messages_file}")

    def _save_history(self):
        """Save message history to messages.json (rolling 50-message buffer).

        T330: Uses project-aware path via _get_messages_file().
        """
        messages_file = self._get_messages_file()
        try:
            messages_file.parent.mkdir(parents=True, exist_ok=True)
            messages_to_save = self.messages[-MAX_MESSAGES:]
            messages_data = {
                "messages": [m.to_dict() for m in messages_to_save],
                "count": len(messages_to_save),
            }
            with open(messages_file, "w") as f:
                json.dump(messages_data, f, indent=2)
        except Exception as e:
            print(f"[Hub] Failed to save history to {messages_file}: {e}")

    def post(
        self,
        sender: str,
        content: str,
        task_id: Optional[str] = None,
        task_description: Optional[str] = None,
    ) -> Message:
        """Post a message to the hub."""
        msg = Message(sender=sender, content=content)
        self.messages.append(msg)
        self._messages_since_summary += 1

        # Feed raw messages to BOTH compression systems (parallel, independent):
        # 1. AC-Memory: bullet points for agent recall (Context agent)
        # 2. History: narrative prose for human reading (Writer agent)
        self._accumulate_to_tier0(msg, task_id)      # AC-Memory
        self._accumulate_to_history(msg, task_id)    # History

        # Trigger Context agent summarization at threshold (T164)
        # Guard against infinite loop: don't re-trigger while summarization is in progress (T197)
        if (self._messages_since_summary >= SUMMARIZE_TRIGGER
            and self._summarize_callback
            and not self._summarization_in_progress):
            self._trigger_summarization()

        # Trim to max buffer size
        if len(self.messages) > MAX_MESSAGES:
            self.messages = self.messages[-MAX_MESSAGES:]
        # Save to file
        self._save_history()
        # Log to daily file for training data
        message_logger.log_message(
            speaker=sender,
            message=content,
            task_id=task_id,
            task_description=task_description,
        )
        # Add to outbox for broadcast
        self.outbox.put(msg)
        return msg

    def _accumulate_to_tier0(self, msg: Message, task_id: Optional[str] = None):
        """Append message summary to AC-Memory Tier 0.

        AC-Memory: Bullet points for agent recall (Context agent compresses).
        Format: minimal - timestamp + sender + key content (first 200 chars).
        """
        try:
            # Extract key content - first meaningful line, max 200 chars
            content_lines = msg.content.strip().split('\n')
            key_content = content_lines[0][:200] if content_lines else ""

            # Minimal format: [timestamp] sender: key_content
            timestamp = msg.timestamp.strftime("%H:%M")
            entry = f"[{timestamp}] {msg.sender}"
            if task_id:
                entry += f" ({task_id})"
            entry += f": {key_content}"

            # Append to AC-Memory tier 0
            memory_manager.append(0, entry)
        except Exception as e:
            # Non-fatal - don't break message posting if memory fails
            print(f"[Hub] AC-Memory accumulation error (non-fatal): {e}")

    def _accumulate_to_history(self, msg: Message, task_id: Optional[str] = None):
        """Append message to History Draft tier.

        History: Narrative prose for human reading (Writer agent compresses).
        Format: fuller context for narrative generation.
        """
        try:
            # Fuller format for narrative - include more content
            timestamp = msg.timestamp.strftime("%H:%M")
            content_preview = msg.content[:500] if len(msg.content) > 500 else msg.content

            entry = f"[{timestamp}] {msg.sender}"
            if task_id:
                entry += f" (task {task_id})"
            entry += f":\n{content_preview}"

            # Append to History draft tier
            history_manager.accumulate_raw(entry)
        except Exception as e:
            # Non-fatal - don't break message posting if history fails
            print(f"[Hub] History accumulation error (non-fatal): {e}")

    def _trigger_summarization(self):
        """Trigger Context agent to update session_memory.md (T164).

        Called when message count hits SUMMARIZE_TRIGGER (50).
        Passes current messages + existing summary to Context agent.

        T197 fix: Uses _summarization_in_progress flag to prevent infinite loop
        where Context agent responses trigger more summarizations.
        """
        if not self._summarize_callback:
            return

        # Prevent re-entry (T197)
        if self._summarization_in_progress:
            return

        try:
            self._summarization_in_progress = True

            # Prepare context for summarization
            messages_data = [m.to_dict() for m in self.messages[-SUMMARIZE_TRIGGER:]]
            current_summary = self._load_session_memory()

            print(f"[Hub] Triggering session memory update ({len(messages_data)} messages)")

            # Call Context agent (blocking call)
            new_summary = self._summarize_callback(messages_data, current_summary)

            if new_summary:
                self._save_session_memory(new_summary)
                self._messages_since_summary = 0
                print(f"[Hub] Session memory updated ({len(new_summary)} chars)")

        except Exception as e:
            print(f"[Hub] Summarization failed: {e}")
        finally:
            self._summarization_in_progress = False

    def _load_session_memory(self) -> str:
        """Load current session_memory.md content.

        T330: Uses project-aware path via _get_session_memory_file().
        """
        session_file = self._get_session_memory_file()
        if session_file.exists():
            return session_file.read_text(encoding="utf-8")
        return ""

    def _save_session_memory(self, content: str):
        """Save updated session_memory.md.

        T330: Uses project-aware path via _get_session_memory_file().
        """
        session_file = self._get_session_memory_file()
        session_file.parent.mkdir(parents=True, exist_ok=True)
        session_file.write_text(content, encoding="utf-8")

    def get_pending(self) -> list[Message]:
        """Get all pending messages from outbox."""
        pending = []
        while not self.outbox.empty():
            pending.append(self.outbox.get_nowait())
        return pending

    def get_history(self, limit: int = 50) -> list[Message]:
        """Get recent message history."""
        return self.messages[-limit:]

    def get_context_for_agent(self, agent_name: str, limit: int = 20) -> str:
        """Format recent messages as context for an agent (T165).

        Injects session_memory.md + last 20 messages for full context.
        Session memory provides cumulative summary of older exchanges.

        For BOSS:
        - Injects studio purpose statement for strategic context
        - Agent messages are truncated to first line (100 chars max)
        - Uses reduced message limit (15) to save tokens
        """
        lines = []

        # BOSS gets studio purpose block for strategic context
        if agent_name == "BOSS":
            lines.append(self._get_boss_purpose_block())
            limit = 15  # Reduced from 20 - BOSS needs overview, not details

        # Inject session_memory.md content (T165: cumulative summary)
        # Primary source: session_memory.md (Context agent maintains this)
        # Fallback: AC-Memory tier 0 recent content (T272: unified context model)
        session_memory = self._load_session_memory()
        if session_memory:
            lines.append(f"SESSION MEMORY:\n{session_memory}\n---\n")
        else:
            # Fallback to AC-Memory tier 0 recent content
            tier0_recent = memory_manager.get_recent(tier_index=0, max_chars=1500)
            if tier0_recent:
                lines.append(f"SESSION CONTEXT (from memory tier 0):\n{tier0_recent}\n---\n")

        # Add recent messages (last 20 per T165 spec)
        recent = self.messages[-limit:]
        lines.append("RECENT MESSAGES:")
        for msg in recent:
            prefix = "YOU" if msg.sender == agent_name else msg.sender
            content = msg.content

            # BOSS gets truncated agent messages (not user, not own messages)
            if agent_name == "BOSS" and msg.sender not in ("user", "BOSS"):
                content = self._truncate_for_boss(content)

            lines.append(f"[{prefix}]: {content}")
        return "\n".join(lines)

    def _truncate_for_boss(self, content: str) -> str:
        """Truncate agent output to first line, max 100 chars.

        Preserves just enough to confirm task completion without details.
        """
        first_line = content.split("\n")[0].strip()
        if len(first_line) > 100:
            return first_line[:97] + "..."
        elif len(first_line) < len(content):
            return first_line + "  (truncated)"
        return first_line

    def _get_boss_purpose_block(self) -> str:
        """Return studio purpose statement for BOSS context.

        Gives BOSS strategic context about what the studio is optimizing for.
        """
        return """# THE STUDIO
An abstract self-improving agent fleet that delegates tasks, accumulates data, and refines its skill library to ship fully working complex projects. Optimizes AI output quality per token through dynamic context injection.
"""

    def summarize_old_messages(self) -> bool:
        """
        DEPRECATED: Use AC-Memory compression via memory_manager instead.

        T272: This method now only trims in-memory messages.
        Context compression is handled by AC-Memory in memory.py.
        """
        if len(self.messages) <= SUMMARIZE_THRESHOLD:
            return False  # Not enough to trim

        # Just trim old messages from in-memory list
        # AC-Memory handles actual compression via _accumulate_to_tier0()
        old_count = len(self.messages) - SUMMARIZE_THRESHOLD
        self.messages = self.messages[-SUMMARIZE_THRESHOLD:]
        self._save_history()

        print(f"[Hub] Trimmed {old_count} old messages, kept {len(self.messages)} recent (AC-Memory handles compression)")
        return True


# Global hub instance
hub = Hub()
