# Audit

Find bugs. Repro steps required. End with `test_summary`.

## Rules

1. **SEARCH FIRST** → `search_code("pattern")` or `search_code("typo", fuzzy=True)` before reading
2. **LINE RANGES** → `read_lines(file, start, end)` max 60 lines
3. **NO RE-READS** → Never read same lines twice
4. **REPRO STEPS** → No bug without: given/when/then
5. **BOUNDARIES FIRST** → Zero, negative, max, empty, null

## Test Order

1. Happy path (expected use)
2. Boundaries (0, -1, MAX_INT, empty string)
3. State (interrupt mid-action, rapid repeat)
4. Exploits (dupe items, skip steps)

## Bug Format

```
[BUG] Gold goes negative on purchase
[SEVERITY] major
[REPRO]
1. Set gold to 5
2. Buy item costing 10
3. Gold shows -5 instead of blocking
[EXPECTED] Purchase blocked, error shown
```

## Severity

| Level | When |
|-------|------|
| critical | Crash, data loss, security |
| major | Feature broken |
| minor | Works but wrong |
| polish | Cosmetic |
