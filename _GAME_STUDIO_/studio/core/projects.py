"""
Projects manager - handles external project references.

Projects are external folders (outside this repo) that contain:
- white_paper.md: Game concept document
- roadmap.md: Development milestones
- assets/: 3D models, textures, etc.

Studio only stores references (paths), never copies the content.
"""

import json
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Optional


DATA_FILE = Path(__file__).parent.parent.parent / "data" / "projects.json"
MAX_FILE_PREVIEW_SIZE = 50 * 1024  # 50KB limit


class ProjectStatus(Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


@dataclass
class Project:
    id: str
    name: str
    path: str
    description: str = ""
    status: ProjectStatus = ProjectStatus.ACTIVE
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "path": self.path,
            "description": self.description,
            "status": self.status.value,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "path_exists": Path(self.path).exists(),
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Project":
        return cls(
            id=data["id"],
            name=data["name"],
            path=data["path"],
            description=data.get("description", ""),
            status=ProjectStatus(data.get("status", "active")),
            created_at=data.get("created_at", datetime.now().isoformat()),
            updated_at=data.get("updated_at", datetime.now().isoformat()),
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
                print(f"[Projects] Load error: {e}")
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
        """Create a new project reference."""
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
        )
        self.projects.append(project)

        # Auto-set as active if first project
        if len(self.projects) == 1:
            self.active_project_id = project.id

        self._save()
        return project

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

        filename = "white_paper.md" if doc_type == "white_paper" else "roadmap.md"
        doc_path = project_path / filename

        if not doc_path.exists():
            return {"content": "", "exists": False, "error": f"No {filename} found", "truncated": False}

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


# Global singleton
project_manager = ProjectManager()
