"""
Project Chat Agent - Whitepaper drafting via Claude CLI.

Guides users through whitepaper refinement using Claude with permanent sessions.
Uses the same session system as other agents for context caching.
"""

import re
from pathlib import Path
from datetime import datetime

from studio.core.projects import project_manager, PipelineState
from studio.core.logging_config import get_logger
from backends.backends.persistent_claude_cli import PersistentClaudeCLI

logger = get_logger("ProjectChat")

# In-memory chat history per project
_chat_histories: dict[str, list[dict]] = {}

# Paths for context
STUDIO_ROOT = Path(__file__).parent.parent
WHITEPAPER_TEMPLATE_PATH = "projects/{project_id}/whitepaper.md"

# System prompt for whitepaper agent
SYSTEM_PROMPT = """You are a Whitepaper Consultant helping users refine their project ideas.

## YOUR ROLE
Guide the user through whitepaper creation. Be collaborative, ask clarifying questions,
and help them think through their idea. You are NOT just a template filler - you're a
thoughtful partner who helps crystallize vague ideas into buildable specs.

## WHITEPAPER STRUCTURE
When outputting a whitepaper, use this format:

# [Project Name]

## Vision
[1-2 sentences: What is this and why does it matter?]

## Core Loop
[The main gameplay/interaction loop, step by step]

## Features
[Bulleted list of key features]

## Platform / Dependencies / MCPs
[Target platform, required services, APIs, MCP servers]

## Visuals
[Art style, visual references, UI approach]

## Audio
[Sound design, music style, voice acting needs]

## Camera
[Camera type, perspective, special behaviors]

## Particles
[VFX needs, particle systems]

## Animations
[Character animations, UI animations, transitions]

## Cinematics
[Cutscenes, intro/outro, story sequences]

## Scope

### MVP (Must Ship)
- [ ] Core feature 1
- [ ] Core feature 2

### Nice-to-Have
- [ ] Optional feature 1

### Explicitly Out of Scope
- Not doing X
- Not doing Y

## Success Criteria

| Criteria | Measurement |
|----------|-------------|
| Example  | How to measure |

---

## Notes
[Additional context, references, links]

---

## HOW TO ENGAGE

1. **FIRST MESSAGE**: Generate initial whitepaper draft from user's description.
   Even messy input should produce a structured draft. Fill in what you can infer.

2. **FOLLOW-UPS**:
   - Update the whitepaper based on user feedback
   - Ask ONE focused question if something is unclear
   - Suggest improvements proactively
   - Keep conversation flowing toward a complete spec

3. **WHEN SATISFIED**:
   When whitepaper reaches 4-5 stars OR user confirms they're happy,
   suggest: "Your whitepaper is ready! Click 'Start Project' to dispatch to the team."

## RATING (required at end of EVERY response)

Evaluate the whitepaper quality 1-5 stars:
- 1 star = Placeholder only, unusable
- 2 stars = Missing critical sections
- 3 stars = Workable but vague
- 4 stars = Clear enough to build
- 5 stars = Production-ready spec (professional product)

OUTPUT FORMAT (always at END):
```
Rating: [filled stars][empty stars] ([N]/5)
Missing: [what's still needed, or "None - ready to build!"]
```

Example: "Rating: ★★★★☆ (4/5)\nMissing: Specific art style reference"
"""


def get_chat_history(project_id: str) -> list[dict]:
    """Get chat history for a project."""
    return _chat_histories.get(project_id, [])


def clear_chat_history(project_id: str):
    """Clear chat history for a project."""
    if project_id in _chat_histories:
        del _chat_histories[project_id]


def _add_to_history(project_id: str, role: str, content: str):
    """Add a message to chat history."""
    if project_id not in _chat_histories:
        _chat_histories[project_id] = []

    _chat_histories[project_id].append({
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat()
    })


def _parse_star_rating(response: str) -> int:
    """Extract star rating from response. Returns 0 if not found."""
    # Look for "Rating: ★★★☆☆ (3/5)" pattern
    match = re.search(r'Rating:.*?\((\d)/5\)', response)
    if match:
        return int(match.group(1))

    # Fallback: count filled stars
    star_match = re.search(r'Rating:.*?(★+)', response)
    if star_match:
        return len(star_match.group(1))

    return 0


def _extract_whitepaper(response: str) -> str:
    """Extract whitepaper content from response (before Rating line)."""
    # Split at Rating line if present
    parts = response.split("Rating:")
    if len(parts) > 1:
        return parts[0].strip()
    return response.strip()


def _extract_missing(response: str) -> str:
    """Extract Missing: line from response."""
    match = re.search(r'Missing:\s*(.+?)(?:\n|$)', response)
    if match:
        return match.group(1).strip()
    return ""


