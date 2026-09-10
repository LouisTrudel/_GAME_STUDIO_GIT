"""
LLM Backends: Pluggable providers for the Agent class.

Available backends:
- ClaudeCLIBackend: Uses Claude Code CLI (Pro subscription, no API costs)
- GeminiBackend: Google Gemini API
- AnthropicBackend: Anthropic Claude API (direct)
- OllamaBackend: Local Ollama models

For custom tools, use MCP server (mcp_server.py) instead of backend-level tool handling.
"""

from .base import Backend
from .gemini import GeminiBackend
from .anthropic import AnthropicBackend
from .ollama import OllamaBackend
from .claude_cli import ClaudeCLIBackend
from .persistent_claude_cli import PersistentClaudeCLI

__all__ = [
    "Backend",
    "GeminiBackend",
    "AnthropicBackend",
    "OllamaBackend",
    "ClaudeCLIBackend",
    "PersistentClaudeCLI",
]
