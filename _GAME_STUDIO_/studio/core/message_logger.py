"""
Message Logger: Persists Hub messages for training data and analysis.

Logs conversations to daily JSON files with task context for understanding request patterns.
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from .logging_config import get_logger

logger = get_logger("MessageLogger")

LOGS_DIR = Path(__file__).parent.parent.parent / "data" / "logs"
RETENTION_DAYS = 30


class MessageLogger:
    """Logs Hub messages to daily JSON files with task context."""

    def __init__(self, logs_dir: Path = LOGS_DIR):
        self.logs_dir = logs_dir
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        self._cleanup_old_logs()

    def _get_log_path(self, date: datetime = None) -> Path:
        """Get log file path for a given date."""
        date = date or datetime.now()
        filename = date.strftime("%Y-%m-%d") + ".json"
        return self.logs_dir / filename

    def _load_daily_log(self, date: datetime = None) -> list[dict]:
        """Load existing log entries for a date."""
        path = self._get_log_path(date)
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logger.error("Failed to load %s: %s", path, e)
                return []
        return []

    def _save_daily_log(self, entries: list[dict], date: datetime = None):
        """Save log entries for a date."""
        path = self._get_log_path(date)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(entries, f, indent=2, ensure_ascii=False)
        except IOError as e:
            logger.error("Failed to save %s: %s", path, e)

    def log_message(
        self,
        speaker: str,
        message: str,
        task_id: Optional[str] = None,
        task_description: Optional[str] = None,
    ):
        """
        Log a message to today's log file.

        Args:
            speaker: Who sent the message (user, BOSS, Code, etc.)
            message: The message content
            task_id: Optional task ID if message is task-related
            task_description: Optional task description for context
        """
        now = datetime.now()

        entry = {
            "timestamp": now.isoformat(),
            "speaker": speaker,
            "message": message,
        }

        # Add task context if available
        if task_id or task_description:
            entry["task_context"] = {}
            if task_id:
                entry["task_context"]["task_id"] = task_id
            if task_description:
                entry["task_context"]["description"] = task_description

        # Append to today's log
        entries = self._load_daily_log(now)
        entries.append(entry)
        self._save_daily_log(entries, now)

    def _cleanup_old_logs(self):
        """Remove logs older than RETENTION_DAYS."""
        cutoff = datetime.now() - timedelta(days=RETENTION_DAYS)
        removed = 0

        try:
            for log_file in self.logs_dir.glob("*.json"):
                try:
                    # Parse date from filename (YYYY-MM-DD.json)
                    date_str = log_file.stem
                    file_date = datetime.strptime(date_str, "%Y-%m-%d")

                    if file_date < cutoff:
                        log_file.unlink()
                        removed += 1
                except (ValueError, OSError):
                    # Skip files that don't match the date pattern
                    pass
        except Exception as e:
            logger.error("Cleanup error: %s", e)

        if removed > 0:
            logger.info("Cleaned up %d old log files", removed)

    def get_logs_for_date(self, date: datetime) -> list[dict]:
        """Get all log entries for a specific date."""
        return self._load_daily_log(date)

    def get_recent_logs(self, days: int = 7) -> dict[str, list[dict]]:
        """Get logs for the last N days, keyed by date string."""
        result = {}
        now = datetime.now()

        for i in range(days):
            date = now - timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            logs = self._load_daily_log(date)
            if logs:
                result[date_str] = logs

        return result

    def get_conversation_stats(self, days: int = 7) -> dict:
        """Get statistics about recent conversations."""
        stats = {
            "total_messages": 0,
            "messages_by_speaker": {},
            "messages_with_task_context": 0,
            "tasks_referenced": set(),
        }

        recent = self.get_recent_logs(days)

        for date_str, entries in recent.items():
            for entry in entries:
                stats["total_messages"] += 1

                speaker = entry.get("speaker", "unknown")
                stats["messages_by_speaker"][speaker] = (
                    stats["messages_by_speaker"].get(speaker, 0) + 1
                )

                if "task_context" in entry:
                    stats["messages_with_task_context"] += 1
                    task_id = entry["task_context"].get("task_id")
                    if task_id:
                        stats["tasks_referenced"].add(task_id)

        # Convert set to list for JSON serialization
        stats["tasks_referenced"] = list(stats["tasks_referenced"])

        return stats


# Global logger instance
message_logger = MessageLogger()
