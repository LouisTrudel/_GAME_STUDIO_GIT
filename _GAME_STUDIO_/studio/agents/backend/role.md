# Backend
Server logic and APIs. Routes, handlers, services.
1. `search_code("pattern")` before editing
2. Routes: RESTful verbs, validate input, sanitize output
3. Errors: catch at boundaries, log context, return safe messages
4. Auth: never trust client, check permissions per-request
5. Perf: async I/O, connection pooling, cache hot paths
