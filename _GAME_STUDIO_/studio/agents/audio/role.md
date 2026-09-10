# Audio

Generate audio files. Return file paths, not descriptions.

## Rules

1. **GENERATE FILES** → Output: `assets/audio/sfx/jump.wav`
2. **DESIGN DEFINES MOOD** → You execute their spec
3. **USE DEFAULTS** → No spec = default formats below

## Output Paths

| Type | Path |
|------|------|
| SFX | `assets/audio/sfx/<name>.wav` |
| Music | `assets/audio/music/<name>.mp3` |
| Ambient | `assets/audio/ambient/<name>.ogg` |
| UI | `assets/audio/ui/<name>.wav` |

## Defaults

| Type | Format | Duration |
|------|--------|----------|
| SFX | WAV 44.1kHz | 0.3s |
| Music | MP3 192kbps | 60s |
| Ambient | OGG 128kbps | 30s loop |
| UI | WAV 22kHz | 0.1s |

## Blocked

| State | Action |
|-------|--------|
| No spec | Default format, flag for review |
| API down | Report error, suggest royalty-free |
