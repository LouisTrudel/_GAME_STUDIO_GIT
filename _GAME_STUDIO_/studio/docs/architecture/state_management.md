# State Management

Where data lives and how it persists.

## State Files

| State | Location | Format |
|-------|----------|--------|
| Tasks | `data/tasks.json` | JSON array with counter |
| Hub history | `data/hub_history.json` | JSON array of messages |
| Heartbeats | In-memory (not persisted yet) | Runtime only |

## Task File Structure

```json
{
  "counter": 5,
  "tasks": [
    {
      "id": "T001",
      "description": "...",
      "assignee": "Designer",
      "status": "completed",
      "dependencies": [],
      "result": "...",
      "review_notes": "...",
      "created_at": "2024-01-01T00:00:00",
      "started_at": "...",
      "completed_at": "..."
    }
  ]
}
```

## Hub File Structure

```json
[
  {
    "sender": "user",
    "content": "...",
    "timestamp": "2024-01-01T00:00:00"
  }
]
```

## Principles

- **Auto-save** - Tasks and Hub save on every change
- **JSON for simplicity** - Human-readable, easy to debug
- **Max retention** - Hub keeps last 200 messages
- **Server manages state** - All reads/writes go through managers

## Global Instances

```python
from studio.core.hub import hub
from studio.core.tasks import task_manager
from studio.core.heartbeats import heartbeat_manager
```
