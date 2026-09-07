# LangChain Prompt Hub Patterns Research Report

## Summary

LangChain Hub provides **community-curated prompt templates** organized by use case (QA, RAG, summarization, agents). The most reusable patterns are: **ReAct loops** (Thought→Action→Observation), **context injection** (`{context}` + `{question}`), **source citation** (SOURCES block), and **XML/role structuring** (system/human/assistant). For Studio, the highest-value patterns to adopt are **explicit output format blocks** and **structured reasoning triggers**—patterns Claude specifically optimizes for.

## Key Findings

### 1. Hub Organization Structure

| Category | Directory | Use Case |
|----------|-----------|----------|
| `qa/` | Question-answering | Basic Q&A |
| `qa_with_sources/` | Q&A + citations | RAG with attribution |
| `summarize/` | Text summarization | stuff/map-reduce/refine |
| `conversation/` | Multi-turn chat | Memory-enabled dialogue |
| `llm_bash/` | Shell commands | Code execution |
| `sql_query/` | Database queries | Text-to-SQL |

Prompts stored in JSON/YAML, loaded via `hub.pull("owner/prompt-name")`.

### 2. Core Prompt Patterns

#### **ReAct Pattern** (hwchase17/react)
```
Answer the following questions as best you can. You have access to the following tools: {tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}
```

**Key pattern:** Explicit reasoning format with labeled steps. Stop token at "Observation:" prevents hallucination.

#### **RAG Pattern** (rlm/rag-prompt)
```
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

Question: {question}
Context: {context}
Answer:
```

**Key patterns:**
- Clear role assignment ("You are an assistant for...")
- Explicit constraint ("three sentences maximum")
- Fallback instruction ("If you don't know... say that you don't know")
- Context injection with labeled sections

#### **QA with Sources Pattern**
```
Given the following extracted parts of a long document and a question, create a final answer with references ("SOURCES").
If you don't know the answer, just say that you don't know. Don't try to make up an answer.

ALWAYS return a "SOURCES" part in your answer.

Question: {question}
=========
{summaries}
=========
FINAL ANSWER:
SOURCES:
```

**Key pattern:** Mandatory output structure with labeled sections.

#### **Summarization Patterns**

**Refine:**
```
Your job is to produce a final summary. We have provided an existing summary up to a certain point: {existing_answer}
We have the opportunity to refine the existing summary (only if needed) with some more context below.
------------
{text}
------------
Given the new context, refine the original summary. If the context isn't useful, return the original summary.
```

**Map-Reduce:**
- **Map phase:** Summarize each chunk independently
- **Reduce phase:** Combine chunk summaries into final

**Key pattern:** Iterative refinement with optional action ("only if needed").

### 3. Chat Prompt Structure

```python
ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that..."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])
```

**Pattern:** Role-based messages (system/human/assistant) with dynamic placeholders.

### 4. Reasoning Triggers

| Trigger | Effect | When to Use |
|---------|--------|-------------|
| "Let's think step by step" | Zero-shot CoT | Any reasoning task |
| "Break this down into steps" | Explicit decomposition | Multi-step problems |
| "Show your reasoning" | Audit trail | High-stakes decisions |
| `<thinking>` tags | Structured reasoning | Claude-optimized |

**Research finding:** Chain-of-thought lifts accuracy up to 61% over zero-shot baselines.

### 5. 2026 Patterns (Claude-Specific)

From Anthropic's prompt engineering guidance:

| Pattern | Example | Why It Works |
|---------|---------|--------------|
| **XML structuring** | `<context>...</context>` | Creates semantic boundaries |
| **Role as contract** | Detailed persona description | Claude interprets prompts as agreements |
| **Explicit constraints** | "Maximum 3 sentences" | Claude follows literally |
| **Fallback instructions** | "If unsure, say 'I don't know'" | Prevents hallucination |
| **Output schema** | JSON structure in prompt | Parseable responses |

### 6. Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Vague instructions | Inconsistent output | Explicit format block |
| No fallback | Hallucination when stuck | Add "if unsure" clause |
| Implicit roles | Model guesses intent | Explicit "You are..." |
| Mixed concerns | Confused output | Separate thinking from answer |

## Analysis

### What LangChain Hub Does Well

1. **Naming convention:** `owner/prompt-name` enables discoverability
2. **Versioning:** Fork → modify → republish
3. **Use-case organization:** Directory structure = taxonomy
4. **Community sharing:** Prompts rated by usage

### What's Missing from Hub

| Gap | Impact |
|-----|--------|
| No quality scoring | Hard to find best prompts |
| Unverified prompts | Variable quality |
| Limited Claude-specific | Most prompts OpenAI-tuned |
| No reasoning benchmarks | Can't compare effectiveness |

### Studio Skill Comparison

