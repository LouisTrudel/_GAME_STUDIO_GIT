---
name: events
description: Event-driven architecture patterns.
---

# Event Systems

## BindableEvent (Same Context)

| Use For                  | Location                         |
|--------------------------|----------------------------------|
| Server-to-server         | ServerScriptService              |
| Client-to-client         | ReplicatedStorage or local       |
| Module communication     | Decouple modules                 |

## RemoteEvent (Cross Boundary)

| Direction                | Method                           |
|--------------------------|----------------------------------|
| Client → Server          | FireServer()                     |
| Server → Client          | FireClient(player)               |
| Server → All             | FireAllClients()                 |

## Event Naming

| Pattern                  | Example                          |
|--------------------------|----------------------------------|
| Past tense for signals   | PlayerDied, ItemCollected        |
| Imperative for requests  | RequestPurchase, TriggerAbility  |
| On prefix for handlers   | OnPlayerDied, OnItemCollected    |

## Custom Event System

```lua
local Signal = {}
Signal.__index = Signal

function Signal.new()
    return setmetatable({listeners = {}}, Signal)
end

function Signal:Connect(fn)
    table.insert(self.listeners, fn)
    return function() -- disconnect
        table.remove(self.listeners, table.find(self.listeners, fn))
    end
end

function Signal:Fire(...)
    for _, fn in self.listeners do
        task.spawn(fn, ...)
    end
end
```

## Rules

- Disconnect on cleanup (store connection, call :Disconnect())
- Don't fire in loops without throttle
- Validate data on receive (especially RemoteEvents)
- Use BindableEvent for same-side, RemoteEvent for cross-boundary
