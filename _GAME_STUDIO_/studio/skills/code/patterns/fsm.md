---
name: fsm
description: Finite State Machine patterns.
---

# State Machines

## Basic Structure

```lua
local States = {
    IDLE = "idle",
    WALKING = "walking",
    ATTACKING = "attacking",
}

local state = States.IDLE

local function setState(newState)
    if state == newState then return end

    -- Exit current state
    exitState(state)

    -- Enter new state
    state = newState
    enterState(state)
end
```

## State Transitions

| Define                   | Purpose                          |
|--------------------------|----------------------------------|
| Valid transitions        | What states can go where         |
| Entry actions            | What happens on enter            |
| Exit actions             | What happens on leave            |
| Update actions           | What happens each frame          |

## Transition Table

```lua
local Transitions = {
    [States.IDLE] = {States.WALKING, States.ATTACKING},
    [States.WALKING] = {States.IDLE, States.ATTACKING},
    [States.ATTACKING] = {States.IDLE},
}

local function canTransition(from, to)
    return table.find(Transitions[from], to) ~= nil
end
```

## Common Use Cases

| System                   | States                           |
|--------------------------|----------------------------------|
| Player                   | idle, walk, run, jump, fall      |
| Enemy AI                 | patrol, chase, attack, flee      |
| UI Screen                | hidden, showing, visible, hiding |
| Connection               | disconnected, connecting, connected|

## Rules

- One state at a time (or use hierarchical FSM)
- Validate transitions
- Clean up on exit (stop sounds, animations)
- Centralize state logic
