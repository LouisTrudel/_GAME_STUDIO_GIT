"""
LLM Backends: Pluggable providers for the Agent class.

Available backends:
- BossCLI: Dedicated cached session for BOSS (Haiku)
- FleetCLI: Shared cached session for all worker agents
- VanillaCLI: Stateless, no tools (Compression, Text, Image, Audio, Video)
- GeminiBackend: Google Gemini API
- AnthropicBackend: Anthropic Claude API (direct)
- OllamaBackend: Local Ollama models

Legacy aliases maintained for backwards compatibility.
"""

from .base import Backend
from .gemini import GeminiBackend
from .anthropic import AnthropicBackend
from .ollama import OllamaBackend

# New clean backends
from .boss_cli import BossCLI
from .fleet_cli import FleetCLI
from .vanilla_cli import VanillaCLI

# Legacy imports (for backwards compat during transition)
from .claude_cli import ClaudeCLIBackend
from .persistent_claude_cli import PersistentClaudeCLI

__all__ = [
    # Base
    "Backend",
    # New architecture
    "BossCLI",
    "FleetCLI",
    "VanillaCLI",
    # Other providers
    "GeminiBackend",
    "AnthropicBackend",
    "OllamaBackend",
    # Legacy (deprecated)
    "ClaudeCLIBackend",
    "PersistentClaudeCLI",
]
