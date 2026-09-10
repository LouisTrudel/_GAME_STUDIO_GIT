# Agent Optimization Review

Status flags: `[DONE]` `[LOOKINTO]` `[NOTWORTH]` `[OVERHYPED]`

---

## Optimization Techniques

### 1. Prompt Caching `[DONE]`

- **What:** Cache system prompts and tool schemas to avoid re-tokenizing every turn.
- **Implementation:** Claude CLI sessions handle this automatically via `--session-id` / `--resume`. Our `PersistentClaudeCLI` backend tracks initialization state.
- **Result:** 96% token reduction (1M → 43K tokens on comparable tasks).

---

### 2. Context Compaction `[DONE]`

- **What:** Prune old tool results, summarize history to prevent unbounded growth.
- **Implementation:** Claude CLI auto-compacts sessions. AC-Memory tier system (tier0→tier1→tier2) compresses context progressively.
- **Result:** Sessions stay bounded without manual eviction logic.

---

### 3. Line-Bounded File Tools `[DONE]`

- **What:** Force agents to read/edit specific line ranges instead of entire files.
- **Implementation:** MCP tools in `mcp_server.py`:
  - `read_lines(path, start, end)` - max 200 lines
  - `search_code(pattern)` - returns matching lines only
  - `file_outline(path)` - structure without content
  - `edit_lines(path, start, end, content)` - surgical edits
- **Result:** Prevents megabyte file dumps. Agents blocked from native Read/Write via `--allowedTools`.

---

### 4. Diff-Based Editing `[DONE]`

- **What:** Use search-and-replace blocks instead of full file rewrites.
- **Implementation:** Claude Code's native `Edit` tool does this. Agents have access via `--allowedTools`.
- **Result:** 80-90% reduction in output tokens for edits.

---

### 5. AST Symbol Maps `[LOOKINTO]`

- **What:** Parse codebase into function/class symbol tree for instant lookups.
- **Libraries:** `grep_ast`, `py-tree-sitter-languages`
- **Current state:** We have `file_outline` as lightweight alternative. Full AST would help for large codebases but adds complexity.
- **Verdict:** Consider if agents frequently struggle to locate symbols.

---

### 6. Sub-Agent Isolation `[DONE]`

- **What:** Isolate heavy search/research in separate context, return only summary.
- **Implementation:** 14 specialized agents, each with own persistent session. Research agent handles web lookups, returns findings to BOSS.
- **Result:** No cross-contamination of context between agents.

---

### 7. Local Linting Hooks `[LOOKINTO]`

- **What:** Run linter before appending tool results to catch syntax errors in one turn.
- **Libraries:** `ruff`, `pyright`
- **Current state:** Not implemented. Could use Claude Code hooks (`settings.json` → `hooks`).
- **Verdict:** Would save 2-3 turns per syntax error. Low effort if using hooks.

---

### 8. Dynamic Model Routing `[LOOKINTO]`

- **What:** Use cheaper models (haiku) for simple tasks, escalate to sonnet for complex reasoning.
- **Current state:** All agents use default sonnet. Agent configs support `"model"` field.
- **Candidates for haiku:**
  - Research (web searches, summaries)
  - Context (memory management)
  - Taxonomy (categorization)
  - Routine (scheduled tasks)
- **Savings:** ~5x cost reduction for affected agents ($0.25/M vs $3/M input).
- **Verdict:** Easy win. Add `"model": "haiku"` to select agent configs.

---

### 9. LSP Integration `[NOTWORTH]`

- **What:** Hook into language server for type checking, symbol resolution.
- **Libraries:** `pylsp`, `pyright`
- **Verdict:** Too complex for marginal benefit. Claude Code already understands code well. MCP file tools sufficient.

---

### 10. Turn Limits `[DONE]`

- **What:** Hard cap autonomous turns to prevent runaway exploration.
- **Implementation:** `--max-turns` flag in `persistent_claude_cli.py`:
  - BOSS: 5 turns (coordinator, shouldn't execute much)
  - Employees: 30 turns (enough for complex tasks)
- **Result:** Prevents panic-looping. Agents fail gracefully at limit.

---

### 11. Shadow Workspaces `[OVERHYPED]`

- **What:** Stage all edits in buffer, rollback on failure.
- **Reality:** Git already provides this via branches/stash. Adding custom staging layer is complex for marginal benefit.
- **Verdict:** Just use git. Not worth custom implementation.

---

### 12. Model Context Protocol `[DONE]`

- **What:** Standardized tool interface between agents and external services.
- **Implementation:** `mcp_server.py` with `fastmcp`. Provides:
  - Task management tools
  - Memory/context tools
  - Smart file tools (read_lines, search_code, etc.)
- **Result:** Agents use MCP tools instead of raw file access.

---

## Reference Libraries

| Library | Use Case | Status |
|---------|----------|--------|
| `fastmcp` | MCP server implementation | **In use** |
| `grep_ast` | AST symbol extraction | Consider |
| `ruff` | Fast Python linting | Consider for hooks |
| `diff_match_patch` | Patch application | Not needed (Edit tool) |
| `langgraph` | Agent orchestration | Not needed (custom hub) |
| `pylsp` / `pyright` | LSP integration | Not worth it |

---

## Reference Repositories

- **[Cline / Roo Code](https://github.com/cline/cline):** XML prompts, tool schemas, line-range inspection
- **[Aider](https://github.com/Aider-AI/aider):** Diff editing, repomaps, token frugality
- **[Claude Code](https://github.com/anthropics/claude-code):** Skill definitions, tool guardrails
- **[Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook):** Official prompts, caching examples

---

## Next Actions

1. **Dynamic Model Routing** - Add `"model": "haiku"` to Research, Context, Taxonomy, Routine configs
2. **Linting Hooks** - Investigate Claude Code hooks for post-edit linting
3. **AST Symbol Maps** - Evaluate if `file_outline` is sufficient or need full tree-sitter
