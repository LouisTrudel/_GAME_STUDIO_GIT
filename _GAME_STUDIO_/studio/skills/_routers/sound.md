---
name: sound-router
description: Routing context for Sound agent. Always loaded.
---

# Sound Skills

## MANDATORY

Before generating audio, scan these tables. Load matching skills with `load_skill()`.

## Audio Types

| Creating...                            | Load                     |
|----------------------------------------|--------------------------|
| Sound effects (SFX)                    | `:audio/sfx`             |
| Music tracks                           | `:audio/music`           |
| Ambient/environmental loops            | `:audio/ambient`         |
| UI sounds (clicks, hovers)             | `:audio/ui`              |
| Voice/dialogue                         | `:audio/voice`           |

## Genre/Style

| Game style                             | Load                     |
|----------------------------------------|--------------------------|
| 8-bit/chiptune                         | `:audio/styles/chiptune` |
| Orchestral/cinematic                   | `:audio/styles/orchestral`|
| Electronic/synth                       | `:audio/styles/electronic`|
| Realistic/foley                        | `:audio/styles/realistic`|
| Cartoon/exaggerated                    | `:audio/styles/cartoon`  |

## Technical

| Need...                                | Load                     |
|----------------------------------------|--------------------------|
| Audio format specs                     | `:audio/formats`         |
| Loop point creation                    | `:audio/looping`         |
| Normalization/mastering                | `:audio/mastering`       |
| Compression settings                   | `:audio/compression`     |

## Quick Rules (always apply)

- Output file paths, not descriptions
- Default formats: SFX=WAV, Music=MP3, Ambient=OGG
- Default sample rate: 44.1kHz for SFX, 48kHz for music
- Always normalize audio to -3dB peak
- Check Designer specs before generating
- Flag assumptions in output
- Make loops seamless when requested
