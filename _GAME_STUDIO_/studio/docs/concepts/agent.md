# Agent

An AI worker defined by a folder containing its role, config, and capabilities.

## Structure

```
studio/agents/{agent_name}/
├── role.md        # Core persona, rules, workflow
├── config.json    # Name, title, color, model settings
├── memory.json    # Persistent memory (if used)
├── skills/        # Agent-specific skills
├── tools.py       # Agent-specific tools (optional)
└── __init__.py
```

## Config Schema

```json
{
  "name": "Designer",
  "title": "Game Designer",
  "color": "#4a9eff",
  "model": "claude"
}
```

## Properties

| Property | Description |
|----------|-------------|
| name | Display name |
| title | Role description |
| color | UI color for messages |
| is_boss | True only for BOSS agent |
| skills | Loaded from skills/ folder |
| tools | Loaded from tools.py |

## Context Building

When an agent responds, context is assembled:
1. System prompt (role.md + all skills)
2. Scoped messages from Hub
3. Agent's assigned tasks
4. Trigger message

## Employee vs BOSS

| Aspect | BOSS | Employees |
|--------|------|-----------|
| Hub access | All messages | Mentions + BOSS messages |
| Task access | All tasks | Own tasks only |
| Tools | create_task, get_task_status | pick_task, complete_task |

## Relationships

- Receives **Tasks** from **BOSS**
- Posts to **Hub**
- Uses **Skills** for context
- May have custom **Tools**
