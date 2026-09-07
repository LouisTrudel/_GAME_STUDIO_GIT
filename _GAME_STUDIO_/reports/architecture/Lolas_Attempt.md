docs/AGENT_SWARM_GUIDE.md
Copy path
How to Build an AI Agent Swarm with a 3D Office
A practical guide to running persistent, coordinated AI agents on a VPS — with file-based task queues, tmux orchestration, and a Three.js visualization that makes the whole thing feel alive.

What This Is
This is a system for running multiple AI agents (Claude Code CLI instances) as persistent background processes on a VPS, coordinated through a shared filesystem. Each agent has a role (programmer, designer, QA tester, trader, etc.), reads tasks from a JSON queue, and writes results back. An orchestrator dispatches work via tmux send-keys, and a Three.js frontend shows the agents as 3D characters sitting at desks in a virtual office, complete with speech bubbles showing their live thoughts.

It is not a framework or a library. It is a working production system — opinionated, somewhat messy, and battle-tested through hundreds of agent invocations. The code samples below are taken directly from the running system.

Key design choices:

tmux + send-keys instead of subprocess spawning (avoids SIGTTOU — more on this below)
File-based coordination instead of message queues (JSON files on disk, no Redis/RabbitMQ)
One orchestrator, many panes — a single Python process receives push events and dispatches work to tmux windows
Each invocation is stateless — agents don't maintain long conversations; they read context from files, do work, and exit
3D office visualization — a Vite + Three.js app shows agent status in real-time, served behind Caddy + Tailscale
Architecture Overview
+------------------+
| 3D Office UI |
| (Vite + Three) |
+--------+---------+
|
WebSocket :3459
(StudioChannel /ws/studio)
|
+--------------------+--------------------+
| Caddy (reverse proxy) |
| binds to Tailscale IP only |
+----+------+------+------+------+--------+
| | | | |
/api/_ /ws/_ static /api/ /api/
| | files stream agent-status
| | | |
+--------+--+ | +-------+--------+-------+
| Companion | | | JSON files on disk |
| (SDK) | | | office/api-data/ |
+-----------+ | +----+-------------------+
| |
WebSocket push()
CEO session (UDP :3458)
| |
+-------------------------------------------------------------------+
| StudioHub WS server (:3459) |
| Receives UDP :3458, broadcasts to all WS clients |
+-------------------------------------------------------------------+
|
+-------------------------------------------------------------------+
| tmux session: "studio-swarm" |
| |
| +----------+ +----------+ +----------+ +----------+ +----------+ |
| | Window: | | Window: | | Window: | | Window: | | Window: | |
| |programmer| |designer | |qa-tester | | writer | | trader | |
| | | | | | | | | | | |
| | claude | | claude | | claude | | claude | | daemon | |
| | -p "..." | | -p "..." | | -p "..." | | -p "..." | | process | |
| +----------+ +----------+ +----------+ +----------+ +----------+ |
+-------------------------------------------------------------------+
^ ^ ^ ^
| | | |
+-------+-------+-------+-------+
|
+----------+----------+
| Orchestrator |
| (agent_runner.py) |
| |
| - push-wakes on |
| UDP :3460 |
| - send-keys to pane |
| - monitors markers |
+----------+-----------+
|
+----------+----------+
| memory/ |
| task_queue.json |
| agents/_/state.json|
| agents/_/inbox.md |
+----------------------+
The key insight: the orchestrator runs outside tmux and uses tmux send-keys to type commands into each agent's pane. This is not a cute trick — it is the only reliable way to run claude -p in tmux without it freezing. See "The SIGTTOU Problem" below.

