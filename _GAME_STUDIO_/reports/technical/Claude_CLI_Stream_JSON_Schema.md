# Claude CLI Stream-JSON Event Schema

## Summary

Complete field inventory for Claude CLI `--output-format stream-json --verbose` events. Captured from actual runs with Claude Code v2.1.29 using claude-opus-4-5-20251101.

## Event Types

### 1. `system` (subtype: `init`)

First event on every session. Contains environment and capability data.

```json
{
  "type": "system",
  "subtype": "init",
  "cwd": "C:\\Users\\lou\\...\\path",
  "session_id": "uuid",
  "tools": ["Task", "Bash", "Read", "Edit", "Write", ...],
  "mcp_servers": [
    {"name": "claude.ai Google Drive", "status": "needs-auth"}
  ],
  "model": "claude-opus-4-5-20251101",
  "permissionMode": "default",
  "slash_commands": ["keybindings-help", "napkin", ...],
  "apiKeySource": "none",
  "claude_code_version": "2.1.29",
  "output_style": "default",
  "agents": ["Bash", "general-purpose", "Explore", "Plan"],
  "skills": ["keybindings-help", "napkin", "roblox-mcp"],
  "plugins": [],
  "uuid": "uuid"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `cwd` | string | Working directory |
| `session_id` | string | Session identifier |
| `tools` | string[] | Available tool names |
| `mcp_servers` | object[] | MCP server status |
| `model` | string | Model identifier |
| `permissionMode` | string | Permission mode (default/bypass) |
| `slash_commands` | string[] | Available commands |
| `apiKeySource` | string | API key source |
| `claude_code_version` | string | CLI version |
| `agents` | string[] | Available agent types |
| `skills` | string[] | Loaded skills |
| `uuid` | string | Event UUID |

---

### 2. `system` (subtype: `api_retry`)

Emitted when API call fails and retries.

```json
{
  "type": "system",
  "subtype": "api_retry",
  "attempt": 1,
  "max_retries": 10,
  "retry_delay_ms": 1000,
  "error": "rate_limit"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `attempt` | int | Current retry attempt |
| `max_retries` | int | Maximum retries allowed |
| `retry_delay_ms` | int | Delay before retry (ms) |
| `error` | string | Error category: `rate_limit`, `overloaded`, `server_error` |

---

### 3. `assistant` (LLM Response)

Emitted for each model response turn. Contains message with usage data.

```json
{
  "type": "assistant",
  "message": {
    "model": "claude-opus-4-5-20251101",
    "id": "msg_xxxxx",
    "type": "message",
    "role": "assistant",
    "content": [
      {"type": "text", "text": "..."},
      {"type": "tool_use", "id": "toolu_xxx", "name": "Read", "input": {...}, "caller": {"type": "direct"}}
    ],
    "stop_reason": null,
    "stop_sequence": null,
    "stop_details": null,
    "usage": {
      "input_tokens": 3,
      "cache_creation_input_tokens": 2050,
      "cache_read_input_tokens": 17937,
      "cache_creation": {
        "ephemeral_5m_input_tokens": 0,
        "ephemeral_1h_input_tokens": 2050
      },
      "output_tokens": 1,
      "service_tier": "standard",
      "inference_geo": "not_available"
    },
    "context_management": null
  },
  "parent_tool_use_id": null,
  "session_id": "uuid",
  "uuid": "uuid"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `message.id` | string | Anthropic message ID |
| `message.model` | string | Model used |
| `message.content` | array | Content blocks (text/tool_use) |
| `message.usage.input_tokens` | int | **Actual input tokens (non-cached)** |
| `message.usage.output_tokens` | int | **Actual output tokens** |
| `message.usage.cache_creation_input_tokens` | int | Tokens written to cache |
| `message.usage.cache_read_input_tokens` | int | Tokens read from cache |
| `message.usage.cache_creation.ephemeral_1h_input_tokens` | int | 1-hour cache tokens |
| `message.usage.service_tier` | string | Service tier used |
| `parent_tool_use_id` | string | Parent tool ID if nested |
| `session_id` | string | Session ID |

**Content Block Types:**
- `text`: Plain text response (`{"type": "text", "text": "..."}`)
- `tool_use`: Tool invocation (`{"type": "tool_use", "id": "...", "name": "...", "input": {...}}`)

---

### 4. `user` (Tool Result)

Emitted when tool completes and result is sent back to model.

```json
{
  "type": "user",
  "message": {
    "role": "user",
    "content": [
      {
        "tool_use_id": "toolu_xxx",
        "type": "tool_result",
        "content": "... file contents or result ..."
      }
    ]
  },
  "parent_tool_use_id": null,
  "session_id": "uuid",
  "uuid": "uuid",
  "tool_use_result": {
    "type": "text",
    "file": {
      "filePath": "C:\\path\\to\\file.py",
      "content": "...",
      "numLines": 91,
      "startLine": 1,
      "totalLines": 91
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `message.content[].tool_use_id` | string | Matching tool_use ID |
| `message.content[].type` | string | Always "tool_result" |
| `message.content[].content` | string | Tool output |
| `tool_use_result.type` | string | Result type (text/error) |
| `tool_use_result.file` | object | File metadata if applicable |

**For Error Results:**
```json
{
  "type": "user",
  "message": {
    "content": [{
      "tool_use_id": "toolu_xxx",
      "type": "tool_result",
      "content": "Error: File not found",
      "is_error": true
    }]
  }
}
```

---

### 5. `result` (Final Summary)

Last event. Contains aggregate metrics for entire session.

```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 6992,
  "duration_api_ms": 6850,
  "num_turns": 2,
  "result": "The file `server.py` has **90 lines**...",
  "session_id": "uuid",
  "total_cost_usd": 0.04178175,
  "usage": {
    "input_tokens": 4,
    "cache_creation_input_tokens": 3175,
    "cache_read_input_tokens": 37936,
    "output_tokens": 118,
    "server_tool_use": {
      "web_search_requests": 0,
      "web_fetch_requests": 0
    },
    "service_tier": "standard",
    "cache_creation": {
      "ephemeral_1h_input_tokens": 3175,
      "ephemeral_5m_input_tokens": 0
    }
  },
  "modelUsage": {
    "claude-opus-4-5-20251101": {
      "inputTokens": 4,
      "outputTokens": 118,
      "cacheReadInputTokens": 37936,
      "cacheCreationInputTokens": 3175,
      "webSearchRequests": 0,
      "costUSD": 0.04178175,
      "contextWindow": 200000,
      "maxOutputTokens": 64000
    }
  },
  "permission_denials": [],
  "uuid": "uuid"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `is_error` | bool | **True if task failed** |
| `duration_ms` | int | **Total wall-clock time** |
| `duration_api_ms` | int | Time spent in API calls |
| `num_turns` | int | **Number of LLM turns** |
| `result` | string | **Final text output** |
| `total_cost_usd` | float | **Total cost in USD** |
| `usage.input_tokens` | int | Total non-cached input |
| `usage.output_tokens` | int | **Total output tokens** |
| `usage.cache_read_input_tokens` | int | Total cached input tokens |
| `usage.cache_creation_input_tokens` | int | Tokens added to cache |
| `usage.server_tool_use.web_search_requests` | int | Web searches used |
| `modelUsage.[model].costUSD` | float | Per-model cost breakdown |
| `modelUsage.[model].contextWindow` | int | Model context limit |
| `permission_denials` | array | Permission errors if any |

---

## Key Findings for Token Tracking

### Why Current Code Shows 0 Tokens

The current `claude_cli.py:268-271` reads tokens from `assistant.message.usage`:
```python
usage = message.get("usage", {})
input_tokens = usage.get("input_tokens", 0)
output_tokens = usage.get("output_tokens", 0)
```

**Problem**: `input_tokens` in per-turn events is often 1-3 (just the delta), not cumulative. Cache reads aren't counted.

### Correct Token Sources

| Metric | Source | Path |
|--------|--------|------|
| Total Input | `result` event | `usage.input_tokens + usage.cache_read_input_tokens` |
| Total Output | `result` event | `usage.output_tokens` |
| Total Cost | `result` event | `total_cost_usd` |
| Per-turn Input | `assistant` event | `message.usage.input_tokens` |
| Cached Input | `result` event | `usage.cache_read_input_tokens` |

### Billable Token Calculation

```
Billable = input_tokens + (cache_read_input_tokens * 0.1) + (cache_creation_input_tokens * 1.25) + output_tokens
```

But `total_cost_usd` already calculates this for you.

---

## Recommendations

### 1. Use `result` Event for Final Metrics

```python
if result_data:
    self.last_input_tokens = result_data.get("usage", {}).get("input_tokens", 0)
    self.last_output_tokens = result_data.get("usage", {}).get("output_tokens", 0)
    self.last_cache_read = result_data.get("usage", {}).get("cache_read_input_tokens", 0)
    self.last_cost_usd = result_data.get("total_cost_usd", 0.0)
    self.last_duration_ms = result_data.get("duration_ms", 0)
    self.last_num_turns = result_data.get("num_turns", 0)
```

### 2. Track Cache Efficiency

The `cache_read_input_tokens` vs `cache_creation_input_tokens` ratio shows cache hit rate:
```python
cache_hit_rate = cache_read / (cache_read + cache_creation + input_tokens)
```

### 3. Monitor Permission Denials

`result.permission_denials` array contains blocked tool calls - useful for debugging BOSS restrictions.

### 4. Capture Tool Errors from `user` Events

```python
if event_type == "user":
    for content in event.get("message", {}).get("content", []):
        if content.get("is_error"):
            tool_id = content.get("tool_use_id")
            error_text = content.get("content", "")
```

---

## Event Sequence Example

Simple prompt with tool use:

```
1. system/init        → Environment setup
2. assistant          → First turn: requests tool
3. user               → Tool result returned
4. assistant          → Final response with tool data
5. result             → Summary with total metrics
```

Multi-turn reasoning:

```
1. system/init
2. assistant (turn 1) → "Let me search..."
3. user (tool result)
4. assistant (turn 2) → "Found it, now reading..."
5. user (tool result)
6. assistant (turn 3) → Final answer
7. result             → num_turns: 3
```

---

## Raw Sample Data

### Test 1: Simple Prompt (No Tools)

```json
{"type":"system","subtype":"init","model":"claude-opus-4-5-20251101","tools":["Task","Bash","Read",...]}
{"type":"assistant","message":{"content":[{"type":"text","text":"Hello! How can I help?"}],"usage":{"input_tokens":3,"output_tokens":1,"cache_read_input_tokens":17937}}}
{"type":"result","is_error":false,"duration_ms":1809,"total_cost_usd":0.022096,"usage":{"output_tokens":12}}
```

### Test 2: Tool Use (Read File)

```json
{"type":"system","subtype":"init",...}
{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Read","input":{"file_path":"..."}}]}}
{"type":"user","message":{"content":[{"type":"tool_result","content":"...file contents..."}]},"tool_use_result":{"file":{"numLines":91}}}
{"type":"assistant","message":{"content":[{"type":"text","text":"The file has 90 lines..."}]}}
{"type":"result","num_turns":2,"total_cost_usd":0.04178175}
```
