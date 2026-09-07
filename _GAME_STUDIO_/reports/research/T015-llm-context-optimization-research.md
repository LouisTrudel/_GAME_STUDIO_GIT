# LLM Context Optimization Research Report

## Executive Summary

This report synthesizes academic research and practitioner insights on how LLMs process context and what makes prompts effective. The findings directly inform how we should structure our `role.md` and `skill.md` files.

**Key Takeaway:** LLMs process context differently than humans read documentation. A 10-line table can outperform a 500-word explanation. Position matters critically—information in the middle of long contexts is often ignored.

---

## 1. The "Lost in the Middle" Phenomenon

### What It Is
LLMs exhibit a U-shaped attention curve: they attend strongly to the **beginning** and **end** of context, but drop 30-50% accuracy for information buried in the middle.

### Root Cause
- **Rotary Position Embeddings (RoPE)** in transformer architectures introduce distance decay
- Attention between tokens weakens as distance increases
- This mirrors human primacy/recency effects in memory

### 2025 Research Update
Recent research suggests this isn't pure information loss—it emerges from how retrieval tasks were structured in training data. However, the practical effect remains: **mid-context rules lose 30-50% compliance**.

### Actionable Guidelines

| Position | Effectiveness | Use For |
|----------|---------------|---------|
| Start (first 20%) | ~73% compliance | Core identity, critical rules, non-negotiables |
| Middle | ~40-50% compliance | Supporting details, edge cases |
| End (last 10-15%) | High attention | Key reminders, output format, final constraints |

**For our files:** Put the most critical instructions at the START. Use the END for format requirements and key reminders. Bury optional/secondary guidance in the middle.

---

## 2. Structure Effects: Bullets vs Prose vs Tables

### Research Findings

| Format | Effectiveness | Why |
|--------|---------------|-----|
| Bullet points | High | LLMs trained on bullet-heavy corpora; parallel structure aids parsing |
| Tables | High | Clear relationships, scannable, token-efficient |
| Structured headings | High | Clear semantic boundaries |
| Flowing prose | Lower | Harder to extract specific rules; key points get buried |
| JSON/XML | High for Claude | Claude specifically trained on XML tag structures |

### Specific Evidence
- Bullet points generally outperform plain descriptions
- Parallel sentence construction helps models understand relationships between list items
- External information should be placed **before** tables, not after
- Clearly-defined, well-formatted task descriptions are consistently more effective

### Actionable Guidelines

**DO:**
```markdown
## Deliverables
- Mechanic specifications (not code)
- Systems with numbers, formulas
- Player flow diagrams
```

**DON'T:**
```markdown
Your deliverables include mechanic specifications, which should not be code, as well as systems that include numbers and formulas for balance purposes. You may also create player flow diagrams when appropriate.
```

**For our files:** Use bullets for rules and constraints. Use tables for reference information (e.g., skill routing tables). Reserve prose only for conceptual explanations that require nuance.

---

## 3. XML Tags (Claude-Specific)

### Why XML Works for Claude
- Claude was heavily trained on XML-structured content
- XML tags help Claude parse complex prompts unambiguously
- Internal testing shows 20-40% more consistent outputs vs unstructured equivalents

### When to Use
- When mixing instructions, context, examples, and variable inputs
- When you need consistent output formatting
- When prompt has multiple distinct sections

### Common Tags
```xml
<instructions>Core directives</instructions>
<context>Background information</context>
<example>Input/output demonstrations</example>
<constraints>Boundaries and limits</constraints>
<output_format>Expected structure</output_format>
```

### Actionable Guidelines
**For our files:** Consider XML tags for complex skills that mix multiple content types. For simple role definitions, markdown headers with bullets may be sufficient and more readable.

---

## 4. Position Effects: Where to Put What

### The Hierarchy

1. **System prompt** - Highest authority, defines identity and non-negotiables
2. **Start of context** - High attention weight (primacy)
3. **End of context** - High attention weight (recency)
4. **Middle of context** - Lowest attention, most likely to be ignored

### Practical Impact
- Information at the beginning: ~73% correctly used
- Mid-prompt rules: 30-50% compliance loss
- Final instructions: High reliability (but vulnerable to adversarial inputs)

