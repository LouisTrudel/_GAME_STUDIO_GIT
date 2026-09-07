"""
Suggestion System for the Learning Tab.

Agents create suggestions for human review. Suggestions can be:
- approved: Human approves, may create follow-up task
- rejected: Archived, no action
- implemented: Approved and acted upon

Categories: process, architecture, tooling, workflow, documentation
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from pathlib import Path
import json


SUGGESTIONS_FILE = Path(__file__).parent.parent.parent / "data" / "suggestions.json"


class SuggestionStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    IMPLEMENTED = "implemented"


VALID_CATEGORIES = {"process", "architecture", "tooling", "workflow", "documentation", "new_skill", "feature"}


@dataclass
class Suggestion:
    id: str
    source_agent: str
    title: str
    content: str
    category: str
    status: SuggestionStatus = SuggestionStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    # Context (optional)
    related_tasks: list[str] = field(default_factory=list)
    files_mentioned: list[str] = field(default_factory=list)
    evidence: Optional[str] = None
    # Decision fields
    decision: Optional[str] = None  # "approved" or "rejected"
    decided_at: Optional[datetime] = None
    decided_by: Optional[str] = None
    decision_notes: Optional[str] = None
    # Implementation tracking
    implementation_tasks: list[str] = field(default_factory=list)  # Task IDs created by Boss
    # User rating (0-5 stars, set on approval)
    rating: Optional[int] = None
    # Deferred review
    kept_for_later: bool = False
    deferred_at: Optional[datetime] = None
    # Discussion history (Research agent findings for Accept workflow)
    discussion_history: list[dict] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "source_agent": self.source_agent,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "related_tasks": self.related_tasks,
            "files_mentioned": self.files_mentioned,
            "evidence": self.evidence,
            "decision": self.decision,
            "decided_at": self.decided_at.isoformat() if self.decided_at else None,
            "decided_by": self.decided_by,
            "decision_notes": self.decision_notes,
            "implementation_tasks": self.implementation_tasks,
            "rating": self.rating,
            "kept_for_later": self.kept_for_later,
            "deferred_at": self.deferred_at.isoformat() if self.deferred_at else None,
            "discussion_history": self.discussion_history,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Suggestion":
        # Handle legacy field names with fallbacks
        # Legacy: type -> category, rationale -> content, created -> created_at
        category = data.get("category") or data.get("type", "process")
        content = data.get("content") or data.get("rationale", "")
        source_agent = data.get("source_agent", "unknown")

        # Parse created_at with fallback to legacy 'created' field
        created_at_str = data.get("created_at") or data.get("created")
        if created_at_str:
            try:
                created_at = datetime.fromisoformat(created_at_str)
            except ValueError:
                # Handle date-only format like "2026-09-05"
                created_at = datetime.strptime(created_at_str, "%Y-%m-%d")
        else:
            created_at = datetime.now()

        return cls(
            id=data["id"],
            source_agent=source_agent,
            title=data["title"],
            content=content,
            category=category,
            status=SuggestionStatus(data["status"]),
            created_at=created_at,
            related_tasks=data.get("related_tasks", []),
            files_mentioned=data.get("files_mentioned", []),
            evidence=data.get("evidence"),
            decision=data.get("decision"),
            decided_at=datetime.fromisoformat(data["decided_at"]) if data.get("decided_at") else None,
            decided_by=data.get("decided_by"),
            decision_notes=data.get("decision_notes"),
            implementation_tasks=data.get("implementation_tasks", []),
            rating=data.get("rating"),
            kept_for_later=data.get("kept_for_later", False),
            deferred_at=datetime.fromisoformat(data["deferred_at"]) if data.get("deferred_at") else None,
            discussion_history=data.get("discussion_history", []),
        )


class SuggestionManager:
    """Manages suggestion lifecycle."""

    MAX_PENDING = 50
    RETENTION_REJECTED_DAYS = 7
    RETENTION_APPROVED_DAYS = 30

    def __init__(self):
        self.suggestions: dict[str, Suggestion] = {}
        self._counter = 0
        self._load()

    def _load(self):
        """Load suggestions from file."""
        if SUGGESTIONS_FILE.exists():
            try:
                with open(SUGGESTIONS_FILE, encoding="utf-8") as f:
                    data = json.load(f)
                for item in data.get("suggestions", []):
                    suggestion = Suggestion.from_dict(item)
                    self.suggestions[suggestion.id] = suggestion
                self._counter = data.get("counter", 0)
                print(f"[Suggestions] Loaded {len(self.suggestions)} suggestions")
            except Exception as e:
                print(f"[Suggestions] Failed to load: {e}")

    def _save(self):
        """Save suggestions to file."""
        try:
            SUGGESTIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
            data = {
                "counter": self._counter,
                "suggestions": [s.to_dict() for s in self.suggestions.values()]
            }
            with open(SUGGESTIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"[Suggestions] Failed to save: {e}")

    def create(
        self,
        source_agent: str,
        title: str,
        content: str,
        category: str,
        related_tasks: list[str] = None,
        files_mentioned: list[str] = None,
        evidence: str = None,
    ) -> Suggestion:
        """Create a new suggestion."""
        # Validate category
        if category not in VALID_CATEGORIES:
            raise ValueError(f"Invalid category '{category}'. Must be one of: {VALID_CATEGORIES}")

        # Enforce limits
        title = title[:80]
        content = content[:500]

        self._counter += 1
        suggestion_id = f"S{self._counter:03d}"

        suggestion = Suggestion(
            id=suggestion_id,
            source_agent=source_agent,
            title=title,
            content=content,
            category=category,
            related_tasks=related_tasks or [],
            files_mentioned=files_mentioned or [],
            evidence=evidence,
        )

        self.suggestions[suggestion_id] = suggestion
        self._save()

        # Auto-archive oldest if over limit
        self._enforce_pending_limit()

        print(f"[Suggestions] Created {suggestion_id}: {title[:40]}...")
        return suggestion

    def get(self, suggestion_id: str) -> Optional[Suggestion]:
        """Get a suggestion by ID."""
        return self.suggestions.get(suggestion_id)

    def get_all(self, status: str = None) -> list[Suggestion]:
        """Get all suggestions, optionally filtered by status."""
        if status:
            try:
                status_enum = SuggestionStatus(status)
                return [s for s in self.suggestions.values() if s.status == status_enum]
            except ValueError:
                return []
        return list(self.suggestions.values())

    def approve(self, suggestion_id: str, notes: str = None, rating: int = None) -> bool:
        """Approve a suggestion with optional star rating (0-5)."""
        suggestion = self.suggestions.get(suggestion_id)
        if not suggestion or suggestion.status != SuggestionStatus.PENDING:
            return False

        suggestion.status = SuggestionStatus.APPROVED
        suggestion.decision = "approved"
        suggestion.decided_at = datetime.now()
        suggestion.decided_by = "human"
        suggestion.decision_notes = notes[:200] if notes else None
        # Store rating if provided (0-5 range)
        if rating is not None:
            suggestion.rating = max(0, min(5, int(rating)))
        self._save()
        print(f"[Suggestions] Approved {suggestion_id}" + (f" ({suggestion.rating}/5 stars)" if suggestion.rating is not None else ""))
        return True

    def reject(self, suggestion_id: str, notes: str = None) -> bool:
        """Reject a suggestion."""
        suggestion = self.suggestions.get(suggestion_id)
        if not suggestion or suggestion.status != SuggestionStatus.PENDING:
            return False

        suggestion.status = SuggestionStatus.REJECTED
        suggestion.decision = "rejected"
        suggestion.decided_at = datetime.now()
        suggestion.decided_by = "human"
        suggestion.decision_notes = notes[:200] if notes else None
        self._save()
        print(f"[Suggestions] Rejected {suggestion_id}")
        return True

    def mark_implemented(self, suggestion_id: str) -> bool:
        """Mark an approved suggestion as implemented."""
        suggestion = self.suggestions.get(suggestion_id)
        if not suggestion or suggestion.status != SuggestionStatus.APPROVED:
            return False

        suggestion.status = SuggestionStatus.IMPLEMENTED
        self._save()
        print(f"[Suggestions] Implemented {suggestion_id}")
        return True

    def set_implementation_tasks(self, suggestion_id: str, task_ids: list[str]) -> bool:
        """Set the implementation task IDs for an approved suggestion."""
        suggestion = self.suggestions.get(suggestion_id)
        if not suggestion:
            return False

        suggestion.implementation_tasks = task_ids
        self._save()
        print(f"[Suggestions] {suggestion_id} linked to tasks: {task_ids}")
        return True

    def defer(self, suggestion_id: str) -> bool:
        """Mark a suggestion as kept for later, moving it to the bottom of the list."""
        suggestion = self.suggestions.get(suggestion_id)
        if not suggestion or suggestion.status != SuggestionStatus.PENDING:
            return False

        suggestion.kept_for_later = True
        suggestion.deferred_at = datetime.now()
        self._save()
        print(f"[Suggestions] Deferred {suggestion_id}")
        return True

    def add_discussion(self, suggestion_id: str, agent: str, content: str) -> bool:
        """Add a discussion entry to a suggestion's history."""
        suggestion = self.suggestions.get(suggestion_id)
        if not suggestion:
            return False

        suggestion.discussion_history.append({
            "agent": agent,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        })
        self._save()
        print(f"[Suggestions] Added {agent} discussion to {suggestion_id}")
        return True

    def delete(self, suggestion_id: str) -> bool:
        """Delete a suggestion."""
        if suggestion_id in self.suggestions:
            del self.suggestions[suggestion_id]
            self._save()
            return True
        return False

    def _enforce_pending_limit(self):
        """Auto-archive oldest pending if over MAX_PENDING."""
        pending = [s for s in self.suggestions.values() if s.status == SuggestionStatus.PENDING]
        if len(pending) > self.MAX_PENDING:
            # Sort by created_at, remove oldest
            pending.sort(key=lambda s: s.created_at)
            to_remove = pending[:len(pending) - self.MAX_PENDING]
            for s in to_remove:
                s.status = SuggestionStatus.REJECTED
                s.decision = "auto-archived"
                s.decided_at = datetime.now()
                s.decision_notes = "Auto-archived due to pending limit"
            self._save()

    def cleanup_expired(self) -> int:
        """Remove suggestions past their retention period."""
        now = datetime.now()
        to_remove = []

        for suggestion in self.suggestions.values():
            if suggestion.decided_at:
                age = now - suggestion.decided_at
                if suggestion.status == SuggestionStatus.REJECTED:
                    if age > timedelta(days=self.RETENTION_REJECTED_DAYS):
                        to_remove.append(suggestion.id)
                elif suggestion.status == SuggestionStatus.APPROVED:
                    if age > timedelta(days=self.RETENTION_APPROVED_DAYS):
                        to_remove.append(suggestion.id)

        for sid in to_remove:
            del self.suggestions[sid]

        if to_remove:
            self._save()
            print(f"[Suggestions] Cleaned up {len(to_remove)} expired suggestions")

        return len(to_remove)

    def get_stats(self) -> dict:
        """Get suggestion statistics."""
        stats = {status.value: 0 for status in SuggestionStatus}
        for s in self.suggestions.values():
            stats[s.status.value] += 1
        return stats


# Global suggestion manager
suggestion_manager = SuggestionManager()
