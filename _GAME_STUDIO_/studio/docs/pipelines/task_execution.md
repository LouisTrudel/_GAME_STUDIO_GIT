# Task Execution Pipeline

How tasks get done.

## Flow

```
task_tick_loop finds ready task
            ↓
   Agent.respond() triggered
            ↓
   Agent sees task in context
            ↓
   Agent calls pick_task
            ↓
   Status → in_progress
            ↓
   Agent works, calls complete_task
            ↓
   Status → completed
            ↓
   Awaits BOSS review
```

## Steps

1. **Ready task found** - `task_tick_loop` checks every 3s
2. **Agent triggered** - `agent.respond("Task X is ready...")`
3. **Agent sees context** - Their tasks, relevant Hub messages
4. **pick_task** - Agent claims task, status → `in_progress`
5. **Agent works** - Performs the task
6. **complete_task** - Agent submits result, status → `completed`
7. **Hub post** - Agent's output visible to all
8. **Await review** - Task queued for BOSS

## Employee Tools

```python
# Task tools
get_my_tasks()                    # List assigned tasks
pick_task(task_id)                # Claim a ready task
complete_task(task_id, result)    # Submit work

# Skill tools
load_skill(skill_path)            # Load skill into context (e.g., ":code/roblox/client")
list_skills(category)             # List available skills in category
```

## Error Handling

| Error | Action |
|-------|--------|
| Agent exception | Error logged to Hub, task stays in_progress |
| Timeout | Manual intervention needed |
| Bad output | BOSS will reject in review |

## Logging

- Task timestamps updated (started_at)
- Agent messages in Hub
- Task result stored
