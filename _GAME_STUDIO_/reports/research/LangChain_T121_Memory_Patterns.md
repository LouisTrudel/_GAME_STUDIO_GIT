# LangChain Memory Patterns Research Report

## Summary

LangChain provides **six core memory strategies** for context window management: buffer (full history), window (last N), summary (compressed), hybrid (summary + recent verbatim), token-based (token budget), and vector store (semantic retrieval). The key insight for Studio: **our `hub.py` already implements the optimal hybrid pattern**—recent messages verbatim + session summary for older context. LangChain's approach confirms our architecture; we can adopt their **memory scoping patterns** (thread vs cross-session) without framework changes.

## Key Findings

### 1. LangChain Memory Type Taxonomy

| Type | How It Works | Token Growth | Best For |
|------|--------------|--------------|----------|
| **ConversationBufferMemory** | Store everything | Linear (unbounded) | Short conversations |
| **ConversationBufferWindowMemory** | Last K turns | Fixed | Recency-focused tasks |
| **ConversationSummaryMemory** | Summarize everything | Slow growth | Long conversations |
| **ConversationSummaryBufferMemory** | Recent verbatim + older summarized | Bounded + slow growth | Production systems |
| **ConversationTokenBufferMemory** | Token budget, FIFO eviction | Fixed max | Token-sensitive apps |
| **VectorStoreRetrieverMemory** | Embed all, retrieve by similarity | External storage | Semantic retrieval |
| **ConversationEntityMemory** | Track entities (people, places) | Slow growth | Entity-heavy domains |

### 2. The Deprecation Shift: LangChain → LangGraph

**Critical:** `ConversationBufferMemory` and related classes are deprecated (v0.3.1), removed in v1.0.0.

**New model:**
- **Checkpointers** = short-term memory (within session)
- **Stores** = long-term memory (cross-session)

```python
# LangGraph pattern
from langgraph.checkpoint.memory import MemorySaver

graph = StateGraph(...)
checkpointer = MemorySaver()  # or PostgresSaver for production
app = graph.compile(checkpointer=checkpointer)

# Each thread_id is a separate conversation
app.invoke({"messages": [...]}, config={"configurable": {"thread_id": "user-123"}})
```

**Thread** = conversation session. Same thread_id = continuous memory.

### 3. Memory Scoping Patterns

| Scope | LangGraph Component | Use Case |
|-------|---------------------|----------|
| **Thread-scoped** | Checkpointer | Conversation continuity |
| **User-scoped** | BaseStore with namespace | Preferences, facts about user |
| **Application-scoped** | Shared BaseStore | Global knowledge |

### 4. Compression Strategies

**Summarization hierarchy:**
1. **ConversationSummaryMemory**: Summarize after each turn
2. **ConversationSummaryBufferMemory**: Summarize when buffer exceeds threshold
3. **Cheaper summarization**: Use smaller model (gpt-3.5-turbo) for summaries
4. **Contextual compression**: Filter irrelevant content before injection

**Token budget approaches:**
- `ConversationTokenBufferMemory`: Hard limit, FIFO eviction
- Hybrid: Keep last K tokens verbatim, summarize rest

### 5. Studio's Current Implementation

From `hub.py`:
```python
MAX_MESSAGES = 200
SUMMARIZE_THRESHOLD = 20  # Keep last 20 raw, summarize older

def get_context_for_agent(self, agent_name: str, limit: int = 20) -> str:
    # Add session summary if available (compressed older context)
    if self.session_summary:
        lines.append(f"SESSION CONTEXT:\n{self.session_summary}\n")
    # Add recent messages
    recent = self.messages[-limit:]
```

**This is exactly `ConversationSummaryBufferMemory` pattern!**

| LangChain | Studio Equivalent |
|-----------|-------------------|
| `ConversationSummaryBufferMemory` | `Hub.session_summary` + `get_context_for_agent()` |
| `max_token_limit` | `SUMMARIZE_THRESHOLD = 20` |
| Thread persistence | `hub_history.json` |
| `BufferWindowMemory` | `limit` parameter in `get_context_for_agent()` |

### 6. What LangChain Does That Studio Doesn't

| Feature | LangChain | Studio Gap |
|---------|-----------|------------|
| **Cross-session user memory** | BaseStore with user namespace | No persistent user memory |
| **Entity tracking** | ConversationEntityMemory | Entities not extracted |
| **Semantic retrieval** | VectorStoreRetrieverMemory | No embedding-based recall |
| **Token-based limits** | ConversationTokenBufferMemory | Message-count limits only |

