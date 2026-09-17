# T018: P005 Implementation Tasks Created

## Task Summary

Created **8 focused implementation tasks** for Code agent based on T017 gap analysis and roadmap exact specs.

| Task | Phase | Description | Files | Priority |
|------|-------|-------------|-------|----------|
| **T024** | 1.5 | Prestige system (stage 3 trigger, +10% production/planet) | main.js, gameState.js | HIGH |
| **T025** | 1.4 | Save/load + offline progress (10s auto-save, 24h @ 80%) | main.js, gameState.js | HIGH |
| **T026** | 1.1 | Resource type alignment (Energy/Water/Biomass, max 12 extractors) | gameState.js, main.js | HIGH |
| **T027** | 1 | Exact value updates (radius 1.5u, costs, rates per roadmap) | main.js:34 | HIGH |
| **T028** | 2.1 | Bloom post-processing (strength 0.5, threshold 0.8) | main.js | MEDIUM |
| **T029** | 2.2 | Particle spec verification (counts/sizes/rates vs roadmap) | main.js:571-617 | MEDIUM |
| **T030** | 3.1 | Exact audio specs (Hz values, timings) | main.js:84-300 | MEDIUM |
| **T031** | 3.2 | Cinematics (intro 3.0s, prestige 4.0s) | main.js | LOW |

---

## Task Details

### Phase 1: Core Systems (HIGH PRIORITY)

#### T024 - Prestige System
**Spec:** roadmap:56-64
- Trigger: `tech_stage === 3`
- Bonus: `+10% base production per completed planet`
- Reset: new seed, zero resources, preserve `prestige_count`
- **Constraints:** No UI changes beyond prestige button

#### T025 - Save/Load System
**Spec:** roadmap:45-53
- Key: `testaaa_save_v1` (localStorage)
- Auto-save: 10.0s interval
- Offline: max 24h catchup @ 80% efficiency
- **Schema:** `planet_seed, resources, extractors[], tech_stage, prestige_count`

#### T026 - Resource Alignment
**Spec:** roadmap Phase 1.1
- **Remove:** MINERALS (not in roadmap)
- **Keep:** Energy ⚡, Water 💧, Biomass 🌱
- **Add:** Max 12 extractors enforcement (roadmap:19)

#### T027 - Exact Value Updates
**Spec:** roadmap Phase 1 exact values
- Planet radius: `1.5u` (currently 1u @ main.js:34)
- Zoom range: `3.0-12.0`
- Extractor cost: `5 Energy`
- Unlock costs:
  - Atmosphere: `100E, 5s`
  - Oceans: `50E + 200W, 8s`
  - Life: `100E + 100W + 300B, 12s`
- Base rate: `1.0/s`, upgrade: `1.5x`

---

### Phase 2: Visual Polish (MEDIUM PRIORITY)

#### T028 - Bloom Post-Processing
**Spec:** roadmap:73-78
- Use three.js `EffectComposer` + `UnrealBloomPass`
- **Exact values:**
  - Strength: `0.5`
  - Threshold: `0.8`
  - Radius: `1.0`

#### T029 - Particle Verification
**Spec:** roadmap:80-87
- **Floaters:** 1/tick, 0.05u size, 0.5 u/s rise, 1.5s lifetime
- **Haze:** 500 particles, ±0.1 u/s drift, alpha 0.2-0.5
- **Rain (stage 3):** 300 particles, 2.0 u/s fall
- **Colors:** Energy #FFEB3B, Water #2196F3, Biomass #8BC34A
- **Note:** Particles already exist @ main.js:571-617 — verify and adjust only

---

### Phase 3: Audio & Juice (LOWER PRIORITY)

#### T030 - Exact Audio Specs
**Spec:** roadmap:102-112
- **UI click:** 0.05s chirp @ 800Hz ± 50Hz
- **Extractor place:** 0.2s whoosh @ 400Hz
- **Stage complete:** 1.0s swell (C-E-G chord)
- **Ambient:** 2min synth pad, 5.0s crossfade
- **Volumes:** Master 70%, SFX 50%, Music 30%
- **Note:** AudioManager exists @ main.js:84-300

#### T031 - Cinematics
**Spec:** roadmap:114-121
- **Intro (3.0s):** fade in → 180deg spin → title
- **Prestige (4.0s):** zoom out → 50 ship particles @ 3.0 u/s radial → fade
- **Trigger:** intro on load, prestige on reset

---

## Implementation Order (Recommended)

```
Phase 1 (CRITICAL PATH):
1. T026 → Resource alignment (foundation fix)
2. T027 → Exact values (core mechanics)
3. T025 → Save/load (persistence)
4. T024 → Prestige (progression loop)

Phase 2 (POLISH):
5. T029 → Particle verification (quick win)
6. T028 → Bloom (visual impact)

Phase 3 (JUICE):
7. T030 → Audio specs (low risk)
8. T031 → Cinematics (nice-to-have)
```

---

## Phase 4: Deferred (Not Tasked)

Per T017 recommendation, Phase 4 features deferred until Phase 1-3 complete:
- Multiple biomes (4 types, 25% coverage each)
- Planet gallery (3x3 grid, 27 planets max)
- Mobile touch controls (1.5x sensitivity, pinch zoom)

**Rationale:** MVP first, nice-to-have later

---

## Success Criteria

All tasks marked **COMPLETED** when:
- ✅ Code matches exact roadmap specs (no guesswork)
- ✅ No syntax errors (Code Rule 4: WORKING ONLY)
- ✅ Functions stay under 50 lines (Code Rule 5)
- ✅ Search performed before editing (Code Rule 1)

**Next Step:** Code agent picks up T024 (prestige system) and follows sequential order.

---

## Sources
- [T017 Gap Analysis](reports/T017-P005-deliverables-gap-analysis_20260911_220008.md) — Missing features identified
- [T016 Phase Requirements](reports/T016_P005_phase_requirements_status_20260911_215644.md) — Roadmap exact specs
- [P005 Roadmap](C:\Users\lou\__MY_WORK__\STUDIO_TEST_ROOM\testaproj\testaaa-proj\roadmap.md) — Implementation blueprint
