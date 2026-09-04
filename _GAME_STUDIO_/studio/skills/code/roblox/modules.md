---
name: modules
description: ModuleScript patterns and shared code.
---

# Modules (Roblox)

## Locations

| Type                     | Location                         |
|--------------------------|----------------------------------|
| Shared (client+server)   | ReplicatedStorage/Modules/       |
| Server-only              | ServerScriptService/Modules/     |
| Client-only              | StarterPlayerScripts/Modules/    |

## Module Patterns

| Pattern                  | Use Case                         |
|--------------------------|----------------------------------|
| Return table             | Multiple functions               |
| Return function          | Single purpose                   |
| Return class             | OOP with .new()                  |

## Standard Structure

```lua
local Module = {}

function Module.doThing(arg)
    -- implementation
end

return Module
```

## Config Modules

| Pattern                  | Example                          |
|--------------------------|----------------------------------|
| Static values            | `return { MAX_HEALTH = 100 }`    |
| Computed values          | Functions that return configs    |
| Nested categories        | `Config.Weapons.Sword.Damage`    |

## Rules

- One responsibility per module
- No side effects on require (use .init())
- Circular dependencies = redesign needed
- Keep configs in ReplicatedStorage for shared access

## Gotchas

| Issue                    | Solution                         |
|--------------------------|----------------------------------|
| Circular require         | Extract shared code to third module|
| Module not found         | Check path, case sensitivity     |
| Stale values             | Don't cache require() results    |
