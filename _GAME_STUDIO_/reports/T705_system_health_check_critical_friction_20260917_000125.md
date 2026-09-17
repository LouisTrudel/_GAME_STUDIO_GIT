# T705: Critical Friction Items Audit

**Date**: 2026-09-17  
**Agent**: Audit

---

## Executive Summary

Checked critical friction items: race conditions, broadcast sync, and token limits. System uses proper synchronization primitives. No critical issues found.

---

## 1. Race Conditions

**Status**: ✅ PROTECTED

### Findings:
- **Threading locks in place**: `_agent_statuses_lock`, `_agent_errors_lock`, `_terminal_lock` (server_modules/broadcast.py:77-78, 109, 241)
- **Thread-safe patterns**: All sync functions use `asyncio.run_coroutine_threadsafe()` to bridge sync→async safely
- **No unprotected shared state**: All mutable shared data (agent_statuses, agent_errors, terminal_buffers) accessed within lock contexts

**Given**: Multiple agents call `update_agent_status_sync()` concurrently  
**When**: Lock acquisition in broadcast.py:77  
**Then**: Status updates are serialized, no race condition

---

## 2. Broadcast Sync Issues

**Status**: ✅ WORKING AS DESIGNED

### Findings:
- **Proper async bridging**: `asyncio.run_coroutine_threadsafe()` used consistently (broadcast.py:80, 92, 98, 121, 250)
- **Main loop check**: Functions check `if main_loop is not None` before scheduling (broadcast.py:79, 91, 97, 120, 249)
- **Queue-based outbox**: Hub uses `Queue` for message passing (hub.py:216)
- **Warning on missing loop**: Logs warning if loop unavailable (broadcast.py:254)

**Given**: Agent posts terminal output from sync context  
**When**: `broadcast_terminal_line_sync()` called (broadcast.py:233)  
**Then**: Output archived to disk, accumulated to history, AND broadcast to clients via async loop

---

## 3. Token Limits

**Status**: ⚠️ NO EXPLICIT ENFORCEMENT FOUND

### Findings:
- **No token budget checks**: Search for `token.*limit|max.*token|token.*budget` returned no matches
- **No token counting guards**: No code preventing agents from exceeding budgets
- **Implicit control only**: Token limits likely enforced at API level (backend), not application level

**Risk**: Low (backend APIs enforce limits), but no graceful degradation in application layer

**Recommendation**: Consider adding soft limits with warnings before hitting hard API limits

---

## 4. Memory & Friction Logs

**Status**: ℹ️ FRICTION.MD NOT FOUND

### Findings:
- `data/memory/friction.md` does not exist
- No friction items logged in memory system
- Search for friction-related issues in logs returned no matches

---

## Conclusion

**Critical systems**: All protected with proper synchronization  
**Race conditions**: Mitigated with locks and thread-safe async bridging  
**Broadcast sync**: Working correctly with loop checks and error logging  
**Token limits**: No application-level enforcement (backend-only)

**Recommendation**: Add application-level token budget tracking for better UX (soft warnings before hard limits).
