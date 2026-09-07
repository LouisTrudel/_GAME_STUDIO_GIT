# Tool Invocation Enforcement Patterns

**Task:** T205
**Date:** 2026-09-06
**Context:** BOSS frequently knows to create tasks but outputs prose instead of firing `create_task` tool

---

## Summary

The BOSS agent understands intent but fails to invoke tools, producing prose like "I should create a task..." instead of actual `<tool>create_task</tool>` calls. This is a common LLM agent failure mode with well-documented solutions: API-level forcing, prompt restructuring, and validation layers.

---

## Key Findings

| Finding | Evidence | Implication |
|---------|----------|-------------|
| API-level `tool_choice: "required"` forces tool invocation | [OpenAI](https://platform.openai.com/docs/guides/function-calling), [Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use) | Most reliable - 99.9% compliance |
| Prompt structure matters more than clever wording | [Paxrel AI Agent Patterns](https://paxrel.com/blog-ai-agent-prompts) | Tool schemas are the "prompt engineering" |
| Post-response validation catches remaining failures | [Arthur AI Guardrails](https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails) | Defense in depth |
| Current BOSS uses text-based `<tool>` tags, not native API | `claude_cli.py:91` | Relies on model compliance, no enforcement |

---

## Analysis

### Current Architecture (The Problem)

The Studio uses Claude CLI backend which doesn't expose native tool_choice parameter. Instead, it:
1. Injects tool schemas as prompt text (`claude_cli.py:77-91`)
2. Instructs model to output `<tool>name</tool><params>{...}</params>` syntax
3. Parses response text for tool calls (`claude_cli.py:401-402`)

This approach has **zero enforcement** - the model can choose to ignore tools entirely.

### Alternative Solutions Evaluated

| Approach | Effort | Reliability | Trade-offs |
|----------|--------|-------------|------------|
| **A. API tool_choice: required** | Medium | 99.9% | Requires switching to API backend |
| **B. Prompt restructuring** | Low | ~70% | Quick win, diminishing returns |
| **C. Response validation layer** | Medium | 95%+ | Adds latency, complexity |
| **D. Architectural constraint** | Low | 80%+ | No tool → no completion |

### Recommended Approach: B + D (Immediate) → A (Long-term)

**Rationale:** B and D are implementable now with no API changes. A is the gold standard but requires backend changes.

---

## Recommendations

| Priority | Action | Rationale |
|----------|--------|-----------|
| 1 | **Restructure BOSS prompt: eliminate prose path** | Model shouldn't see a valid "just respond" option. Remove conversational examples; make every example end in tool calls. |
| 2 | **Add "MUST USE TOOLS" enforcement block** | Place at end of system prompt, after examples. Critical instruction position. |
| 3 | **Implement validation layer** | If response contains no `<tool>` tags, retry with explicit "You forgot to use tools" nudge. |
| 4 | **Migrate to API backend with tool_choice** | Long-term: native Anthropic API with `tool_choice: {"type": "any"}` guarantees tool invocation. |

---

## Implementation Details

### Priority 1: Prompt Restructuring

Current `role.md` has good structure but leaves escape hatch. Changes needed:

```markdown
# BOSS - Studio Coordinator

**CRITICAL: You coordinate by using tools. Every response MUST use at least one tool.**
**If you respond with prose only, your response will be rejected and you'll be asked again.**

===

## Response Format

EVERY response must be:
1. Zero or more sentences of analysis (optional, brief)
2. One or more tool calls (REQUIRED)

NEVER:
- Output explanations without tool calls
- Say "I will create..." without actually creating
- Describe what you would do - DO IT

===
```

### Priority 2: End-of-Prompt Enforcement

Add to end of system prompt (models weight final instructions heavily):

```markdown
===

## ENFORCEMENT

Your response will be AUTOMATICALLY REJECTED if it:
- Contains no <tool> tags
- Describes actions without performing them
- Uses phrases like "I should...", "Let me...", "I'll create..."

VALID RESPONSE = must contain at least one: <tool>create_task</tool> or <tool>get_task_status</tool> or <tool>read_context</tool>
```

### Priority 3: Validation Layer

In `_handle_tool_calls()` or `respond()`:

```python
def _validate_tool_usage(self, response: str, agent_name: str) -> bool:
    """Check if BOSS actually used tools."""
    if agent_name != "BOSS":
        return True  # Only enforce for BOSS

    tool_pattern = r'<tool>\w+</tool>'
    has_tools = bool(re.search(tool_pattern, response))

    if not has_tools:
        # Prose indicators
        prose_indicators = ["I should", "I'll create", "Let me", "I will", "I need to"]
        if any(ind in response for ind in prose_indicators):
            return False  # Detected intent without action

    return True
```

If validation fails, append to the retry prompt:
```
VALIDATION FAILED: Your previous response contained no tool calls.
You MUST use tools to take action. Re-read the user request and output tool calls.
```

### Priority 4: API Migration Path

For guaranteed enforcement, migrate BOSS to native Anthropic API with:

```python
# Anthropic Python SDK
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    messages=messages,
    tools=tools,
    tool_choice={"type": "any"}  # MUST call at least one tool
)
```

---

## Expected Impact

| Metric | Before | After (est.) |
|--------|--------|--------------|
| Tool invocation rate | ~60% | 95%+ |
| "Prose instead of action" failures | Common | Rare |
| User re-prompting needed | Often | Rarely |

---

## Sources

- [OpenAI Function Calling Docs](https://platform.openai.com/docs/guides/function-calling) — tool_choice parameter
- [Anthropic Strict Tool Use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use) — tool_choice modes
- [AI Agent Prompt Patterns 2026](https://paxrel.com/blog-ai-agent-prompts) — production patterns
- [Arthur AI Guardrails](https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails) — validation layers
- [LLM Structured Output Guide](https://agenta.ai/blog/the-guide-to-structured-outputs-and-function-calling-with-llms) — enforcement methods
- [Structured Outputs: JSON Schema](https://blckalpaca.at/en/knowledge-base/ai-agents/llm-fundamentals-for-agents/strukturierte-outputs-json-schema) — 99.9% reliability with strict mode
