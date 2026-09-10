"""
Taxonomy-specific tools for naming analysis and conventions.
Taxonomy is a worker that gets assigned naming/consistency review tasks by BOSS.
"""

from pathlib import Path
from studio.core.tasks import task_manager
from studio.core.hub import hub


ANALYZE_NAMING_SCHEMA = {
    "name": "analyze_naming",
    "description": """Scan a file or directory for naming inconsistencies.

Checks for:
- Mixed naming conventions (camelCase vs snake_case)
- Inconsistent prefixes (get_ vs fetch_ vs load_)
- Unclear or abbreviated names
- Redundant naming patterns

Returns a report of issues found with line numbers.""",
    "input_schema": {
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "File or directory path to analyze (relative to project root)"
            },
            "scope": {
                "type": "string",
                "enum": ["functions", "variables", "files", "all"],
                "description": "What to analyze: functions, variables, files, or all"
            }
        },
        "required": ["path"]
    }
}


def analyze_naming(path: str, scope: str = "all") -> str:
    """Analyze naming patterns in a file or directory."""
    import re

    project_root = Path(__file__).parent.parent.parent.parent
    target = project_root / path

    if not target.exists():
        return f"Error: Path not found: {path}"

    issues = []
    patterns_found = {
        "snake_case": 0,
        "camelCase": 0,
        "PascalCase": 0,
        "SCREAMING_SNAKE": 0
    }

    def analyze_file(file_path: Path):
        if not file_path.suffix in ['.py', '.js', '.ts', '.tsx', '.jsx', '.lua']:
            return

        try:
            content = file_path.read_text(encoding='utf-8')
        except:
            return

        rel_path = file_path.relative_to(project_root)
        lines = content.split('\n')

        for i, line in enumerate(lines, 1):
            # Check function definitions
            if scope in ["functions", "all"]:
                # Python functions
                py_func = re.search(r'def\s+(\w+)\s*\(', line)
                if py_func:
                    name = py_func.group(1)
                    _categorize_name(name, patterns_found)
                    if _has_issue(name):
                        issues.append(f"{rel_path}:{i} - function `{name}`: {_describe_issue(name)}")

                # JS/TS functions
                js_func = re.search(r'(?:function|const|let|var)\s+(\w+)\s*(?:=\s*(?:async\s*)?\(|[\(:])', line)
                if js_func:
                    name = js_func.group(1)
                    _categorize_name(name, patterns_found)
                    if _has_issue(name):
                        issues.append(f"{rel_path}:{i} - function `{name}`: {_describe_issue(name)}")

            # Check variable assignments
            if scope in ["variables", "all"]:
                # Skip constants (all caps is intentional)
                var_match = re.search(r'(?:let|const|var|self\.)\s*(\w+)\s*=', line)
                if var_match:
                    name = var_match.group(1)
                    if not name.isupper():  # Skip constants
                        _categorize_name(name, patterns_found)

    if target.is_file():
        analyze_file(target)
    else:
        for file_path in target.rglob('*'):
            if file_path.is_file():
                analyze_file(file_path)

    # Build report
    report = [f"## Naming Analysis: {path}\n"]
    report.append("### Pattern Distribution")
    for pattern, count in patterns_found.items():
        if count > 0:
            report.append(f"- {pattern}: {count}")

    if issues:
        report.append(f"\n### Issues Found ({len(issues)})")
        for issue in issues[:20]:  # Limit to 20
            report.append(f"- {issue}")
        if len(issues) > 20:
            report.append(f"- ... and {len(issues) - 20} more")
    else:
        report.append("\n### No naming issues found")

    return "\n".join(report)


def _categorize_name(name: str, patterns: dict):
    """Categorize a name into a naming convention pattern."""
    if name.isupper() and '_' in name:
        patterns["SCREAMING_SNAKE"] += 1
    elif '_' in name:
        patterns["snake_case"] += 1
    elif name[0].isupper():
        patterns["PascalCase"] += 1
    elif any(c.isupper() for c in name):
        patterns["camelCase"] += 1
    else:
        patterns["snake_case"] += 1


def _has_issue(name: str) -> bool:
    """Check if a name has potential issues."""
    # Single letter names (except common ones)
    if len(name) == 1 and name not in ['i', 'j', 'k', 'n', 'x', 'y', 'z', '_']:
        return True
    # Unclear abbreviations
    if len(name) <= 3 and name.islower() and name not in ['id', 'url', 'api', 'key', 'max', 'min', 'get', 'set', 'add', 'put']:
        return True
    # Mixed conventions (camel with underscore)
    if '_' in name and any(c.isupper() for c in name) and not name.isupper():
        return True
    return False


def _describe_issue(name: str) -> str:
    """Describe what's wrong with a name."""
    if len(name) == 1:
        return "single-letter name is unclear"
    if len(name) <= 3:
        return "abbreviation may be unclear, consider more descriptive name"
    if '_' in name and any(c.isupper() for c in name):
        return "mixed snake_case and camelCase"
    return "naming issue detected"


