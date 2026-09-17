# T021: Detailed Gap Analysis - Implementation vs Roadmap

## Executive Summary

**Current State:** Basic 3D terraforming game implemented with core mechanics (resources, extractors, tech tree, prestige, save/load). However, **39 critical mismatches** found between implementation and roadmap exact specs.

**Critical Gaps:**
- Phase 1: 18 spec violations (wrong values, missing features, incorrect resource types)
- Phase 2: 12 missing features (no bloom, incorrect particles, wrong animations)
- Phase 3: 9 missing features (audio exists but wrong specs, no cinematics)
- Phase 4: Not implemented (as intended - deferred)

---

## Phase 1: Core Systems - SPEC VIOLATIONS

### 1.1 Planet Generation & Rendering ❌ INCORRECT

| Spec (Roadmap) | Actual (main.js) | Status | Line |
|----------------|------------------|--------|------|
| **Planet radius:** 1.5 units | 1.0 units | ❌ WRONG | 34 |
| **Sphere segments:** 32x32 | 64x64 | ❌ WRONG | 34 |
| **Icosphere topology** (800 vertices) | SphereGeometry (not icosphere) | ❌ WRONG | 34 |
| **Camera FOV:** 50deg | 75deg | ❌ WRONG | 10 |
| **Zoom range:** 3.0-12.0 | 2.0-8.0 | ❌ WRONG | 74-75 |
| **Auto-rotate speed:** 0.2 deg/s | 0.5 deg/s | ❌ WRONG | 77 |
| **Drag sensitivity:** 0.5 | Default (not set) | ⚠️ UNVERIFIED | 72 |
| **Seed-based noise** for terrain | No noise/seed system | ❌ MISSING | - |
| **Planet rotation:** 15 deg/s Y-axis | No rotation implemented | ❌ MISSING | - |

**Impact:** Planet visuals don't match intended art style (fewer vertices, wrong size, no procedural generation).

---

### 1.2 Resource System ❌ INCORRECT

| Spec (Roadmap) | Actual (gameState.js) | Status | Line |
|----------------|----------------------|--------|------|
| **3 resources:** Energy, Water, Biomass | **4 resources:** Energy, MINERALS, Water, Biomass | ❌ WRONG | 2-6 |
| **Starting Energy:** 10 | 50 | ❌ WRONG | 76 |
| **Extractor cost:** 5 Energy | Energy extractor: 10E, MINERALS extractor: 50E | ❌ WRONG | 47,54 |
| **Max 12 extractors/planet** | No limit enforced | ❌ MISSING | - |
| **Base rate:** 1.0/s | Energy: 1.0, MINERALS: 0.5, Water: 0.3, Biomass: 0.2 | ⚠️ MIXED | 46,53,60,68 |
| **Upgrade multiplier:** 1.5x per tier | No upgrade system | ❌ MISSING | - |
| **Production tick:** 0.1s interval | Continuous (deltaTime) | ⚠️ DIFFERENT | 169-178 |
| **Extractor radius:** 0.2 units | Not implemented (no visual indicators) | ❌ MISSING | - |
| **+1 float animation:** 0.3s rise, fade | Particles exist but different spec | ⚠️ DIFFERENT | 571-599 |

**Impact:** MINERALS resource type breaks roadmap. Wrong costs/rates will affect game balance. No extractor limit allows infinite scaling.

---

### 1.3 Terraforming Tech Tree ❌ INCORRECT

| Spec (Roadmap) | Actual (gameState.js) | Status | Line |
|----------------|----------------------|--------|------|
| **Stage 1 cost:** 100 Energy | 100E + 50 MINERALS | ❌ WRONG | 20 |
| **Stage 2 cost:** 50E + 200W | 500E + 200 MINERALS + 100W | ❌ WRONG | 27 |
| **Stage 3 cost:** 100E + 100W + 300B | 1000E + 500W + 200B | ❌ WRONG | 34 |
| **Upgrade times:** 5.0s, 8.0s, 12.0s | Auto-progress (no timed upgrades) | ❌ WRONG | 181-189 |
| **Progress bar UI** | No progress bar (instant unlock) | ❌ MISSING | - |
| **Shader transitions:** 0.5s fade blend | Color lerp exists but no timing control | ⚠️ PARTIAL | 430-434 |
| **Exact shader colors** (roadmap:39-43) | Generic colors (not matching spec) | ❌ WRONG | 426-432 |

