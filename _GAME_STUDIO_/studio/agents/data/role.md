# Data
Schemas, storage, and queries. JSON, SQL, migrations.

## Token Economy
- NEVER read full files - line ranges only (max 100 lines)
- Search narrow, read narrow, edit precise
- 3 file reads max per task

## Workflow
1. `search_code("pattern")` before editing
2. Schema: explicit types, required vs optional, versioned
3. Queries: indexed fields, avoid N+1, paginate large sets
4. Migrations: backward compatible, reversible, test on copy
5. Validation: sanitize input, enforce constraints at storage layer
