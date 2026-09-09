"""
Video agent tools - video generation and manipulation.
Tools are stubbed pending video library integration.
"""

TOOLS = [
    {
        "name": "generate_cutscene",
        "description": "Generate a cutscene/cinematic video. Saves to assets/video/cutscenes/.",
        "parameters": {
            "description": {"type": "string", "description": "Scene description (e.g., 'camera pans across forest, hero appears')", "required": True},
            "duration": {"type": "number", "description": "Duration in seconds", "default": 15},
            "output_path": {"type": "string", "description": "Relative path under assets/video/", "required": True},
            "resolution": {"type": "string", "description": "Resolution: 720p, 1080p, 4k", "default": "1080p"},
            "style": {"type": "string", "description": "Visual style: cinematic, anime, pixel, realistic", "default": "cinematic"}
        }
    },
    {
        "name": "generate_trailer",
        "description": "Generate a trailer/preview video. Saves to assets/video/trailers/.",
        "parameters": {
            "concept": {"type": "string", "description": "Trailer concept (e.g., 'fast-paced gameplay montage')", "required": True},
            "duration": {"type": "number", "description": "Duration in seconds", "default": 30},
            "output_path": {"type": "string", "description": "Relative path under assets/video/", "required": True},
            "resolution": {"type": "string", "description": "Resolution: 720p, 1080p, 4k", "default": "1080p"},
            "pacing": {"type": "string", "description": "Edit pacing: slow, moderate, fast", "default": "fast"}
        }
    },
    {
        "name": "generate_animation",
        "description": "Generate a short animated sequence. Saves to assets/video/sequences/.",
        "parameters": {
            "description": {"type": "string", "description": "Animation description", "required": True},
            "duration": {"type": "number", "description": "Duration in seconds", "default": 3},
            "output_path": {"type": "string", "description": "Relative path under assets/video/", "required": True},
            "fps": {"type": "integer", "description": "Frames per second", "default": 30},
            "loopable": {"type": "boolean", "description": "Make seamlessly loopable", "default": False},
            "has_alpha": {"type": "boolean", "description": "Include alpha channel (WebM output)", "default": False}
        }
    },
    {
        "name": "generate_tutorial",
        "description": "Generate a tutorial/how-to video clip. Saves to assets/video/tutorials/.",
        "parameters": {
            "topic": {"type": "string", "description": "Tutorial topic (e.g., 'how to double jump')", "required": True},
            "duration": {"type": "number", "description": "Duration in seconds", "default": 15},
            "output_path": {"type": "string", "description": "Relative path under assets/video/", "required": True},
            "resolution": {"type": "string", "description": "Resolution: 720p, 1080p", "default": "720p"}
        }
    },
    {
        "name": "fetch_video",
        "description": "Fetch video from URL and save locally.",
        "parameters": {
            "url": {"type": "string", "description": "Source video URL", "required": True},
            "output_path": {"type": "string", "description": "Relative path under assets/video/", "required": True}
        }
    },
    {
        "name": "convert_video",
        "description": "Convert video between formats (MP4, WebM, GIF).",
        "parameters": {
            "input_path": {"type": "string", "description": "Source video path", "required": True},
            "output_path": {"type": "string", "description": "Destination path with new extension", "required": True},
            "bitrate": {"type": "string", "description": "Video bitrate (e.g., '5M', '10M')", "default": "5M"},
            "quality": {"type": "integer", "description": "Quality level 1-100 (for GIF)", "default": 80}
        }
    },
    {
        "name": "trim_video",
        "description": "Trim video to specific start/end times.",
        "parameters": {
            "input_path": {"type": "string", "description": "Source video path", "required": True},
            "output_path": {"type": "string", "description": "Destination path", "required": True},
            "start": {"type": "number", "description": "Start time in seconds", "default": 0},
            "end": {"type": "number", "description": "End time in seconds", "required": True}
        }
    },
    {
        "name": "concat_video",
        "description": "Concatenate multiple video clips into one.",
        "parameters": {
            "input_paths": {"type": "array", "description": "List of video paths to join in order", "required": True},
            "output_path": {"type": "string", "description": "Destination path", "required": True},
            "transition": {"type": "string", "description": "Transition type: none, fade, dissolve", "default": "none"}
        }
    },
    {
        "name": "add_audio_track",
        "description": "Overlay audio track onto video.",
        "parameters": {
            "video_path": {"type": "string", "description": "Source video path", "required": True},
            "audio_path": {"type": "string", "description": "Audio track path", "required": True},
            "output_path": {"type": "string", "description": "Destination path", "required": True},
            "replace_audio": {"type": "boolean", "description": "Replace existing audio (vs mix)", "default": True}
        }
    },
    {
        "name": "extract_frames",
        "description": "Extract frames from video as images.",
        "parameters": {
            "input_path": {"type": "string", "description": "Source video path", "required": True},
            "output_dir": {"type": "string", "description": "Output directory for frames", "required": True},
            "fps": {"type": "number", "description": "Frames per second to extract", "default": 1},
            "format": {"type": "string", "description": "Output format: png, jpg", "default": "png"}
        }
    }
]


