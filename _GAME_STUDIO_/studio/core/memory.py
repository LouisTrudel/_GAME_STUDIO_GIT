"""
Memory Tier System - AB Chaining for infinite compression.

T256 Refactor: Generic TierData model that enables infinite tier chaining.

AB Chaining Pattern:
- Each tier has [A] accumulated content and [B] summary
- When tier N's [A] exceeds max size → compress to [B] → append B to tier N+1's [A]
- Same structure at every tier enables T0→T1→T2→...∞

File structure: data/memory/tier_0.json, tier_1.json, tier_2.json, etc.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional, Callable, TYPE_CHECKING

if TYPE_CHECKING:
    from studio.core.history import HistoryManager

# Type alias for compression callback
# Takes content to compress, returns summary string
CompressionCallback = Callable[[str, int], str]

# Type alias for history tier trigger callback (T309)
# Called after tier compression to trigger Draft → Chapter → Book → Collection
# Takes: content (str), tier_index (int)
HistoryTierCallback = Callable[[str, int], None]

# History directory
HISTORY_DIR = Path(__file__).parent.parent.parent / "data" / "history"

# File paths
MEMORY_DIR = Path(__file__).parent.parent.parent / "data" / "memory"

# Size thresholds per tier level (in characters)
# SMALL (T0: session messages), MEDIUM (T1: daily summaries), LARGE (T2+: compressed archives)
TIER_THRESHOLDS = {
    0: 10_000,     # ~10KB - session messages compress quickly
    1: 50_000,     # ~50KB - daily summaries accumulate longer
    2: 200_000,    # ~200KB - archives compress rarely
    # Tiers 3+ default to LARGE threshold
}
DEFAULT_THRESHOLD = 200_000  # Default for tiers 3+


@dataclass
class TierData:
    """
    Universal tier data structure for AB chaining.

    Same structure at every tier level:
    - tier_index: Which tier this is (0, 1, 2, ...)
    - accumulated_a: Growing content waiting to be compressed
    - summary_b: Most recent compression result
    - metadata: Tier-specific tracking info
    """
    tier_index: int
    accumulated_a: str = ""
    summary_b: str = ""
    metadata: dict = field(default_factory=dict)
    last_updated: Optional[str] = None
    compression_count: int = 0  # How many times this tier has been compressed

    def to_dict(self) -> dict:
        return {
            "tier_index": self.tier_index,
            "accumulated_a": self.accumulated_a,
            "summary_b": self.summary_b,
            "metadata": self.metadata,
            "last_updated": self.last_updated,
            "compression_count": self.compression_count,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "TierData":
        return cls(
            tier_index=data.get("tier_index", 0),
            accumulated_a=data.get("accumulated_a", ""),
            summary_b=data.get("summary_b", ""),
            metadata=data.get("metadata", {}),
            last_updated=data.get("last_updated"),
            compression_count=data.get("compression_count", 0),
        )

    def size(self) -> int:
        """Return size of accumulated_a in characters."""
        return len(self.accumulated_a)

    def threshold(self) -> int:
        """Return size threshold for this tier."""
        return TIER_THRESHOLDS.get(self.tier_index, DEFAULT_THRESHOLD)

    def needs_compression(self) -> bool:
        """Check if accumulated_a exceeds threshold."""
        return self.size() > self.threshold()


class MemoryManager:
    """Manages tiered memory with AB chaining compression."""

    def __init__(self):
        self._ensure_dirs()
        self._tier_cache: dict[int, TierData] = {}
        self._compress_callback: Optional[CompressionCallback] = None
        self._history_tier_callback: Optional[HistoryTierCallback] = None

    def set_compress_callback(self, callback: CompressionCallback):
        """Set callback for LLM-based compression.

        Args:
            callback: Function(content: str, tier_index: int) -> summary: str
        """
        self._compress_callback = callback

    def set_history_tier_callback(self, callback: HistoryTierCallback):
        """Set callback for history tier triggers (T309).

        Called after tier compression to trigger Draft → Chapter → Book → Collection.
        The history tier system produces narratives at each tier level.

        Args:
            callback: Function(content: str, tier_index: int) -> None
        """
        self._history_tier_callback = callback

    def _ensure_dirs(self):
        """Ensure memory directory exists."""
        MEMORY_DIR.mkdir(parents=True, exist_ok=True)

    def _tier_path(self, tier_index: int) -> Path:
        """Get file path for a tier."""
        return MEMORY_DIR / f"tier_{tier_index}.json"

    # ============ TIER OPERATIONS ============

    def get_tier(self, tier_index: int) -> TierData:
        """Load a tier's data. Creates empty tier if not exists."""
        # Check cache first
        if tier_index in self._tier_cache:
            return self._tier_cache[tier_index]

        filepath = self._tier_path(tier_index)

        if filepath.exists():
            try:
                with open(filepath, encoding="utf-8") as f:
                    data = json.load(f)
                tier = TierData.from_dict(data)
            except (json.JSONDecodeError, IOError) as e:
                print(f"[Memory] Failed to load tier {tier_index}: {e}")
                tier = TierData(tier_index=tier_index)
        else:
            tier = TierData(tier_index=tier_index)

        self._tier_cache[tier_index] = tier
        return tier

    def save_tier(self, tier: TierData):
        """Save a tier's data to disk."""
        tier.last_updated = datetime.now().isoformat()
        filepath = self._tier_path(tier.tier_index)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(tier.to_dict(), f, indent=2, ensure_ascii=False)

        # Update cache
        self._tier_cache[tier.tier_index] = tier

    def append_to_tier(self, tier_index: int, content: str, metadata_update: dict = None):
        """Append content to a tier's accumulated_a."""
        tier = self.get_tier(tier_index)

        # Add separator if there's existing content
        if tier.accumulated_a:
            tier.accumulated_a += "\n---\n"
        tier.accumulated_a += content

        # Update metadata if provided
        if metadata_update:
            tier.metadata.update(metadata_update)

        self.save_tier(tier)
        print(f"[Memory] Appended to tier {tier_index}, size: {tier.size()}")

    # ============ AB COMPRESSION (T257) ============

    def _log_before_compression(self, tier: TierData):
        """Preserve tier content to log file before compression."""
        log_dir = MEMORY_DIR / "compression_logs"
        log_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = log_dir / f"tier_{tier.tier_index}_{timestamp}.txt"

        log_content = f"""=== COMPRESSION LOG ===
Tier: {tier.tier_index}
Timestamp: {datetime.now().isoformat()}
Compression #: {tier.compression_count + 1}
Size before: {tier.size()} chars

=== ACCUMULATED_A (being compressed) ===
{tier.accumulated_a}

=== PREVIOUS SUMMARY_B ===
{tier.summary_b if tier.summary_b else "(none)"}
"""
        with open(log_file, "w", encoding="utf-8") as f:
            f.write(log_content)
        print(f"[Memory] Logged tier {tier.tier_index} before compression: {log_file.name}")

    def _default_compress(self, content: str, tier_index: int) -> str:
        """Fallback compression when no LLM callback is set.

        Simple truncation/extraction - not ideal but functional.
        """
        # Extract key lines (starts of sections, decisions, etc.)
        lines = content.split('\n')
        key_lines = []
        for line in lines:
            line_stripped = line.strip()
            # Keep headers, timestamps, decision markers
            if (line_stripped.startswith('[') or
                line_stripped.startswith('#') or
                line_stripped.startswith('===') or
                'decision' in line_stripped.lower() or
                'completed' in line_stripped.lower()):
                key_lines.append(line_stripped)

        summary = f"[Tier {tier_index} compression - {len(lines)} lines → {len(key_lines)} key lines]\n"
        summary += '\n'.join(key_lines[:50])  # Cap at 50 key lines

        if len(key_lines) > 50:
            summary += f"\n... and {len(key_lines) - 50} more key lines"

        return summary

    def compress_tier(self, tier_index: int) -> bool:
        """Compress tier N's accumulated_a into summary_b, append to tier N+1.

        AB Chaining:
        1. Check if tier N needs compression (size > threshold)
        2. Log current state (preserve before compression)
        3. Compress accumulated_a → summary_b (via LLM or fallback)
        4. Append summary_b to tier N+1's accumulated_a
        5. Clear tier N's accumulated_a (summary_b kept as record)
        6. Increment compression count

        Args:
            tier_index: The tier to compress (0, 1, 2, ...)

        Returns:
            True if compression happened, False if not needed
        """
        tier = self.get_tier(tier_index)

        # Check if compression needed
        if not tier.needs_compression():
            print(f"[Memory] Tier {tier_index} doesn't need compression "
                  f"({tier.size()}/{tier.threshold()} chars)")
            return False

        print(f"[Memory] Compressing tier {tier_index} "
              f"({tier.size()} chars > {tier.threshold()} threshold)")

        # Step 1: Log before compression
        self._log_before_compression(tier)

        # Step 2: Compress accumulated_a → summary_b
        if self._compress_callback:
            try:
                summary = self._compress_callback(tier.accumulated_a, tier_index)
            except Exception as e:
                print(f"[Memory] LLM compression failed, using fallback: {e}")
                summary = self._default_compress(tier.accumulated_a, tier_index)
        else:
            print("[Memory] No compression callback set, using fallback")
            summary = self._default_compress(tier.accumulated_a, tier_index)

        # Step 3: Append summary to tier N+1's accumulated_a
        next_tier_index = tier_index + 1
        timestamp = datetime.now().isoformat()
        chain_entry = f"[{timestamp}] Tier {tier_index} compression #{tier.compression_count + 1}:\n{summary}"

        self.append_to_tier(next_tier_index, chain_entry, {
            "source_tier": tier_index,
            "source_compression_count": tier.compression_count + 1,
        })

        # Step 4: Update tier N - clear accumulated_a, set summary_b
        old_content = tier.accumulated_a  # Preserve for history callback
        tier.summary_b = summary
        tier.accumulated_a = ""
        tier.compression_count += 1
        self.save_tier(tier)

        print(f"[Memory] Tier {tier_index} compressed → appended to tier {next_tier_index}")

        # Trigger history tier system (T309)
        # Draft → Chapter → Book → Collection compression chain
        # Note: T282 _generate_history_narrative was deprecated (T311) - T309 handles all narratives
        self._trigger_history_tier(old_content, tier_index)

        return True

    def _trigger_history_tier(self, content: str, tier_index: int):
        """Trigger history tier system after memory compression (T309).

        Maps memory tiers to history tiers:
        - Tier 0 compression → Draft trigger
        - Tier 1 compression → Chapter trigger (epoch end)
        - Tier 2+ compression → Book/Collection triggers

        Non-fatal: failures are logged but don't break compression flow.
        """
        if not self._history_tier_callback:
            return

        try:
            self._history_tier_callback(content, tier_index)
        except Exception as e:
            print(f"[Memory] History tier trigger failed (non-fatal): {e}")

    def check_and_compress_all(self) -> int:
        """Check all tiers and compress any that exceed thresholds.

        Cascades: T0→T1→T2→... until no more compression needed.
        Called after agent responses (T258 will wire this up).

        Returns:
            Number of tiers compressed
        """
        compressed_count = 0
        tier_index = 0

        while True:
            filepath = self._tier_path(tier_index)

            # Stop if tier doesn't exist (haven't reached this tier yet)
            if not filepath.exists() and tier_index > 0:
                break

            if self.compress_tier(tier_index):
                compressed_count += 1
                # After compressing tier N, content moved to N+1
                # Continue checking to see if N+1 now needs compression
            else:
                # This tier didn't need compression, stop cascade
                break

            tier_index += 1

            # Safety limit - prevent infinite loop
            if tier_index > 100:
                print("[Memory] WARNING: Hit tier limit (100), stopping cascade")
                break

        if compressed_count > 0:
            print(f"[Memory] Cascade complete: {compressed_count} tier(s) compressed")

        return compressed_count

    # ============ SEARCH ============

    def search(self, query: str, max_tiers: int = 10) -> list[dict]:
        """
        Search memory across tiers in priority order (T0→T1→T2...).

        Args:
            query: Search term (keyword match)
            max_tiers: Maximum number of tiers to search

        Returns:
            List of matches with tier info.
        """
        results = []
        query_lower = query.lower()

        for tier_index in range(max_tiers):
            filepath = self._tier_path(tier_index)
            if not filepath.exists():
                break  # No more tiers

            tier = self.get_tier(tier_index)

            # Search in accumulated_a
            if query_lower in tier.accumulated_a.lower():
                # Extract relevant snippet
                idx = tier.accumulated_a.lower().find(query_lower)
                start = max(0, idx - 100)
                end = min(len(tier.accumulated_a), idx + 200)
                snippet = tier.accumulated_a[start:end]

                results.append({
                    "tier": tier_index,
                    "location": "accumulated_a",
                    "snippet": f"...{snippet}...",
                    "size": tier.size(),
                })

            # Search in summary_b
            if tier.summary_b and query_lower in tier.summary_b.lower():
                idx = tier.summary_b.lower().find(query_lower)
                start = max(0, idx - 100)
                end = min(len(tier.summary_b), idx + 200)
                snippet = tier.summary_b[start:end]

                results.append({
                    "tier": tier_index,
                    "location": "summary_b",
                    "snippet": f"...{snippet}...",
                    "compression_count": tier.compression_count,
                })

        return results

    def get_recent(self, tier_index: int = 0, max_chars: int = 2000) -> str:
        """Get recent content from a tier (end of accumulated_a)."""
        tier = self.get_tier(tier_index)
        if not tier.accumulated_a:
            return ""
        return tier.accumulated_a[-max_chars:]

    # ============ STATS ============

    def get_tier_stats(self) -> dict:
        """Get statistics for all tiers."""
        stats = {}
        tier_index = 0

        while True:
            filepath = self._tier_path(tier_index)
            if not filepath.exists():
                break

            tier = self.get_tier(tier_index)
            stats[f"tier_{tier_index}"] = {
                "size_chars": tier.size(),
                "threshold": tier.threshold(),
                "utilization": f"{(tier.size() / tier.threshold()) * 100:.1f}%",
                "needs_compression": tier.needs_compression(),
                "compression_count": tier.compression_count,
                "has_summary": bool(tier.summary_b),
                "last_updated": tier.last_updated,
            }
            tier_index += 1

        if not stats:
            stats["info"] = "No tiers initialized yet"

        return stats

    def get_all_tiers(self) -> list[TierData]:
        """Get all existing tiers."""
        tiers = []
        tier_index = 0

        while True:
            filepath = self._tier_path(tier_index)
            if not filepath.exists():
                break
            tiers.append(self.get_tier(tier_index))
            tier_index += 1

        return tiers

    # ============ LEGACY COMPATIBILITY ============
    # Minimal compatibility layer for existing code that may call old methods

    def add_hot(self, content: str, source: str = "task", tags: list = None,
                task_ids: list = None, agent: str = None, outcome: str = None):
        """Legacy method - appends to tier 0."""
        timestamp = datetime.now().isoformat()
        entry_line = f"[{timestamp}] {source}"
        if agent:
            entry_line += f" ({agent})"
        entry_line += f": {content}"
        if tags:
            entry_line += f" #{' #'.join(tags)}"

        self.append_to_tier(0, entry_line, {
            "last_source": source,
            "last_agent": agent,
            "last_outcome": outcome,
        })


