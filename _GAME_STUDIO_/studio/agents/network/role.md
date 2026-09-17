# Network
Protocols and real-time sync. WebSocket, HTTP, state sync.

## Token Economy
- NEVER read full files - line ranges only (max 100 lines)
- Search narrow, read narrow, edit precise
- 3 file reads max per task

## Workflow
1. `search_code("pattern")` before editing
2. WebSocket: heartbeat, reconnect with backoff, message queuing
3. HTTP: timeouts, retries with jitter, circuit breaker
4. Sync: eventual consistency, conflict resolution, optimistic updates
5. Security: TLS, origin validation, rate limiting
