#!/usr/bin/env python3
"""
PostToolUse hook: Block Read/Grep/Glob if output exceeds limits.
Returns JSON with deny decision and instructions to use smaller scope.
"""
import sys
import json

# Limits (in characters)
MAX_CHARS = 30000  # ~7500 tokens
MAX_LINES = 500

def main():
    try:
        hook_data = json.load(sys.stdin)
    except:
        sys.exit(0)  # No data, allow

    tool_name = hook_data.get("tool_name", "")
    tool_output = hook_data.get("tool_output", "")

    if not tool_output:
        sys.exit(0)  # No output, allow

    char_count = len(tool_output)
    line_count = tool_output.count("\n") + 1

    # Check limits
    exceeded = []
    if char_count > MAX_CHARS:
        exceeded.append(f"{char_count:,} chars (max {MAX_CHARS:,})")
    if line_count > MAX_LINES:
        exceeded.append(f"{line_count} lines (max {MAX_LINES})")

    if exceeded:
        # Build instruction based on tool
        if tool_name == "Read":
            instruction = "Use offset/limit params or read_lines MCP tool (max 200 lines)"
        elif tool_name == "Grep":
            instruction = "Add glob filter, use head_limit, or search narrower path"
        elif tool_name == "Glob":
            instruction = "Use more specific pattern or search subdirectory"
        else:
            instruction = "Request smaller scope"

        result = {
            "decision": "block",
            "reason": f"Output too large: {', '.join(exceeded)}. {instruction}"
        }
        print(json.dumps(result))
        sys.exit(2)  # Exit 2 = blocking error

    sys.exit(0)  # Allow

if __name__ == "__main__":
    main()
