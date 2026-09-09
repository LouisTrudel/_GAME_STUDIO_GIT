# Project Whitepaper: CHESS 1V1 HUMAN ONLY

---

## Vision

Chess made visible. A clean 1v1 experience that reveals the hidden battlefield—attacked squares, defended pieces, and threats unfolding up to 3 turns ahead. No AI, no clocks. Just two minds, with the board's invisible tension finally shown.

---

## Core Loop

**Primary Loop:**
1. See the battlefield—attacked squares glow, defended pieces pulse
2. Toggle threat preview (1-3 turns ahead, intensity fades with distance)
3. Select piece, read the ripples, commit to move
4. Opponent inherits your consequences

**Reward:** Spotting threats before they strike. Watching your trap unfold across turns. The "aha" when visualization reveals a blunder—yours or theirs.

---

## Platform

| Attribute | Value |
|-----------|-------|
| Platform | Web (browser) |
| Engine | Three.js |
| Input | Mouse + Keyboard |
| Session Length | 15-60 min |

---

## Art Direction

| Aspect | Direction |
|--------|-----------|
| Style | Clean minimal, slight 3D depth |
| Palette | Classic: cream/walnut board, black/white pieces |
| Reference | Chess.com simplicity meets Monument Valley elegance |
| Camera | Top-down with slight tilt, fixed |

---

## Scope

### MVP (Must Ship)
- Standard 8x8 board with all 32 pieces
- Full chess rules (movement, capture, check, checkmate, stalemate)
- Special moves: castling, en passant, pawn promotion
- Turn indicator showing whose move
- **Attacked square visualization** (color overlay on threatened squares)
- **Defended piece indicators** (visual mark on protected pieces)
- **Multi-turn threat preview** (1-3 turns ahead, visual weight fades with distance)
- Toggle controls for each visualization layer
- Game end detection (checkmate, stalemate, draw)

### Nice-to-Have
- Move history sidebar
- Undo/redo
- Board flip (view from either side)
- Sound effects (piece placement, capture)
- Online multiplayer (same device first)

### Explicitly Out of Scope
- AI opponent
- Timers/clocks
- Rankings/matchmaking
- Account system
- Chat

---

## Success Criteria

| Criteria | Measurement |
|----------|-------------|
| Playable | Two players can complete a full game to checkmate |
| Stable | No crashes or illegal moves permitted in 10 games |
| Complete | All MVP features functional, all chess rules enforced |
| Intuitive | New player understands controls within 30 seconds |

---

## Notes

Local same-device play is priority. Keep the interface minimal—the board is the star. If a feature doesn't serve the core chess experience, cut it.