### Actionable Guidelines

**For role.md files:**
```
[START]
- Agent identity (who you are)
- Core capabilities (what you do)
- Primary constraints (what you never do)

[MIDDLE]
- Detailed workflows
- Edge case handling
- Secondary guidance

[END]
- Output format requirements
- Quality checklist
- Key reminders
```

---

## 5. Examples vs Descriptions

### Research Consensus
**Few-shot examples consistently outperform zero-shot descriptions.**

| Approach | Performance | Best For |
|----------|-------------|----------|
| Zero-shot (description only) | Baseline | Simple, well-understood tasks |
| One-shot (1 example) | +15-25% | Format demonstration |
| Few-shot (2-3 examples) | +25-40% | Complex or ambiguous tasks |
| Many-shot (4+) | Diminishing returns | Only when format is highly specific |

### Key Finding
3 examples is often optimal. Returns diminish after 2-3 examples. One good example teaches better than three paragraphs of explanation.

### Actionable Guidelines

**DO:**
```markdown
## Output Format
<example>
## [Feature Name]
### Core Mechanic
What the player does, what happens
### Numbers
- Specific values, formulas
</example>
```

**DON'T:**
```markdown
Your output should be structured with a feature name as a heading, followed by sections describing the core mechanic in prose form, then numerical specifications...
```

**For our files:** Every skill should include at least one concrete example of expected output. Examples are worth their token weight.

---

## 6. Token Efficiency & Compression

### Key Principles

| Technique | Compression | Quality Impact |
|-----------|-------------|----------------|
| Remove redundancy | High | Neutral to positive |
| Delete filler words | Medium | Neutral |
| Use tables over prose | High | Often positive |
| Truncate examples | Medium | Potentially negative |
| Remove structure | Low | Negative |

### Research-Backed Strategies
- **Semantic chunking** over arbitrary truncation
- **Keywords first** - lead with them
- **Structured output formats** perform as well as verbose alternatives
- One study achieved **57% token reduction with 8.8% accuracy improvement**

### What to Cut
- Redundant restatements of the same rule
- Filler phrases ("It's important to note that...")
- Excessive politeness ("Please kindly ensure...")
- Obvious implications

### What to Keep
- Specific numbers and thresholds
- Concrete examples
- Structural markers (headers, bullets)
- Edge case handling

### Actionable Guidelines
**For our files:** Audit for redundancy. If a rule is stated twice, delete one instance. Convert prose explanations to bullet points. Replace "You should always make sure to..." with direct imperatives.

---

## 7. Anti-Patterns That Confuse LLMs

### Documented Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Vague language ("make it better") | Non-deterministic outputs | Specify criteria ("increase contrast by 20%") |
| Too many nested conditions | Steps get missed | Flatten logic, use numbered lists |
| Conversational tone for technical tasks | Model prioritizes "helpful" over "accurate" | Use direct, precise language |
| Contradictory instructions | Unpredictable behavior | Audit for conflicts |
| Ambiguous pronouns | Reference confusion | Use explicit nouns |
| Overly long single instructions | Partial execution | Break into atomic steps |

### Specific Examples

**ANTI-PATTERN:**
```markdown
Try to make the combat feel good and make sure it's balanced while also being fun for different player types, but don't make it too complicated.
```

**FIXED:**
```markdown
Combat requirements:
- Time-to-kill: 2-4 hits
- Damage variance: ±10%
- Attack startup: 0.2-0.4s (readable by players)
```

### Actionable Guidelines
**For our files:** Be specific. Use numbers. Avoid subjective adjectives without criteria. Each instruction should be independently actionable.

---

## 8. Chain-of-Thought & Reasoning

### When It Helps
- Math and arithmetic: +30-61% improvement
- Symbolic reasoning: Significant gains
- Complex multi-step problems: Moderate gains

### When It Doesn't Help
- Simple factual recall
- Single-step tasks
- Models under ~100B parameters (smaller models produce illogical chains)

### Practical Application
Adding "Let's think step by step" or "Work through this systematically" can improve complex reasoning tasks. However, this is more relevant to user prompts than system prompts.

