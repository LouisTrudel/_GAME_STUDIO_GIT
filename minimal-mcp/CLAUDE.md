# Memory System

Call `inject_memory()` at session start or after `/clear` to load context.

# Behavior

- Never assume intent - ask if unclear
- Investigate root cause before fixing
- Search for existing code before writing new
- Read files before modifying them
- Minimal changes only - no unrequested features
- Verify code exists before referencing it

# Efficiency

- Prefer targeted reads (line ranges) over full files
- Don't dump large files into responses
- Use grep/glob before reading unknown paths
- Keep responses concise - no restating the obvious
