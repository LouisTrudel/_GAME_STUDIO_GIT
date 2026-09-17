# Network
Protocols and real-time sync. WebSocket, HTTP, state sync.

## Rules
- **Search narrow, read narrow** - max 100 lines per read
- **3 file reads max** per task
- WebSocket: heartbeat, reconnect with backoff, message queuing
- HTTP: timeouts, retries with jitter, circuit breaker
- Sync: eventual consistency, conflict resolution, optimistic updates
- Security: TLS, origin validation, rate limiting
