"""
Studio: Main orchestration class for the game studio agents.
"""

import time
import json
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from agents import Agent
from agents.backends import ClaudeCLIBackend

from studio.core import hub, task_manager, TaskStatus
from studio.core.studio_metrics import track_tokens


# Timeout for agent responses (seconds)
AGENT_RESPONSE_TIMEOUT = 30


# Agent folders
AGENTS_DIR = Path(__file__).parent / "agents"
SHARED_DIR = AGENTS_DIR / "shared"
SKILLS_DIR = Path(__file__).parent / "skills"
ROUTERS_DIR = SKILLS_DIR / "_routers"

# Agent name to router type mapping
AGENT_ROUTER_MAP = {
    "boss": "boss",
    "programmer": "programmer",
    "designer": "designer",
    "artist": "artist",
    "writer": "writer",
    "qa": "qa",
    "taxonomy": "taxonomy",
    "context": "context",
}


def load_markdown(filepath: Path) -> str:
    """Load a markdown file as string."""
    if filepath.exists():
        return filepath.read_text(encoding="utf-8")
    return ""


def load_agent_role_md(name: str) -> str:
    """Load agent role from markdown file."""
    role_file = AGENTS_DIR / name.lower() / "role.md"
    return load_markdown(role_file)


def load_agent_config(name: str) -> dict:
    """Load agent config from JSON file."""
    config_file = AGENTS_DIR / name.lower() / "config.json"
    if config_file.exists():
        with open(config_file) as f:
            return json.load(f)
    return {}


def load_agent_skills(name: str) -> list[str]:
    """Load all skills for an agent."""
    skills_dir = AGENTS_DIR / name.lower() / "skills"
    skills = []
    if skills_dir.exists():
        for skill_file in skills_dir.glob("*.md"):
            skills.append(load_markdown(skill_file))
    return skills


def load_shared_skills() -> list[str]:
    """Load shared skills available to all agents."""
    skills = []
    if SHARED_DIR.exists():
        for skill_file in SHARED_DIR.glob("*.md"):
            skills.append(load_markdown(skill_file))
    return skills


def load_router_skill(agent_name: str) -> str:
    """Load the router skill for an agent type."""
    # Map agent name to router type
    router_type = AGENT_ROUTER_MAP.get(agent_name.lower())
    if not router_type:
        return ""

    router_file = ROUTERS_DIR / f"{router_type}.md"
    if router_file.exists():
        return load_markdown(router_file)
    return ""


def get_all_agent_names() -> list[str]:
    """Get list of all agent names from folders."""
    names = []
    for folder in AGENTS_DIR.iterdir():
        if folder.is_dir() and folder.name != "shared":
            # Check for role.md or role.json
            if (folder / "role.md").exists() or (folder / "role.json").exists():
                config = load_agent_config(folder.name)
                names.append(config.get("name", folder.name.upper() if folder.name == "boss" else folder.name.capitalize()))
    return names


def load_agent_role(name: str) -> dict:
    """Load agent role - for backwards compat with server.py"""
    # Try JSON first
    config_file = AGENTS_DIR / name.lower() / "role.json"
    if config_file.exists():
        with open(config_file) as f:
            return json.load(f)

    # Parse markdown frontmatter-style
    md = load_agent_role_md(name)
    config = load_agent_config(name)
    return {
        "name": config.get("name", name),
        "title": config.get("title", "Agent"),
        "color": config.get("color", "#888"),
        "is_boss": "boss" in name.lower(),
        "system_prompt": md,
    }


