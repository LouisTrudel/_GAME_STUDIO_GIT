# Schedule

A periodic execution system that triggers automated tasks (routines).

## Types

| Type | Description |
|------|-------------|
| Python | Local scripts run on schedule (file cleanup, data parsing, metrics) |
| Agent | AI tasks triggered on schedule (reviews, proposals, maintenance) |

## Properties

| Property | Description |
|----------|-------------|
| id | Unique identifier |
| type | python, agent |
| schedule | Cron expression or interval |
| action | Script path or task template |
| enabled | Active or paused |
| last_run | Timestamp |
| next_run | Timestamp |

## Examples

- Every hour: Parse accumulated data, update metrics
- Every day: Generate optimization proposals
- Every week: Review skill library effectiveness
- On event: Trigger cleanup after task completion

## Principles

- Python schedules for simple, deterministic work (saves tokens)
- Agent schedules for tasks requiring reasoning
- All schedules logged to Data Accumulation
- Schedules can create Tasks (routed through CEO)

## Relationships

- Creates **Tasks** via task_manager
- Tasks assigned to **Agents** per template
- **BOSS** reviews completed schedule tasks
- Logged to Hub and task history
