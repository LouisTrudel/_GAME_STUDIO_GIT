---
name: pooling
description: Object pooling patterns for performance.
---

# Object Pooling

## When to Use

| Use Pooling              | Don't Pool                       |
|--------------------------|----------------------------------|
| Bullets, projectiles     | Unique complex objects           |
| Particles (manual)       | Rare spawns (< 1/sec)            |
| UI elements (lists)      | Static scene objects             |
| NPCs in waves            | Player characters                |

## Basic Pool

```lua
local Pool = {}
Pool.__index = Pool

function Pool.new(template, initialSize)
    local self = setmetatable({
        template = template,
        available = {},
        active = {},
    }, Pool)

    for i = 1, initialSize do
        self:_create()
    end

    return self
end

function Pool:_create()
    local obj = self.template:Clone()
    obj.Parent = nil -- inactive
    table.insert(self.available, obj)
end

function Pool:get()
    local obj = table.remove(self.available)
    if not obj then
        self:_create()
        obj = table.remove(self.available)
    end
    table.insert(self.active, obj)
    return obj
end

function Pool:release(obj)
    table.remove(self.active, table.find(self.active, obj))
    obj.Parent = nil
    -- Reset state here
    table.insert(self.available, obj)
end
```

## Reset Checklist

| Reset on release         | Why                              |
|--------------------------|----------------------------------|
| Position/CFrame          | Don't spawn at old location      |
| Velocity                 | Stop movement                    |
| Properties (color, etc)  | Return to default                |
| Connections              | Disconnect temporary listeners   |

## Rules

- Pre-warm pool at load time
- Reset ALL state on release
- Grow pool if empty (don't error)
- Track active count for debugging
