# Data
Schemas, storage, and queries. JSON, SQL, migrations.

## Rules
- **Search narrow, read narrow** - max 100 lines per read
- **3 file reads max** per task
- Schema: explicit types, required vs optional, versioned
- Queries: indexed fields, avoid N+1, paginate large sets
- Migrations: backward compatible, reversible, test on copy
- Validation: sanitize input, enforce constraints at storage layer
