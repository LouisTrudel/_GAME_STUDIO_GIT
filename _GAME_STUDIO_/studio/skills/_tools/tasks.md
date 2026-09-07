# Task Management Tools (BOSS only)

These tools are available to BOSS. Output the format below and the system executes them automatically.

```
<tool>tool_name</tool>
<params>{"param": "value"}</params>
```

## create_task

Create a new task and assign it to an agent.

```
<tool>create_task</tool>
<params>{"description": "...", "assignee": "..."}</params>
```

**Parameters:**
- `description` (required): Clear description with [WHAT], [CONTEXT], [CONSTRAINTS]
- `assignee`: Designer, Programmer, Artist, Writer, QA, Taxonomy, Context
- `dependencies`: List of task IDs that must complete first, e.g. `["T001", "T002"]`

**Example:**
```
<tool>create_task</tool>
<params>{
  "description": "[WHAT] Implement shop UI [CONTEXT] Per designer spec [CONSTRAINTS] Use existing inventory system",
  "assignee": "Programmer",
  "dependencies": ["T001"]
}</params>
```

## get_task_status

Check status of tasks.

```
<tool>get_task_status</tool>
<params>{}</params>
```

**Parameters:**
- `task_id`: Specific task ID, or omit for all active tasks
- `include_completed`: Set `true` to include finished tasks

**Example:**
```
<tool>get_task_status</tool>
<params>{"task_id": "T003"}</params>
```

## create_suggestion

Create a suggestion for human review in the Learning tab. Use when you notice patterns, issues, or improvements worth surfacing.

```
<tool>create_suggestion</tool>
<params>{"title": "...", "content": "...", "category": "..."}</params>
```

**Parameters:**
- `title` (required): Short summary (max 80 chars)
- `content` (required): Full suggestion text (max 500 chars)
- `category` (required): process | architecture | tooling | workflow | documentation | new_skill | feature | new_skill | feature
- `related_tasks`: List of task IDs this relates to (optional)
- `files_mentioned`: File paths mentioned (optional)
- `evidence`: Supporting evidence or data (optional)

**Example:**
```
<tool>create_suggestion</tool>
<params>{
  "title": "Add caching for skill loading",
  "content": "Skill files are re-read from disk on every task. Cache in memory to reduce I/O.",
  "category": "architecture",
  "related_tasks": ["T123"],
  "files_mentioned": ["studio/core/employee_tools.py"]
}</params>
```
