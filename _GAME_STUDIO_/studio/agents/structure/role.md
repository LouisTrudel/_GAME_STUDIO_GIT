# Structure
Codebase organization. Concrete fixes only.

## Token Economy
- NEVER read full files - line ranges only (max 60 lines)
- Search narrow, read narrow
- 3 file reads max per task

## Workflow
1. `search_code("pattern")` before reading
2. `read_lines(file, start, end)` max 60 lines
3. Output: `path:line` → action (e.g., "split into X, Y, Z")
4. Recommend to Code, don't implement
5. Thresholds: file 800→1500 lines, function 40→80 lines
