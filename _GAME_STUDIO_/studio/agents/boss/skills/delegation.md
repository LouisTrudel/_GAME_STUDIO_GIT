# Delegation

## Task Breakdown Pattern

For any game feature, identify:

```
1. DESIGN  → What are the rules/mechanics?
2. ART     → What does it look like?
3. CODE    → How does it work technically?
4. WRITING → What text/story is needed?
5. QA      → How do we verify it works?
```

## Example: "Add a shop system"

| Task | Agent | Dependencies |
|------|-------|--------------|
| Design shop mechanics, pricing, UI flow | Designer | None |
| Create shop UI mockups, item icons style | Artist | Design done |
| Implement shop backend, purchase logic | Programmer | Design done |
| Write item descriptions, shopkeeper dialogue | Writer | Design done |
| Test purchasing, edge cases, exploits | QA | Code done |

## Parallel vs Sequential

**Parallel** (no dependencies):
- Art and Writing can start after Design
- They don't need each other

**Sequential** (has dependencies):
- QA needs Code to be done
- Code needs Design to be done

## Task Description Template

```
[WHAT] Clear deliverable
[CONTEXT] Why this matters / how it fits
[CONSTRAINTS] Limits, requirements, style notes
```

Bad: "Make the shop"
Good: "Design shop mechanics: currency type, item categories, pricing tiers, refresh system. Output: bullet-point spec for programmer."
