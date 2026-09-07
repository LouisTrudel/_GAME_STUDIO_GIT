# Technical Feasibility: Lola's Patterns on Windows/FastAPI

**Task:** T026
**Agent:** Programmer
**Date:** 2026-09-04

---

## Pattern Evaluation Matrix

| Pattern | Windows OK? | FastAPI Fit? | LOC Est. | Dependencies | Risk |
|---------|-------------|--------------|----------|--------------|------|
| SIGTTOU workaround | N/A | N/A | 0 | None | **None** |
| Done markers | **Yes** | **Yes** | ~30 | None | Low |
| Push-wake UDP | **Yes** | **Yes** | ~50 | None | Low |
| Tee capture | **Partial** | Yes | ~20 | PowerShell | Medium |
| Stale recovery | **Yes** | **Yes** | ~40 | None | Low |
| tmux send-keys | **No** | N/A | N/A | tmux (Unix) | N/A |

---

## Detailed Analysis

### 1. SIGTTOU Problem

**Does this affect us?** **No.**

The SIGTTOU issue is Unix-specific. It occurs when a background process tries to write to a terminal it doesn't own. Windows has no SIGTTOU signal — processes can write to any console they have a handle to.

**Our current approach:** We use `subprocess.run()` with `capture_output=True` via the Claude CLI backend (`agents/backends/claude_cli.py`). This works fine on Windows because:
- No signal-based terminal control
- Claude CLI writes to pipes, not a terminal
- We capture output directly

**Verdict:** No action needed. Lola's tmux workaround solves a problem we don't have.

---

### 2. Done Markers

**Windows compatible?** **Yes.**

The pattern: Write `echo $? > done_marker` after command completion, poll for file existence.

**Windows equivalent:**
```python
# PowerShell version
cmd = f"claude -p ... ; $LASTEXITCODE | Out-File -FilePath {done_marker}"

# Or simpler: just write "done" on completion
Path(done_marker).write_text("done")
```

**Our current approach:** We use synchronous `subprocess.run()` which blocks until completion — no polling needed. The CLI backend captures output directly via pipes.

**When would we need this?** If we switch to async dispatch (fire-and-forget to background processes). Currently not needed.

**Verdict:** Easy to implement if we go async. Not needed for current sync architecture.

---

### 3. Push-Wake UDP

**Windows compatible?** **Yes.**

UDP sockets work identically on Windows. The pattern:
- Backend sends UDP datagram when task is created
- Listener sets `threading.Event` to wake agent loops

**Implementation:**
```python
import socket
import threading

wake_event = threading.Event()

def push_wake(port=9999):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.sendto(b"wake", ("127.0.0.1", port))

def listener(port=9999):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(("127.0.0.1", port))
    while True:
        sock.recv(1024)
        wake_event.set()
```

**LOC:** ~50 lines including error handling.

**Our current approach:** We poll via `tick()` called from FastAPI SSE endpoint. The server loops calling `studio.tick()` every iteration.

**Benefit:** Would reduce latency from poll interval to near-instant. Our current tick loop already runs continuously when the SSE endpoint is active, so benefit is marginal.

**Verdict:** Clean pattern, easy to implement. Low priority since our SSE loop already provides fast response.

---

### 4. Tee Capture

**Windows compatible?** **Partial.**

The pattern: `claude -p ... | tee output.txt` to simultaneously display and capture output.

**Windows issues:**
- No native `tee` command
- PowerShell has `Tee-Object` but behaves differently
- Git Bash provides `tee` but adds complexity

**Alternative approaches:**
1. **Redirect only:** `claude -p ... > output.txt 2>&1` (no live display)
2. **PowerShell:** `claude -p ... | Tee-Object -FilePath output.txt`
3. **Python capture:** Use `subprocess.Popen` with threading to read stdout while writing to file

**Our current approach:** `subprocess.run(capture_output=True)` captures everything in memory. No file needed.

**Verdict:** Not needed for our sync architecture. If we go async, PowerShell's `Tee-Object` works.

---

### 5. Stale Recovery

**Windows compatible?** **Yes.**

The pattern: Tasks claimed >35 minutes are considered stale and reset to pending.

**We already have this:** See `studio.py:474`:
```python
recovered = task_manager.recover_stale_tasks()
```

**Implementation in our codebase:** `studio/core/tasks.py` handles recovery via `claimed_at` timestamps.

**Verdict:** Already implemented. Lola's approach validates ours.

---

### 6. tmux send-keys

**Windows compatible?** **No.**

tmux is Unix-only. Windows alternatives:
- **Windows Terminal tabs:** No programmatic send-keys equivalent
- **ConEmu/Cmder:** Limited automation APIs
- **PowerShell jobs:** Background execution, no terminal UI

**Why Lola uses this:** To make Claude the foreground process and avoid SIGTTOU.

**Why we don't need this:** Windows doesn't have SIGTTOU. Our `subprocess.run()` approach works fine.

**Verdict:** Not applicable to Windows. Skip entirely.

---

## Summary: What to Adopt

| Pattern | Recommendation | Rationale |
|---------|----------------|-----------|
| SIGTTOU workaround | **IGNORE** | Unix-only problem |
| Done markers | **DEFER** | Only needed if we go async |
| Push-wake UDP | **CONSIDER** | Easy win, marginal benefit with current SSE loop |
| Tee capture | **IGNORE** | Not needed with sync subprocess |
| Stale recovery | **ALREADY HAVE** | Validates our design |
| tmux send-keys | **IGNORE** | Unix-only, unnecessary on Windows |

---

## Architecture Comparison

| Aspect | Lola's Design | Our Design | Notes |
|--------|---------------|------------|-------|
| Dispatch method | tmux send-keys (async) | subprocess.run (sync) | Ours is simpler, works on Windows |
| Output capture | File + tee | Pipe capture | Ours is cleaner |
| Completion detection | Done markers + polling | Blocking subprocess | Ours is simpler |
| Wake mechanism | UDP push | SSE tick loop | Similar latency in practice |
| State coordination | File-based JSON | File-based JSON | **Identical** |
| Stale recovery | 35-min timeout | Timeout + retry | **Similar** |

**Key insight:** Lola's complexity comes from working around Unix terminal semantics. On Windows with sync subprocess calls, we get the same functionality with less code.

---

## Risks

1. **Subprocess blocking:** Our sync approach blocks the tick loop during agent execution. Long-running tasks prevent other agents from starting. Lola's async dispatch avoids this.

2. **No live output:** Users don't see agent thinking in real-time. Lola's tee approach provides streaming output. (Mitigated by our SSE status updates.)

3. **Scaling:** One agent at a time. Lola can run N agents in parallel across tmux panes. We'd need ThreadPoolExecutor for parallelism.

---

## Recommended Next Steps

1. **Keep current sync architecture** — simpler, works, Windows-native
2. **Add parallel dispatch** if needed — ThreadPoolExecutor, not tmux
3. **Consider push-wake** for faster task pickup — ~50 LOC, low risk
4. **Skip Unix-specific patterns** — SIGTTOU, tmux, tee

The shared-brain pattern (CONTEXT.md, file-based coordination) is the real value from Lola's design — and we already have it.
