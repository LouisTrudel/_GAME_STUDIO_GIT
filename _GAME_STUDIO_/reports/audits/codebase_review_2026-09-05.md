# Codebase Review - 2026-09-05

## Priority: High

- [x] **Split `studio.html`** `studio.html:2780` → Monolithic HTML file exceeds 1500+ lines **FIXED**
  - Rationale: Single file contained CSS, HTML structure, and extensive JavaScript.
  - **Resolution**: Split into `studio.css` (1468 lines), `studio.js` (1624 lines), `studio.html` (182 lines)

- [x] **Split `server.py`** `server.py:833` → Server exceeds 800-line warning threshold **FIXED**
  - Rationale: Mixes WebSocket handling, HTTP endpoints (30+ routes), broadcast loops (7 background tasks), file operations.
  - **Resolution**: Extracted into `server_modules/routes.py` (427 lines), `server_modules/websocket.py` (99 lines), `server_modules/broadcast.py` (289 lines). Main `server.py` now 90 lines.

- [x] **Split `studio.js`** `studio.js:1624` → **FIXED**
  - Rationale: Single file handling 8+ concerns: WebSocket, tasks UI, routines, suggestions, file explorer, activity bar, modals, agent cards
  - **Resolution**: Split into 7 modules:
    - `studio-core.js` (267 lines) - WebSocket, state, init
    - `studio-ui.js` (154 lines) - DOM helpers, activity indicators
    - `studio-agents.js` (157 lines) - Agent cards, stats, config modal
    - `studio-tasks.js` (388 lines) - Task rendering, filters, metrics
    - `studio-routines.js` (303 lines) - Routine CRUD and rendering
    - `studio-suggestions.js` (195 lines) - Learning tab
    - `studio-files.js` (121 lines) - File explorer

## Priority: Medium

- [ ] **Split `studio/core/tasks.py`** `tasks.py:680` → Approaching 800-line threshold
  - Rationale: TaskManager has 25+ methods. Task dataclass has 26 fields after metrics additions (T106-T108).
  - Files affected: 1
  - **Recommendation**: Extract `Task` dataclass and `TaskStatus` enum to `task_model.py` if growth continues.

- [ ] **Split `_run_with_streaming()`** `agents/backends/claude_cli.py:134-261` → 127 lines
  - Rationale: Complex streaming with thread management, stale detection, and output parsing combined.
  - Files affected: 1
  - **Recommendation**: Extract thread setup to `_setup_output_readers()`, extract monitoring to `_monitor_process()`.

- [ ] **Split `studio/core/studio_metrics.py`** `studio_metrics.py:477` → Growing metrics file
  - Rationale: 477 lines with repetitive `_ensure_*` helper patterns, session tracking + persistent metrics mixed.
  - Files affected: 1
  - **Recommendation**: Split into `session_metrics.py` and `persistent_metrics.py`.

- [ ] **Split `server_modules/routes.py`** `routes.py:427` → Growing route file
  - Rationale: All REST endpoints in single file with nested helper functions (`should_ignore`, `scan_directory`).
  - Files affected: 1
  - **Recommendation**: Split into `routes/tasks.py`, `routes/schedules.py`, `routes/files.py`.

- [ ] **Long function** `studio/studio.py:168-251` → `_run_agent_task()` is 84 lines
  - Rationale: Exceeds 50-line threshold, mixes prompt building, execution, error logging.
  - Files affected: 1
  - **Recommendation**: Extract error prompt logging (lines 216-249) to `_log_error_prompt()`.

## Priority: Low

- [ ] **Inconsistent agent name casing** in task assignment
  - Rationale: "QA"/"Qa"/"qa" all work due to `_find_agent()` case-insensitive lookup.
  - Files affected: 2
  - **Recommendation**: Normalize to canonical names at task creation. Not critical since lookup handles it.

- [ ] **Review `studio/core/employee_tools.py`** `employee_tools.py:394` → Growing tool definitions
  - Rationale: Schema definitions + handlers in same file, approaching 400 lines.
  - Files affected: 1
  - **Recommendation**: Monitor growth. Split if exceeds 500 lines.

- [ ] **Review `studio/agents/taxonomy/tools.py`** `taxonomy/tools.py:346` → Convention templates embedded
  - Rationale: Large string templates for conventions (lines 213-284) mixed with tool logic.
  - Files affected: 1
  - **Recommendation**: Extract convention templates to `data/conventions/` if adding more languages.

## Completed Fixes (Earlier Today)

| Issue | Status | Resolution |
|-------|--------|------------|
| Split studio.html | FIXED | Extracted to studio.css, studio.js, studio.html |
| Split studio.js | FIXED | Extracted to 7 modules (studio-core.js, studio-ui.js, etc.) |
| Split server.py | FIXED | Extracted to `server_modules/` package |
| Extract broadcast pattern | FIXED | Created `broadcast_to_clients()` helper |
| Split tick() method | FIXED | Extracted 3 methods: `_process_completed_futures()`, `_recover_stale_tasks()`, `_dispatch_new_tasks()` |
| Split gemini chat() | FIXED | Extracted 4 methods in gemini.py |
| Extract stats aggregation | FIXED | Created `_compute_agent_stats()` shared function |
| Split studio.py | FIXED | Extracted `StudioAgent` to `studio/agent.py`, helpers to `studio/loader.py` |
| Standardize TaskStatus | FIXED | Use enum comparison consistently |
| Remove orphaned routine fields | FIXED | Removed unused routine fields from Task dataclass |
| Remove BLOCKED_TOOLS | FIXED | Removed dead code from `claude_cli.py` |

## Stats

- Files scanned: 42 (Python: 38, JS: 2, CSS: 1, HTML: 1)
- Issues found: 12
  - High priority: 0 (all resolved)
  - Medium priority: 5
  - Low priority: 3
  - Completed: 11

## Summary

All High priority issues resolved. The codebase now follows good practices:

1. **studio.js** (1624 lines) → Split into 7 modules, largest is 388 lines ✅
2. **tasks.py** (680 lines) - Medium: Monitor growth, split Task class if exceeds 800
3. **Long functions** - Several functions exceed 50-line threshold but are manageable

Both Python backend and JavaScript frontend now follow clear module separation.

---

*Generated by Taxonomy agent on 2026-09-05*
*Updated with fresh scan: 2026-09-05*
