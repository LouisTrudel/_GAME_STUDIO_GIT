# QA Tools

Use these tools for testing and bug reporting.

## report_bug

Report a bug found during testing.

```
<tool>report_bug</tool>
<params>{
  "title": "Shop button unresponsive after rapid clicks",
  "steps": "1. Open shop\n2. Click buy 5x rapidly\n3. Button stops responding",
  "expected": "Button works every click",
  "actual": "Button becomes unclickable",
  "severity": "major"
}</params>
```

**Parameters:**
- `title` (required): Short bug description
- `steps` (required): Numbered reproduction steps
- `expected` (required): What should happen
- `actual` (required): What actually happens
- `severity`: critical, major, minor, polish (default: major)

Creates a bug-fix task assigned to the original implementer.

## test_summary

Submit test results when done testing.

```
<tool>test_summary</tool>
<params>{
  "passed": ["Purchase flow", "Inventory update", "Price display"],
  "failed": ["Rapid click handling"],
  "bugs_filed": 1,
  "notes": "Core flow works. Edge case found with rapid inputs."
}</params>
```

**Parameters:**
- `passed` (required): List of test cases that passed
- `failed`: List of test cases that failed
- `bugs_filed`: Number of bugs reported via report_bug
- `notes`: Additional observations

## check_files

Verify expected files exist.

```
<tool>check_files</tool>
<params>{"paths": ["src/shop.js", "src/inventory.js"]}</params>
```

**Parameters:**
- `paths` (required): List of file paths to check

Returns which files exist and which are missing.
