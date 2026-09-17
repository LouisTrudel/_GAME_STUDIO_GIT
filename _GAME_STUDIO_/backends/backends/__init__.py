"""
LLM Backends: Claude CLI backends for the Agent class.

Available backends:
- BossCLI: Dedicated cached session for BOSS (Haiku)
- FleetCLI: Shared cached session for all worker agents
- VanillaCLI: Stateless, no tools (Compression, Text, Image, Audio, Video)
"""

from .base import Backend
from .boss_cli import BossCLI
from .fleet_cli import FleetCLI
from .vanilla_cli import VanillaCLI

__all__ = [
    "Backend",
    "BossCLI",
    "FleetCLI",
    "VanillaCLI",
]
