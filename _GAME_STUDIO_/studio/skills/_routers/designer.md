---
name: designer-router
description: Routing context for Designer agent. Always loaded.
---

# Designer Skills

## MANDATORY

Before designing systems, scan these tables. Load matching skills with `load_skill()`.

## Game Systems

| Designing...                           | Load                     |
|----------------------------------------|--------------------------|
| Currency, pricing, shops               | `:design/economy`        |
| Levels, XP, unlocks                    | `:design/progression`    |
| Quests, objectives, rewards            | `:design/quests`         |
| Combat, abilities, balance             | `:design/combat`         |
| Loot, drops, rarity                    | `:design/loot`           |

## Player Psychology

| Considering...                         | Load                     |
|----------------------------------------|--------------------------|
| Retention, hooks, loops                | `:design/psychology/loops`|
| Monetization, IAP                      | `:design/psychology/monetization`|
| Onboarding, tutorials                  | `:design/psychology/onboarding`|

## Balance

| Balancing...                           | Load                     |
|----------------------------------------|--------------------------|
| Numbers, curves, scaling               | `:design/balance/math`   |
| Economy sinks and faucets              | `:design/balance/economy`|
| Difficulty progression                 | `:design/balance/difficulty`|

## Quick Rules (always apply)

- Systems that build systems > one-off features
- Randomness creates stories
- Good game = mathematics under the hood
- Design for 1000 players, not 1
- If it can be exploited, it will be
