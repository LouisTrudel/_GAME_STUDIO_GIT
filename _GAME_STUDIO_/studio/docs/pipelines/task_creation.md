# Task Creation Pipeline

How tasks get created and assigned.

## Flow

```
BOSS decides work needed
          ↓
   create_task tool called
          ↓
   TaskManager.create_task()
          ↓
   Task saved to tasks.json
          ↓
   Broadcast to Interface
          ↓
   task_tick_loop picks up ready tasks
```

## Steps

1. **BOSS analyzes** - User request or heartbeat trigger
2. **BOSS decomposes** - Breaks into tasks with dependencies
3. **create_task called** - For each task:
   - description: what to do
   - assignee: which agent
   - dependencies: task IDs that must complete first
4. **Task created** - ID assigned (T001, T002, ...)
5. **Status set** - `ready` if no dependencies, else `pending`
6. **Saved** - Persisted to `data/tasks.json`
7. **Broadcast** - WebSocket notifies Interface

## BOSS Tool

```python
create_task(
    description="Write the intro dialogue",
    assignee="Writer",
    dependencies=["T001"]  # Optional
)
```

## Dependency Handling

- Tasks with dependencies start as `pending`
- When dependency completes → check if all deps done → set to `ready`
- If dependency fails → dependent tasks become `blocked`

## Logging

- Task record in tasks.json
- BOSS decision visible in Hub
