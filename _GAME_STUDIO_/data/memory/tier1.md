# AC-Memory Tier 1: Recent Work

## [ACTIVE] Loop Prevention (Critical)
- [ACTIVE] Hub skips Writer/Context messages from accumulation (prevents input→output loop)
- [ACTIVE] Compression lock: `_is_compressing` flag prevents concurrent runs
- [ACTIVE] Cooldown: 60s minimum between compressions
- [ACTIVE] Hourly limit: max 10 compressions/hour
- [ACTIVE] Memory + History both have rate limiting safeguards

## [ACTIVE] Current Tasks
- [ACTIVE] T363: Programmer audit (in_progress) - architecture, code quality, data flows
- [ACTIVE] T364: Designer audit (in_progress) - design patterns, system architecture
- [ACTIVE] T365: QA audit (in_progress) - testing gaps, bug patterns, reliability

## [DONE] Role.md Optimization
- [DONE] All agent role.md files trimmed (50-70 lines each)
- [DONE] Format: bullets/tables > prose, critical rules at START
- [DONE] WHAT at END for recency effect (task injection follows role)
- [DONE] Context agent role updated with position/tables/syntax rules

## [DONE] MCP Integration
- [DONE] Claude CLI uses `--mcp-config` for custom tools
- [DONE] BOSS role.md references "Game-Studio MCP Tools"
- [DONE] Deleted role_base.md (was overriding role.md)
- [DONE] Task format: [CONTEXT] → [FILES] → [CONSTRAINTS] → [WHAT]

## [DONE] Compression Prompts Refactored
- [DONE] AC-Memory: Classification table (ACTIVE/DONE/FRICTION), output sections
- [DONE] History: Table-format prompts per tier (draft/chapter/book/collection)
- [DONE] Writer infinite loop fixed (25+ drafts were generated)

## Pending Suggestions
- [ACTIVE] S037: Fast-path mode for single-session tasks (540x token overhead observed)
- [ACTIVE] S034: Investigate agent chat not triggering compaction
- [ACTIVE] S033: Auto-generate task queue from whitepaper via Taxonomy


---

[2026-09-09 11:46] From tier0:
- [DONE] Comprehensive app audit completed (T363-T365): architecture, code quality, design patterns, QA gaps
- [DONE] Logging refactor: Created `logging_config.py`, converted 80+ print() calls to proper logging levels
- [DONE] Thread safety fixes: Added `threading.Lock()` to `_session_tokens` and `agent_statuses`
- [DONE] Memory system: Added `check_and_compress_all()` and `add_hot()` methods to MemoryManager
- [DONE] Taxonomy audit (T375): Found 5 real bugs across memory, websocket, API layers
- [DONE] Permission skip test (T366) completed successfully
- [DONE] Infinite loop fix confirmed: Writer/Context skip prevents draft flood (64 drafts observed before fix)

---

[2026-09-09 12:52] From tier0:
- [DONE] T376: 66 print() calls converted to logging across 5 files
- [DONE] T373-T375 audit tasks completed with actionable findings
- [DONE] T381: Fixed agent status bugs in broadcast.py (multiple agents clearing all statuses)
- [DONE] T382: First successful MCP task delegation after config fix
- [DONE] MCP config relocated to `../.claude/settings.json` - tools now loading correctly

---

[2026-09-09 13:32] From tier0:
- [DONE] T390: Added imperative trigger words ("fix", "add", "implement") to BOSS role.md for delegation enforcement
- [DONE] T395: Fixed "Run Now" button - now executes routine without changing paused/active state
- [DONE] T396: Routine UI layout reordered - clock + status moved left of title (SCH001 1d Active Title)
- [DONE] T391-T394: Test routine executions confirmed sequential pipeline working
- [DONE] T397: BOSS role.md updated with team identity framing
- [DONE] T398: Error indicator + drag-drop reordering implemented in routine tab
- [DONE] T399: Per-task token tracking with UI display implemented
- [DONE] All 6 deliverables created in data/deliverables/ (T383-T388)

---

[2026-09-09 17:01] From tier0:
- [DONE] Routine tab fixes: constant-width clock display (T403), drag-drop reorder fixed (T404), error indicators
- [DONE] Agents tab: token display accuracy fixed (T405), config modal removed (T407), tab moved to rightmost (T408)
- [DONE] Research confirmed Routine agent vestigial - server handles execution, only tools used (T406)
- [DONE] T404 token analysis: 2.47M tokens/$1.89 caused by Claude Code's agentic context accumulation across 8-12 tool calls, not Studio overhead (T409)
- [DONE] Three-tier context management strategy designed with prioritized roadmap (T410)
- [DONE] Session-based Claude CLI audit confirmed full implementation (T411)

---

[2026-09-09 21:39] From tier0:
- [DONE] Session-based context: deterministic UUIDs (same agent = same UUID), auto-recovery for "already in use" and "not found" errors
- [DONE] T412 fixed 3 session gaps: expired session auto-retry, broken pipe recovery, session validation on send()
- [DONE] Dynamic file tree injection (T402) - reduces 80% wasted orientation tokens
- [DONE] UI token reset working with ↺ button in metrics panel
- [DONE] BOSS token tracking added to UI metrics display (T422)
- [DONE] Duplicate token logging removed from AgentWrapper.respond()
- [DONE] "Failed to fetch" error resilience added to suggestion actions (T424)
- [DONE] Token tracking verified functional across multiple tests (T417, T418, T429)

---

[2026-09-10 19:04] From tier0:
- [DONE] T437: LLM-agnostic retry wrapper added to base.py with exponential backoff (2s→4s→8s) for network errors across all backends
- [DONE] T438: Agents tab updated - auto-sort by tokens, expandable cards with role.md and full token data
- [DONE] T439: Project Chat agent connected to whitepaper drafting
- [DONE] T440: Fixed Project Chat error - was calling non-existent `gemini.chat()` function
- [DONE] T441-T443: Test tasks completed (respond function at line 201, 11 functions in agent.py, first import is `import time`)
- [DONE] Incremental prompt bug fixed - was only sending `## TASK` without actual user message from `## CONTEXT`