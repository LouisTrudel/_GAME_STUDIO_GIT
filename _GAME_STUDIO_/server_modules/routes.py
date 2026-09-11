"""
Routes module - REST API endpoints.

All HTTP endpoints for the Game Studio server.

T327: Many endpoints accept optional ?project= query param for project context.
When provided, operations use project-specific paths instead of default.
"""

import os
import subprocess
import asyncio
import time
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse

from studio.core.logging_config import get_logger
from studio.core.hub import hub

logger = get_logger("Routes")
from studio.core.tasks import task_manager
from studio.core.schedules import schedule_manager
from studio.core.suggestions import suggestion_manager
from studio.core.projects import project_manager
from studio.core.studio_metrics import get_session_tokens, reset_session_tokens, get_cache_stats
from studio.core.memory import memory_manager
from studio.studio import load_agent_role, load_agent_config, get_all_agent_names
from studio.loader import load_agent_role_md

from .broadcast import _compute_agent_stats


def _switch_project_context(project_id: Optional[str]):
    """Switch to project context if specified.

    T327: Helper to switch memory/history paths based on project param.
    No-op if project_id is None (uses current/default context).
    """
    if project_id:
        hub.set_active_project(project_id)


PROJECT_ROOT = Path(__file__).parent.parent

# Cooldown tracking for discuss endpoint (suggestion_id -> timestamp)
_discuss_cooldowns: dict[str, float] = {}
DISCUSS_COOLDOWN_SECONDS = 60


