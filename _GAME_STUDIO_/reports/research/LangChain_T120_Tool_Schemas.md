# LangChain Tool Schemas Research Report

## Summary

LangChain defines tool interfaces through **three layers**: Python type hints + docstrings → Pydantic schemas → provider-specific JSON (OpenAI, Anthropic, Gemini). The key insight: **schema quality directly impacts LLM tool-calling accuracy**—vague descriptions = misuse. Our `employee_tools.py` already uses a similar JSON schema pattern; the gap is **parameter-level descriptions** and **docstring parsing**.

## Key Findings

### 1. Tool Definition Hierarchy

| Level | Definition | Schema Generation |
|-------|------------|-------------------|
| **@tool decorator** | Function + docstring + type hints | Auto-inferred |
| **StructuredTool** | Function + explicit `args_schema` (Pydantic) | From BaseModel |
| **BaseTool subclass** | Full control, override `args_schema` property | Manual |

All methods ultimately produce a JSON schema with: `name`, `description`, `parameters` (or `input_schema`).

### 2. Schema Anatomy

```python
# LangChain tool schema (OpenAI format)
{
    "name": "create_task",
    "description": "Create a task with clear description",
    "parameters": {
        "type": "object",
        "properties": {
            "description": {
                "type": "string",
                "description": "What to do, context, constraints"
            },
            "assignee": {
                "type": "string",
                "enum": ["Designer", "Programmer", "QA"],
                "description": "Agent to assign task to"
            }
        },
        "required": ["description"]
    }
}
```

**Critical fields:**
- `name`: Snake_case, unique identifier
- `description`: First-line summary—**LLM uses this to decide when to call**
- `properties.*.description`: Per-parameter guidance—**most often missing**

### 3. Pydantic Schema Pattern

```python
from pydantic import BaseModel, Field

class CreateTaskInput(BaseModel):
    """Create a new task for an agent."""
    description: str = Field(
        ...,  # required
        description="Clear description with [WHAT], [CONTEXT], [CONSTRAINTS]"
    )
    assignee: str = Field(
        default="Programmer",
        description="Target agent (Designer, Programmer, Artist, Writer, QA)"
    )

@tool(args_schema=CreateTaskInput)
def create_task(description: str, assignee: str) -> str:
    ...
```

- `Field(description=...)` generates per-parameter descriptions
- Class docstring becomes tool description
- Validators can enforce constraints

### 4. Provider-Specific Conversion

| Provider | bind_tools Format | Key Difference |
|----------|------------------|----------------|
| OpenAI | `"parameters": {...}` | Original format |
| Anthropic | `"input_schema": {...}` | Same structure, different key |
| Gemini | `"function_declarations": [...]` | Wrapped in array |

LangChain's `convert_to_openai_function()` and `convert_to_anthropic_function()` handle translation.

### 5. Best Practices from LangChain

| Practice | Why It Matters |
|----------|---------------|
| **Snake_case names** | Consistency, no spaces |
| **Action-verb descriptions** | "Create a task" not "Task creation" |
| **Parameter descriptions** | LLM knows what to pass |
| **Type hints + enums** | Constrain valid values |
| **Examples in docstring** | Show expected format |
| **`parse_docstring=True`** | Extract param docs from Google-style docstrings |

### 6. Comparison to Studio's Current Approach

**Our `employee_tools.py` pattern (line 33-41):**
```python
GET_MY_TASKS_SCHEMA = {
    "name": "get_my_tasks",
    "description": "Get all tasks assigned to you.",
    "input_schema": {
        "type": "object",
        "properties": {},
        "required": []
    }
}
```

**What we do well:**
- JSON schema structure ✓
- Tool names are clear ✓
- Using `input_schema` key (Anthropic-compatible) ✓

**Gaps:**
- Parameter descriptions sometimes minimal (e.g., `load_skill` line 100-103)
- No enum constraints for `assignee` values
- No examples in descriptions
- Tool descriptions are statement-form ("Get all tasks") not action-guidance ("Use to retrieve your current task queue")

## Analysis

### Schema Quality = Tool-Calling Accuracy

