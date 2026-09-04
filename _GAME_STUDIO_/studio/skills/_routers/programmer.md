---
name: programmer-router
description: Routing context for Programmer agent. Always loaded.
---

# Programmer Skills

## MANDATORY

Before writing code, scan these tables. Load matching skills with `load_skill()`.

## Code Location (pick ONE)

| Working on...                          | Load                     |
|----------------------------------------|--------------------------|
| LocalScript, UI, StarterGui            | `:code/roblox/client`    |
| ServerScript, handlers, validation     | `:code/roblox/server`    |
| ModuleScript, ReplicatedStorage        | `:code/roblox/modules`   |

## Feature Domains (load ALL that apply)

| Keywords in task                       | Load                     |
|----------------------------------------|--------------------------|
| shop, money, purchase, price           | `:code/economy`          |
| inventory, slots, items, stacking      | `:code/inventory`        |
| combat, damage, health, hitbox         | `:code/combat`           |
| physics, velocity, raycast             | `:code/physics`          |
| UI, button, menu, screen               | `:code/ui`               |
| data, save, load, DataStore            | `:code/data`             |

## Patterns (load if needed)

| Need...                                | Load                     |
|----------------------------------------|--------------------------|
| Error handling patterns                | `:code/patterns/errors`  |
| State machine                          | `:code/patterns/fsm`     |
| Object pooling                         | `:code/patterns/pooling` |
| Event-driven architecture              | `:code/patterns/events`  |

## Templates (copy-paste code)

| Need working example                   | Load                     |
|----------------------------------------|--------------------------|
| RemoteEvent handler                    | `:templates/remote`      |
| DataStore wrapper                      | `:templates/datastore`   |
| Tween sequence                         | `:templates/tween`       |

## Quick Rules (always apply)

- `task.spawn()` / `task.wait()` — never `spawn()` / `wait()`
- `pcall` → always log errors: `if not ok then warn(err) end`
- Never trust client → validate all input on server
- Silent failure is evil → `warn()` before every early return
