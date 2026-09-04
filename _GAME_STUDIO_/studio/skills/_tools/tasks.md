# Task Management Tools

Use these tools to create and track tasks.

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
