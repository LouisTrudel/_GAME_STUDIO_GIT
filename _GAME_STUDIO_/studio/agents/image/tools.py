"""
Image agent tools - image generation and manipulation.
Tools are stubbed pending image library integration.
"""

TOOLS = [
    {
        "name": "generate_image",
        "description": "Generate an image from a text prompt. Saves to assets/ directory.",
        "parameters": {
            "prompt": {"type": "string", "description": "Image generation prompt", "required": True},
            "width": {"type": "integer", "description": "Output width in pixels", "default": 256},
            "height": {"type": "integer", "description": "Output height in pixels", "default": 256},
            "output_path": {"type": "string", "description": "Relative path under assets/", "required": True},
            "style": {"type": "string", "description": "Style preset: pixel, vector, realistic, cartoon", "default": "pixel"}
        }
    },
    {
        "name": "fetch_image",
        "description": "Fetch an image from URL and save locally.",
        "parameters": {
            "url": {"type": "string", "description": "Source image URL", "required": True},
            "output_path": {"type": "string", "description": "Relative path under assets/", "required": True}
        }
    },
    {
        "name": "resize_image",
        "description": "Resize an existing image to target dimensions.",
        "parameters": {
            "input_path": {"type": "string", "description": "Source image path", "required": True},
            "output_path": {"type": "string", "description": "Destination path", "required": True},
            "width": {"type": "integer", "description": "Target width", "required": True},
            "height": {"type": "integer", "description": "Target height", "required": True},
            "maintain_aspect": {"type": "boolean", "description": "Maintain aspect ratio", "default": True}
        }
    },
    {
        "name": "compose_image",
        "description": "Layer multiple images into one composite.",
        "parameters": {
            "layers": {"type": "array", "description": "List of {path, x, y, opacity} layer objects", "required": True},
            "output_path": {"type": "string", "description": "Output path", "required": True},
            "width": {"type": "integer", "description": "Canvas width", "required": True},
            "height": {"type": "integer", "description": "Canvas height", "required": True}
        }
    },
    {
        "name": "convert_format",
        "description": "Convert image between formats (PNG, JPG, WebP).",
        "parameters": {
            "input_path": {"type": "string", "description": "Source image path", "required": True},
            "output_path": {"type": "string", "description": "Destination path with new extension", "required": True},
            "quality": {"type": "integer", "description": "Compression quality 1-100 (for JPG/WebP)", "default": 90}
        }
    }
]


def handle_generate_image(params: dict) -> dict:
    """Stub: Generate image from prompt."""
    return {
        "status": "stub",
        "message": "Image generation not yet integrated. Pending image library setup.",
        "would_create": params.get("output_path"),
        "prompt": params.get("prompt"),
        "size": f"{params.get('width', 256)}x{params.get('height', 256)}"
    }


def handle_fetch_image(params: dict) -> dict:
    """Stub: Fetch image from URL."""
    return {
        "status": "stub",
        "message": "Image fetching not yet integrated.",
        "would_fetch": params.get("url"),
        "would_save": params.get("output_path")
    }


def handle_resize_image(params: dict) -> dict:
    """Stub: Resize image."""
    return {
        "status": "stub",
        "message": "Image resizing not yet integrated.",
        "input": params.get("input_path"),
        "target_size": f"{params.get('width')}x{params.get('height')}"
    }


def handle_compose_image(params: dict) -> dict:
    """Stub: Compose layered image."""
    return {
        "status": "stub",
        "message": "Image composition not yet integrated.",
        "layers": len(params.get("layers", [])),
        "output": params.get("output_path")
    }


def handle_convert_format(params: dict) -> dict:
    """Stub: Convert image format."""
    return {
        "status": "stub",
        "message": "Format conversion not yet integrated.",
        "input": params.get("input_path"),
        "output": params.get("output_path")
    }


HANDLERS = {
    "generate_image": handle_generate_image,
    "fetch_image": handle_fetch_image,
    "resize_image": handle_resize_image,
    "compose_image": handle_compose_image,
    "convert_format": handle_convert_format
}
