"""
Game Studio Server: FastAPI + WebSocket backend.

Run with: python server.py
Open: studio.html in your browser

Structure:
- server/broadcast.py: Background loops and client notifications
- server/routes.py: REST API endpoints
- server/websocket.py: WebSocket connection handling
"""

from dotenv import load_dotenv
load_dotenv()  # Load .env file

from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

import logging

from studio.core.hub import hub
from studio.studio import Studio

from server_modules.broadcast import (
    broadcast_thinking_sync,
    update_agent_status_sync,
    start_broadcast_loops,
    stop_broadcast_loops,
)
from server_modules.routes import register_routes
from server_modules.websocket import websocket_endpoint
from server_modules.lockfile import acquire_lock, release_lock

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start broadcast loops on startup."""
    # Start all background broadcast loops
    start_broadcast_loops(studio)

    # Post server startup message to Hub
    hub.post("System", f"Server started at {datetime.now().strftime('%H:%M:%S')}")

    yield

    # Cleanup on shutdown
    stop_broadcast_loops()
    release_lock()


app = FastAPI(title="Game Studio", lifespan=lifespan)

# Allow local file access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize studio
studio = Studio()
studio.set_thinking_callback(broadcast_thinking_sync)
studio.set_status_callback(update_agent_status_sync)

# Register REST API routes
register_routes(app)

logger.info("Studio server initialized")


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket, project: str = None):
    """WebSocket for real-time chat.

    T327: Accepts optional ?project= query param for project context.
    """
    await websocket_endpoint(websocket, studio, project)


if __name__ == "__main__":
    import uvicorn
    import sys

    PORT = 8000

    # Single instance check - fail fast before uvicorn startup
    if not acquire_lock(PORT):
        sys.exit(1)

    PROJECT_ROOT = Path(__file__).parent
    print("=" * 50)
    print("  GAME STUDIO SERVER")
    print("=" * 50)
    print("Open studio.html in your browser")
    print(f"Server: http://127.0.0.1:{PORT}")
    print("=" * 50)
    uvicorn.run(app, host="127.0.0.1", port=PORT)
