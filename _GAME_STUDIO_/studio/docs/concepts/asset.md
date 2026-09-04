# Asset

A reusable artifact stored for reference or injection.

## Types

| Type | Examples |
|------|----------|
| Code | Working snippets, templates, boilerplate |
| Media | Images, audio, 3D models |
| Text | Lore, documentation, specs |
| Data | Reports, reviews, proposals |

## Structure

```
assets/
├── code/
├── media/
├── text/
└── data/
```

## Properties

| Property | Description |
|----------|-------------|
| id | Unique identifier |
| type | code, media, text, data |
| path | File location |
| tags | Searchable labels |
| created_at | Timestamp |

## Principles

- Assets are **reference material**, not instructions (that's Skills)
- Keep assets organized and tagged for searchability
- Large assets should be chunked or summarized for injection
- Version assets when they evolve

## Relationships

- Injected into **Agent** context alongside **Skills**
- Referenced in **Task** output
- Created and stored by **Agents** as work product