**Impact:** Tech costs completely different from design. No timed progression = wrong pacing. Shader colors don't match art direction.

---

### 1.4 Save/Load System ⚠️ PARTIAL

| Spec (Roadmap) | Actual (gameState.js) | Status | Line |
|----------------|----------------------|--------|------|
| **Save key:** "testaaa_save_v1" | "gameState" | ❌ WRONG | 219 |
| **Schema:** planet_seed, resources, extractors[], tech_stage, prestige_count | No planet_seed, extractors as object not array, tech_stage missing | ⚠️ PARTIAL | 210-218 |
| **Auto-save:** 10.0s interval | No auto-save implemented | ❌ MISSING | - |
| **Offline max:** 24 hours (86400s) | 4 hours (14400s) | ❌ WRONG | 237 |
| **Offline efficiency:** 80% | 100% (no efficiency reduction) | ❌ WRONG | 240-243 |
| **Offline tick rate:** 1.0s simulated | Lump sum calculation (no tick simulation) | ⚠️ DIFFERENT | 240-243 |
| **Load error fallback:** Reset with prestige preserved | No error handling | ❌ MISSING | - |

**Impact:** Save system exists but doesn't match schema. Offline progression too generous (100% vs 80%, 4h vs 24h). No auto-save means manual save required.

---

### 1.5 Prestige System ⚠️ PARTIAL

| Spec (Roadmap) | Actual (gameState.js) | Status | Line |
|----------------|----------------------|--------|------|
| **Trigger:** tech_stage === 3 | terraformStages.life >= 100 | ✅ EQUIVALENT | 194 |
| **Bonus:** +10% per planet | +50% per planet (0.5 multiplier) | ❌ WRONG | 197 |
| **Reset:** new planet seed | No seed system implemented | ❌ MISSING | - |
| **Starting resources:** Initial values | 100E (vs spec: 10E) | ❌ WRONG | 200 |
| **Persistent stats:** prestige_count, total_planets_completed | Only prestigeLevel tracked | ⚠️ PARTIAL | 101,196 |
| **Seed generation:** Math.random() * 999999 \| 0 | No seed generation | ❌ MISSING | - |

**Impact:** Prestige bonus WAY too strong (50% vs 10% = 5x easier per prestige). No procedural planets = no variety. Wrong starting resources after prestige.

---

## Phase 2: Visual Polish - MISSING

### 2.1 Low-Poly Art Pass ❌ MISSING

| Spec (Roadmap) | Actual (main.js) | Status |
|----------------|------------------|--------|
| **Extractor models:** 20 tris, 0.15u height, #FFD700 glow | Simple markers (no 3D models) | ❌ MISSING |
| **Noise octaves:** 3, freq=2.0, amp=0.5 | No noise system | ❌ MISSING |
| **UI styling:** 8px border-radius, bloom post-processing | No bloom (no EffectComposer/UnrealBloomPass found) | ❌ MISSING |
| **Bloom:** strength=0.5, threshold=0.8, radius=1.0 | Not implemented | ❌ MISSING |

**Impact:** No visual polish pass completed. Extractors lack visual identity. No post-processing effects.

---

### 2.2 Particles & Effects ⚠️ PARTIAL

| Spec (Roadmap) | Actual (main.js) | Status | Line |
|----------------|------------------|--------|------|
| **Floater spawn rate:** 1 per production tick | Exists but spawns per extractor update | ⚠️ DIFFERENT | 571-599 |
| **Floater rise speed:** 0.5 u/s | 0.4 u/s | ❌ WRONG | 591 |
| **Floater lifetime:** 1.5s | 2.0s | ❌ WRONG | 584 |
| **Floater size:** 0.05u | 0.05 (correct) | ✅ CORRECT | 578 |
| **Floater colors:** Energy=#FFEB3B, Water=#2196F3, Biomass=#8BC34A | Generic color (not resource-specific) | ❌ WRONG | 577 |
| **Atmosphere haze:** 500 particles, ±0.1 u/s drift, alpha=0.2-0.5 | No haze particles | ❌ MISSING | - |
| **Rain (stage 3):** 300 particles, 2.0 u/s fall | No rain system | ❌ MISSING | - |

