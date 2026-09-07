# QA Tools

Use these tools for testing and bug reporting.

**To use a tool, output exactly this format:**
```
<tool>tool_name</tool>
<params>{"param": "value"}</params>
```

## report_bug

Report a bug found during testing. Creates a task for the responsible agent to fix.

```
<tool>report_bug</tool>
<params>{
  "title": "Shop button unresponsive after rapid clicks",
  "assignee": "Programmer",
  "description": "Steps: 1. Open shop 2. Click buy 5x rapidly 3. Button stops responding\nExpected: Button works every click\nActual: Button becomes unclickable",
  "severity": "major"
}</params>
```

**Parameters:**
- `title` (required): Short bug description
- `assignee`: Agent to fix the bug (Programmer, Designer, Artist, Writer). Default: Programmer
- `description`: Bug details - steps to reproduce, expected vs actual behavior
- `severity`: critical, major, minor, polish (default: major)

Creates a bug-fix task and notifies the assignee via Hub.

## test_summary

Submit test results when done testing a task. Reports findings to BOSS.

```
<tool>test_summary</tool>
<params>{
  "task_id": "T005",
  "passed": true,
  "summary": "Shop purchase flow works correctly. Tested buy, sell, and inventory sync.",
  "bugs_reported": []
}</params>
```

```
<tool>test_summary</tool>
<params>{
  "task_id": "T005",
  "passed": false,
  "summary": "Core flow works but found edge case with rapid inputs.",
  "bugs_reported": ["T006", "T007"]
}</params>
```

**Parameters:**
- `task_id` (required): The testing task ID you completed (e.g., T005)
- `passed` (required): true if all tests passed, false if bugs were found
- `summary` (required): Brief description of what was tested and findings
- `bugs_reported`: List of bug task IDs created via report_bug (if any)

## check_files

Verify expected files exist.

```
<tool>check_files</tool>
<params>{"paths": ["src/shop.js", "src/inventory.js"]}</params>
```

**Parameters:**
- `paths` (required): List of file paths to check

Returns which files exist and which are missing.