# ============ BACKFILL UTILITIES (T280) ============

def _scan_log_files(logs_dir: Path, exclude_today: bool) -> list[Path]:
    """Find log files to process, optionally excluding today's log."""
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    log_files = sorted(logs_dir.glob("*.json"))
    if exclude_today:
        log_files = [f for f in log_files if today not in f.name]
    return log_files


def _parse_log_entries(log_files: list[Path]) -> tuple[list[dict], int]:
    """Parse log files into formatted entries. Returns (entries, files_processed)."""
    all_entries = []
    files_processed = 0

    for log_file in log_files:
        try:
            with open(log_file, encoding="utf-8") as f:
                entries = json.load(f)
                if isinstance(entries, list):
                    for entry in entries:
                        ts = entry.get("timestamp", "")
                        speaker = entry.get("speaker", "unknown")
                        message = entry.get("message", "")

                        # Truncate very long messages
                        if len(message) > 500:
                            message = message[:500] + "..."

                        # Extract time portion
                        time_str = ts[11:16] if len(ts) >= 16 else ts
                        formatted = f"[{time_str}] {speaker}: {message}"
                        all_entries.append({
                            "date": log_file.stem,
                            "formatted": formatted,
                            "raw": entry
                        })
                    files_processed += 1
        except (json.JSONDecodeError, IOError) as e:
            print(f"[Backfill] Error reading {log_file}: {e}")

    return all_entries, files_processed


