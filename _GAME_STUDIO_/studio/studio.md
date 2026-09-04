# THE STUDIO

## Purpose

An abstract self-improving agent fleet that delegates tasks, accumulates data, and refines its skill library. Optimizes AI output per token through dynamic context injection and monitoring.

## Core Concepts

| Concept | Definition |
|---------|------------|
| Agent | A folder containing role.md, config.json, skills, and tools specific to one AI worker |
| BOSS | The orchestrator agent that receives user input, decomposes tasks, and delegates to agents |
| Skill | An injectable md file containing task-specific knowledge |
| Asset | Reusable artifact (code, templates, media, lore) stored for injection |
| Hub | Central message channel where all agents post and read messages |
| Heartbeat | Periodic execution system for both local Python and AI agent tasks |
| Task | A unit of work with assignee, dependencies, status, and result |

## Architecture

```
studio/
├── studio.md          # This file - core context
├── studio.py          # Main orchestration
├── docs/              # Detailed specifications
│   ├── concepts/      # Deep dives on core concepts
│   ├── pipelines/     # Workflow specifications
│   └── architecture/  # System design docs
├── agents/            # Agent definitions (role.md, config.json, skills/)
├── skills/            # Shared skill library
│   ├── _routers/      # Always-loaded routing skills per agent type
│   ├── code/          # Programmer skills
│   ├── design/        # Designer skills
│   ├── art/           # Artist skills
│   ├── writing/       # Writer skills
│   ├── qa/            # QA skills
│   └── templates/     # Copy-paste code snippets
├── assets/            # Reusable artifacts
├── core/              # Hub, TaskManager, Heartbeats
└── data/              # Accumulated logs and metrics
```

## Principles

1. Minimal context injection - only what's needed per task
2. Everything timestamped and logged
3. Human approval for destructive operations
4. Skills are data, not code
5. Agents are stateless; state lives in /data

## Documentation Index

- Concepts: `docs/concepts/`
- Pipelines: `docs/pipelines/`
- Architecture: `docs/architecture/`
- Principles: `docs/principles.md`

## Current Agents

| Agent | Role |
|-------|------|
| BOSS | Orchestrator - receives user prompts, creates tasks, reviews work |
| Designer | Game design, mechanics, systems |
| Programmer | Code implementation |
| Artist | Visual design, UI |
| Writer | Narrative, dialogue, documentation |
| QA | Testing, review, quality assurance |
