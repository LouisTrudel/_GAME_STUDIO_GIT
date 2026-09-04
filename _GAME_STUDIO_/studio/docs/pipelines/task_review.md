# Task Completion Pipeline

How work gets completed and validated.

## Flow

```
Task status = in_progress
         ↓
   Agent completes work
         ↓
   Agent calls complete_task
         ↓
   Status = approved (done)
```

No automatic review gate. Tasks go directly to approved.

## Testing (Optional)

BOSS can assign QA testing tasks with dependencies:

```
T001: Implement shop (Programmer)
T002: Test shop flow (QA) [depends: T001]
```

QA tests and reports bugs as new tasks:

```
QA finds bug → report_bug() → T003: Fix shop crash (Programmer)
```

## QA Tools

```python
check_files(paths)           # Verify files exist
report_bug(title, desc, assignee, severity)  # Create bug task
test_summary(task_id, passed, summary)       # Report results
```

## Bug Cycle

```
QA assigned testing task
         ↓
   QA tests feature
         ↓
   Bug found → report_bug() → New task for original agent
         ↓
   QA submits test_summary
         ↓
   QA completes testing task
```

## Logging

- Task results stored on task
- QA test summaries in Hub
- Bug tasks linked to original feature
