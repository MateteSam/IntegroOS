"""
WCCCS StudioWorks Launch Film — Flask API Routes
Endpoints for managing film generation jobs.
"""
import os
import threading
import logging
from flask import Blueprint, request, jsonify, send_from_directory, abort

from launch_film.job_manager import (
    create_film_job,
    get_film_job,
    update_scene_status,
    serialize_film_job,
)
from launch_film.scene_definitions import SCENE_DEFINITIONS
from launch_film.scene_generator import generate_scene, OUTPUT_DIR

logger = logging.getLogger(__name__)

film_bp = Blueprint("film", __name__, url_prefix="/api/film")

# Track which jobs are actively running (to prevent duplicate threads)
_active_threads = set()
_thread_lock = threading.Lock()


def _run_scene_generation(film_job_id: str, scene_def: dict, preferred_provider: str = "auto"):
    """Background thread task: generates one scene and updates job state."""
    scene_number = scene_def["sceneNumber"]
    try:
        update_scene_status(
            film_job_id, scene_number,
            status="generating",
            message=f"Generating: {scene_def['title']}..."
        )
        
        result = generate_scene(
            scene_number=scene_number,
            prompt=scene_def["visualPrompt"],
            preferred_provider=preferred_provider,
        )
        
        if result["success"]:
            update_scene_status(
                film_job_id, scene_number,
                status="ready",
                message=f"Ready via {result['method']}",
                video_filename=result["filename"]
            )
            logger.info(f"✅ Scene {scene_number} complete via {result['method']}")
        else:
            update_scene_status(
                film_job_id, scene_number,
                status="error",
                message="Generation failed — see error",
                error=result.get("error", "Unknown error")
            )
    except Exception as e:
        logger.error(f"Scene {scene_number} thread error: {e}")
        update_scene_status(
            film_job_id, scene_number,
            status="error",
            message="Unexpected error",
            error=str(e)
        )
    finally:
        with _thread_lock:
            _active_threads.discard(f"{film_job_id}:{scene_number}")


@film_bp.route("/generate", methods=["POST"])
def start_generation():
    """
    POST /api/film/generate
    Body: { "provider": "auto" | "kling" | "wan" | "ltx" | "pexels" }
    """
    body = request.get_json(silent=True) or {}
    preferred_provider = body.get("provider", "auto")

    # Create the persistent job record
    film_job = create_film_job(SCENE_DEFINITIONS)
    
    # Spawn a background thread per scene (scenes run concurrently)
    for scene_def in SCENE_DEFINITIONS:
        scene_number = scene_def["sceneNumber"]
        thread_key = f"{film_job.film_job_id}:{scene_number}"
        
        with _thread_lock:
            if thread_key in _active_threads:
                continue
            _active_threads.add(thread_key)
        
        t = threading.Thread(
            target=_run_scene_generation,
            args=(film_job.film_job_id, scene_def, preferred_provider),
            daemon=True
        )
        t.start()

    logger.info(f"Film generation started: {film_job.film_job_id} [{preferred_provider}]")
    return jsonify({
        "success": True,
        "filmJobId": film_job.film_job_id,
        "provider": preferred_provider,
        "message": f"Generation started for {len(SCENE_DEFINITIONS)} scenes.",
        "job": serialize_film_job(film_job)
    }), 202


