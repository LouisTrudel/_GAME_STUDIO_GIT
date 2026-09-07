# Lola's Attempt: Concept Analysis & Weighted Comparison

> **Analysis Date:** 2026-09-04
> **Compared Against:** `studio/studio.md` (Our Design)
> **Source:** `reports/Lolas_Attempt_Trimmed.md`

---

## Executive Summary (CEO Perspective)

Lola's system solves a **real production problem** (SIGTTOU) that we haven't encountered yet because we haven't built the orchestrator. Her approach is battle-tested and pragmatic. Several patterns align with our design philosophy; others introduce complexity we may not need.

**Bottom Line:** Cherry-pick 3-4 patterns. Don't adopt wholesale.

---

## Concept-by-Concept Analysis

### 1. SIGTTOU Solution (tmux + send-keys)

| Metric | Score (1-5) | Notes |
|--------|-------------|-------|
| **RISK** | 2 | tmux is stable, well-documented |
| **REWARD** | 5 | Solves a blocker we WILL hit |
| **EASE** | 4 | Straightforward implementation |
| **RELEVANCE** | 5 | Direct applicability to our orchestrator |

**Taxonomy:** Infrastructure / Process Management
**Our Design Gap:** studio.md doesn't specify HOW agents are spawned. This fills that gap.

| Evaluator | Verdict |
|-----------|---------|
| CEO | **ADOPT** - This is the core insight. Without it, nothing works. |
| Programmer | **ADOPT** - Clean solution. Windows equivalent: ConPTY or separate cmd windows. |
| Context-Expert | **ADOPT** - Stateless invocation aligns with Principle #5 |

---

### 2. Task Queue Lifecycle (JSON file-based)

| Metric | Score (1-5) | Notes |
|--------|-------------|-------|
| **RISK** | 2 | File locking edge cases on Windows |
| **REWARD** | 4 | Simple, debuggable, no external deps |
| **EASE** | 5 | We already planned this |
| **RELEVANCE** | 5 | Matches our Task concept exactly |

**Taxonomy:** Core / Task Management
**Our Design Gap:** None. We have Tasks. Lola adds: `claimed_by`, `claimed_at`, stale recovery.

| Evaluator | Verdict |
|-----------|---------|
| CEO | **ADAPT** - Add claimed_by/claimed_at fields to our schema |
| Programmer | **ADAPT** - Add file locking for Windows (portalocker) |
| Context-Expert | **ADAPT** - Stale recovery is important for long-running sessions |

**Specific Additions:**
- Add `claimed_by`, `claimed_at` to task schema
- Implement 35-min stale recovery
- Use `portalocker` for atomic writes on Windows

---

### 3. Done Marker Pattern

| Metric | Score (1-5) | Notes |
|--------|-------------|-------|
| **RISK** | 3 | Temp file accumulation, cleanup burden |
| **REWARD** | 3 | Solves completion detection |
| **EASE** | 4 | Simple to implement |
| **RELEVANCE** | 3 | Only needed if using send-keys pattern |

**Taxonomy:** Infrastructure / Process Signaling
**Our Design Gap:** We don't specify completion detection yet.

| Evaluator | Verdict |
|-----------|---------|
| CEO | **ADAPT** - Use, but with auto-cleanup |
| Programmer | **ADAPT** - Windows: use named pipes or file watches instead of polling |
| Context-Expert | **IGNORE** - If we use subprocess.run with capture, we don't need this |

**Decision:** Depends on whether we adopt SIGTTOU pattern. If yes → adopt. If we find Windows alternative → skip.

---

### 4. Push-Wake Mechanism (UDP events)

| Metric | Score (1-5) | Notes |
|--------|-------------|-------|
| **RISK** | 3 | UDP can be unreliable, firewall issues |
| **REWARD** | 3 | Faster task pickup (<1s vs 10s) |
| **EASE** | 3 | Adds networking complexity |
| **RELEVANCE** | 2 | Overkill for local single-machine setup |

**Taxonomy:** Infrastructure / Event System
**Our Design Gap:** We have Heartbeat (periodic). This is event-driven alternative.

| Evaluator | Verdict |
|-----------|---------|
| CEO | **IGNORE** - Polling every 2-5s is fine for MVP |
| Programmer | **IGNORE** - Windows firewall hassles not worth <10s improvement |
| Context-Expert | **IGNORE** - Heartbeat pattern sufficient |

**Decision:** Skip for now. Revisit if latency becomes a problem.

---

### 5. Skill System Architecture

| Metric | Score (1-5) | Notes |
|--------|-------------|-------|
| **RISK** | 1 | Low risk, markdown files |
| **REWARD** | 4 | Aligns with our design |
| **EASE** | 5 | Already in our plan |
| **RELEVANCE** | 5 | Core concept match |

**Taxonomy:** Core / Context Injection
**Our Design Gap:** None. Our Skill concept is identical.

| Evaluator | Verdict |
|-----------|---------|
| CEO | **ADOPT** - Validates our approach |
| Programmer | **ADOPT** - Confirms per-invocation skill injection works |
| Context-Expert | **ADOPT** - "Read skill on every invocation" = Principle #1 |

