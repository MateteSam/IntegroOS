"""
WCCCS StudioWorks Launch Film Generation Engine
Persistent job manager with in-memory status tracking.
Each scene is a separate background job — resilient to frontend disconnects.
"""
import uuid
import threading
import time
from datetime import datetime
from typing import Dict, Optional
from dataclasses import dataclass, field

@dataclass
class SceneJob:
    job_id: str
    scene_number: int
    scene_title: str
    status: str = "pending"          # pending | generating | ready | error
    progress_message: str = ""
    video_filename: Optional[str] = None
    error: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

@dataclass
class FilmJob:
    film_job_id: str
    status: str = "pending"          # pending | generating | ready | error
    scenes: Dict[int, SceneJob] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    output_dir: Optional[str] = None


# In-memory store — survives tab closes, works across polling requests
_film_jobs: Dict[str, FilmJob] = {}
_lock = threading.Lock()


def create_film_job(scene_definitions: list) -> FilmJob:
    """Creates a new film generation job and returns it."""
    job_id = str(uuid.uuid4())
    film_job = FilmJob(film_job_id=job_id)
    
    for scene in scene_definitions:
        scene_job = SceneJob(
            job_id=str(uuid.uuid4()),
            scene_number=scene["sceneNumber"],
            scene_title=scene["title"],
        )
        film_job.scenes[scene["sceneNumber"]] = scene_job
    
    with _lock:
        _film_jobs[job_id] = film_job
    
    return film_job


def get_film_job(film_job_id: str) -> Optional[FilmJob]:
    """Retrieves a film job by its ID."""
    with _lock:
        return _film_jobs.get(film_job_id)


def update_scene_status(
    film_job_id: str,
    scene_number: int,
    status: str,
    message: str = "",
    video_filename: Optional[str] = None,
    error: Optional[str] = None
):
    """Thread-safe update for a single scene within a film job."""
    with _lock:
        job = _film_jobs.get(film_job_id)
        if not job:
            return
        scene = job.scenes.get(scene_number)
        if not scene:
            return
        
        scene.status = status
        scene.progress_message = message
        
        if status == "generating" and not scene.started_at:
            scene.started_at = datetime.utcnow().isoformat()
        
        if status in ("ready", "error"):
            scene.completed_at = datetime.utcnow().isoformat()
        
        if video_filename:
            scene.video_filename = video_filename
        
        if error:
            scene.error = error
        
        # Update parent film job status
        scene_statuses = [s.status for s in job.scenes.values()]
        if all(s == "ready" for s in scene_statuses):
            job.status = "ready"
        elif any(s == "error" for s in scene_statuses):
            job.status = "error"
        elif any(s in ("generating", "pending") for s in scene_statuses):
            job.status = "generating"


def serialize_film_job(job: FilmJob) -> dict:
    """Converts a FilmJob to a JSON-serializable dict for the API."""
    scenes_out = {}
    for num, scene in job.scenes.items():
        scenes_out[str(num)] = {
            "sceneNumber": scene.scene_number,
            "title": scene.scene_title,
            "status": scene.status,
            "message": scene.progress_message,
            "videoFilename": scene.video_filename,
            "error": scene.error,
            "startedAt": scene.started_at,
            "completedAt": scene.completed_at,
        }
    return {
        "filmJobId": job.film_job_id,
        "status": job.status,
        "scenes": scenes_out,
        "createdAt": job.created_at,
        "outputDir": job.output_dir,
    }
