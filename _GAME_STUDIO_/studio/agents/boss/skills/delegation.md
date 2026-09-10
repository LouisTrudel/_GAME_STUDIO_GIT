# Delegation

## Task Breakdown Pattern

For any game feature, identify:

```
1. Design   → What are the rules/mechanics?
2. ArtSpec  → What does it look like?
3. Code     → How does it work technically?
4. Text     → What text/story is needed?
5. Audit    → How do we verify it works?
```

## Example: "Add a shop system"

| Task | Agent | Dependencies |
|------|-------|--------------|
| Design shop mechanics, pricing, UI flow | Design | None |
| Create shop UI mockups, item icons style | ArtSpec | Design done |
| Implement shop backend, purchase logic | Code | Design done |
| Write item descriptions, shopkeeper dialogue | Text | Design done |
| Test purchasing, edge cases, exploits | Audit | Code done |

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
