# Minimal MCP: Persistent Memory for Claude Code

## What This Is

A lightweight memory system that gives Claude Code persistent context across sessions. Hooks handle automation; one MCP tool handles injection. Main session stays lean.

## Problem

Claude Code sessions are stateless. Context resets on `/clear`, `/compact`, or new session. Previous work, decisions, and project knowledge disappear.

## Solution

Three-layer memory with automatic compression:

| Layer | What it captures | How it compresses |
|-------|------------------|-------------------|
| Episodic | Events, actions, discoveries | tier0 → tier1 → tier2 (tagged bullets) |
| Narrative | Story of work sessions | draft → chapter → book (prose arcs) |
| Semantic | Facts, preferences, project state | Extracted from chapters |

## Architecture

```
Hooks (automatic)          MCP (on-demand)
─────────────────          ───────────────
log conversations    →     inject_memory()
compress tiers       →     returns context
extract semantics    →     ~1000 tokens
```

## Key Decisions

- **Single MCP tool** - everything else handled by hooks
- **Hybrid injection** - compressed history + recent raw tail
- **Tiered compression** - balance detail vs token cost
- **Hooks over tools** - automation without token overhead

## What It's Not

- Not a RAG system (no vector search)
- Not a task manager (Claude Code has built-in)
- Not a full agent framework (just memory)

---

*Last updated: 2026-09-24*
