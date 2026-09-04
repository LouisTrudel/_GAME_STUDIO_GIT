---
name: inventory
description: Inventory systems. Slots, stacking, items.
---

# Inventory Systems

## Structure

| Component                | Purpose                          |
|--------------------------|----------------------------------|
| slots                    | Array of {itemId, count, meta}   |
| maxSlots                 | Capacity limit                   |
| maxStack                 | Per-item stack limit             |

## Operations

| Operation | Logic                                    |
|-----------|------------------------------------------|
| Add       | Stack existing first, then new slot      |
| Remove    | Iterate reverse, remove empties          |
| Has       | Sum all matching stacks                  |
| Swap      | Exchange two slot positions              |
| Split     | Move portion to new slot                 |

## Stacking Logic

| Step                     | Action                           |
|--------------------------|----------------------------------|
| 1. Find existing         | Fill up to maxStack              |
| 2. Create new            | If space and count remains       |
| 3. Return overflow       | Items that didn't fit            |

## Metadata

| Use Case                 | Meta Fields                      |
|--------------------------|----------------------------------|
| Durability               | `{durability: 100}`              |
| Enchantments             | `{enchants: ["fire", "speed"]}`  |
| Unique ID                | `{uuid: "abc123"}`               |

## Rules

- Server is source of truth
- Never trust client slot data
- Remove empty slots immediately
- Validate before craft/consume
- Items with meta don't stack

## Gotchas

| Issue                    | Solution                         |
|--------------------------|----------------------------------|
| Dupe glitch              | Server validates ownership       |
| Slot index OOB           | Check bounds before access       |
| Stack overflow           | Cap at maxStack, return excess   |
