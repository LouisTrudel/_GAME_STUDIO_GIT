# Game Studio

MCP-based multi-agent system for game development.

## Architecture

```
User → BOSS (Haiku) → Workers (Sonnet) → Completion
         ↓                ↓
    Delegation         Execution
```

## Backends (Claude CLI only)

| Backend | Agents | Model | Session |
|---------|--------|-------|---------|
| BossCLI | BOSS | Haiku | Dedicated, 150K threshold |
| FleetCLI | 12 workers | Sonnet | Shared, 150K threshold |
| VanillaCLI | 5 content | Sonnet | Stateless |

## MCP Tools (8 total)

**BOSS** (delegation only):
- `create_task` `create_routine` `get_task_status` `recall_memory`

**Workers** (execution):
- `search_code` `read_lines` `edit_file` `write_report`
- Plus: `Bash` (all), `WebSearch` (Research only)

## Agents (18)

| Tier | Agents |
|------|--------|
| Boss | BOSS |
| Fleet | Code, Frontend, Backend, Audit, Research, Design, Routine, ArtSpec, Prompt, Data, Network, Structure |
| Vanilla | Compression, Text, Image, Audio, Video |
