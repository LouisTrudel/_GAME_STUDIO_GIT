# LLM Context Processing Research

**Purpose:** Foundation for AI-Context agent/skill design
**Scope:** How LLMs process context, what makes prompts effective

---

## 1. The "Lost in the Middle" Phenomenon

### Core Finding
LLM performance on retrieval tasks follows a **U-shaped curve**:
- **Highest accuracy:** Information at beginning or end
- **30%+ degradation:** Information positioned in the middle
- **Replicated across:** GPT-3.5-Turbo, GPT-4, Claude, LongChat, MPT, Cohere

### Architectural Cause
**RoPE (Rotary Position Embedding) long-term decay:**
- Reduced dot-product similarity between distant token pairs
- Systematically decreases attention weight on mid-context tokens
- "Attention sinks" - disproportionate attention to initial tokens regardless of salience

### The Mechanism
```
Position Effect Strength:
├── First 10% of context   → HIGH attention (primacy)
├── Middle 80% of context  → LOW attention (lost)
└── Last 10% of context    → HIGH attention (recency)

Mid-prompt rules lose 30-50% compliance rate
```

### Practical Implication
| Position | Use For |
|----------|---------|
| **Start** | Core identity, critical constraints, role definition |
| **Middle** | Reference data, examples, expandable context |
| **End** | Current task, immediate instructions, action triggers |

---

## 2. Structure Effects

### Bullets vs Prose

| Format | Performance | Best For |
|--------|-------------|----------|
| **Bullets** | Generally +15-20% adherence | Instructions, options, constraints |
| **Prose** | Better for narrative context | Background, rationale, relationships |
| **Tables** | Collapses at high instruction counts | Structured data comparisons |

**Key finding:** LLMs pretrained on bullet-rich datasets process bullet-point structures better than prose.

### Delimiters and Tags

```
Structured prompts with delimiters:
├── +15-20% section adherence
├── -25-35% content contamination
└── 99%+ output parsing reliability (vs 90-95% unstructured)
```

**Provider Preferences:**
| Provider | Preferred Format |
|----------|------------------|
| Claude (Anthropic) | XML tags throughout |
| GPT series (OpenAI) | Markdown-first |
| All major providers | XML tags for complex prompts |

**Hybrid approach (recommended):**
- Markdown for instructions
- XML tags to fence sections
- JSON for structured data inside sections

---

## 3. Examples vs Descriptions

### Research Findings

| Approach | Effectiveness | Diminishing Returns |
|----------|---------------|---------------------|
| Zero-shot (description only) | Baseline | N/A |
| One-shot | +Significant | N/A |
| Two-shot | +More significant | Starting |
| Three-shot | Peak performance | Yes |
| 4+ shots | Marginal gains | Strong plateau |

**Key insight:** 2-3 well-chosen examples outperform exhaustive descriptions.

### Example Quality Criteria
1. **Diverse:** Cover different edge cases
2. **Representative:** Match expected input distribution
3. **Canonical:** Show ideal output format
4. **Minimal:** Shortest example that demonstrates the pattern

---

## 4. Compression Strategies

### What Works

| Technique | Compression | Quality Loss | Use Case |
|-----------|-------------|--------------|----------|
| Relevance filtering | 20-40% | Low | Remove off-topic content |
| Semantic deduplication | 10-30% | None | Remove repeated concepts |
| Extractive summarization | 40-60% | Medium | Condense long documents |
| Token pruning (LLMLingua) | Up to 20x | 1.5% | Extreme compression |

### What to Keep vs Cut

**KEEP (High Signal):**
- Architectural decisions and constraints
- Unresolved bugs/issues
- Tool definitions and interfaces
- Current task context
- Identity/role statements

**CUT (Low Signal):**
- Verbose tool outputs (keep summaries)
- Redundant confirmations
- Historical context no longer relevant
- Boilerplate/template text
- Duplicate information

### Compression Architecture

```
Sub-Agent Pattern:
├── Main agent: Lean context window
├── Sub-agents: Focused tasks, clean windows
└── Return: Condensed summaries (1,000-2,000 tokens)

Persistent Memory Pattern:
├── NOTES.md / napkin.md: Curated runbook
├── Updated regularly during work
└── Survives context resets
```

---

## 5. Token Efficiency Patterns

### High Efficiency

| Pattern | Why It Works |
|---------|--------------|
| Terse identifiers over full descriptions | Models infer from context |
| File paths as handles | Dynamic retrieval vs preloading |
| Implicit conventions (naming, structure) | Reduces explicit instructions |
| Numbered references | Enables back-referencing |

### Low Efficiency (Avoid)

| Anti-Pattern | Better Alternative |
|--------------|-------------------|
| Repeating context each turn | Reference previous statements |
| Full file contents when path suffices | Use just-in-time retrieval |
| Exhaustive edge case lists | Canonical examples + principle |
| Verbose explanations | Terse constraints with examples |

### Token Budget Allocation (Recommended)

```
System Prompt:     15-25% (identity, constraints, tools)
Examples:          10-20% (2-3 canonical demonstrations)
Reference Data:    20-40% (retrieved context, files)
Conversation:      20-40% (recent history, current task)
Buffer:            10%    (model response space)
```

---

## 6. Anti-Patterns That Confuse LLMs

### Critical Anti-Patterns

| Anti-Pattern | Impact | Fix |
|--------------|--------|-----|
| **Overloaded prompts** | Divided attention, hallucinations | One prompt = one task |
| **Vague language** | Non-deterministic outputs | Specific, measurable criteria |
| **Ambiguous phrasing** | Misinterpretation | Test with multiple readings |
| **Poor examples** | Incorrect pattern matching | Curate high-quality examples |
| **Mid-prompt critical rules** | 30-50% ignored | Move to start or end |
| **Overlapping tool definitions** | Confusion on which to use | Distinct, non-overlapping purposes |