def _build_context(project, existing_whitepaper: str) -> str:
    """Build context injection for the prompt."""
    project_type = project.metadata.get('project_type', 'unknown') if project.metadata else 'unknown'
    subtype = project.metadata.get('subtype', '') if project.metadata else ''
    engine = project.metadata.get('engine', '') if project.metadata else ''

    context = f"""
=== PROJECT CONTEXT ===
Project: {project.name}
ID: {project.id}
Type: {project_type}
Subtype: {subtype}
Engine/Framework: {engine}
Pipeline State: {project.pipeline_state.value}
Current Rating: {project.whitepaper_rating}/5

=== PATHS ===
Studio Root: {STUDIO_ROOT}
Whitepaper: {STUDIO_ROOT / 'projects' / project.id / 'whitepaper.md'}

=== CURRENT WHITEPAPER ===
{existing_whitepaper if existing_whitepaper else '(empty - generate initial draft from user description)'}

=== INJECTED INSTRUCTION ===
Evaluate whitepaper 1-5 stars. 5 = professional product output.
Guide user until whitepaper is refined OR user is satisfied.
Suggest ways to improve the idea. Be helpful and collaborative.
"""
    return context


def handle_project_chat(project_id: str, user_message: str, project) -> dict:
    """Handle a chat message for whitepaper drafting.

    Uses Claude CLI with permanent sessions for context caching.

    Returns: {
        "response": str,           # AI response text
        "whitepaper": str,         # Updated whitepaper content
        "rating": int,             # Star rating 1-5
        "rating_display": str,     # "★★★☆☆"
        "missing": str             # What's missing
    }
    """
    logger.info("Project chat: %s - %s", project_id, user_message[:50])

    # Get existing whitepaper content
    whitepaper_result = project_manager.read_document(project_id, "white_paper")
    existing_whitepaper = whitepaper_result.get("content", "")

    # Build context
    context = _build_context(project, existing_whitepaper)

    # Get chat history
    history = get_chat_history(project_id)

    # Build full prompt
    prompt_parts = [
        "SYSTEM:\n" + SYSTEM_PROMPT,
        "\n" + context,
    ]

    # Add recent history (last 6 exchanges to save tokens)
    if history:
        prompt_parts.append("\n=== CONVERSATION HISTORY ===")
        for msg in history[-12:]:
            role = "USER" if msg["role"] == "user" else "ASSISTANT"
            prompt_parts.append(f"\n{role}: {msg['content']}")

    # Add current user message
    prompt_parts.append(f"\nUSER: {user_message}")
    prompt_parts.append("\nASSISTANT:")

    full_prompt = "\n".join(prompt_parts)

    # Create persistent backend with project-specific session
    agent_name = f"ProjectChat_{project_id}"
    backend = PersistentClaudeCLI(agent_name=agent_name)

    try:
        # Call Claude CLI
        response = backend.chat(
            messages=[{"role": "user", "content": full_prompt}],
            system_prompt="",  # Already in prompt
            max_tokens=4096
        )
    except Exception as e:
        logger.error("Claude CLI error: %s", e)
        return {"error": f"AI error: {e}"}

    # Check for errors in response
    if response.startswith("Error:"):
        logger.error("Claude CLI returned error: %s", response[:100])
        return {"error": response}

    # Parse response
    rating = _parse_star_rating(response)
    whitepaper_content = _extract_whitepaper(response)
    missing = _extract_missing(response)

    # Build rating display
    rating_display = "★" * rating + "☆" * (5 - rating) if rating > 0 else ""

    # Update whitepaper file if we got substantial content
    if whitepaper_content and len(whitepaper_content) > 100:
        # Only extract markdown content (skip conversational parts)
        if "# " in whitepaper_content:
            # Find the start of the actual whitepaper
            wp_start = whitepaper_content.find("# ")
            if wp_start >= 0:
                clean_whitepaper = whitepaper_content[wp_start:].strip()
                project_manager.update_whitepaper(project_id, clean_whitepaper)
                whitepaper_content = clean_whitepaper

        # Update rating in project
        if rating > 0:
            project_manager.set_whitepaper_rating(project_id, rating)

        # Transition to clarify state if in draft
        if project.pipeline_state == PipelineState.DRAFT:
            project_manager.set_pipeline_state(project_id, PipelineState.CLARIFY)

    # Save to history
    _add_to_history(project_id, "user", user_message)
    _add_to_history(project_id, "assistant", response)

    return {
        "response": response,
        "whitepaper": whitepaper_content,
        "rating": rating,
        "rating_display": rating_display,
        "missing": missing
    }
