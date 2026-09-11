# Calculator Krusher

## Vision
A high-speed arcade game where players race to click highlighted calculator buttons before their lifebar drains. Build massive equations, hit ENTER to score, and push numbers past INT32 limits to "crush" the calculator in a spectacular victory.

## Core Loop
1. Calculator displays on screen with one button highlighted
2. Player clicks the highlighted button as fast as possible
3. Correct click → +life, button adds to equation, next button highlights
4. Wrong click → -life, equation resets to empty
5. Lifebar drains continuously (faster over time)
6. Press ENTER → evaluate equation, result adds to score
7. Continue building bigger equations for higher scores
8. If number exceeds INT32 (2,147,483,647) or goes below INT32_MIN → CALCULATOR CRUSHED = WIN

## Features
- Real-time highlighted button targeting
- Valid equation building (only mathematically correct expressions)
- Lifebar that drains faster as time progresses
- Score accumulation via equation results
- INT32 overflow detection for victory condition
- Multiple difficulty modes
- "Calculator Crushed" victory screen with special effects
- Big number display with visual flair

## Platform / Dependencies / MCPs
- **Engine**: Babylon.js (WebGL)
- **Platform**: Web browser (desktop primary, mobile stretch)
- **Dependencies**: None beyond Babylon.js
- **MCPs**: None required

## Visuals
- Calculator UI as main play area (3D or 2.5D aesthetic)
- Highlighted buttons with clear visual pulse/glow
- Lifebar prominent at top or side
- Number display showing current equation
- Score counter
- Screen shake and effects on overflow victory
- Difficulty mode selection screen

## Audio
- Button click sounds (satisfying, tactile)
- Wrong button buzzer/error sound
- Lifebar warning sounds when low
- Escalating music as lifebar drains faster
- MASSIVE victory sound/music on calculator crush
- Equation evaluation "cha-ching" sound

## Camera
- Fixed front-facing view of calculator
- Possible subtle camera shake on wrong answers
- Dramatic zoom/shake on overflow victory

## Particles
- Sparks on correct button press
- Error flash on wrong button
- Lifebar pulse effects when critical
- EXPLOSION of particles on calculator crush (numbers flying, calculator breaking apart)
- Smoke/electricity effects during overflow

## Animations
- Button press animations
- Highlighted button pulse/glow animation
- Lifebar drain animation with color shift (green → yellow → red)
- Equation text appearing character by character
- Calculator destruction animation on victory
- Score counter rolling up

## Cinematics
- None required for MVP
- Possible: Quick intro showing calculator, "CRUSH IT" text slam

## Scope

### MVP (Must Ship)
- [ ] Working calculator with clickable buttons
- [ ] Button highlighting system
- [ ] Valid equation parser (no invalid expressions like "5++3")
- [ ] Lifebar with increasing drain rate
- [ ] Life gain/loss on correct/wrong clicks
- [ ] Equation reset on wrong click
- [ ] ENTER to evaluate and add to score
- [ ] INT32 overflow detection
- [ ] Victory screen on overflow
- [ ] At least 2 difficulty modes (Easy, Hard)

### Nice-to-Have
- [ ] Online leaderboards
- [ ] Daily challenges
- [ ] Achievements/badges
- [ ] Mobile touch support
- [ ] Sound/music toggle
- [ ] More difficulty modes (Nightmare, ADHD-friendly slow mode)
- [ ] Combo multipliers for consecutive correct clicks

### Explicitly Out of Scope
- Not doing multiplayer
- Not doing story mode
- Not doing calculator skins/customization (for MVP)
- Not doing complex scientific calculator functions

## Success Criteria

| Criteria | Measurement |
|----------|-------------|
| Playable loop | Can play from start to victory/defeat |
| Responsive | Button highlights respond within 16ms |
| Valid equations | Parser rejects all invalid expressions |
| Victory achievable | Player can reach INT32 overflow |
| Difficulty difference | Hard mode noticeably harder than Easy |

---

## Notes
- ADHD/accuracy game type suggests fast feedback loops and clear visual cues are critical
- Consider colorblind-friendly highlight colors
- INT32 max: 2,147,483,647 / min: -2,147,483,648
- Potential strategy: multiplication chains to reach overflow faster