def _build_daily_summaries(entries_by_day: dict[str, list[str]]) -> list[str]:
    """Build daily summary entries with key lines extracted."""
    KEY_WORDS = ['task', 'completed', 'created', 'approved', 'error', 'fix',
                 'implement', 'design', 'decision', '→', 'done', 'ready']
    tier_1_content = []

    for day in sorted(entries_by_day.keys()):
        day_entries = entries_by_day[day]
        day_summary = f"=== {day} ({len(day_entries)} messages) ===\n"

        # Extract key lines (decisions, completions, task references)
        key_lines = [line for line in day_entries
                     if any(kw in line.lower() for kw in KEY_WORDS)]

        # Limit key lines per day
        if len(key_lines) > 30:
            key_lines = key_lines[:15] + [f"... ({len(key_lines) - 30} more) ..."] + key_lines[-15:]

        day_summary += "\n".join(key_lines) if key_lines else "(no key events)"
        tier_1_content.append(day_summary)

    return tier_1_content


def backfill_memory_from_logs(exclude_today: bool = True, dry_run: bool = False) -> dict:
    """Backfill memory tiers from historical data/logs/*.json.

    Simulates what tiers would look like if AC-Memory had been running.
    - Reads logs chronologically (oldest first)
    - Batches entries into tier_1, tier_2, etc.
    - Uses default compression (extracts key lines)
    - Does NOT modify tier_0.json (live working memory)

    Args:
        exclude_today: Skip today's log file (still being written)
        dry_run: If True, returns stats without writing files

    Returns:
        Dict with backfill stats: files processed, entries, tiers created
    """
    from datetime import datetime

    logs_dir = Path(__file__).parent.parent.parent / "data" / "logs"

    # Find log files
    log_files = _scan_log_files(logs_dir, exclude_today)
    if not log_files:
        return {"status": "no_logs", "files": 0, "entries": 0}

    # Collect all historical entries
    all_entries, files_processed = _parse_log_entries(log_files)

    if dry_run:
        return {
            "status": "dry_run",
            "files": files_processed,
            "entries": len(all_entries),
            "first_date": log_files[0].stem if log_files else None,
            "last_date": log_files[-1].stem if log_files else None,
        }

    # Group entries by day for tier structuring
    entries_by_day: dict[str, list[str]] = {}
    for entry in all_entries:
        day = entry["date"]
        if day not in entries_by_day:
            entries_by_day[day] = []
        entries_by_day[day].append(entry["formatted"])

    # Build tier content
    tier_1_content = _build_daily_summaries(entries_by_day)
    tier_1_text = "\n---\n".join(tier_1_content)

    tier_1 = TierData(
        tier_index=1,
        accumulated_a=tier_1_text,
        summary_b="",
        metadata={
            "backfill": True,
            "source_dates": sorted(entries_by_day.keys()),
            "total_source_entries": len(all_entries),
        },
        compression_count=0,
    )
    tier_1.last_updated = datetime.now().isoformat()

    tier_1_path = MEMORY_DIR / "tier_1.json"
    with open(tier_1_path, "w", encoding="utf-8") as f:
        json.dump(tier_1.to_dict(), f, indent=2, ensure_ascii=False)

    print(f"[Backfill] Created tier_1.json: {len(tier_1_text)} chars from {len(entries_by_day)} days")

    # Check if tier_1 needs compression to tier_2
    tiers_created = 1
    if tier_1.needs_compression():
        manager = MemoryManager()
        manager._tier_cache[1] = tier_1
        summary = manager._default_compress(tier_1.accumulated_a, 1)

        tier_2 = TierData(
            tier_index=2,
            accumulated_a=f"[Backfill] Historical tier_1 compression:\n{summary}",
            summary_b="",
            metadata={"backfill": True, "source": "tier_1_compression"},
            compression_count=0,
        )
        tier_2.last_updated = datetime.now().isoformat()

        tier_2_path = MEMORY_DIR / "tier_2.json"
        with open(tier_2_path, "w", encoding="utf-8") as f:
            json.dump(tier_2.to_dict(), f, indent=2, ensure_ascii=False)

        print(f"[Backfill] Created tier_2.json: {len(tier_2.accumulated_a)} chars")
        tiers_created = 2

    return {
        "status": "success",
        "files_processed": files_processed,
        "total_entries": len(all_entries),
        "days_covered": sorted(entries_by_day.keys()),
        "tier_1_size": len(tier_1_text),
        "tiers_created": tiers_created,
    }


# Global memory manager
memory_manager = MemoryManager()