LangChain's research shows:
1. **Vague descriptions** → LLM calls wrong tool or wrong parameters
2. **Missing param descriptions** → LLM guesses parameter format
3. **No enums** → LLM invents invalid values

Our `signal_agent` schema (line 230-251) is a good example:
- `to_agent`: Has description but no enum—agent might invent "Coder" instead of "Programmer"
- `message`: Description says "be specific" but no format guidance

### When Schemas Matter Most

1. **Multi-tool environments** (like our agents)—need to distinguish tools
2. **Complex parameters** (objects, arrays)—need structure guidance
3. **Constrained values** (agent names, statuses)—need enums

### When Schemas Matter Less

1. **Single-purpose tools**—only one thing to call
2. **Simple parameters**—obvious from name
3. **Human-in-loop**—errors caught before execution

## Recommendations

### 1. Add Enums for Constrained Values

```python
SIGNAL_AGENT_SCHEMA = {
    "name": "signal_agent",
    "description": "Send a message to another agent via CONTEXT.md. Use when they need information for their work.",
    "input_schema": {
        "type": "object",
        "properties": {
            "to_agent": {
                "type": "string",
                "enum": ["Designer", "Programmer", "Artist", "Writer", "QA", "Taxonomy", "Context"],
                "description": "Target agent to notify"
            },
            ...
        }
    }
}
```

**Already done for `create_suggestion`** (line 268-270)—apply pattern to other tools.

### 2. Enhance Parameter Descriptions

Current (line 100-103):
```python
"skill_path": {
    "type": "string",
    "description": "Skill path like ':code/roblox/client' or 'templates/datastore'"
}
```

Improved:
```python
"skill_path": {
    "type": "string",
    "description": "Colon-prefixed skill path from your router (e.g., ':code/roblox/client'). See list_skills for available paths."
}
```

### 3. Use Action-Oriented Tool Descriptions

| Current | Improved |
|---------|----------|
| "Get all tasks assigned to you." | "Retrieve your current task queue. Call at start of work to see what's pending." |
| "Load a skill or template into context." | "Inject a skill's instructions into your context. Required before implementing patterns." |

### 4. Add When-to-Use Guidance

Borrow from LangChain's pattern of including usage hints:

```python
"description": "Log a checkpoint step in your current task. Call this at key progress points: after completing a function, finishing a file, or reaching a milestone. Helps track multi-step execution."
```

### 5. Consider Minimal Pydantic Wrapper (Optional)

If type enforcement becomes an issue:

```python
from pydantic import BaseModel, Field

class LoadSkillInput(BaseModel):
    skill_path: str = Field(
        ...,
        description="Colon-prefixed skill path",
        pattern=r"^:?[\w/]+$"  # Regex validation
    )

# Then use: tool_schema = LoadSkillInput.model_json_schema()
```

Adds validation without changing existing architecture.

### 6. Skip Auto-Generated Schemas

Our manual JSON schema approach is fine—LangChain's auto-generation adds dependency overhead. Keep current pattern, just enrich the descriptions.

---

**Sources:**
- [LangChain Tools Documentation](https://docs.langchain.com/oss/python/langchain/tools)
- [Tool Calling with LangChain Blog](https://www.langchain.com/blog/tool-calling-with-langchain)
- [StructuredTool Reference](https://reference.langchain.com/python/langchain-core/tools/structured/StructuredTool)
- [bind_tools Reference](https://reference.langchain.com/python/langchain-openai/chat_models/base/BaseChatOpenAI/bind_tools)
- [Convert to OpenAI Functions Guide](https://python.langchain.com/v0.2/docs/how_to/tools_as_openai_functions/)
- [Tools and Function Calling - DeepWiki](https://deepwiki.com/langchain-ai/langchain/2.3-tools-and-function-calling)
- [@tool decorator parse_docstring issue #34292](https://github.com/langchain-ai/langchain/issues/34292)
- [Pydantic-Powered Schemas & Toolable Agents](https://medium.com/@jagadeshvarma/implementing-llm-applications-using-langchain-part-4-pydantic-powered-schemas-toolable-agents-7d3446bfefbc)
