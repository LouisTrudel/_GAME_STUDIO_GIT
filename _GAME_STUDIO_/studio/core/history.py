"""
History: Narrative Compression Tiers (Draft → Chapter → Book → Collection)

Simple markdown-based tiered history with Writer-generated narratives.

Structure:
  history/
  ├── draft.md      ← Current session (raw accumulation)
  ├── chapter.md    ← Compressed drafts (epoch narrative)
  ├── book.md       ← Compressed chapters (phase narrative)
  └── collection.md ← Final archive (grows indefinitely)

Flow:
  Hub chat → draft grows → threshold → Writer narrates →
  narrative replaces draft, summary appends to chapter → ...
"""

from datetime import datetime
from pathlib import Path
from typing import Optional, Callable, Literal

from .logging_config import get_logger
from .paths import get_history_dir

logger = get_logger("History")

# Tier names
TierName = Literal["draft", "chapter", "book", "collection"]
TIER_ORDER = ["draft", "chapter", "book", "collection"]

# Narrative callback type
# Takes: content, tier_name, compression_count
# Returns: narrative string
NarrativeCallback = Callable[[str, str, int], Optional[str]]

# Tier configuration
TIER_CONFIG = {
    "draft": {
        "file": "draft.md",
        "threshold": 10_000,       # ~10KB raw → compress to ~1-2KB
        "next": "chapter",
    },
    "chapter": {
        "file": "chapter.md",
        "threshold": 50_000,       # ~50KB drafts → compress to ~5-10KB
        "next": "book",
    },
    "book": {
        "file": "book.md",
        "threshold": 300_000,      # ~300KB chapters → compress to ~30-50KB
        "next": "collection",
    },
    "collection": {
        "file": "collection.md",
        "threshold": None,         # Final tier, grows indefinitely
        "next": None,
    },
}


