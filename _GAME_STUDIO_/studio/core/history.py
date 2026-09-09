"""
History Compression Tiers - Draft → Chapter → Book → Collection

T309: Writer produces narratives at each tier. This module defines the tier
structure, trigger conditions, and storage patterns for compressed history.

Tier Hierarchy:
- Draft: Session-level narrative (triggers: session end, time gap)
- Chapter: Multi-draft narrative (triggers: N drafts, epoch end, project milestone)
- Book: Project phase narrative (triggers: phase complete, major milestone)
- Collection: Cross-project narrative (triggers: multiple books, portfolio review)

Storage: data/history/{tier_prefix}_{date}_{count}.md
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional, Callable, Literal

from .paths import get_history_dir

# Type definitions
TierName = Literal["draft", "chapter", "book", "collection"]
CompressionCallback = Callable[[str, "HistoryTier", int], Optional[str]]

# Legacy paths (default/no project) - kept for backwards compatibility
HISTORY_DIR = Path(__file__).parent.parent.parent / "data" / "history"
HISTORY_STATE_FILE = HISTORY_DIR / "tier_state.json"

# Tier configuration (character thresholds only - no count thresholds)
TIER_CONFIG = {
    "draft": {
        "index": 0,
        "prefix": "draft",
        "threshold_chars": 10_000,       # ~10KB raw messages → compress to ~1-2KB
        "promotes_to": "chapter",
        "description": "Session-level narrative from raw hub messages",
    },
    "chapter": {
        "index": 1,
        "prefix": "chapter",
        "threshold_chars": 50_000,       # ~50KB of drafts → compress to ~5-10KB
        "promotes_to": "book",
        "description": "Multi-session narrative covering an epoch of work",
    },
    "book": {
        "index": 2,
        "prefix": "book",
        "threshold_chars": 300_000,      # ~300KB of chapters → compress to ~30-50KB
        "promotes_to": "collection",
        "description": "Major project phase narrative",
    },
    "collection": {
        "index": 3,
        "prefix": "collection",
        "threshold_chars": None,         # Final tier - grows indefinitely
        "promotes_to": None,             # No promotion, this is the archive
        "description": "Project archive - accumulates book summaries",
    },
}

TIER_ORDER = ["draft", "chapter", "book", "collection"]


@dataclass
class HistoryTier:
    """
    Represents a single tier in the history compression hierarchy.

    Each tier accumulates content until a trigger condition is met,
    then compresses via Writer and promotes summary to the next tier.
    """
    name: TierName
    accumulated_content: str = ""
    item_count: int = 0  # Number of items (drafts/chapters/etc) accumulated
    compression_count: int = 0  # How many times this tier has been compressed
    last_updated: Optional[str] = None
    metadata: dict = field(default_factory=dict)

    @property
    def config(self) -> dict:
        """Get this tier's configuration."""
        return TIER_CONFIG[self.name]

    @property
    def index(self) -> int:
        """Get this tier's index (0=draft, 1=chapter, etc)."""
        return self.config["index"]

    @property
    def prefix(self) -> str:
        """Get filename prefix for this tier."""
        return self.config["prefix"]

    @property
    def promotes_to(self) -> Optional[TierName]:
        """Get the next tier this promotes to."""
        return self.config["promotes_to"]

    def size(self) -> int:
        """Return size of accumulated content in characters."""
        return len(self.accumulated_content)

    def needs_compression(self) -> bool:
        """Check if this tier should compress based on thresholds."""
        # Check character threshold (None = never auto-compress, e.g. collection tier)
        threshold = self.config.get("threshold_chars")
        if threshold and self.size() > threshold:
            return True
        return False

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "accumulated_content": self.accumulated_content,
            "item_count": self.item_count,
            "compression_count": self.compression_count,
            "last_updated": self.last_updated,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "HistoryTier":
        return cls(
            name=data["name"],
            accumulated_content=data.get("accumulated_content", ""),
            item_count=data.get("item_count", 0),
            compression_count=data.get("compression_count", 0),
            last_updated=data.get("last_updated"),
            metadata=data.get("metadata", {}),
        )


