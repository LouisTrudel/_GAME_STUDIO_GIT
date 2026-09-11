# External Project Creation Tooling - Design Spec

**Task:** T425  
**Date:** 2026-09-09  
**Status:** READY FOR IMPLEMENTATION

---

## Overview

Transform project creation from "link existing folder" to "create + initialize external repo."

**Current State:** User manually creates folder, then links path in Studio UI.  
**Target State:** Studio creates folder, initializes git repo, scaffolds structure, links automatically.

---

## Mechanic Spec

| Action | Result |
|--------|--------|
| User clicks "+ New Project" | Modal opens with creation options |
| User enters name + parent directory | Studio creates `{parent}/{project-slug}/` |
| User confirms | Folder created, git init, scaffold files, auto-linked |

---

## Data Model Changes

### projects.json - Add `type` field

```json
{
  "id": "P002",
  "name": "My Game",
  "path": "D:/Games/my-game",
  "type": "external",     // NEW: "external" | "legacy"
  "description": "",
  "status": "active"
}
```

| Type | Meaning |
|------|---------|
| `external` | Created by Studio in external directory |
| `legacy` | Existing project linked manually (backward compat) |

---

## Backend Changes (projects.py)

### New Method: `create_external()`

```python
def create_external(
    self, 
    name: str, 
    parent_dir: str,      # e.g., "D:/Games"
    description: str = "",
    init_git: bool = True
) -> Project:
```

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| name | str | Yes | Display name (max 50 chars) |
| parent_dir | str | Yes | Parent directory for new folder |
| description | str | No | Optional description (max 200 chars) |
| init_git | bool | No | Initialize git repo (default: True) |

**Process:**

1. Sanitize name → slug: `"My Cool Game"` → `"my-cool-game"`
2. Create path: `{parent_dir}/{slug}/`
3. Validate parent_dir exists (error if not)
4. Validate path doesn't exist (error if duplicate)
5. Create directory
6. If init_git: run `git init`
7. Create scaffold files (see below)
8. Register in projects.json with type="external"
9. Return Project

**Scaffold Files:**

| File | Content |
|------|---------|
| `whitepaper.md` | Template header + placeholder sections |
| `roadmap.md` | Template header + placeholder sections |
| `assets/` | Empty directory |
| `.gitignore` | Standard game dev ignores |

**Whitepaper Template:**
```markdown
# {Project Name}

## Concept
[Describe the core game concept]

## Target Platform
[Roblox/Unity/etc.]

## Core Loop
[Main gameplay loop]
```

**Roadmap Template:**
```markdown
# {Project Name} - Roadmap

## Phase 1: Foundation
- [ ] Core mechanic prototype
- [ ] Basic art assets

## Phase 2: Polish
- [ ] Full art pass
- [ ] Sound/Music

## Phase 3: Launch
- [ ] Testing
- [ ] Release
```

---

## API Changes (routes.py)

### New Endpoint: POST `/api/projects/create-external`

**Request:**
```json
{
  "name": "My Cool Game",
  "parent_dir": "D:/Games",
  "description": "A platformer",
  "init_git": true
}
```

**Response (success):**
```json
{
  "id": "P002",
  "name": "My Cool Game",
  "path": "D:/Games/my-cool-game",
  "type": "external",
  "status": "active"
}
```

**Response (error):**
```json
{
  "error": "Parent directory does not exist"
}
```

---

## UI Changes (studio.html + studio-projects.js)

### Modal Updates

**Current "New Project" modal:**
- Project Name (text input)
- Project Folder Path (text input)
- Description (textarea)

**Updated modal - Add mode toggle:**

```
[Create New] [Link Existing]   ← Tab toggle at top

--- CREATE NEW MODE ---
Project Name: [______________]
Parent Directory: [__________] [Browse]
Description: [_______________]
☑ Initialize Git Repository

--- LINK EXISTING MODE ---
Project Name: [______________]
Project Folder Path: [_______]
Description: [_______________]
```

### Modal Dimensions

| Property | Value |
|----------|-------|
| Width | 480px |
| Tab height | 36px |
| Input spacing | 12px |

### Mode Toggle Styling

| Element | Active State | Inactive State |
|---------|-------------|----------------|
| Tab background | #3498db | transparent |
| Tab text | #fff | #888 |
| Tab border-radius | 4px | 4px |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Parent dir doesn't exist | Error: "Parent directory does not exist" |
| Folder already exists at target | Error: "Folder already exists: {path}" |
| Name contains special chars | Slugify: strip non-alphanumeric, lowercase, hyphenate |
| Empty name | Error: "Project name is required" |
| Git not installed | Skip git init, warn in response |
| Path already linked | Error: "Path already linked to project {id}" |
| legacy project (P001) | Still works, type defaults to "legacy" |

---

## Backward Compatibility

| Scenario | Handling |
|----------|----------|
| Existing projects.json entries | `type` defaults to `"legacy"` if missing |
| Old `create()` method | Kept unchanged for linking existing folders |
| P001 in projects/ folder | Works as-is (legacy type) |

---

## Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Create external project | Folder created at specified parent/slug path |
| Git initialized | `.git/` exists in new folder |
| Scaffold files exist | whitepaper.md, roadmap.md, assets/, .gitignore present |
| Project auto-linked | Appears in project list immediately |
| Legacy projects work | P001 loads and functions normally |
| Error messages clear | User knows exactly what went wrong |

---

## Implementation Order

1. **Backend** (projects.py)
   - Add `type` field to Project dataclass
   - Add `create_external()` method
   - Update `from_dict()` for backward compat

2. **API** (routes.py)
   - Add POST `/api/projects/create-external` endpoint

3. **Frontend** (studio.html + studio-projects.js)
   - Update modal with mode toggle
   - Add Create New mode form
   - Wire up to new endpoint

---

## Notes for Programmer

- Slug function: `re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')`
- Git init: `subprocess.run(['git', 'init'], cwd=project_path)`
- Check git exists: `shutil.which('git')` before attempting init
- Parent dir validation: `Path(parent_dir).is_dir()`
- **Tune after playtest:** Scaffold template content may need adjustment based on user feedback
