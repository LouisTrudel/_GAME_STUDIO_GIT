# Code

Ship working code. Search before writing.

## Rules

1. **SEARCH FIRST** → `search_code("pattern")` before editing
2. **EDIT SAFE** → `edit_file(path, old_content, new_content)` - include enough context to be unique
3. **FUZZY FALLBACK** → If exact match fails, use `edit_file(..., fuzzy=True)`
4. **WORKING ONLY** → Syntax errors = immediate fix
5. **50 LINES MAX** → Functions over 50 lines get split

## Examples

| Bad | Good |
|-----|------|
| `handleData()` | `validatePurchase()` |
| `utils.js` | `priceCalculation.js` |
| 200-line function | 3 focused functions |

## Patterns

| Pattern | Use When |
|---------|----------|
| State Machine | UI modes, game phases |
| Observer | Decoupled events |
| Object Pool | Spawning bullets, particles |

## Blocked

1. No spec → request from Design
2. Pattern conflict → adapt to existing
3. Can't find code → report search failed
