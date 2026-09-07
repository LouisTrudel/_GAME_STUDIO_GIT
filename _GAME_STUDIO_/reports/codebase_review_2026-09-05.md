# Codebase Review - 2026-09-05

## Priority: High

- [ ] **Split monolithic function** `server_modules/routes.py:35-462` → `register_routes()` is 428 lines containing all API endpoints
  - Rationale: Single function handles 20+ endpoints, impossible to test or maintain individually
  - Files affected: 1

- [ ] **Complete schema migration** `studio/core/tasks.py:208-230` → Remove 22 legacy fields still in Task dataclass
  - Rationale: Dual schema support causes maintenance burden, memory overhead, inconsistent data risk
  - Files affected: 3 (tasks.py, studio.py, any file reading old fields)

- [ ] **Split oversized file** `studio/core/tasks.py` (1,013 lines) → Separate TaskManager into focused managers
  - Rationale: Exceeds 400-line warning threshold by 2.5x; 60+ fields in single dataclass
  - Files affected: 1

- [ ] **Refactor large function** `studio/studio.py:374-498` → `_run_agent_task()` is 125 lines
  - Rationale: Exceeds 50-line function limit by 2.5x; handles agent execution, callbacks, error handling
  - Files affected: 1

- [ ] **Refactor large function** `studio/core/tasks.py:81-231` → `save_deliverable()` is 151 lines
  - Rationale: Exceeds 50-line limit by 3x; mixed file I/O, parsing, and task updates
  - Files affected: 1

- [ ] **Refactor large function** `studio/core/memory.py:507-670` → `backfill_memory_from_logs()` is 164 lines
  - Rationale: Exceeds 50-line limit by 3.3x; complex log parsing and memory reconstruction
  - Files affected: 1

- [ ] **Split oversized file** `studio.js` (1,624 lines) → Break into domain-specific modules
  - Rationale: Exceeds 1500-line critical threshold; monolithic frontend code
  - Files affected: 1

## Priority: Medium

- [ ] **Refactor large function** `studio/studio.py:499-595` → `_process_completed_futures()` is 97 lines
  - Rationale: Exceeds 50-line limit; handles future resolution, state updates, error handling
  - Files affected: 1

- [ ] **Refactor large function** `studio/studio.py:604-690` → `_dispatch_new_tasks()` is 87 lines
  - Rationale: Exceeds 50-line limit; task selection and agent dispatch logic
  - Files affected: 1

- [ ] **Split oversized file** `studio/studio.py` (720 lines) → Separate agent orchestration from task dispatch
  - Rationale: Exceeds 400-line warning threshold; mixed concerns
  - Files affected: 1

- [ ] **Split oversized file** `studio/core/memory.py` (670 lines) → Extract tier compression to separate classes
  - Rationale: Exceeds 400-line threshold; complex state management
  - Files affected: 1

- [ ] **Refactor large function** `backends/backends/claude_cli.py:48-133` → `chat()` is 86 lines
  - Rationale: Exceeds 50-line limit; handles streaming, parsing, error recovery
  - Files affected: 1

- [ ] **Remove deprecated code** `studio/core/hub.py:292` → Method marked "DEPRECATED: Use AC-Memory compression"
  - Rationale: Dead code that may confuse future developers
  - Files affected: 1

## Priority: Low

- [ ] **Split oversized file** `studio-suggestions.js` (685 lines) → Consider extracting UI from data logic
  - Rationale: Approaching 400-line threshold; could improve testability
  - Files affected: 1

- [ ] **Split oversized file** `server_modules/routes.py` (591 lines) → Beyond route extraction, consider middleware separation
  - Rationale: Exceeds 400-line threshold even after function extraction
  - Files affected: 1

- [ ] **Split oversized file** `studio/core/schedules.py` (431 lines) → Extract schedule execution from schedule management
  - Rationale: Just above 400-line threshold
  - Files affected: 1

- [ ] **Split oversized file** `backends/backends/claude_cli.py` (452 lines) → Extract streaming logic to helper
  - Rationale: Above 400-line threshold; complex streaming state
  - Files affected: 1

- [ ] **Split oversized file** `studio/agents/boss/tools.py` (430 lines) → Group tools by category
  - Rationale: Just above 400-line threshold
  - Files affected: 1

- [ ] **Refactor large function** `backends/backends/claude_cli.py:321-395` → `_extract_result()` is 75 lines
  - Rationale: Exceeds 50-line limit; complex JSON parsing
  - Files affected: 1

## Stats
- Files scanned: 47
- Issues found: 20
