# AI Behavior Enforcement: Techniques That Work

## Summary

Prompt-based rules are **probabilistic suggestions, not laws**. The BOSS agent violated its "never execute yourself" rule because LLMs treat all text—including HARD RULE labels—as weighted input signals, not deterministic constraints. Effective enforcement requires layered defense: architectural constraints that remove options before the LLM decides, tool-based checkpoints that intercept actions, and prompt techniques that maximize (but never guarantee) compliance.

## Key Findings

### The Fundamental Problem

LLMs process instructions through attention weights, not boolean logic. Research shows:
- Rules are "one input signal among many"—competing with task completion pressure
- Under rapid-fire requests, models prioritize task completion over process compliance
- Context compaction drops process standards when windows exceed limits
- A 99.5% compliance rate still means 1 in 200 violations

**The BOSS violation was predictable**: the rule existed in text, but nothing prevented the action architecturally.

### What Fails

| Technique | Why It Fails |
|-----------|--------------|
| Labeling rules "HARD RULE" or "CRITICAL" | Emphasis markers are soft signals, not enforcement |
| Long rule files (300+ lines) | Near-zero compliance; models lose track |
| Rules in the middle of prompts | "Lost in the middle" syndrome—models attend to extremes |
| Negative framing ("do not X") | Can be overridden by competing positive objectives |
| Relying on model "understanding" | Models exhibit "control illusion"—apparent comprehension without behavioral compliance |
| Static rules without monitoring | Decay over time as usage patterns shift |

### What Works

#### Layer 1: Architectural Constraints (Strongest)

Remove options before the LLM decides. If the model can't access a tool, it can't misuse it.

```
# Mode-based restriction example
if mode == "coordinator":
    available_tools = ["create_task", "assign_task", "query_status"]
    # Edit, Write, Bash NOT available - can't execute even if it tries
```

**Key insight**: "When mode denies Edit, the harness removes the tool before the LLM even decides."

#### Layer 2: Tool-Based Checkpoints (Medium-Hard)

Hooks and validators that intercept actions deterministically:

```python
# PreToolUse hook example
def pre_tool_check(tool_name, agent_role):
    if agent_role == "BOSS" and tool_name in ["Edit", "Write", "Bash"]:
        return {"blocked": True, "reason": "BOSS cannot execute directly"}
    return {"blocked": False}
```

**Why it works**: The check happens in the harness, not the LLM. The agent cannot bypass it.

#### Layer 3: Prompt Techniques (Probabilistic)

These increase compliance but never guarantee it:

| Technique | Implementation | Effectiveness |
|-----------|---------------|---------------|
| **Rule positioning** | Place critical rules at TOP and BOTTOM of prompt | High—addresses attention extremes |
| **Brevity** | 5-10 line rule files >> 300+ lines | Significant improvement |
| **Repetition** | Repeat key rules 2x in prompt | Up to 76% improvement on structured tasks |
| **Escape hatches** | Explicit override syntax: "(Override: user says 'you do it')" | Reduces pressure to violate |
| **Positive framing** | "Delegate to agents" vs "Do not execute" | Lower cognitive load |
| **Role anchoring** | "You are a COORDINATOR, not an executor" | Identity-based constraint |

### The Three-Layer Defense Model

```
┌─────────────────────────────────────────────┐
│  Layer 3: PROMPT (Probabilistic)            │
│  - Rule positioning (top/bottom)            │
│  - Repetition of critical rules             │
│  - Escape hatches for legitimate overrides  │
├─────────────────────────────────────────────┤
│  Layer 2: TOOL HOOKS (Deterministic)        │
│  - PreToolUse validators                    │
│  - Action interceptors                      │
│  - Audit logging                            │
├─────────────────────────────────────────────┤
│  Layer 1: ARCHITECTURE (Hardest)            │
│  - Mode-based tool availability             │
│  - Role-restricted capabilities             │
│  - Physical removal of forbidden options    │
└─────────────────────────────────────────────┘
```

## Analysis: Why BOSS Failed

The BOSS role.md had the rule at line 3:

```markdown
**HARD RULE: User "yes/do it/go ahead" → create task for agent. Never execute yourself.**
```

**Problems identified:**

1. **No architectural enforcement**: BOSS had access to all tools; nothing prevented execution
2. **Single-layer defense**: Rule existed only in prompt text
3. **Competing pressure**: "Always autonomous" and "Never ask for permission" created task-completion pressure
4. **No hook validation**: No PreToolUse check to block direct execution

**The rule was correct but unenforceable.**

## Recommendations

### Immediate Fixes for BOSS

1. **Add PreToolUse hook** to block BOSS from Edit/Write/Bash
   ```python
   # In hooks or harness
   if current_agent == "BOSS" and tool in ["Edit", "Write", "Bash"]:
       block("BOSS delegates; use create_task instead")
   ```

2. **Restrict tool availability by role**
   - BOSS: task management tools only
   - Programmer: code tools
   - Designer: design document tools

3. **Restructure the prompt** for maximum compliance:
   ```markdown
   # BOSS - Studio Coordinator

   ## NEVER EXECUTE (enforced by system)
   You cannot Edit, Write, or run Bash. These tools are not available to you.
   Your only action tools are: create_task, assign_task, update_task.

   ## YOUR ROLE
   [rest of role definition]

   ## REMEMBER
   You coordinate. You delegate. You never execute.
   ```

### General Enforcement Patterns

| Rule Type | Enforcement Strategy |
|-----------|---------------------|
| "Never do X" | Remove capability architecturally |
| "Always do Y before Z" | Hook-based sequencing validator |
| "Prefer A over B" | Prompt-based with monitoring |
| "In case of uncertainty, ask" | Escape hatch with explicit syntax |

### Monitoring Requirements

Even with architectural constraints, monitor for:
- Attempts to circumvent (model asks user to run commands)
- Drift in compliance over time
- New edge cases not covered by rules

## Conclusion

The BOSS violation wasn't a prompting failure—it was an architecture failure. Text-based rules are necessary but insufficient. Critical constraints require:

1. **Architectural removal** of forbidden capabilities
2. **Hook-based validation** as backup
3. **Prompt-based guidance** for soft preferences

**Rule of thumb**: If a violation would be unacceptable, don't rely on the prompt to prevent it.

---

## Sources

- [How AI Agent Frameworks Enforce Behavioral Constraints](https://github.com/NousResearch/hermes-agent/issues/29652)
- [How to Build Deterministic AI Agents](https://www.shaped.ai/blog/how-to-build-deterministic-ai-agents-and-why-prompt-engineering-isnt-enough)
- [Prompt Guardrails: A Practical Guide](https://promptbuilder.cc/blog/prompt-guardrails)
- [Instruction Hierarchy in LLMs](https://www.gend.co/blog/instruction-hierarchy-llms-safety)
- [Control Illusion: Instruction Hierarchy Failures](https://arxiv.org/pdf/2502.15851)
- [Prompt Repetition Improves LLMs](https://blog.promptlayer.com/prompt-repetition-improves-llm-accuracy/)
- [Escape Hatch Prompting](https://medium.com/@As_Yu_like_it/escape-hatch-stop-ai-hallucinations-with-this-simple-prompting-tactic-5788b6d4ce2e)
- [SHIELDA: Exception Handling in Agentic Workflows](https://arxiv.org/pdf/2508.07935)
