# Multi-Agent Reference Products Research

## Summary

Eight production-grade frameworks offer architectural patterns directly applicable to the Studio. **LangGraph** provides the most mature state management and conditional routing for production. **DSPy** uniquely addresses the Studio's self-improvement goal through automatic prompt optimization. **Google A2A Protocol** sets the emerging standard for agent interoperability that the Hub could adopt.

## Key Findings

| Product | Stars | Architecture Parallel | Why Study |
|---------|-------|----------------------|-----------|
| **LangGraph** | 50k+ | Graph-based task routing | Production-grade state management, audit trails |
| **CrewAI** | 40k+ | Role-based agents | Fastest prototyping, clean mental model |
| **AutoGen/AG2** | 45k+ | Conversational agent teams | Debate-and-refine patterns for QA |
| **DSPy** | 25k+ | Signature-based optimization | Automatic prompt/skill improvement |
| **Pydantic AI** | 18k+ | Type-safe tool registration | Clean Python patterns, validation |
| **OpenHands** | 35k+ | Event-sourced sandbox | Code agent architecture reference |
| **Semantic Kernel** | 20k+ | Enterprise orchestration | .NET patterns, OpenTelemetry integration |
| **smolagents** | 5k+ | Code-first minimal agents | Under 1000 LOC, code-as-action pattern |

---

## Tier 1: Production Multi-Agent Frameworks

