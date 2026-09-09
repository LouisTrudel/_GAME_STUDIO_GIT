"""
AC-Memory: Accumulated-Compacted Memory Tier System

Simple markdown-based tiered memory with compression.

Structure:
  memory/
  ├── tier0.md  ← Current session (raw accumulation)
  ├── tier1.md  ← Compressed from tier0
  ├── tier2.md  ← Compressed from tier1
  └── tier3.md  ← Compressed from tier2 (and so on)

Flow:
  Hub chat → tier0 grows → threshold → compress →
  KEEP stays in tier0, PUSH appends to tier1 → tier1 grows → ...
"""

from datetime import datetime
from pathlib import Path
from typing import Optional, Callable

from .paths import get_memory_dir

# Compression callback type
# Takes: content, tier_index, prev_tier_context
# Returns: {keep: str, push: str, friction: str}
CompressCallback = Callable[[str, int, str], dict]

# Size thresholds per tier (characters)
TIER_THRESHOLDS = {
    0: 10_000,      # ~10KB
    1: 50_000,      # ~50KB
    2: 200_000,     # ~200KB
}
DEFAULT_THRESHOLD = 200_000


class MemoryManager:
    """Simple markdown-based tiered memory.

    Each tier is a single .md file. Content accumulates until threshold,
    then compresses: KEEP replaces file, PUSH appends to next tier.
    """

    def __init__(self, project_name: Optional[str] = None):
        self._project_name = project_name
        self._memory_dir = get_memory_dir(project_name)
        self._ensure_dirs()
        self._compress_callback: Optional[CompressCallback] = None

    def set_project(self, project_name: Optional[str]):
        """Switch to a different project's memory."""
        if project_name == self._project_name:
            return
        self._project_name = project_name
        self._memory_dir = get_memory_dir(project_name)
        self._ensure_dirs()
        print(f"[Memory] Switched to project: {project_name or 'default'}")

    def set_compress_callback(self, callback: CompressCallback):
        """Set callback for Context agent compression."""
        self._compress_callback = callback

    def _ensure_dirs(self):
        """Ensure memory directory exists."""
        self._memory_dir.mkdir(parents=True, exist_ok=True)

    def _tier_path(self, index: int) -> Path:
        """Get file path for a tier: tier0.md, tier1.md, etc."""
        return self._memory_dir / f"tier{index}.md"

    # ============ READ/WRITE ============

    def get_tier(self, index: int) -> str:
        """Get content of a tier. Returns empty string if not exists."""
        filepath = self._tier_path(index)
        if filepath.exists():
            return filepath.read_text(encoding="utf-8")
        return ""

    def _write_tier(self, index: int, content: str):
        """Write content to a tier file."""
        filepath = self._tier_path(index)
        filepath.write_text(content, encoding="utf-8")

    def _append_tier(self, index: int, content: str):
        """Append content to a tier file."""
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
        """Append content to a tier. Auto-compresses if threshold exceeded."""
        self._append_tier(index, content)
        size = self.tier_size(index)
        print(f"[Memory] Appended to tier{index}, size: {size}")

        # Auto-compress if needed
        if self.tier_needs_compression(index):
            threshold = self.tier_threshold(index)
            print(f"[Memory] Tier{index} exceeded threshold ({size}/{threshold}), compressing...")
            self.compress_tier(index)

    # ============ COMPRESSION ============

    def compress_tier(self, index: int) -> bool:
        """Compress a tier: KEEP stays, PUSH goes to next tier."""
        content = self.get_tier(index)
        if not content:
            return False

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
                print(f"[Memory] Compression callback failed: {e}")
                result = self._fallback_compress(content)
        else:
            result = self._fallback_compress(content)

        keep = result.get("keep", "")
        push = result.get("push", "")
        friction = result.get("friction", "")

        # Replace current tier with KEEP
        self._write_tier(index, keep)
        print(f"[Memory] Tier{index} compressed: kept {len(keep)} chars")

        # Append PUSH to next tier
        if push:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            push_entry = f"[{timestamp}] From tier{index}:\n{push}"
            self.append(index + 1, push_entry)  # Recursive, may trigger cascade

        # Log friction if any
        if friction:
            self._log_friction(friction)

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
        """Append friction events to friction.md."""
        friction_file = self._memory_dir / "friction.md"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        entry = f"\n## [{timestamp}]\n{friction}\n"

        with open(friction_file, "a", encoding="utf-8") as f:
            f.write(entry)

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

    def get_stats(self) -> dict:
        """Get stats for all existing tiers."""
        stats = {}

        for i in range(20):  # Check up to 20 tiers
            filepath = self._tier_path(i)
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
