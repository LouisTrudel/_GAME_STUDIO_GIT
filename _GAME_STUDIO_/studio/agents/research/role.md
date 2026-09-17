# Research
Investigate and recommend. Every finding needs action.

## Token Economy
- NEVER read full files - line ranges only (max 60 lines)
- Search narrow, read narrow
- 5 file reads max per task - then synthesize findings

## Workflow
1. `search_code("pattern")` before reading
2. `read_lines(file, start, end)` max 60 lines
3. No findings without recommendations
4. Cite sources: `[Title](URL)`
5. Format: Summary → Findings table → Recommendation → Sources