### Subtle Anti-Patterns

| Anti-Pattern | Why It Fails |
|--------------|--------------|
| Assuming shared context | Model doesn't have your mental model |
| Negation-heavy instructions | "Don't do X" harder than "Do Y" |
| Implicit output format | Produces inconsistent structures |
| Over-specifying obvious things | Wastes tokens, clutters signal |

---

## 7. Actionable Guidelines for role.md and skill.md

### Role File Structure

```markdown
## [Role Name]                              ← START: Identity (primacy)

[1-2 sentence identity statement]

## Critical Constraints                     ← START: Must-follow rules
- [Constraint 1]
- [Constraint 2]

## You Do / You Don't                       ← MIDDLE: Reference
[Scope boundaries]

## Output Format                            ← MIDDLE: Templates
[Canonical example]

## Current Task Trigger                     ← END: Action (recency)
[How tasks arrive, how to start]
```

### Skill File Structure

```markdown
## Skill: [Name]                            ← Identity

### When to Use                             ← Trigger conditions
[Clear activation criteria]

### Constraints                             ← Critical rules at top
| Param | Requirement |
|-------|-------------|

### Process                                 ← Steps (can be middle)
1. [Step]
2. [Step]

### Output Template                         ← END: Immediate action
[Exact format with example]
```

### Specific Recommendations

1. **Position critical constraints in first 10%**
   - Role identity, must-follow rules, scope boundaries

2. **Use bullets over prose for instructions**
   - +15-20% adherence rate

3. **Include 2-3 canonical examples**
   - More effective than exhaustive descriptions
   - Show input → output transformation

4. **Fence sections with XML or clear headers**
   - Prevents content contamination
   - Enables selective attention

5. **Put action triggers at the end**
   - Recency effect maximizes task compliance

6. **Keep files under 2000 tokens each**
   - Diminishing returns beyond this
   - Combine with just-in-time loading

7. **One file = one purpose**
   - Avoid multi-purpose documents
   - Sub-skills over monolithic skills

8. **Use terse, specific language**
   - "Output JSON" not "Please format your response as JSON"
   - Numbers over adjectives ("3 bullets" not "brief")

---

## 8. Research Sources

### Academic
- [Lost in the Middle: Context Crisis of LLMs](https://davidwsilva.substack.com/p/lost-in-the-middle-the-context-crisis)
- [Lost in the Middle: Emergent Property from Information Retrieval](https://arxiv.org/html/2510.10276v1)
- [LLM Position Bias: Primacy and Recency Effects](https://intuitionlabs.ai/articles/llm-position-bias-primacy-recency-effects)
- [Pause-Tuning for Long-Context Comprehension](https://arxiv.org/pdf/2502.20405)
- [Better Prompts, Better Usefulness: Structured Prompting Techniques](https://doi.org/10.3390/bdcc10070224)
- [Beyond Prompt Content: Content-Format Integrated Prompt Optimization](https://arxiv.org/pdf/2502.04295)
- [Context Compression Framework for Long-Sequence Language Modeling](https://arxiv.org/html/2509.09199v1)

### Practitioner
- [Anthropic: Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Claude's Context Engineering Secrets](https://01.me/en/2025/12/context-engineering-from-claude/)
- [OpenAI Prompt Engineering Guide](https://developers.openai.com/api/docs/guides/prompt-engineering)
- [Simon Willison: How I Use LLMs for Code](https://simonwillison.net/2025/Mar/11/using-llms-for-code/)
- [Few-Shot Prompting Guide](https://www.datacamp.com/tutorial/few-shot-prompting)

### Structure & Format
- [XML Tags for Clarity and Precision in LLMs](https://medium.com/@TechforHumans/effective-prompt-engineering-mastering-xml-tags-for-clarity-precision-and-security-in-llms-992cae203fdc)
- [Markdown vs XML in LLM Prompts](https://www.robertodiasduarte.com.br/en/markdown-vs-xml-em-prompts-para-llms-uma-analise-comparativa/)
- [Structuring Prompts: XML, Markdown, Delimiters](https://ai-tldr.dev/learn/prompt-engineering/prompting-basics/structure-prompts-xml-markdown/)
- [Bullet Lists vs Paragraphs: What LLMs Prefer](https://www.geekytech.co.uk/bullet-lists-vs-paragraphs-what-llms-prefer/)

### Anti-Patterns
- [10 Common LLM Prompt Mistakes](https://www.goinsight.ai/blog/llm-prompt-mistake/)
- [Prompt Engineering Anti-Patterns 2026](https://www.digitalapplied.com/blog/prompt-engineering-anti-patterns-10-mistakes-2026)
- [Patterns and Anti-Patterns for Building with LLMs](https://medium.com/marvelous-mlops/patterns-and-anti-patterns-for-building-with-llms-42ea9c2ddc90)

---

## Summary: The 10 Rules

| # | Rule | Impact |
|---|------|--------|
| 1 | Critical info at START and END, not middle | +30% retrieval |
| 2 | Bullets over prose for instructions | +15-20% adherence |
| 3 | 2-3 examples beat exhaustive descriptions | Higher accuracy, fewer tokens |
| 4 | XML/Markdown delimiters for sections | +25% contamination prevention |
| 5 | One prompt = one task | Reduces hallucination |
| 6 | Specific language over vague | Deterministic outputs |
| 7 | Terse identifiers, just-in-time data | 50-80% compression possible |
| 8 | Keep files under 2000 tokens | Diminishing returns beyond |
| 9 | Action triggers at END | Recency maximizes compliance |
| 10 | Test with multiple readings | Catches ambiguity |
