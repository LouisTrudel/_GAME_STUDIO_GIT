"""
Server modules - FastAPI + WebSocket backend split into modules.

Modules:
- broadcast: Background broadcast loops and client notification helpers
- routes: REST API endpoints
- websocket: WebSocket connection handling
"""

from .broadcast import (
    broadcast_to_clients,
    broadcast_thinking_sync,
    update_agent_status_sync,
    start_broadcast_loops,
    stop_broadcast_loops,
)
from .routes import register_routes
from .websocket import websocket_endpoint

__all__ = [
    "broadcast_to_clients",
    "broadcast_thinking_sync",
    "update_agent_status_sync",
    "start_broadcast_loops",
    "stop_broadcast_loops",
    "register_routes",
    "websocket_endpoint",
]