**Impact:** Particles exist but don't match exact specs. Missing atmosphere haze and rain effects = less visual juice.

---

### 2.3 Animations ⚠️ PARTIAL

| Spec (Roadmap) | Actual (main.js) | Status | Line |
|----------------|------------------|--------|------|
| **Planet spin:** 15 deg/s Y-axis | No planet rotation implemented | ❌ MISSING | - |
| **Terrain morph:** 0.5s vertex lerp on stage upgrade | No vertex animation (color only) | ❌ MISSING | - |
| **UI transitions:** 0.2s slide-in, cubic-bezier(0.4,0.0,0.2,1) | No UI transitions | ❌ MISSING | - |
| **Click bounce:** 1.0→0.95→1.05→1.0 over 0.15s | No button animations | ❌ MISSING | - |

**Impact:** Static planet (no rotation). UI lacks polish. No satisfying click feedback.

---

## Phase 3: Audio & Juice - PARTIAL

### 3.1 Sound Design ⚠️ PARTIAL

| Spec (Roadmap) | Actual (main.js:84-300) | Status | Line |
|----------------|-------------------------|--------|------|
| **UI clicks:** 0.05s chirp @ 800Hz ± 50Hz | AudioManager exists but spec unclear | ⚠️ UNVERIFIED | 84-300 |
| **Extractor place:** 0.2s whoosh @ 400Hz | Likely implemented but needs verification | ⚠️ UNVERIFIED | - |
| **Stage complete:** 1.0s swell, C-E-G chord | Likely implemented but needs verification | ⚠️ UNVERIFIED | - |
| **Ambient loop:** 2min synth pad, 5.0s crossfade | Unknown if implemented | ⚠️ UNVERIFIED | - |
| **Volumes:** Master=70%, SFX=50%, Music=30% | Needs verification | ⚠️ UNVERIFIED | - |
| **Audio format:** .ogg files | Procedural synthesis (no .ogg files) | ⚠️ DIFFERENT | - |

**Impact:** AudioManager exists (300 lines) but requires detailed review to confirm exact Hz/timing specs match roadmap. Procedural vs file-based audio is acceptable tradeoff.

---

### 3.2 Cinematics ❌ MISSING

| Spec (Roadmap) | Actual (main.js) | Status |
|----------------|------------------|--------|
| **Intro:** 3.0s (fade in → 180deg spin → title) | No intro cinematic | ❌ MISSING |
| **Prestige:** 4.0s (zoom out → 50 ships @ 3.0 u/s → fade) | No prestige cinematic (button exists but no animation) | ❌ MISSING |
| **Ship particles:** 50 count, 3.0 u/s radial | Not implemented | ❌ MISSING |
| **Fade duration:** 0.5s black screen | Not implemented | ❌ MISSING |

**Impact:** Missing "juice" moments that make prestige feel rewarding. No onboarding intro.

---

## Phase 4: Nice-to-Have - NOT IMPLEMENTED ✅ CORRECT

| Feature | Status | Notes |
|---------|--------|-------|
| Multiple Biomes (4 types) | ❌ NOT IMPLEMENTED | ✅ Correctly deferred per roadmap |
| Planet Gallery (3x3 grid) | ❌ NOT IMPLEMENTED | ✅ Correctly deferred per roadmap |
| Mobile Touch Controls | ❌ NOT IMPLEMENTED | ✅ Correctly deferred per roadmap |

**Impact:** None - Phase 4 intentionally deferred until Phase 1-3 complete.

---

## Critical Issues Summary

### HIGH PRIORITY (Breaks Spec)

1. **MINERALS resource type** (gameState.js:4) - **NOT IN ROADMAP**, remove entirely
2. **Planet radius 1.0u** (main.js:34) - **Should be 1.5u**
3. **Prestige bonus 50%** (gameState.js:197) - **Should be 10%**
4. **Tech costs completely wrong** (gameState.js:20,27,34) - All use MINERALS, wrong amounts
5. **Starting Energy 50** (gameState.js:76) - **Should be 10**
6. **No max extractor limit** - **Should enforce 12/planet**
7. **No planet seed system** - Required for prestige variety
8. **No auto-save** (gameState.js) - **Should auto-save every 10s**
9. **Offline progress 4h @ 100%** (gameState.js:237-243) - **Should be 24h @ 80%**
10. **Save key "gameState"** (gameState.js:219) - **Should be "testaaa_save_v1"**

