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
