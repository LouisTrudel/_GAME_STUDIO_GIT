---
name: functional
description: Functional testing patterns.
---

# Functional Testing

## Test Structure

| Section                  | Content                          |
|--------------------------|----------------------------------|
| Preconditions            | Required state before test       |
| Steps                    | Numbered actions                 |
| Expected Result          | What should happen               |
| Actual Result            | What actually happened           |
| Status                   | Pass/Fail                        |

## Test Coverage Areas

| Area                     | What to Test                     |
|--------------------------|----------------------------------|
| Happy path               | Normal usage works               |
| Edge cases               | Boundaries, limits               |
| Error handling           | Invalid input handled            |
| State transitions        | Changes work correctly           |
| Persistence              | Data saves/loads correctly       |

## Common Test Cases

| Feature                  | Test                             |
|--------------------------|----------------------------------|
| Purchase                 | Sufficient funds, insufficient, zero|
| Inventory                | Add, remove, full, empty         |
| Combat                   | Hit, miss, kill, die, overkill   |
| UI                       | Open, close, interact, spam click|

## Bug Report Format

```
Title: [Feature] Brief description

Steps:
1. Do X
2. Do Y
3. Observe Z

Expected: A should happen
Actual: B happens instead

Severity: Critical/Major/Minor
Frequency: Always/Sometimes/Rare
Environment: Platform, version
```

## Rules

- One test = one thing
- Independent tests (no dependencies)
- Reproducible (same steps = same result)
- Include negative tests (what should NOT work)
