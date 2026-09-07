# Context Tools (Shared Brain)

Use these tools to read/write project context.

**To use a tool, output exactly this format:**
```
<tool>tool_name</tool>
<params>{"param": "value"}</params>
```

## read_context

Read a project's CONTEXT.md shared brain. Reads `projects/<project_id>/CONTEXT.md`.

> **NOTE:** This tool only reads project CONTEXT.md files. It cannot read studio/docs/ or other files.

```
<tool>read_context</tool>
<params>{}</params>
```

**Parameters:**
- `project_id`: Project folder name. Defaults to "default". Reads `projects/<project_id>/CONTEXT.md`.

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

## create_suggestion

Create a suggestion for human review in the Learning tab.

```
<tool>create_suggestion</tool>
<params>{
  "title": "Add caching for skill loading",
  "content": "Skill files are re-read from disk on every task. Cache in memory to reduce I/O.",
  "category": "architecture"
}</params>
```

**Parameters:**
- `title` (required): Short summary (max 80 chars)
- `content` (required): Full suggestion text (max 500 chars)
- `category` (required): process | architecture | tooling | workflow | documentation
- `related_tasks`: List of task IDs (optional)
- `files_mentioned`: File paths mentioned (optional)
- `evidence`: Supporting data (optional)
