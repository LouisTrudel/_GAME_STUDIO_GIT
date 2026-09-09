"""
AC-Memory: Accumulated-Compacted Memory Tier System

Infinite tier compression via AI agents with 50/50 split retention.

Design:
- Each tier has a single `content` field (no A/C split)
- When tier N exceeds threshold → Context agent compacts with split:
  - 50% KEEP: Content relevant to tier N-1 context → stays in tier N
  - 50% PUSH: Historical/completed content → pushed to tier N+1
- Lower tiers = current/relevant, Higher tiers = historical/abstract

Flow:
  Hub chat → tier_0 grows → threshold → Context splits →
  50% stays in tier_0, 50% pushed to tier_1 → tier_1 grows → ...

File structure: data/memory/tier_0.json, tier_1.json, tier_2.json, etc.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional, Callable, TYPE_CHECKING

if TYPE_CHECKING:
    pass

from .paths import get_memory_dir

# Type alias for compression callback
# Takes: content to compress, tier_index, context from previous tier
# Returns: dict with {keep: str, push: str, friction: str}
CompressCallback = Callable[[str, int, str], dict]

# Legacy paths (default/no project)
MEMORY_DIR = Path(__file__).parent.parent.parent / "data" / "memory"

# Size thresholds per tier level (in characters)
TIER_THRESHOLDS = {
    0: 10_000,     # ~10KB - session messages
    1: 50_000,     # ~50KB - session summaries
    2: 200_000,    # ~200KB - epoch summaries
    # Tiers 3+ default to 200KB
}
DEFAULT_THRESHOLD = 200_000


@dataclass
class MemoryTier:
    """
    Single-content tier for AC-Memory.

    Each tier accumulates content until threshold, then compacts with 50/50 split:
    - 50% stays (relevant to previous tier context)
    - 50% pushes to next tier (historical/completed)
    """
    index: int
    content: str = ""
    compression_count: int = 0
    last_updated: Optional[str] = None
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "content": self.content,
            "compression_count": self.compression_count,
            "last_updated": self.last_updated,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "MemoryTier":
        # Backward compat: old schema had accumulated_a/compacted_c or summary_b
        content = data.get("content", "")
        if not content:
            # Try old field names
            content = data.get("accumulated_a", "") + "\n" + data.get("compacted_c", data.get("summary_b", ""))
            content = content.strip()

        return cls(
            index=data.get("index", data.get("tier_index", 0)),
            content=content,
            compression_count=data.get("compression_count", 0),
            last_updated=data.get("last_updated"),
            metadata=data.get("metadata", {}),
        )

    def size(self) -> int:
        """Content size in characters."""
        return len(self.content)

    def threshold(self) -> int:
        """Size threshold for this tier."""
        return TIER_THRESHOLDS.get(self.index, DEFAULT_THRESHOLD)

    def needs_compression(self) -> bool:
        """Check if content exceeds threshold."""
        return self.size() > self.threshold()


class MemoryManager:
    """Manages AC-Memory tiered compression with 50/50 split.

    Flow:
      tier_0 (hub chat) → threshold → Context splits →
      50% keep, 50% push to tier_1 → tier_1 grows → threshold → ...

    Each tier keeps content relevant to the tier below it.
    Higher tiers = more historical/abstract.
    """

    def __init__(self, project_name: Optional[str] = None):
        self._project_name = project_name
        self._memory_dir = get_memory_dir(project_name)
        self._ensure_dirs()
        self._tier_cache: dict[int, MemoryTier] = {}
        self._compress_callback: Optional[CompressCallback] = None

    def set_project(self, project_name: Optional[str]):
        """Switch to a different project's memory storage."""
        if project_name == self._project_name:
            return
        self._project_name = project_name
        self._memory_dir = get_memory_dir(project_name)
        self._tier_cache.clear()
        self._ensure_dirs()
        print(f"[Memory] Switched to project: {project_name or 'default'}")

    def set_compress_callback(self, callback: CompressCallback):
        """Set callback for Context agent compression.

        Callback signature: fn(content: str, tier_index: int, prev_tier_context: str) -> {keep: str, push: str, friction: str}
        """
        self._compress_callback = callback

    def _ensure_dirs(self):
        """Ensure memory directory exists."""
        self._memory_dir.mkdir(parents=True, exist_ok=True)

    def _tier_path(self, index: int) -> Path:
        """Get file path for a tier."""
        return self._memory_dir / f"tier_{index}.json"

    # ============ TIER OPERATIONS ============

    def get_tier(self, index: int) -> MemoryTier:
        """Load a tier. Creates empty tier if not exists."""
        if index in self._tier_cache:
            return self._tier_cache[index]

        filepath = self._tier_path(index)

        if filepath.exists():
            try:
                with open(filepath, encoding="utf-8") as f:
                    data = json.load(f)
                tier = MemoryTier.from_dict(data)
            except (json.JSONDecodeError, IOError) as e:
                print(f"[Memory] Failed to load tier {index}: {e}")
                tier = MemoryTier(index=index)
        else:
            tier = MemoryTier(index=index)

        self._tier_cache[index] = tier
        return tier

    def save_tier(self, tier: MemoryTier):
        """Save a tier to disk."""
        tier.last_updated = datetime.now().isoformat()
        filepath = self._tier_path(tier.index)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(tier.to_dict(), f, indent=2, ensure_ascii=False)

        self._tier_cache[tier.index] = tier

    def append(self, index: int, content: str):
        """Append content to a tier and auto-compress if threshold exceeded."""
        tier = self.get_tier(index)

        if tier.content:
            tier.content += "\n---\n"
        tier.content += content

        self.save_tier(tier)
        print(f"[Memory] Appended to tier {index}, size: {tier.size()}")

        # Auto-compress if threshold exceeded (cascades to higher tiers)
        if tier.needs_compression():
            print(f"[Memory] Tier {index} threshold exceeded ({tier.size()}/{tier.threshold()}), triggering compression")
            self.compress_tier(index)

    # ============ AC COMPRESSION ============

    def _log_before_compression(self, tier: MemoryTier):
        """Preserve tier content before compression."""
        log_dir = self._memory_dir / "compression_logs"
        log_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = log_dir / f"tier_{tier.index}_{timestamp}.txt"

        log_content = f"""=== COMPRESSION LOG ===
Tier: {tier.index}
Timestamp: {datetime.now().isoformat()}
Compression #: {tier.compression_count + 1}
Size: {tier.size()} chars

=== CONTENT ===
{tier.content}
"""
        with open(log_file, "w", encoding="utf-8") as f:
            f.write(log_content)
        print(f"[Memory] Logged tier {tier.index} before compression")

    def _log_friction(self, tier_index: int, friction_content: str):
        """Log friction events to a persistent friction log for pattern analysis."""
        friction_file = self._memory_dir / "friction.md"

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        entry = f"\n## [{timestamp}] Tier {tier_index} Compression\n\n{friction_content}\n"

        # Append to friction log
        mode = "a" if friction_file.exists() else "w"
        with open(friction_file, mode, encoding="utf-8") as f:
            if mode == "w":
                f.write("# Friction Log\n\nTracking errors, bugs, blockers, and failures for pattern analysis.\n")
            f.write(entry)

        print(f"[Memory] Logged {len(friction_content)} chars of friction events")

    def _fallback_compress(self, content: str, tier_index: int, prev_context: str) -> dict:
        """Fallback compression when Context agent unavailable.

        Simple split: first half = keep, second half = push.
        """
        lines = content.strip().split('\n')
        mid = len(lines) // 2

        keep_lines = lines[:mid] if mid > 0 else lines
        push_lines = lines[mid:] if mid > 0 else []

        return {
            "keep": '\n'.join(keep_lines),
            "push": '\n'.join(push_lines) if push_lines else ""
        }

    def compress_tier(self, index: int) -> bool:
        """Compact tier with 50/50 split via Context agent.

        Flow:
        1. Check if tier needs compression
        2. Log content before compression
        3. Get previous tier context (for relevance判定)
        4. Context agent splits: 50% keep, 50% push
        5. Update current tier with kept content
        6. Push remaining content to next tier

        Returns:
            True if compression happened, False if not needed
        """
        tier = self.get_tier(index)

        if not tier.needs_compression():
            print(f"[Memory] Tier {index} doesn't need compression "
                  f"({tier.size()}/{tier.threshold()} chars)")
            return False

        print(f"[Memory] Compressing tier {index} "
              f"({tier.size()} chars > {tier.threshold()} threshold)")

        # Log before compression
        self._log_before_compression(tier)

        # Get previous tier context for relevance判定
        prev_context = ""
        if index > 0:
            prev_tier = self.get_tier(index - 1)
            prev_context = prev_tier.content[:2000] if prev_tier.content else ""

        # Compress with split
        if self._compress_callback:
            try:
                result = self._compress_callback(tier.content, index, prev_context)
            except Exception as e:
                print(f"[Memory] Context agent compression failed: {e}")
                result = self._fallback_compress(tier.content, index, prev_context)
        else:
            print("[Memory] No compression callback, using fallback")
            result = self._fallback_compress(tier.content, index, prev_context)

        keep_content = result.get("keep", "")
        push_content = result.get("push", "")
        friction_content = result.get("friction", "")

        # Update current tier with kept content
        tier.content = keep_content
        tier.compression_count += 1
        self.save_tier(tier)

        # Push to next tier
        if push_content:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            push_entry = f"[{timestamp}] From tier {index}:\n{push_content}"
            self.append(index + 1, push_entry)

        # Log friction events separately for pattern analysis
        if friction_content:
            self._log_friction(index, friction_content)

        print(f"[Memory] Tier {index} compressed: "
              f"kept {len(keep_content)}, pushed {len(push_content)}, friction {len(friction_content)} chars")

        return True

    def check_and_compress_all(self) -> int:
        """Check all tiers and compress any that exceed thresholds.

        Cascades: T0 → T1 → T2 → ... until no more compression needed.

        Returns:
            Number of tiers compressed
        """
        compressed_count = 0
        index = 0

        while True:
            filepath = self._tier_path(index)

            # Stop if tier doesn't exist and it's not tier 0
            if not filepath.exists() and index > 0:
                break

            if self.compress_tier(index):
                compressed_count += 1
                # Continue checking - next tier may now need compression too
            else:
                # This tier didn't need compression, stop cascade
                break

            index += 1

            # Safety limit
            if index > 100:
                print("[Memory] WARNING: Hit tier limit (100)")
                break

        if compressed_count > 0:
            print(f"[Memory] Cascade complete: {compressed_count} tier(s) compressed")

        return compressed_count

    # ============ SEARCH ============

    def search(self, query: str, max_tiers: int = 10) -> list[dict]:
        """Search memory across tiers."""
        results = []
        query_lower = query.lower()

        for index in range(max_tiers):
            filepath = self._tier_path(index)
            if not filepath.exists():
                break

            tier = self.get_tier(index)

            if tier.content and query_lower in tier.content.lower():
                idx = tier.content.lower().find(query_lower)
                start = max(0, idx - 100)
                end = min(len(tier.content), idx + 200)
                snippet = tier.content[start:end]

                results.append({
                    "tier": index,
                    "snippet": f"...{snippet}...",
                    "size": tier.size(),
                })

        return results

    def get_recent(self, index: int = 0, max_chars: int = 2000) -> str:
        """Get recent content from a tier."""
        tier = self.get_tier(index)
        if not tier.content:
            return ""
        return tier.content[-max_chars:]

    # ============ STATS ============

    def get_tier_stats(self) -> dict:
        """Get statistics for all tiers."""
        stats = {}
        index = 0

        while True:
            filepath = self._tier_path(index)
            if not filepath.exists():
                break

            tier = self.get_tier(index)
            stats[f"tier_{index}"] = {
                "size_chars": tier.size(),
                "threshold": tier.threshold(),
                "utilization": f"{(tier.size() / tier.threshold()) * 100:.1f}%",
                "needs_compression": tier.needs_compression(),
                "compression_count": tier.compression_count,
                "last_updated": tier.last_updated,
            }
            index += 1

        if not stats:
            stats["info"] = "No tiers initialized yet"

        return stats

    # ============ LEGACY COMPAT ============

    def add_hot(self, content: str, source: str = "task", **kwargs):
        """Legacy method - appends to tier 0."""
        timestamp = datetime.now().strftime("%H:%M")
        entry = f"[{timestamp}] {source}: {content}"
        self.append(0, entry)


# Global memory manager
memory_manager = MemoryManager()
