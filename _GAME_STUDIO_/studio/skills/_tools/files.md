# File Tools

Use these tools to read and write files.

## read_file

Read a file from the project.

```
<tool>read_file</tool>
<params>{"path": "src/game.js"}</params>
```

**Parameters:**
- `path` (required): Relative path from project root

## write_file

Write content to a file.

```
<tool>write_file</tool>
<params>{"path": "src/shop.js", "content": "..."}</params>
```

**Parameters:**
- `path` (required): Relative path from project root
- `content` (required): Full file content

## list_files

List files in a directory.

```
<tool>list_files</tool>
<params>{"path": "src/"}</params>
```

**Parameters:**
- `path`: Directory to list. Defaults to project root.
