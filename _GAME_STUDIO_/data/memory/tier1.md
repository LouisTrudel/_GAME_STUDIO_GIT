# AC-Memory Tier 1: Recent Work

## [ACTIVE] System Safeguards
- Loop prevention: compression lock, 60s cooldown, 10/hour limit
- Hub skips Writer/Context messages (prevents input→output loop)

## [ACTIVE] BOSS Optimization (Sept 12)
- BOSS prompt: role.md + hub (24 chars) + friction (UNRESOLVED) + request
- Trigger suffix: "Use your studio to help the client."
- Session threshold: 100K tokens before clear
- Removed: purpose block, memory tiers injection
- Tools: Added routine tools to BOSS (create/list/pause/resume/delete)
- Removed: acknowledge tool

## [ACTIVE] Pending Suggestions
- S037: Fast-path mode for single-session tasks
- S034: Agent chat not triggering compaction
- S033: Auto-generate task queue from whitepaper

## [DONE] Recent Fixes (Sept 11-12)
- T618: Fixed REINIT_AFTER_TASKS attribute
- T609: Implemented task cancellation with graceful shutdown
- T535: Fixed reader thread buffering (live token stream delay)
- T536: Fixed _update_dependents for dependency chains
- T553: Fixed dependency resolution to check archived tasks
