# Task

A unit of work assigned to an agent.

## States

| State | Description |
|-------|-------------|
| pending | Waiting for dependencies to complete |
| ready | Dependencies met, can be picked up |
| in_progress | Agent is working on it |
| approved | Task finished (no review gate) |
| failed | Could not be completed |
| blocked | Dependency failed, cannot proceed |
| error | Execution error (timeout, malformed, etc.) |

## Schema

| Field | Description |
|-------|-------------|
| id | Unique identifier (T001, T002, ...) |
| description | What needs to be done |
| assignee | Agent name |
| status | Current state |
| dependencies | List of task IDs that must complete first |
| output_response | Agent's response text |
| error | Error message if failed |
| created_at | Timestamp |
| started_at | When picked up |
| completed_at | When finished |
| claimed_by | Which agent/session claimed the task |
| claimed_at | When the task was claimed |

## Lifecycle

```
PENDING → READY → IN_PROGRESS → APPROVED
   ↓
BLOCKED (if dependency fails)

IN_PROGRESS → FAILED (if agent fails)
IN_PROGRESS → ERROR (timeout, malformed task, etc.)
```

No review gate. Tasks complete directly to approved.

## Stale Task Recovery

If a task is `IN_PROGRESS` for more than 35 minutes (30 min timeout + 5 min grace), it's considered stale. The orchestrator automatically resets it to `READY` for re-dispatch.

```
IN_PROGRESS (claimed_at: 35+ min ago)
    ↓
READY (claimed_by: null, claimed_at: null)
```

This handles cases where:
- Agent crashes mid-task
- Network timeout without proper cleanup
- Server restart while task was in progress

## Storage

Tasks persist to `data/tasks.json` with auto-save on changes.

## Relationships

- Created by **BOSS**
- Assigned to one **Agent**
- May depend on other **Tasks**
- Results posted to **Hub**
