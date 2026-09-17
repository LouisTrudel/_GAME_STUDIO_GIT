# T020: P005 Implementation Tasks - Roadmap Compliance

## Overview

Created **12 focused implementation tasks** (T032-T043) for Code agent based on T021's detailed gap analysis. Tasks address 39 spec violations found between current implementation and roadmap exact specs.

---

## Task Breakdown by Priority

### 🔴 CRITICAL - Phase 1 Core Fixes (6 tasks)

| Task | What | Files | Impact |
|------|------|-------|--------|
| **T032** | Remove MINERALS resource type entirely | gameState.js:2-6, 20,27,34 | Breaks roadmap - not a valid resource |
| **T033** | Fix exact values: radius 1.5u, segments 32x32, FOV 50deg, zoom 3-12, rotate 0.2 | main.js:10,34,74-77 | Planet visuals wrong size/detail |
| **T034** | Fix prestige bonus 50%→10%, add planet_seed system | gameState.js:197,200 | Balance broken (5x too easy) |
| **T035** | Fix tech costs: Atmosphere 100E, Oceans 50E+200W, Life 100E+100W+300B | gameState.js:17-37 | Progression pacing completely wrong |
| **T036** | Fix resources: start 10E (not 50E), extractor 5E, rate 1.0/s, max 12 limit | gameState.js:76, 41-70 | Economy balance broken |
| **T037** | Fix save/load: key testaaa_save_v1, schema, auto-save 10s, offline 24h @ 80% | gameState.js:209-246 | Persistence spec violations |

**Critical Path:** T032 → T036 → T035 (dependencies: remove MINERALS before fixing costs/resources)

---

### 🟡 MEDIUM - Phase 2 Visual Polish (4 tasks)

| Task | What | Files | Impact |
|------|------|-------|--------|
| **T038** | Add bloom post-processing (strength 0.5, threshold 0.8, radius 1.0) | main.js | Major visual impact missing |
| **T039** | Fix particles: rise 0.5 u/s, lifetime 1.5s, colors, add haze 500p + rain 300p | main.js:571-599 | Visual juice missing |
| **T040** | Add planet rotation 15 deg/s, procedural noise (3 octaves, freq 2.0, amp 0.5) | main.js | Static planet looks lifeless |
| **T042** | Fix shader colors for stages 0-3, add 0.5s fade transitions | main.js:426-434 | Art direction mismatch |

---

### 🟢 LOW - Phase 3 Polish & Juice (2 tasks)

| Task | What | Files | Impact |
|------|------|-------|--------|
| **T041** | Implement cinematics: intro 3.0s, prestige 4.0s (50 ships @ 3.0 u/s) | main.js | Missing rewarding moments |
| **T043** | Verify AudioManager specs: 800Hz/400Hz/C-E-G, volumes 70/50/30 | main.js:84-300 | Audio exists but needs verification |

---

## Detailed Task Specifications

### T032 - Remove MINERALS Resource 🔴

**Problem:** MINERALS resource type exists in code but NOT in roadmap spec.

**Changes Required:**
1. Remove `MINERALS: 'minerals'` from `RESOURCES` constant (gameState.js:4)
2. Update `TECH_TREE` to remove all MINERALS costs:
   - Atmosphere: ~~`minerals: 50`~~ (line 20)
   - Water Cycle: ~~`minerals: 200`~~ (line 27)
3. Remove MINERALS extractor type from `EXTRACTOR_TYPES` (lines 49-55)
4. Remove `minerals: 0` from GameState constructor (lines 77, 85)

**Roadmap Ref:** Phase 1.2 (roadmap:18) — Only 3 resources: Energy, Water, Biomass

---

### T033 - Fix Phase 1 Exact Values 🔴

**Problem:** Multiple geometry/camera values don't match roadmap specs.

**Changes Required:**

