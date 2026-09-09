# Game Studio MCP Server Setup

This converts your custom tools into **real MCP tools** that Claude CLI enforces at the protocol level.

## Why MCP?

| Approach | Tool Enforcement | Cost | LLM Support |
|----------|------------------|------|-------------|
| `<tool>` tags | None (just text) | Free | Any |
| Instructor | Guaranteed | API costs | Any with tool support |
| **MCP** | **Guaranteed** | **Free (Pro sub)** | **Claude CLI + growing** |

MCP gives you guaranteed tool execution while staying on your Pro subscription.

## Setup Steps

### 1. Install MCP SDK

```bash
pip install "mcp[cli]"
```

### 2. Test the Server

```bash
cd C:\Users\lou\__MY_WORK__\_GAME_STUDIO_GIT\_GAME_STUDIO_
mcp dev mcp_server.py
```

This opens the MCP Inspector in your browser where you can test tools interactively.

### 3. Configure Claude

Add to your Claude settings file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "game-studio": {
      "command": "python",
      "args": ["C:/Users/lou/__MY_WORK__/_GAME_STUDIO_GIT/_GAME_STUDIO_/mcp_server.py"]
    }
  }
}
```

### 4. Restart Claude

Fully quit and restart Claude Desktop/CLI for changes to take effect.

### 5. Verify

In Claude, you should now see the game-studio tools available. Try:
- "Use create_task to assign a task to Designer"
- "Use list_routines to show all routines"

## Available Tools

### BOSS Tools
- `create_task` - Delegate work to agents
- `get_task_status` - Check task progress
- `read_context` - Load project CONTEXT.md
- `acknowledge` - Confirm receipt
- `create_suggestion` - Surface patterns for review
- `add_discussion` - Comment on suggestions
- `recall_memory` - Search memory tiers
- `git_commit` - Commit changes

### Employee Tools
- `get_my_tasks` - Get assigned tasks
- `log_step` - Log progress checkpoint
- `signal_agent` - Cross-agent communication

### QA Tools
- `report_bug` - Report bugs with severity
- `check_files` - Verify deliverables exist
- `test_summary` - Submit test results

### Routine Tools
- `create_routine` - Create scheduled workflow
- `list_routines` - Show all routines
- `get_routine` - Get routine details
- `pause_routine` / `resume_routine` / `delete_routine`

### Taxonomy Tools
- `analyze_naming` - Check naming consistency
- `suggest_conventions` - Propose standards
- `report_issue` - Report naming issues

### Context Tools
- `count_tokens` - Check token budgets
- `list_roles` - List agent roles
- `update_session_memory` - Update session summary

### File Tools
- `write_report` - Save long documents
- `read_file` - Read saved reports
- `list_reports` - List all reports

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude CLI                              │
│                         │                                    │
│    "create_task for Designer: fix the bug"                  │
│                         │                                    │
│                         ▼                                    │
│    ┌─────────────────────────────────────────┐              │
│    │           MCP Protocol                   │              │
│    │   (real tool call, not text suggestion) │              │
│    └─────────────────────────────────────────┘              │
│                         │                                    │
│                         ▼                                    │
│    ┌─────────────────────────────────────────┐              │
│    │       mcp_server.py                      │              │
│    │   create_task() → boss/tools.py          │              │
│    │   report_bug() → qa/tools.py             │              │
│    │   etc.                                   │              │
│    └─────────────────────────────────────────┘              │
│                         │                                    │
│                         ▼                                    │
│              Your existing handlers                          │
│         (task_manager, hub, schedules, etc.)                │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### "Module not found" errors
Make sure you're running from the project directory:
```bash
cd C:\Users\lou\__MY_WORK__\_GAME_STUDIO_GIT\_GAME_STUDIO_
python mcp_server.py
```

### Tools not showing in Claude
1. Check config path is correct (use forward slashes on Windows)
2. Fully restart Claude (not just close window)
3. Check Claude logs for MCP errors

### Testing tools manually
```bash
mcp dev mcp_server.py
```
Opens browser UI to test each tool.
