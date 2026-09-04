---
name: economy-design
description: Game economy design principles.
---

# Economy Design

## Faucets (Money In)

| Source                   | Control Lever                    |
|--------------------------|----------------------------------|
| Quest rewards            | Frequency, payout amounts        |
| Enemy drops              | Drop rate, value                 |
| Time-based income        | Rate per hour/day                |
| Trading                  | Tax percentage                   |
| Daily login              | Amount, streak multipliers       |

## Sinks (Money Out)

| Sink                     | Control Lever                    |
|--------------------------|----------------------------------|
| Shop purchases           | Item prices                      |
| Upgrades                 | Cost curves                      |
| Repairs/maintenance      | Decay rate, repair cost          |
| Trading tax              | Percentage per transaction       |
| Premium conversions      | Soft → Premium ratio             |

## Balance Indicators

| Healthy                  | Unhealthy                        |
|--------------------------|----------------------------------|
| Players saving for goals | Everyone has max currency        |
| Items have perceived value| Nothing worth buying            |
| Multiple viable strategies| One optimal path                |
| New players can catch up | Veterans dominate permanently   |

## Pricing Formula

```
base_price × rarity_mult × (1 + inflation_factor × days_since_launch)
```

## Rules

- Two currencies minimum (soft + premium)
- Prestige players, don't punish new ones
- Big purchases need confirmation
- Show earning rate to players
- Never fully gate content behind premium
