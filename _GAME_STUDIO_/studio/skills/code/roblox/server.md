---
name: server
description: Server-side Roblox scripting. Handlers, validation, data.
---

# Server (Roblox)

## Locations

| Script Type              | Location                         |
|--------------------------|----------------------------------|
| Core game logic          | ServerScriptService/             |
| Remote handlers          | ServerScriptService/Handlers/    |
| Data management          | ServerScriptService/             |

## Script Naming

| Pattern       | Purpose                              |
|---------------|--------------------------------------|
| *Manager      | DataStore, player state, core systems|
| *Handler      | Process RemoteEvent requests         |
| *Server       | Main system logic                    |
| *Service      | Singleton utility provider           |

## Validation Pattern

```
Client fires → Server receives → Validate → Process → Respond
```

| Validate                 | Why                              |
|--------------------------|----------------------------------|
| Player exists            | May have disconnected            |
| Player owns item         | Prevent duplication              |
| Cooldown passed          | Prevent spam                     |
| Values in range          | Prevent exploits                 |

## Rules

- NEVER trust client data → validate everything
- Store UserId not Player → player may disconnect
- Destroy before create → prevent duplicates
- PlayerRemoving → delay 1s, check if reconnected
- Keep scripts < 500 lines → split if larger

## Gotchas

| Issue                    | Solution                         |
|--------------------------|----------------------------------|
| FireClient fails         | Player left, wrap in pcall       |
| Data not saving          | Check BindToClose, delay enough  |
| Remote spam              | Add cooldown per player          |
