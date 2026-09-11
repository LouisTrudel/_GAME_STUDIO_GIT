# Routine Agent Analysis Report

## Summary

The Routine agent is **vestigial**. Server handles all routine execution; the agent exists only to provide tool schemas that are now exposed via MCP. **Recommendation: Remove the agent, keep only the tools module.**

---

## Key Findings

| Finding | Evidence | Implication |
|---------|----------|-------------|
| Server executes routines | `broadcast.py:172-180` - `_schedule_tick_loop()` calls `schedule_manager.tick()` every 5s | No agent involvement in execution |
| Tools exposed via MCP | `mcp_server.py:243-296` imports directly from `routine/tools.py` | Tools work without the agent |
| Agent never assigned tasks | No `assignee: Routine` in task archives | Agent persona unused |
| Duplicate functionality | Server routes + WebSocket + MCP all expose same CRUD | Tools layer is canonical |

---

## Architecture Flow

```
Routine Creation:
  UI → WebSocket → schedule_manager.create() → schedules.json

Routine Execution:
  Server startup → _schedule_tick_loop() → schedule_manager.tick()
    → Creates agent tasks OR runs script module
    → Assigned agents execute tasks (never "Routine" agent)

Tool Access:
  Claude Code → MCP → mcp_server.py → routine/tools.py → schedule_manager
```

---

## Alternatives Analysis

| Option | Pros | Cons |
|--------|------|------|
| **A. Remove agent, keep tools** (Recommended) | Clean architecture, tools still work via MCP | Minor refactor |
| B. Keep agent, add capabilities | Could add monitoring/adjustment | Adds complexity, overlaps with BOSS |
| C. Keep status quo | No effort | Vestigial code, confusion |

---

## Recommendations

1. **Delete `studio/agents/routine/` directory**
   - Keep `tools.py` content, move to `studio/core/routine_tools.py` if needed
   - MCP imports will need path update

2. **Update MCP imports**
   - Change from `from studio.agents.routine.tools import...` to new location

3. **No functional loss**
   - All routine CRUD continues working via server routes and MCP
   - Execution continues via `_schedule_tick_loop()`

---

## Files Analyzed

- `studio/agents/routine/` - Agent definition (vestigial)
- `studio/core/schedules.py` - Core schedule logic (canonical)
- `server_modules/broadcast.py` - Server execution loops
- `mcp_server.py` - MCP tool exposure
- `studio-routines.js` - Frontend UI

---

## Decision

**REMOVE** - The Routine agent adds no value. Tools are the only useful artifact, and they're already accessed directly via MCP without invoking the agent.
