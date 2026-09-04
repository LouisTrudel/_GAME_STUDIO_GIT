# Context (Shared Brain)

Per-project document for cross-agent coordination.

## Purpose

While Hub is chat-like (ephemeral, high-volume), CONTEXT.md is document-like (curated, persistent). Agents read it before starting work and append signals for other agents.

## Why Not Just Hub?

| Hub | CONTEXT.md |
|-----|------------|
| Conversation stream | Curated document |
| 200 message limit | Unlimited, human-curated |
| All chatter included | Only decisions & signals |
| Searched/filtered | Read top-to-bottom |

Hub = what happened. CONTEXT.md = what matters.

## Location

```
projects/{project_id}/CONTEXT.md
```

Each project gets its own shared brain.

## Structure

```markdown
# Project: {name}

## Cross-Agent Signals

Active handoffs between agents:
- [DESIGNER -> PROGRAMMER] Use 5 difficulty levels, exponential ramp
- [PROGRAMMER -> WRITER] Text keys: title, subtitle, game_over
- [WRITER -> PROGRAMMER] text_assets.json ready -- 12 keys

## Decisions

Locked-in choices (don't revisit):
- Currency: single coin type, no gems
- Art style: pixel art, 16x16 tiles
- Target: mobile web, touch controls

## Open Questions

Needs human input:
- [ ] Monetization: ads or IAP?
- [ ] Difficulty: adaptive or fixed levels?

## Blockers

Waiting on external:
- [ ] Need sound assets from client
```

## Agent Behavior

**Before task:** Read CONTEXT.md for relevant decisions
**After task:** Append signal if other agents need to know
**Never:** Delete or rewrite others' signals

## Coordination Pattern

```
Designer finishes economy design
  ↓
Appends: [DESIGNER -> PROGRAMMER] Price tiers: 10, 50, 200, 1000
  ↓
Programmer reads before implementing shop
  ↓
Appends: [PROGRAMMER -> QA] Shop ready, test purchase flow
  ↓
QA reads before testing
```

## Merge Conflict Risk

If two agents write simultaneously, last-write-wins. Mitigations:
- Agents append, never overwrite
- Server serializes writes (future)
- Sections are independent (conflicts rare)

## Principles

- **Append-only** for agents (humans curate)
- **Structured sections** prevent chaos
- **Signals are directional** `[FROM -> TO]`
- **Decisions are final** once written
