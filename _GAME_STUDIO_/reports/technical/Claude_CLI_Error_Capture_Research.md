# Claude CLI Error Capture Methods

## Summary

Claude CLI provides structured error/retry visibility through `--output-format stream-json`, but **your current backend captures none of it**. The JSON output mode gives everything you need—retries, tool failures, costs—but requires switching from `subprocess.run()` to line-by-line stream parsing.

## Key Findings

### What's Parseable (Structured Data)

| Event Type | Data Available | How to Capture |
|------------|----------------|----------------|
| `system/api_retry` | attempt #, max_retries, retry_delay_ms, error_status, error category | `--output-format stream-json` |
| `result` | total_cost_usd, total_input/output_tokens, is_error, duration_ms | `--output-format json` or `stream-json` |
| `stream_event` | tool_use_start, tool_result, text_delta | `--output-format stream-json --verbose` |
| `permission_denied` | denied tool calls, reasons | `stream-json` with `--permission-prompts none` |
| Tool errors | `isError: true` flag in tool_result | `stream-json` parsing |

### What's NOT Parseable (Terminal Formatting)

| Visual Element | Why Unparseable |
|----------------|-----------------|
| Progress spinners | ANSI escape codes, not data |
| Colored output | Terminal formatting only |
| Interactive prompts | Designed for TTY, not pipes |
| MCP server startup messages | Stderr, unstructured text |

### Current Backend Gap

Your `claude_cli.py` at lines 146-155:
```python
process = subprocess.Popen(
    cmd,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,  # ← Capturing stderr (good)
    ...
)
```

**Problem**: Using `--output-format json` returns only final result. The `api_retry` events, tool progress, and errors during execution are only visible in `stream-json` mode with line-by-line parsing.

### Stderr Content

Adding `--debug` flag outputs HTTP request/response details to stderr. Otherwise stderr contains:
- MCP server warnings (unstructured)
- Config validation errors
- Startup failures

**Not useful for quality tracking**—these are startup issues, not mid-task errors.

## Analysis

### stream-json Event Structure

```json
{"type": "system", "subtype": "api_retry", "attempt": 1, "max_retries": 10, "retry_delay_ms": 1000, "error": "rate_limit"}
{"type": "stream_event", "event": {"type": "tool_use_start", "tool_name": "Read", "tool_id": "..."}}
{"type": "stream_event", "event": {"type": "tool_result", "tool_id": "...", "isError": true, "content": [...]}}
{"type": "result", "total_cost_usd": 0.05, "is_error": false, "duration_ms": 45000}
```

### Effort vs Value Matrix

| Approach | Effort | Value | Recommendation |
|----------|--------|-------|----------------|
| Add `--debug` flag | Low | Low | Skip—HTTP noise, not quality data |
| Switch to `stream-json` | Medium | High | **Do this** |
| Parse stderr | Low | Very Low | Skip—unstructured, startup-only |
| Request OnApiRetry hook | N/A | High | Wait for Anthropic (open issue) |

## Recommendations

### 1. Implement stream-json Parsing (High Priority)

Modify `claude_cli.py` to use:
```bash
claude -p - --output-format stream-json --verbose
```

Then parse stdout line-by-line, collecting:
- `api_retry` events → log to metrics
- `tool_result` with `isError: true` → track failures
- Final `result` → get actual token counts (not estimates)

### 2. Track Quality Metrics

Create new metrics structure:
```json
{
  "task_id": "T078",
  "retries": 2,
  "tool_errors": ["Read: File not found"],
  "actual_cost_usd": 0.05,
  "actual_tokens": {"input": 1500, "output": 800}
}
```

### 3. Skip Stderr Parsing

Stderr is startup noise, not runtime quality data. Not worth parsing.

### 4. What You Cannot Capture

- **Resolved errors**: If Claude retries internally and succeeds, you see the retry events but not "what went wrong." The error categories (`rate_limit`, `overloaded`, `server_error`) are all you get.
- **Internal reasoning**: Claude's decision to retry vs abort is not exposed.
- **MCP tool internals**: Tool failures come through `isError: true`, but internal MCP retries are invisible.

## Implementation Path

1. **Phase 1**: Switch `--output-format json` → `stream-json` + line parsing
2. **Phase 2**: Collect `api_retry` and `tool_result` errors into metrics
3. **Phase 3**: Add quality dashboard showing retry rates, error categories, costs

## Sources

- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless) - Official headless/subprocess documentation
- [Claude Code stream-json format](https://backgroundclaude.com/blog/stream-json) - Stream event types and structure
- [Claude CLI Protocol](https://github.com/Roasbeef/claude-agent-sdk-go/blob/main/docs/cli-protocol.md) - Message format specification
- [OnApiRetry hook proposal](https://github.com/anthropics/claude-code/issues/46959) - Feature request for retry observability
- [Error reference](https://code.claude.com/docs/en/errors) - Error handling documentation
