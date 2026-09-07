# Taxonomy Comparison: Studio.md vs Lolas_Attempt_Trimmed.md

> Weighted analysis of orchestration patterns. Each concept rated 1-5 (higher = better).

---

## Summary Matrix

| Concept | RISK | REWARD | EASE | RELEVANCE | TOTAL | Verdict |
|---------|------|--------|------|-----------|-------|---------|
| tmux+send-keys vs WebSocket | 5 | 2 | 1 | 2 | 10 | **IGNORE** |
| Done markers vs Task state | 3 | 3 | 4 | 3 | 13 | ADAPT |
| Push-wake (UDP) vs Polling | 3 | 4 | 3 | 4 | 14 | ADAPT |
| Shared Brain (CONTEXT.md) | 1 | 5 | 5 | 5 | 16 | **ADOPT** |
| Agent Stream (live thoughts) | 1 | 4 | 5 | 4 | 14 | ADOPT |
| Stale task recovery | 1 | 5 | 5 | 5 | 16 | **ADOPT** |
| Skill file per-invocation | 2 | 4 | 5 | 5 | 16 | **ADOPT** |
| Stateless philosophy | 1 | 5 | 5 | 5 | 16 | **ADOPT** |

---

## Detailed Breakdown

### 1. tmux+send-keys vs WebSocket (Our Approach)

| Metric | Score | Rationale |
|--------|-------|-----------|
| RISK | 5 (high risk) | tmux is Unix-specific; Windows has no native equivalent. WSL adds complexity layer. |
| REWARD | 2 | Solves SIGTTOU — a Linux-specific problem we don't have on Windows. |
| EASE | 1 | Requires WSL, tmux installation, session management. Our WebSocket backend works natively. |
| RELEVANCE | 2 | We use `subprocess.run` with FastAPI backends. No SIGTTOU issue on Windows. |

**Verdict: IGNORE.** The tmux pattern solves a Unix terminal problem. Our Windows/FastAPI stack doesn't have SIGTTOU. Our existing backend handles process management.

---

### 2. Done Markers vs Task State

| Metric | Score | Rationale |
|--------|-------|-----------|
| RISK | 3 | File-based done markers can accumulate, get orphaned on crash. |
| REWARD | 3 | Simple completion detection. We already have task status in JSON. |
| EASE | 4 | Trivial to implement — write file on completion. |
| RELEVANCE | 3 | Our `tasks.json` already tracks `status: completed`. Redundant but useful for crash recovery. |

**Verdict: ADAPT.** We already use task status fields. Could add a separate done-marker pattern for subprocess crash detection if needed.

**Our equivalent:** `data/tasks.json` with `status` field + `completed_at` timestamp.

---

### 3. Push-Wake (UDP) vs Polling

| Metric | Score | Rationale |
|--------|-------|-----------|
| RISK | 3 | UDP is unreliable; needs fallback polling anyway. |
| REWARD | 4 | Sub-second task pickup vs 10s polling latency. |
| EASE | 3 | Requires UDP listener thread + event registration. |
| RELEVANCE | 4 | We currently poll. Faster dispatch would help responsiveness. |

**Verdict: ADAPT.** Don't use UDP — use `threading.Event` or `asyncio.Event` triggered on task creation. Same instant-wake benefit, simpler implementation.

**Implementation path:**
```python
# In TaskManager.create_task():
self.new_task_event.set()

# In agent tick loop:
await asyncio.wait_for(new_task_event.wait(), timeout=10.0)
```

---

### 4. Shared Brain (CONTEXT.md Pattern)

| Metric | Score | Rationale |
|--------|-------|-----------|
| RISK | 1 | Low risk — we already define this pattern in studio.md line 48. |
| REWARD | 5 | Cross-agent coordination without message passing. |
| EASE | 5 | Already in our architecture: `projects/{project_id}/CONTEXT.md`. |
| RELEVANCE | 5 | Exact match for our documented approach. |

