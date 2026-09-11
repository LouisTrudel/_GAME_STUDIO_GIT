# Calculator Crusher

## Vision
A fast-paced arcade clicker where players race to build massive equations by hitting highlighted calculator buttons before their life drains. The ultimate goal: overflow the integer limit and literally "crush" the calculator with absurdly large numbers.

## Core Loop
1. Calculator displays with one button highlighted
2. Player clicks the highlighted button before lifebar drains
3. **Correct click** → +life, new button highlights, equation builds
4. **Wrong click** → -life, equation resets to zero
5. Press ENTER to evaluate equation → result adds to score
6. Lifebar drains faster over time (increasing pressure)
7. Build numbers until they exceed INT32_MAX (2,147,483,647)
8. **OVERFLOW = CRUSH** → Victory screen with explosive effects + final score

## Features
- **Highlighted Button System**: Only one valid button lit at a time
- **Valid Equations Only**: Parser ensures mathematical correctness (no "5++3")
- **Escalating Pressure**: Lifebar drain accelerates over time
- **Big Number Gambling**: Risk bigger equations for bigger score payoffs
- **Calculator Crush Win Condition**: Exceed INT32 limit triggers victory
- **Difficulty Modes**: Easy/Normal/Hard (drain speed, highlight duration)
- **Juice Effects**: Screen shake, particle explosions on crush, number popups

## Technical Stack
- **Engine**: Babylon.js (WebGL)
- **Language**: TypeScript
- **Math Parser**: Custom or mathjs library for equation validation
- **Audio**: Howler.js or Web Audio API
- **Deployment**: Static web hosting (itch.io, GitHub Pages)

## Dependencies
- Calculator button sprites/textures
- Sound effects (click, correct, wrong, crush explosion)
- Background music (arcade/chiptune style)
- Particle system for crush effects

## Scope

### MVP (v1)
- Single difficulty mode
- Basic calculator (0-9, +, -, *, /, =, C)
- Lifebar with constant drain
- Score display
- Crush win condition with simple effect

### v2+
- Multiple difficulty modes
- Leaderboards
- Achievement system
- Advanced operators (^, %, parentheses)
- Visual themes/skins
- Mobile touch support

## Open Questions
1. Should wrong button also drain extra life, or just reset equation?
2. How fast should the initial drain rate be? What's the acceleration curve?
3. Any bonus multipliers for speed or combo chains?
4. INT32 overflow only, or also allow INT64 for harder mode?
