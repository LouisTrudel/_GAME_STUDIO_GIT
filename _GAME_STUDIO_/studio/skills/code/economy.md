---
name: economy
description: In-game economy systems. Currency, shops, pricing.
---

# Economy Systems

## Currency Types

| Type                     | Persistence                      |
|--------------------------|----------------------------------|
| Premium (Robux-bought)   | DataStore, never lose            |
| Soft (earned)            | DataStore, can have sinks        |
| Session (temporary)      | Memory only, resets              |

## Shop Patterns

| Type                     | Use Case                         |
|--------------------------|----------------------------------|
| Infinite                 | Always available basics          |
| Restock                  | Limited stock, creates scarcity  |
| Unlockable               | Buy once, own forever            |
| Rotating                 | Changes on schedule              |

## Pricing Guidelines

| Item Type                | Price Range                      |
|--------------------------|----------------------------------|
| Consumables              | 1-100 soft currency              |
| Permanent upgrades       | 100-10000 soft                   |
| Cosmetics                | Premium or high soft             |
| Time skips               | Premium only                     |

## Economy Health

| Metric                   | Watch For                        |
|--------------------------|----------------------------------|
| Inflation                | Too many faucets                 |
| Deflation                | Too many sinks                   |
| Stagnation               | Nothing worth buying             |

## Rules

- Server validates all purchases
- Show price BEFORE purchase confirmation
- Anti-spam: cooldown between purchases
- Log all transactions
- Never delete premium currency (refund instead)

## Gotchas

| Issue                    | Solution                         |
|--------------------------|----------------------------------|
| Negative currency        | Check balance BEFORE deducting   |
| Race condition           | Lock during transaction          |
| Price display mismatch   | Single source of truth for prices|
