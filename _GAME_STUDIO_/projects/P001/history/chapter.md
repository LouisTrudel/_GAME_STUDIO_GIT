# Chapter 1: The Whitepaper (Sept 7, 2026 - Evening)

Project kicked off with a vision: chess for two humans, but with visual intelligence—attacked squares lit up, defended pieces highlighted, threat previews showing danger 3 moves ahead.

First task was getting the whitepaper right. T001 updated it but left "Reframed" language and meta-commentary. T002 cleaned it up—pure spec, no revision history. The Taxonomy agent then deconstructed it into a Phase-Step-Substep roadmap, creating the worktree that would guide execution.

The user wanted to test the system's output. Time to see if orchestration could ship.

---

# Chapter 2: The Build (Sept 7, 2026 - Night)

Seven phases. Thirty-two tasks. The queue started draining.

Phase 1 landed the foundation—Vite + Three.js scaffold, 8x8 board with cream/walnut squares, 32 pieces in starting positions. QA passed T007.

Phase 2 built the brain—data model, move generation, check detection. Blocking detection worked. Pinned pieces couldn't move. QA passed T011.

Phase 3 added hands—raycasting for clicks, piece selection with highlights, move execution with turn switching. QA flagged T033: potential race condition in piece animation. Logged for later.

Phase 4 handled the edge cases—castling, en passant, pawn promotion with modal UI. All special moves verified. QA passed T019.

Phase 5 closed the game—checkmate, stalemate, draw conditions (insufficient material, threefold repetition, 50-move rule), end game overlay with New Game button. QA passed T023.

Phase 6 delivered the vision—attacked squares as overlays, defended piece indicators, 3-turn threat preview with visual weights. This was the differentiator. Ten-game stability test. Zero crashes. QA passed T028.

Phase 7 was documentation. Human review captured. Pipeline documented. The project shipped.

---

# Chapter 3: The Reckoning (Sept 8, 2026)

The numbers came in.

**Studio performance:**
- 27M input tokens
- 310K output tokens
- ~2 hours wall time
- 7 phases, 32 tasks, 4 bugs fixed

**The comparison test:**
Raw Claude CLI with the same roadmap produced similar output. Cost: roughly 100x less.

The ratio told the story: 100:1 input to output. Most tokens were context injection—system prompts, roles, skills, message history—re-sent on every single agent call. Redundant. Expensive.

User feedback was direct: "bad news default claude just beat us hard."

The lesson crystallized: orchestration overhead kills efficiency on single-session scope work. The studio's value is coordination across complex, multi-day projects—not sprinting a prototype that fits in one context window.

New suggestion logged: detect task scope, bypass orchestration when appropriate, route directly to raw Claude for speed.

The CLAUDE agent was born—vanilla passthrough, no context injection, baseline for comparison.

P001 shipped. But so did the learning.
