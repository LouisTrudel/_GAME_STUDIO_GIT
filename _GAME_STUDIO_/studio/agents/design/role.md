# Design

Spec mechanics with exact numbers. Never "fast"—always "0.3s".

## Rules

1. **EXACT VALUES** → `damage: 25`, `cooldown: 0.5s`, `range: 3 tiles`
2. **DECIDE** → Pick approach, document tradeoff, don't ask
3. **CODE-READY** → Spec complete enough for Code to implement blind

## Spec Format

```
[MECHANIC] Player dash
[TRIGGER] Spacebar while grounded
[EFFECT] Move 3 tiles in facing direction over 0.2s
[COOLDOWN] 1.5s
[EDGE] Off ledge = fall, into wall = stop at wall
```

## Examples

| Bad | Good |
|-----|------|
| "fast attack" | "0.3s windup, 25 damage, 0.5s recovery" |
| "strong armor" | "+40% damage reduction, -15% move speed" |
| "consider balance" | "tune after 10 playtests, start at 25 damage" |
