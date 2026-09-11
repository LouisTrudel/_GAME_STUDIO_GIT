## Summary

Dependency chains T538→T539→T540 and T545→T546→T547 got stuck because when the head task (T538/T545) entered ERROR status, `_block_dependents()` was called which blocked T539/T546 — but these tasks **stayed permanently blocked** because there is no recovery mechanism when the parent task remains in ERROR state.

The dependency resolution logic in `_update_dependents()` (lines 1051-1085) only triggers when a task **completes successfully** (APPROVED), never when it enters ERROR/FAILED.

## Findings

| Finding | Evidence | Action |
|---------|----------|--------|
| `set_error()` calls `_block_dependents()` but never `_update_dependents()` | tasks.py:811 | ERROR tasks should either retry or propagate failure to unblock chain |
| `_update_dependents()` only called in `complete_task()` | tasks.py:778 | Add call in error recovery path or auto-fail dependent tasks |
| T538/T545 both hit `'PersistentClaudeCLI' object has no attribute '_tool_use_count'` | logs:1460,1754 | Backend bug causes ERROR, cascades to permanent BLOCKED |
| T539/T546 blocked but never transitioned | logs:1460 "Blocked 1 dependent tasks" | No mechanism to unblock when parent stays ERROR |

## Recommendation

**Option A (Fail-fast)**: When head task enters ERROR, auto-fail all dependent tasks instead of leaving them BLOCKED. This surfaces the failure immediately.

```python
# In set_error() after _block_dependents():
self._fail_dependents(task_id, f"Dependency {task_id} failed")
```

**Option B (Retry-aware)**: Keep BLOCKED but add retry logic that unblocks dependents when parent task is retried and succeeds. Currently `_update_dependents()` checks PENDING/BLOCKED but never gets called after retry.

**Recommended: Option A** — BLOCKED tasks with no path to resolution are worse than clear failures. Users can retry the entire chain if needed.

## Root Cause Traceability

```
T538 starts → ERROR (backend bug) → _block_dependents(T538)
T539 → BLOCKED (waiting for T538)
T540 → stays PENDING (waiting for T539)

No mechanism triggers:
- _update_dependents() only called on APPROVED
- No retry mechanism for ERROR tasks
- No fail-cascade for BLOCKED tasks
```

## Sources
- studio/core/tasks.py:778 — `_update_dependents()` only in complete_task()
- studio/core/tasks.py:811 — `set_error()` calls `_block_dependents()` only
- studio/core/tasks.py:1051-1085 — `_update_dependents()` logic
- data/logs/studio_2026-09-11.log:1460 — T538 error → T539 blocked
- data/logs/studio_2026-09-11.log:1754 — T545 error → T546 blocked
