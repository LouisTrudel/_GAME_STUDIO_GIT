# Agent Deletion Pipeline

How agents are removed from the studio.

## Flow

```
Verify agent has no active tasks
            ↓
   Delete or archive folder
            ↓
   Restart server
```

## Steps

1. **Check tasks** - Ensure no in_progress tasks assigned
2. **Cancel pending** - Cancel any pending tasks for this agent
3. **Archive option** - Move folder to `studio/agents/_archive/`
4. **Delete option** - Remove folder entirely
5. **Restart server** - Agent no longer discovered

## Pre-Deletion Checklist

- [ ] No in_progress tasks
- [ ] Pending tasks reassigned or cancelled
- [ ] Skills worth keeping moved to shared
- [ ] Memory.json backed up if valuable

## Archive vs Delete

| Action | Use When |
|--------|----------|
| Archive | Might need agent again, preserve history |
| Delete | Agent was experimental, no value |

## Manual Process

Currently no API for this. Manual steps:
1. Check `/api/tasks` for agent's tasks
2. Cancel via `/api/tasks/{id}/cancel`
3. Delete/move folder
4. Restart server

## Future

Could add:
- `/api/agents/{name}/delete` endpoint
- Automatic task reassignment
- Archive with timestamp
