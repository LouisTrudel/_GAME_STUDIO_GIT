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

from .logging_config import get_logger
from .message_logger import message_logger
from .memory import memory_manager
from .history import history_manager
from .projects import project_manager
from .paths import get_base_path, atomic_json_write
from .tasks import task_manager

logger = get_logger("Hub")


# T330: Default paths (used when no project is active)
DEFAULT_MESSAGES_FILE = Path(__file__).parent.parent.parent / "data" / "messages.json"
MAX_MESSAGES = 50  # Rolling buffer size per T159 spec


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
                logger.info("Synced managers with persisted project: %s (%s)", project.name, project_folder)

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
            logger.info("Switched to default project (no project)")
            return True

        # Get project to extract folder name
        project = project_manager.get(project_id)
        if not project:
            logger.warning("Project not found: %s", project_id)
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

        logger.info("Switched to project: %s (%s)", project.name, project_id)
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
                logger.info("Loaded %d messages from %s", len(self.messages), messages_file)
            except Exception as e:
                logger.error("Failed to load %s: %s", messages_file, e)
                self.messages = []
        else:
            # T330: Clear messages when switching to project with no history
            self.messages = []
            logger.debug("No messages found at %s", messages_file)

    def _save_history(self):
        """Save message history to messages.json (rolling 50-message buffer).

        T330: Uses project-aware path via _get_messages_file().
        """
        messages_file = self._get_messages_file()
        messages_to_save = self.messages[-MAX_MESSAGES:]
        messages_data = {
            "messages": [m.to_dict() for m in messages_to_save],
            "count": len(messages_to_save),
        }
        if not atomic_json_write(messages_file, messages_data):
            logger.error("Failed to save history to %s", messages_file)

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

        # Feed to History compression (Writer agent generates narrative)
        # Note: AC-Memory tier0 = messages.json directly (no separate accumulation)
        self._accumulate_to_history(msg, task_id)

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

    def _accumulate_to_history(self, msg: Message, task_id: Optional[str] = None):
        """Append message to History Draft tier.

        History: Narrative prose for human reading (Writer agent compresses).
        Format: fuller context for narrative generation.
        """
        # Skip Text/Prompt messages - they ARE the compression output, not input
        # This prevents infinite loops where Text output triggers more compression
        if msg.sender in ("Text", "Prompt"):
            return

        try:
            # Fuller format for narrative - include more content
            timestamp = msg.timestamp.strftime("%H:%M")
            content_preview = msg.content[:500] if len(msg.content) > 500 else msg.content

            entry = f"[{timestamp}] {msg.sender}"
            if task_id:
                entry += f" (task {task_id})"
            entry += f":\n{content_preview}"

            # Append to History draft tier
            history_manager.accumulate(entry)
        except Exception as e:
            # Non-fatal - don't break message posting if history fails
            logger.error("History accumulation error (non-fatal): %s", e)

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

        Injects AC-Memory tiers + last N messages for full context.

        For BOSS:
        - Injects studio purpose statement for strategic context
        - Agent messages are truncated to first line (100 chars max)
        - Uses reduced message limit (15) to save tokens
        """
        lines = []

        # BOSS: unified memory tiers (tier0 = messages.json, no duplicate access)
        if agent_name == "BOSS":
            lines.append(self._get_boss_purpose_block())

            # Memory tiers only - tier0 IS the hub chat
            tier0 = memory_manager.get_tier(0)
            tier1 = memory_manager.get_tier(1)
            tier2 = memory_manager.get_tier(2)

            if tier0 or tier1 or tier2:
                lines.append("## MEMORY\n")
                if tier2:
                    lines.append("### Archive\n" + tier2)
                if tier1:
                    lines.append("### Compressed\n" + tier1)
                if tier0:
                    lines.append("### Recent Chat\n" + tier0)

            # Active tasks
            active_tasks = task_manager.to_active_context_string()
            if active_tasks:
                lines.append("\n" + active_tasks)

            return "\n".join(lines)

        # Non-BOSS: recent messages verbatim (no memory injection)
        recent = self.messages[-limit:]
        skip_senders = {"System", "TEST", "test_sender"}
        lines.append("RECENT MESSAGES:")
        for msg in recent:
            if msg.sender in skip_senders:
                continue
            prefix = "YOU" if msg.sender == agent_name else msg.sender
            lines.append(f"[{prefix}]: {msg.content}")
        return "\n".join(lines)

    def _truncate_message(self, content: str, max_chars: int = 100) -> str:
        """Truncate message content smartly.

        - Takes first line if short enough
        - Otherwise truncates to max_chars
        - Adds (truncated) indicator if content was cut
        """
        # Get first line
        first_line = content.split("\n")[0].strip()

        # If first line fits and is the whole message, return as-is
        if len(first_line) <= max_chars and len(first_line) == len(content.strip()):
            return first_line

        # If first line fits but there's more content
        if len(first_line) <= max_chars:
            return first_line + "  ..."

        # First line too long, truncate it
        return first_line[:max_chars - 3] + "..."

    def _get_boss_purpose_block(self) -> str:
        """Return studio purpose statement for BOSS context.

        Gives BOSS strategic context about what the studio is optimizing for.
        """
        return """# THE STUDIO
An abstract self-improving agent fleet that delegates tasks, accumulates data, and refines its skill library to ship fully working complex projects. Optimizes AI output quality per token through dynamic context injection.
"""

    def get_incremental_context_for_boss(self) -> str:
        """Get minimal context for BOSS after initialization (T444).

        Only returns recent messages + active tasks - no memory tiers, no purpose block.
        These static elements are already in the Claude session from initialization.

        Returns:
            Formatted string with last 5 messages + active tasks summary.
        """
        lines = []
        skip_senders = {"System", "TEST", "test_sender"}

        # Last 5 messages only
        recent = self.messages[-5:]
        for msg in recent:
            if msg.sender in skip_senders:
                continue
            prefix = "YOU" if msg.sender == "BOSS" else msg.sender
            # Keep messages short for incremental updates
            content = self._truncate_message(msg.content, max_chars=300)
            lines.append(f"[{prefix}]: {content}")

        # Add active tasks summary
        active_tasks = task_manager.to_active_context_string()
        if active_tasks:
            lines.append("\n" + active_tasks)

        return "\n".join(lines)


# Global hub instance
hub = Hub()
