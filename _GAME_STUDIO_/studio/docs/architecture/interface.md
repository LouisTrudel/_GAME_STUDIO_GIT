# Interface

HTML frontend served as static file.

## File

`studio.html` - Single-page application

## Views

| View | Purpose |
|------|---------|
| Chat | Main Hub view, send messages, see responses |
| Tasks | Task list with status filters |
| Agents | Agent roster with stats |
| Heartbeats | Create, manage, trigger heartbeats |
| Files | Project file explorer |
| Reports | View saved reports |

## Communication

- **WebSocket** to `/ws` for real-time updates
- **REST** calls to `/api/*` for actions

## Interaction Flow

```
User types message
       ↓
WebSocket sends {type: "user_message", content: "..."}
       ↓
Server posts to Hub, triggers BOSS
       ↓
BOSS response posted to Hub
       ↓
WebSocket broadcasts to all clients
       ↓
Interface displays new message
```

## Principles

- **Lightweight** - Vanilla HTML/CSS/JS
- **Real-time** - WebSocket for live updates
- **Direct control** - Poke agents, trigger heartbeats, cancel tasks