SUGGEST_CONVENTIONS_SCHEMA = {
    "name": "suggest_conventions",
    "description": """Propose naming conventions for a codebase or module.

Analyzes existing patterns and suggests standards to adopt.""",
    "input_schema": {
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "Directory to analyze for existing patterns"
            },
            "language": {
                "type": "string",
                "enum": ["python", "javascript", "typescript", "lua", "auto"],
                "description": "Language to generate conventions for (auto-detect if not specified)"
            }
        },
        "required": ["path"]
    }
}


def suggest_conventions(path: str, language: str = "auto") -> str:
    """Analyze a directory and suggest naming conventions."""
    project_root = Path(__file__).parent.parent.parent.parent
    target = project_root / path

    if not target.exists():
        return f"Error: Path not found: {path}"

    # Detect language from files
    extensions = {}
    for f in target.rglob('*'):
        if f.is_file() and f.suffix:
            extensions[f.suffix] = extensions.get(f.suffix, 0) + 1

    if language == "auto":
        if '.py' in extensions:
            language = "python"
        elif '.ts' in extensions or '.tsx' in extensions:
            language = "typescript"
        elif '.js' in extensions or '.jsx' in extensions:
            language = "javascript"
        elif '.lua' in extensions:
            language = "lua"
        else:
            language = "unknown"

    conventions = {
        "python": """## Python Naming Conventions

### Functions & Methods
- Use `snake_case`: `get_user_data()`, `calculate_total()`
- Prefix getters with `get_`: `get_status()`
- Prefix setters with `set_`: `set_config()`
- Prefix boolean checks with `is_`/`has_`/`can_`: `is_valid()`, `has_permission()`

### Variables
- Use `snake_case`: `user_count`, `max_retries`
- Constants use `SCREAMING_SNAKE_CASE`: `MAX_CONNECTIONS`, `DEFAULT_TIMEOUT`

### Classes
- Use `PascalCase`: `UserManager`, `TaskQueue`

### Files
- Use `snake_case`: `user_manager.py`, `task_queue.py`
""",
        "javascript": """## JavaScript Naming Conventions

### Functions
- Use `camelCase`: `getUserData()`, `calculateTotal()`
- Prefix boolean returns with `is`/`has`/`can`: `isValid()`, `hasPermission()`

### Variables
- Use `camelCase`: `userCount`, `maxRetries`
- Constants use `SCREAMING_SNAKE_CASE`: `MAX_CONNECTIONS`

### Classes
- Use `PascalCase`: `UserManager`, `TaskQueue`

### Files
- Components: `PascalCase.jsx`
- Utilities: `camelCase.js`
""",
        "typescript": """## TypeScript Naming Conventions

### Functions
- Use `camelCase`: `getUserData()`, `calculateTotal()`
- Prefix boolean returns with `is`/`has`/`can`: `isValid()`, `hasPermission()`

### Interfaces & Types
- Use `PascalCase`: `UserData`, `TaskConfig`
- NO `I` prefix for interfaces: use `User`, not `IUser`

### Enums
- Use `PascalCase` for enum name and values: `enum Status { Active, Inactive }`

### Files
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `types.ts` or `ComponentName.types.ts`
""",
        "lua": """## Lua Naming Conventions (Roblox)

### Functions
- Use `PascalCase` for public: `GetUserData()`, `CalculateTotal()`
- Use `camelCase` for local: `getUserData()`, `calculateTotal()`

### Variables
- Local variables: `camelCase`
- Module-level: `PascalCase`

### Services & Modules
- Use `PascalCase`: `UserService`, `DataManager`

### Events
- Use `PascalCase` with action: `OnPlayerJoined`, `OnItemCollected`
"""
    }

    return conventions.get(language, f"No conventions template for {language}. Detected extensions: {extensions}")


REPORT_ISSUE_SCHEMA = {
    "name": "report_issue",
    "description": """Report a taxonomy/naming issue for another agent to fix.

Creates a task for the responsible agent with specific rename recommendations.""",
    "input_schema": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Short issue title (e.g., 'Inconsistent API naming in tasks.py')"
            },
            "description": {
                "type": "string",
                "description": "Detailed description: what's wrong, where, and recommended fix"
            },
            "assignee": {
                "type": "string",
                "description": "Agent to fix the issue: Programmer, Designer, Artist, Writer"
            },
            "priority": {
                "type": "string",
                "enum": ["high", "medium", "low"],
                "description": "Priority level based on impact"
            }
        },
        "required": ["title", "description", "assignee"]
    }
}


def report_issue(title: str, description: str, assignee: str, priority: str = "medium") -> str:
    """Report a taxonomy issue as a task for another agent."""
    # Normalize assignee (BOSS is uppercase, others capitalized)
    if assignee.lower() == "boss":
        assignee = "BOSS"
    else:
        assignee = assignee.capitalize()

    full_desc = f"[STRUCTURE - {priority.upper()}] {title}\n\n{description}"
    task = task_manager.create_task(full_desc, assignee)

    hub.post("Structure", f"@{assignee} Naming issue: {task.id} - {title}")
    return f"Issue {task.id} created and assigned to {assignee}: {title}"


# Tool bundle
TOOLS = [
    ANALYZE_NAMING_SCHEMA,
    SUGGEST_CONVENTIONS_SCHEMA,
    REPORT_ISSUE_SCHEMA,
]

HANDLERS = {
    "analyze_naming": analyze_naming,
    "suggest_conventions": suggest_conventions,
    "report_issue": report_issue,
}