Prerequisites
VPS: Ubuntu 22.04+ with 4GB+ RAM (agents are CPU-light but memory-hungry when loading context)
tmux: For managing agent panes (apt install tmux)
Claude CLI: npm install -g @anthropic-ai/claude-code (requires Anthropic account + API key or Max subscription)
Bun: JavaScript runtime for the office frontend (curl -fsSL https://bun.sh/install | bash)
Python 3.10+: For orchestration scripts
Caddy: Reverse proxy (apt install caddy)
Tailscale: Zero-trust networking — the entire system is invisible to the public internet (curl -fsSL https://tailscale.com/install.sh | sh)
Optional:

The Vibe Companion: WebSocket bridge between Claude CLI and the browser (bunx the-vibe-companion), used if you want the browser-based CEO chat interface
Quick Start

1. Server Setup
   Run the automated setup script on a fresh Ubuntu server:

ssh root@your-server
git clone https://github.com/your-repo/agent-studio.git /tmp/studio
bash /tmp/studio/deploy/setup.sh
This installs all dependencies, creates a studio user, sets up Tailscale, builds the office frontend, configures Caddy, and sets up the firewall (zero public ports — Tailscale only).

2. Authenticate Claude
   ssh studio@<tailscale-ip>
   claude login
3. Create the tmux Session
   The swarm manager creates a tmux session with one window per agent:

python3 -m studio.swarm start
This starts the default team: programmer, game-designer, writer, qa-tester, publisher, and trader. Each gets a tmux window and an orchestrator thread.

4. Send Work

# Create a task for the programmer

python3 -m studio.swarm task programmer "Fix the collision detection in output/games/abc123/index.html"

# Send a direct message to any agent

python3 -m studio.swarm send writer "Review the tutorial text for game abc123"

# Broadcast to all agents

python3 -m studio.swarm broadcast "New priority: focus on mobile-friendly layouts" 5. Watch the Agents Work

# Attach to the tmux session and switch between windows

tmux attach -t studio-swarm

# Or check status from the CLI

python3 -m studio.swarm status 6. Open the 3D Office
From any device on your Tailscale network, open http://<tailscale-ip> in a browser. You will see the office with agent avatars at their desks, speech bubbles showing their current thoughts, and status rings glowing green (working) or yellow (idle).

Core Components
Agent Runner (Orchestrator)
File: studio/agent_runner.py

The orchestrator is the brain. It runs as a regular Python process (outside tmux) and manages all agents via threads. Each agent gets a thread that:

Waits for a push event (via UDP on port 3460) or falls back to polling memory/task_queue.json every 10 seconds
Checks the agent's inbox (memory/agents/<role>/inbox.md) for direct messages
Builds a prompt with the task context, inbox messages, and instructions to read the agent's SKILL.md
Writes the prompt to a temp file (/tmp/claude-prompt-<role>-<timestamp>.txt)
Sends the command to the agent's tmux pane via tmux send-keys
Polls for completion by watching for a done-marker file (/tmp/claude-done-<role>-<timestamp>)
Reads the output and marks the task as completed in the queue
The push-wake mechanism (studio/ws_listen.py) binds a UDP socket on port 3460. When any backend writer calls push("task_queue", ...) or push("swarm_status", ...), the datagram is also sent to this port. The listener sets all registered threading.Event objects, waking agent loops immediately instead of waiting for the next poll cycle.

Here is the dispatch function — the core of the whole system:

def dispatch_to_pane(role: str, prompt: str) -> str:
"""Send a claude command to the role's tmux pane. Returns a done-marker path."""
marker_id = f"{role}-{int(time.time())}"
prompt_file = f"/tmp/claude-prompt-{marker_id}.txt"
output_file = f"/tmp/claude-output-{marker_id}.txt"
done_marker = f"/tmp/claude-done-{marker_id}"

    Path(prompt_file).write_text(prompt)
    for f in [output_file, done_marker]:
        Path(f).unlink(missing_ok=True)

    model = get_model(role)
    log_path = AGENTS_DIR / role / "output.log"

    cmd = (
        f"claude -p \"$(cat {prompt_file})\" "
        f"--dangerously-skip-permissions "
        f"--tools 'Bash,Read,Write,Edit,Glob,Grep' "
        f"--model {model} "
        f"--no-session-persistence "
        f"2>>{log_path} "
        f"| tee {output_file}; "
        f"echo $? > {done_marker}"
    )

    target = f"{TMUX_SESSION}:{role}"
    subprocess.run(
        ["tmux", "send-keys", "-t", target, cmd, "Enter"],
        capture_output=True,
    )

    return done_marker

The done_marker pattern is critical. Because send-keys is fire-and-forget, we need a way to know when the command finishes. The trick: append ; echo $? > {done_marker} to the command. The orchestrator polls for that file. When it appears, the exit code is inside.

Stale task recovery: If a task has been claimed for more than 35 minutes (the 30-minute timeout + 5 minutes grace), the orchestrator treats it as stale and re-claims it. This handles cases where claude crashes mid-task.

Swarm CLI
File: studio/swarm.py

The management interface. Think of it as systemctl for agents.

python3 -m studio.swarm start [role...] Start agents (all if none specified)
python3 -m studio.swarm stop [role...] Gracefully stop agents
python3 -m studio.swarm status Show running agents and their state
python3 -m studio.swarm restart [role...] Restart crashed agents
python3 -m studio.swarm send <role> "msg" Send a message to a specific agent
python3 -m studio.swarm broadcast "msg" Send message to all agents
python3 -m studio.swarm task <role> "summary" Create a task for a specific agent
python3 -m studio.swarm logs <role> Tail an agent's output log
python3 -m studio.swarm clean Clean old messages
The status command cross-references tmux window state with the agent's state.json file. If the state says "idle" but the tmux window is dead, it reports "crashed". If the window is alive but state says "stopped", it reports "starting".

===========================================================================
AGENT SWARM STATUS
2026-02-15 14:22:30
===========================================================================

Role Status Task Last Active

---

programmer idle - 12s ago
game-designer idle - 45s ago
3d-artist idle - 2m ago
qa-tester WORKING t_a3f8c2d1 3s ago
writer idle - 1m ago
publisher stopped - 15m ago
trader WORKING - 1s ago
Graceful stop: Writing a .stop file to the agent's directory. The orchestrator checks for it on each loop iteration and exits cleanly if found.

Task Queue
File: studio/task_queue.py

A JSON file at memory/task_queue.json with a simple lifecycle:

pending --> claimed --> completed
|
+--> (stale after 35min) --> pending (recovered)
Each task has:

{
"id": "t_ab12cd34",
"created_at": 1739620000,
"source": "swarm:ceo",
"agent": "programmer",
"priority": "normal",
"status": "pending",
"summary": "Fix collision detection in game abc123",
"details": {"source": "ceo_swarm_command"},
"claimed_by": null,
"claimed_at": null,
"completed_at": null,
"result": null
}
Priority ordering: urgent > high > normal > low, then by creation time.

Completed tasks are pruned after 48 hours by python3 -m studio.swarm clean.

There is no locking beyond atomic file writes. When a task is created, push("task_queue", ...) instantly wakes the orchestrator's agent loops via UDP, so tasks are picked up in under 1 second instead of waiting for the next poll cycle. The stale-task recovery mechanism catches any edge cases.

Skill System
Directory: .claude/skills/<role>/SKILL.md

Each agent has a Markdown file that defines their expertise, tools, and operating procedures. When the orchestrator builds a prompt, it tells the agent to read their SKILL.md:

You are the programmer agent for Agent Game Studio.
Read your skill file at .claude/skills/programmer/SKILL.md for your full instructions.
Be concise and efficient. Complete the task and finish.
The agent reads the file on every invocation. This is intentional — there are no long-running conversations. Each task is a fresh claude -p call with a self-contained prompt. Memory lives in files, not in conversation context.

Agent Stream (Live Thoughts)
File: studio/agent_stream.py

Any agent can post "thoughts" visible in the 3D office:

from studio.agent_stream import post
post("trader", "Scanning 200 markets for opportunities...", status="thinking")
post("trader", "Found: Government Shutdown YES at $0.14", status="found")
post("trader", "Criteria too ambiguous -- PASSING", status="passed")
The stream is a rolling JSON log at office/api-data/studio-agent-stream.json (max 80 entries, 5-minute TTL per entry). The file uses fcntl.flock for thread/process safety — multiple agents can post simultaneously without corruption.

After writing to disk, agent_stream.py calls push("stream", ...) to instantly broadcast the new thought to all connected browser clients via WebSocket. The office frontend renders the latest thought as a speech bubble above the agent's 3D character. Polling is retained as a fallback when the WebSocket connection is down.

Entries are deduplicated per-role — if an agent posts the same message twice in a row, the second is silently dropped. This prevents rapid-fire loops from flooding the UI.

There is also a context manager for wrapping multi-step tasks:

from studio.agent_stream import thinking

with thinking("trader", "Market Scan"):
post("trader", "Checking tail-end opportunities...")
post("trader", "No safe trades found")

# Automatically posts "Done: Market Scan" on exit

Shared Brain (CONTEXT.md)
Agents do not talk to each other directly. They coordinate through shared files — a pattern that works because file reads are cheap and file writes are atomic enough for this use case.

Per-project: Each game project gets a CONTEXT.md file that all agents read and update:

## Cross-Agent Signals

- [DESIGNER -> PROGRAMMER] Use 5 difficulty levels, exponential ramp
- [PROGRAMMER -> WRITER] Text keys: title, subtitle, tutorial_1, game_over
- [WRITER -> PROGRAMMER] text_assets.json ready -- 12 keys, uses {score} variable
- [QA -> PROGRAMMER] Bug at line 142: collision check uses wrong axis
  Studio-wide: memory/shared_feedback.yaml stores CEO decisions that teach all agents. When the CEO ships or shelves a game, the reasoning is recorded and every agent reads it before starting their next task.

Daily notes: memory/daily_notes/YYYY-MM-DD.yaml captures raw activity logs.

This tiered memory system (raw logs -> curated learnings -> per-project context -> shared feedback) means agents learn from the past without needing persistent conversations. Every invocation starts fresh, reads what it needs, does work, and writes results.

3D Office Visualization
Directory: office/

A Vite + Three.js application that renders a nighttime office scene with:

Desks arranged in a U-shape around the CEO, each with role-specific props (drawing tablet for the artist, red pen for QA, stack of papers for the writer)
Rigged GLB character models with shared idle/working animations and per-character retargeting
Status indicators: green ring = working, yellow ring = idle, red ring = exited, particles floating = active thinking
Speech bubbles showing the latest thought from the agent stream
Monitor glow that flickers when agents are working
The desk layout is defined as a simple object:

export const DESK_LAYOUT = {
ceo: { x: 0, z: 0, rot: 0, color: 0x8b5cf6 },
"game-designer": { x: -4, z: -2.5, rot: Math.PI / 4, color: 0x3b82f6 },
programmer: { x: -4, z: 2.5, rot: -Math.PI / 4, color: 0x22c55e },
"3d-artist": { x: 4, z: -2.5, rot: -Math.PI / 4, color: 0xf59e0b },
"qa-tester": { x: 4, z: 2.5, rot: Math.PI / 4, color: 0xef4444 },
writer: { x: -2.5, z: 5, rot: -Math.PI / 6, color: 0x06b6d4 },
publisher: { x: 2.5, z: 5, rot: Math.PI / 6, color: 0xec4899 },
trader: { x: 0, z: 6.5, rot: 0, color: 0xeab308 },
};
Character models are loaded via GLTFLoader and use a shared animation retargeting system. The shared idle animations (recorded from one model) have different bone rest positions than the target characters. Without retargeting, models float 1+ meters above the floor:

\_retargetClip(clip, targetBoneY) {
const sourceBoneY = this.sharedSourceBoneY;
const cloned = clip.clone();

    for (const track of cloned.tracks) {
        if (!track.name.endsWith(".position")) continue;
        const boneName = track.name.replace(".position", "");
        const deltaY = targetBoneY[boneName] - sourceBoneY[boneName];
        // Shift all Y keyframes by the delta
        for (let j = 1; j < track.values.length; j += 3) {
            track.values[j] += deltaY;
        }
    }
    return cloned;

}
To build and serve:

cd office && bun install && bun run build
Caddy serves the office/dist directory on the Tailscale interface. No public exposure.

Real-Time Data Push
The frontend connects to the StudioHub WebSocket server via StudioChannel at /ws/studio (port 3459). On connect, the server sends a studio:snapshot message containing the current state of all api-data files. After that, updates are pushed in real-time as they happen.

Architecture:

StudioHub (studio/ws_server.py, systemd: studio-ws-server.service) — asyncio WebSocket server on port 3459. Receives UDP datagrams on port 3458, broadcasts to all connected WS clients. Sends studio:snapshot on connect.
ws_push.py — backend writers call push(event_type, data) after disk writes. Sends UDP to both port 3458 (browser WS server) and port 3460 (orchestrator listener).
ws_listen.py — orchestrator UDP listener on port 3460. Wakes agent loop threads instantly when task_queue or swarm_status events arrive.
Frontend StudioChannel — connects to /ws/studio, receives pushed events, falls back to polling when WS disconnects.
Event types (12 total):

Event Type Source Purpose
swarm_status agent_status_api.py Agent working/idle/crashed state
task_queue task_status_api.py Task queue summary
stream agent_stream.py Agent thoughts (speech bubbles)
event_log event_log.py Structured event log
activity heartbeat.py Agent activity / heartbeats
cron cron_api.py Cron schedule status
dashboard dashboard_api.py Studio stats, roster, git info
metrics office/scripts/bake-metrics.py Performance metrics
bookmark_intel office/scripts/bake-bookmark-intel.py Bookmark intel data
content office/scripts/bake-content.py Content pipeline data
pulse office/scripts/bake-pulse.py Pulse / health summary
scene_picker scene_picker.py Scene picker (on-demand)
Bake scripts still write JSON to office/api-data/ and then call push() to notify browsers. Caddy serves the static JSON files as a fallback for clients without WebSocket support. Polling timers remain in the frontend as automatic reconnection fallback.

Adding Custom Agents
To add a new agent role (e.g., sound-designer):

1. Create the Skill File
   mkdir -p .claude/skills/sound-designer
   Write .claude/skills/sound-designer/SKILL.md:

# Sound Designer

You are the Sound Designer for Agent Game Studio.

## Your Job

Create sound effects and procedural background music for games using the Web Audio API.

## Guidelines

- Generate SFX as AudioBuffer data (no external files)
- Use oscillators, noise, and envelopes for procedural sounds
- Match the tone described in the game's CONTEXT.md

2. Register the Role
   Add to ALL_ROLES in studio/swarm.py:

ALL_ROLES = [
"programmer",
"game-designer",
# ... existing roles ...
"sound-designer", # <-- add here
]
If you want it in the default startup set, add to DEFAULT_ROLES too.

3. Add a Desk Position
   In office/src/scene.js, add to DESK_LAYOUT:

"sound-designer": { x: -6, z: 5.5, rot: -Math.PI / 3, color: 0x10b981 }, 4. (Optional) Add a 3D Character
Place a rigged GLB model in office/public/characters/ and add it to CHARACTER_FILES in office/src/agents.js:

"sound-designer": "sound_designer_rigged.glb",
Without this, the agent gets a procedural capsule placeholder. Add fallback traits in FALLBACK_TRAITS:

"sound-designer": { color: 0x10b981, height: 0.96 }, 5. Rebuild the Office
cd office && bun run build 6. Start the Agent
python3 -m studio.swarm start sound-designer
Trading Daemon: A Persistent Non-Orchestrator Agent
The trader is special. Unlike other agents (which run claude -p invocations dispatched by the orchestrator), the trader runs as a persistent Python daemon in its own tmux window. It has its own event loop, manages its own state, and only uses the agent stream to post thoughts to the office.

From studio/swarm.py:

if role == "trader": # Create window and launch the daemon as foreground process
subprocess.run(
["tmux", "new-window", "-t", TMUX_SESSION, "-n", role],
capture_output=True,
)
log_path = AGENTS_DIR / role / "output.log"
daemon_cmd = f"python3 -m studio.trader_daemon --live 2>&1 | tee -a {log_path}"
subprocess.run(
["tmux", "send-keys", "-t", f"{TMUX_SESSION}:{role}", daemon_cmd, "C-m"],
capture_output=True,
)
The daemon runs a two-speed loop: fast inner loop (10s) for position monitoring and exits, slow outer loop (60s) for scanning new opportunities. It posts thoughts via the same agent_stream.post() function:

from studio.agent_stream import post as \_stream_post

def stream(msg: str, status: str = "thinking"):
"""Post a thought to the office visualization."""
\_stream_post("trader", msg, status=status)
This pattern works for any persistent process — a monitoring daemon, a webhook receiver, a background scraper. The agent does not need to be an LLM invocation. It just needs to write to the shared filesystem and optionally post to the agent stream.

The SIGTTOU Problem
This is the single most important technical detail in the system, and the reason the orchestrator exists at all.

The problem: claude -p freezes when run as a subprocess inside a tmux pane.

When you run a Python script in a tmux pane, and that script calls subprocess.run(["claude", "-p", ...]), the claude process receives SIGTTOU (Signal: Terminal Output) and stops. This happens because claude tries to write to the terminal, but it is a background process relative to the pane's foreground process group.

Setting stty -tostop does not fully fix it. Running with setsid creates process group issues. Using os.setpgrp() breaks signal handling.

The solution: Do not run claude as a subprocess. Run it as the foreground process of the pane.

The orchestrator runs outside tmux entirely. It uses tmux send-keys to type the claude command directly into the pane's shell. From the pane's perspective, claude is the foreground process — it owns the terminal, can write freely, and never gets SIGTTOU.

# This works (claude is the foreground process of the pane):

subprocess.run(
["tmux", "send-keys", "-t", "studio-swarm:programmer", cmd, "Enter"],
capture_output=True,
)

# This does NOT work (claude gets SIGTTOU as a subprocess):

subprocess.run(["claude", "-p", prompt], capture_output=True)
The tradeoff: the orchestrator cannot capture stdout directly. Instead, it uses | tee {output_file} to write output to a file, and ; echo $? > {done_marker} to signal completion. This is clunky but reliable.

Production Tips
Systemd Service
The tmux session is managed by systemd so it survives reboots:

[Unit]
Description=Agent Game Studio -- Swarm (tmux agent pool)
After=network.target

[Service]
Type=forking
User=studio
ExecStart=/usr/bin/tmux new-session -d -s studio-swarm -x 200 -y 50
ExecStop=/usr/bin/tmux kill-session -t studio-swarm
Restart=no
RemainAfterExit=no
Environment=HOME=/home/studio
Environment=PATH=/home/studio/.bun/bin:/home/studio/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
After the tmux session is up, python3 -m studio.swarm start creates windows and launches the orchestrator.

Log Management
Each agent writes to memory/agents/<role>/output.log. These grow fast. Use logrotate or a cron job:

# Cron: truncate logs over 10MB every night

0 3 \* \* \* find /home/studio/app/memory/agents -name "output.log" -size +10M -exec truncate -s 0 {} \;
Rate Limiting
The swarm tracks CLI invocations in memory/swarm_health.json. When invocations exceed 300/day, a rate limit multiplier kicks in:

Invocations Multiplier Effect
0-300 1.0x Normal polling
300-500 1.5x 50% slower polling
500-700 2.0x Double sleep intervals
700+ 3.0x Triple sleep intervals
This prevents hitting Claude API rate limits when multiple agents are active.

Git as Memory
Git is the real safety net. The system commits and pushes after every significant change. If a session crashes (and they always do eventually), the next session reads git log and picks up where the commits left off.

# Session startup protocol:

git log --oneline -5 # See what happened
cat LAST_SESSION.md # Read handoff note
python3 -m studio.preflight # Get current state
LAST_SESSION.md is a lightweight handoff note, but the real history is in git. Sessions always die without clean shutdown, so the protocol does not depend on one.

Security Model
The entire system is invisible to the public internet. Tailscale provides zero-trust networking:

Zero public ports — the firewall (ufw) denies all incoming traffic except on the Tailscale interface
Caddy binds to Tailscale IP only — even if the firewall fails, Caddy is not listening on public interfaces
Basic auth as defense-in-depth — API endpoints require credentials, even though network access already requires Tailscale membership
WebSocket exception — the browser WebSocket API cannot set Authorization headers, so /ws/\* relies on Tailscale network-level auth only
Common Pitfalls
Stale **pycache**
Python caches bytecode in **pycache** directories. If you edit a module and the cache is stale, agents may run old code. Fix:

find /home/studio/app -name **pycache** -exec rm -rf {} + 2>/dev/null
Multiple Orchestrators
If you restart the swarm without killing the old orchestrator, you get two orchestrators dispatching tasks to the same panes. Tasks get double-claimed, agents receive overlapping prompts, and everything breaks.

Before restarting:

# Kill existing orchestrators

pkill -f "agent_runner.py --orchestrate"

# Then restart

python3 -m studio.swarm restart
Done Marker Files
The orchestrator creates temp files in /tmp/ for prompts, outputs, and done markers. If these accumulate (e.g., after crashes), they can cause confusion. Clean periodically:

rm -f /tmp/claude-prompt-_ /tmp/claude-output-_ /tmp/claude-done-_ /tmp/swarm-prompt-_
Ghost Processes
claude -p spawns child processes. If the orchestrator sends Ctrl-C to a pane (on timeout), the parent may die but children survive. Check for orphans:

ps aux | grep claude | grep -v grep
Kill any orphans before restarting the swarm.

Agent State Desync
The agent's state.json says "working" but the tmux pane is idle (the process finished but the state was not updated). The swarm status command detects this by cross-referencing with tmux list-panes, but it is imperfect.

If in doubt:

# Hard reset an agent's state

echo '{"status": "idle", "current_task": null}' > memory/agents/programmer/state.json
Caddy PrivateTmp Isolation
Caddy's systemd service runs with PrivateTmp=true by default. This means Caddy cannot see files in /tmp/. All JSON files served by Caddy must live in a real directory (e.g., office/api-data/), not in /tmp/.

This bit us when the agent stream was originally writing to /tmp/studio-agent-stream.json — Caddy returned 404 for /api/stream even though the file existed. Moving to office/api-data/ fixed it.

File Structure Reference
your-studio/
CLAUDE.md # CEO playbook (main system prompt)
LAST_SESSION.md # Cross-session handoff note
.claude/skills/ # Agent skill files
programmer/SKILL.md
game-designer/SKILL.md
qa-tester/SKILL.md
writer/SKILL.md
publisher/SKILL.md
trader/SKILL.md
3d-artist/SKILL.md
researcher/SKILL.md
integration-auditor/SKILL.md
studio/ # Python orchestration
swarm.py # Swarm CLI (start/stop/status)
agent_runner.py # Orchestrator (task dispatch via send-keys)
agent_loop.sh # Per-agent loop (alternative to agent_runner.py)
agent_stream.py # Live thought stream for 3D office
task_queue.py # JSON task queue CRUD
ws_server.py # StudioHub WS server (port 3459, systemd)
ws_push.py # push(event, data) — UDP broadcast to WS + orchestrator
ws_listen.py # Orchestrator UDP listener (port 3460, instant task wakeup)
trader_daemon.py # Persistent trading daemon
memory.py # Shared brain helpers
pipeline.py # Production cycle helpers
office/ # 3D visualization
src/
main.js # App entry point
scene.js # Office geometry + lighting
agents.js # Character loading + animation
connection.js # WebSocket bridge to Companion + StudioChannel (push)
ui.js # Chat panel, task list, HUD
public/characters/ # Rigged GLB models
api-data/ # JSON files served by Caddy
vite.config.js
package.json
deploy/ # Deployment configs
setup.sh # One-command VPS setup
Caddyfile # Reverse proxy config
studio-swarm.service # tmux session systemd unit
studio-companion.service # Companion server systemd unit
studio-ws-server.service # StudioHub WebSocket server (port 3459)
update-vps.sh # Pull + rebuild script
memory/ # Persistent state
task_queue.json # Active task queue
swarm_health.json # Rate limiting + invocation counts
employee_roster.yaml # Agent levels + performance history
studio_learnings.yaml # Curated lessons from past work
shared_feedback.yaml # CEO decisions that teach all agents
agents/ # Per-agent state
programmer/
state.json # Current status, task, timestamps
inbox.md # Direct messages from CEO/agents
journal.md # Work log
output.log # Raw CLI output
game-designer/
qa-tester/
...
output/
games/{project-id}/ # Game project files
CONTEXT.md # Shared brain (all agents read/update)
design.md # GDD from designer
index.html # Game from programmer
text_assets.json # Text from writer
qa_report.json # QA results
Design Philosophy
Models are expensive thinkers. Scripts are free doers. If a task can be expressed as deterministic logic, it belongs in a script. Agents should only engage when there is ambiguity — creative decisions, judgment calls, edge cases.

What scripts handle (zero agent cost):

- Static validation: python3 scripts/validate_html5.py
- Code linting: python3 scripts/lint_game.py
- Packaging: python3 scripts/package_game.py
- Metrics: python3 -m studio.research

What agents handle (judgment calls):

- Game design creativity
- Code architecture decisions
- Fun evaluation and polish assessment
- Ship/shelve decisions
  This is not a theoretical principle. At approximately $0.03-0.10 per agent invocation (depending on model and context size), running a validation script instead of asking an agent saves real money across hundreds of invocations.

N agents = N connections to one shared context, not N-squared agent-to-agent links. Agents do not "talk" to each other through a messaging system. They read from the same files. This is the shared-brain pattern, and it works because file reads are cheap and coordination through a central document is easier to debug than a web of peer-to-peer messages.

Each invocation is stateless. No long-running conversations that fill context windows. The agent reads its SKILL.md, reads the task, does the work, writes results, and exits. If it needs to know what happened before, it reads the journal or CONTEXT.md. This keeps context usage low and costs predictable.

What This Is Not
This is not a general-purpose agent framework. It does not have:

A plugin system
A REST API for external integration
Multi-tenancy
Automatic scaling
A web-based configuration UI
Tests (the agents are the tests)
It is a specific solution to a specific problem: running a team of AI agents that collaborate on creative projects, with a visualization layer that makes the process legible. It works well for that. Adapting it to a different domain (e.g., software development, data analysis, content generation) is straightforward — replace the SKILL.md files, adjust the task queue categories, and update the office layout.

The code is production-grade in the sense that it runs 24/7 on a VPS and recovers from crashes gracefully. It is not production-grade in the sense that it has no tests, minimal error handling in places, and relies on "works on my machine" as a deployment strategy. This is fine for a single-operator system. If you want to run this for a team, you will need to add auth, logging, and probably a real database instead of JSON files.

License
This guide describes the architecture of Agent Game Studio. Use the patterns freely. If you build something cool with it, let us know.
