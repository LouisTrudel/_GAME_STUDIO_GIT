# P005 Test Plan & Acceptance Criteria
**Project:** testaaa-proj (3D Idle Terraforming Game)  
**Focus:** Incremental Mechanics  
**Created:** 2026-09-11

---

## Test Plan

### 1. Happy Path Tests

#### Resource Generation
- **GIVEN** a player places an extractor on planet surface  
- **WHEN** time passes (1 min, 5 min, 10 min)  
- **THEN** resources accumulate at expected rate  
- **EXPECTED** UI shows increasing resource count, no lag/stutter

#### Tech Unlocking
- **GIVEN** player has sufficient resources  
- **WHEN** player unlocks tech (atmosphere → water → life)  
- **THEN** tech unlocks in order, resources deducted correctly  
- **EXPECTED** Tech tree updates, planet visual changes

#### Biome Painting
- **GIVEN** player has unlocked terraforming tech  
- **WHEN** player spends resources to paint biomes  
- **THEN** planet surface updates with new biome visuals  
- **EXPECTED** Smooth terrain morphing, resources deducted

#### Prestige
- **GIVEN** player completes terraforming stages  
- **WHEN** player triggers prestige  
- **THEN** new planet generated, bonuses applied, progress resets  
- **EXPECTED** Save carries over prestige bonuses

---

### 2. Boundary Tests

#### Zero/Negative Resources
- **GIVEN** player has 0 resources  
- **WHEN** attempting to unlock tech or paint biome  
- **THEN** action blocked, error message shown  
- **EXPECTED** No negative resource values possible

#### Empty Planet
- **GIVEN** new planet with no extractors  
- **WHEN** time passes  
- **THEN** no resource generation occurs  
- **EXPECTED** UI shows 0 resources, no crashes

#### Max Resources
- **GIVEN** player accumulates MAX_INT resources (e.g., 1e15)  
- **WHEN** more resources generated  
- **THEN** value caps or uses safe number representation  
- **EXPECTED** No overflow, display formats correctly

#### Max Offline Time
- **GIVEN** player closes game for 7 days  
- **WHEN** player returns and loads save  
- **THEN** offline progress calculated and applied (with cap)  
- **EXPECTED** Time warp catch-up UI, no infinite resources

---

### 3. State Integrity Tests

#### Interrupt Mid-Action
- **GIVEN** player is dragging to rotate planet  
- **WHEN** player closes tab mid-drag  
- **THEN** state saves correctly, no corruption  
- **EXPECTED** Next load shows last saved state

#### Rapid Actions
- **GIVEN** player spam-clicks extractor placement  
- **WHEN** clicking 100 times in 1 second  
- **THEN** actions queued or rate-limited appropriately  
- **EXPECTED** No duplicate extractors, no crash

#### Save/Load Cycle
- **GIVEN** player has partial progress (stage 2/3)  
- **WHEN** save → close → load  
- **THEN** exact state restored (resources, unlocks, biomes)  
- **EXPECTED** No data loss, no reset to defaults

#### Concurrent Prestige
- **GIVEN** player triggers prestige  
- **WHEN** prestige animation plays  
- **AND** player closes game  
- **THEN** prestige completes on next load or rolls back safely  
- **EXPECTED** No stuck state, no loss of progress

---

### 4. Exploit Tests

#### Duplicate Resources
- **GIVEN** player has local storage access  
- **WHEN** manually editing save data to set resources to 999999  
- **THEN** game validates on load or sanitizes  
- **EXPECTED** Cheat detection or graceful handling (offline game = low priority)

#### Skip Tech Requirements
- **GIVEN** tech tree requires atmosphere before water  
- **WHEN** player attempts to unlock water first  
- **THEN** action blocked, prerequisite check enforced  
- **EXPECTED** UI shows locked state, tooltip explains why

#### Prestige Duplication
- **GIVEN** player triggers prestige  
- **WHEN** rapidly triggering prestige before reset  
- **THEN** only one prestige registers  
- **EXPECTED** Prestige counter increments once, no bonus stacking exploit

#### Time Manipulation
- **GIVEN** offline progress system  
- **WHEN** player changes system clock forward 1 year  
- **THEN** offline progress caps at reasonable max (e.g., 7 days)  
- **EXPECTED** No infinite resources from time cheating

---

## Acceptance Criteria

### Resource System
- [ ] Resources accumulate at documented rate (e.g., 1/sec base)
- [ ] Resource display updates smoothly (no flicker)
- [ ] Negative resources impossible through normal gameplay
- [ ] Max resource cap prevents overflow (tested to 1e15)
- [ ] Offline progress calculates correctly up to 7-day cap

### Tech Tree
- [ ] All techs unlock in correct order (atmosphere → water → life)
- [ ] Prerequisite validation blocks invalid unlocks
- [ ] Resource costs deduct correctly on unlock
- [ ] Unlocking tech triggers planet visual update within 1 sec

### Biome Painting
- [ ] Biomes apply to planet surface within 2 sec
- [ ] Resource costs deduct on biome paint
- [ ] Cannot paint biomes without unlocked tech
- [ ] Terrain morphing animation smooth (30+ fps)

### Prestige Mechanic
- [ ] Prestige resets progress as documented
- [ ] Bonuses carry over to new planet (e.g., +10% resource rate)
- [ ] New planet generates with different seed
- [ ] Prestige count increments by 1 per prestige
- [ ] Cannot prestige before completing stage 3

### Save/Load System
- [ ] Save triggers on: extractor place, tech unlock, biome paint, prestige
- [ ] Load restores exact state (tested with 10+ save/load cycles)
- [ ] No data loss on browser close mid-action
- [ ] Corrupted save shows error, offers fresh start option

### Performance
- [ ] Game runs at 30+ fps with 50 extractors on planet
- [ ] Save file size < 100KB
- [ ] Load time < 2 seconds on average hardware

---

## Bug Severity Reference

| Level | When |
|-------|------|
| **critical** | Crash, save corruption, cannot progress |
| **major** | Feature broken (e.g., prestige doesn't work) |
| **minor** | Works but wrong (e.g., resource display off by 1) |
| **polish** | Visual glitch, typo, animation hiccup |

---

## Test Execution Notes

1. **Manual Testing**: Run all happy path + boundary tests on first build
2. **Regression**: Re-run exploit tests before each release
3. **Automated**: Consider Playwright tests for save/load cycles
4. **Devices**: Test on desktop Chrome/Firefox + mobile Safari/Chrome

---

## Dependencies

- Codebase must implement: resource system, tech tree, biome painting, prestige, save/load
- Test data: sample save files with stage 1, 2, 3 progress
- Tools: Browser DevTools for local storage inspection

---

**End of Test Plan**
