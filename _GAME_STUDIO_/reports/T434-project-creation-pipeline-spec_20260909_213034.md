# Project Creation Pipeline - Design Spec

**Task:** T434  
**Date:** 2026-09-09  
**Priority:** UX-first, accuracy second

---

## User Questions - Answers

### 1. Did I miss something?
**Yes, 3 items:**
- **Dependency installation step** → Add explicit "Setup Complete" checkpoint before BOSS dispatch
- **Rollback/abandon** → What if user gives up mid-clarify? Need "Cancel" that cleans up partial state
- **Quality score persistence** → Star ratings should save to whitepaper metadata for future reference

### 2. Is this dumb?
**No.** This is a solid UX-first funnel. The clarify loop is the right pattern—iterative refinement beats single-shot prompts. The star rating injection is clever: it gives the AI a clear target and gives the user a legible quality signal.

### 3. What should be changed/added/removed?

**Change:**
- Step 1 fields → Make Type/Subtype/Engine **suggestion chips** not dropdowns. User types freely, AI autocompletes. Reduces friction.
- Star threshold → Change from "reaches quality threshold" to "user can approve at any rating but sees warning < 4 stars"

**Add:**
- **Warmup context fetch** in Step 3 → AI does 1 search (Roblox docs, Steam requirements, etc.) before generating whitepaper. 10 seconds extra, 50% better output.
- **Estimated cost preview** → After whitepaper approval, show "This will use ~X tokens across Y phases" before BOSS dispatch

**Remove:**
- Nothing. All steps serve a purpose.

### 4. Could this happen in Project tab directly?
**Yes, with a dedicated Project Chat panel.**
- Split Project Details into two panes: Whitepaper (left), Chat (right)
- Chat agent: single-purpose AI that only edits whitepaper
- Removes context-switching to Hub

---

## Refined Pipeline Spec

### Overview

| Phase | Location | Duration | Tokens |
|-------|----------|----------|--------|
| Setup | Project Tab | 30s | 0 |
| Draft | Project Tab Chat | 60s | 2K-5K |
| Clarify | Project Tab Chat | 2-10 min | 5K-15K |
| Dispatch | Hub | Variable | Variable |
| Delivery | Hub | Variable | Variable |

---

### PHASE 1: SETUP (Project Tab Modal)

**Trigger:** User clicks "+ New Project" → modal appears

**UI Layout:**
```
┌─────────────────────────────────────────────┐
│ New Project                                 │
├─────────────────────────────────────────────┤
│ Name: [________________________]            │
│ Parent Dir: [__________________] [Browse]   │
│                                             │
│ Type: [Game] [Website] [Research] [+]       │
│       ↑ chips, click to select              │
│                                             │
│ Subtype: [____________] (optional)          │
│          e.g., "platformer", "RPG"          │
│                                             │
│ Engine: [____________] (optional)           │
│         e.g., "Godot", "Three.js"           │
│                                             │
│ ☑ Initialize Git Repository                │
│                                             │
│ [Create Blank]        [Create with AI]      │
└─────────────────────────────────────────────┘
```

**Dimensions:**

| Element | Value |
|---------|-------|
| Modal width | 500px |
| Modal padding | 24px |
| Type chips height | 32px |
| Type chips spacing | 8px |
| Input height | 36px |
| Button height | 40px |

**Outputs:**

| Path | Outcome |
|------|---------|
| "Create Blank" | Creates folder + git + empty whitepaper.md → goes to Project Details |
| "Create with AI" | Creates folder + git + opens Project Chat for whitepaper generation |

---

### PHASE 2: DRAFT (Project Tab Chat)

**Trigger:** User clicked "Create with AI"

**UI Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Project: My Platformer                              [Close] │
├─────────────────────┬───────────────────────────────────────┤
│ whitepaper.md       │ Project Chat                          │
│ ─────────────────── │ ─────────────────────────────────────  │
│ # My Platformer     │ ┌───────────────────────────────────┐ │
│                     │ │ Tell me about your project...     │ │
│ ## Vision           │ │                                   │ │
│ [AI fills this]     │ │ > im making a platformer for      │ │
│                     │ │ > steam, want it to feel like     │ │
│ ## Core Loop        │ │ > celeste but with grappling hook │ │
│ [AI fills this]     │ │                                   │ │
│                     │ │ [WHITEPAPER UPDATED - v1]         │ │
│ ...                 │ │ Rating: ★★★☆☆ (3/5)              │ │
│                     │ │ Missing: art direction, scope     │ │
│                     │ │                                   │ │
│                     │ │ [Your message________________]    │ │
│                     │ └───────────────────────────────────┘ │
│ [Approve ★★★]       │ [Cancel Project]                      │
└─────────────────────┴───────────────────────────────────────┘
```

**Panel Dimensions:**

| Element | Value |
|---------|-------|
| Whitepaper pane | 40% width |
| Chat pane | 60% width |
| Min height | 500px |
| Chat input height | 40px |
| Star rating font | 16px |

**Agent Behavior:**

| Input | Agent Action |
|-------|--------------|
| First message | 1. Fetch 1 external doc (engine docs, platform requirements). 2. Generate whitepaper draft. 3. Return with star rating. |
| Subsequent message | Update whitepaper sections based on input. Re-rate. |
| No message 30s | No action. Wait for user. |

**Star Rating Prompt (injected to agent):**
```
After updating whitepaper, rate it 1-5 stars:
1 = Placeholder only, unusable
2 = Missing critical sections
3 = Workable but vague
4 = Clear enough to build
5 = Production-ready spec