### Actionable Guidelines
**For our skill files:** For complex analytical tasks, include prompts that encourage step-by-step reasoning. For simple execution tasks, skip it.

---

## 9. Context Engineering (vs Prompt Engineering)

### The Concept
Simon Willison and others advocate for "context engineering" over "prompt engineering" because it better captures the full scope:

> "The delicate art and science of filling the context window with just the right information for the next step."

### What Context Engineering Includes
- Task descriptions and explanations
- Few-shot examples
- Retrieved context (RAG)
- Multimodal data
- Tools, state, and history
- Context compacting

### Actionable Guidelines
**For our system:** Think of each agent's context as a carefully curated package. Everything in the context window should earn its place. The question isn't "what can we say?" but "what does the agent need to succeed at this specific task?"

---

## 10. Consolidated Guidelines for Our Files

### role.md Structure
```markdown
# [Role Name]

[1-2 sentence identity statement]

## You Do
- [Primary capability 1]
- [Primary capability 2]

## You Don't
- [Clear boundary 1]
- [Clear boundary 2]

## Workflow
1. [Step 1]
2. [Step 2]

## Output Format
<example>
[Concrete example of expected output]
</example>

## Quality Checklist
- [ ] [Verification 1]
- [ ] [Verification 2]
```

### skill.md Structure
```markdown
# [Skill Name]

## When to Use
[One sentence trigger condition]

## Context
[Minimal background - 2-3 sentences max]

## Instructions
1. [Atomic step 1]
2. [Atomic step 2]

## Example
<example>
[Input] → [Output]
</example>

## Constraints
- [Specific limit with number]
- [Clear boundary]
```

### Token Budget Guidelines

| Element | Recommended Tokens | Notes |
|---------|-------------------|-------|
| Role identity | 50-100 | Keep tight |
| Primary instructions | 200-400 | Bullets, not prose |
| Examples | 100-300 each | Worth the cost |
| Edge cases | 100-200 | Middle of doc OK |
| Output format | 50-150 | End of doc |
| **Total per role** | **500-1000** | Audit if exceeding |

---

## Sources

### Academic Research
- [Lost in the Middle: An Emergent Property from Information Retrieval Demands in LLMs](https://arxiv.org/abs/2510.10276)
- [Lost in the Middle LLM: The U-Shaped Attention Problem Explained](https://www.morphllm.com/lost-in-the-middle-llm)
- [Beyond Prompt Content: Enhancing LLM Performance via Content-Format Integrated Prompt Optimization](https://arxiv.org/html/2502.04295v3)
- [LLM Position Bias: Primacy and Recency Effects in Prompts](https://intuitionlabs.ai/articles/llm-position-bias-primacy-recency-effects)

### Practitioner Resources
- [Context Engineering - Simon Willison](https://simonwillison.net/2025/jun/27/context-engineering/)
- [Prompt Engineering Best Practices 2026 - Anthropic](https://claude.com/blog/best-practices-for-prompt-engineering)
- [OpenAI Prompt Engineering Guide](https://developers.openai.com/api/docs/guides/prompt-engineering)
- [Using XML Tags in Claude Prompts](https://prompt-architects.com/blog/163-using-xml-tags-in-claude-prompts-with-examples)

### Compression & Efficiency
- [Prompt Compression Techniques - Medium](https://medium.com/@kuldeep.paul08/prompt-compression-techniques-reducing-context-window-costs-while-improving-llm-performance-afec1e8f1003)
- [LLM Token Optimization - Redis](https://redis.io/blog/llm-token-optimization-speed-up-apps/)
- [Few-Shot Prompting - DataCamp](https://www.datacamp.com/tutorial/few-shot-prompting)

### Anti-Patterns & Best Practices
- [Common LLM Prompt Mistakes](https://www.goinsight.ai/blog/llm-prompt-mistake/)
- [Chain-of-Thought Prompting - DataCamp](https://www.datacamp.com/tutorial/chain-of-thought-prompting)
- [System Prompts vs User Prompts](https://blog.promptlayer.com/system-prompt-vs-user-prompt-a-comprehensive-guide-for-ai-prompts/)
