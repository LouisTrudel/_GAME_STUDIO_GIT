# BOSS Action Plan

Prioritized fixes extracted from boss_response_analysis.md

---

## Phase 1: Stop the bleeding (P0 - Critical)

| # | ID | Issue | Fix | Status |
|---|-----|-------|-----|--------|
| 1 | F13 | Session bloat 8x token diff | 50K threshold clearing | DONE |
| 2 | F18 | Research agent not completing | Likely symptom of F13 - retest after 50K fix | TODO |

> **Note:** F10 (duplicate "complete previous" tasks) removed - was intentional user testing of continuation recovery, not a bug.

---

## Phase 2: Reduce waste (P1 - High)

| # | ID | Issue | Fix | Status |
|---|-----|-------|-----|--------|
| 3 | F3 | Creates task instead of answering | Trigger suffix: "Question → answer directly" | TODO |
| 4 | F7 | Missing [X] constraints | BOSS role.md: require [X] in task format | TODO |
| 5 | F9 | No success criteria | Add [DONE] tag to task format | TODO |
| 6 | F17 | Ran out of turns | See MAX_TURNS_HANDLING notes | TODO |

---

## Phase 3: Better UX (P2 - Medium)

| # | ID | Issue | Fix | Status |
|---|-----|-------|-----|--------|
| 7 | F1 | Robotic acknowledgment | Trigger suffix: "Greeting → warm response" | TODO |
| 8 | F2 | Same "What's next?" response | role.md: vary acknowledgments | TODO |
| 9 | F4 | Tells user to check files | Trigger suffix: "Use tools, don't redirect" | TODO |
| 10 | F6 | "No response requested" | Remove from role.md examples | TODO |

---

## Phase 4: Optimize (P3 - Low)

| # | ID | Issue | Fix | Status |
|---|-----|-------|-----|--------|
| 11 | F8 | Vague file references | BOSS add line ranges when known | TODO |
| 12 | F11 | Wrong agent assignment | Better agent descriptions in role.md | TODO |
| 13 | F12 | No output format specified | Add [OUT] tag to task format | TODO |
| 14 | F14 | Simple task high cost (43K) | Trim role.md, reduce init context | TODO |
| 15 | F15 | Verification tasks expensive | Skip if prior task succeeded | TODO |
| 16 | F16 | Research stubs | Research role.md needs work | TODO |
| 17 | F19 | Tasks disappearing from queue | UI bug (T628 investigated) | TODO |

---

## Also tracked (from earlier session)

| Issue | Description | Status |
|-------|-------------|--------|
| NEVER_CLEARS | BOSS session grows unbounded | TODO |
| LARGE_MEMORY | tier1.md (50KB) on init | TODO |
| MAX_TURNS_HANDLING | Agent hits turn limit mid-task | TODO |

### MAX_TURNS_HANDLING Notes

When an agent reaches max_turns before completing:
- Current: Task marked approved, incomplete deliverable saved
- User manually creates "Complete Txxx" continuation task
- Continuation inherits bloated session context (pre-50K fix)

**Options to explore:**
1. Auto-detect turn exhaustion → create continuation task automatically
2. Agent checkpoints progress before turn limit
3. Increase max_turns for complex tasks
4. Agent signals "need more turns" via tool call
5. Session clearing between continuation attempts (now possible with 50K fix)

---

## Quick Reference

**Next up:** #2 (F18) - Research agent completion (retest after 50K fix)

**Files to modify:**
- `studio/agents/boss/role.md` - task format, acknowledgments
- `studio/studio.py:385` - trigger suffix
- `studio/agent.py` - BOSS context building
- `backends/backends/persistent_claude_cli.py` - session management