| Current (main.js) | Should Be (roadmap) | Line |
|-------------------|---------------------|------|
| `SphereGeometry(1, 64, 64)` | `IcosahedronGeometry(1.5, 4)` → 800 vertices | 34 |
| `PerspectiveCamera(75, ...)` | `PerspectiveCamera(50, ...)` | 10 |
| `minDistance = 2` | `minDistance = 3.0` | 74 |
| `maxDistance = 8` | `maxDistance = 12.0` | 75 |
| `autoRotateSpeed = 0.5` | `autoRotateSpeed = 0.2` | 77 |
| *(not set)* | `dampingFactor = 0.5` (drag sensitivity) | 72 |

**Roadmap Ref:** Phase 1.1 (roadmap:6,11-16)

---

### T034 - Fix Prestige System 🔴

**Problem:** Prestige bonus 5x too strong, no planet variety (missing seed system).

**Changes Required:**
1. Fix bonus formula (gameState.js:197):
   ```js
   // WRONG
   this.prestigeBonus = 1 + (this.prestigeLevel * 0.5);
   
   // CORRECT
   this.prestigeBonus = 1 + (this.prestigeLevel * 0.1);
   ```

2. Add planet seed system:
   - Add `planet_seed` to GameState constructor
   - Generate seed: `this.planet_seed = Math.random() * 999999 | 0`
   - Reset with new seed on prestige

3. Fix starting resources after prestige (gameState.js:200):
   ```js
   // WRONG
   this.resources = { energy: 100, ... };
   
   // CORRECT
   this.resources = { energy: 10, water: 0, biomass: 0 };
   ```

**Roadmap Ref:** Phase 1.5 (roadmap:56-64)

---

### T035 - Fix Tech Tree Costs 🔴

**Problem:** All tech costs completely different from roadmap spec.

**Changes Required (gameState.js:17-37):**

| Tech | Current Cost | Roadmap Cost |
|------|--------------|--------------|
| ATMOSPHERE | 100E + 50 MINERALS | **100 Energy only** |
| WATER_CYCLE | 500E + 200 MINERALS + 100W | **50 Energy + 200 Water** |
| BASIC_LIFE | 1000E + 500W + 200B | **100 Energy + 100 Water + 300 Biomass** |

**Additional Features:**
- Add timed upgrades: 5.0s (Atmosphere), 8.0s (Oceans), 12.0s (Life)
- Add progress bar UI during upgrade
- Currently auto-progresses (instant) — needs button + timer

**Roadmap Ref:** Phase 1.3 (roadmap:31-35)

---

### T036 - Fix Resource System 🔴

**Problem:** Wrong starting resources, extractor costs, rates, no limit enforcement.

**Changes Required (gameState.js):**

1. **Starting resources** (line 76):
   ```js
   // WRONG
   this.resources = { energy: 50, minerals: 0, water: 0, biomass: 0 };
   
   // CORRECT
   this.resources = { energy: 10, water: 0, biomass: 0 };
   ```

2. **Extractor costs** (lines 41-70):
   - All extractors should cost `{ energy: 5 }` (currently 10E/50E/100E/200E)

3. **Base rates** (lines 46,53,60,68):
   - All extractors should have `baseRate: 1.0` (currently 1.0/0.5/0.3/0.2)

4. **Max extractor limit** (new feature):
   - Add check in `purchaseExtractor()` to enforce max 12 extractors total
   - Count all extractor types combined

**Roadmap Ref:** Phase 1.2 (roadmap:18-27)

---

### T037 - Fix Save/Load System 🔴

**Problem:** Wrong save key, missing schema fields, no auto-save, offline too generous.

**Changes Required (gameState.js:209-246):**

1. **Save key** (line 219):
   ```js
   // WRONG
   localStorage.setItem('gameState', JSON.stringify(saveData));
   
   // CORRECT
   localStorage.setItem('testaaa_save_v1', JSON.stringify(saveData));
   ```

2. **Schema update** (lines 210-218):
   - Add `planet_seed` to saveData
   - Change `extractors` from object to array: `extractors: [...]`
   - Add `tech_stage` field

3. **Auto-save** (new feature):
   - Add `setInterval(() => gameState.save(), 10000)` in main.js
   - 10.0s interval per roadmap

