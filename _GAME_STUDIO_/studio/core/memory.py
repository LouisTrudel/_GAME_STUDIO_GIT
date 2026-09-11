"""
AC-Memory: Accumulated-Compacted Memory Tier System

Simple markdown-based tiered memory with compression.

Structure:
  tier0 = messages.json (hub chat, rolling 50 buffer, no separate file)
  memory/
  ├── tier1.md  ← Recent: injected as "### Recent" (50KB)
  ├── tier2.md  ← Archive: injected as "### Archive" (200KB)
  └── tier3+.md ← Reference only: searchable, NOT injected (500KB+)

Injection (hub.py):
  - tier1 + tier2 → injected into agent prompts
  - tier3+ → exist on disk, queryable via search(), not auto-injected

Flow:
  Hub chat (tier0/messages.json) → threshold → compress →
  PUSH appends to tier1 (messages.json keeps rolling) → tier1 grows → ...
  (cascades up to tier10+ as needed)
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Callable

from .logging_config import get_logger
from .paths import get_memory_dir, get_base_path

logger = get_logger("Memory")

# Compression callback type
# Takes: content, tier_index, prev_tier_context
# Returns: {keep: str, push: str, friction: str}
CompressCallback = Callable[[str, int, str], dict]

# Size thresholds per tier (characters)
# tier0-2: injected into prompts (Recent/Archive)
# tier3+: reference only (searchable, not injected)
TIER_THRESHOLDS = {
    0: 10_000,       # ~10KB  - raw session buffer
    1: 50_000,       # ~50KB  - recent (injected)
    2: 200_000,      # ~200KB - archive (injected)
    # tier3+: reference tiers - larger thresholds, not injected
    3: 500_000,      # ~500KB
    4: 1_000_000,    # ~1MB
    5: 2_000_000,    # ~2MB
}
# Tiers beyond defined use this (grows indefinitely)
DEFAULT_THRESHOLD = 5_000_000  # ~5MB


class MemoryManager:
    """Simple markdown-based tiered memory.

    Each tier is a single .md file. Content accumulates until threshold,
    then compresses: KEEP replaces file, PUSH appends to next tier.
    """

    # Loop prevention constants
    COMPRESSION_COOLDOWN_SECONDS = 60  # Min time between compressions
    MAX_COMPRESSIONS_PER_HOUR = 10     # Hard limit

    def __init__(self, project_name: Optional[str] = None):
        self._project_name = project_name
        self._memory_dir = get_memory_dir(project_name)
        self._ensure_dirs()
        self._compress_callback: Optional[CompressCallback] = None
        # Loop prevention state
        self._is_compressing = False
        self._last_compression_time: Optional[datetime] = None
        self._compression_count_this_hour = 0
        self._hour_start: Optional[datetime] = None
        # Friction buffer to prevent file contention during cascades
        self._friction_buffer: list[str] = []

    def set_project(self, project_name: Optional[str]):
        """Switch to a different project's memory."""
        if project_name == self._project_name:
            return
        self._project_name = project_name
        self._memory_dir = get_memory_dir(project_name)
        self._ensure_dirs()
        logger.info("Switched to project: %s", project_name or 'default')

    def set_compress_callback(self, callback: CompressCallback):
        """Set callback for Context agent compression."""
        self._compress_callback = callback

    def _ensure_dirs(self):
        """Ensure memory directory exists."""
        self._memory_dir.mkdir(parents=True, exist_ok=True)

    def _tier_path(self, index: int) -> Path:
        """Get file path for a tier: tier1.md, tier2.md, etc.

        Note: tier0 has no file - it reads from messages.json.
        """
        if index == 0:
            return None  # tier0 = messages.json, not a separate file
        return self._memory_dir / f"tier{index}.md"

    def _messages_json_path(self) -> Path:
        """Get messages.json path for current project (tier0 source)."""
        base = get_base_path(self._project_name)
        if self._project_name and self._project_name != "default":
            return base / "data" / "messages.json"
        return base / "messages.json"

    def _read_messages_json(self) -> str:
        """Read messages.json and format as tier0 content."""
        path = self._messages_json_path()
        if not path.exists():
            return ""
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            messages = data.get("messages", [])
            # Format as tier0: [HH:MM] sender: content
            lines = []
            for msg in messages:
                ts = msg.get("timestamp", "")[:16].split("T")[-1][:5]  # HH:MM
                sender = msg.get("sender", "?")
                content = msg.get("content", "")
                lines.append(f"[{ts}] {sender}: {content}")
            return "\n".join(lines)
        except Exception as e:
            logger.error("Failed to read messages.json: %s", e)
            return ""

    # ============ READ/WRITE ============

    def get_tier(self, index: int) -> str:
        """Get content of a tier. Returns empty string if not exists.

        tier0 = messages.json (hub chat)
        tier1+ = tierN.md files
        """
        if index == 0:
            return self._read_messages_json()
        filepath = self._tier_path(index)
        if filepath and filepath.exists():
            return filepath.read_text(encoding="utf-8")
        return ""

    def _write_tier(self, index: int, content: str):
        """Write content to a tier file.

        tier0 = messages.json (managed by hub, not written here)
        """
        if index == 0:
            return  # tier0 is messages.json, managed by hub.py
        filepath = self._tier_path(index)
        filepath.write_text(content, encoding="utf-8")

    def _append_tier(self, index: int, content: str):
        """Append content to a tier file.

        tier0 = messages.json (managed by hub, not appended here)
        """
        if index == 0:
            return  # tier0 is messages.json, managed by hub.py
        filepath = self._tier_path(index)
        existing = self.get_tier(index)

        if existing:
            new_content = existing + "\n\n---\n\n" + content
        else:
            new_content = content

        self._write_tier(index, new_content)

    def tier_size(self, index: int) -> int:
        """Get size of a tier in characters."""
        return len(self.get_tier(index))

    def tier_threshold(self, index: int) -> int:
        """Get threshold for a tier."""
        return TIER_THRESHOLDS.get(index, DEFAULT_THRESHOLD)

    def tier_needs_compression(self, index: int) -> bool:
        """Check if tier exceeds threshold."""
        return self.tier_size(index) > self.tier_threshold(index)

    # ============ APPEND (main entry point) ============

    def add_hot(self, content: str, source: str = "", tags: list = None,
                task_ids: list = None, agent: str = None, outcome: str = None):
        """Add task completion log to tier1.

        tier0 = messages.json (hub chat), so task logs go to tier1 directly.
        Used by tasks.py to log completed/failed tasks.
        """
        # Format entry with metadata
        parts = [content]
        if outcome:
            parts.insert(0, f"[{outcome.upper()}]")
        if agent:
            parts.append(f"(agent: {agent})")
        if tags:
            parts.append(f"tags: {', '.join(tags)}")

        entry = " ".join(parts)
        self.append(1, entry)  # tier1, not tier0

    def append(self, index: int, content: str):
        """Append content to a tier. Auto-compresses if threshold exceeded.

        tier0 = messages.json (managed by hub.py, not here)
        """
        if index == 0:
            return  # tier0 is messages.json, managed by hub.py
        self._append_tier(index, content)
        size = self.tier_size(index)
        logger.info("Appended to tier%d, size: %d", index, size)

        # Auto-compress if needed
        if self.tier_needs_compression(index):
            threshold = self.tier_threshold(index)
            logger.info("Tier%d exceeded threshold (%d/%d), compressing...", index, size, threshold)
            self.compress_tier(index)

    # ============ COMPRESSION ============

    def _can_compress(self) -> tuple[bool, str]:
        """Check if compression is allowed (loop prevention)."""
        now = datetime.now()

        # Already compressing
        if self._is_compressing:
            return False, "compression already in progress"

        # Cooldown check
        if self._last_compression_time:
            elapsed = (now - self._last_compression_time).total_seconds()
            if elapsed < self.COMPRESSION_COOLDOWN_SECONDS:
                return False, f"cooldown ({int(self.COMPRESSION_COOLDOWN_SECONDS - elapsed)}s remaining)"

        # Hourly limit check
        if self._hour_start and (now - self._hour_start).total_seconds() < 3600:
            if self._compression_count_this_hour >= self.MAX_COMPRESSIONS_PER_HOUR:
                return False, f"hourly limit reached ({self.MAX_COMPRESSIONS_PER_HOUR}/hour)"
        else:
            # Reset hourly counter
            self._hour_start = now
            self._compression_count_this_hour = 0

        return True, "ok"

    def compress_tier(self, index: int) -> bool:
        """Compress a tier: KEEP stays, PUSH goes to next tier."""
        # Loop prevention
        can_compress, reason = self._can_compress()
        if not can_compress:
            logger.debug("Skipping compression: %s", reason)
            return False

        content = self.get_tier(index)
        if not content:
            self._is_compressing = False
            self._flush_friction()  # Flush any buffered friction
            return False

        # Set compression lock
        self._is_compressing = True
        self._last_compression_time = datetime.now()
        self._compression_count_this_hour += 1
        logger.info("Starting compression #%d this hour", self._compression_count_this_hour)

        # Get previous tier context for relevance
        prev_context = ""
        if index > 0:
            prev_content = self.get_tier(index - 1)
            prev_context = prev_content[:2000] if prev_content else ""

        # Compress via callback or fallback
        if self._compress_callback:
            try:
                result = self._compress_callback(content, index, prev_context)
            except Exception as e:
                logger.error("Compression callback failed: %s", e)
                result = self._fallback_compress(content)
        else:
            result = self._fallback_compress(content)

        keep = result.get("keep", "")
        push = result.get("push", "")
        friction = result.get("friction", "")

        # Replace current tier with KEEP (tier0 is messages.json, keeps rolling)
        if index == 0:
            logger.info("Tier0 (messages.json) compressed: discarded KEEP, pushing %d chars to tier1", len(push))
        else:
            self._write_tier(index, keep)
            logger.info("Tier%d compressed: kept %d chars", index, len(keep))

        # Append PUSH to next tier (may trigger cascade)
        if push:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            push_entry = f"[{timestamp}] From tier{index}:\n{push}"
            self.append(index + 1, push_entry)  # Recursive, may trigger cascade

        # Log friction if any
        if friction:
            self._log_friction(friction)

        # Release compression lock and flush buffered friction
        self._is_compressing = False
        self._flush_friction()
        return True

    def _fallback_compress(self, content: str) -> dict:
        """Simple 50/50 split when no callback available."""
        lines = content.strip().split('\n')
        mid = len(lines) // 2

        return {
            "keep": '\n'.join(lines[:mid]) if mid > 0 else content,
            "push": '\n'.join(lines[mid:]) if mid > 0 else ""
        }

    def _log_friction(self, friction: str):
        """Buffer friction event (flushed after cascade completes)."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        entry = f"\n## [{timestamp}]\n{friction}\n"
        self._friction_buffer.append(entry)

    def _flush_friction(self):
        """Write all buffered friction events to friction.md in one operation."""
        if not self._friction_buffer:
            return
        friction_file = self._memory_dir / "friction.md"
        try:
            with open(friction_file, "a", encoding="utf-8") as f:
                f.write("".join(self._friction_buffer))
            self._friction_buffer.clear()
        except IOError as e:
            logger.warning("Failed to write friction log: %s", e)

    # ============ QUERIES ============

    def get_recent(self, index: int = 0, max_chars: int = 2000) -> str:
        """Get last N chars from a tier."""
        content = self.get_tier(index)
        return content[-max_chars:] if content else ""

    def search(self, query: str, max_tiers: int = 10) -> list[dict]:
        """Search across tiers."""
        results = []
        query_lower = query.lower()

        for i in range(max_tiers):
            content = self.get_tier(i)
            if not content:
                break

            if query_lower in content.lower():
                idx = content.lower().find(query_lower)
                start = max(0, idx - 100)
                end = min(len(content), idx + 200)

                results.append({
                    "tier": i,
                    "snippet": f"...{content[start:end]}...",
                    "size": len(content),
                })

        return results

    def check_and_compress_all(self) -> int:
        """Check all tiers and compress any that exceed thresholds.

        Returns number of tiers compressed.
        Uses existing rate limiting from _can_compress().
        """
        compressed_count = 0

        for i in range(20):  # Check up to 20 tiers
            filepath = self._tier_path(i)
            # tier0 has no file (reads from messages.json)
            if filepath is None:
                continue
            if not filepath.exists():
                if i > 0:
                    break
                continue

            if self.tier_needs_compression(i):
                if self.compress_tier(i):
                    compressed_count += 1
                else:
                    # Rate limited, stop checking further tiers
                    break

        return compressed_count

    def get_stats(self) -> dict:
        """Get stats for all existing tiers."""
        stats = {}

        for i in range(20):  # Check up to 20 tiers
            filepath = self._tier_path(i)
            # tier0 has no file (reads from messages.json)
            if filepath is None:
                continue
            if not filepath.exists():
                if i > 0:
                    break
                continue

            size = self.tier_size(i)
            threshold = self.tier_threshold(i)

            stats[f"tier{i}"] = {
                "size": size,
                "threshold": threshold,
                "utilization": f"{(size / threshold) * 100:.1f}%" if threshold else "N/A",
                "needs_compression": self.tier_needs_compression(i),
            }

        return stats if stats else {"info": "No tiers yet"}


# Global instance
memory_manager = MemoryManager()