class StudioAgent:
    """An agent that reads/writes to the shared hub and uses task tools."""

    def __init__(self, name: str, backend: str = "claude-cli"):
        self.name_raw = name
        config = load_agent_config(name)

        self.name = config.get("name", name)
        self.title = config.get("title", "Agent")
        self.color = config.get("color", "#888")
        self.model = config.get("model", "claude")  # Model ignored for CLI backend
        self.is_boss = "boss" in name.lower()

        # Load role from markdown
        role_md = load_agent_role_md(name)

        # Load skills
        self.skills = load_agent_skills(name)
        self.shared_skills = load_shared_skills()

        # Build system prompt from role + skills
        system_prompt = self._build_system_prompt(role_md)

        # Load tools based on role
        tools, handlers = self._load_tools()

        self.agent = Agent(
            name=self.name,
            system_prompt=system_prompt,
            backend=backend,
            model=self.model,
            tools=tools,
            tool_handlers=handlers,
        )

        print(f"  [{self.name}] Using backend: {backend}, {len(self.skills)} skills loaded")

    def _build_system_prompt(self, role_md: str) -> str:
        """Build full system prompt from role + router + shared skills."""
        parts = [role_md]

        # Add router skill (skill loading navigation)
        router = load_router_skill(self.name_raw)
        if router:
            parts.append(router)

        # Add shared project conventions
        for skill in self.shared_skills:
            parts.append(skill)

        # Add agent-specific skills (legacy - from agents/{name}/skills/)
        for skill in self.skills:
            parts.append(skill)

        return "\n\n---\n\n".join(parts)

    def _load_tools(self) -> tuple[list, dict]:
        """Load tools for this agent."""
        tools = []
        handlers = {}

        # All agents get file tools
        from studio.core.file_tools import FILE_TOOLS, FILE_HANDLERS
        tools.extend(FILE_TOOLS)
        handlers.update(FILE_HANDLERS)

        if self.is_boss:
            from studio.agents.boss.tools import TOOLS, HANDLERS
            tools.extend(TOOLS)
            handlers.update(HANDLERS)
        else:
            # All employees get base employee tools
            from studio.core.employee_tools import TOOLS as EMP_TOOLS, make_handlers
            tools.extend(EMP_TOOLS)
            handlers.update(make_handlers(self.name))

            # Check for agent-specific tools
            agent_tools_file = AGENTS_DIR / self.name_raw.lower() / "tools.py"
            if agent_tools_file.exists():
                if self.name == "Artist":
                    from studio.agents.artist.tools import TOOLS as ART_TOOLS, HANDLERS as ART_HANDLERS
                    tools.extend(ART_TOOLS)
                    handlers.update(ART_HANDLERS)
                elif self.name == "Writer":
                    from studio.agents.writer.tools import TOOLS as WRITE_TOOLS, HANDLERS as WRITE_HANDLERS
                    tools.extend(WRITE_TOOLS)
                    handlers.update(WRITE_HANDLERS)
                elif self.name == "QA":
                    from studio.agents.qa.tools import TOOLS as QA_TOOLS, HANDLERS as QA_HANDLERS
                    tools.extend(QA_TOOLS)
                    handlers.update(QA_HANDLERS)
                elif self.name == "Taxonomy":
                    from studio.agents.taxonomy.tools import TOOLS as TAX_TOOLS, HANDLERS as TAX_HANDLERS
                    tools.extend(TAX_TOOLS)
                    handlers.update(TAX_HANDLERS)

        return tools, handlers

    def _build_context(self, trigger_message: str = None) -> str:
        """Build scoped context for this agent."""
        parts = []

        if self.is_boss:
            # BOSS sees: recent hub (limited), active tasks only
            context = hub.get_context_for_agent(self.name, limit=10)
            parts.append(f"RECENT MESSAGES:\n{context}")

            # Only show active tasks (not approved/failed) to save tokens
            task_context = task_manager.to_active_context_string()
            parts.append(task_context)

        else:
            # Employees see: messages mentioning them, their tasks only
            my_tasks = task_manager.get_agent_tasks(self.name)

            if my_tasks:
                task_lines = [f"YOUR TASKS ({self.name}):"]
                for task in my_tasks:
                    task_lines.append(f"  [{task.id}] {task.status.value}: {task.description}")
                    if task.review_notes and task.status == TaskStatus.READY:
                        task_lines.append(f"       Feedback: {task.review_notes}")
                parts.append("\n".join(task_lines))
            else:
                parts.append("You have no assigned tasks.")

            # Only recent messages that mention this agent
            recent = hub.get_history(limit=10)
            relevant = [m for m in recent if self.name in m.content or m.sender == "BOSS"]
            if relevant:
                lines = [f"[{m.sender}]: {m.content}" for m in relevant[-5:]]
                parts.append(f"RELEVANT MESSAGES:\n" + "\n".join(lines))

        # Add trigger
        parts.append(trigger_message or "Respond appropriately.")

        return "\n\n".join(parts)

    def respond(self, trigger_message: str = None) -> str:
        """Generate a response based on scoped context."""
        try:
            prompt = self._build_context(trigger_message)

            print(f"[{self.name}] Thinking...")
            start = time.time()
            response = self.agent.chat(prompt)
            elapsed = time.time() - start

            # Get token usage
            usage = self.agent.get_last_token_usage()
            tokens_in = usage.get("total_input_tokens", 0)
            tokens_out = usage.get("total_output_tokens", 0)
            print(f"[{self.name}] Done. ({elapsed:.1f}s, {tokens_in}+{tokens_out} tokens)")

            hub.post(self.name, response)
            return response

        except Exception as e:
            error_msg = f"Error: {e}"
            print(f"[{self.name}] {error_msg}")
            hub.post(self.name, error_msg)
            return error_msg

    def get_last_token_usage(self) -> dict:
        """Get token usage from last respond() call."""
        return self.agent.get_last_token_usage()


