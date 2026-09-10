"""
Studio: Main orchestration class for the game studio agents.

Structure:
- studio/loader.py: Agent loading and configuration helpers
- studio/agent.py: StudioAgent class (individual agent wrapper)
- studio/studio.py: Studio orchestrator (this file)
"""

import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError, Future
from datetime import datetime
from typing import Optional

from studio.core import task_manager, TaskStatus, hub
from studio.core.logging_config import get_logger
from studio.core.studio_metrics import track_tokens
from studio.core.projects import project_manager
from studio.core.file_index import get_file_tree

logger = get_logger("Studio")
from studio.core.memory import memory_manager
from studio.core.history import history_manager
from studio.loader import get_all_agent_names
from studio.agent import StudioAgent

# Import backends for Raw pseudo-agent
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
import gemini
from backends.backends.claude_cli import ClaudeCLIBackend, clear_all_sessions
from backends.backends.ollama import OllamaBackend


# Re-export for backwards compatibility with server.py imports
from studio.loader import (
    load_agent_role,
    load_agent_config,
    get_all_agent_names,
)


# Timeout for agent responses (seconds)
# This is a safety net - real stale detection is in claude_cli.py (20 min no output)
# 30 min hard cap = absolute maximum, should never hit this
AGENT_RESPONSE_TIMEOUT = 1800


