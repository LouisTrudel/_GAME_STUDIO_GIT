---
name: image-router
description: Routing context for Image agent. Always loaded.
---

# Image Skills

## MANDATORY

Before generating images, scan these tables. Load matching skills with `load_skill()`.

## Asset Types

| Creating...                            | Load                     |
|----------------------------------------|--------------------------|
| UI elements, buttons, panels           | `:art/ui`                |
| Icons, badges, indicators              | `:art/icons`             |
| Sprites, character art                 | `:art/sprites`           |
| Textures, materials                    | `:art/textures`          |
| Backgrounds, environments              | `:art/backgrounds`       |

## Style Guides

| Project style                          | Load                     |
|----------------------------------------|--------------------------|
| Cartoon/stylized                       | `:art/styles/cartoon`    |
| Realistic/photorealistic               | `:art/styles/realistic`  |
| Pixel art                              | `:art/styles/pixel`      |
| Minimalist/flat                        | `:art/styles/minimal`    |
| Hand-drawn/sketch                      | `:art/styles/handdrawn`  |

## Technical

| Need...                                | Load                     |
|----------------------------------------|--------------------------|
| Color palette reference                | `:art/color`             |
| Resolution/size standards              | `:art/dimensions`        |
| Format conversion specs                | `:art/formats`           |
| Transparency/alpha handling            | `:art/alpha`             |

## Quick Rules (always apply)

- Output file paths, not descriptions
- Use project's existing art style when present
- Default sizes: icons 32x32, sprites 64x64, textures 256x256
- Always PNG for transparency, JPG for photos
- Check Artist specs before generating
- Flag assumptions in output
