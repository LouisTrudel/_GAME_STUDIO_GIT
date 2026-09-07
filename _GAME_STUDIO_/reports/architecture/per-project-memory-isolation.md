# Architecture Report: Per-Project Memory Isolation

**Task:** T315
**Author:** Context Engineer
**Date:** 2026-09-07

---

## Executive Summary

Current architecture has **two memory systems with different scoping**:

| System | Location | Current Scope | Multi-Project Ready |
|--------|----------|---------------|---------------------|
| CONTEXT.md | `projects/<id>/CONTEXT.md` | Per-project | Yes |
| Memory Tiers | `data/memory/tier_*.json` | Global | No |

**Risk:** When switching projects, memory tiers will bleed context from Project A into Project B prompts.

---

## 1. Current State Analysis

### CONTEXT.md (Per-Project) - Correct Design

```
projects/
├── default/
│   └── CONTEXT.md      # Signals for default project
├── game-alpha/
│   └── CONTEXT.md      # Signals for game-alpha
└── game-beta/
    └── CONTEXT.md      # Signals for game-beta
```

- Already isolated per project
- Cross-agent signals scoped correctly
- Boss reads correct file via `read_context(project_id=...)`

### Memory Tiers (Global) - Problem

```
data/memory/
├── tier_0.json    # ALL projects mixed
├── tier_1.json    # ALL projects mixed
└── tier_2.json    # ALL projects mixed
```

- Single global namespace
- No project_id field in TierData
- `MemoryManager` hardcodes `data/memory/` path
- Compression cascade ignores project boundaries

---

## 2. Pollution Scenarios

### Scenario A: Context Bleed
```
1. User works on game-alpha, generates 10KB of memory
2. User switches to game-beta
3. Boss builds prompt including tier_0 content
4. game-alpha decisions pollute game-beta agent context
```

### Scenario B: Compression Collision
```
1. game-alpha fills tier_0 to 10KB threshold
2. Compression runs, pushes summary to tier_1
3. Summary contains game-alpha specifics
4. game-beta inherits compressed history it never produced
```

### Scenario C: Search Contamination
```
1. Agent searches memory for "economy design"
2. Returns results from both game-alpha and game-beta
3. Agent applies wrong project's economy rules
```

---

## 3. Recommended Architecture

### Option A: Directory Scoping (Recommended)

Mirror CONTEXT.md pattern:

```
data/
├── memory/                    # DEPRECATED - global (remove)
└── projects/
    ├── default/
    │   └── memory/
    │       ├── tier_0.json
    │       ├── tier_1.json
    │       └── tier_2.json
    ├── game-alpha/
    │   └── memory/
    │       └── ...
    └── game-beta/
        └── memory/
            └── ...
```

**Changes Required:**

| File | Change |
|------|--------|
| `memory.py` | Add `project_id` param to `MemoryManager.__init__()` |
| `memory.py` | Change `MEMORY_DIR` to `data/projects/{project_id}/memory/` |
| `hub.py` | Pass active project_id when creating MemoryManager |
| `hub.py` | Re-instantiate MemoryManager on project switch |

### Option B: Field Scoping (Not Recommended)

Keep single directory, add project_id to each entry:

```json
{
  "tier_index": 0,
  "project_id": "game-alpha",
  "accumulated_a": "..."
}
```

**Problems:**
- Compression must filter by project
- Search requires project filtering
- Legacy data migration complex
- File size grows across all projects

---

## 4. Boss Context Loading Protocol

### Current Flow
```
Boss receives task
  → read_context(project_id)     # Per-project CONTEXT.md
  → memory_manager.get_recent()  # GLOBAL tier_0 (wrong)
  → builds prompt
```

### Required Flow
```
Boss receives task
  → active_project = project_manager.get_active()
  → read_context(project_id=active_project.id)
  → memory = MemoryManager(project_id=active_project.id)  # Scoped
  → memory.get_recent()
  → builds prompt
```

### Project Switch Protocol

```python
def on_project_switch(old_id: str, new_id: str):
    # 1. Flush old project memory to disk
    old_memory.save_tier(old_memory.get_tier(0))

    # 2. Clear tier cache (prevents pollution)
    old_memory._tier_cache.clear()

    # 3. Create new scoped manager
    new_memory = MemoryManager(project_id=new_id)

    # 4. Update hub reference
    hub.memory_manager = new_memory
```

---

## 5. Migration Strategy

### Phase 1: Add Scoping (Non-Breaking)
1. Add `project_id` param with default `"default"`
2. Existing data continues working
3. New projects get isolated directories

### Phase 2: Migrate Default
1. Move `data/memory/` → `data/projects/default/memory/`
2. Update paths in MemoryManager

### Phase 3: Remove Global
1. Delete `data/memory/` fallback
2. Require project_id on all operations

---

## 6. Implementation Checklist

| Priority | Task | Effort |
|----------|------|--------|
| P0 | Add `project_id` to `MemoryManager.__init__()` | 1 hour |
| P0 | Compute `MEMORY_DIR` from project_id | 30 min |
| P1 | Update `hub.py` to pass project_id | 30 min |
| P1 | Add project switch handler | 1 hour |
| P2 | Migrate existing `data/memory/` to `data/projects/default/memory/` | 30 min |
| P2 | Update history system to use project scoping | 1 hour |

---

## 7. Verification Tests

```python
def test_memory_isolation():
    # Setup
    m1 = MemoryManager(project_id="alpha")
    m2 = MemoryManager(project_id="beta")

    # Write to alpha
    m1.append_to_tier(0, "alpha secret")

    # Verify beta doesn't see it
    assert "alpha" not in m2.get_recent()

    # Verify file paths differ
    assert m1._tier_path(0) != m2._tier_path(0)

def test_compression_isolation():
    m1 = MemoryManager(project_id="alpha")
    # Fill tier_0 to trigger compression
    m1.append_to_tier(0, "x" * 15000)
    m1.compress_tier(0)

    # Verify tier_1 in alpha directory
    assert (Path("data/projects/alpha/memory/tier_1.json")).exists()
    # Verify beta has no tier_1
    assert not (Path("data/projects/beta/memory/tier_1.json")).exists()
```

---

## 8. Summary

**Do:**
- Scope memory tiers per-project like CONTEXT.md
- Re-instantiate MemoryManager on project switch
- Clear tier cache when switching

**Don't:**
- Share tier files across projects
- Add project_id as a filter field (use directories)
- Allow Boss to access memory without project context

**Critical Path:** `memory.py` changes must land before multi-project launches. Without isolation, memory becomes unusable pollution source.