Output format: "Rating: ★★★★☆ (4/5)\nMissing: [list gaps]"
```

---

### PHASE 3: CLARIFY LOOP

**Loop Condition:** User keeps sending messages

**Exit Conditions:**

| Condition | Result |
|-----------|--------|
| User clicks "Approve" | Proceed to Dispatch |
| User clicks "Cancel Project" | Delete folder, remove from projects.json |
| Rating hits 5 stars | Show "Ready for dispatch!" but still require user click |

**Approval Warning:**
```
Rating: ★★☆☆☆ (2/5)
⚠ Low rating may cause implementation issues.
[Approve Anyway] [Keep Refining]
```

---

### PHASE 4: DISPATCH (Hub)

**Trigger:** User approved whitepaper

**Cost Preview Modal:**
```
┌────────────────────────────────────────┐
│ Ready to Dispatch                      │
├────────────────────────────────────────┤
│ Whitepaper: My Platformer (★★★★☆)     │
│                                        │
│ Estimated phases: 4                    │
│ Estimated tokens: ~25,000              │
│ Estimated agents: Designer, Programmer │
│                                        │
│ [Cancel]              [Start Dispatch] │
└────────────────────────────────────────┘
```

**BOSS Receives:**
```
PROJECT: {project_id}
WHITEPAPER: {path_to_whitepaper}
RATING: {star_rating}

Decompose into phases. For each phase:
1. Group similar work (all Designer tasks together, etc.)
2. Create tasks with dependencies
3. Assign to appropriate agents
4. Include QA checkpoint at phase end

Balance: minimize token usage, maximize parallelism.
```

---

### PHASE 5: DELIVERY

**Trigger:** All phases complete + QA pass

**Actions:**
1. Update whitepaper with "## Delivery Log" section
2. Mark project status = "delivered"
3. Show completion notification in Hub

---

## Data Model Changes

### projects.json - New fields

```json
{
  "id": "P003",
  "name": "My Platformer",
  "path": "D:/Games/my-platformer",
  "type": "external",
  "status": "active",
  "pipeline_state": "draft",    // NEW: setup|draft|clarify|dispatch|delivered
  "whitepaper_rating": 4,       // NEW: 1-5 star rating
  "metadata": {                 // NEW: optional setup fields
    "project_type": "game",
    "subtype": "platformer",
    "engine": "godot"
  }
}
```

**Pipeline States:**

| State | Meaning |
|-------|---------|
| `setup` | Folder created, no whitepaper |
| `draft` | Whitepaper in progress |
| `clarify` | Refining with user |
| `dispatch` | BOSS decomposing |
| `delivered` | Complete |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User closes browser mid-draft | Preserve state in projects.json, resume on reopen |
| AI fails to generate whitepaper | Show error, offer retry or manual edit |
| Whitepaper file deleted externally | Show warning, offer re-scaffold |
| User edits whitepaper manually during chat | Detect on focus, re-read and continue |
| Git not installed | Skip git init, warn but continue |
| Empty user description | AI prompts with guided questions |

---

## Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Pipeline completion | User can go from "+ New" to dispatch in < 5 min |
| Whitepaper quality | 80% of dispatched whitepapers rated 4+ stars |
| UX friction | < 3 clicks to start drafting |
| Error recovery | All error states have clear next action |
| Backward compat | Existing projects (P001) unaffected |

---

## Implementation Order

1. **UI** (studio.html, studio-projects.js)
   - Add Type/Subtype/Engine fields to modal
   - Add "Create with AI" button
   - Add Project Chat panel

2. **Backend** (projects.py)
   - Add `pipeline_state`, `whitepaper_rating`, `metadata` fields
   - Add state transition methods

3. **Agent** (new: project_chat_agent)
   - Single-purpose agent for whitepaper drafting
   - Star rating prompt injection
   - Warmup web search before first draft

4. **API** (routes.py)
   - POST `/api/projects/{id}/chat` - send message to project agent
   - GET `/api/projects/{id}/chat-history` - retrieve chat
   - POST `/api/projects/{id}/approve` - trigger dispatch

5. **Integration**
   - Connect approved whitepaper to BOSS dispatch
   - Add cost estimation before dispatch

---

## Notes

- **Tune after playtest:** Star rating prompt wording may need adjustment based on actual AI behavior
- **Future expansion:** Could add template library (Roblox Obby template, Unity FPS template, etc.)
- **Token budget:** Project Chat agent should use haiku/flash for speed; only BOSS dispatch uses full context
