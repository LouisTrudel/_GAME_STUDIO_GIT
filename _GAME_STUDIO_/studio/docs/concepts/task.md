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
| result | Output produced by agent |
| error | Error message if failed |
| created_at | Timestamp |
| started_at | When picked up |
| completed_at | When finished |

## Lifecycle

```
PENDING → READY → IN_PROGRESS → APPROVED
   ↓
BLOCKED (if dependency fails)

IN_PROGRESS → FAILED (if agent fails)
IN_PROGRESS → ERROR (timeout, malformed task, etc.)
```

No review gate. Tasks complete directly to approved.

## Storage

Tasks persist to `data/tasks.json` with auto-save on changes.

## Relationships

- Created by **BOSS**
- Assigned to one **Agent**
- May depend on other **Tasks**
- Results posted to **Hub**