4. **Offline progress** (lines 237-243):
   ```js
   // WRONG
   const maxOfflineTime = 3600 * 4; // 4 hours @ 100%
   
   // CORRECT
   const maxOfflineTime = 86400; // 24 hours
   const offlineProduction = production * actualOfflineTime * 0.8; // 80% efficiency
   ```

5. **Load error fallback** (new feature):
   - Wrap load() in try/catch
   - On error: reset to new game but preserve `prestige_count`

**Roadmap Ref:** Phase 1.4 (roadmap:45-53)

---

### T038 - Add Bloom Post-Processing 🟡

**Problem:** No bloom effect implemented (major visual impact missing).

**Changes Required (main.js):**

1. **Imports** (top of file):
   ```js
   import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
   import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
   import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
   ```

2. **Setup after renderer** (after line 16):
   ```js
   const composer = new EffectComposer(renderer);
   composer.addPass(new RenderPass(scene, camera));
   
   const bloomPass = new UnrealBloomPass(
     new THREE.Vector2(window.innerWidth, window.innerHeight),
     0.5,  // strength
     1.0,  // radius
     0.8   // threshold
   );
   composer.addPass(bloomPass);
   ```

3. **Update animate() loop**:
   - Replace `renderer.render(scene, camera)` with `composer.render()`

**Roadmap Ref:** Phase 2.1 (roadmap:73,76-78)

---

### T039 - Fix Particle Specs 🟡

**Problem:** Existing particles don't match exact roadmap specs, missing haze/rain.

**Changes Required (main.js:571-599):**

1. **Fix floater specs**:
   - Rise speed: `0.5` u/s (currently 0.4, line 591)
   - Lifetime: `1.5` s (currently 2.0, line 584)
   - Colors by resource type (currently generic):
     - Energy: `0xFFEB3B`
     - Water: `0x2196F3`
     - Biomass: `0x8BC34A`

2. **Add atmosphere haze** (new feature):
   - Pool: 500 particles
   - Drift: ±0.1 u/s random
   - Alpha: 0.2-0.5
   - Always visible

3. **Add rain system** (new feature):
   - Active: tech_stage >= 3 only
   - Count: 300 particles
   - Fall speed: 2.0 u/s

**Roadmap Ref:** Phase 2.2 (roadmap:81-87)

---

### T040 - Add Planet Rotation & Procedural Noise 🟡

**Problem:** Static planet (no rotation), no procedural terrain variety.

**Changes Required (main.js):**

1. **Planet rotation** (in `animate()` loop):
   ```js
   planet.rotation.y += (15 * Math.PI / 180) * deltaTime; // 15 deg/s
   ```

2. **Seed-based noise system** (new feature):
   - Use `planet_seed` from GameState
   - Implement simplex/perlin noise with:
     - Octaves: 3
     - Frequency: 2.0
     - Amplitude: 0.5
   - Apply to sphere vertex positions or shader

**Roadmap Ref:** Phase 1.1 (roadmap:7,14) + Phase 2.1 (roadmap:72)

---

### T041 - Implement Cinematics 🟢

**Problem:** No intro/prestige cinematics (missing rewarding moments).

**Changes Required (main.js):**

1. **Intro cinematic** (3.0s total):
   - 0-1s: Fade in from black
   - 1-2s: Camera orbit 180deg around planet
   - 2-3s: Title text fade in

2. **Prestige cinematic** (4.0s total):
   - 0-1s: Camera zoom out to 20 units
   - 1-2.5s: Spawn 50 ship particles, radial speed 3.0 u/s
   - 2.5-4s: Fade to black, load new planet

3. **Fade effect**:
   - Black screen overlay
   - Duration: 0.5s

**Roadmap Ref:** Phase 3.2 (roadmap:115-121)

---

### T042 - Fix Shader Colors 🟡

**Problem:** Shader colors don't match exact roadmap art direction.

**Changes Required (main.js:426-434):**

Replace current color lerp with exact roadmap colors:

