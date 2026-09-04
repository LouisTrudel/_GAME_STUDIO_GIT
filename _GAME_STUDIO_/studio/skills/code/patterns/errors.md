---
name: errors
description: Error handling patterns.
---

# Error Handling

## Core Pattern

```lua
local ok, result = pcall(function()
    return riskyOperation()
end)

if not ok then
    warn("[System] Error:", result)
    return nil -- or fallback
end
```

## When to Use pcall

| Use pcall                | Don't Use pcall                  |
|--------------------------|----------------------------------|
| DataStore operations     | Normal game logic                |
| HTTP requests            | Math operations                  |
| User-provided data       | Internal function calls          |
| Remote invocations       | Known-safe operations            |

## Error Reporting

| Context                  | Include                          |
|--------------------------|----------------------------------|
| What failed              | Function/operation name          |
| Why it failed            | Error message                    |
| Who triggered            | Player name/UserId               |
| When                     | Timestamp (optional)             |

## Fallback Strategies

| Failure Type             | Strategy                         |
|--------------------------|----------------------------------|
| Data load failed         | Use defaults, warn player        |
| Remote timeout           | Retry once, then fail gracefully |
| Asset not found          | Use placeholder                  |
| Critical error           | Disconnect player with message   |

## Anti-Silent-Failure

| Rule                     | Implementation                   |
|--------------------------|----------------------------------|
| Every early return       | `warn()` first                   |
| Every conditional skip   | `else warn("skipped because")`   |
| Script init complete     | `print("[System] Ready")`        |

## Rules

- Never empty catch blocks
- Log errors with context
- User-friendly messages for players
- Technical details in server logs only
