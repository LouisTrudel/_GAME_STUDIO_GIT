# File Discovery Patterns for AI Agents

## Summary

AI agents waste 80% of tokens on orientation, not problem-solving. The most efficient approach is a **hybrid strategy**: static manifests + AST-based indexing (tree-sitter + SQLite) + targeted tool calls. CodeGraph-style solutions show 58% fewer tool calls and 47% fewer tokens vs raw exploration.

---

## Key Findings

| Finding | Evidence | Implication |
|---------|----------|-------------|
| Agents spend 80% of tokens just finding things | [Medium: Context Compression](https://medium.com/@jakenesler/context-compression-to-reduce-llm-costs-and-frequency-of-hitting-limits-e11d43a26589) | Orientation is the bottleneck, not reasoning |
| Tree-sitter + SQLite/FTS5 cuts context by 50x | [DEV.to: Tree-sitter Index](https://dev.to/uwe_c_39d9ab7d16ff8dfe67e/how-i-cut-ai-context-usage-by-50x-with-a-tree-sitter-code-index-plm) | Structured indexes massively outperform raw search |
| CodeGraph reduces tool calls 58%, tokens 47% | [DEV.to: CodeGraph Guide](https://dev.to/jovan_chan_9500711396d4e6/codegraph-setup-guide-2026-cut-claude-code-tool-calls-by-58-41ln) | Pre-indexed graphs deliver measurable ROI |
| 2,000 targeted tokens > 20,000 random tokens | [Chrome DevTools Blog](https://developer.chrome.com/blog/designing-devtools-efficient-token-usage) | Quality over quantity in context selection |
| Aider's repo-map uses 1K tokens to represent whole repo | [Aider Docs](https://aider.chat/docs/repomap.html) | AST + PageRank = token-budgeted summaries |

---

## Approach Comparison

| Approach | Token Cost | Setup Cost | Accuracy | Best For |
|----------|------------|------------|----------|----------|
| **Raw exploration** (grep/glob/read) | Very High | None | Low | Small repos, one-off tasks |
| **File tree injection** | Low | Low | Medium | Quick orientation, <100 files |
| **Static manifest** (CLAUDE.md) | Very Low | Medium | High | Stable codebases, known patterns |
| **Vector embeddings** | Medium | High | High | Semantic "what does X do?" queries |
| **AST index** (tree-sitter) | Low | Medium | Very High | Symbol lookup, call graphs |
| **Hybrid** (manifest + AST + targeted) | Lowest | Medium | Highest | Production systems |

---

## Tool Analysis

### Cursor
- Pre-builds vector embeddings server-side
- Chunks files, sends to remote embedding API
- Good semantic search, privacy tradeoff

### Claude Code (native)
- No pre-built index—uses Glob, Grep, Read in real-time
- Spawns explore agents for unfamiliar repos
- High token cost on large codebases

### Aider
- Tree-sitter AST → PageRank symbol ranking
- 1K token budget for repo map
- SQLite cache, graph-based relevance scoring
- Best-in-class for token efficiency

### CodeGraph (MCP add-on)
- Tree-sitter + SQLite/FTS5 local database
- 20+ languages supported
- 58% fewer tool calls, 47% fewer tokens
- Works with Claude Code, Cursor, Codex

### QMD
- Hybrid BM25 + vector search for markdown
- MCP server integration
- Good for docs/knowledge bases, not code AST

---

## Recommendations

### Priority 1: Implement Static Navigation Index
**What**: Add a navigation manifest to each project showing:
- Key entry points (main files, routers, configs)
- Directory structure with purpose annotations
- Critical file paths agents should check first

**Why**: Eliminates redundant codebase analysis. Analysis shows 77% of effective manifests include file navigation.

**Token cost**: ~200-500 tokens upfront, saves thousands per session.

### Priority 2: Integrate CodeGraph or Similar AST Index
**What**: Add tree-sitter + SQLite/FTS5 indexing via MCP.

**Options**:
1. [CodeGraph](https://github.com/colbymchenry/codegraph) — production-ready, 20+ languages
2. [codebase-index](https://github.com/denfry/codebase-index) — similar, fully offline
3. Custom: tree-sitter-analyzer + SQLite wrapper

**Why**: 58% fewer tool calls, sub-millisecond symbol lookups.

### Priority 3: Inject File Tree Before Exploration
**What**: Before any explore task, inject compressed file tree:
```
src/
  core/      # Business logic
  agents/    # Agent definitions
  utils/     # Shared utilities
```

**Why**: Agents make smarter first-move decisions. Tree costs ~50-200 tokens, prevents 2000+ token exploratory reads.

### Priority 4: Use Aider-Style Repo Maps for Context Tasks
**What**: Generate token-budgeted summaries showing:
- Top-referenced symbols (PageRank)
- Import/export relationships
- Call graph edges

**Why**: Aider proves 1K tokens can represent entire repos when you rank by relevance.

---

## Implementation Path

1. **Quick Win (Today)**: Add navigation comments to CLAUDE.md equivalent
2. **Medium Term**: Integrate CodeGraph MCP server for symbol lookups
3. **Advanced**: Build custom AST index with project-specific queries

---

## Sources

- [Aider Repo Map](https://aider.chat/docs/repomap.html) — tree-sitter approach
- [Aider Tree-Sitter Details](https://aider.chat/2023/10/22/repomap.html) — implementation details
- [CodeGraph GitHub](https://github.com/colbymchenry/codegraph) — MCP knowledge graph
- [Morph: Codebase Indexing](https://www.morphllm.com/codebase-indexing) — tool comparison
- [Chrome DevTools Token Efficiency](https://developer.chrome.com/blog/designing-devtools-efficient-token-usage) — context optimization
- [Context Compression Article](https://medium.com/@jakenesler/context-compression-to-reduce-llm-costs-and-frequency-of-hitting-limits-e11d43a26589) — 80% waste finding things
- [Tree-Sitter 50x Reduction](https://dev.to/uwe_c_39d9ab7d16ff8dfe67e/how-i-cut-ai-context-usage-by-50x-with-a-tree-sitter-code-index-plm) — practical results
- [QMD GitHub](https://github.com/ehc-io/qmd) — hybrid markdown search
- [Agent Manifests Best Practices](https://www.emergentmind.com/topics/agent-manifests) — structure guidelines
- [AGENTS.md Examples](https://promptessor.com/blog/best-agentsmd-examples-for-codex-cursor-and-ai-coding-agents-in-2026) — template patterns
