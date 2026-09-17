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

## BOSS vs Workers

| Aspect | BOSS | Workers |
|--------|------|---------|
| Backend | BossCLI (Haiku) | FleetCLI (Sonnet) |
| Session | Dedicated, 150K threshold | Shared, 150K threshold |
| Hub access | All messages | Mentions + BOSS messages |
| Task access | All tasks | Own tasks only |
| MCP Tools | create_task, create_routine, get_task_status, recall_memory | search_code, read_lines, edit_file, write_report |
| Claude Tools | None | Bash (all), WebSearch (Research only) |

## Relationships

- Receives **Tasks** from **BOSS**
- Posts to **Hub**
- Uses **Skills** for context
- May have custom **Tools**
