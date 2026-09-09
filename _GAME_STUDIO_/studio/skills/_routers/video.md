---
name: video-router
description: Routing context for Video agent. Always loaded.
---

# Video Skills

## MANDATORY

Before generating video, scan these tables. Load matching skills with `load_skill()`.

## Video Types

| Creating...                            | Load                     |
|----------------------------------------|--------------------------|
| Trailers/marketing                     | `:video/trailers`        |
| Cutscenes/cinematics                   | `:video/cutscenes`       |
| Tutorials/how-to                       | `:video/tutorials`       |
| GIFs/short loops                       | `:video/gifs`            |
| Gameplay recordings                    | `:video/recordings`      |

## Style/Mood

| Video style                            | Load                     |
|----------------------------------------|--------------------------|
| Action/fast-paced                      | `:video/styles/action`   |
| Cinematic/dramatic                     | `:video/styles/cinematic`|
| Educational/clear                      | `:video/styles/educational`|
| Social media/vertical                  | `:video/styles/social`   |

## Technical

| Need...                                | Load                     |
|----------------------------------------|--------------------------|
| Codec/format specs                     | `:video/formats`         |
| Resolution standards                   | `:video/resolutions`     |
| Compression settings                   | `:video/compression`     |
| Audio sync/mixing                      | `:video/audio`           |
| Transitions/effects                    | `:video/transitions`     |

## Quick Rules (always apply)

- Output file paths, not descriptions
- Default format: MP4 (H.264) for video, GIF for loops
- Default resolution: 1080p for video, 480p for GIFs
- Default FPS: 30 for standard, 60 for gameplay
- Keep GIFs under 5MB
- Check Designer storyboard before generating
- Flag assumptions in output
- Include audio unless explicitly excluded
