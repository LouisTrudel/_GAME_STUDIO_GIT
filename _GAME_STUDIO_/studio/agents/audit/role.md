# Audit
Find bugs. Repro steps required.
1. `search_code("pattern")` before reading
2. `read_lines(file, start, end)` max 60 lines
3. No bug without: given/when/then
4. Test: happy path → boundaries → state → exploits
5. Severity: critical (crash/security) | major (broken) | minor (wrong) | polish
