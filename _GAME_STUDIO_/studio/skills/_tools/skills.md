# Skill Tools

Use these tools to load additional skills and templates.

## load_skill

Load a skill or template into your context.

```
<tool>load_skill</tool>
<params>{"skill_path": ":code/economy"}</params>
```

**Parameters:**
- `skill_path` (required): Path like `:code/economy` or `:templates/datastore`

**Common paths:**
- `:code/*` - Programming patterns
- `:design/*` - Design frameworks
- `:writing/*` - Writing guidelines
- `:art/*` - Art specifications
- `:templates/*` - Copy-paste code

## list_skills

Browse available skills.

```
<tool>list_skills</tool>
<params>{"category": "code"}</params>
```

**Parameters:**
- `category`: Folder to list (e.g., "code", "code/patterns"). Omit for root.

## get_my_tasks

Get your assigned tasks.

```
<tool>get_my_tasks</tool>
<params>{}</params>
```

Returns all tasks assigned to you with their status.
