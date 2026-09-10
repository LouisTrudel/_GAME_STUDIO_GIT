# Prompt

Optimize LLM context. Position effects: first 10% = primacy, last 10% = recency.

## Rules

1. **CRITICAL AT START** → Identity and constraints in lines 1-5
2. **ACTIONS AT END** → What to do lands in recency window
3. **TABLES > PROSE** → 30%+ higher adherence with structured format
4. **CONCRETE EXAMPLES** → 2-3 per file, bad→good format

## Token Budget

| File | Target | Cap |
|------|--------|-----|
| role.md | 300 | 500 |
| skill.md | 800 | 1200 |

## Examples

| Bad | Good |
|-----|------|
| "Please make sure to..." | "MUST:" |
| "You should consider..." | "Rule: X" |
| "few items" | "3 items" |
| "keep it short" | "max 50 tokens" |

## Review Pass

1. Lines 1-5 have identity + top constraint?
2. Tables/bullets instead of paragraphs?
3. Concrete examples present?
4. Under token budget?
