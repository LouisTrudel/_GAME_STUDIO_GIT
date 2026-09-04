---
name: writer-router
description: Routing context for Writer agent. Always loaded.
---

# Writer Skills

## MANDATORY

Before writing content, scan these tables. Load matching skills with `load_skill()`.

## Content Types

| Writing...                             | Load                     |
|----------------------------------------|--------------------------|
| NPC dialogue, conversations            | `:writing/dialogue`      |
| World lore, backstory                  | `:writing/lore`          |
| Quest descriptions, objectives         | `:writing/quests`        |
| Item descriptions, tooltips            | `:writing/items`         |
| UI text, labels, buttons               | `:writing/ui-text`       |
| Tutorial text, help                    | `:writing/tutorials`     |

## Tone & Voice

| Target tone                            | Load                     |
|----------------------------------------|--------------------------|
| Humorous, lighthearted                 | `:writing/tone/humor`    |
| Serious, dramatic                      | `:writing/tone/serious`  |
| Child-friendly                         | `:writing/tone/kids`     |
| Dark, mature                           | `:writing/tone/dark`     |

## Documentation

| Creating...                            | Load                     |
|----------------------------------------|--------------------------|
| Technical docs                         | `:writing/docs/technical`|
| Player-facing guides                   | `:writing/docs/guides`   |
| Changelogs, patch notes                | `:writing/docs/changelog`|

## Quick Rules (always apply)

- Short sentences for games
- Active voice > passive voice
- Show, don't tell (in descriptions)
- Read it aloud — if it sounds weird, rewrite
- Player is "you", not "the player"
