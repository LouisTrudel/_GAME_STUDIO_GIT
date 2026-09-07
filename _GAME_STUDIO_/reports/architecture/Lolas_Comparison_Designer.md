# Strategic Evaluation: Lolas Patterns vs Game Studio

## Executive Summary

Lolas system uses tmux/send-keys for subprocess isolation, file-based done markers for completion detection, and UDP push-wake for responsiveness. Our studio uses a simpler Hub/heartbeat model. Key gaps: we lack robust completion detection and fast-wake mechanisms.

---

## Comparison Matrix

| Lolas Concept | Our Equivalent | Gap? | Strategic Value | Verdict |
|---------------|----------------|------|-----------------|---------|
| **tmux + send-keys** | Direct subprocess | YES - SIGTTOU risk on Linux | High for Linux deploy | **ADAPT** |
| **Done marker pattern** | Task status polling | YES - no exit code capture | High - crash detection | **ADOPT** |
| **Push-wake (UDP)** | Heartbeat polling (10s) | YES - latency gap | Medium - 10s acceptable for games | **IGNORE** |
| **Stale task recovery (35min)** | None | YES - tasks can hang | High - reliability | **ADOPT** |
| **Shared brain (CONTEXT.md)** | Hub + CONTEXT.md | NO - we have this | Already aligned | **ADOPTED** |
| **Skill files per agent** | role.md + skills/ | NO - we have this | Already aligned | **ADOPTED** |
| **Stateless invocations** | Stateless agents | NO - we have this | Already aligned | **ADOPTED** |
| **Agent stream (thoughts)** | Hub messages | PARTIAL - no status field | Low - nice debug feature | **ADAPT** |
| **Scripts vs agents philosophy** | Heartbeats for scripts | NO - we have this | Already aligned | **ADOPTED** |
| **Priority ordering** | Task priorities | PARTIAL - verify impl | Medium - need queue fairness | **ADAPT** |
| **Temp file cleanup** | None documented | YES - accumulation risk | Medium - maintenance | **ADOPT** |

---

## Gap Analysis

### Critical Gaps (ADOPT)

**1. Done Marker Pattern**
- **Problem:** Our studio can't detect if an agent crashed mid-task
- **Lolas solution:** `; echo $? > {done_marker}` appended to commands
- **Implementation:** Write exit code to `data/done/{task_id}` after each agent run
- **Benefit:** Crash recovery, accurate completion tracking

**2. Stale Task Recovery**
- **Problem:** If agent hangs, task stays claimed forever
- **Lolas solution:** 35-minute timeout, auto-reclaim
- **Implementation:** Add `claimed_at` timestamp, heartbeat checks for stale claims
- **Benefit:** Self-healing system, no manual intervention

**3. Temp File Cleanup**
- **Problem:** Prompt/output files accumulate after crashes
- **Lolas solution:** Periodic cleanup of `/tmp/claude-*`
- **Implementation:** Heartbeat script cleans `data/tmp/` older than 1 hour
- **Benefit:** Disk hygiene, prevents confusion

### Moderate Gaps (ADAPT)

**4. Agent Stream with Status**
- **Current:** Hub messages are flat text
- **Lolas:** Messages have `status` field (thinking, found, done)
- **Adaptation:** Add optional `status` field to hub messages
- **Benefit:** Better observability without breaking existing flow

**5. Priority Queue Verification**
- **Current:** Tasks have priority but queue fairness unverified
- **Lolas:** Explicit ordering (urgent > high > normal > low, then FIFO)
- **Adaptation:** Audit TaskManager.get_next_task() for correct ordering
- **Benefit:** Predictable dispatch behavior

**6. tmux Isolation (Linux only)**
- **Current:** Windows subprocess works fine
- **Lolas:** tmux required on Linux to avoid SIGTTOU
- **Adaptation:** Abstract process dispatch, use tmux on Linux only
- **Benefit:** Cross-platform deployment

### Non-Gaps (Already Aligned)

| Pattern | Our Implementation |
|---------|-------------------|
| Shared brain | `projects/{id}/CONTEXT.md` |
| Skill injection | `skills/` folder + router loading |
| Stateless agents | Fresh context per task |
| Scripts for determinism | Heartbeat system |
| File-based coordination | Hub JSON + task JSON |

---

## Strategic Recommendations

### Phase 1: Reliability (Low effort, high impact)

1. **Add done markers** - 2 files changed
   - Modify agent dispatch to write exit code
   - Modify task completion to read exit code

2. **Add stale recovery** - 1 file changed
   - Add `claimed_at` to task schema
   - Heartbeat checks for stale (>35min) claims

### Phase 2: Maintenance (Medium effort, medium impact)

3. **Temp cleanup heartbeat** - 1 new heartbeat
   - Clean `data/tmp/*` older than 1 hour

4. **Hub status field** - Non-breaking addition
   - Optional `status` key in hub messages

### Phase 3: Platform (Only if deploying to Linux)

5. **tmux abstraction** - Only when needed
   - Keep current Windows subprocess
   - Add tmux path for Linux

---

## Windows-Specific Notes

| Lolas Pattern | Windows Equivalent |
|---------------|-------------------|
| tmux send-keys | Not needed - no SIGTTOU on Windows |
| `/tmp/` paths | `data/tmp/` or `%TEMP%` |
| UDP sockets | Works identically |
| File locking | Use `msvcrt.locking()` if needed |

Our Windows-first approach means we skip tmux complexity entirely. The done marker and stale recovery patterns work identically on Windows.

---

## Success Metrics

| Pattern | Measure |
|---------|---------|
| Done markers | 100% of task completions have exit code logged |
| Stale recovery | 0 tasks stuck in "claimed" state >1 hour |
| Temp cleanup | data/tmp/ stays under 100 files |
| Priority queue | Urgent tasks complete before normal within same tick |

---

## Conclusion

Lolas and our studio share core philosophy (stateless agents, file coordination, shared brain). The key adoptions are **done markers** and **stale recovery** - both improve reliability with minimal code changes. Skip push-wake (10s polling is fine for games) and tmux (Windows doesn't need it).