## Analysis

### Studio's Architecture vs LangChain

**Studio Principle 5:** "Agents are stateless; state lives in /data"

This maps perfectly to LangGraph's model:
- **`/data/*.json`** = persistent stores (tasks, hub_history, suggestions)
- **Per-request context injection** = stateless agent calls
- **`hub_history.json`** = checkpointer equivalent

**Key difference:** Studio uses **file-based persistence** (JSON), LangChain recommends **database backends** (PostgreSQL, SQLite) for production.

### When Vector Memory Would Help

Current limitation: Hub retrieval is **recency-based**, not **relevance-based**.

Scenario: Agent needs decision made 50 messages ago. With current system, it's either:
1. In `session_summary` (maybe)
2. Lost beyond `MAX_MESSAGES`

Vector store would allow: "Find when we decided on the inventory system architecture" → semantic search across all history.

**Worth it?** Only if:
- Conversations exceed 200 messages regularly
- Key decisions get lost in summaries
- Current recency-based context causes repeated discussions

### Token Optimization Comparison

| Strategy | Tokens Saved | Tradeoff |
|----------|--------------|----------|
| Window (last K) | High | Loses older context |
| Summary only | High | Quality depends on summarizer |
| Hybrid (Studio) | Medium | Best of both worlds |
| Token budget | Guaranteed | May cut mid-thought |

Studio's hybrid approach is the recommended production pattern.

## Recommendations

### 1. Keep Current Architecture ✓
Studio already implements `ConversationSummaryBufferMemory` pattern. No changes needed to core memory model.

### 2. Consider Token-Based Limits (Optional Enhancement)
Currently: `SUMMARIZE_THRESHOLD = 20` (message count)
Alternative: Summarize when token count exceeds budget

```python
# Pseudo-code
def should_summarize(messages, token_limit=4000):
    total = sum(count_tokens(m.content) for m in messages)
    return total > token_limit
```

**Benefit:** More predictable context size for cost control.

### 3. Add Cross-Session User Memory (If Multi-User)
If Studio will have multiple users, adopt LangGraph's namespace pattern:

```python
# Store user preferences/facts
user_store[user_id] = {
    "preferences": {...},
    "facts": [...]
}
```

Currently: Studio is single-project, so user memory is implicit in `/data`.

### 4. Skip Vector Memory For Now
- Current conversation lengths don't justify embedding overhead
- `session_summary` captures key decisions
- Add later if lost-context issues emerge

### 5. Adopt Thread ID Pattern for Multi-Conversation
If Studio needs multiple concurrent conversations:

```python
# hub_history.json structure
{
    "threads": {
        "project-alpha": {...},
        "project-beta": {...}
    }
}
```

Currently: Single thread (single project), so not needed.

### 6. Document Memory Strategy in `studio.md`
Add explicit principle:

```markdown
7. Memory model: Recent verbatim + older summarized (hybrid pattern)
```

This codifies what's already implemented.

---

**Sources:**
- [LangChain Short-Term Memory Docs](https://docs.langchain.com/oss/python/langchain/short-term-memory)
- [Agent Memory in LangChain: Short-Term, Long-Term, and Episodic](https://propelius.ai/blogs/agent-memory-patterns-langchain/)
- [Why AI Agents Forget: The Stateless LLM Problem](https://atlan.com/know/why-ai-agents-forget/)
- [Long-Term Memory LangChain Agents: LangGraph and LangMem Guide](https://atlan.com/know/long-term-memory-langchain-agents/)
- [LangGraph Memory and State Persistence](https://www.abstractalgorithms.dev/langgraph-memory-and-state-persistence)
- [LangGraph Persistence Docs](https://docs.langchain.com/oss/python/langgraph/persistence)
- [Conversational Memory with LangChain - Pinecone](https://www.pinecone.io/learn/series/langchain/langchain-conversational-memory/)
- [5 LangChain Memory Strategies for Sharp Context](https://medium.com/@Nexumo_/5-langchain-memory-strategies-for-sharp-context-e50f092578b5)
- [How to Implement LangChain Memory](https://oneuptime.com/blog/post/2026-01-27-langchain-memory/view)
- [LangChain Cost Optimization: Memory Management](https://langchain-tutorials.github.io/langchain-cost-optimization-memory-management-token-consumption/)
- [Context Window Management Strategies](https://apxml.com/courses/langchain-production-llm/chapter-3-advanced-memory-management/context-window-management)
