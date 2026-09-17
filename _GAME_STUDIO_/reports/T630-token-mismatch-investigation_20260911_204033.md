# T630: Token Display Mismatch Investigation

## Summary
Found **critical bug** in token accounting: streaming tokens accumulate incrementally via `_broadcast_live_tokens()` but final totals in `_extract_result()` include **cache_read_tokens**, causing mismatch. Console shows streaming accumulation (69+46 tokens), but task metrics show final total (281,883 input = 33 base + 281,850 cache_read).

## Findings

| Finding | Evidence | Action |
|---------|----------|--------|
| **Streaming tokens exclude cache** | `_broadcast_live_tokens()` accumulates only `input_tokens` from usage events (lines 450-455) | Include cache tokens in streaming |
| **Final totals include cache** | `_extract_result()` line 513: `total_input + cache_read_tokens` | Streaming should match final calculation |
| **Console shows streaming only** | Log: "tokens: in=69, out=46" vs Task: 281,883+1,162 | 281k difference = cache_read_tokens |
| **Two separate paths** | Streaming: `_streaming_*_tokens` | Final: `last_input_tokens` | Unify calculation logic |

### Root Cause
**persistent_claude_cli.py:450-455** (streaming path):
```python
input_t = usage.get("input_tokens", 0)
output_t = usage.get("output_tokens", 0)
self._broadcast_live_tokens(input_t, output_t)  # Missing cache tokens!
```

**persistent_claude_cli.py:507-514** (final path):
```python
total_input = usage.get("input_tokens", 0)
total_output = usage.get("output_tokens", 0)
cache_read = usage.get("cache_read_input_tokens", 0)
self.last_input_tokens = total_input + cache_read  # Cache added here
```

### Data Evidence (T626)
- **Console display:** 69 input + 46 output (streaming totals)
- **Task metrics:** 281,883 input + 1,162 output (final totals)
- **Difference:** 281,814 tokens = cache_read_tokens (281,850) - base input (33)
- **Log timestamp:** 20:29:28-20:29:56 (8 streaming updates)

## Recommendation

**Fix streaming to match final calculation:**

1. **Include cache tokens in `_broadcast_live_tokens()`** - Add cache_creation and cache_read from usage dict
2. **Update signature:** `_broadcast_live_tokens(input, output, cache_read, cache_creation)`
3. **Accumulate all components:** `_streaming_input_tokens` should match final `last_input_tokens`
4. **Why:** Users expect console to show actual billable tokens, not just non-cached portion

**Tradeoff accepted:** Slightly more complex streaming logic, but accurate real-time token display.

## Sources
- backends/backends/persistent_claude_cli.py:117-135 — Streaming broadcast implementation
- backends/backends/persistent_claude_cli.py:450-455 — Event handler (missing cache)
- backends/backends/persistent_claude_cli.py:507-514 — Final extraction (includes cache)
- backends/backends/base.py:111-127 — Token tracking base class
- data/tasks.json:356-360 — T626 actual token breakdown