### LangGraph
**Repo:** [github.com/langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)
**Docs:** [langchain-ai.github.io/langgraph](https://langchain-ai.github.io/langgraph/)

| Feature | Studio Parallel |
|---------|-----------------|
| Graph-based state machines | Task dependency chains |
| Checkpointing & rollback | Could add to TaskManager |
| Conditional edges | Agent routing decisions |
| Human-in-the-loop nodes | Approval workflows |

**Key Insight:** LangGraph represents tasks as graph nodes with typed state that flows between them. This maps cleanly to the Studio's task→agent→result flow. Their "interrupt" pattern for human approval mirrors the Studio's destructive operation checks.

**Recommendation:** Study their state persistence layer. The Studio currently relies on JSON files; LangGraph's checkpoint system offers better recovery from failures.

---

### CrewAI
**Repo:** [github.com/crewAIInc/crewAI](https://github.com/crewAIInc/crewAI)
**Docs:** [docs.crewai.com](https://docs.crewai.com/)

| Feature | Studio Parallel |
|---------|-----------------|
| Role + Goal + Backstory per agent | role.md pattern |
| Task delegation between agents | BOSS→Agent flow |
| Hierarchical crews | Could add sub-teams |
| Memory types (short/long/entity) | Hub history + CONTEXT.md |

**Key Insight:** CrewAI's "delegation" pattern allows agents to hand off subtasks dynamically. The Studio currently requires BOSS to pre-plan all delegation. CrewAI's approach enables emergent collaboration.

**Recommendation:** Consider allowing agents to create sub-tasks for other agents without BOSS mediation for well-defined interfaces.

---

### AutoGen / AG2
**Repo:** [github.com/ag2ai/ag2](https://github.com/ag2ai/ag2)
**Docs:** [ag2.ai](https://ag2.ai/)

| Feature | Studio Parallel |
|---------|-----------------|
| Conversational agent loops | Hub message threading |
| GroupChat with speaker selection | Multi-agent task discussions |
| Nested conversations | Sub-task isolation |
| Human proxy agent | User input handling |

**Key Insight:** AG2's v0.4 rewrite introduced event-driven async execution. Agents "debate" by posting to shared context until consensus. This maps to the Hub model but adds structured turn-taking.

**Recommendation:** The QA agent could use AutoGen's "critic" pattern—automatically reviewing other agents' outputs before marking tasks complete.

---

## Tier 2: Self-Improvement & Optimization

### DSPy
**Repo:** [github.com/stanfordnlp/dspy](https://github.com/stanfordnlp/dspy)
**Docs:** [dspy-docs.vercel.app](https://dspy-docs.vercel.app/)

| Feature | Studio Parallel |
|---------|-----------------|
| Signatures (typed I/O specs) | Skill parameter schemas |
| Optimizers (prompt search) | **Missing—high value add** |
| Modules (composable units) | Skills as modules |
| Teleprompters | Automatic few-shot selection |

**Key Insight:** DSPy treats prompts as optimizable programs. Given a metric (e.g., task success rate), it automatically searches for better prompts and examples. This directly addresses the Studio's "self-improving" goal.

**Recommendation:** **High priority.** Wrap skills in DSPy signatures. Use task success/failure data to optimize skill prompts automatically. This is the most direct path to "self-improving agent fleet."

---

### Pydantic AI
**Repo:** [github.com/pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai)
**Docs:** [ai.pydantic.dev](https://ai.pydantic.dev/)

| Feature | Studio Parallel |
|---------|-----------------|
| @tool decorator with type hints | Tool function registration |
| Automatic validation & retries | Could add to tool calls |
| Structured outputs | Task result schemas |
| Logfire integration | Metrics logging |

**Key Insight:** Pydantic AI v2.0's "Capabilities API" bundles instructions + tools + hooks into reusable units. This is similar to Skills but with automatic validation. Their retry logic handles malformed LLM outputs gracefully.

**Recommendation:** Consider typing tool inputs/outputs with Pydantic models. Free validation and better error messages.

---

## Tier 3: Specialized Architectures

### OpenHands
**Repo:** [github.com/All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands)
**Docs:** [docs.all-hands.dev](https://docs.all-hands.dev/)

| Feature | Studio Parallel |
|---------|-----------------|
| Event log as state | Hub message history |
| Sandboxed execution | Roblox MCP isolation |
| Agent SDK (composable) | Could modularize agents |
| File + terminal + browser tools | Multi-tool agents |

**Key Insight:** OpenHands uses an event-sourced architecture where the agent's "memory" is the full event log. This enables replay, debugging, and forking. Their sandbox approach (Docker-based) isolates code execution from the host.

**Recommendation:** The event-log pattern could improve the Hub. Instead of just chat history, store structured events (task_created, tool_called, result_returned) for better debugging and metrics.

---

### smolagents
**Repo:** [github.com/huggingface/smolagents](https://github.com/huggingface/smolagents)
**Docs:** [huggingface.co/docs/smolagents](https://huggingface.co/docs/smolagents)

| Feature | Studio Parallel |
|---------|-----------------|
| ~1000 LOC total | Minimal complexity goal |
| Code-as-action (Python snippets) | Could adopt for Programmer |
| @tool decorator | Simple tool definition |
| Hub sharing | Skill marketplace concept |

**Key Insight:** smolagents proves you can build production agents in minimal code. Their "code agent" pattern has the LLM write Python that gets executed, rather than JSON tool calls. This is more expressive for complex operations.

**Recommendation:** The Programmer agent could benefit from code-agent patterns. Instead of calling discrete tools, let it write and execute code blocks for complex file operations.

---

### Semantic Kernel / Microsoft Agent Framework
**Repo:** [github.com/microsoft/semantic-kernel](https://github.com/microsoft/semantic-kernel)
**Docs:** [learn.microsoft.com/semantic-kernel](https://learn.microsoft.com/en-us/semantic-kernel/)

| Feature | Studio Parallel |
|---------|-----------------|
| Sequential/Concurrent orchestration | Task pipeline patterns |
| Dependency injection | Clean Python architecture |
| OpenTelemetry hooks | Production observability |
| Planner agents | Task decomposition |

**Key Insight:** SK's orchestration patterns (sequential, concurrent, group) are well-documented. Their "Handoff" pattern for agent-to-agent delegation includes structured metadata about why delegation occurred.

**Recommendation:** Study their telemetry integration. The Studio's metrics could adopt OpenTelemetry standards for better tooling compatibility.

---

## Tier 4: Protocols & Standards

### Google A2A Protocol
**Spec:** [github.com/google/A2A](https://github.com/google/A2A)
**Guide:** [Cybage A2A Guide](https://www.cybage.com/blog/mastering-google-s-a2a-protocol-the-complete-guide-to-agent-to-agent-communication)

| Feature | Studio Parallel |
|---------|-----------------|
| AgentCard (capability manifest) | role.md + config.json |
| Task lifecycle (pending→complete) | TaskManager states |
| JSON-RPC + SSE | HTTP API + WebSocket |
| OAuth 2.0 / JWT auth | Future multi-user support |

**Key Insight:** A2A defines a standard for agent discovery and task delegation across organizational boundaries. The AgentCard concept (machine-readable capability manifest) could make Studio agents interoperable with external systems.

**Recommendation:** Consider adopting AgentCard format for `config.json`. This would allow Studio agents to be discovered and invoked by external A2A-compatible systems.

---

## Architectural Patterns Comparison

| Pattern | LangGraph | CrewAI | AutoGen | Studio |
|---------|-----------|--------|---------|--------|
| Task routing | Graph edges | Crew process | Speaker selection | BOSS delegation |
| State management | Checkpoints | Memory types | Event history | JSON files |
| Agent definition | Nodes | Role+Goal | ConversableAgent | role.md |
| Tool integration | Tool nodes | @tool | Functions | tools.py |
| Human oversight | Interrupts | Human input | Human proxy | Approval flows |

---

## Recommendations

| Priority | Action | Rationale |
|----------|--------|-----------|
| 1 | **Integrate DSPy for skill optimization** | Direct path to self-improvement goal; auto-optimize prompts based on task success data |
| 2 | **Adopt event-sourced Hub (OpenHands pattern)** | Better debugging, metrics, and replay; structured events vs. chat messages |
| 3 | **Add Pydantic validation to tools** | Free input validation, automatic retries, better error messages |
| 4 | **Study LangGraph checkpointing** | More robust state recovery than current JSON approach |
| 5 | **Consider AgentCard format** | Future-proofs for A2A interoperability |
| 6 | **Implement critic pattern (AutoGen)** | QA agent auto-reviews outputs before completion |

---

## Sources

**Frameworks:**
- [LangGraph vs CrewAI vs AutoGen Guide](https://dev.to/pockit_tools/langgraph-vs-crewai-vs-autogen-the-complete-multi-agent-ai-orchestration-guide-for-2026-2d63) — Comprehensive comparison
- [10 AI Agent Frameworks 2026](https://medium.com/@atnoforgenai/10-ai-agent-frameworks-you-should-know-in-2026-langgraph-crewai-autogen-more-2e0be4055556) — Framework overview
- [Best Multi-Agent Frameworks 2026](https://gurusup.com/blog/best-multi-agent-frameworks-2026) — Production considerations

**Self-Improvement:**
- [DSPy GitHub](https://github.com/stanfordnlp/dspy) — Prompt optimization framework
- [Agentic Context Engineering Paper](https://arxiv.org/pdf/2510.04618) — Context evolution research
- [Self-Improving Agents Survey](https://arxiv.org/abs/2607.13104) — Academic survey

**Protocols:**
- [Google A2A Protocol Guide](https://www.cybage.com/blog/mastering-google-s-a2a-protocol-the-complete-guide-to-agent-to-agent-communication) — Interoperability standard
- [A2A Security Analysis](https://arxiv.org/pdf/2511.03841) — Protocol security considerations

**Tools & Validation:**
- [Pydantic AI Docs](https://pydantic.dev/pydantic-ai) — Type-safe agents
- [OpenHands SDK Paper](https://arxiv.org/pdf/2511.03690) — Event-sourced architecture
- [smolagents Blog](https://huggingface.co/blog/smolagents) — Minimal agent patterns

**Enterprise:**
- [Semantic Kernel Orchestration](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/) — Microsoft patterns
- [OpenHands Deployment Guide](https://www.spheron.network/blog/deploy-openhands-gpu-cloud/) — Production deployment
