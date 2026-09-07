# LangChain Output Parsers Research Report

## Summary

LangChain enforces structured output through **three layers**: native provider APIs (`with_structured_output`), Pydantic validation, and self-correcting retry parsers. Our `[WHAT]/[CONTEXT]/[CONSTRAINTS]` structure is a **prompt-based format** without programmatic validation—simpler but less reliable. Key insight: LangChain's approach is designed for **structured data extraction** (JSON→database), while our tasks need **natural language compliance**—different problems.

## Key Findings

### 1. LangChain's Three Enforcement Strategies

| Strategy | How It Works | Reliability |
|----------|--------------|-------------|
| **Native API** | Provider enforces schema (OpenAI JSON mode) | Highest—guaranteed |
| **Tool Schema** | LLM "calls a tool" matching the schema | High—model follows tool spec |
| **Parser + Retry** | Parse output, retry on failure | Medium—may need 2-3 attempts |

### 2. Parser Types

**PydanticOutputParser:**
```python
class TaskOutput(BaseModel):
    what: str = Field(description="Action to perform")
    context: str = Field(description="Background info")
    constraints: list[str] = Field(description="Boundaries")

parser = PydanticOutputParser(pydantic_object=TaskOutput)
```
- Validates structure AND types
- Field descriptions guide LLM behavior
- Raises exception on malformed output

**JsonOutputParser:**
- Lighter—validates JSON structure only
- No type checking
- Faster parsing

**OutputFixingParser / RetryWithErrorOutputParser:**
- Wraps a base parser
- On failure: sends error message + original output back to LLM
- LLM attempts to fix its own malformed response
- Max 2-3 retries typical

### 3. The `with_structured_output` Method

```python
structured_llm = model.with_structured_output(TaskOutput)
result = structured_llm.invoke("Create a task for implementing login")
# result is a validated TaskOutput object
```

- Binds schema to model
- Provider handles enforcement when available
- Falls back to tool-calling schema

### 4. Format Instructions Pattern

LangChain injects explicit format instructions:
```
Respond with JSON matching this schema:
{
  "what": "string",
  "context": "string",
  "constraints": ["string"]
}
```

These are **appended to prompts automatically** by the parser.

## Comparison to Studio's `[WHAT]/[CONTEXT]/[CONSTRAINTS]`

| Aspect | LangChain Output Parsers | Studio Task Format |
|--------|--------------------------|-------------------|
| **Enforcement** | Programmatic validation | Trust agent compliance |
| **Schema** | Pydantic BaseModel | Markdown convention |
| **Failure handling** | Retry with error feedback | None—task proceeds |
| **Format injection** | Auto-generated from schema | Documented in skills |
| **Use case** | Structured data extraction | Natural language tasks |
| **Overhead** | Higher (validation, retries) | Lower |

### Our Current Pattern (from `tasks.md`):
```
"description": "[WHAT] Implement shop UI [CONTEXT] Per designer spec [CONSTRAINTS] Use existing inventory system"
```

**Strengths:**
- Human-readable
- No validation overhead
- Flexible natural language

**Weaknesses:**
- No enforcement—agents can ignore structure
- No retry on malformed output
- Inconsistent compliance across agents

## Analysis

### When LangChain Parsers Make Sense
1. **Extracting structured data** (JSON→database)
2. **Multi-step pipelines** where downstream steps need specific keys
3. **Integration with external systems** requiring strict schemas
4. **High-stakes outputs** where format errors cause failures

### When They DON'T Make Sense
1. **Natural language responses** (our task results)
2. **Human-reviewed outputs** (QA catches format issues)
3. **Simple format conventions** (`[WHAT]` is guidance, not schema)
4. **Token-sensitive systems** (retry = 2-3x tokens)

### Studio's Real Problem

Our `[WHAT]/[CONTEXT]/[CONSTRAINTS]` isn't about structured data extraction—it's about **clear task communication**. The format is a prompt engineering pattern, not a data schema.

**Evidence:** Our `Task` dataclass (tasks.py:62-160) stores:
- `description: str` (the full `[WHAT]/[CONTEXT]/[CONSTRAINTS]` string)
- `output_response: str` (free-form agent output)

No structured parsing occurs. The brackets are **conventions agents follow**, not machine-validated schemas.

## Recommendations

### 1. Don't Add Output Parsers
- Overhead outweighs benefit for natural language tasks
- Our agents produce prose, not JSON
- QA agent already reviews outputs

### 2. DO Improve Format Compliance Through Prompts
Add explicit format requirements to skills where structure matters:

```markdown
## Output Format
You MUST structure your response as:
- **[WHAT]**: Single sentence action
- **[CONTEXT]**: Background/rationale
- **[CONSTRAINTS]**: Numbered list of boundaries

Example:
[WHAT] Implement player inventory system
[CONTEXT] Players need to manage items during gameplay
[CONSTRAINTS] 1) Max 50 slots 2) Stack same items 3) No persistence yet
```

### 3. Consider Lightweight Validation for BOSS Task Creation
If BOSS creates malformed tasks, add a simple check:

```python
def validate_task_format(description: str) -> tuple[bool, str]:
    """Check task has [WHAT], [CONTEXT], [CONSTRAINTS]."""
    required = ["[WHAT]", "[CONTEXT]", "[CONSTRAINTS]"]
    missing = [r for r in required if r not in description]
    if missing:
        return False, f"Missing: {', '.join(missing)}"
    return True, ""
```

No LLM retry—just reject malformed tasks with clear error.

### 4. Adopt Self-Correction Pattern for Critical Outputs Only
If a specific skill needs structured output (e.g., design specs → code):

```markdown
## Self-Check
Before completing, verify your output contains:
- [ ] All required sections present
- [ ] Constraints are numbered
- [ ] No ambiguous language ("maybe", "perhaps")

If any check fails, revise before submitting.
```

This is **prompt-based self-correction**—cheaper than parser retries.

---

**Sources:**
- [Structured Output in LangChain - Medium](https://medium.com/@manasabehera5901/structured-output-in-langchain-building-reliable-ai-systems-for-regulated-environments-65af3b3ab751)
- [LangChain Structured Output Docs](https://docs.langchain.com/oss/python/langchain/structured-output)
- [Mastering Structured Output with Pydantic - Medium](https://medium.com/@asmmorshedulhoque/mastering-structured-output-in-langchain-pydantic-typeddict-and-json-schema-573d67d5daa4)
- [Output Parsers Guide - Analytics Vidhya](https://www.analyticsvidhya.com/blog/2024/11/output-parsers/)
- [RetryWithErrorOutputParser - LangChain Docs](https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.retry.RetryWithErrorOutputParser.html)
- [LangChain fix.py Source](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/output_parsers/fix.py)
- [Structured Output Tricks - Medium](https://medium.com/@juanc.olamendy/parsing-llm-structured-outputs-in-langchain-a-comprehensive-guide-f05ffa88261f)