**Verdict: ADOPT.** We already have this. Validate it's actually used by agents.

**Our equivalent:** `projects/{project_id}/CONTEXT.md` + Hub for chat-like messages.

**Gap:** Lola uses `[DESIGNER -> PROGRAMMER]` signal format. Standardize our signal syntax.

---

### 5. Agent Stream (Live Thoughts)

| Metric | Score | Rationale |
|--------|-------|-----------|
| RISK | 1 | Simple append-only log. Low failure modes. |
| REWARD | 4 | Visibility into agent activity. Useful for debugging and UI. |
| EASE | 5 | Rolling JSON log with TTL — straightforward implementation. |
| RELEVANCE | 4 | We have Hub messages but no dedicated "thinking" stream. |

**Verdict: ADOPT.** Add a lightweight stream for agent status updates.

**Our equivalent:** Hub serves similar purpose, but mixes thoughts with outputs.

**Gap:** Create dedicated `data/agent_stream.json` for ephemeral status messages.

---

### 6. Stale Task Recovery

| Metric | Score | Rationale |
|--------|-------|-----------|
| RISK | 1 | Prevents stuck tasks. No downside. |
| REWARD | 5 | Critical for reliability — crashed agents don't block forever. |
| EASE | 5 | Check `claimed_at` + timeout threshold in tick loop. |
| RELEVANCE | 5 | We have `claimed_at` and `timeout` fields in task schema. |

**Verdict: ADOPT.** Must implement if not already present.

**Our equivalent:** Task schema supports this; verify `_recover_stale_tasks()` exists in `studio/core/tasks.py`.

**Implementation check needed:**
```python
if task.status == "claimed" and (now - task.claimed_at) > STALE_THRESHOLD:
    task.status = "ready"
    task.claimed_by = None
```

---

### 7. Skill File Per-Invocation Read

| Metric | Score | Rationale |
|--------|-------|-----------|
| RISK | 2 | File read overhead per task. Negligible. |
| REWARD | 4 | Hot-reload skills without restarting agents. |
| EASE | 5 | We already inject skills via `_routers/` and on-demand loading. |
| RELEVANCE | 5 | Matches our "skills are data, not code" principle (studio.md line 56). |

**Verdict: ADOPT.** Our architecture already supports this.

**Validation:** Confirm agents read fresh skill content each invocation, not cached.

---

### 8. Stateless Philosophy

| Metric | Score | Rationale |
|--------|-------|-----------|
| RISK | 1 | Reduces bugs from stale state. |
| REWARD | 5 | Predictable costs, no context window bloat. |
| EASE | 5 | Already our design — "Agents are stateless; state lives in /data" (studio.md line 57). |
| RELEVANCE | 5 | Exact alignment with our documented principles. |

**Verdict: ADOPT.** Already our approach. Document it more explicitly.

---

## Patterns Established

| Pattern | Our Term | Lola's Term | Status |
|---------|----------|-------------|--------|
| Cross-agent signals | CONTEXT.md | Shared Brain | ✓ Aligned |
| Ephemeral status | Hub | Agent Stream | Gap: separate stream |
| Task crash recovery | (implicit) | Stale recovery | Verify implementation |
| Skill injection | Skills + Routers | SKILL.md | ✓ Aligned |
| State location | `/data` | Files | ✓ Aligned |
| Process dispatch | WebSocket/subprocess | tmux send-keys | Different (OK) |

---

## Action Items for Other Agents

| Location | Problem | Fix | Assign To |
|----------|---------|-----|-----------|
| `studio/core/tasks.py` | Verify stale recovery exists | Implement `_recover_stale_tasks()` if missing | Programmer |
| `projects/_template/CONTEXT.md` | No signal format defined | Add `[AGENT -> AGENT]` signal syntax | Designer |
| `data/agent_stream.json` | Doesn't exist | Create ephemeral status stream | Programmer |
| `docs/concepts/` | Stateless philosophy underdocumented | Add `stateless-agents.md` | Writer |
