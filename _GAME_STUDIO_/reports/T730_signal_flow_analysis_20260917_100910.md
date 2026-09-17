# T730: Signal Flow Analysis - Why T729 Shows in_progress Despite Completion

## Findings

### Given
T729 was assigned to Frontend agent and executed via FleetCLI backend.

### When
- Task started: 2026-09-17T10:00:16.404825
- Task completed: 2026-09-17T10:03:21.654876
- Agent response included: "T729 COMPLETED: Replaced multi-terminal agent monitor with single unified terminal displaying all agent chatter from history"

### Signal Flow (Normal Path)
```
1. studio.py:618 - agent.respond(full_prompt)
2. studio.py:643 - _handle_successful_task(task_id, agent_name, response, usage, quality_metrics)
3. studio.py:661 - task_manager.complete_task(task_id, response, friction_events)
4. tasks.py:813 - task.status = TaskStatus.APPROVED
5. tasks.py:815 - task.completed_at = datetime.now()
6. tasks.py:818 - self._save_tasks()  # Atomic JSON write
```

### Then (BUG FOUND)
**Status persisted in data/tasks.json:**
- Line 425: `"status": "in_progress"`  ❌
- Line 432: `"completed_at": "2026-09-17T10:03:21.654876"`  ✓

**Root Cause:** Status field was NOT updated to "approved" despite:
1. completed_at timestamp being set correctly
2. Agent response showing successful completion
3. complete_task() being called (evident from completed_at being set)

### Bug Signature
```python
# In studio/core/tasks.py:813
task.status = TaskStatus.APPROVED  # Sets in-memory enum
# In studio/core/tasks.py:818
self._save_tasks()  # Should persist to disk via atomic_json_write
```

**The status update to APPROVED was lost between in-memory update and disk persistence.**

## Hypothesis
Two possible failure modes:

### 1. Race Condition (Most Likely)
- FleetCLI uses shared session with threading.Lock
- Another thread may have called `_save_tasks()` between status update and save
- OR: `_sync_tasks_from_disk()` overwrote the APPROVED status from stale disk state

### 2. Serialization Bug
- Task.to_dict() may not be serializing the TaskStatus enum correctly
- The enum value might be getting lost during JSON conversion

## Evidence Supporting Race Condition
```python
# tasks.py:605-625 - _sync_tasks_from_disk()
for task_data in data.get("tasks", []):
    disk_status = task_data.get("status")
    mem_status = self.tasks[task_id].status.value
    if disk_status and disk_status != mem_status:
        # Status changed on disk - update in memory
        self.tasks[task_id].status = TaskStatus(disk_status)
        logger.info("Synced status change: %s %s -> %s", task_id, mem_status, disk_status)
```

**If `_sync_tasks_from_disk()` runs AFTER status is set to APPROVED but BEFORE `_save_tasks()` completes, it would overwrite APPROVED back to in_progress.**

## Next Steps to Verify
1. Check if Task.to_dict() properly serializes TaskStatus enum
2. Check if there's any logging around "Synced status change" for T729
3. Verify thread safety of complete_task() -> _save_tasks() sequence
4. Check if multiple processes/threads are calling _save_tasks() concurrently
