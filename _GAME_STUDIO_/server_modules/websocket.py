"""
WebSocket module - Real-time connection handling.

Handles WebSocket connections, message routing, and live updates.

T327: Supports project context via ?project= query param.
"""

import asyncio
import json
from typing import Optional

from fastapi import WebSocket, WebSocketDisconnect

from studio.core.tasks import task_manager
from studio.core.schedules import schedule_manager
from studio.core.hub import hub

from .broadcast import connections, agent_statuses, broadcast_to_clients


async def websocket_endpoint(websocket: WebSocket, studio, project_id: Optional[str] = None):
    """WebSocket handler for real-time chat and updates.

    T327: project_id from URL query param sets the active project context.
    """
    await websocket.accept()
    connections.append(websocket)

    # T327: Switch to project context if specified
    if project_id:
        hub.set_active_project(project_id)
        print(f"[WS] Client connected with project context: {project_id}")
    print(f"Client connected. Total: {len(connections)}")

    # Send current tasks
    tasks_data = json.dumps({
        "type": "tasks_update",
        "data": [t.to_dict() for t in task_manager.get_all_tasks()]
    })
    await websocket.send_text(tasks_data)

    # Send current schedules
    schedules = schedule_manager.get_all()
    print(f"[WS] Sending {len(schedules)} schedules to new client")
    schedules_data = json.dumps({
        "type": "schedules_update",
        "data": [s.to_dict() for s in schedules]
    })
    await websocket.send_text(schedules_data)

    # Send current agent statuses
    statuses_data = json.dumps({
        "type": "agent_statuses",
        "data": agent_statuses
    })
    await websocket.send_text(statuses_data)

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "user_message":
                content = msg.get("content", "").strip()
                msg_project = msg.get("project")  # T327: project from message
                if content:
                    print(f"User: {content}")
                    # T327: Switch project context if different
                    if msg_project and msg_project != project_id:
                        hub.set_active_project(msg_project)
                    await asyncio.to_thread(
                        studio.handle_user_message, content
                    )

            elif msg.get("type") == "poke_agent":
                agent_name = msg.get("agent")
                prompt = msg.get("prompt")
                if agent_name:
                    print(f"Poking {agent_name}")
                    await asyncio.to_thread(
                        studio.agent_respond, agent_name, prompt
                    )

            elif msg.get("type") == "tick":
                # Manual tick to process tasks
                await asyncio.to_thread(studio.tick)

            elif msg.get("type") == "create_schedule":
                # Create a new schedule
                schedule = schedule_manager.create(
                    name=msg["name"],
                    description=msg.get("description", ""),
                    interval_seconds=msg["interval_seconds"],
                    tasks=msg["tasks"],
                )
                print(f"[Schedule] Created: {schedule.name}")

            elif msg.get("type") == "pause_schedule":
                schedule_manager.pause(msg["id"])

            elif msg.get("type") == "resume_schedule":
                schedule_manager.resume(msg["id"])

            elif msg.get("type") == "trigger_schedule":
                task_ids = schedule_manager.run(msg["id"])
                print(f"[Schedule] Manually triggered: {msg['id']} -> {task_ids}")
                await asyncio.to_thread(studio.tick)

            elif msg.get("type") == "delete_schedule":
                schedule_manager.delete(msg["id"])

    except WebSocketDisconnect:
        connections.remove(websocket)
        print(f"Client disconnected. Total: {len(connections)}")
