"""
ProjectGen Manager - Video-to-Game Project System
=================================================

Every game MUST originate from video generation.
A Project = video frames (multi-fps) + AI analysis + generated game design.

No manual / non-video game creation is allowed.
"""

import os
import json
import time
import uuid
import shutil
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass, field, asdict
from datetime import datetime


@dataclass
class VideoSourceMeta:
    """Metadata about the source video that generated the project."""
    source_type: str  # webcam | video_file | image_file | frames_batch
    source_path: Optional[str] = None
    fps: float = 10.0
    resolution: tuple = (640, 480)
    duration: float = 5.0
    frames_captured: int = 0
    frames_processed: int = 0
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class ProjectMeta:
    """Metadata for a ProjectGen project."""
    project_id: str
    project_name: str
    created_at: str
    video_meta: VideoSourceMeta
    game_title: str = ""
    game_genre: str = ""
    game_theme: str = ""
    status: str = "generated"  # generating | generated | failed
    thumbnail: Optional[str] = None
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        d = asdict(self)
        # ensure tuple is serialized as list
        d["video_meta"]["resolution"] = list(d["video_meta"]["resolution"])
        return d

    @staticmethod
    def from_dict(data: dict) -> "ProjectMeta":
        vm = data.get("video_meta", {})
        # restore tuple
        if "resolution" in vm and isinstance(vm["resolution"], list):
            vm["resolution"] = tuple(vm["resolution"])
        video_meta = VideoSourceMeta(**vm)
        return ProjectMeta(
            project_id=data["project_id"],
            project_name=data["project_name"],
            created_at=data["created_at"],
            video_meta=video_meta,
            game_title=data.get("game_title", ""),
            game_genre=data.get("game_genre", ""),
            game_theme=data.get("game_theme", ""),
            status=data.get("status", "generated"),
            thumbnail=data.get("thumbnail"),
            tags=data.get("tags", []),
        )


class ProjectManager:
    """
    Manages ProjectGen projects.
    Every game lives inside projects/<project_id>/
    and MUST have a video source.

    Structure:
      projects/
        <project_id>/
          meta.json
          game_design.json
          video_meta.json
          frames/  (optional extracted frames)
          preview.png (optional)
    """

    def __init__(self, projects_root: str = "projects"):
        self.projects_root = Path(projects_root)
        self.projects_root.mkdir(parents=True, exist_ok=True)

    def _project_dir(self, project_id: str) -> Path:
        return self.projects_root / project_id

    def create_project(self, project_name: Optional[str], video_meta: VideoSourceMeta, game_design: dict) -> ProjectMeta:
        """Create a new project from a video-generated game."""
        if not game_design:
            raise ValueError("ProjectGen requires a game_design generated strictly from video frames. No manual design allowed.")
        if video_meta.frames_processed == 0:
            raise ValueError("ProjectGen requires at least 1 processed video frame. Cannot create project without video generation.")

        project_id = f"proj_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        if not project_name:
            project_name = game_design.get("title", project_id)

        meta = ProjectMeta(
            project_id=project_id,
            project_name=project_name,
            created_at=datetime.now().isoformat(),
            video_meta=video_meta,
            game_title=game_design.get("title", ""),
            game_genre=game_design.get("genre", ""),
            game_theme=game_design.get("theme", ""),
            status="generated",
        )

        proj_dir = self._project_dir(project_id)
        proj_dir.mkdir(parents=True, exist_ok=True)
        (proj_dir / "frames").mkdir(exist_ok=True)

        # save meta
        with open(proj_dir / "meta.json", "w") as f:
            json.dump(meta.to_dict(), f, indent=2)

        # save game design (must be video-generated)
        with open(proj_dir / "game_design.json", "w") as f:
            json.dump(game_design, f, indent=2)

        # persist world if present in metadata (new World code)
        world = game_design.get("metadata", {}).get("world") or game_design.get("world")
        if world:
            with open(proj_dir / "world.json", "w") as f:
                json.dump(world, f, indent=2)

        # save video meta separately for audit
        with open(proj_dir / "video_meta.json", "w") as f:
            json.dump(asdict(video_meta), f, indent=2, default=str)

        return meta

    def list_projects(self) -> List[ProjectMeta]:
        """List all projects sorted newest first."""
        projects: List[ProjectMeta] = []
        for child in self.projects_root.iterdir():
            if not child.is_dir():
                continue
            meta_path = child / "meta.json"
            game_path = child / "game_design.json"
            if not meta_path.exists() or not game_path.exists():
                continue
            try:
                with open(meta_path, "r") as f:
                    data = json.load(f)
                projects.append(ProjectMeta.from_dict(data))
            except Exception:
                continue
        projects.sort(key=lambda p: p.created_at, reverse=True)
        return projects

    def get_project(self, project_id: str) -> Optional[Dict]:
        """Get full project bundle: meta + game_design + video_meta."""
        proj_dir = self._project_dir(project_id)
        if not proj_dir.exists():
            return None
        try:
            with open(proj_dir / "meta.json", "r") as f:
                meta = json.load(f)
            with open(proj_dir / "game_design.json", "r") as f:
                game_design = json.load(f)
            video_meta = {}
            vm_path = proj_dir / "video_meta.json"
            if vm_path.exists():
                with open(vm_path, "r") as f:
                    video_meta = json.load(f)
            return {"meta": meta, "game_design": game_design, "video_meta": video_meta, "project_dir": str(proj_dir)}
        except Exception as e:
            return {"error": str(e)}

    def load_game_design(self, project_id: str) -> Optional[dict]:
        """Load only the game_design for running. Enforces video origin."""
        bundle = self.get_project(project_id)
        if not bundle or "game_design" not in bundle:
            return None
        # enforce video origin check
        meta = bundle.get("meta", {})
        vm = meta.get("video_meta", {}) if isinstance(meta, dict) else {}
        if vm.get("frames_processed", 0) == 0:
            raise ValueError("Game design rejected: not generated from video (ProjectGen enforcement).")
        return bundle["game_design"]

    def delete_project(self, project_id: str) -> bool:
        proj_dir = self._project_dir(project_id)
        if proj_dir.exists():
            shutil.rmtree(proj_dir)
            return True
        return False

    def save_frames(self, project_id: str, frames: List[bytes], fps: float):
        """Optionally persist extracted frames for research audit (not required)."""
        proj_dir = self._project_dir(project_id)
        frames_dir = proj_dir / "frames"
        frames_dir.mkdir(exist_ok=True)
        for i, data in enumerate(frames[:20]):  # cap to 20 for storage
            with open(frames_dir / f"frame_{i:04d}.jpg", "wb") as f:
                f.write(data)

    def stats(self) -> dict:
        projects = self.list_projects()
        total_frames = sum(p.video_meta.frames_processed for p in projects)
        return {
            "total_projects": len(projects),
            "total_frames_processed": total_frames,
            "genres": {p.game_genre: sum(1 for x in projects if x.game_genre == p.game_genre) for p in projects} if projects else {},
            "latest_project": projects[0].to_dict() if projects else None,
        }
