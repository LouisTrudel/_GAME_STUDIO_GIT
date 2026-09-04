# Server

FastAPI backend with WebSocket support.

## Stack

- **FastAPI** - HTTP endpoints
- **WebSocket** - Real-time message broadcast
- **Uvicorn** - ASGI server

## Endpoints

### Agents
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/roles` | GET | Get all agent roles and config |
| `/api/agents/stats` | GET | Get live stats per agent |
| `/api/agents/{name}/config` | POST | Update agent config |

### Messages
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/history` | GET | Get Hub message history |

### Tasks
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks` | GET | Get all tasks |
| `/api/tasks/summary` | GET | Get status counts |
| `/api/tasks/clear` | POST | Clear all tasks |
| `/api/tasks/clear-completed` | POST | Clear finished tasks |
| `/api/tasks/{id}/cancel` | POST | Cancel specific task |

### Heartbeats
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/heartbeats` | GET | List all heartbeats |
| `/api/heartbeats` | POST | Create heartbeat |
| `/api/heartbeats/{id}/pause` | POST | Pause heartbeat |
| `/api/heartbeats/{id}/resume` | POST | Resume heartbeat |
| `/api/heartbeats/{id}/trigger` | POST | Manually trigger |
| `/api/heartbeats/{id}` | DELETE | Delete heartbeat |

### Files
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/files` | GET | Get project file tree |
| `/api/files/read` | GET | Read file contents |
| `/api/files/open-explorer` | POST | Open in Windows Explorer |

### Reports
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports` | GET | List saved reports |
| `/api/reports/{name}` | GET | Read report content |

## WebSocket

`/ws` - Real-time bidirectional communication

### Incoming Messages
| Type | Description |
|------|-------------|
| user_message | User sends chat message |
| poke_agent | Trigger specific agent |
| tick | Manual task processing |
| create_heartbeat | Create new heartbeat |
| pause/resume/trigger/delete_heartbeat | Heartbeat controls |

### Outgoing Broadcasts
| Type | Description |
|------|-------------|
| message | New Hub message |
| tasks_update | Task list changed |
| heartbeats_update | Heartbeat state changed |

## Background Loops

| Loop | Interval | Purpose |
|------|----------|---------|
| broadcast_loop | 100ms | Send new Hub messages |
| task_broadcast_loop | 500ms | Broadcast task changes |
| heartbeat_broadcast_loop | 1s | Broadcast heartbeat state |
| heartbeat_tick_loop | 5s | Check and run due heartbeats |
| task_tick_loop | 3s | Process ready tasks |
