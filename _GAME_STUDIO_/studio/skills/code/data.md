---
name: data
description: DataStore and data persistence patterns.
---

# Data Persistence

## DataStore Basics

| Method                   | Use For                          |
|--------------------------|----------------------------------|
| GetAsync                 | Load player data                 |
| SetAsync                 | Save player data                 |
| UpdateAsync              | Atomic read-modify-write         |
| RemoveAsync              | Delete data (rare)               |

## Key Naming

| Pattern                  | Example                          |
|--------------------------|----------------------------------|
| Player data              | `user_123456789`                 |
| Global data              | `global_leaderboard`             |
| Versioned                | `user_v2_123456789`              |

## Save Triggers

| When                     | Action                           |
|--------------------------|----------------------------------|
| PlayerRemoving           | Save immediately                 |
| BindToClose              | Save all, wait for completion    |
| Auto-save interval       | Every 60-300 seconds             |
| Major purchase           | Save after transaction           |

## Data Structure

```lua
{
    version = 1,  -- For migrations
    coins = 0,
    inventory = {},
    stats = {},
    settings = {},
    lastSave = 0,
}
```

## Migration Pattern

```lua
if data.version < 2 then
    data.newField = defaultValue
    data.version = 2
end
```

## Rules

- Always have default data
- Version your data schema
- pcall all DataStore calls
- BindToClose must wait for saves
- Don't save too frequently (throttling)
