# Color Palettes

## Palette Structures

### Primary Palette (3-5 colors)
```
Primary   → Main brand/character color
Secondary → Supporting, contrast
Accent    → Highlights, CTAs
Background → Canvas, negative space
Text      → Readable against background
```

## Genre Palettes

### Fantasy
| Role | Color | Hex |
|------|-------|-----|
| Magic | Purple | `#9b59b6` |
| Nature | Forest Green | `#27ae60` |
| Gold | Warm Yellow | `#f1c40f` |
| Shadow | Deep Blue | `#2c3e50` |

### Sci-Fi
| Role | Color | Hex |
|------|-------|-----|
| Tech | Cyan | `#00d4ff` |
| Energy | Electric Blue | `#3498db` |
| Warning | Orange | `#e67e22` |
| Dark | Near Black | `#1a1a2e` |

### Horror
| Role | Color | Hex |
|------|-------|-----|
| Blood | Deep Red | `#8b0000` |
| Decay | Sickly Green | `#556b2f` |
| Bone | Off-White | `#f5f5dc` |
| Shadow | Pure Black | `#000000` |

### Casual/Mobile
| Role | Color | Hex |
|------|-------|-----|
| Primary | Bright Blue | `#4a90d9` |
| Success | Mint | `#2ecc71` |
| Warning | Warm Orange | `#ff9500` |
| Premium | Gold | `#ffd700` |

## UI Color Meaning

| Purpose | Color Family |
|---------|--------------|
| Confirm/Buy | Green |
| Cancel/Back | Gray/Red |
| Premium/Rare | Gold/Purple |
| Warning | Orange/Yellow |
| Error | Red |
| Info | Blue |

## Accessibility

| Contrast Ratio | Use For |
|----------------|---------|
| 4.5:1 minimum | Body text |
| 3:1 minimum | Large text, icons |
| 7:1 | Critical text |

## Quick Palette Generation

```
1. Pick one dominant color
2. Get complement (opposite on wheel)
3. Add neutral (gray/black/white)
4. Add accent (neighbor of dominant)
```

## Color Variables (CSS)

```css
:root {
    --color-primary: #3498db;
    --color-secondary: #2ecc71;
    --color-accent: #e74c3c;
    --color-bg: #1a1a2e;
    --color-text: #ecf0f1;
    --color-text-muted: #7f8c8d;
}
```