class HistoryManager:
    """Simple markdown-based tiered history with narrative compression.

    Each tier is a single .md file. Content accumulates until threshold,
    then Writer generates a narrative: narrative replaces file, summary
    appends to next tier.
    """

    # Loop prevention constants
    COMPRESSION_COOLDOWN_SECONDS = 60  # Min time between compressions
    MAX_COMPRESSIONS_PER_HOUR = 10     # Hard limit

    def __init__(self, project_name: Optional[str] = None):
        self._project_name = project_name
        self._history_dir = get_history_dir(project_name)
        self._ensure_dirs()
        self._narrative_callback: Optional[NarrativeCallback] = None
        self._compression_counts: dict[str, int] = {}
        self._load_counts()
        # Loop prevention state
        self._is_compressing = False
        self._last_compression_time: Optional[datetime] = None
        self._compression_count_this_hour = 0
        self._hour_start: Optional[datetime] = None

    def set_project(self, project_name: Optional[str]):
        """Switch to a different project's history."""
        if project_name == self._project_name:
            return
        self._project_name = project_name
        self._history_dir = get_history_dir(project_name)
        self._compression_counts.clear()
        self._ensure_dirs()
        self._load_counts()
        logger.info("Switched to project: %s", project_name or 'default')

    def set_narrative_callback(self, callback: NarrativeCallback):
        """Set callback for Writer narrative generation."""
        self._narrative_callback = callback

    def _ensure_dirs(self):
        """Ensure history directory exists."""
        self._history_dir.mkdir(parents=True, exist_ok=True)

    def _tier_path(self, tier: TierName) -> Path:
        """Get file path for a tier."""
        return self._history_dir / TIER_CONFIG[tier]["file"]

    def _counts_path(self) -> Path:
        """Path to compression counts file."""
        return self._history_dir / ".counts"

    def _load_counts(self):
        """Load compression counts from disk."""
        path = self._counts_path()
        if path.exists():
            try:
                for line in path.read_text().strip().split('\n'):
                    if ':' in line:
                        tier, count = line.split(':')
                        self._compression_counts[tier.strip()] = int(count.strip())
            except:
                pass

    def _save_counts(self):
        """Save compression counts to disk."""
        path = self._counts_path()
        lines = [f"{tier}:{count}" for tier, count in self._compression_counts.items()]
        path.write_text('\n'.join(lines))

    # ============ READ/WRITE ============

    def get_tier(self, tier: TierName) -> str:
        """Get content of a tier. Returns empty string if not exists."""
        filepath = self._tier_path(tier)
        if filepath.exists():
            return filepath.read_text(encoding="utf-8")
        return ""

    def _write_tier(self, tier: TierName, content: str):
        """Write content to a tier file."""
        filepath = self._tier_path(tier)
        filepath.write_text(content, encoding="utf-8")

    def _append_tier(self, tier: TierName, content: str):
        """Append content to a tier file."""
        existing = self.get_tier(tier)

        if existing:
            new_content = existing + "\n\n---\n\n" + content
        else:
            new_content = content

        self._write_tier(tier, new_content)

    def tier_size(self, tier: TierName) -> int:
        """Get size of a tier in characters."""
        return len(self.get_tier(tier))

    def tier_threshold(self, tier: TierName) -> Optional[int]:
        """Get threshold for a tier."""
        return TIER_CONFIG[tier]["threshold"]

    def tier_needs_compression(self, tier: TierName) -> bool:
        """Check if tier exceeds threshold."""
        threshold = self.tier_threshold(tier)
        if threshold is None:
            return False
        return self.tier_size(tier) > threshold

    # ============ ACCUMULATE (main entry point) ============

    def accumulate(self, content: str):
        """Accumulate raw content to draft tier. Auto-compresses if needed."""
        self._append_tier("draft", content)
        size = self.tier_size("draft")
        logger.info("Appended to draft, size: %d", size)

        # Auto-compress if needed
        if self.tier_needs_compression("draft"):
            threshold = self.tier_threshold("draft")
            logger.info("Draft exceeded threshold (%d/%d), compressing...", size, threshold)
            self.compress_tier("draft")

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

    def compress_tier(self, tier: TierName, _depth: int = 0) -> bool:
        """Compress a tier via Writer narrative.

        Args:
            tier: The tier to compress
            _depth: Internal recursion depth counter (max 5 to prevent stack overflow)
        """
        # Recursion depth limit to prevent stack overflow
        MAX_CASCADE_DEPTH = 5
        if _depth >= MAX_CASCADE_DEPTH:
            logger.warning("Cascade depth limit reached (%d), stopping at %s", MAX_CASCADE_DEPTH, tier)
            return False

        # Loop prevention
        can_compress, reason = self._can_compress()
        if not can_compress:
            logger.debug("Skipping compression: %s", reason)
            return False

        content = self.get_tier(tier)
        if not content:
            return False

        # Set compression lock
        self._is_compressing = True
        self._last_compression_time = datetime.now()
        self._compression_count_this_hour += 1
        logger.info("Starting compression #%d this hour", self._compression_count_this_hour)

        config = TIER_CONFIG[tier]
        next_tier = config["next"]

        # Get compression count
        count = self._compression_counts.get(tier, 0) + 1
        self._compression_counts[tier] = count
        self._save_counts()

        # Generate narrative via callback or fallback
        if self._narrative_callback:
            try:
                narrative = self._narrative_callback(content, tier, count)
            except Exception as e:
                logger.error("Narrative callback failed: %s", e)
                narrative = self._fallback_compress(content, tier, count)
        else:
            narrative = self._fallback_compress(content, tier, count)

        if not narrative:
            narrative = self._fallback_compress(content, tier, count)

        # Replace current tier with narrative
        self._write_tier(tier, narrative)
        logger.info("%s compressed: %d chars (entry #%d)", tier, len(narrative), count)

        # Append summary to next tier
        if next_tier:
            timestamp = datetime.now().strftime("%Y-%m-%d")
            # Extract first paragraph as summary for next tier
            summary = self._extract_summary(narrative)
            entry = f"[{timestamp}] {tier.title()} #{count}:\n{summary}"
            self._append_tier(next_tier, entry)

            # Check if next tier needs compression (cascade)
            if self.tier_needs_compression(next_tier):
                logger.info("%s needs compression, cascading (depth=%d)...", next_tier, _depth + 1)
                self.compress_tier(next_tier, _depth=_depth + 1)

        # Release compression lock
        self._is_compressing = False
        return True

    def _extract_summary(self, narrative: str) -> str:
        """Extract first ~500 chars as summary for next tier."""
        # Skip header lines
        lines = narrative.strip().split('\n')
        content_lines = []
        for line in lines:
            if line.startswith('#'):
                continue
            if line.strip():
                content_lines.append(line)
            if len('\n'.join(content_lines)) > 500:
                break

        summary = '\n'.join(content_lines)[:500]
        if len(narrative) > len(summary):
            summary += "..."
        return summary

    def _fallback_compress(self, content: str, tier: str, count: int) -> str:
        """Simple compression when Writer unavailable."""
        lines = content.strip().split('\n')

        # Extract key lines
        key_lines = []
        keywords = ['completed', 'decision', 'milestone', 'implemented',
                    'created', 'fixed', 'shipped', 'task', 'feature']

        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in keywords):
                key_lines.append(line.strip())

        # Dedupe
        seen = set()
        unique = []
        for line in key_lines:
            if line not in seen and len(line) > 10:
                seen.add(line)
                unique.append(line)

        date = datetime.now().strftime("%Y-%m-%d")
        return f"# {tier.title()} #{count}\n\n*{date}*\n\n" + '\n'.join(unique[:50])

    # ============ QUERIES ============

    def get_recent(self, tier: TierName = "draft", max_chars: int = 2000) -> str:
        """Get last N chars from a tier."""
        content = self.get_tier(tier)
        return content[-max_chars:] if content else ""

    def get_stats(self) -> dict:
        """Get stats for all tiers."""
        stats = {}

        for tier in TIER_ORDER:
            size = self.tier_size(tier)
            threshold = self.tier_threshold(tier)
            count = self._compression_counts.get(tier, 0)

            stats[tier] = {
                "size": size,
                "threshold": threshold,
                "utilization": f"{(size / threshold) * 100:.1f}%" if threshold else "N/A",
                "needs_compression": self.tier_needs_compression(tier),
                "compression_count": count,
            }

        return stats


# Global instance
history_manager = HistoryManager()
