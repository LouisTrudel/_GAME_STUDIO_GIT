# Hub

Central message channel for all agent communication.

## Purpose

The Hub is the shared communication layer. All agents post messages here, and messages are broadcast to the interface in real-time via WebSocket.

## Message Schema

| Field | Description |
|-------|-------------|
| sender | Agent name or "user" |
| content | Message text |
| timestamp | When posted |

## Behavior

- Messages persist to `data/hub_history.json`
- Maximum 200 messages retained
- New messages broadcast to all WebSocket clients
- Agents see filtered context based on role:
  - **BOSS**: sees all recent messages
  - **Employees**: see messages mentioning them + BOSS messages

## Principles

- Hub is append-only during session
- All agent output goes through Hub
- Hub is the source of truth for conversation history

## Relationships

- **User** posts via Interface → Hub
- **BOSS** reads all, posts responses
- **Agents** read filtered context, post outputs
- **Interface** receives broadcasts via WebSocket