@film_bp.route("/status/<film_job_id>", methods=["GET"])
def get_status(film_job_id: str):
    """
    GET /api/film/status/<film_job_id>
    Returns current generation status for all scenes.
    Frontend polls this every 5 seconds.
    """
    job = get_film_job(film_job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(serialize_film_job(job))


@film_bp.route("/download/<filename>", methods=["GET"])
def download_scene(filename: str):
    """
    GET /api/film/download/<filename>
    Serves a generated scene video file for download or inline playback.
    """
    safe_name = os.path.basename(filename)  # Prevent path traversal
    file_path = os.path.join(OUTPUT_DIR, safe_name)
    
    if not os.path.exists(file_path) or safe_name.endswith(".txt"):
        abort(404)
    
    return send_from_directory(
        OUTPUT_DIR, safe_name,
        as_attachment=False,
        mimetype="video/mp4"
    )


@film_bp.route("/scenes", methods=["GET"])
def get_scene_definitions():
    """
    GET /api/film/scenes
    Returns the full scene definition list (for the UI to render).
    """
    return jsonify({
        "scenes": SCENE_DEFINITIONS,
        "totalScenes": len(SCENE_DEFINITIONS),
        "totalDurationSeconds": sum(s["durationSeconds"] for s in SCENE_DEFINITIONS),
    })

# ---------------------------------------------------------------------------
#  SCRIPT-TO-PRODUCTION PIPELINE (V4)
# ---------------------------------------------------------------------------
@film_bp.route("/from-script", methods=["POST"])
def from_script():
    """
    POST /api/film/from-script
    Body: { "script": "...", "provider": "auto", "generateVO": true }
    Parses the script into scenes, generates video + voiceover for each.
    Returns: { scenes: [...], filmJobId, voiceovers: [...] }
    """
    from launch_film.script_parser import parse_script
    from launch_film.elevenlabs_tts import generate_voiceover

    body = request.get_json(silent=True) or {}
    raw_script = body.get("script", "").strip()
    if not raw_script:
        return jsonify({"error": "No script provided"}), 400

    preferred_provider = body.get("provider", "auto")
    generate_vo = body.get("generateVO", True)

    # 1) Parse the script into scenes
    parsed_scenes = parse_script(raw_script)
    if not parsed_scenes:
        return jsonify({"error": "Could not parse scenes from script"}), 400

    # 2) Create a film job with the parsed scenes
    film_job = create_film_job(parsed_scenes)

    # 3) Spawn video generation threads for each scene
    for scene_def in parsed_scenes:
        scene_number = scene_def["sceneNumber"]
        thread_key = f"{film_job.film_job_id}:{scene_number}"
        with _thread_lock:
            if thread_key in _active_threads:
                continue
            _active_threads.add(thread_key)
        t = threading.Thread(
            target=_run_scene_generation,
            args=(film_job.film_job_id, scene_def, preferred_provider),
            daemon=True
        )
        t.start()

    # 4) Generate voiceovers (synchronously — they're fast on ElevenLabs)
    voiceovers = []
    if generate_vo:
        for scene_def in parsed_scenes:
            vo_text = scene_def.get("voiceover", "")
            if vo_text:
                result = generate_voiceover(vo_text)
                if result["success"]:
                    voiceovers.append({
                        "sceneNumber": scene_def["sceneNumber"],
                        "filename": result["filename"],
                        "duration": result["duration_estimate"],
                        "download_url": f"/api/film/download-audio/{result['filename']}",
                    })

    # 5) Build timeline layout
    timeline = []
    running_start = 0.0
    for scene_def in parsed_scenes:
        dur = scene_def.get("durationSeconds", 5)
        timeline.append({
            "sceneNumber": scene_def["sceneNumber"],
            "title": scene_def.get("title", f"Scene {scene_def['sceneNumber']}"),
            "start": running_start,
            "duration": dur,
            "voiceover": scene_def.get("voiceover", ""),
            "visualPrompt": scene_def.get("visualPrompt", ""),
        })
        running_start += dur

    logger.info(f"Script parsed: {len(parsed_scenes)} scenes, {len(voiceovers)} VOs, total {running_start}s")
    return jsonify({
        "success": True,
        "filmJobId": film_job.film_job_id,
        "sceneCount": len(parsed_scenes),
        "totalDuration": running_start,
        "timeline": timeline,
        "voiceovers": voiceovers,
        "provider": preferred_provider,
    }), 202


# ---------------------------------------------------------------------------
#  ELEVENLABS TTS ROUTES
# ---------------------------------------------------------------------------
@film_bp.route("/tts", methods=["POST"])
def text_to_speech():
    """
    POST /api/film/tts
    Body: { "text": "...", "voice_id": "optional" }
    Returns: { filename, duration_estimate, success }
    """
    from launch_film.elevenlabs_tts import generate_voiceover
    body = request.get_json(silent=True) or {}
    text = body.get("text", "").strip()
    if not text:
        return jsonify({"error": "No text provided"}), 400

    voice_id = body.get("voice_id")
    result = generate_voiceover(text, voice_id=voice_id)

    if result["success"]:
        return jsonify({
            "success": True,
            "filename": result["filename"],
            "duration_estimate": result["duration_estimate"],
            "download_url": f"/api/film/download-audio/{result['filename']}",
        }), 200
    else:
        return jsonify({"success": False, "error": result["error"]}), 500


@film_bp.route("/voices", methods=["GET"])
def get_voices():
    """GET /api/film/voices — Returns available ElevenLabs voices."""
    from launch_film.elevenlabs_tts import list_voices
    voices = list_voices()
    return jsonify({"voices": voices, "count": len(voices)}), 200


@film_bp.route("/download-audio/<filename>", methods=["GET"])
def download_audio(filename):
    """Serve a generated audio file."""
    safe_name = os.path.basename(filename)
    file_path = os.path.join(OUTPUT_DIR, safe_name)
    if not os.path.exists(file_path):
        abort(404)
    mimetype = "audio/mpeg" if safe_name.endswith(".mp3") else "audio/wav"
    return send_from_directory(OUTPUT_DIR, safe_name, as_attachment=False, mimetype=mimetype)


# ---------------------------------------------------------------------------
#  EXPORT ROUTES
# ---------------------------------------------------------------------------
@film_bp.route("/export", methods=["POST"])
def export_film():
    """
    POST /api/film/export
    """
    from launch_film.export_engine import start_export_job
    composition_data = request.get_json(silent=True) or {}
    if not composition_data.get("video_tracks"):
        return jsonify({"error": "No video tracks provided"}), 400
        
    job_id = start_export_job(composition_data)
    return jsonify({"success": True, "jobId": job_id, "message": "Export started"}), 202

@film_bp.route("/export/status/<job_id>", methods=["GET"])
def export_status(job_id):
    from launch_film.export_engine import get_export_status
    state = get_export_status(job_id)
    if state["status"] == "not_found":
        return jsonify({"error": "Job not found"}), 404
    return jsonify(state), 200

@film_bp.route("/export/download/<filename>", methods=["GET"])
def download_export(filename):
    """Serve the final stitched MP4"""
    from launch_film.export_engine import EXPORT_DIR
    if ".." in filename or "/" in filename:
        return jsonify({"error": "Invalid filename"}), 400
        
    return send_from_directory(
        EXPORT_DIR, os.path.basename(filename),
        as_attachment=True,
        download_name=filename
    )
