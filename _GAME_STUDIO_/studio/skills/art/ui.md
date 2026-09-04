---
name: ui
description: UI layout and design principles.
---

# UI Design

## Layout Zones

| Zone                     | Content                          |
|--------------------------|----------------------------------|
| Top-left                 | Player status (health, level)    |
| Top-right                | Currency, notifications          |
| Bottom                   | Action bar, hotkeys              |
| Center                   | Menus (modal), gameplay          |

## Spacing Scale

| Use                      | Pixels                           |
|--------------------------|----------------------------------|
| Tight (icon padding)     | 4-8                              |
| Standard (elements)      | 12-16                            |
| Loose (sections)         | 24-32                            |
| Page margins             | 48+                              |

## Touch Targets

| Device                   | Minimum Size                     |
|--------------------------|----------------------------------|
| Mobile                   | 44x44 px                         |
| Desktop                  | 32x32 px                         |
| With hover state         | Can go smaller                   |

## Visual Hierarchy

| Importance               | Treatment                        |
|--------------------------|----------------------------------|
| Primary                  | Largest, brightest, centered     |
| Secondary                | Medium, less contrast            |
| Tertiary                 | Small, muted colors              |
| Disabled                 | Greyed out, reduced opacity      |

## Common Patterns

| Pattern                  | Use For                          |
|--------------------------|----------------------------------|
| Cards                    | Collections, inventories         |
| Lists                    | Linear data, rankings            |
| Modals                   | Focused actions, confirmations   |
| Tabs                     | Category switching               |

## Rules

- Most important element = most visual weight
- Group related items
- Consistent padding throughout
- Always show current state (selected, active)
- Error states should be obvious