class Studio:
    """The full studio with all agents and task orchestration."""

    def __init__(self, backend: str = "claude-cli"):
        self.backend = backend
        self.agents: dict[str, StudioAgent] = {}
        self.thinking_callback = None  # Set by server for UI updates
        self.status_callback = None  # Set by server for agent status updates

        # Load all agents from folders
        for name in get_all_agent_names():
            self.agents[name] = StudioAgent(name, backend)

        self.boss = self.agents.get("BOSS")

    def set_thinking_callback(self, callback):
        """Set callback for thinking state changes. callback(agent_name | None)"""
        self.thinking_callback = callback

    def set_status_callback(self, callback):
        """Set callback for agent status updates. callback(agent_name, status, activity)"""
        self.status_callback = callback

    def _notify_thinking(self, agent_name: str | None):
        """Notify that an agent started/stopped thinking."""
        if self.thinking_callback:
            self.thinking_callback(agent_name)

    def _notify_status(self, agent_name: str, status: str, activity: str = ""):
        """Notify agent status change."""
        if self.status_callback:
            self.status_callback(agent_name, status, activity)

    def _find_agent(self, name: str) -> StudioAgent | None:
        """Find agent by name (case-insensitive).

        Allows task assignees like 'Qa', 'qa', or 'QA' to all match
        the canonical agent name from config.json.
        """
        if not name:
            return None
        name_lower = name.lower()
        for agent_name, agent in self.agents.items():
            if agent_name.lower() == name_lower:
                return agent
        return None

    def get_agent(self, name: str) -> StudioAgent:
        return self.agents.get(name)

    def handle_user_message(self, content: str) -> str:
        """Process user message through BOSS."""
        hub.post("user", content)
        self._notify_status("BOSS", "working", "Processing user message...")
        self._notify_thinking("BOSS")
        boss_response = self.boss.respond("User sent a new message. Respond carefully.")

        # Track Boss token usage
        usage = self.boss.get_last_token_usage()
        track_tokens(
            agent="BOSS",
            input_tokens=usage.get("total_input_tokens", 0),
            output_tokens=usage.get("total_output_tokens", 0),
            task_id=None  # Boss messages aren't task-specific
        )

        self._notify_thinking(None)
        self._notify_status("BOSS", "idle", "")
        return boss_response

    def agent_respond(self, agent_name: str, prompt: str = None) -> str:
        """Make a specific agent respond."""
        if agent_name in self.agents:
            self._notify_status(agent_name, "working", "Responding...")
            self._notify_thinking(agent_name)
            result = self.agents[agent_name].respond(prompt)

            # Track token usage for manual pokes
            usage = self.agents[agent_name].get_last_token_usage()
            track_tokens(
                agent=agent_name,
                input_tokens=usage.get("total_input_tokens", 0),
                output_tokens=usage.get("total_output_tokens", 0),
                task_id=None  # Manual pokes aren't task-specific
            )

            self._notify_thinking(None)
            self._notify_status(agent_name, "idle", "")
            return result
        return None

    def _execute_with_timeout(self, agent: StudioAgent, prompt: str, timeout: int = AGENT_RESPONSE_TIMEOUT) -> str:
        """
        Execute agent.respond() with a timeout.
        Raises TimeoutError if the agent doesn't respond in time.
        """
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(agent.respond, prompt)
            try:
                return future.result(timeout=timeout)
            except FuturesTimeoutError:
                raise TimeoutError(f"Agent response timed out after {timeout}s")

    def _classify_error(self, error: Exception) -> tuple[str, str]:
        """
        Classify an error and return (error_type, action).
        Returns:
            - error_type: Short identifier for the error
            - action: "retry", "skip", or "skip" with specific handling
        """
        error_str = str(error).lower()
        error_type = type(error).__name__

        # Rate limit errors
        if "429" in error_str or "rate limit" in error_str:
            return "RATE_LIMIT", "retry"

        # Context/token limit errors
        if "context" in error_str and "limit" in error_str:
            return "CONTEXT_TOO_LARGE", "skip"
        if "token" in error_str and ("limit" in error_str or "exceed" in error_str):
            return "CONTEXT_TOO_LARGE", "skip"

        # Timeout errors
        if isinstance(error, TimeoutError) or "timeout" in error_str or "timed out" in error_str:
            return "TIMEOUT", "retry"

        # Network errors
        if "connection" in error_str or "network" in error_str:
            return "NETWORK", "retry"

        # Authentication errors
        if "401" in error_str or "403" in error_str or "auth" in error_str:
            return "AUTH_ERROR", "skip"

        # Default: unknown error
        return error_type, "skip"

    def tick(self) -> bool:
        """
        Process one cycle of work. Returns True if any work was done.

        SERVER-DRIVEN FLOW:
        1. Server finds READY task
        2. Server sets task to IN_PROGRESS
        3. Server sends task to agent (agent just does the work)
        4. Server captures response and sets task to APPROVED

        Agents don't need to call pick_task or complete_task - server handles state.
        """
        did_work = False

        # Check for ready tasks
        ready_tasks = task_manager.get_ready_tasks()
        for task in ready_tasks:
            agent = self._find_agent(task.assignee)
            if agent:
                if not agent.is_boss:
                    # Validate task before dispatch
                    is_valid, error_msg = task_manager.validate_task(task.id)
                    if not is_valid:
                        print(f"[Studio] Skipping invalid task {task.id}: {error_msg}")
                        task_manager.set_error(task.id, error_msg)
                        did_work = True
                        continue

                    # SERVER: Start the task (sets IN_PROGRESS)
                    task_manager.start_task(task.id)
                    print(f"[Studio] Started {task.id} for {agent.name}")

                    # Execute task with error handling and timeout
                    try:
                        self._notify_status(agent.name, "working", f"Working on {task.id}...")
                        self._notify_thinking(agent.name)

                        # Build clean prompt - agent just needs to do the work
                        trigger = f"""TASK {task.id}:
{task.description}

Do this task and respond with your deliverable. Your response will be saved as the task result."""

                        # Build and save full context (what agent actually sees)
                        full_prompt = agent._build_context(trigger)
                        task_manager.save_prompt(task.id, full_prompt)

                        # Get agent's response
                        response = self._execute_with_timeout(agent, trigger, timeout=AGENT_RESPONSE_TIMEOUT)

                        # SERVER: Complete the task with agent's response
                        task_manager.complete_task(task.id, response)
                        print(f"[Studio] Completed {task.id}")

                        # Archive old tasks to keep context small
                        task_manager.archive_old_tasks(keep_recent=10)

                        # Log token usage on task
                        usage = agent.get_last_token_usage()
                        input_tokens = usage.get("total_input_tokens", 0)
                        output_tokens = usage.get("total_output_tokens", 0)

                        # Save to task
                        task_manager.log_tokens(
                            task.id,
                            usage.get("token_log", []),
                            input_tokens,
                            output_tokens,
                        )

                        # Also track in session metrics
                        track_tokens(
                            agent=agent.name,
                            input_tokens=input_tokens,
                            output_tokens=output_tokens,
                            task_id=task.id,
                        )

                        self._notify_thinking(None)
                        self._notify_status(agent.name, "idle", "")
                        did_work = True
                        break

                    except Exception as e:
                        # Classify and handle the error
                        error_type, action = self._classify_error(e)
                        error_msg = f"{error_type}: {str(e)[:200]}"
                        print(f"[Studio] Task {task.id} error ({action}): {error_msg}")

                        if action == "retry":
                            # Reset to READY for retry
                            task_manager.reset_task(task.id)
                            can_retry = task_manager.increment_retry(task.id, max_retries=3)
                            if can_retry:
                                retry_count = task_manager.get_retry_count(task.id)
                                print(f"[Studio] Task {task.id} will retry ({retry_count}/3) on next tick")
                            else:
                                task_manager.set_error(task.id, f"{error_msg} (max retries exceeded)")
                        else:
                            task_manager.set_error(task.id, error_msg)

                        self._notify_thinking(None)
                        self._notify_status(agent.name, "idle", "")
                        did_work = True
                        continue

        return did_work
