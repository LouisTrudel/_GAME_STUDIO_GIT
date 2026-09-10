"""
Projects manager - handles external project references.

Projects are external folders (outside this repo) that contain:
- white_paper.md: Game concept document
- roadmap.md: Development milestones
- assets/: 3D models, textures, etc.

Studio only stores references (paths), never copies the content.

T425: Projects can be:
- external: Created by Studio in external directory (new flow)
- legacy: Existing project linked manually (backward compat)
"""

import json
import re
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Optional

from .logging_config import get_logger

logger = get_logger("Projects")

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "projects.json"
MAX_FILE_PREVIEW_SIZE = 50 * 1024  # 50KB limit


class ProjectStatus(Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class ProjectType(Enum):
    EXTERNAL = "external"  # Created by Studio in external directory
    LEGACY = "legacy"      # Existing folder linked manually (backward compat)


class PipelineState(Enum):
    """Project creation pipeline states (T434)."""
    SETUP = "setup"        # Folder created, no whitepaper content
    DRAFT = "draft"        # Whitepaper in progress (first AI response)
    CLARIFY = "clarify"    # Refining with user input
    DISPATCH = "dispatch"  # BOSS decomposing into tasks
    DELIVERED = "delivered"  # All phases complete


@dataclass
class Project:
    id: str
    name: str
    path: str
    description: str = ""
    status: ProjectStatus = ProjectStatus.ACTIVE
    project_type: ProjectType = ProjectType.LEGACY  # Default to legacy for backward compat
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())

    # T434: Pipeline state tracking
    pipeline_state: PipelineState = PipelineState.SETUP
    whitepaper_rating: int = 0  # 1-5 stars, 0 = not rated
    metadata: dict = field(default_factory=dict)  # project_type, subtype, engine

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "path": self.path,
            "description": self.description,
            "status": self.status.value,
            "type": self.project_type.value,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "path_exists": Path(self.path).exists(),
            # T434: Pipeline fields
            "pipeline_state": self.pipeline_state.value,
            "whitepaper_rating": self.whitepaper_rating,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Project":
        # Backward compat: default to "legacy" if type field missing
        project_type_str = data.get("type", "legacy")
        try:
            project_type = ProjectType(project_type_str)
        except ValueError:
            project_type = ProjectType.LEGACY

        # T434: Parse pipeline state with backward compat
        pipeline_str = data.get("pipeline_state", "setup")
        try:
            pipeline_state = PipelineState(pipeline_str)
        except ValueError:
            pipeline_state = PipelineState.SETUP

        return cls(
            id=data["id"],
            name=data["name"],
            path=data["path"],
            description=data.get("description", ""),
            status=ProjectStatus(data.get("status", "active")),
            project_type=project_type,
            created_at=data.get("created_at", datetime.now().isoformat()),
            updated_at=data.get("updated_at", datetime.now().isoformat()),
            # T434: Pipeline fields
            pipeline_state=pipeline_state,
            whitepaper_rating=data.get("whitepaper_rating", 0),
            metadata=data.get("metadata", {}),
        )


