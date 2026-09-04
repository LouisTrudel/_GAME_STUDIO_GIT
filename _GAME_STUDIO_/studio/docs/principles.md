# Principles

Core constraints governing the studio.

## Context Efficiency

1. **Minimal injection** - Only inject skills and assets needed for the task
2. **Skills are small** - Prefer multiple focused skills over monolithic ones
3. **role.md stays lean** - Agent core context should be under 100 lines

## Data Integrity

4. **Everything timestamped** - All events, tasks, and outputs include timestamps
5. **Everything logged** - No silent operations; all work feeds Data Accumulation
6. **State lives in /data** - Agents are stateless; persistence is centralized

## Human Authority

7. **Human approves destructive ops** - Deletions, overwrites require confirmation
8. **Escalate uncertainty** - When confidence is low, ask rather than guess
9. **Human is final reviewer** - Self-improvement proposals require human approval

## Operational

10. **Python for deterministic work** - Save tokens; use scripts for simple tasks
11. **One agent, one task** - No parallel task assignment per agent
12. **Fail fast, log fully** - On error, stop and record everything for diagnosis
