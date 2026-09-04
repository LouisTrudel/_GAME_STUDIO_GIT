# Skill

An injectable markdown file containing task-specific knowledge.

## Purpose

Skills extend agent capabilities without bloating their core role.md. Agents load skills on-demand using the `load_skill()` tool.

## Structure

```
studio/skills/
├── _routers/           # Always loaded per agent type
│   ├── programmer.md
│   ├── designer.md
│   ├── artist.md
│   ├── writer.md
│   └── qa.md
│
├── code/               # Programmer skills
│   ├── roblox/
│   ├── patterns/
│   └── ...
│
├── design/             # Designer skills
├── art/                # Artist skills
├── writing/            # Writer skills
├── qa/                 # QA skills
│
└── templates/          # Code snippets (copy-paste)
    ├── remote.lua
    ├── datastore.lua
    └── ...
```

## Router Skills

Each agent type has a router skill that is **always loaded**. It contains:
- Routing tables (keywords → skills to load)
- Quick rules (always apply)
- No deep content (that's in the skills themselves)

## Skill Format

```markdown
---
name: skill-name
description: One line description.
---

# Title

## Section (tables preferred)

| Column 1 | Column 2 |
|----------|----------|
| Data     | Data     |

## Rules

- Bullet points for constraints
```

## Properties

| Property | Description |
|----------|-------------|
| name | Skill identifier |
| description | One-line purpose |
| ~lines | Approximate token cost |

## Principles

- **Tables > prose** — scannable, not readable
- **Under 100 lines** — split if larger
- **No code in skills** — put code in templates/
- **Router is index** — skills are content

## Relationships

- Routers always loaded per agent type
- Skills loaded via `load_skill()` tool
- Templates are copy-paste code snippets
