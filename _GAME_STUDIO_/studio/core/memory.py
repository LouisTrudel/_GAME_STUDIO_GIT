"""
AC-Memory: Accumulated-Compacted Memory Tier System

Simple markdown-based tiered memory with compression.

Structure:
  tier0 = messages.json (hub chat + task completions, rolling 50 buffer)
  memory/
  ├── tier1.md  ← Compressed bullets: ACTIVE/DONE (50KB)
  ├── tier2.md  ← Archive (200KB)
  └── tier3+.md ← Reference only: searchable, NOT injected (500KB+)

Flow:
  Hub chat + task completions → messages.json (tier0)
  tier0 > 10KB → compress → bullets → tier1
  tier1 > 50KB → compress → archive → tier2
  (cascades up as needed)
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
    # ~50-60 chars per bullet, keep tiers tight for search
    0: 10_000,   # ~50 hub messages (variable length)
    1: 3_000,    # ~50 bullets (recent, hot)
    2: 3_000,    # ~50 bullets (recent archive)
    3: 4_500,    # ~75 bullets (older archive)
    4: 6_000,    # ~100 bullets (older archive)
}
# tier5+: deep archive, grows gradually
DEFAULT_THRESHOLD = 9_000  # ~150 bullets


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
        self._friction_processed: bool = False

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

    def append(self, index: int, content: str):
        """Append content to a tier. Auto-compresses if threshold exceeded.

        tier0 = messages.json (managed by hub.py, not here)
        """
        if index == 0:
            return  # tier0 is messages.json, managed by hub.py
        self._append_tier(index, content)

        # Read full content for size check AND potential compression (avoid re-read)
        full_content = self.get_tier(index)
        size = len(full_content)
        logger.info("Appended to tier%d, size: %d", index, size)

        # Auto-compress if needed (pass content to avoid race)
        threshold = self.tier_threshold(index)
        if size > threshold:
            logger.info("Tier%d exceeded threshold (%d/%d), compressing...", index, size, threshold)
            self.compress_tier(index, content=full_content)

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

    def compress_tier(self, index: int, content: str = None) -> bool:
        """Compress a tier: KEEP stays, PUSH goes to next tier.

        Args:
            index: Tier index to compress
            content: Optional pre-read content (avoids race condition with hub clearing messages)
        """
        # Loop prevention
        can_compress, reason = self._can_compress()
        if not can_compress:
            logger.debug("Skipping compression: %s", reason)
            return False

        # Use provided content or read fresh (content param avoids race condition)
        if content is None:
            content = self.get_tier(index)

        # Minimum content check - avoid compressing empty/tiny content
        MIN_CONTENT_LENGTH = 100
        if not content or len(content) < MIN_CONTENT_LENGTH:
            logger.debug("Skipping compression: content too small (%d chars)", len(content) if content else 0)
            self._is_compressing = False
            self._flush_friction()
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

        # Compress via callback - skip if unavailable
        if not self._compress_callback:
            logger.debug("No compression callback set - skipping")
            self._is_compressing = False
            return False

        try:
            result = self._compress_callback(content, index, prev_context)
        except Exception as e:
            logger.error("Compression callback failed: %s - skipping", e)
            self._is_compressing = False
            return False

        if not result:
            logger.debug("Compression returned None - skipping")
            self._is_compressing = False
            return False

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


    def _log_friction(self, friction: str):
        """Buffer friction (overwrites on flush - only current unresolved kept)."""
        self._friction_processed = True
        # Only keep lines with [UNRESOLVED] tag
        lines = friction.strip().split("\n")
        unresolved = [l.strip() for l in lines if l.strip() and "[UNRESOLVED]" in l.upper()]
        self._friction_buffer.extend(unresolved)

    def _flush_friction(self):
        """Overwrite friction.md with current unresolved items only."""
        if not self._friction_processed:
            return  # No friction section in output, keep existing file

        friction_file = self._memory_dir / "friction.md"
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            if self._friction_buffer:
                content = f"# Active Friction\n\n*Updated: {timestamp}*\n\n"
                content += "\n".join(self._friction_buffer)
                friction_file.write_text(content, encoding="utf-8")
                logger.info("Friction updated: %d unresolved items", len(self._friction_buffer))
            else:
                # All resolved - clear the file
                friction_file.write_text(f"# Active Friction\n\n*Updated: {timestamp}*\n\nNo unresolved issues.\n", encoding="utf-8")
                logger.info("Friction cleared: all issues resolved")
            self._friction_buffer.clear()
            self._friction_processed = False
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
            # tier0 = messages.json (no file, but still check threshold)
            if i == 0:
                # Read content ONCE to avoid race condition with hub clearing
                content = self.get_tier(0)
                if len(content) > self.tier_threshold(0):
                    if self.compress_tier(0, content=content):
                        compressed_count += 1
                    else:
                        break  # Rate limited
                continue

            filepath = self._tier_path(i)
            if not filepath.exists():
                break

            # Read content ONCE to avoid race with file modifications
            content = self.get_tier(i)
            if len(content) > self.tier_threshold(i):
                if self.compress_tier(i, content=content):
                    compressed_count += 1
                else:
                    # Rate limited, stop checking further tiers
                    break

        return compressed_count

    def get_stats(self) -> dict:
        """Get stats for all existing tiers."""
        stats = {}

        for i in range(20):  # Check up to 20 tiers
            # tier0 = messages.json (always exists)
            if i == 0:
                size = self.tier_size(0)
                threshold = self.tier_threshold(0)
                stats["tier0"] = {
                    "size": size,
                    "threshold": threshold,
                    "utilization": f"{(size / threshold) * 100:.1f}%" if threshold else "N/A",
                    "needs_compression": self.tier_needs_compression(0),
                }
                continue

            filepath = self._tier_path(i)
            if not filepath.exists():
                break

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
