# User Prompt Pipeline

How user input becomes work.

## Flow

```
User types in Interface
         ↓
   WebSocket to Server
         ↓
   Server posts to Hub
         ↓
   BOSS.respond() triggered
         ↓
   BOSS creates tasks / responds
         ↓
   Response posted to Hub
         ↓
   Broadcast to Interface
```

## Steps

1. **User submits** - Message sent via WebSocket
2. **Hub receives** - `hub.post("user", content)`
3. **BOSS triggered** - `studio.handle_user_message(content)`
4. **BOSS analyzes** - Sees message in context, decides action
5. **BOSS acts** - Creates tasks, delegates, or responds directly
6. **Response posted** - BOSS output goes to Hub

## BOSS Decision Points

| Input | Action |
|-------|--------|
| Simple question | Respond directly |
| Work request | Decompose into tasks, assign to agents |
| Unclear | Ask for clarification |
| Review needed | Check pending tasks first |

## Logging

- User message logged to Hub history
- BOSS response logged to Hub history
- Any created tasks logged to tasks.json