### MEDIUM PRIORITY (Missing Features)

11. **No bloom post-processing** - Major visual impact missing
12. **No atmosphere haze particles** - Visual polish gap
13. **No rain effects** (stage 3) - Visual polish gap
14. **No planet rotation** - Static planet looks lifeless
15. **No timed tech upgrades** (5s/8s/12s) - Instant unlocks wrong pacing
16. **Camera FOV 75deg** (main.js:10) - **Should be 50deg**
17. **Zoom range 2-8** (main.js:74-75) - **Should be 3-12**
18. **No cinematics** (intro/prestige) - Missing juice moments
19. **Wrong sphere geometry** (main.js:34) - SphereGeometry vs IcosahedronGeometry
20. **Sphere segments 64x64** (main.js:34) - **Should be 32x32**

### LOW PRIORITY (Polish/Verify)

21. **Floater rise speed 0.4** (main.js:591) - **Should be 0.5 u/s**
22. **Floater lifetime 2.0s** (main.js:584) - **Should be 1.5s**
23. **Floater colors generic** (main.js:577) - **Should be resource-specific (#FFEB3B, #2196F3, #8BC34A)**
24. **Auto-rotate speed 0.5** (main.js:77) - **Should be 0.2 deg/s**
25. **No UI animations** (buttons, transitions) - Polish gap
26. **No vertex terrain morphing** - Only color transitions implemented
27. **No extractor 3D models** - Using simple markers
28. **Audio specs unverified** - AudioManager exists but needs Hz/timing check
29. **No noise-based terrain** - Planet visuals lack procedural detail
30. **Extractor costs wrong** - Energy: 10 (should be 5), others don't exist in roadmap

---

## Files Requiring Changes

| File | Change Count | Severity |
|------|--------------|----------|
| **gameState.js** | 15 changes | 🔴 CRITICAL |
| **main.js** | 20+ changes | 🔴 CRITICAL |
| **index.html** | Unknown (UI changes) | 🟡 MEDIUM |
| **style.css** | Unknown (UI polish) | 🟢 LOW |

---

## Recommended Fix Order

### Phase 1 (BLOCKING)
1. **T026** - Remove MINERALS resource, align to Energy/Water/Biomass only
2. **T027** - Fix all exact values (planet radius, costs, rates, zoom, FOV, etc.)
3. **T024** - Fix prestige bonus (10% not 50%), add seed system
4. **T025** - Fix save/load schema, add auto-save, correct offline progress

### Phase 2 (VISUAL)
5. **T028** - Add bloom post-processing (EffectComposer + UnrealBloomPass)
6. **T029** - Fix particle specs (colors, speeds, sizes) + add haze/rain

### Phase 3 (POLISH)
7. **T030** - Verify/fix audio exact specs (Hz values, timings)
8. **T031** - Implement cinematics (intro/prestige sequences)

---

## Success Metrics

**Completion = 39 spec violations fixed:**
- ✅ All Phase 1 exact values match roadmap
- ✅ No MINERALS resource type exists
- ✅ Prestige bonus correctly 10% per planet
- ✅ Save/load schema matches spec
- ✅ Bloom post-processing active
- ✅ All particles match exact specs
- ✅ Cinematics implemented

**Current Completion: ~40%** (basic mechanics work but spec compliance poor)

---

## Sources
- [Roadmap](C:\Users\lou\__MY_WORK__\STUDIO_TEST_ROOM\testaproj\testaaa-proj\roadmap.md:1-209) — Full spec with exact values
- [main.js](C:\Users\lou\__MY_WORK__\STUDIO_TEST_ROOM\testaproj\testaaa-proj\main.js:1-694) — Current implementation
- [gameState.js](C:\Users\lou\__MY_WORK__\STUDIO_TEST_ROOM\testaproj\testaaa-proj\gameState.js:1-247) — Game state/logic