def register_routes(app: FastAPI):
    """Register all REST API routes on the FastAPI app."""

    # ============ HEALTH ============

    @app.get("/api/health")
    async def health_check():
        """Simple health check for restart polling."""
        return {"status": "ok"}

    # ============ AGENTS ============

    @app.get("/api/roles")
    async def get_roles():
        """Get all agent roles with their info."""
        result = {}

        for name in get_all_agent_names():
            role = load_agent_role(name)
            config = load_agent_config(name)

            # Determine tools for this agent
            if role.get("is_boss"):
                tools = ["create_task", "get_task_status"]
            else:
                tools = ["get_my_tasks", "pick_task", "complete_task"]

            result[name] = {
                "color": config.get("color", role.get("color", "#888")),
                "model": config.get("model", "claude-cli"),
                "is_boss": role.get("is_boss", False),
                "tools": tools,
            }
        return result

    @app.get("/api/agents/stats")
    async def get_agent_stats():
        """Get live stats for all agents."""
        return _compute_agent_stats(include_task_details=True)

    @app.get("/api/agents/{agent_name}/role")
    async def get_agent_role_content(agent_name: str):
        """Get the raw role.md content for an agent."""
        try:
            content = load_agent_role_md(agent_name)
            if not content:
                return {"error": f"No role.md found for {agent_name}"}
            return {"content": content}
        except Exception as e:
            return {"error": str(e)}

    @app.post("/api/agents/{agent_name}/config")
    async def update_agent_config(agent_name: str, config: dict):
        """Update an agent's configuration."""
        import json

        config_file = PROJECT_ROOT / "studio" / "agents" / agent_name.lower() / "config.json"

        # Load existing config
        existing = load_agent_config(agent_name)
        existing.update(config)

        # Save
        config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(config_file, "w") as f:
            json.dump(existing, f, indent=2)

        return {"status": "ok", "config": existing}

    # ============ HUB ============

    @app.get("/api/history")
    async def get_history(project: Optional[str] = Query(None)):
        """Get message history.

        T327: Accepts optional ?project= param to switch context first.
        """
        _switch_project_context(project)
        return [m.to_dict() for m in hub.get_history()]

    # ============ TASKS ============

    @app.get("/api/tasks")
    async def get_tasks():
        """Get all tasks."""
        return [t.to_dict() for t in task_manager.get_all_tasks()]

    @app.get("/api/tasks/summary")
    async def get_task_summary():
        """Get task status counts."""
        return task_manager.get_status_summary()

    @app.post("/api/tasks/clear")
    async def clear_all_tasks():
        """Clear all tasks."""
        task_manager.clear()
        return {"status": "ok", "message": "All tasks cleared"}

    @app.post("/api/tasks/clear-completed")
    async def clear_completed_tasks():
        """Clear only completed/reviewed tasks."""
        count = task_manager.clear_completed()
        return {"status": "ok", "cleared": count}

    @app.post("/api/tasks/{task_id}/cancel")
    async def cancel_task(task_id: str):
        """Cancel a specific task."""
        if task_manager.cancel_task(task_id):
            return {"success": True, "message": f"Task {task_id} cancelled"}
        return {"success": False, "error": "Task not found or cannot be cancelled"}

    @app.post("/api/tasks/{task_id}/retry")
    async def retry_task(task_id: str):
        """Retry a failed task by resetting it to READY."""
        if task_manager.retry_task(task_id):
            return {"success": True, "message": f"Task {task_id} queued for retry"}
        return {"success": False, "error": "Task not found or not in failed state"}

    @app.delete("/api/tasks/{task_id}")
    async def delete_task(task_id: str):
        """Delete a task."""
        if task_manager.delete_task(task_id):
            return {"success": True, "message": f"Task {task_id} deleted"}
        return {"success": False, "error": "Task not found"}

    @app.get("/api/tasks/{task_id}/deliverable")
    async def get_task_deliverable(task_id: str, project: Optional[str] = Query(None)):
        """Get deliverable content for a task (T561)."""
        from studio.core.tasks import get_base_path
        base = get_base_path(project)
        filepath = base / "deliverables" / f"{task_id}.md"
        if not filepath.exists():
            return {"exists": False}
        try:
            content = filepath.read_text(encoding="utf-8")
            return {"exists": True, "content": content}
        except Exception as e:
            return {"exists": False, "error": str(e)}

    @app.get("/api/tasks/{task_id}/deliverable/exists")
    async def check_deliverable_exists(task_id: str, project: Optional[str] = Query(None)):
        """Check if deliverable exists for a task (T561)."""
        from studio.core.tasks import get_base_path
        base = get_base_path(project)
        filepath = base / "deliverables" / f"{task_id}.md"
        return {"exists": filepath.exists()}

    # ============ REPORTS ============

    @app.get("/api/reports")
    async def get_reports():
        """List all saved reports."""
        reports_dir = PROJECT_ROOT / "reports"
        if not reports_dir.exists():
            return []

        reports = []
        for f in sorted(reports_dir.glob("*.*"), key=lambda x: x.stat().st_mtime, reverse=True):
            reports.append({
                "name": f.name,
                "size": f.stat().st_size,
                "modified": f.stat().st_mtime,
            })
        return reports

    @app.get("/api/reports/{filename}")
    async def get_report(filename: str):
        """Read a specific report."""
        filepath = PROJECT_ROOT / "reports" / filename
        if not filepath.exists():
            return {"error": "File not found"}
        return {"name": filename, "content": filepath.read_text(encoding="utf-8")}

    # ============ SCHEDULES ============

    @app.get("/api/schedules")
    async def get_schedules():
        """Get all schedules."""
        return [s.to_dict() for s in schedule_manager.get_all()]

    @app.post("/api/schedules")
    async def create_schedule(data: dict):
        """Create a new schedule."""
        schedule = schedule_manager.create(
            name=data["name"],
            description=data.get("description", ""),
            interval_seconds=data["interval_seconds"],
            tasks=data["tasks"],
        )
        return schedule.to_dict()

    @app.post("/api/schedules/{schedule_id}/pause")
    async def pause_schedule(schedule_id: str):
        """Pause a schedule."""
        if schedule_manager.pause(schedule_id):
            return {"status": "paused"}
        return {"error": "not found"}

    @app.post("/api/schedules/{schedule_id}/resume")
    async def resume_schedule(schedule_id: str):
        """Resume a schedule."""
        if schedule_manager.resume(schedule_id):
            return {"status": "resumed"}
        return {"error": "not found"}

    @app.post("/api/schedules/{schedule_id}/trigger")
    async def trigger_schedule(schedule_id: str):
        """Manually trigger a schedule."""
        task_ids = schedule_manager.run(schedule_id)
        if task_ids:
            return {"status": "triggered", "tasks": task_ids}
        return {"error": "not found"}

    @app.delete("/api/schedules/{schedule_id}")
    async def delete_schedule(schedule_id: str):
        """Delete a schedule."""
        if schedule_manager.delete(schedule_id):
            return {"status": "deleted"}
        return {"error": "not found"}

    # ============ SUGGESTIONS (Learning Tab) ============

    @app.get("/api/suggestions")
    async def get_suggestions(status: str = None):
        """Get all suggestions, optionally filtered by status."""
        suggestions = suggestion_manager.get_all(status)
        return {"suggestions": [s.to_dict() for s in suggestions]}

    @app.post("/api/suggestions")
    async def create_suggestion(data: dict):
        """Create a new suggestion."""
        try:
            suggestion = suggestion_manager.create(
                source_agent=data["source_agent"],
                title=data["title"],
                content=data["content"],
                category=data["category"],
                related_tasks=data.get("related_tasks"),
                files_mentioned=data.get("files_mentioned"),
                evidence=data.get("evidence"),
            )
            return suggestion.to_dict()
        except ValueError as e:
            return {"error": str(e)}
        except KeyError as e:
            return {"error": f"Missing required field: {e}"}

    @app.patch("/api/suggestions/{suggestion_id}")
    async def update_suggestion(suggestion_id: str, data: dict):
        """Update a suggestion (approve, reject, or mark implemented)."""
        decision = data.get("decision")
        status = data.get("status")
        notes = data.get("decision_notes")
        rating = data.get("rating")  # Star rating (0-5) from frontend

        if decision == "approved":
            suggestion = suggestion_manager.get(suggestion_id)
            if not suggestion:
                return {"error": "Suggestion not found"}

            if suggestion_manager.approve(suggestion_id, notes, rating):
                result = suggestion_manager.get(suggestion_id).to_dict()

                # Call Boss to create implementation tasks
                try:
                    from studio.studio import Studio
                    studio = Studio()
                    boss = studio.boss

                    # Build research context from discussion history (T296)
                    research_context = ""
                    if suggestion.discussion_history:
                        research_lines = []
                        for entry in suggestion.discussion_history:
                            agent = entry.get("agent", "Unknown")
                            content = entry.get("content", "")
                            # Truncate long entries to keep prompt focused
                            if len(content) > 500:
                                content = content[:500] + "..."
                            research_lines.append(f"[{agent}]: {content}")
                        research_context = "\n\n[REFERENCE HUB'S DISCUSSED RESEARCH]\n" + "\n\n".join(research_lines)

                    # Build prompt for Boss to implement the suggestion
                    prompt = f"""IMPLEMENT APPROVED SUGGESTION {suggestion.id}

Title: {suggestion.title}
Category: {suggestion.category}
Content: {suggestion.content}{research_context}

Create the appropriate task(s) to implement this suggestion. Use create_task tool to assign work to the right agent(s).

Consider:
- new_skill/feature → usually Code or Design
- architecture/tooling → usually Code
- process/workflow → may need multiple agents
- documentation → Text

Be specific in task descriptions. Reference suggestion {suggestion.id} for context."""

                    logger.info("Suggestions: Calling Boss to implement %s...", suggestion_id)
                    response = boss.respond(prompt)
                    logger.info("Suggestions: Boss response: %s...", response[:200])

                    # Extract task IDs from response (format: Created T###)
                    import re
                    task_ids = re.findall(r'Created (T\d+)', response)
                    if task_ids:
                        suggestion_manager.set_implementation_tasks(suggestion_id, task_ids)
                        result["implementation_tasks"] = task_ids
                        result["task_created"] = task_ids[0]  # Backward compat
                        logger.info("Suggestions: Boss created tasks: %s", task_ids)
                    else:
                        logger.info("Suggestions: Boss did not create tasks for %s", suggestion_id)

                except Exception as e:
                    logger.error("Suggestions: Boss implementation failed: %s", e)
                    # Approval still succeeded, just no tasks created

                return result
            return {"error": "Cannot approve - not found or not pending"}

        elif decision == "rejected":
            if suggestion_manager.reject(suggestion_id, notes):
                return suggestion_manager.get(suggestion_id).to_dict()
            return {"error": "Cannot reject - not found or not pending"}

        elif status == "implemented":
            if suggestion_manager.mark_implemented(suggestion_id):
                return suggestion_manager.get(suggestion_id).to_dict()
            return {"error": "Cannot mark implemented - not found or not approved"}

        elif data.get("action") == "defer":
            if suggestion_manager.defer(suggestion_id):
                return suggestion_manager.get(suggestion_id).to_dict()
            return {"error": "Cannot defer - not found or not pending"}

        return {"error": "Invalid update - provide decision, status, or action"}

    @app.delete("/api/suggestions/{suggestion_id}")
    async def delete_suggestion(suggestion_id: str):
        """Delete a suggestion."""
        if suggestion_manager.delete(suggestion_id):
            return {"status": "deleted"}
        return {"error": "not found"}

    @app.get("/api/suggestions/stats")
    async def get_suggestion_stats():
        """Get suggestion statistics."""
        return suggestion_manager.get_stats()

    @app.post("/api/suggestions/{suggestion_id}/discuss")
    async def discuss_suggestion(suggestion_id: str):
        """Initiate discussion on a suggestion via normal task delegation.

        T300: Refactored to use normal task flow instead of parallel execution.
        Flow:
        1. Boss creates a Research task for the suggestion
        2. Research task goes through normal queue and shows in hub
        3. When Research completes, Boss synthesizes opinion (via dependency)

        T285: 60-second cooldown per suggestion to prevent spam.
        """
        # Check cooldown (60 second rate limit per suggestion)
        last_discuss = _discuss_cooldowns.get(suggestion_id)
        if last_discuss:
            elapsed = time.time() - last_discuss
            if elapsed < DISCUSS_COOLDOWN_SECONDS:
                retry_after = int(DISCUSS_COOLDOWN_SECONDS - elapsed)
                return JSONResponse(
                    status_code=429,
                    content={"error": f"Rate limited. Try again in {retry_after} seconds."},
                    headers={"Retry-After": str(retry_after)}
                )

        suggestion = suggestion_manager.get(suggestion_id)
        if not suggestion:
            return {"error": "Suggestion not found"}

        # Set cooldown timestamp before processing
        _discuss_cooldowns[suggestion_id] = time.time()

        # T300: Create tasks via normal delegation instead of parallel execution
        # Step 1: Create Research task
        research_task = task_manager.create_task(
            description=f"""[WHAT] Research suggestion {suggestion.id}

[CONTEXT]
Title: {suggestion.title}
Category: {suggestion.category}
Content: {suggestion.content}

[DELIVERABLE]
Investigate this suggestion:
1. Search for relevant best practices or prior art
2. Find evidence for or against this approach
3. Identify any technical considerations

Provide a brief research summary (3-5 key findings). Include sources if available.

IMPORTANT: After completing research, call add_discussion tool with suggestion_id="{suggestion.id}" to record your findings.""",
            assignee="Research",
        )

        # Step 2: Create Boss analysis task that depends on research
        boss_task = task_manager.create_task(
            description=f"""[WHAT] Analyze suggestion {suggestion.id} and provide strategic opinion

[CONTEXT]
Title: {suggestion.title}
Category: {suggestion.category}
Content: {suggestion.content}

[REFERENCE] Research completed in {research_task.id}

[DELIVERABLE]
Based on the research findings from {research_task.id}, provide your strategic opinion:
1. Does it align with studio goals and current priorities?
2. What's the potential impact (high/medium/low)?
3. Are there any risks or concerns?
4. Your recommendation: approve, reject, or needs more info?

Be concise (3-5 sentences). Focus on strategic fit, not implementation details.

IMPORTANT: After analysis, call add_discussion tool with suggestion_id="{suggestion.id}" to record your opinion.""",
            assignee="BOSS",
            dependencies=[research_task.id],
        )

        # Post to hub for visibility (tasks will also post as they execute)
        hub.post("BOSS", f"Discussing suggestion {suggestion.id}: {suggestion.title}")
        hub.post("BOSS", f"Created {research_task.id} → Research, {boss_task.id} → BOSS (analysis)")

        return {
            "suggestion_id": suggestion_id,
            "status": "tasks_created",
            "research_task": research_task.id,
            "boss_task": boss_task.id,
            "message": f"Discussion initiated. Research task {research_task.id} will run first, then Boss analysis in {boss_task.id}."
        }

    # ============ TOKEN TRACKING ============

    @app.get("/api/tokens/session")
    async def get_token_session():
        """Get current session token usage stats."""
        return get_session_tokens()

    @app.post("/api/tokens/reset")
    async def reset_token_session():
        """Reset session token tracking AND task cost data (full reset)."""
        reset_session_tokens()
        # Also reset task costs so UI reflects the reset
        tasks_reset = task_manager.reset_token_costs()
        return {"status": "ok", "message": f"Token tracking reset. {tasks_reset} tasks cleared."}

    @app.get("/api/tokens/cache")
    async def get_cache_efficiency():
        """Get cache efficiency stats per agent.

        Returns:
            agents: Per-agent cache hit/miss stats
            summary: Overall cache efficiency

        Example response:
            {
                "agents": {
                    "Code": {
                        "cache_hits": 45000,
                        "cache_misses": 5000,
                        "total_input": 50000,
                        "hit_rate_pct": 90.0,
                        "cost_savings_usd": 0.108,
                        "calls": 5
                    }
                },
                "summary": {
                    "total_cache_hits": 120000,
                    "total_cache_misses": 15000,
                    "overall_hit_rate_pct": 88.9,
                    "total_cost_savings_usd": 0.288
                }
            }
        """
        return get_cache_stats()

    # ============ SESSION MANAGEMENT ============

    @app.post("/api/sessions/clear/{agent_name}")
    async def clear_agent_session_route(agent_name: str):
        """Clear a specific agent's persistent session."""
        from backends.backends.persistent_claude_cli import clear_session
        if clear_session(agent_name):
            return {"status": "ok", "message": f"Session cleared for {agent_name}"}
        return {"status": "ok", "message": f"No session found for {agent_name}"}

    @app.post("/api/sessions/clear-all")
    async def clear_all_sessions_route():
        """Clear all agent persistent sessions."""
        from backends.backends.persistent_claude_cli import clear_all_sessions
        count = clear_all_sessions()
        return {"status": "ok", "cleared": count}

    @app.get("/api/sessions")
    async def list_sessions_route():
        """List all agent sessions with stats."""
        from backends.backends.persistent_claude_cli import list_sessions
        return list_sessions()

    # ============ FILE EXPLORER ============

    IGNORED_DIRS = {'.git', '__pycache__', '.venv', 'venv', 'node_modules', '.idea', '.vscode'}
    IGNORED_FILES = {'.env', '.gitignore', '*.pyc', '*.pyo'}

    def should_ignore(name: str) -> bool:
        """Check if file/dir should be ignored."""
        if name in IGNORED_DIRS:
            return True
        if name.startswith('.'):
            return True
        for pattern in IGNORED_FILES:
            if pattern.startswith('*'):
                if name.endswith(pattern[1:]):
                    return True
            elif name == pattern:
                return True
        return False

    def scan_directory(path: Path, relative_to: Path) -> list:
        """Recursively scan directory and return file tree."""
        items = []
        try:
            for entry in sorted(path.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower())):
                if should_ignore(entry.name):
                    continue

                rel_path = str(entry.relative_to(relative_to)).replace('\\', '/')

                if entry.is_dir():
                    children = scan_directory(entry, relative_to)
                    items.append({
                        "name": entry.name,
                        "path": rel_path,
                        "type": "folder",
                        "children": children,
                    })
                else:
                    items.append({
                        "name": entry.name,
                        "path": rel_path,
                        "type": "file",
                        "size": entry.stat().st_size,
                    })
        except PermissionError:
            pass
        return items

    @app.get("/api/files")
    async def get_files():
        """Get file tree of project."""
        tree = scan_directory(PROJECT_ROOT, PROJECT_ROOT)
        return {"root": str(PROJECT_ROOT), "tree": tree}

    @app.get("/api/files/read")
    async def read_file(path: str):
        """Read contents of a file."""
        try:
            file_path = PROJECT_ROOT / path
            # Security: ensure path is within project
            file_path = file_path.resolve()
            if not str(file_path).startswith(str(PROJECT_ROOT.resolve())):
                return {"error": "Access denied"}

            if not file_path.exists():
                return {"error": "File not found"}

            if not file_path.is_file():
                return {"error": "Not a file"}

            # Check file size
            if file_path.stat().st_size > 1_000_000:  # 1MB limit
                return {"error": "File too large"}

            # Try to read as text
            try:
                content = file_path.read_text(encoding='utf-8')
                return {"path": path, "content": content}
            except UnicodeDecodeError:
                return {"error": "Binary file cannot be displayed"}

        except Exception as e:
            return {"error": str(e)}

    @app.post("/api/restart")
    async def restart_server():
        """Restart the server by spawning a new process then exiting."""
        import sys
        import threading

        def delayed_restart():
            import time
            time.sleep(0.5)  # Give time for response to be sent

            # Spawn new server process before exiting
            python_exe = sys.executable
            script_path = str(PROJECT_ROOT / "server.py")

            # Start new process detached from current
            subprocess.Popen(
                [python_exe, script_path],
                cwd=str(PROJECT_ROOT),
                creationflags=subprocess.CREATE_NEW_CONSOLE,  # Windows: new console window
                start_new_session=True
            )

            time.sleep(0.3)  # Give new process time to start
            os._exit(0)  # Exit current process

        threading.Thread(target=delayed_restart, daemon=True).start()
        return {"status": "restarting", "message": "Server restarting..."}

    @app.post("/api/files/open-explorer")
    async def open_in_explorer(data: dict):
        """Open file or folder in Windows Explorer."""
        try:
            path = data.get("path", "")
            file_path = PROJECT_ROOT / path if path else PROJECT_ROOT
            file_path = file_path.resolve()

            # Security check
            if not str(file_path).startswith(str(PROJECT_ROOT.resolve())):
                return {"error": "Access denied"}

            if file_path.is_file():
                # Open explorer with file selected
                subprocess.Popen(f'explorer /select,"{file_path}"')
            else:
                # Open folder
                subprocess.Popen(f'explorer "{file_path}"')

            return {"status": "opened"}
        except Exception as e:
            return {"error": str(e)}

    # ============ PROJECTS ============

    @app.get("/api/projects")
    async def get_projects(include_archived: bool = False):
        """Get all projects."""
        projects = project_manager.get_all(include_archived)
        return {
            "projects": [p.to_dict() for p in projects],
            "active_project_id": project_manager.active_project_id,
        }

    @app.get("/api/projects/{project_id}")
    async def get_project(project_id: str):
        """Get a specific project."""
        project = project_manager.get(project_id)
        if not project:
            return {"error": "Project not found"}
        return project.to_dict()

    @app.post("/api/projects")
    async def create_project(data: dict):
        """Create a new project (link existing folder - legacy mode)."""
        try:
            project = project_manager.create(
                name=data["name"],
                path=data["path"],
                description=data.get("description", ""),
            )
            return project.to_dict()
        except ValueError as e:
            return {"error": str(e)}
        except KeyError as e:
            return {"error": f"Missing required field: {e}"}

    @app.post("/api/projects/create-external")
    async def create_external_project(data: dict):
        """Create a new external project with folder scaffolding (T425/T434).

        Creates folder at {parent_dir}/{slug}/, initializes git, scaffolds files.
        T434: with_ai=True sets pipeline_state to DRAFT for AI whitepaper generation.
        """
        try:
            result = project_manager.create_external(
                name=data.get("name", ""),
                parent_dir=data.get("parent_dir", ""),
                description=data.get("description", ""),
                init_git=data.get("init_git", True),
                with_ai=data.get("with_ai", False),
                metadata=data.get("metadata", {}),
            )
            return result
        except Exception as e:
            return {"error": str(e)}

    @app.patch("/api/projects/{project_id}")
    async def update_project(project_id: str, data: dict):
        """Update a project's metadata."""
        try:
            project = project_manager.update(project_id, **data)
            if not project:
                return {"error": "Project not found"}
            return project.to_dict()
        except ValueError as e:
            return {"error": str(e)}

    @app.post("/api/projects/{project_id}/set-active")
    async def set_active_project(project_id: str):
        """Set the active project and switch memory/history paths (T321)."""
        if hub.set_active_project(project_id):
            project = project_manager.get(project_id)
            return {
                "status": "ok",
                "active_project_id": project_id,
                "project_name": project.name if project else None,
            }
        return {"error": "Project not found or archived"}

    @app.post("/api/projects/clear-active")
    async def clear_active_project():
        """Clear active project, switch to default memory/history paths (T321)."""
        hub.set_active_project(None)
        return {"status": "ok", "active_project_id": None}

    @app.post("/api/projects/{project_id}/archive")
    async def archive_project(project_id: str):
        """Archive a project."""
        if project_manager.archive(project_id):
            return {"status": "archived"}
        return {"error": "Project not found"}

    @app.post("/api/projects/{project_id}/unarchive")
    async def unarchive_project(project_id: str):
        """Restore an archived project."""
        if project_manager.unarchive(project_id):
            return {"status": "active"}
        return {"error": "Project not found"}

    @app.delete("/api/projects/{project_id}")
    async def delete_project(project_id: str):
        """Delete a project reference (does not delete external folder)."""
        if project_manager.delete(project_id):
            return {"status": "deleted"}
        return {"error": "Project not found"}

    @app.get("/api/projects/{project_id}/document/{doc_type}")
    async def get_project_document(project_id: str, doc_type: str):
        """Read a document (white_paper or roadmap) from project folder."""
        if doc_type not in ("white_paper", "roadmap"):
            return {"error": "Invalid document type. Use 'white_paper' or 'roadmap'"}
        return project_manager.read_document(project_id, doc_type)

    @app.post("/api/projects/{project_id}/open-folder")
    async def open_project_folder(project_id: str):
        """Open project folder in Windows Explorer."""
        project = project_manager.get(project_id)
        if not project:
            return {"error": "Project not found"}

        from pathlib import Path
        project_path = Path(project.path)
        if not project_path.exists():
            return {"error": "Project folder not found"}

        try:
            subprocess.Popen(f'explorer "{project_path}"')
            return {"status": "opened"}
        except Exception as e:
            return {"error": str(e)}

    # ============ T434: PROJECT PIPELINE ENDPOINTS ============

    @app.post("/api/projects/{project_id}/pipeline-state")
    async def set_project_pipeline_state(project_id: str, data: dict):
        """Set project pipeline state (setup/draft/clarify/dispatch/delivered)."""
        from studio.core.projects import PipelineState
        state_str = data.get("state", "")
        try:
            state = PipelineState(state_str)
        except ValueError:
            return {"error": f"Invalid state: {state_str}"}

        if project_manager.set_pipeline_state(project_id, state):
            return {"status": "updated", "pipeline_state": state.value}
        return {"error": "Project not found"}

    @app.post("/api/projects/{project_id}/whitepaper-rating")
    async def set_project_whitepaper_rating(project_id: str, data: dict):
        """Set whitepaper star rating (1-5)."""
        rating = data.get("rating", 0)
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return {"error": "Rating must be 1-5"}

        if project_manager.set_whitepaper_rating(project_id, rating):
            return {"status": "updated", "whitepaper_rating": rating}
        return {"error": "Project not found"}

    @app.post("/api/projects/{project_id}/whitepaper")
    async def update_project_whitepaper(project_id: str, data: dict):
        """Update project whitepaper.md content."""
        content = data.get("content", "")
        if not content:
            return {"error": "Content is required"}

        result = project_manager.update_whitepaper(project_id, content)
        return result

    @app.post("/api/projects/{project_id}/cancel")
    async def cancel_project(project_id: str, data: dict):
        """Cancel a project in draft/clarify state.

        Optionally deletes the external folder with delete_folder=True.
        """
        delete_folder = data.get("delete_folder", False)
        result = project_manager.cancel_project(project_id, delete_folder)
        return result

    @app.post("/api/projects/{project_id}/chat")
    async def project_chat(project_id: str, data: dict):
        """Send a message to the Project Chat agent for whitepaper drafting.

        T439: Connects Project Chat panel to whitepaper drafting agent.
        Uses Gemini for speed. Returns updated whitepaper + star rating.
        """
        from studio.project_chat import handle_project_chat

        message = data.get("message", "").strip()
        if not message:
            return {"error": "Message is required"}

        project = project_manager.get(project_id)
        if not project:
            return {"error": "Project not found"}

        # Run chat agent (blocking, but Gemini is fast)
        try:
            result = await asyncio.to_thread(
                handle_project_chat,
                project_id=project_id,
                user_message=message,
                project=project
            )
            return result
        except Exception as e:
            logger.error("Project chat error: %s", e)
            return {"error": str(e)}

    @app.get("/api/projects/{project_id}/chat-history")
    async def get_project_chat_history(project_id: str):
        """Get chat history for a project."""
        from studio.project_chat import get_chat_history

        project = project_manager.get(project_id)
        if not project:
            return {"error": "Project not found"}

        return {"messages": get_chat_history(project_id)}
