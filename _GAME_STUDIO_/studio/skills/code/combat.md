---
name: combat
description: Combat system patterns.
---

# Combat Systems

## Damage Flow

```
Attacker input → Server validates → Calculate damage → Apply to target → Notify clients
```

## Hit Detection

| Method                   | Use For                          |
|--------------------------|----------------------------------|
| Raycast                  | Projectiles, hitscan             |
| Region3/GetPartBoundsInBox | AOE, explosions               |
| Touched event            | Melee (with debounce)            |
| Magnitude check          | Simple range detection           |

## Damage Calculation

| Factor                   | Example                          |
|--------------------------|----------------------------------|
| Base damage              | Weapon stat                      |
| Multipliers              | Crits, headshots, buffs          |
| Reduction                | Armor, shields, resistance       |
| Final damage             | `max(1, calculated)`             |

## Cooldowns

| Pattern                  | Implementation                   |
|--------------------------|----------------------------------|
| Per-ability              | `lastUsed[abilityId] = tick()`   |
| Global (GCD)             | Single timestamp                 |
| Display                  | `remaining = cooldown - (now - lastUsed)` |

## Rules

- Server authoritative for all damage
- Never trust client hitbox claims
- Overkill damage = kill (don't go negative HP)
- Death state prevents actions
- Respawn clears all debuffs
