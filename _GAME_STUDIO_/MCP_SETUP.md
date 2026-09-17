# Game Studio MCP Server Setup

MCP tools enforced at protocol level via Claude CLI.

## Setup

### 1. Install MCP SDK

```bash
pip install "mcp[cli]"
```

### 2. Test the Server

```bash
cd C:\Users\lou\__MY_WORK__\_GAME_STUDIO_GIT\_GAME_STUDIO_
mcp dev mcp_server.py
```

### 3. Configure Claude

The `.claude/settings.json` in this project configures the MCP server automatically.

## Available Tools (8 total)

### BOSS Tools (delegation)
| Tool | Description |
|------|-------------|
| `create_task` | Delegate work to agents |
| `create_routine` | Create scheduled workflows |
| `get_task_status` | Check task progress |
| `recall_memory` | Search memory tiers |

### Worker Tools (execution)
| Tool | Description |
|------|-------------|
| `search_code` | Search code in files |
| `read_lines` | Read specific line ranges |
| `edit_file` | Replace content in files |
| `write_report` | Save reports to reports/ |

### Claude Built-in Tools
- `Bash` - All workers
- `WebSearch` - Research agent only

## Architecture

```
Claude CLI
    │
    ▼
--allowedTools flag
    │
    ▼
MCP Protocol (mcp_server.py)
    │
    ▼
Tool handlers (boss/tools.py, core/file_tools.py)
```

## Troubleshooting

### Tools not available
Check `.claude/settings.json` has the correct MCP server path.

### Testing tools
```bash
mcp dev mcp_server.py
```
Opens browser UI to test each tool interactively.
