# Project Conventions

## Tech Stack

- **Engine:** Three.js (JavaScript)
- **Language:** JavaScript ES6+
- **Build:** Vite or vanilla
- **Assets:** GLB/GLTF for 3D, PNG for 2D

## Code Style

```javascript
// Classes: PascalCase
class PlayerController {}

// Functions/methods: camelCase
function calculateDamage() {}

// Constants: UPPER_SNAKE_CASE
const MAX_HEALTH = 100;

// Files: kebab-case
// player-controller.js
```

## File Structure

```
src/
├── core/           # Engine, managers
├── entities/       # Game objects
├── systems/        # Game systems
├── ui/             # Interface
├── utils/          # Helpers
└── assets/         # Resources
```

## Communication

- Hub messages for cross-team updates
- @mention when work is ready for handoff
- Tag task IDs in deliverables

## Deliverable Standards

| Agent | Must Include |
|-------|--------------|
| Designer | Numbers, not vague descriptions |
| Programmer | Working code, usage example |
| Artist | Hex colors, dimensions |
| Writer | Formatted text, no placeholders |
| QA | Reproduction steps |

## Version Control

- Feature branches from main
- Descriptive commit messages
- No direct commits to main
