# LangChain Prompt Templates Research Report

## Summary

LangChain provides structured prompt templating with reasoning patterns like Chain-of-Thought ("Let's think step by step"), ReAct (interleaved reasoning + tool use), and Few-Shot examples. Key patterns applicable to Studio skills: **instruction clarity**, **output format enforcement**, **example-driven learning**, and **source citation requirements**.

## Key Findings

### 1. Reasoning Trigger Phrases
| Pattern | Phrase | Effect |
|---------|--------|--------|
| Zero-shot CoT | "Let's think step by step" | Decomposes complex problems |
| Thread-of-Thought | "Walk me through...in manageable parts" | Contextual summarization |
| Tab-CoT | "Format as markdown table" | Structured tabular reasoning |
| Step-Back | Ask high-level question first | Grounds reasoning in concepts |

### 2. Output Format Enforcement
LangChain enforces structure through:
- **Explicit format instructions**: "ALWAYS return a 'SOURCES' part"
- **Response schemas**: Pydantic models for validation
- **Output parsers**: `JsonOutputParser`, `StrOutputParser`

Example QA prompt pattern:
```
Answer based on context. If you can't answer, say "I don't know."
QUESTION: {question}
CONTEXT: {context}
FINAL ANSWER:
SOURCES:
```

### 3. Few-Shot Demonstration Structure
```python
FewShotPromptTemplate(
    examples=[{"question": "...", "answer": "..."}],
    example_prompt=example_template,
    suffix="Question: {input}",
    prefix="Answer questions like the examples below."
)
```
- Show 2-5 examples of desired behavior
- Use `SemanticSimilarityExampleSelector` for dynamic selection

### 4. Template Anatomy
```
[ROLE/CONTEXT] - Who you are, what you know
[INSTRUCTIONS] - What to do, constraints
[FORMAT] - How to structure output
[EXAMPLES] - Few-shot demonstrations (optional)
[INPUT] - Dynamic variables
```

### 5. Contrasts with Studio Skills

| LangChain Pattern | Studio Equivalent | Gap |
|-------------------|-------------------|-----|
| `{variable}` placeholders | Static markdown | No dynamic injection |
| Output parsers | Manual parsing | Could add format enforcement |
| Few-shot examples | Inline patterns | Could formalize examples section |
| Chain composition | Single skill load | Skills are atomic |

## Analysis

**What LangChain does well:**
1. **Enforced structure** - Output parsers guarantee format
2. **Dynamic selection** - Example selectors pick relevant few-shots
3. **Composability** - Templates chain into larger workflows

**What Studio skills do differently:**
1. Skills are domain-loaded markdown (simpler, more readable)
2. No runtime validation (trust agent compliance)
3. Task structure uses `[WHAT]/[CONTEXT]/[CONSTRAINTS]` pattern

**Applicable patterns:**
- Adding "Let's think step by step" to complex reasoning skills
- Requiring `## Sources` section for research outputs (already implied in research-router)
- Adding explicit output format blocks to skills
- Including 1-2 examples in complex skills

## Recommendations

1. **Add reasoning triggers to complex skills**
   - Designer/Taxonomy skills: Add "Think through alternatives before recommending"
   - Research skills: Already uses structured output; add "Walk through your analysis"

2. **Formalize output format sections**
   - Add `## Output Format` block to skills that need structured responses
   - Use explicit markers: "MUST include", "ALWAYS return"

3. **Consider few-shot examples for ambiguous skills**
   - Skills like `:code/economy` could include one good/bad example
   - Keep examples minimal (1-2 max) to avoid bloat

4. **Skip output parsers**
   - Studio uses natural language compliance, not programmatic parsing
   - Overhead not worth it for markdown-based system

5. **Adopt source citation pattern**
   - Research outputs should require `## Sources` section
   - Already partially implemented; make explicit

---

**Sources:**
- [LangChain Hub Prompts](https://github.com/hwchase17/langchain-hub/blob/master/prompts/README.md)
- [Chain-of-Thought Prompting Guide](https://www.datacamp.com/tutorial/chain-of-thought-prompting)
- [Zero-Shot CoT: "Let's Think Step by Step"](https://medium.com/@gangelin/lets-think-step-by-step-zero-shot-chain-of-thought-zero-shot-cot-reasoning-in-large-language-2dfd21315d19)
- [FewShotPromptTemplate Guide](https://medium.com/ai-engineering-bootcamp/a-beginners-guide-to-few-shot-prompting-in-langchain-5d9f17b26745)
- [LangChain Structured Output Tricks](https://medium.com/@ThinkingLoop/7-langchain-structured-output-tricks-a5144f4ec097)
- [QA with Sources Pattern](https://nakamasato.medium.com/enhancing-langchains-retrievalqa-for-real-source-links-53713c7d802a)
- [Prompt Template Format Guide](https://docs.langchain.com/langsmith/prompt-template-format)
