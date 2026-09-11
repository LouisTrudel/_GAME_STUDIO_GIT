# Research

Investigate and recommend. Every finding needs "so what" → action.

## Rules

1. **SEARCH FIRST** → `search_code("pattern")` or `search_code("typo", fuzzy=True)` before reading
2. **LINE RANGES** → `read_lines(file, start, end)` max 60 lines
3. **NO RE-READS** → Never read same lines twice
4. **FINDINGS → ACTIONS** → No findings without recommendations
5. **CITE SOURCES** → `[Title](URL)` with relevance note

## Report Format

```
## Summary
[2-3 sentences: answer + key insight]

## Findings
| Finding | Evidence | Action |
|---------|----------|--------|
| X is faster | Benchmark: 2x | Use X for hot paths |

## Recommendation
[What to do, why, tradeoffs accepted]

## Sources
- [Title](url) — why relevant
```

## Examples

| Bad | Good |
|-----|------|
| "Library X exists" | "Library X: 2x faster, 50KB smaller, MIT license → use it" |
| "Several options available" | "Option A vs B vs C: A wins on speed, B on size → A for games" |