**Validation:** Lola's production use confirms our Skills architecture is sound.

---

### 6. Agent Stream (Live Thoughts)

| Metric | Score (1-5) | Notes |
|--------|-------------|-------|
| **RISK** | 2 | Simple logging system |
| **REWARD** | 3 | Nice observability |
| **EASE** | 4 | Easy to implement |
| **RELEVANCE** | 3 | Our Hub serves similar purpose |

**Taxonomy:** Observability / Agent Communication
**Our Design Gap:** Hub is message-based. Agent Stream is status-based. Different use cases.

| Evaluator | Verdict |
|-----------|---------|
| CEO | **ADAPT** - Add status field to Hub messages |
| Programmer | **ADAPT** - Implement as Hub message subtype |
| Context-Expert | **ADAPT** - Useful for UI, but Hub already covers |

**Decision:** Don't create separate system. Extend Hub with `type: "thought"` messages.

---

### 7. Shared Brain (CONTEXT.md Pattern)

| Metric | Score (1-5) | Notes |
|--------|-------------|-------|
| **RISK** | 2 | Merge conflicts if agents write simultaneously |
| **REWARD** | 5 | Elegant cross-agent coordination |
| **EASE** | 4 | Just markdown files |
| **RELEVANCE** | 5 | Solves agent communication |

**Taxonomy:** Core / Context Management
**Our Design Gap:** Hub is chat-like. CONTEXT.md is document-like. We need both.

| Evaluator | Verdict |
|-----------|---------|
| CEO | **ADOPT** - Per-project CONTEXT.md is brilliant |
| Programmer | **ADOPT** - Simple, debuggable, human-readable |
| Context-Expert | **ADOPT** - Aligns with "state lives in /data" principle |

**Implementation:**
- Each project gets `projects/{project_id}/CONTEXT.md`
- Structured sections: `## Cross-Agent Signals`, `## Decisions`, `## Open Questions`
- Agents append, humans curate

---

### 8. Design Philosophy (Scripts vs Agents)

| Metric | Score (1-5) | Notes |
|--------|-------------|-------|
| **RISK** | 1 | Philosophy, not implementation |
| **REWARD** | 5 | Cost optimization |
| **EASE** | 5 | Just discipline |
| **RELEVANCE** | 5 | Core principle |

**Taxonomy:** Principles / Cost Management
**Our Design Gap:** Implicit in "minimal context injection" but not explicit.

| Evaluator | Verdict |
|-----------|---------|
| CEO | **ADOPT** - Add to Principles explicitly |
| Programmer | **ADOPT** - Guides what to automate vs delegate |
| Context-Expert | **ADOPT** - "Scripts are free doers" saves tokens |

**Action:** Add to `studio.md` Principles:
> 6. Scripts for deterministic tasks, agents for judgment calls

---

## Summary Matrix

| Concept | Risk | Reward | Ease | Relevance | Verdict |
|---------|------|--------|------|-----------|---------|
| SIGTTOU Solution | 2 | 5 | 4 | 5 | **ADOPT** |
| Task Queue Lifecycle | 2 | 4 | 5 | 5 | **ADAPT** |
| Done Marker Pattern | 3 | 3 | 4 | 3 | ADAPT (conditional) |
| Push-Wake (UDP) | 3 | 3 | 3 | 2 | **IGNORE** |
| Skill System | 1 | 4 | 5 | 5 | **ADOPT** (validates ours) |
| Agent Stream | 2 | 3 | 4 | 3 | **ADAPT** into Hub |
| Shared Brain (CONTEXT.md) | 2 | 5 | 4 | 5 | **ADOPT** |
| Scripts vs Agents | 1 | 5 | 5 | 5 | **ADOPT** |

---

## Recommended Actions

### Immediate (Add to Design)
1. Add CONTEXT.md pattern per project
2. Add claimed_by/claimed_at/stale recovery to task schema
3. Add Principle #6: "Scripts for deterministic, agents for judgment"

### Pre-Implementation Research
4. Research Windows equivalent to tmux send-keys (ConPTY, Windows Terminal)
5. Test file locking with portalocker on Windows

### Deferred
6. Done marker pattern - only if needed for Windows process model
7. Push-wake UDP - only if polling latency becomes problem
8. Agent Stream - merge into Hub as message type

---

## Technical Feasibility Notes (Programmer)

**Windows Considerations:**
- tmux doesn't exist on Windows natively. Alternatives:
  - WSL2 with tmux (adds complexity)
  - Windows Terminal + PowerShell background jobs
  - Python `subprocess` with ConPTY
  - Named pipes for process communication
- File locking: Use `portalocker` or `msvcrt.locking()`
- Done markers: Windows file watchers via `watchdog` library

**FastAPI Integration:**
- Task queue: FastAPI endpoint to POST tasks, background worker polls
- Hub: WebSocket endpoint for live updates
- Heartbeat: `asyncio` scheduled tasks or `APScheduler`

---

*Analysis complete. Ready for implementation planning.*
