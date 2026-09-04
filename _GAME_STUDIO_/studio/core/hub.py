"""
Message Hub: Shared communication channel for all agents.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional
from queue import Queue

from .message_logger import message_logger


HISTORY_FILE = Path(__file__).parent.parent.parent / "data" / "hub_history.json"
MAX_MESSAGES = 200


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
        # Load saved history
        self._load_history()

    def _load_history(self):
        """Load message history from file."""
        if HISTORY_FILE.exists():
            try:
                with open(HISTORY_FILE) as f:
                    data = json.load(f)
                self.messages = [Message.from_dict(m) for m in data]
                print(f"[Hub] Loaded {len(self.messages)} messages from history")
            except Exception as e:
                print(f"[Hub] Failed to load history: {e}")

    def _save_history(self):
        """Save message history to file."""
        try:
            HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
            # Keep only last MAX_MESSAGES
            to_save = self.messages[-MAX_MESSAGES:]
            with open(HISTORY_FILE, "w") as f:
                json.dump([m.to_dict() for m in to_save], f, indent=2)
        except Exception as e:
            print(f"[Hub] Failed to save history: {e}")

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
        # Trim to max
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
        """Format recent messages as context for an agent."""
        recent = self.messages[-limit:]
        lines = []
        for msg in recent:
            prefix = "YOU" if msg.sender == agent_name else msg.sender
            lines.append(f"[{prefix}]: {msg.content}")
        return "\n".join(lines)


# Global hub instance
hub = Hub()
