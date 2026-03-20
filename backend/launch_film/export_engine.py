import os
import subprocess
import uuid
import json
import logging
import shutil
import threading
from typing import Dict, Any

logger = logging.getLogger(__name__)

# export_engine.py lives at: <project>/backend/launch_film/export_engine.py
# __file__ dirname           → backend/launch_film/
# one up                     → backend/
# two up                     → <project root>/    ← public/ is here
_ENGINE_DIR   = os.path.dirname(os.path.abspath(__file__))   # .../launch_film
_BACKEND_DIR  = os.path.dirname(_ENGINE_DIR)                  # .../backend
_PROJECT_DIR  = os.path.dirname(_BACKEND_DIR)                 # .../project root

OUTPUT_DIR = os.path.join(_ENGINE_DIR, "output")
EXPORT_DIR = os.path.join(OUTPUT_DIR, "exports")
PUBLIC_DIR = os.path.join(_PROJECT_DIR, "public")             # .../public ✅
os.makedirs(EXPORT_DIR, exist_ok=True)


def _get_ffmpeg() -> str:
    """Returns the path to the ffmpeg binary, using imageio-ffmpeg as fallback."""
    # 1. Check system PATH first
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
    # 2. Try imageio-ffmpeg (pip bundled binary)
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        pass
    # 3. Common Windows install locations
    candidates = [
        r"C:\ffmpeg\bin\ffmpeg.exe",
        r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
        r"C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe",
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
    raise FileNotFoundError(
        "FFmpeg not found. Install via: https://ffmpeg.org/download.html "
        "or run: pip install imageio-ffmpeg"
    )


def _resolve_media_path(raw_path: str) -> str:
    """
    Resolves a media path to an absolute local file path.
    Handles:
      - Absolute paths (returned as-is if they exist)
      - /media/scene_X.mp4  → public/media/scene_X.mp4
      - /WCCCS.wav          → public/WCCCS.wav
      - bare filename       → OUTPUT_DIR/filename
    """
    if not raw_path:
        return ""
    # Already absolute
    if os.path.isabs(raw_path) and os.path.exists(raw_path):
        return raw_path
    # Strip leading slash and resolve relative to PUBLIC_DIR
    rel = raw_path.lstrip("/").replace("/", os.sep)
    pub_path = os.path.join(PUBLIC_DIR, rel)
    if os.path.exists(pub_path):
        return pub_path
    # Bare filename — look in OUTPUT_DIR
    out_path = os.path.join(OUTPUT_DIR, os.path.basename(raw_path))
    if os.path.exists(out_path):
        return out_path
    # Return best guess (ffmpeg will surface a clear error)
    return pub_path

# In-memory export job tracker
# Structure: { job_id: {"status": "processing"|"success"|"error", "progress": int, "output_file": str, "error": str} }
_export_jobs = {}
_export_lock = threading.Lock()

def start_export_job(composition_data: Dict[str, Any]) -> str:
    """Starts an asynchronous FFmpeg export job based on the timeline composition."""
    job_id = f"exp_{uuid.uuid4().hex[:8]}"
    
    with _export_lock:
        _export_jobs[job_id] = {
            "status": "processing",
            "progress": 0,
            "output_file": None,
            "error": None
        }
        
    t = threading.Thread(target=_run_ffmpeg_export, args=(job_id, composition_data), daemon=True)
    t.start()
    
    return job_id

def get_export_status(job_id: str) -> Dict[str, Any]:
    with _export_lock:
        return _export_jobs.get(job_id, {"status": "not_found"})

def _run_ffmpeg_export(job_id: str, composition: Dict[str, Any]):
    """
    Executes the complex FFmpeg command line to stitch videos, duck audio, and overlay text.
    """
    try:
        ffmpeg_exe = _get_ffmpeg()
        output_filename = f"masterpiece_{job_id}.mp4"
        output_path = os.path.join(EXPORT_DIR, output_filename)
        
        video_tracks = composition.get("video_tracks", [])
        audio_tracks = composition.get("audio_tracks", [])
        text_overlays = composition.get("text_overlays", [])
        
        if not video_tracks:
            raise ValueError("No video tracks provided for export.")
            
        inputs = []
        filter_complex = []
        
        # 1. Video Inputs & Normalization (Scale to 1920x1080, 30fps)
        v_streams = []
        for i, vt in enumerate(video_tracks):
            src_file = _resolve_media_path(vt.get("file", ""))
            
            if not src_file or not os.path.exists(src_file):
                logger.warning(f"Video file missing: {src_file!r} – skipping scene {i+1}")
                # Use a 5-second black placeholder instead of failing entirely
                inputs.extend(["-f", "lavfi", "-i", f"color=black:size=1920x1080:duration={vt.get('duration', 5)}:rate=30"])
            else:
                inputs.extend(["-i", src_file])
            
            v_filter = f"[{i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p,setpts=PTS-STARTPTS[v{i}]"
            filter_complex.append(v_filter)
            v_streams.append(f"[v{i}]")
            
        # 2. Concat Normalized Videos
        concat_v = "".join(v_streams) + f"concat=n={len(v_streams)}:v=1:a=0[vbase]"
        filter_complex.append(concat_v)
        
        # 3. Text Overlays (Burn-in via drawtext)
        current_v = "vbase"
        for j, txt in enumerate(text_overlays):
            text_str = txt.get("text", "").replace("'", "\\'").replace("\n", " ")
            start_t = txt.get("start", 0)
            end_t = txt.get("end", 5)
            next_v = f"vtxt{j}"
            dt_filter = f"[{current_v}]drawtext=text='{text_str}':fontcolor=white:fontsize=80:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,{start_t},{end_t})':shadowcolor=black:shadowx=4:shadowy=4[{next_v}]"
            filter_complex.append(dt_filter)
            current_v = next_v
        
        v_out = f"[{current_v}]"
        
        # 4. Audio Inputs & Mixing (VO + Music + SFX)
        audio_inputs_start_idx = len(inputs) // 2
        a_streams = []
        
        for k, at in enumerate(audio_tracks):
            raw_src = at.get("file", "")
            # Skip external URLs (SoundHelix, etc.) — can't pipe in runtime
            if raw_src.startswith("http://") or raw_src.startswith("https://"):
                logger.info(f"Skipping external audio URL: {raw_src}")
                continue
            src_a = _resolve_media_path(raw_src)
            if not src_a or not os.path.exists(src_a):
                logger.warning(f"Audio file missing: {src_a!r} – skipping")
                continue
            inputs.extend(["-i", src_a])
            
            vol = at.get("volume", 1.0)
            start_time = at.get("start", 0)
            input_idx = audio_inputs_start_idx + k
            
            a_filter = f"[{input_idx}:a]adelay={int(start_time*1000)}|{int(start_time*1000)},volume={vol}[a{k}]"
            filter_complex.append(a_filter)
            a_streams.append(f"[a{k}]")
            
        a_out = ""
        if a_streams:
            amix = "".join(a_streams) + f"amix=inputs={len(a_streams)}:duration=longest:normalize=0[aout]"
            filter_complex.append(amix)
            a_out = "[aout]"
            
        # 5. Assemble FFmpeg Command
        cmd = [ffmpeg_exe, "-y"] + inputs + [
            "-filter_complex", ";".join(filter_complex),
            "-map", v_out
        ]
        
        if a_out:
            cmd.extend(["-map", a_out])
            
        cmd.extend([
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "22",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
        ])
        
        cmd.append(output_path)
        
        logger.info(f"Starting FFmpeg Export [{job_id}]: {ffmpeg_exe} ...")
        
        with _export_lock:
            _export_jobs[job_id]["progress"] = 10
            
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            logger.error(f"FFmpeg Error:\n{stderr}")
            raise RuntimeError(f"FFmpeg exited with code {process.returncode}: {stderr[-500:]}")
            
        with _export_lock:
            _export_jobs[job_id]["status"] = "success"
            _export_jobs[job_id]["progress"] = 100

        with _export_lock:
            _export_jobs[job_id]["output_file"] = output_filename
            
        logger.info(f"Export {job_id} completed successfully at {output_path}")

    except Exception as e:
        logger.error(f"Export job {job_id} failed: {e}", exc_info=True)
        with _export_lock:
            _export_jobs[job_id]["status"] = "error"
            _export_jobs[job_id]["error"] = str(e)


    except Exception as e:
        logger.error(f"Export job {job_id} failed: {e}", exc_info=True)
        with _export_lock:
            _export_jobs[job_id]["status"] = "error"
            _export_jobs[job_id]["error"] = str(e)