```js
// Stage 0 (Barren)
const barrenColor = new THREE.Color(0x8B7355);

// Stage 1 (Atmosphere)
const atmosphereTerrainColor = new THREE.Color(0x9B8365);
const atmosphereHazeColor = new THREE.Color(0xC0D8E8); // opacity 0.3

// Stage 2 (Oceans)
const oceansTerrainColor = new THREE.Color(0xA89070);
const oceansWaterColor = new THREE.Color(0x4A90E2); // 40% coverage

// Stage 3 (Life)
const lifeTerrainColor = new THREE.Color(0x7FCD91);
const lifeWaterColor = new THREE.Color(0x3A7FC2);
const lifeCloudsColor = new THREE.Color(0xFFFFFF); // opacity 0.2
```

Add transition timing: 0.5s fade blend between stages.

**Roadmap Ref:** Phase 1.3 (roadmap:39-43)

---

### T043 - Verify AudioManager Specs 🟢

**Problem:** AudioManager exists (300 lines) but exact specs unverified.

**Verification Checklist (main.js:84-300):**

- [ ] UI click: 0.05s chirp @ 800Hz ± 50Hz
- [ ] Extractor place: 0.2s whoosh @ 400Hz
- [ ] Stage complete: 1.0s swell, C-E-G chord (major)
- [ ] Ambient loop: 2min synth pad, 5.0s crossfade between stage themes
- [ ] Volumes: Master 70%, SFX 50%, Music 30%

**If incorrect:** Update to match exact Hz/timing values.

**Roadmap Ref:** Phase 3.1 (roadmap:103-111)

---

## Implementation Order (Recommended)

```
PHASE 1 - CRITICAL PATH (Sequential):
1. T032 → Remove MINERALS (dependency for all other tasks)
2. T036 → Fix resource system (base economy)
3. T035 → Fix tech costs (now MINERALS-free)
4. T034 → Fix prestige system + add seed
5. T037 → Fix save/load schema
6. T033 → Fix exact geometry/camera values

PHASE 2 - VISUAL POLISH (Parallel OK):
7. T038 → Add bloom (high visual impact)
8. T039 → Fix particles + add haze/rain
9. T040 → Add rotation + procedural noise
10. T042 → Fix shader colors

PHASE 3 - POLISH & JUICE (Parallel OK):
11. T043 → Verify audio specs
12. T041 → Implement cinematics
```

**Estimated Complexity:**
- 🔴 CRITICAL: ~60% of work (foundational fixes)
- 🟡 MEDIUM: ~30% of work (visual enhancements)
- 🟢 LOW: ~10% of work (polish/verification)

---

## Success Criteria

**All tasks marked COMPLETED when:**
- ✅ No MINERALS resource type exists anywhere
- ✅ All 39 spec violations from T021 resolved
- ✅ Planet visuals match roadmap (1.5u radius, 32x32 segments, icosphere)
- ✅ Prestige bonus correctly 10% (not 50%)
- ✅ Tech costs match exact roadmap values
- ✅ Save/load uses testaaa_save_v1 key with correct schema
- ✅ Bloom post-processing active
- ✅ All particles match exact specs (speeds, colors, counts)
- ✅ Planet rotates 15 deg/s
- ✅ Cinematics implemented (intro + prestige)
- ✅ Shader colors match exact hex values
- ✅ Audio specs verified/corrected

**Acceptance:** Run Audit task to validate all roadmap specs met.

---

## Sources
- [T021 Gap Analysis](reports/T021-detailed-gap-analysis_20260911_220429.md) — 39 spec violations identified
- [P005 Roadmap](C:\\Users\\lou\\__MY_WORK__\\STUDIO_TEST_ROOM\\testaproj\\testaaa-proj\\roadmap.md) — Implementation spec
- [main.js](C:\\Users\\lou\\__MY_WORK__\\STUDIO_TEST_ROOM\\testaproj\\testaaa-proj\\main.js) — Current implementation
- [gameState.js](C:\\Users\\lou\\__MY_WORK__\\STUDIO_TEST_ROOM\\testaproj\\testaaa-proj\\gameState.js) — Game state logic
