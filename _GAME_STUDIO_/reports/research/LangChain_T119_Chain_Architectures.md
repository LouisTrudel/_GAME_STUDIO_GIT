# LangChain Chain Architectures Research Report

## Key Findings

### 1. The Four Document Processing Strategies

| Strategy | How It Works | When to Use | Tradeoffs |
|----------|--------------|-------------|-----------|
| **Stuff** | Concatenate all docs into one prompt | Small docs, fits context window | Cheapest, most coherent; limited by context length |
| **Map-Reduce** | Process each doc in parallel → combine results | Large docs, independent chunks | Scales well; loses cross-doc context |
| **Refine** | Iteratively update answer with each new doc | Order matters, incremental synthesis | Best quality; slowest (sequential calls) |
| **Map-Rerank** | Score each doc's answer → return highest | Single best answer needed | Good for QA; can't combine info across docs |

### 2. Modern LCEL Composition

LangChain v0.3+ uses **Runnables** with pipe operators:

```python
# Sequential: output of one → input of next
chain = prompt | llm | parser

# Parallel: same input to multiple runnables
chain = RunnableParallel({
    "summary": summarize_chain,
    "entities": extract_chain
})
```

**Key patterns:**
- `|` (pipe) = RunnableSequence (sequential)
- `{}` (dict) = RunnableParallel (parallel branches)
- Streaming, batching, async built-in

### 3. Multi-Step Decomposition Pattern

**Summarize → Extract → Synthesize pipeline:**

```
[Documents]
    → Summarize (reduce to key points)
    → Extract (pull structured data)
    → Synthesize (combine into final output)
```

Each step is a separate chain with explicit input/output mapping.

### 4. When to Use Each Strategy

| Scenario | Best Strategy |
|----------|---------------|
| Fits in context window | Stuff (80% of cases with modern LLMs) |
| Huge docs, independent chunks | Map-Reduce |
| Order/narrative matters | Refine |
| Find single best answer | Map-Rerank |
| Need both summary AND entities | RunnableParallel |

## Comparison to Studio Architecture

| LangChain Pattern | Studio Equivalent | Gap |
|-------------------|-------------------|-----|
| **Map-Reduce** | BOSS → parallel worker tasks | ✓ Similar—BOSS decomposes, workers execute |
| **Refine** | None | ❌ No iterative refinement loop |
| **RunnableSequence** | Task dependencies | ✓ Similar—`blocked_by` creates sequences |
| **RunnableParallel** | Multiple agents same priority | ✓ Similar—parallel task execution |
| **Stuff** | Single agent task | ✓ Direct—one agent gets full context |
| **Map-Rerank** | QA review? | ⚠️ Partial—QA reviews but doesn't score/rank |

### Studio's Current Flow (from `studio.md`)
```
User Request
    → BOSS decomposes into tasks
    → Workers execute in parallel (Map)
    → Results stored in task.output_response
    → [No explicit reduce/synthesize step]
```

**Missing:** After workers complete parallel tasks, there's no automatic **synthesis step** to combine results.

## Analysis

### What LangChain Does Well

1. **Explicit composition** — Chain types clearly signal intent (map-reduce vs refine)
2. **Built-in reduce step** — Map-Reduce automatically combines parallel outputs
3. **Scoring/ranking** — Map-Rerank selects best answer objectively
4. **Streaming through chains** — Output streams through entire pipeline

### What Studio Does Differently

1. **Human-in-the-loop reduce** — BOSS or user manually synthesizes worker outputs
2. **No explicit scoring** — QA uses judgment, not numeric confidence
3. **Stateless agents** — Each task is independent; no iterative refinement
4. **Task dependencies** — Explicit `blocked_by` rather than chain composition

### Key Insight

Studio's BOSS→workers pattern is **Map without automatic Reduce**. When Designer, Programmer, and QA complete parallel tasks, someone must manually synthesize. LangChain automates this with a reduce chain.

## Recommendations

### 1. Add Explicit Synthesis Task Pattern

When BOSS creates parallel tasks, automatically create a blocked "synthesis" task:

```
T101: [WHAT] Design economy system → Designer
T102: [WHAT] Design inventory system → Designer
T103: [WHAT] Synthesize economy+inventory decisions [CONTEXT] Combine T101+T102 outputs [CONSTRAINTS] Resolve conflicts → Designer
```

The synthesis task is `blocked_by: [T101, T102]` and explicitly combines outputs.

### 2. Define Chain Types in Task Creation

BOSS could tag decomposition strategy:

```python
# In task creation
"decomposition": "map-reduce"  # parallel + synthesize
"decomposition": "refine"      # sequential, each builds on prior
"decomposition": "stuff"       # single agent handles all
```

This signals to workers and QA how outputs should combine.

### 3. Add Refine Pattern for Iterative Work

For quality-sensitive outputs (design docs, complex code), create explicit refine loops:

```
T201: [WHAT] Draft economy design v1 → Designer
T202: [WHAT] Refine economy design with player feedback [CONTEXT] Build on T201 → Designer
T203: [WHAT] Final pass on economy design [CONTEXT] Build on T202 → Designer
```

Each task's output feeds the next iteration.

### 4. Consider Scoring for QA

QA could assign confidence scores to outputs:

```python
{
    "task_id": "T101",
    "verdict": "approved",
    "confidence": 0.85,  # NEW
    "notes": "Minor edge case concerns"
}
```

Higher-scored outputs could be prioritized for synthesis.

### 5. Skip Full LCEL Adoption

LCEL is designed for Python chain composition with streaming. Studio uses:
- Natural language task delegation
- Markdown-based skill injection
- Human-readable task results

The programming overhead of LCEL doesn't fit. Instead, adopt the **conceptual patterns** (map-reduce, refine) in task structure.

---

**Sources:**
- [Summarization with LangChain: Stuff, Map_reduce, Refine](https://medium.com/@abonia/summarization-with-langchain-b3d83c030889)
- [LangChain Chain Types for RAG](https://www.learnwithparam.com/blog/langchain-chain-types-rag-summarization-stuff-map-reduce)
- [Sequential Chains in LangChain - GeeksforGeeks](https://www.geeksforgeeks.org/artificial-intelligence/sequential-chains-in-langchain/)
- [LangChain LCEL Tutorial 2026](https://myengineeringpath.dev/tools/langchain-lcel-tutorial/)
- [LCEL and Composing Chains from Runnables](https://medium.com/aimonks/langchain-tutorial-lcel-and-composing-chains-from-runnables-751090a0720c)
- [MapRerankDocumentsChain - LangChain Docs](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.map_rerank.MapRerankDocumentsChain.html)
- [Document Chains in LangChain](https://medium.com/@vinusebastianthomas/document-chains-in-langchain-d33c4bdbabd8)
- [Mastering Document Chains - Comet](https://www.comet.com/site/blog/mastering-document-chains-in-langchain/)
