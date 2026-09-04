# Data Accumulation

What gets logged and why.

## Current Logging

| Category | Storage | Retention |
|----------|---------|-----------|
| Hub messages | `data/hub_history.json` | Last 200 messages |
| Tasks | `data/tasks.json` | All tasks until cleared |
| Reports | `reports/` folder | Permanent |

## Task Data Captured

- id, description, assignee
- status transitions
- result output
- review notes
- timestamps (created, started, completed)

## Future: Token Tracking

Not yet implemented. Would add:
- tokens_spent per task
- context_injected (what skills/assets)
- duration

## Future: Metrics Aggregation

Not yet implemented. Would add:
- tokens per task type
- success rates by agent
- average task duration
- review rejection rates

## Principles

- **Log raw first** - Store everything, aggregate later
- **Timestamps on all** - Every record has created_at
- **Clear completed** - `/api/tasks/clear-completed` for cleanup
- **Reports are permanent** - Agent outputs saved to `reports/`
