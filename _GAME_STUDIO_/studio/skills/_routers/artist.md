---
name: artist-router
description: Routing context for Artist agent. Always loaded.
---

# Artist Skills

## MANDATORY

Before creating visuals, scan these tables. Load matching skills with `load_skill()`.

## Visual Design

| Creating...                            | Load                     |
|----------------------------------------|--------------------------|
| UI layouts, screens, menus             | `:art/ui`                |
| Color schemes, palettes                | `:art/color`             |
| Icons, buttons, elements               | `:art/icons`             |
| Typography, text styling               | `:art/typography`        |

## Effects

| Adding...                              | Load                     |
|----------------------------------------|--------------------------|
| Particles, VFX                         | `:art/particles`         |
| Lighting, atmosphere                   | `:art/lighting`          |
| Post-processing                        | `:art/postfx`            |
| Animations, tweens                     | `:art/animation`         |

## Style Guides

| Project type                           | Load                     |
|----------------------------------------|--------------------------|
| Cartoon/stylized                       | `:art/styles/cartoon`    |
| Realistic                              | `:art/styles/realistic`  |
| Pixel art                              | `:art/styles/pixel`      |
| Minimalist                             | `:art/styles/minimal`    |

## Quick Rules (always apply)

- Consistency > individual brilliance
- Mobile-first (44px minimum touch targets)
- Contrast for readability
- Animation: ease-out for entrances, ease-in for exits
- Less is more
