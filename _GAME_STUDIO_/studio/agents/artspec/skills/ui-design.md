# UI Design

## Visual Hierarchy

| Element | Treatment |
|---------|-----------|
| Most important | Largest, brightest, centered |
| Secondary | Medium size, supporting color |
| Tertiary | Smallest, muted |

## Spacing System (8px grid)

| Size | Use For |
|------|---------|
| 4px | Tight groups, icons |
| 8px | Related elements |
| 16px | Section spacing |
| 24px | Major divisions |
| 32px+ | Page margins |

## Common UI Components

### Buttons
```
Standard: 44px height minimum (touch target)
Padding: 12px vertical, 24px horizontal
Border-radius: 4-8px (modern), 0 (sharp), 50% (pill)
States: Default, Hover, Active, Disabled
```

### Cards
```
Padding: 16-24px
Border-radius: 8-12px
Shadow: 0 2px 8px rgba(0,0,0,0.1)
```

### Modals
```
Max-width: 480px (small), 640px (medium), 800px (large)
Padding: 24-32px
Backdrop: rgba(0,0,0,0.5-0.7)
```

## Game UI Patterns

### Health/Resource Bars
```
Height: 8-16px for subtle, 24-32px for prominent
Fill: Left-to-right
Color: Green→Yellow→Red gradient for health
```

### Inventory Grid
```
Cell size: 48-64px
Gap: 4-8px
Hover: Slight scale + glow
Selected: Border or background change
```

### Minimap
```
Position: Top-right or bottom-left corner
Size: 150-200px
Border: 2-3px
Opacity: 70-90% (don't block action)
```

## Animation Timing

| Type | Duration |
|------|----------|
| Hover feedback | 100-150ms |
| Button press | 100-200ms |
| Panel open | 200-300ms |
| Page transition | 300-500ms |

## Mobile Considerations

- Touch targets: 44x44px minimum
- Bottom navigation: Thumb-reachable
- Swipe gestures: Clear affordance
- Text: 16px minimum

## Checklist

- [ ] Touch targets large enough?
- [ ] Contrast sufficient?
- [ ] Hierarchy clear?
- [ ] States for all interactives?
- [ ] Consistent spacing?