def handle_generate_cutscene(params: dict) -> dict:
    """Stub: Generate cutscene video."""
    return {
        "status": "stub",
        "message": "Cutscene generation not yet integrated. Pending video library setup.",
        "would_create": params.get("output_path"),
        "description": params.get("description"),
        "duration": f"{params.get('duration', 15)}s",
        "resolution": params.get("resolution", "1080p")
    }


def handle_generate_trailer(params: dict) -> dict:
    """Stub: Generate trailer video."""
    return {
        "status": "stub",
        "message": "Trailer generation not yet integrated. Pending video library setup.",
        "would_create": params.get("output_path"),
        "concept": params.get("concept"),
        "duration": f"{params.get('duration', 30)}s",
        "resolution": params.get("resolution", "1080p")
    }


def handle_generate_animation(params: dict) -> dict:
    """Stub: Generate animated sequence."""
    return {
        "status": "stub",
        "message": "Animation generation not yet integrated. Pending video library setup.",
        "would_create": params.get("output_path"),
        "description": params.get("description"),
        "duration": f"{params.get('duration', 3)}s",
        "fps": params.get("fps", 30)
    }


def handle_generate_tutorial(params: dict) -> dict:
    """Stub: Generate tutorial video."""
    return {
        "status": "stub",
        "message": "Tutorial generation not yet integrated. Pending video library setup.",
        "would_create": params.get("output_path"),
        "topic": params.get("topic"),
        "duration": f"{params.get('duration', 15)}s"
    }


def handle_fetch_video(params: dict) -> dict:
    """Stub: Fetch video from URL."""
    return {
        "status": "stub",
        "message": "Video fetching not yet integrated.",
        "would_fetch": params.get("url"),
        "would_save": params.get("output_path")
    }


def handle_convert_video(params: dict) -> dict:
    """Stub: Convert video format."""
    return {
        "status": "stub",
        "message": "Video conversion not yet integrated.",
        "input": params.get("input_path"),
        "output": params.get("output_path")
    }


def handle_trim_video(params: dict) -> dict:
    """Stub: Trim video."""
    return {
        "status": "stub",
        "message": "Video trimming not yet integrated.",
        "input": params.get("input_path"),
        "range": f"{params.get('start', 0)}s - {params.get('end')}s"
    }


def handle_concat_video(params: dict) -> dict:
    """Stub: Concatenate videos."""
    return {
        "status": "stub",
        "message": "Video concatenation not yet integrated.",
        "inputs": len(params.get("input_paths", [])),
        "output": params.get("output_path")
    }


def handle_add_audio_track(params: dict) -> dict:
    """Stub: Add audio to video."""
    return {
        "status": "stub",
        "message": "Audio overlay not yet integrated.",
        "video": params.get("video_path"),
        "audio": params.get("audio_path"),
        "output": params.get("output_path")
    }


def handle_extract_frames(params: dict) -> dict:
    """Stub: Extract video frames."""
    return {
        "status": "stub",
        "message": "Frame extraction not yet integrated.",
        "input": params.get("input_path"),
        "output_dir": params.get("output_dir"),
        "fps": params.get("fps", 1)
    }


HANDLERS = {
    "generate_cutscene": handle_generate_cutscene,
    "generate_trailer": handle_generate_trailer,
    "generate_animation": handle_generate_animation,
    "generate_tutorial": handle_generate_tutorial,
    "fetch_video": handle_fetch_video,
    "convert_video": handle_convert_video,
    "trim_video": handle_trim_video,
    "concat_video": handle_concat_video,
    "add_audio_track": handle_add_audio_track,
    "extract_frames": handle_extract_frames
}
