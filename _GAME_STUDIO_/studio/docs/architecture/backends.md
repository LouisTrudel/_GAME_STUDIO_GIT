# Backend Architecture

## Overview

Three Claude CLI backends, all using `--allowedTools` for MCP tool access.

## BossCLI (boss_cli.py)

- **Agent**: BOSS only
- **Model**: Haiku (fast delegation)
- **Session**: Dedicated UUID, 150K token threshold
- **Tools**: create_task, create_routine, get_task_status, recall_memory
- **Purpose**: Fast task delegation, no file operations

## FleetCLI (fleet_cli.py)

- **Agents**: Code, Frontend, Backend, Audit, Research, Design, Routine, ArtSpec, Prompt, Data, Network, Structure
- **Model**: Sonnet
- **Session**: Shared UUID, 150K token threshold (maximizes cache reuse)
- **Tools**: search_code, read_lines, edit_file, write_report + Bash
- **Special**: Research also gets WebSearch

## VanillaCLI (vanilla_cli.py)

- **Agents**: Compression, Text, Image, Audio, Video
- **Model**: Sonnet (Compression uses Haiku)
- **Session**: Stateless (no persistence)
- **Tools**: None
- **Purpose**: Pure input/output, no MCP tools needed

## Session Management

- All sessions auto-clear at 150K token threshold
- Old sessions cleared on server startup
- Terminal output archived to `data/logs/terminals/`
