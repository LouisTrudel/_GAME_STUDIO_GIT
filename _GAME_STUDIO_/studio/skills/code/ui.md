---
name: ui-code
description: UI scripting patterns for Roblox.
---

# UI Scripting

## Common Services

| Service                  | Use For                          |
|--------------------------|----------------------------------|
| Players.LocalPlayer      | Current player reference         |
| PlayerGui                | Runtime UI container             |
| StarterGui               | Template UI (copies on spawn)    |

## Button Patterns

| Event                    | Use For                          |
|--------------------------|----------------------------------|
| Activated                | Click/tap (preferred)            |
| MouseButton1Click        | Desktop only                     |
| TouchTap                 | Mobile only                      |

## State Display

| Pattern                  | Implementation                   |
|--------------------------|----------------------------------|
| Health bar               | `bar.Size = UDim2.new(pct, 0, 1, 0)` |
| Currency                 | `label.Text = formatNumber(coins)` |
| Cooldown                 | Overlay shrinks, or circular wipe |
| Toggle                   | Change BackgroundColor3          |

## List/Grid

| Component                | Purpose                          |
|--------------------------|----------------------------------|
| UIListLayout             | Vertical/horizontal lists        |
| UIGridLayout             | Grid of items                    |
| ScrollingFrame           | Scrollable container             |
| Template item            | Clone for each entry             |

## Rules

- Always clear old items before repopulating
- Use Activated, not MouseButton1Click
- Update UI from client, data from server
- Clone templates, don't modify originals