class ProjectManager:
    def __init__(self):
        self.projects: list[Project] = []
        self.counter: int = 0
        self.active_project_id: Optional[str] = None
        self._load()

    def _load(self):
        """Load projects from disk."""
        if DATA_FILE.exists():
            try:
                data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
                self.counter = data.get("counter", 0)
                self.active_project_id = data.get("active_project_id")
                self.projects = [Project.from_dict(p) for p in data.get("projects", [])]
            except Exception as e:
                logger.error("Load error: %s", e)
                self.projects = []
                self.counter = 0
                self.active_project_id = None
        else:
            self._save()

    def _save(self):
        """Persist projects to disk."""
        data = {
            "counter": self.counter,
            "active_project_id": self.active_project_id,
            "projects": [p.to_dict() for p in self.projects],
        }
        # Remove runtime fields before saving
        for p in data["projects"]:
            p.pop("path_exists", None)
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        DATA_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def get_all(self, include_archived: bool = False) -> list[Project]:
        """Get all projects, optionally including archived."""
        if include_archived:
            return self.projects
        return [p for p in self.projects if p.status == ProjectStatus.ACTIVE]

    def get(self, project_id: str) -> Optional[Project]:
        """Get a specific project by ID."""
        for p in self.projects:
            if p.id == project_id:
                return p
        return None

    def get_active(self) -> Optional[Project]:
        """Get the currently active project."""
        if self.active_project_id:
            return self.get(self.active_project_id)
        return None

    def create(self, name: str, path: str, description: str = "") -> Project:
        """Create a new project reference (legacy mode - link existing folder)."""
        # Check for duplicate path
        for p in self.projects:
            if p.path == path:
                raise ValueError(f"Path already linked to project {p.id}: {p.name}")

        self.counter += 1
        project = Project(
            id=f"P{self.counter:03d}",
            name=name[:50],  # Max 50 chars
            path=path,
            description=description[:200],  # Max 200 chars
            project_type=ProjectType.LEGACY,
        )
        self.projects.append(project)

        # Auto-set as active if first project
        if len(self.projects) == 1:
            self.active_project_id = project.id

        self._save()
        return project

    def create_external(
        self,
        name: str,
        parent_dir: str,
        description: str = "",
        init_git: bool = True,
        with_ai: bool = False,
        metadata: dict = None
    ) -> dict:
        """Create a new external project with folder scaffolding.

        T425: Creates folder, initializes git, scaffolds template files.
        T434: with_ai=True sets pipeline_state to DRAFT for AI whitepaper generation.

        Returns dict with project data or error message.
        """
        if not name or not name.strip():
            return {"error": "Project name is required"}

        name = name.strip()[:50]

        # Validate parent directory exists
        parent_path = Path(parent_dir)
        if not parent_path.is_dir():
            return {"error": f"Parent directory does not exist: {parent_dir}"}

        # Slugify name: "My Cool Game" -> "my-cool-game"
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        if not slug:
            return {"error": "Project name must contain at least one alphanumeric character"}

        # Build target path
        project_path = parent_path / slug

        # Check if path already exists
        if project_path.exists():
            return {"error": f"Folder already exists: {project_path}"}

        # Check if path already linked
        for p in self.projects:
            if p.path == str(project_path):
                return {"error": f"Path already linked to project {p.id}: {p.name}"}

        # Create directory
        try:
            project_path.mkdir(parents=True, exist_ok=False)
        except Exception as e:
            return {"error": f"Failed to create folder: {e}"}

        git_initialized = False
        git_warning = None

        # Initialize git if requested
        if init_git:
            if shutil.which('git'):
                try:
                    subprocess.run(
                        ['git', 'init'],
                        cwd=str(project_path),
                        capture_output=True,
                        check=True
                    )
                    git_initialized = True
                except subprocess.CalledProcessError as e:
                    git_warning = f"Git init failed: {e.stderr.decode()[:100]}"
            else:
                git_warning = "Git not found in PATH - skipped initialization"

        # Scaffold template files
        self._scaffold_project(project_path, name)

        # Register project
        self.counter += 1
        project = Project(
            id=f"P{self.counter:03d}",
            name=name,
            path=str(project_path),
            description=description[:200] if description else "",
            project_type=ProjectType.EXTERNAL,
            # T434: Set pipeline state based on creation mode
            pipeline_state=PipelineState.DRAFT if with_ai else PipelineState.SETUP,
            metadata=metadata or {},
        )
        self.projects.append(project)

        # Auto-set as active if first project
        if len(self.projects) == 1:
            self.active_project_id = project.id

        self._save()
        logger.info("Created external project %s at %s", project.id, project_path)

        result = project.to_dict()
        result["git_initialized"] = git_initialized
        if git_warning:
            result["git_warning"] = git_warning
        return result

    def _scaffold_project(self, project_path: Path, name: str):
        """Create scaffold files in new project folder."""
        # Create assets directory
        (project_path / "assets").mkdir(exist_ok=True)

        # Create whitepaper.md
        whitepaper_content = f"""# {name}

## Vision
[1-2 sentences: What is this and why does it matter?]

## Core Loop
[The main gameplay/interaction loop, step by step]

## Features
[Bulleted list of key features]

## Platform / Dependencies / MCPs
[Target platform, required services, APIs, MCP servers]

## Visuals
[Art style, visual references, UI approach]

## Audio
[Sound design, music style, voice acting needs]

## Camera
[Camera type, perspective, special behaviors]

## Particles
[VFX needs, particle systems]

## Animations
[Character animations, UI animations, transitions]

## Cinematics
[Cutscenes, intro/outro, story sequences]

## Scope

### MVP (Must Ship)
- [ ] Core feature 1
- [ ] Core feature 2

### Nice-to-Have
- [ ] Optional feature 1

### Explicitly Out of Scope
- Not doing X
- Not doing Y

## Success Criteria

| Criteria | Measurement |
|----------|-------------|
| Example  | How to measure |

---

## Notes
[Additional context, references, links]
"""
        (project_path / "whitepaper.md").write_text(whitepaper_content, encoding="utf-8")

        # Create roadmap.md
        roadmap_content = f"""# {name} - Roadmap

## Phase 1: Foundation
- [ ] Core mechanic prototype
- [ ] Basic art assets

## Phase 2: Polish
- [ ] Full art pass
- [ ] Sound/Music

## Phase 3: Launch
- [ ] Testing
- [ ] Release
"""
        (project_path / "roadmap.md").write_text(roadmap_content, encoding="utf-8")

        # Create .gitignore
        gitignore_content = """# Build artifacts
dist/
build/
*.log

# Dependencies
node_modules/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Temp
*.tmp
*.bak
"""
        (project_path / ".gitignore").write_text(gitignore_content, encoding="utf-8")

    def update(self, project_id: str, **kwargs) -> Optional[Project]:
        """Update a project's metadata."""
        project = self.get(project_id)
        if not project:
            return None

        if "name" in kwargs:
            project.name = kwargs["name"][:50]
        if "description" in kwargs:
            project.description = kwargs["description"][:200]
        if "path" in kwargs:
            # Check for duplicate
            for p in self.projects:
                if p.path == kwargs["path"] and p.id != project_id:
                    raise ValueError(f"Path already linked to project {p.id}")
            project.path = kwargs["path"]

        project.updated_at = datetime.now().isoformat()
        self._save()
        return project

    def set_active(self, project_id: str) -> bool:
        """Set the active project."""
        project = self.get(project_id)
        if not project or project.status == ProjectStatus.ARCHIVED:
            return False
        self.active_project_id = project_id
        self._save()
        return True

    def archive(self, project_id: str) -> bool:
        """Archive a project."""
        project = self.get(project_id)
        if not project:
            return False
        project.status = ProjectStatus.ARCHIVED
        project.updated_at = datetime.now().isoformat()

        # Clear active if archiving active project
        if self.active_project_id == project_id:
            self.active_project_id = None
            # Set next active project to first non-archived
            for p in self.projects:
                if p.status == ProjectStatus.ACTIVE:
                    self.active_project_id = p.id
                    break

        self._save()
        return True

    def unarchive(self, project_id: str) -> bool:
        """Restore an archived project."""
        project = self.get(project_id)
        if not project:
            return False
        project.status = ProjectStatus.ACTIVE
        project.updated_at = datetime.now().isoformat()
        self._save()
        return True

    def delete(self, project_id: str) -> bool:
        """Delete a project reference (does not delete external folder)."""
        project = self.get(project_id)
        if not project:
            return False
        self.projects.remove(project)

        # Clear active if deleting active project
        if self.active_project_id == project_id:
            self.active_project_id = None
            for p in self.projects:
                if p.status == ProjectStatus.ACTIVE:
                    self.active_project_id = p.id
                    break

        self._save()
        return True

    def read_document(self, project_id: str, doc_type: str) -> dict:
        """Read white_paper.md or roadmap.md from project folder.

        Returns:
            {"content": str, "exists": bool, "error": str|None, "truncated": bool}
        """
        project = self.get(project_id)
        if not project:
            return {"content": "", "exists": False, "error": "Project not found", "truncated": False}

        project_path = Path(project.path)
        if not project_path.exists():
            return {"content": "", "exists": False, "error": "Project folder not found", "truncated": False}

        # Support both naming conventions (whitepaper.md and white_paper.md)
        if doc_type == "white_paper":
            candidates = ["whitepaper.md", "white_paper.md"]
        else:
            candidates = ["roadmap.md"]

        doc_path = None
        for filename in candidates:
            candidate_path = project_path / filename
            if candidate_path.exists():
                doc_path = candidate_path
                break

        if not doc_path:
            return {"content": "", "exists": False, "error": f"No {candidates[0]} found", "truncated": False}

        try:
            size = doc_path.stat().st_size
            truncated = size > MAX_FILE_PREVIEW_SIZE

            if truncated:
                content = doc_path.read_text(encoding="utf-8")[:MAX_FILE_PREVIEW_SIZE]
                content += f"\n\n... (truncated, file is {size // 1024}KB)"
            else:
                content = doc_path.read_text(encoding="utf-8")

            return {"content": content, "exists": True, "error": None, "truncated": truncated}

        except Exception as e:
            return {"content": "", "exists": True, "error": str(e), "truncated": False}

    # =========================================================================
    # T434: Pipeline state management
    # =========================================================================

    def set_pipeline_state(self, project_id: str, state: PipelineState) -> bool:
        """Transition project to a new pipeline state."""
        project = self.get(project_id)
        if not project:
            return False
        project.pipeline_state = state
        project.updated_at = datetime.now().isoformat()
        self._save()
        logger.info("Project %s pipeline: %s", project_id, state.value)
        return True

    def set_whitepaper_rating(self, project_id: str, rating: int) -> bool:
        """Set whitepaper star rating (1-5)."""
        if rating < 1 or rating > 5:
            return False
        project = self.get(project_id)
        if not project:
            return False
        project.whitepaper_rating = rating
        project.updated_at = datetime.now().isoformat()
        self._save()
        return True

    def update_whitepaper(self, project_id: str, content: str) -> dict:
        """Write content to project's whitepaper.md file.

        Returns {"success": bool, "error": str|None}
        """
        project = self.get(project_id)
        if not project:
            return {"success": False, "error": "Project not found"}

        project_path = Path(project.path)
        if not project_path.exists():
            return {"success": False, "error": "Project folder not found"}

        whitepaper_path = project_path / "whitepaper.md"
        try:
            whitepaper_path.write_text(content, encoding="utf-8")
            project.updated_at = datetime.now().isoformat()
            self._save()
            return {"success": True, "error": None}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def cancel_project(self, project_id: str, delete_folder: bool = False) -> dict:
        """Cancel a project in draft/clarify state.

        Optionally deletes the external folder. Returns result dict.
        """
        project = self.get(project_id)
        if not project:
            return {"success": False, "error": "Project not found"}

        # Only allow cancel in early pipeline states
        if project.pipeline_state not in (PipelineState.SETUP, PipelineState.DRAFT, PipelineState.CLARIFY):
            return {"success": False, "error": f"Cannot cancel project in {project.pipeline_state.value} state"}

        project_path = Path(project.path)

        # Optionally delete folder
        if delete_folder and project_path.exists():
            try:
                shutil.rmtree(project_path)
                logger.info("Deleted project folder: %s", project_path)
            except Exception as e:
                logger.error("Failed to delete folder: %s", e)
                # Continue with project removal even if folder delete fails

        # Remove project from registry
        self.projects.remove(project)
        if self.active_project_id == project_id:
            self.active_project_id = None
        self._save()
        return {"success": True, "error": None}


# Global singleton
project_manager = ProjectManager()
