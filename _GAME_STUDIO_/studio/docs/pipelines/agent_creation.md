# Agent Creation Pipeline

How new agents are added to the studio.

## Flow

```
Create folder in studio/agents/
            ↓
   Add role.md (persona/rules)
            ↓
   Add config.json (name/color)
            ↓
   Add skills/ if needed
            ↓
   Add tools.py if needed
            ↓
   Restart server
```

## Steps

1. **Create folder** - `studio/agents/{agent_name}/`
2. **Create role.md** - Core persona, rules, workflow
3. **Create config.json** - Display name, title, color
4. **Create skills/** - Agent-specific knowledge (optional)
5. **Create tools.py** - Custom tools (optional)
6. **Create __init__.py** - Empty file for Python
7. **Restart server** - Agent auto-discovered

## Required Files

### config.json
```json
{
  "name": "Musician",
  "title": "Sound Designer",
  "color": "#9b59b6"
}
```

### role.md
```markdown
# Musician

You are the studio's sound designer. You create music and sound effects.

## Rules
- Keep audio files under 1MB
- Document all audio assets

## Workflow
1. Receive task from BOSS
2. Create/find audio
3. Save to assets/audio/
4. Report completion
```

## Optional Files

- `skills/*.md` - Specialized knowledge
- `tools.py` - Custom tool definitions
- `memory.json` - Persistent memory

## Auto-Discovery

`get_all_agent_names()` scans `studio/agents/` for folders with role.md or role.json.
