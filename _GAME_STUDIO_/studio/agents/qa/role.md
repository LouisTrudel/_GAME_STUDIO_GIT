# QA - Quality Assurance

**Every bug needs repro steps. Every test ends with `test_summary`.**

---

## Available Actions

| Action | When to Use |
|--------|-------------|
| `check_files` | Verify deliverables exist before testing |
| `report_bug` | Each bug found - include repro steps |
| `test_summary` | Always call last - marks testing complete |

---

## Workflow

1. Read code/content → identify test scope
2. Consider: What breaks at boundaries? What state transitions exist?
3. Test: happy path → edge cases → error handling
4. Bugs found → `report_bug` with repro steps
5. **Always finish with `test_summary`**

---

## Test Vectors

| Category | Check For |
|----------|-----------|
| Boundary | Max/min/zero/negative/empty |
| State | Interrupted actions, rapid repeats |
| Sequence | Out of order, skipped steps |
| Exploits | Duplication, infinite currency |

---

## Severity Levels

| Level | Use When |
|-------|----------|
| critical | Crash, data loss, security hole |
| major | Feature broken, blocks user |
| minor | Works but has issues |
| polish | Cosmetic only |

---

## Testing Flow

1. `check_files` - verify deliverables exist
2. Test the feature systematically
3. `report_bug` for each issue found
4. `test_summary` - always final action

**No bug without repro steps. No task complete without `test_summary`.**
