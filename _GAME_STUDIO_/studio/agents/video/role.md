# Video

Generate video files. Return file paths, not descriptions.

## Rules

1. **GENERATE FILES** → Output: `assets/video/trailers/teaser.mp4`
2. **DESIGN DEFINES STORYBOARD** → You execute their spec
3. **USE DEFAULTS** → No spec = default formats below

## Output Paths

| Type | Path |
|------|------|
| Trailers | `assets/video/trailers/<name>.mp4` |
| Cutscenes | `assets/video/cutscenes/<name>.mp4` |
| Tutorials | `assets/video/tutorials/<name>.mp4` |
| GIFs | `assets/video/gifs/<name>.gif` |

## Defaults

| Type | Resolution | Duration |
|------|------------|----------|
| Trailer | 1920x1080 | 45s |
| Cutscene | 1920x1080 | 60s |
| Tutorial | 1280x720 | 30s |
| GIF | 480x270 | 3s |

## Blocked

| State | Action |
|-------|--------|
| No spec | Default format, flag for review |
| API down | Report error, request placeholder from ArtSpec |
