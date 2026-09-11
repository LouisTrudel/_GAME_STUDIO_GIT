# T529: Token Stream Display Investigation

## Summary

Token stream indicator only appears at task end because **backend buffers all stdout in a list before parsing events**. Live token broadcasts happen during event parsing loop, which runs AFTER the CLI process completes.

## Findings

| Finding | Evidence | Action |
|---------|----------|--------|
| Events parsed AFTER process ends | `persistent_claude_cli.py:334-344` - `for line in stdout_lines` loop runs after `process.poll()` returns | Stream events live instead of buffering |
| Broadcast mechanism works correctly | `broadcast.py:103-111` - async broadcast to all WebSocket clients | No change needed |
| Frontend displays correctly | `studio-tasks.js:216-219` - shows liveTokens for in_progress tasks | No change needed |
| Reader threads buffer, not stream | Lines 300-310: threads append to list, then loop processes after join | Change to callback-based streaming |

## Root Cause Analysis

```
Current Flow (WRONG):
1. Start CLI process
2. Reader thread: collect ALL stdout lines into list
3. Wait for process to complete
4. THEN: for each line, parse event, broadcast tokens
5. Frontend: receive tokens all at once, show "9"

Correct Flow (NEEDED):
1. Start CLI process  
2. Reader thread: for each line received, IMMEDIATELY parse and broadcast
3. Frontend: receive progressive updates (1, 2, 3... 9)
```

## Code Path

1. `persistent_claude_cli.py:300-310` - `read_stdout()` function buffers:
```python
def read_stdout():
    for line in process.stdout:
        stdout_lines.append(line.strip())  # <-- BUFFERING, not processing
```

2. `persistent_claude_cli.py:335-344` - Events parsed AFTER process ends:
```python
for line in stdout_lines:  # <-- Runs after process.poll() is None
    event = json.loads(line)
    self._process_event(event, text_content)  # <-- broadcast_live_tokens called here
```

## Recommendation

Modify `read_stdout()` to process and broadcast events immediately:

```python
def read_stdout():
    nonlocal last_output_time
    for line in process.stdout:
        last_output_time = time.time()
        line = line.strip()
        stdout_lines.append(line)
        # Stream events live
        if line:
            try:
                event = json.loads(line)
                self._process_event(event, text_content)  # Broadcasts immediately
            except json.JSONDecodeError:
                pass
```

**Tradeoff**: Slightly more complex error handling since parsing happens in reader thread, but enables real-time token display.

## Files to Modify

- `backends/backends/persistent_claude_cli.py:300-310` - Change from buffered to streaming event processing