class Studio:
    """The full studio with all agents and task orchestration."""

    # Maximum concurrent agent tasks
    MAX_CONCURRENT_AGENTS = 3

    def __init__(self, backend: str = "claude-cli"):
        self.backend = backend
        self.agents: dict[str, StudioAgent] = {}
        self.thinking_callback = None  # Set by server for UI updates
        self.status_callback = None  # Set by server for agent status updates

        # Parallel execution tracking
        self._active_tasks: dict[str, Future] = {}  # agent_name -> Future
        self._executor = ThreadPoolExecutor(max_workers=self.MAX_CONCURRENT_AGENTS)

        # Load all agents from folders
        for name in get_all_agent_names():
            self.agents[name] = StudioAgent(name, backend)

        self.boss = self.agents.get("BOSS")

        # Wire up AC-Memory compression callback - Context agent compacts tiers
        # AC-Memory: bullet points, infinite tiers, for agent recall
        memory_manager.set_compress_callback(self._compress_with_context_agent)

        # Wire up History narrative callback - Writer compacts tiers
        # History: narrative prose, caps at Collection, for human reading
        # History runs INDEPENDENTLY from AC-Memory (both consume raw hub chat)
        history_manager.set_narrative_callback(self._generate_tier_narrative)

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

    def _compress_with_context_agent(self, content: str, tier_index: int, prev_tier_context: str) -> dict:
        """Compact tier content via Context agent with compress → classify → split.

        AC-Memory compression:
        1. COMPRESS raw content into key bullet points
        2. CLASSIFY each as ACTIVE, DONE, or FRICTION
        3. SPLIT: ACTIVE stays, DONE pushes, FRICTION tracked separately

        Args:
            content: The tier content to compact
            tier_index: Which tier is being compacted (0, 1, 2, ...)
            prev_tier_context: Content from tier N-1 for relevance判定

        Returns:
            dict with {keep: str, push: str, friction: str}
        """
        context_agent = self.agents.get("Prompt")
        if not context_agent:
            logger.debug("Prompt agent not found for AC-Memory compression")
            return self._fallback_compress(content, tier_index, prev_tier_context)

        # Truncate for context window
        content_preview = content[:8000] if len(content) > 8000 else content
        prev_preview = prev_tier_context[:2000] if prev_tier_context else "(empty - this is tier 0)"

        prompt = f"""AC-MEMORY COMPACTION: Tier {tier_index}

## Reference (Tier {tier_index - 1})
{prev_preview}

## Content to Compress ({len(content)} chars)
{content_preview}

---

## Classification

| Tag | Meaning | Destination |
|-----|---------|-------------|
| [ACTIVE] | Ongoing, needed now | ===KEEP=== (stays tier {tier_index}) |
| [DONE] | Completed, historical | ===PUSH=== (moves tier {tier_index + 1}) |
| [FRICTION] | Error, bug, blocker | ===FRICTION=== (tracked separately) |

## Constraints

- Summarize into bullets, don't copy raw text
- Max 60% KEEP (older = DONE when uncertain)
- FRICTION: prefix with [RESOLVED] or [UNRESOLVED]

## Output Format

===KEEP===
- [ACTIVE] bullet points

===PUSH===
- [DONE] bullet points

===FRICTION===
- [RESOLVED/UNRESOLVED] bullet points

---

Compress the content above into classified bullet points. Output ===KEEP===, ===PUSH===, ===FRICTION=== sections."""

        try:
            self._notify_status("Prompt", "working", f"Compacting tier {tier_index}...")
            response = context_agent.respond(prompt)
            self._notify_status("Prompt", "idle", "")

            # Parse response into keep/push
            result = self._parse_split_response(response)
            logger.info("AC-Memory: Tier %d split by Context agent (keep=%d chars, push=%d chars)",
                        tier_index, len(result['keep']), len(result['push']))
            return result

        except Exception as e:
            logger.error("AC-Memory compression failed: %s", e)
            return self._fallback_compress(content, tier_index, prev_tier_context)

    def _parse_split_response(self, response: str) -> dict:
        """Parse Context agent response into keep/push/friction sections."""
        keep = ""
        push = ""
        friction = ""

        response_upper = response.upper()

        # Find all section markers
        keep_start = response_upper.find("===KEEP===")
        push_start = response_upper.find("===PUSH===")
        friction_start = response_upper.find("===FRICTION===")

        # Build list of (position, name, header_len) sorted by position
        markers = []
        if keep_start != -1:
            markers.append((keep_start, "keep", 10))
        if push_start != -1:
            markers.append((push_start, "push", 10))
        if friction_start != -1:
            markers.append((friction_start, "friction", 14))

        markers.sort(key=lambda x: x[0])

        # Extract content between markers
        for i, (pos, name, header_len) in enumerate(markers):
            start = pos + header_len
            if i + 1 < len(markers):
                end = markers[i + 1][0]
            else:
                end = len(response)

            content = response[start:end].strip()

            if name == "keep":
                keep = content
            elif name == "push":
                push = content
            elif name == "friction":
                friction = content

        # Fallback if no markers found
        if not markers:
            lines = response.strip().split('\n')
            mid = len(lines) // 2
            keep = '\n'.join(lines[:mid])
            push = '\n'.join(lines[mid:])

        return {"keep": keep, "push": push, "friction": friction}

    def _fallback_compress(self, content: str, tier_index: int, prev_tier_context: str) -> dict:
        """Fallback compression when Context agent unavailable.

        Simple split by lines, extracts friction keywords.
        """
        lines = [l.strip() for l in content.split('\n') if l.strip()]

        # Extract friction lines (errors, bugs, failures)
        friction_keywords = ['error', 'bug', 'fail', 'block', 'retry', 'crash', 'broke', 'issue']
        friction_lines = []
        other_lines = []

        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in friction_keywords):
                friction_lines.append(line)
            else:
                other_lines.append(line)

        # Split remaining 50/50
        mid = len(other_lines) // 2
        keep = '\n'.join(other_lines[:mid]) if mid > 0 else '\n'.join(other_lines)
        push = '\n'.join(other_lines[mid:]) if mid > 0 else ""
        friction = '\n'.join(friction_lines)

        return {"keep": keep, "push": push, "friction": friction}

    def _trigger_history_tier(self, content: str, tier_index: int):
        """Trigger history tier system after memory compression (T309).

        Maps memory tiers to history tiers:
        - Tier 0 compression → Draft trigger
        - Tier 1 compression → Chapter trigger (epoch end)
        - Tier 2+ compression → Book/Collection triggers (phase complete)
        """
        from studio.core.history import history_manager

        if tier_index == 0:
            # Memory tier 0 = session messages → Draft
            history_manager.trigger_draft(content, source="memory_t0")
        elif tier_index == 1:
            # Memory tier 1 = daily summaries → Chapter (epoch end)
            history_manager.trigger_epoch_end(content)
        elif tier_index >= 2:
            # Memory tier 2+ = archives → Book (project phase)
            history_manager.trigger_phase_complete(
                phase_name=f"archive_t{tier_index}",
                phase_summary=content
            )

    def _generate_tier_narrative(self, content: str, tier_name: str, compression_count: int) -> Optional[str]:
        """Generate narrative for history tier via Writer.

        Called by HistoryManager during tier compression. Writer transforms
        accumulated tier content into narrative prose.

        Args:
            content: The tier content to narrate
            tier_name: Name of tier being compressed (draft, chapter, book, collection)
            compression_count: How many times this tier has been compressed

        Returns:
            Narrative markdown string, or None on failure
        """
        writer_agent = self.agents.get("Text")
        if not writer_agent:
            logger.debug("Text agent not found for tier narrative")
            return None

        # Truncate content for Writer
        content_preview = content[:6000] if len(content) > 6000 else content

        # Tier-specific prompts with compression targets
        tier_prompts = {
            "draft": """| Aspect | Value |
|--------|-------|
| Style | Journal, "we", informal |
| Target | ~10% of input |
| Include | Work done, decisions, blockers resolved, open threads |
| Omit | Chatter, repeated status, raw dumps |""",

            "chapter": """| Aspect | Value |
|--------|-------|
| Style | Project log, chronological, cause-effect |
| Target | ~15% of input |
| Include | Milestones, approach evolution, patterns, turning points |
| Omit | Session minutiae, redundant summaries |""",

            "book": """| Aspect | Value |
|--------|-------|
| Style | Technical memoir, reflective |
| Target | ~15% of input |
| Include | Phase objectives, architecture decisions, lessons, what worked/didn't |
| Omit | Chapter-level details already captured |""",

            "collection": """| Aspect | Value |
|--------|-------|
| Style | Historical record, factual, searchable |
| Target | No limit (permanent archive) |
| Include | Phase ID, time period, accomplishments, lessons, links to books |
| Omit | Nothing - this is the permanent record |""",
        }

        tier_prompt = tier_prompts.get(tier_name, tier_prompts["draft"])

        date_str = datetime.now().strftime("%Y-%m-%d")

        prompt = f"""HISTORY NARRATIVE: {tier_name.upper()} #{compression_count} | {date_str} | {len(content)} chars

## Content
{content_preview}

---

## Specs
{tier_prompt}

---

Write narrative as markdown. Start with `# {tier_name.title()} {compression_count}`"""

        try:
            self._notify_status("Text", "working", f"Writing {tier_name} narrative...")
            narrative = writer_agent.respond(prompt)
            self._notify_status("Text", "idle", "")
            return narrative
        except Exception as e:
            logger.error("Tier narrative generation failed: %s", e)
            return None

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
        from studio.core.hub import hub
        hub.post("user", content)
        self._notify_status("BOSS", "working", "Processing user message...")
        self._notify_thinking("BOSS")
        # Simple trigger - role.md handles tool enforcement
        boss_response = self.boss.respond("New user message above. Use MCP tools: create_task, acknowledge, or recall_memory. Imperative = DELEGATE.")

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

        # Context/token limit errors (backend-agnostic patterns)
        context_patterns = [
            "context" in error_str and "limit" in error_str,
            "context" in error_str and "length" in error_str,
            "context" in error_str and "exceed" in error_str,
            "token" in error_str and "limit" in error_str,
            "token" in error_str and "exceed" in error_str,
            "max_tokens" in error_str,
            "input too long" in error_str,
            "maximum context" in error_str,
            "context window" in error_str and "exceed" in error_str,
        ]
        if any(context_patterns):
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

        # Not implemented errors (T203: explicit handling for clarity)
        if "not yet implemented" in error_str or "not implemented" in error_str:
            return "NOT_IMPLEMENTED", "skip"

        # Invalid configuration errors (don't retry - fix the config)
        if isinstance(error, ValueError) and ("invalid" in error_str or "backend" in error_str):
            return "INVALID_CONFIG", "skip"

        # Default: unknown error
        return error_type, "skip"

    def _run_raw_task(self, task, backend: str = "gemini") -> tuple[str, Optional[str], dict, dict]:
        """
        Run a Raw task (direct LLM query, no agent overhead).
        Returns (task_id, response, usage, quality_metrics) or (task_id, None, {}, {}) on error.

        Raw tasks are:
        - Stateless (no conversation history)
        - No context injection (no role, no memory, no skills)
        - Always return plain text
        - Default backend: gemini (free tier)
        """
        import time as _task_time
        task_start = _task_time.time()
        logger.info("_run_raw_task() start | task=%s | backend=%s", task.id, backend)

        try:
            # Extract prompt from task description
            prompt = task.description

            # Log minimal input (Raw has no role/skills injection)
            task_manager.log_input(task.id, role_md="", skills="", task_prompt=prompt)

            # T215: Log char counts (Raw has no context injection)
            task_manager.log_context_injected(task.id, role_md="", skills="", context_md="", task_prompt=prompt)

            # Route to backend (extensible for future LLMs)
            # Supported: gemini (free tier), claude_cli (Pro subscription), ollama (local), openai (paid)
            if backend == "gemini":
                # Status callback for rate limit retries (T196)
                def gemini_status_cb(msg):
                    logger.info("[Raw] %s", msg)
                    if self.status_callback:
                        self.status_callback("Raw", "working", msg)

                response = gemini.query(prompt, status_callback=gemini_status_cb)
            elif backend in ("claude_cli", "claude"):
                # Use Claude CLI backend - leverages Pro subscription
                cli_backend = ClaudeCLIBackend(agent_name="Raw")
                # Simple prompt, no tools, no context - just prompt → response
                response = cli_backend.chat(
                    messages=[{"role": "user", "content": prompt}],
                    system_prompt="You are a helpful assistant. Respond concisely.",
                    tools=None,
                    tool_handlers=None
                )
            elif backend == "ollama":
                # Use Ollama backend - local LLM
                ollama_backend = OllamaBackend(agent_name="Raw")
                response = ollama_backend.chat(
                    messages=[{"role": "user", "content": prompt}],
                    system_prompt="You are a helpful assistant. Respond concisely.",
                    tools=None,
                    tool_handlers=None
                )
            elif backend == "openai":
                # Future: implement openai backend
                raise ValueError(f"Backend 'openai' not yet implemented. Available: gemini, claude_cli, claude, ollama")
            else:
                valid_backends = ["gemini", "claude_cli", "claude", "ollama"]
                raise ValueError(f"Invalid backend '{backend}'. Valid options: {', '.join(valid_backends)}")

            task_elapsed = _task_time.time() - task_start
            logger.info("_run_raw_task() done | task=%s | elapsed=%.1fs", task.id, task_elapsed)

            # Return minimal usage/metrics (gemini.py doesn't track tokens)
            usage = {"total_input_tokens": 0, "total_output_tokens": 0}
            quality_metrics = {"duration_ms": int(task_elapsed * 1000)}
            return (task.id, response, usage, quality_metrics)

        except Exception as e:
            task_elapsed = _task_time.time() - task_start
            logger.error("_run_raw_task() EXCEPTION | task=%s | elapsed=%.1fs | error=%s: %s",
                         task.id, task_elapsed, type(e).__name__, str(e)[:100])
            return (task.id, None, {"error": e}, {})

    def _prepare_agent_context(self, agent: StudioAgent, task) -> tuple[str, str, dict]:
        """Build structured prompt and log context metrics.

        Returns (full_prompt, trigger, context_metrics).
        """
        # Build clean prompt - agent just needs to do the work
        # Output format first, then task (WHAT at end = highest recall)
        trigger = f"""Output format:
DONE: [one sentence summary]
- [key point 1]
- [key point 2]
[Then your actual work]

---

TASK {task.id}:
{task.description}"""

        # T226: Build structured prompt with explicit section markers
        # Order optimized for primacy/recency effects (T224):
        # files → skills (primacy) → role (middle) → context → task (recency)
        prompt_sections = []

        # ## FILES - Project file tree for orientation (T402/T432)
        active_project = project_manager.get_active()
        project_id = active_project.id if active_project else None
        file_tree = get_file_tree(project_id)
        if file_tree:
            prompt_sections.append("## FILES\n\n```\n" + file_tree + "\n```")

        # ## SKILLS - How to do work (primacy position)
        skills = agent.get_skills_content()
        if skills:
            prompt_sections.append("## SKILLS\n\n" + skills)

        # ## ROLE - Agent identity/constraints (middle = lowest recall, but needed)
        role = agent.get_role_md()
        if role:
            prompt_sections.append("## ROLE\n\n" + role)

        # ## CONTEXT - Project context + tasks (Boss compacts into task, employees get assigned tasks only)
        context = agent.get_context_md()
        if context:
            prompt_sections.append("## CONTEXT\n\n" + context)

        # ## TASK - Action to take (recency position = highest recall)
        prompt_sections.append("## TASK\n\n" + trigger)

        full_prompt = "\n\n".join(prompt_sections)

        # Capture injected context metrics (T108 - kept for backwards compat)
        context_metrics = {
            "full_prompt_length": len(full_prompt),
            "system_prompt_length": len(agent.agent.system_prompt) if hasattr(agent.agent, 'system_prompt') else 0,
            "tool_count": len(agent.agent.tools) if hasattr(agent.agent, 'tools') else 0,
            "message_count": len(agent.agent.messages) if hasattr(agent.agent, 'messages') else 0,
            "estimated_context_tokens": len(full_prompt) // 4,
        }

        return full_prompt, trigger, context_metrics

    def _log_task_error(self, task_id: str, agent_name: str, error: Exception, full_prompt: str = None):
        """Save error details to debug log (T108)."""
        try:
            from pathlib import Path
            import json
            from datetime import datetime
            debug_log_path = Path(__file__).parent.parent / "data" / "logs" / "error_prompts.json"
            debug_log_path.parent.mkdir(parents=True, exist_ok=True)

            error_entry = {
                "timestamp": datetime.now().isoformat(),
                "task_id": task_id,
                "agent": agent_name,
                "error": f"{type(error).__name__}: {str(error)}",
                "full_prompt": full_prompt,
                "prompt_length": len(full_prompt) if full_prompt else 0,
            }

            # Append to log file
            existing = []
            if debug_log_path.exists():
                try:
                    with open(debug_log_path, "r") as f:
                        existing = json.load(f)
                except (json.JSONDecodeError, IOError):
                    existing = []

            existing.append(error_entry)
            existing = existing[-50:]  # Keep last 50 error entries

            with open(debug_log_path, "w") as f:
                json.dump(existing, f, indent=2)
            logger.debug("Saved error prompt to %s", debug_log_path)
        except Exception as log_err:
            logger.error("Failed to save error prompt: %s", log_err)

    def _run_agent_task(self, agent: StudioAgent, task) -> tuple[str, Optional[str], dict, dict]:
        """
        Run a single agent task. Returns (task_id, response, usage, quality_metrics) or (task_id, None, {}, {}) on error.
        This runs in a background thread.
        """
        import time as _task_time
        task_start = _task_time.time()
        logger.info("_run_agent_task() start | task=%s | agent=%s", task.id, agent.name)
        full_prompt = None

        try:
            # Build structured prompt
            logger.debug("_run_agent_task() building context for %s", task.id)
            full_prompt, trigger, context_metrics = self._prepare_agent_context(agent, task)
            task_manager.save_prompt(task.id, full_prompt)

            # T115: Capture raw injected content for full visibility
            task_manager.log_input(
                task.id,
                role_md=agent.get_role_md(),
                skills=agent.get_skills_content(),
                task_prompt=trigger
            )

            # T215: Log char counts of injected context at dispatch (<1ms overhead)
            task_manager.log_context_injected(
                task.id,
                role_md=agent.get_role_md(),
                skills=agent.get_skills_content(),
                context_md=agent.get_context_md(),
                task_prompt=trigger
            )

            task_manager.log_context_metrics(task.id, context_metrics)
            logger.debug("_run_agent_task() calling agent.respond() for %s | prompt_len=%d | est_tokens=%d",
                         task.id, len(full_prompt), context_metrics['estimated_context_tokens'])

            # Get agent's response (blocking call in thread)
            response = agent.respond(full_prompt=full_prompt)
            usage = agent.get_last_token_usage()
            quality_metrics = agent.get_quality_metrics()

            # T430 DEBUG: Log usage immediately after retrieval
            logger.debug("_run_agent_task() usage for %s: in=%d out=%d keys=%s",
                        task.id,
                        usage.get("total_input_tokens", 0),
                        usage.get("total_output_tokens", 0),
                        list(usage.keys()))

            task_elapsed = _task_time.time() - task_start
            retries = quality_metrics.get("retries", 0)
            tool_errors = len(quality_metrics.get("tool_errors", []))
            logger.info("_run_agent_task() done | task=%s | elapsed=%.1fs | retries=%d | tool_errors=%d",
                        task.id, task_elapsed, retries, tool_errors)
            return (task.id, response, usage, quality_metrics)

        except Exception as e:
            task_elapsed = _task_time.time() - task_start
            logger.error("_run_agent_task() EXCEPTION | task=%s | elapsed=%.1fs | error=%s: %s",
                         task.id, task_elapsed, type(e).__name__, str(e)[:100])
            self._log_task_error(task.id, agent.name, e, full_prompt)
            return (task.id, None, {"error": e}, {})

    def _handle_successful_task(self, task_id: str, agent_name: str, response: str, usage: dict, quality_metrics: dict):
        """Handle successful task completion - logging, archival, and metrics."""
        task_manager.complete_task(task_id, response)
        logger.info("Completed %s", task_id)

        # Post Raw task responses to chat (they have no agent to post)
        if agent_name == "Raw":
            task = task_manager.get_task(task_id)
            hub.post(
                sender="Raw",
                content=response,
                task_id=task_id,
                task_description=task.description if task else None,
            )

        # Log token usage BEFORE archiving (T421: task must exist for log_tokens to work)
        input_tokens = usage.get("total_input_tokens", 0)
        output_tokens = usage.get("total_output_tokens", 0)
        token_log = usage.get("token_log", [])
        logger.info("_handle_successful_task %s: usage=%s, in=%d out=%d", task_id, list(usage.keys()), input_tokens, output_tokens)
        task_manager.log_tokens(task_id, input_tokens, output_tokens, token_log)
        track_tokens(
            agent=agent_name,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            task_id=task_id,
        )

        # Log quality metrics (retries, tool errors, cost, duration)
        if quality_metrics:
            task_manager.log_quality_metrics(task_id, quality_metrics)
            retries = quality_metrics.get("retries", 0)
            tool_errors = quality_metrics.get("tool_errors", [])
            if retries > 0 or tool_errors:
                logger.debug("%s quality: %d retries, %d tool errors", task_id, retries, len(tool_errors))

        # Archive old tasks AFTER logging metrics (task must exist for logging)
        task_manager.archive_old_tasks(keep_recent=10)

        # T258: Trigger AB compression cascade on memory tiers
        try:
            compressed = memory_manager.check_and_compress_all()
            if compressed > 0:
                logger.info("Memory compression: %d tier(s)", compressed)
        except Exception as mem_err:
            logger.error("Memory compression error (non-fatal): %s", mem_err)

    def _handle_failed_task(self, task_id: str, usage: dict):
        """Handle task failure with retry logic.

        Special handling for CONTEXT_TOO_LARGE (any backend):
        - Mark task as PARTIAL
        - Auto-create continuation task
        """
        error = usage.get("error")
        partial_output = usage.get("partial_output")  # If backend captured any output
        error_type, action = self._classify_error(error)
        error_msg = f"{error_type}: {str(error)[:200]}"
        logger.error("Task %s error (%s): %s", task_id, action, error_msg)

        # Handle context exceeded specially - create continuation
        if error_type == "CONTEXT_TOO_LARGE":
            continuation_id = task_manager.set_partial(task_id, partial_output)
            if continuation_id:
                logger.info("Task %s ran out of context -> continuation %s created", task_id, continuation_id)
                # Post to hub so user sees it
                from studio.core.hub import hub
                hub.post("System", f"Task {task_id} ran out of context. Continuation {continuation_id} created automatically.")
            return

        if action == "retry":
            task_manager.reset_task(task_id)
            can_retry = task_manager.increment_retry(task_id, max_retries=3)
            if can_retry:
                retry_count = task_manager.get_retry_count(task_id)
                logger.info("Task %s will retry (%d/3)", task_id, retry_count)
            else:
                task_manager.set_error(task_id, f"{error_msg} (max retries exceeded)")
        else:
            task_manager.set_error(task_id, error_msg)

    def _process_completed_futures(self) -> bool:
        """Process completed agent futures and update task states. Returns True if work was done."""
        did_work = False
        completed_agents = []

        for agent_name, future in list(self._active_tasks.items()):
            if not future.done():
                continue

            logger.debug("future DONE for %s", agent_name)
            completed_agents.append(agent_name)
            try:
                task_id, response, usage, quality_metrics = future.result(timeout=0)
                logger.debug("got result for %s | has_response=%s", task_id, response is not None)

                if response is not None:
                    self._handle_successful_task(task_id, agent_name, response, usage, quality_metrics)
                else:
                    self._handle_failed_task(task_id, usage)

                self._notify_thinking(None)
                self._notify_status(agent_name, "idle", "")
                did_work = True

            except Exception as e:
                logger.error("Future error for %s: %s", agent_name, e)
                self._notify_status(agent_name, "idle", "")

        # Remove completed agents from active tracking
        for agent_name in completed_agents:
            del self._active_tasks[agent_name]
        if completed_agents:
            logger.debug("removed completed: %s", completed_agents)

        return did_work

    def _recover_stale_tasks(self) -> bool:
        """Recover tasks that have been claimed too long. Returns True if any recovered."""
        recovered = task_manager.recover_stale_tasks()
        if recovered:
            logger.info("recovered stale tasks: %s", recovered)
            return True
        return False

    def _dispatch_raw_task(self, task) -> bool:
        """Dispatch a Raw pseudo-agent task. Returns True if dispatched."""
        # Skip if Raw is already working
        if "Raw" in self._active_tasks:
            return False

        # Validate task
        is_valid, error_msg = task_manager.validate_task(task.id)
        if not is_valid:
            logger.warning("Skipping invalid Raw task %s: %s", task.id, error_msg)
            task_manager.set_error(task.id, error_msg)
            return True  # Did work (marked as error)

        # Claim the task
        if not task_manager.start_task(task.id, claimed_by="Raw"):
            logger.debug("Task %s already claimed, skipping", task.id)
            return False

        logger.info("Started Raw task %s", task.id)
        self._notify_status("Raw", "working", f"Processing {task.id}...")
        self._notify_thinking("Raw")

        # Submit to executor - read backend from task, default to gemini
        backend = task.backend or "gemini"
        future = self._executor.submit(self._run_raw_task, task, backend)
        self._active_tasks["Raw"] = future
        return True

    def _dispatch_agent_task(self, task, agent: StudioAgent) -> bool:
        """Dispatch a task to a regular agent. Returns True if dispatched."""
        # Skip if this agent is already working
        if agent.name in self._active_tasks:
            return False

        # Validate task before dispatch
        is_valid, error_msg = task_manager.validate_task(task.id)
        if not is_valid:
            logger.warning("Skipping invalid task %s: %s", task.id, error_msg)
            task_manager.set_error(task.id, error_msg)
            return True  # Did work (marked as error)

        # Claim the task atomically
        if not task_manager.start_task(task.id, claimed_by=agent.name):
            logger.debug("Task %s already claimed, skipping", task.id)
            return False

        logger.info("Started %s for %s", task.id, agent.name)
        self._notify_status(agent.name, "working", f"Working on {task.id}...")
        self._notify_thinking(agent.name)

        # Submit to executor (non-blocking)
        future = self._executor.submit(self._run_agent_task, agent, task)
        self._active_tasks[agent.name] = future
        logger.debug("submitted %s to executor for %s", task.id, agent.name)
        return True

    def _dispatch_new_tasks(self) -> bool:
        """Dispatch ready tasks to available agents. Returns True if any dispatched."""
        did_work = False

        ready_tasks = task_manager.get_ready_tasks()
        if ready_tasks:
            logger.debug("found %d ready tasks", len(ready_tasks))

        # Process Raw tasks first (they don't consume agent slots)
        for task in ready_tasks:
            if task.assignee == "Raw":
                if self._dispatch_raw_task(task):
                    did_work = True

        # Process regular agent tasks (subject to capacity limit)
        active_count = len(self._active_tasks)
        if active_count >= self.MAX_CONCURRENT_AGENTS:
            return did_work  # At capacity for regular agents

        for task in ready_tasks:
            if active_count >= self.MAX_CONCURRENT_AGENTS:
                break

            # Skip Raw tasks (already handled above)
            if task.assignee == "Raw":
                continue

            # Regular agent dispatch
            agent = self._find_agent(task.assignee)
            if not agent or agent.is_boss:
                continue

            if self._dispatch_agent_task(task, agent):
                active_count += 1
                did_work = True

        return did_work

    # Tick logging: only log status every 60 seconds to reduce spam
    _last_tick_log = 0
    _tick_count = 0
    _sessions_cleared = False  # Track if sessions were cleared when queue emptied

    def _maybe_clear_sessions(self):
        """Clear Claude CLI sessions when task queue is empty.

        Only clears once per empty period - resets when new tasks arrive.
        This saves context/tokens on the next batch of tasks.
        """
        if not Studio._sessions_cleared:
            Studio._sessions_cleared = True
            cwd = Path(__file__).parent.parent
            clear_all_sessions(cwd)
            logger.info("Task queue empty - cleared all agent sessions")

    def _reset_session_cleared_flag(self):
        """Reset the flag when new work arrives."""
        Studio._sessions_cleared = False

    def tick(self) -> bool:
        """
        Process one cycle of work. Returns True if any work was done.

        PARALLEL EXECUTION:
        - Multiple agents can work simultaneously (up to MAX_CONCURRENT_AGENTS)
        - Each agent can only work on one task at a time
        - Dependencies are respected (dependent tasks stay READY until deps complete)
        """
        import time as _tick_time
        tick_start = _tick_time.time()
        Studio._tick_count += 1

        # Only log tick status every 60 seconds (reduces console spam)
        should_log = (tick_start - Studio._last_tick_log) >= 60
        if should_log:
            Studio._last_tick_log = tick_start
            logger.debug("tick #%d | active_agents=%s", Studio._tick_count, list(self._active_tasks.keys()))

        did_work = False

        # 1. Process completed futures
        if self._process_completed_futures():
            did_work = True

        # 2. Recover stale tasks
        if self._recover_stale_tasks():
            did_work = True

        # 3. Dispatch new tasks
        if self._dispatch_new_tasks():
            did_work = True

        # 4. Session management: clear when idle, reset flag when working
        if did_work:
            self._reset_session_cleared_flag()
        elif not self._active_tasks:
            ready_tasks = task_manager.get_ready_tasks()
            if not ready_tasks:
                self._maybe_clear_sessions()

        # Only log completion if work was done or periodic log
        if did_work or should_log:
            tick_elapsed = _tick_time.time() - tick_start
            logger.debug("tick done | elapsed=%.3fs | did_work=%s | active=%d", tick_elapsed, did_work, len(self._active_tasks))

        return did_work
