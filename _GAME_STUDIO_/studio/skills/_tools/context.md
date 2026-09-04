# Context Tools (Shared Brain)

Use these tools to read/write project context.

## read_context

Read the project's CONTEXT.md shared brain.

```
<tool>read_context</tool>
<params>{}</params>
```

**Parameters:**
- `project_id`: Project folder name. Defaults to "default".

**Returns:** Cross-agent signals, decisions, blockers.

## signal_agent

Send a signal to another agent via CONTEXT.md.

```
<tool>signal_agent</tool>
<params>{"to_agent": "...", "message": "..."}</params>
```

**Parameters:**
- `to_agent` (required): Target agent (Programmer, Designer, Artist, Writer, QA)
- `message` (required): What they need to know
- `project_id`: Project folder name. Defaults to "default".

**Example:**
```
<tool>signal_agent</tool>
<params>{
  "to_agent": "Programmer",
  "message": "Economy uses 3 tiers: 10, 50, 200 coins"
}</params>
```

Creates entry: `[DESIGNER -> PROGRAMMER] Economy uses 3 tiers...`
