# AC-Memory Tier 2: Archived Knowledge

## [DONE] Architecture Decisions
- [DONE] Project files isolated in `projects/{ID}/` - keeps studio codebase clean
- [DONE] AC-Memory (bullet recall) + History (narrative prose) = dual compression systems
- [DONE] Skill system disabled (T359) - prompts now ROLE only
- [DONE] MCP tools require `--dangerously-skip-permissions` flag for all agents
- [DONE] BOSS constrained: no Edit/Write/Bash - delegates only
- [DONE] Vanilla agents skip skill/context injection via `config.vanilla: true`

## [DONE] Compression System Design
- [DONE] AC-Memory tiers: tier0 (raw) → tier1 (active/done bullets) → tier2+ (archive)
- [DONE] History tiers: draft → chapter → book → collection (narrative prose)
- [DONE] Context agent compresses memory; Writer agent compresses history
- [DONE] Thresholds: 10KB (tier0), 50KB (tier1), 200KB (tier2+)
- [DONE] THRESHOLD mode optimal: per-block-type configs, max 70% compression

## [DONE] Research Findings
- [DONE] Primacy/recency: role.md at TOP (primacy position), TASK at END (recency)
- [DONE] Tables > prose: 30%+ higher LLM adherence
- [DONE] Token ratios: coding=1:3-5, debugging=1:2-3, summarization=10:1
- [DONE] Extended thinking saves 15-25% tokens on complex tasks
- [DONE] Agent fleet patterns: hub-spoke, supervisor, hierarchical (LangGraph/AutoGen/CrewAI)

## [DONE] Workflow Patterns Validated
- [DONE] P001 pipeline: Prepare→Prompt→Worktree→Ship (7 phases, 21 steps, 63 substeps)
- [DONE] Auto-generate task queue from whitepaper via Taxonomy parsing
- [DONE] Codebase reviews → suggestions (human-in-loop for structural changes)
- [DONE] Boss delegates fixes instead of investigating - agents have file access

---

## [DONE] Sept 9-10 Sprint
- [DONE] Role.md optimization: all agents trimmed to 50-70 lines, tables > prose
- [DONE] MCP integration: Claude CLI with --mcp-config, deleted role_base.md
- [DONE] Compression prompts refactored: classification tables, tier formats
- [DONE] Session-based context: deterministic UUIDs, auto-recovery for session errors
- [DONE] Dynamic file tree injection (T402) - reduces 80% orientation tokens
- [DONE] Logging refactor: 80+ print() calls converted to proper logging
- [DONE] Thread safety: threading.Lock() added to session_tokens and agent_statuses
- [DONE] Retry wrapper: exponential backoff (2s→4s→8s) for network errors
- [DONE] Agents tab: auto-sort by tokens, expandable cards with role.md display

## [DONE] Sept 11 Sprint
- [DONE] Live token tracking: per-agent, per-task, persisted to token_usage.json
- [DONE] Token metrics dashboard: live streaming tokens reflected correctly
- [DONE] Race condition fix: live token counts no longer vanish on DOM rebuild
- [DONE] Terminal dock: moved to bottom of Agents tab (VS Code style)
- [DONE] Agent tab consolidation: duplicate renderAgentCards removed
- [DONE] 50%-50% layout bug: fixed CSS causing hub/agents side-by-side