class HistoryManager:
    """
    Manages the tiered history compression system.

    T321: Supports project-aware paths. When project_name is set,
    history data is stored in projects/<name>/history/ instead of data/history/.

    Trigger Flow:
    1. Raw messages accumulate in memory tier 0
    2. On memory compression, trigger Draft narrative
    3. Drafts accumulate → trigger Chapter narrative
    4. Chapters accumulate → trigger Book narrative
    5. Books accumulate → trigger Collection narrative
    """

    def __init__(self, project_name: Optional[str] = None):
        self._project_name = project_name
        self._history_dir = get_history_dir(project_name)
        self._state_file = self._history_dir / "tier_state.json"
        self._ensure_dirs()
        self._tiers: dict[TierName, HistoryTier] = {}
        self._narrative_callback: Optional[CompressionCallback] = None
        self._load_state()

    def set_project(self, project_name: Optional[str]):
        """Switch to a different project's history storage.

        Args:
            project_name: Project folder name, or None for default.
        """
        if project_name == self._project_name:
            return  # No change
        self._project_name = project_name
        self._history_dir = get_history_dir(project_name)
        self._state_file = self._history_dir / "tier_state.json"
        self._ensure_dirs()
        self._tiers.clear()  # Clear tiers on project switch
        self._load_state()
        print(f"[History] Switched to project: {project_name or 'default'}")

    def _ensure_dirs(self):
        """Ensure history directory exists."""
        self._history_dir.mkdir(parents=True, exist_ok=True)

    def _load_state(self):
        """Load tier state from disk."""
        if self._state_file.exists():
            try:
                with open(self._state_file, encoding="utf-8") as f:
                    data = json.load(f)
                for tier_name in TIER_ORDER:
                    if tier_name in data:
                        self._tiers[tier_name] = HistoryTier.from_dict(data[tier_name])
                    else:
                        self._tiers[tier_name] = HistoryTier(name=tier_name)
            except (json.JSONDecodeError, IOError) as e:
                print(f"[History] Failed to load state: {e}")
                self._init_empty_tiers()
        else:
            self._init_empty_tiers()

    def _init_empty_tiers(self):
        """Initialize empty tiers."""
        for tier_name in TIER_ORDER:
            self._tiers[tier_name] = HistoryTier(name=tier_name)

    def _save_state(self):
        """Save tier state to disk."""
        data = {name: tier.to_dict() for name, tier in self._tiers.items()}
        with open(self._state_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def set_narrative_callback(self, callback: CompressionCallback):
        """Set callback for Writer-based narrative generation.

        Args:
            callback: Function(content: str, tier: HistoryTier, compression_count: int) -> narrative: str
        """
        self._narrative_callback = callback

    def get_tier(self, name: TierName) -> HistoryTier:
        """Get a tier by name."""
        return self._tiers[name]

    # ============ RAW ACCUMULATION ============

    def accumulate_raw(self, entry: str):
        """Accumulate raw hub message to Draft tier.

        This is the entry point for History - raw hub messages flow here
        independently from AC-Memory. When draft threshold is exceeded,
        Writer compresses into narrative and pushes to chapter.

        Args:
            entry: Formatted hub message (timestamp + sender + content)
        """
        tier = self._tiers["draft"]

        # Append to draft accumulation
        if tier.accumulated_content:
            tier.accumulated_content += "\n"
        tier.accumulated_content += entry
        tier.last_updated = datetime.now().isoformat()

        # Save state after each append
        self._save_state()

        # Check if draft needs compression
        if tier.needs_compression():
            print(f"[History] Draft threshold exceeded ({tier.size()} chars), triggering compression")
            self._compress_tier("draft")

    # ============ TRIGGERS ============

    def trigger_draft(self, content: str, source: str = "memory_compression"):
        """
        Trigger Draft tier - called when memory tier 0 compresses.

        This is the entry point: raw session content becomes a Draft narrative.

        Args:
            content: The compressed memory content
            source: What triggered this (memory_compression, session_end, manual)
        """
        print(f"[History] Draft trigger from {source} ({len(content)} chars)")

        tier = self._tiers["draft"]

        # Generate narrative via Writer callback
        if self._narrative_callback:
            try:
                narrative = self._narrative_callback(content, tier, tier.compression_count + 1)
                if narrative:
                    self._save_narrative("draft", narrative, tier.compression_count + 1)
                    tier.compression_count += 1

                    # Append summary to chapter tier for accumulation
                    self._append_to_tier("chapter", narrative, source="draft")
            except Exception as e:
                print(f"[History] Draft narrative failed: {e}")
                # Fallback: still accumulate raw content to chapter
                self._append_to_tier("chapter", content, source="draft_raw")
        else:
            print("[History] No narrative callback, accumulating raw content")
            self._append_to_tier("chapter", content, source="draft_raw")

        tier.last_updated = datetime.now().isoformat()
        self._save_state()

        # Check if chapter tier needs compression
        self._check_and_compress("chapter")

    def trigger_session_end(self, session_summary: str = None):
        """
        Trigger Draft on session end.

        Called when user explicitly ends session or after long inactivity.
        """
        if session_summary:
            self.trigger_draft(session_summary, source="session_end")
        else:
            # If no summary provided, check if draft tier has pending content
            tier = self._tiers["draft"]
            if tier.accumulated_content:
                self.trigger_draft(tier.accumulated_content, source="session_end_flush")

    def trigger_epoch_end(self, epoch_summary: str):
        """
        Trigger Chapter compression on epoch end.

        Called when memory system completes an epoch (tier 1 compression).
        """
        print(f"[History] Epoch end trigger ({len(epoch_summary)} chars)")
        self._force_compress("chapter", epoch_summary, source="epoch_end")

    def trigger_phase_complete(self, phase_name: str, phase_summary: str):
        """
        Trigger Book compression on project phase completion.

        Called when a significant project milestone is reached.

        Args:
            phase_name: Name of the completed phase (e.g., "MVP", "Beta")
            phase_summary: Summary of what was accomplished
        """
        print(f"[History] Phase complete: {phase_name}")

        # Add phase metadata
        tier = self._tiers["book"]
        tier.metadata["last_phase"] = phase_name

        self._force_compress("book", phase_summary, source=f"phase:{phase_name}")

    def trigger_portfolio_review(self, projects: list[str] = None):
        """
        Trigger Collection compression for cross-project review.

        Called manually or on significant portfolio events.
        """
        print(f"[History] Portfolio review trigger")
        tier = self._tiers["collection"]

        if projects:
            tier.metadata["projects"] = projects

        if tier.accumulated_content:
            self._force_compress("collection", tier.accumulated_content, source="portfolio_review")

    # ============ INTERNAL ============

    def _append_to_tier(self, tier_name: TierName, content: str, source: str = None):
        """Append content to a tier's accumulation buffer."""
        tier = self._tiers[tier_name]

        # Add separator if content exists
        if tier.accumulated_content:
            tier.accumulated_content += "\n\n---\n\n"

        # Add timestamp and source
        timestamp = datetime.now().isoformat()
        header = f"[{timestamp}]"
        if source:
            header += f" ({source})"

        tier.accumulated_content += f"{header}\n{content}"
        tier.item_count += 1
        tier.last_updated = timestamp

        print(f"[History] Appended to {tier_name}: {len(content)} chars, "
              f"total {tier.size()} chars, {tier.item_count} items")

        self._save_state()

    def _check_and_compress(self, tier_name: TierName):
        """Check if tier needs compression and compress if so."""
        tier = self._tiers[tier_name]

        if not tier.needs_compression():
            return

        print(f"[History] {tier_name} needs compression "
              f"({tier.size()} chars, {tier.item_count} items)")

        self._compress_tier(tier_name)

    def _force_compress(self, tier_name: TierName, content: str, source: str):
        """Force compression of a tier with given content."""
        tier = self._tiers[tier_name]

        # Append content first
        if content:
            self._append_to_tier(tier_name, content, source)

        # Then compress
        self._compress_tier(tier_name)

    def _compress_tier(self, tier_name: TierName):
        """Compress a tier: generate narrative, save, promote to next tier."""
        tier = self._tiers[tier_name]

        if not tier.accumulated_content:
            print(f"[History] {tier_name} has no content to compress")
            return

        content = tier.accumulated_content

        # Generate narrative via callback
        if self._narrative_callback:
            try:
                narrative = self._narrative_callback(content, tier, tier.compression_count + 1)
                if narrative:
                    self._save_narrative(tier_name, narrative, tier.compression_count + 1)
                    output = narrative
                else:
                    output = self._fallback_compress(content, tier_name)
            except Exception as e:
                print(f"[History] {tier_name} narrative failed: {e}")
                output = self._fallback_compress(content, tier_name)
        else:
            output = self._fallback_compress(content, tier_name)

        tier.compression_count += 1

        # Clear accumulated content
        tier.accumulated_content = ""
        tier.item_count = 0
        tier.last_updated = datetime.now().isoformat()

        # Promote to next tier if exists
        if tier.promotes_to:
            self._append_to_tier(tier.promotes_to, output, source=tier_name)
            # Check if next tier now needs compression (cascade)
            self._check_and_compress(tier.promotes_to)

        self._save_state()

    def _fallback_compress(self, content: str, tier_name: str) -> str:
        """Fallback compression when Writer callback unavailable."""
        lines = content.split('\n')
        key_lines = []

        # Extract meaningful lines
        keywords = ['completed', 'decision', 'milestone', 'implemented',
                    'created', 'fixed', 'approved', '→', 'task', 'feature']

        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in keywords) or line.startswith('['):
                key_lines.append(line.strip())

        # Deduplicate and limit
        seen = set()
        unique_lines = []
        for line in key_lines:
            if line not in seen and len(line) > 10:
                seen.add(line)
                unique_lines.append(line)

        return f"[{tier_name} fallback compression - {len(lines)} lines → {len(unique_lines)} key lines]\n" + \
               '\n'.join(unique_lines[:100])

    def _save_narrative(self, tier_name: str, narrative: str, count: int):
        """Save a narrative to the history directory."""
        date_str = datetime.now().strftime("%Y-%m-%d")
        prefix = TIER_CONFIG[tier_name]["prefix"]
        filename = f"{prefix}_{date_str}_{count}.md"
        filepath = self._history_dir / filename

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(narrative)

        print(f"[History] Saved {tier_name} narrative: {filename}")

    # ============ QUERIES ============

    def get_stats(self) -> dict:
        """Get statistics for all tiers."""
        stats = {}
        for name, tier in self._tiers.items():
            cfg = tier.config
            threshold = cfg.get("threshold_chars")
            stats[name] = {
                "size_chars": tier.size(),
                "item_count": tier.item_count,
                "compression_count": tier.compression_count,
                "threshold_chars": threshold,
                "utilization": f"{(tier.size() / threshold * 100):.1f}%" if threshold else "N/A",
                "needs_compression": tier.needs_compression(),
                "last_updated": tier.last_updated,
            }
        return stats

    def list_narratives(self, tier_name: TierName = None) -> list[dict]:
        """List saved narrative files."""
        narratives = []

        for filepath in sorted(self._history_dir.glob("*.md")):
            name = filepath.stem
            parts = name.split("_")

            if len(parts) >= 3:
                prefix = parts[0]
                # Match tier if specified
                if tier_name and prefix != TIER_CONFIG[tier_name]["prefix"]:
                    continue

                narratives.append({
                    "filename": filepath.name,
                    "tier": prefix,
                    "date": parts[1] if len(parts) > 1 else None,
                    "count": parts[2] if len(parts) > 2 else None,
                    "size": filepath.stat().st_size,
                })

        return narratives


# Global history manager
history_manager = HistoryManager()
