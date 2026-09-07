# LangChain Prompt Engineering Synthesis Report

## Summary

LLMs exhibit strong position bias (U-shaped attention curve), making information placement critical. Place essential instructions at START and END of prompts. Use bullets for discrete items, prose for reasoning. Keep few-shot examples to 1-3. Target under 2000 tokens for role definitions—concise prompts often match verbose ones in quality.

## Key Findings

### 1. Critical Information Placement (The "Lost in the Middle" Effect)

**Finding:** LLMs weight information at the beginning and end of prompts more heavily than the middle. This mirrors human primacy/recency memory effects.

**Mechanism:** Attention weights spike at prompt extremes with a dip in the middle. Rotary Position Embedding (RoPE) introduces distance-based decay that naturally reduces attention to middle content.

**Application:**
- Place role identity and primary constraints at START
- Place action triggers and output format at END
- Middle section for context/examples (less critical content)

### 2. Bullet Points vs Prose

**Finding:** No absolute winner—match format to content type.

| Format | Best For |
|--------|----------|
| Bullets | Discrete rules, constraints, tool lists |
| Prose | Reasoning guidance, behavioral nuance |
| Hybrid | Complex prompts combining both |

**Key insight:** Explicitly state format preferences to the model. Well-organized content with clear headings enables faster LLM parsing.

### 3. Few-Shot Example Counts

**Finding:** 1-3 examples optimal for most use cases.

- More examples ≠ better results
- Each example increases token cost
- Too many examples can confuse rather than clarify
- Dynamic selection (choosing relevant examples per query) outperforms static inclusion

**LangChain Pattern:** Use `FewShotPromptTemplate` with semantic similarity to select examples dynamically rather than including all examples every time.

### 4. Token Budget Guidelines

**Target:** Under 2000 tokens for role definitions.

**Token Waste Sources:**
- Verbose instructions when concise ones suffice
- Repeated system prompts across conversation turns
- Overly detailed function descriptions
- Excessive few-shot examples

**Optimization Tactics:**
- "Summarize:" works as well as multi-sentence explanation
- Well-chosen examples convey requirements better than lengthy prose
- Compress conversation history (keep recent 500-1000 tokens vs full 5,000-10,000)
- Use context-aware compression for long dialogues

### 5. Prompt Structure Template

Based on LangChain and Anthropic patterns:

```
[START - HIGH ATTENTION ZONE]
- Role identity (who the agent is)
- Primary mission (single sentence)
- Hard constraints (non-negotiable rules)

[MIDDLE - LOWER ATTENTION ZONE]
- Context/background information
- Tool descriptions
- 1-3 examples (if needed)
- Reference material in XML tags

[END - HIGH ATTENTION ZONE]
- Output format specification
- Action trigger / task framing
- Final reminder of critical constraint
```

### 6. XML Tag Usage

Anthropic/LangChain consensus: Use XML tags to delineate sections.

```xml
<role>...</role>
<context>...</context>
<instructions>...</instructions>
<examples>...</examples>
<output_format>...</output_format>
<constraints>...</constraints>
```

Benefits: Clear parsing, better section attention, easier debugging.

## Analysis: Tradeoffs

| Decision | Benefit | Cost |
|----------|---------|------|
| Shorter prompts | Lower latency, lower cost | May lose nuance |
| More examples | Better pattern matching | Token overhead, potential confusion |
| Rigid structure | Consistency | Less flexibility |
| Dynamic examples | Relevance | Implementation complexity |

## Recommendations for role.md Files

1. **Restructure for position bias**
   - First 200 tokens: Role + mission + critical constraints
   - Last 100 tokens: Output expectations + action trigger
   - Middle: Tools, examples, context

2. **Convert prose to bullets where appropriate**
   - Tool lists → bullets
   - Hard rules → bullets
   - Behavioral guidance → keep as prose

3. **Limit to 1-3 inline examples**
   - Remove redundant examples
   - Make examples distinct (cover different cases)
   - Consider dynamic example injection if variety needed

4. **Target token budgets**
   - Role.md core: Under 1500 tokens
   - With examples: Under 2000 tokens
   - Audit with tokenizer to verify

5. **Add structural markers**
   - Use `##` headers for major sections
   - Use `**bold**` for critical terms
   - Consider XML tags for injected context

6. **End with action framing**
   - Final section should remind agent what to do
   - Leverage recency effect for compliance

## Sources

- [LangChain Prompt Templates Guide](https://latenode.com/blog/ai-frameworks-technical-infrastructure/langchain-setup-tools-agents-memory/langchain-prompt-templates-complete-guide-with-examples)
- [Lost in the Middle Research](https://dev.to/thousand_miles_ai/the-lost-in-the-middle-problem-why-llms-ignore-the-middle-of-your-context-window-3al2)
- [LLM Position Bias Analysis](https://intuitionlabs.ai/articles/llm-position-bias-primacy-recency-effects)
- [Anthropic Prompt Engineering](https://claude.com/blog/best-practices-for-prompt-engineering)
- [LangChain Few-Shot Prompting](https://www.langchain.com/blog/few-shot-prompting-to-improve-tool-calling-performance)
- [Token Optimization Guide](https://neuraltrust.ai/blog/ai-token-optimization-guide)
- [LangChain Hub](https://docs.smith.langchain.com/prompt_engineering/how_to_guides/prompts/langchain_hub)
