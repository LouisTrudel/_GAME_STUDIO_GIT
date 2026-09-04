---
name: boss-router
description: BOSS task creation and delegation patterns. Always loaded.
---

# BOSS - Task Creation

## MANDATORY

Before creating tasks, structure them for optimal agent output.

## Task Structure

```
[WHAT] Clear deliverable in imperative form
[CONTEXT] Why this is needed (1 line)
[SKILLS] Recommended skills for agent to load
[CONSTRAINTS] Must-haves, limits, rules
```

## Example

BAD: "Add a shop"

GOOD:
```
Add coin shop to main hub.
Context: Players need way to spend coins on consumables.
Skills: :code/economy :code/roblox/server :code/ui
Constraints: Server-validated purchases, show price before confirm.
```

## Skill Routing Reference

Scan task for keywords, include matching skills:

### Programmer Skills
| Keywords | Skills |
|----------|--------|
| shop, money, purchase, price | `:code/economy` |
| inventory, slots, items | `:code/inventory` |
| combat, damage, health | `:code/combat` |
| save, load, DataStore | `:code/data` |
| UI, button, menu, screen | `:code/ui` |
| LocalScript, client, input | `:code/roblox/client` |
| ServerScript, handler, validation | `:code/roblox/server` |
| error, pcall, warn | `:code/patterns/errors` |

### Designer Skills
| Keywords | Skills |
|----------|--------|
| economy, pricing, balance | `:design/economy` |
| levels, XP, progression | `:design/progression` |

### Writer Skills
| Keywords | Skills |
|----------|--------|
| dialogue, NPC, conversation | `:writing/dialogue` |
| lore, backstory, world | `:writing/lore` |

### Artist Skills
| Keywords | Skills |
|----------|--------|
| UI, layout, screen | `:art/ui` |

### QA Skills
| Keywords | Skills |
|----------|--------|
| test, verify, check | `:qa/functional` |

## Task Decomposition

| Complexity | Action |
|------------|--------|
| Simple (1 agent, 1 skill domain) | Single task |
| Medium (1 agent, multiple domains) | Single task, multiple skills |
| Complex (multiple agents) | Break into dependent tasks |

## Dependencies

```
T001: Design shop economy (Designer)
T002: Implement shop backend (Programmer) [depends: T001]
T003: Create shop UI (Programmer) [depends: T001]
T004: Test shop flow (QA) [depends: T002, T003]
```

## QA as Tester

QA is a testing specialist, not an auto-reviewer. Assign QA explicit testing tasks:

```
T004: Test shop purchase flow (QA) [depends: T002, T003]
  - Verify purchase deducts coins correctly
  - Check inventory updates
  - Test insufficient funds case
```

QA will:
- Use `report_bug` to create bug tasks for other agents
- Submit `test_summary` when done testing
- Tasks complete directly to APPROVED (no review gate)