| LangChain Pattern | Studio Equivalent | Gap |
|-------------------|-------------------|-----|
| ReAct (Thought/Action/Observation) | BOSS task decomposition | No mid-task reasoning |
| RAG context injection | `[CONTEXT]` in task format | ✓ Similar |
| SOURCES block | Research reports have sources | ✓ Already implemented |
| ChatPromptTemplate roles | Router system messages | ✓ Similar |
| XML structuring | Markdown headers | Could adopt XML |

### Most Valuable Patterns for Studio

**Rank by applicability:**

1. **Output format blocks** (HIGH) — Skills should specify exact deliverable structure
2. **Reasoning triggers** (MEDIUM) — Add "Think through alternatives" for design/architecture skills
3. **Fallback instructions** (MEDIUM) — "If blocked, escalate to BOSS"
4. **Context injection labels** (LOW) — Already have `[CONTEXT]` structure
5. **XML tags** (LOW) — Markdown works fine, not worth migration

## Recommendations

### 1. Add Output Format Blocks to All Skills

**Current (implicit):**
```markdown
# Research Analyst
Investigate topics and produce reports.
```

**Improved (explicit):**
```markdown
# Research Analyst
Investigate topics and produce reports.

## Output Format
```markdown
## Summary
[2-3 sentence answer]

## Key Findings
- [Finding 1]
- [Finding 2]

## Recommendations
1. [Action 1]
2. [Action 2]
```
```

**Rationale:** LangChain's most successful prompts have explicit output structure. Claude follows format blocks literally.

### 2. Add Reasoning Triggers for Complex Skills

**Skills needing triggers:**
- `design/*` — "Consider 2-3 alternatives before recommending"
- `code/architecture/*` — "Think through tradeoffs"
- `research/*` — "Synthesize before concluding"

**Skills that don't need triggers:**
- Reference docs (Roblox API)
- Templates (task formats)
- Simple tools (file operations)

### 3. Add Fallback Instructions

**Current (none):**
```markdown
You complete implementation tasks.
```

**Improved:**
```markdown
You complete implementation tasks.

If blocked by missing context or unclear requirements:
1. Check CONTEXT.md for project patterns
2. Signal BOSS with specific question
3. Do not proceed with assumptions
```

### 4. Adopt SOURCES Pattern for Research

Already partially implemented. Formalize:

```markdown
## Sources
- [Title](URL) — why relevant
- [Title](URL) — why relevant
```

### 5. Skip These Patterns

| Pattern | Why Skip |
|---------|----------|
| ReAct loop format | Overkill for task-based system |
| Few-shot examples | Most skills are reference, not behavior |
| XML structuring | Markdown sufficient for current needs |
| Prompt versioning | Git versioning sufficient |

### 6. Create Skill Naming Convention

Adopt LangChain Hub style:

| Current | Proposed |
|---------|----------|
| `:code/roblox/collectibles` | `studio/code-roblox-collectibles` |
| `:design/economy` | `studio/design-economy` |

**Benefit:** Consistent naming enables future skill sharing/discovery.

---

## Pattern Quick Reference

### For Research Skills
```
You are [role]. [primary responsibility].

## You Do
- [action 1]
- [action 2]

## Output Format
## Summary
[answer]
## Findings
[evidence]
## Recommendations
[actions]
```

### For Design Skills
```
You are [role]. [primary responsibility].

Before recommending, consider 2-3 alternatives with tradeoffs.

## Output Format
[deliverable structure]
```

### For Implementation Skills
```
You are [role]. [primary responsibility].

If blocked: signal BOSS with specific question.

## Deliverable
[what gets produced]
```

---

**Sources:**
- [Prompt Engineering Patterns 2026: What Actually Works Now](https://groundy.com/articles/prompt-engineering-patterns-2026-what-actually-works/)
- [LangChain Hub](https://github.com/hwchase17/langchain-hub)
- [rlm/rag-prompt - LangSmith](https://smith.langchain.com/hub/rlm/rag-prompt)
- [hwchase17/react - LangSmith](https://smith.langchain.com/hub/hwchase17/react)
- [Prompt Engineering Best Practices for 2026 - Claude](https://claude.com/blog/best-practices-for-prompt-engineering)
- [Prompting Best Practices - Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [LangChain Prompts - Aurelio AI](https://www.aurelio.ai/learn/langchain-prompts)
- [Chain-of-Thought Prompting Elicits Reasoning](https://arxiv.org/pdf/2201.11903)
- [IBM: Prompt Chaining with LangChain](https://www.ibm.com/think/tutorials/prompt-chaining-langchain)
- [Summarization with LangChain](https://medium.com/@abonia/summarization-with-langchain-b3d83c030889)
- [LangSmith Prompt Hub Documentation](https://docs.smith.langchain.com/prompt_engineering/how_to_guides/prompts/langchain_hub)
- [LangChain Hub Announcement](https://www.langchain.com/blog/langchain-prompt-hub)
