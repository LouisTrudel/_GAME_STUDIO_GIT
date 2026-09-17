# T711: Critical Friction Audit

**Date**: 2026-09-17  
**Focus**: Race conditions, broadcast sync, token limits

---

## 1. Race Conditions

### ✅ SAFE: Broadcast Module (`server_modules/broadcast.py`)
- **Proper locking** on shared state:
  - `_agent_statuses_lock` (line 32) protects `agent_statuses` dict
  - `_agent_errors_lock` (line 36) protects `agent_errors` dict
  - `_terminal_lock` (line 41) protects `terminal_buffers` dict
- **Thread-safe async bridge**: All `*_sync` functions use `asyncio.run_coroutine_threadsafe()` (lines 80, 92, 98-100)

### ⚠️ POTENTIAL ISSUE: WebSocket Connections List (`broadcast.py:25`)
```python
connections: list[WebSocket] = []  # Line 25 - NO LOCK
```

**Given**: Multiple threads/coroutines may modify `connections` list  
**When**: `broadcast_to_clients()` removes dead connections (line 60) while new connections are added  
**Then**: Possible race condition on list modification

**Impact**: LOW (WebSocket ops are mostly async, FastAPI handles connection tracking)

---

## 2. Broadcast Sync

### ✅ GOOD: Sync-to-Async Bridge Pattern
All broadcast functions use `asyncio.run_coroutine_threadsafe()`:
- `update_agent_status_sync()` → line 80
- `broadcast_thinking_sync()` → line 92
- `broadcast_live_tokens_sync()` → lines 98-100
- `broadcast_error_sync()` → (implied from pattern)

### ✅ GOOD: Error Handling
Import errors gracefully handled:
```python
try:
    from server_modules.broadcast import broadcast_tasks_sync
    broadcast_tasks_sync()
except ImportError:
    pass  # Server not running (tasks.py:1127, 1152)
```

---

## 3. Token Limits

### ✅ IMPLEMENTED: Session Thresholds
- **BOSS Backend** (`boss_cli.py:23`): `SESSION_TOKEN_THRESHOLD = 150_000`
- **Fleet Backend** (`fleet_cli.py:24`): `SESSION_TOKEN_THRESHOLD = 150_000`

### ⚠️ VERIFICATION NEEDED: Threshold Enforcement
**Could not verify** where these thresholds are **checked and enforced**.  
Search for `150000|session` returned no matches in backends.

**Required**: Check if token counting + session clearing logic exists in:
- `boss_cli.py` (lines 61+)
- `fleet_cli.py` (lines 61+)

---

## 4. Stale Session Cleanup

### ✅ GOOD: Fresh Start on Boot
Both backends delete ALL sessions on module import:
```python
cleanup_old_sessions()  # boss_cli.py:58, fleet_cli.py:59
STALE_TIMEOUT_SECONDS = 1200  # 20 minutes (both files line 22-23)
```

---

## Summary

| Item | Status | Action |
|------|--------|--------|
| Thread locks on shared state | ✅ SAFE | None |
| `connections` list race | ⚠️ MINOR | Consider lock (low priority) |
| Broadcast sync bridge | ✅ GOOD | None |
| Token threshold defined | ✅ DEFINED | Verify enforcement logic |
| Session cleanup | ✅ GOOD | None |

---

## Friction: Low
- **connections** list lacks explicit lock (minor risk)
- **Token threshold** enforcement code not located (verification gap)
