# Skill Loading Pipeline

How agents load skills on demand.

## Flow

```
Agent receives task
        ↓
Router skill (always loaded) shows routing tables
        ↓
Agent scans task for keywords
        ↓
Agent calls load_skill() for matching skills
        ↓
Skill content returned in tool response
        ↓
Agent continues with skill knowledge
```

## Example

Task: "Add camera shake when player takes damage"

```
1. Agent sees task
2. Router says: "camera/shake → load :code/roblox/client"
3. Agent calls: load_skill(":code/roblox/client")
4. Skill content returned
5. Agent implements with skill guidance
```

## Tools

| Tool | Purpose |
|------|---------|
| `load_skill(path)` | Load a skill file into context |
| `list_skills(category)` | Browse available skills |

## Skill Paths

| Format | Example |
|--------|---------|
| Category/skill | `:code/roblox/client` |
| Nested | `:code/patterns/errors` |
| Templates | `:templates/remote` |

## What Gets Loaded

| Agent Type | Router (always) | Skills (on demand) |
|------------|-----------------|-------------------|
| Programmer | `_routers/programmer.md` | `code/*` |
| Designer | `_routers/designer.md` | `design/*` |
| Artist | `_routers/artist.md` | `art/*` |
| Writer | `_routers/writer.md` | `writing/*` |
| QA | `_routers/qa.md` | `qa/*` |

## Token Budget

| Component | Tokens | When |
|-----------|--------|------|
| role.md | ~200 | Always |
| Router | ~300 | Always |
| Per skill | ~100-200 | On demand |
| **Typical** | ~800-1200 | After 2-3 loads |

## Principles

- Router is index, skills are content
- Agent decides what to load (self-serve)
- Only load what's needed for current task
- Templates are copy-paste code
