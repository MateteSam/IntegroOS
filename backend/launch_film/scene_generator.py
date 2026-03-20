"""
WCCCS StudioWorks — Scene Video Generator
==========================================
Priority chain (tries each in order, uses first that succeeds):

  1. Kling AI via PiAPI    — Best free AI video. Sign up at piapi.ai
                             Set PIAPI_KEY in .env
  2. Wan 2.1 via HF        — Open-source AI video by Alibaba ("Qwan").
                             Set HUGGINGFACE_TOKEN in .env
  3. LTX-Video via Replicate — Lightricks open model, free trial credits.
                               Set REPLICATE_API_TOKEN in .env
  4. Pexels Stock Footage  — Free professional stock video. CONFIGURED ✅
                             Set PEXELS_API_KEY in .env (already done)
  5. Placeholder file      — Always works. Manual upload later.

Zero configuration required for Pexels — it works right now.
"""
import os
import time
import uuid
import json
import logging
import requests
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

# --- Config -----------------------------------------------------------------
PIAPI_KEY        = os.environ.get("PIAPI_KEY", "")
HF_TOKEN         = os.environ.get("HUGGINGFACE_TOKEN", "")
REPLICATE_TOKEN  = os.environ.get("REPLICATE_API_TOKEN", "")
PEXELS_API_KEY   = os.environ.get("PEXELS_API_KEY", "")

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
#  PROVIDER 1: Kling AI via PiAPI  (piapi.ai — free daily credits)
# ---------------------------------------------------------------------------
def generate_kling_video(prompt: str, filename: str) -> Optional[str]:
    """Text-to-video via Kling 1.6 through the PiAPI bridge."""
    if not PIAPI_KEY:
        return None

    out_path = os.path.join(OUTPUT_DIR, filename)

    try:
        logger.info("Kling: Submitting generation task...")
        resp = requests.post(
            "https://api.piapi.ai/api/v1/task",
            headers={"x-api-key": PIAPI_KEY, "Content-Type": "application/json"},
            json={
                "model": "kling",
                "task_type": "video_generation",
                "input": {
                    "prompt": prompt,
                    "negative_prompt": "low quality, blurry, watermark, text",
                    "cfg_scale": 0.5,
                    "duration": 5,
                    "aspect_ratio": "16:9",
                    "mode": "std",
                    "version": "1.6",
                },
            },
            timeout=30,
        )
        resp.raise_for_status()
        task_id = resp.json().get("data", {}).get("task_id")
        if not task_id:
            raise ValueError(f"No task_id returned: {resp.text[:200]}")

        # Poll for completion (max 5 min)
        logger.info(f"Kling: Polling task {task_id}...")
        for _ in range(30):
            time.sleep(10)
            poll = requests.get(
                f"https://api.piapi.ai/api/v1/task/{task_id}",
                headers={"x-api-key": PIAPI_KEY},
                timeout=20,
            )
            poll.raise_for_status()
            data  = poll.json().get("data", {})
            status = data.get("status", "")
            if status == "completed":
                video_url = (
                    data.get("output", {}).get("video_url")
                    or data.get("output", {}).get("works", [{}])[0].get("resource", {}).get("resource")
                )
                if not video_url:
                    raise ValueError("No video URL in completed task")
                # Download
                vr = requests.get(video_url, timeout=120, stream=True)
                vr.raise_for_status()
                with open(out_path, "wb") as f:
                    for chunk in vr.iter_content(8192):
                        f.write(chunk)
                logger.info(f"Kling: ✅ saved {filename}")
                return filename
            elif status in ("failed", "error"):
                raise RuntimeError(f"Kling task failed: {data}")
        raise TimeoutError("Kling timed out after 5 minutes")

    except Exception as e:
        logger.warning(f"Kling failed: {e}")
        return None


# ---------------------------------------------------------------------------
#  PROVIDER 2: Wan 2.1 via HuggingFace Inference API
#  ("Qwan" = Wan 2.1 by Alibaba — world-class open-source video model)
# ---------------------------------------------------------------------------
WAN_MODELS = [
    "Wan-AI/Wan2.1-T2V-14B",   # 14B text-to-video
    "Wan-AI/Wan2.1-T2V-1.3B",  # Lighter / faster
]

def generate_wan_video(prompt: str, filename: str) -> Optional[str]:
    """Text-to-video via Wan 2.1 through HuggingFace Serverless Inference."""
    if not HF_TOKEN:
        return None

    out_path = os.path.join(OUTPUT_DIR, filename)

    for model_id in WAN_MODELS:
        try:
            logger.info(f"Wan 2.1: Trying {model_id}...")
            resp = requests.post(
                f"https://api-inference.huggingface.co/models/{model_id}",
                headers={"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"},
                json={"inputs": prompt, "parameters": {"num_inference_steps": 30}},
                timeout=300,
            )
            if resp.status_code == 200 and resp.headers.get("content-type", "").startswith("video"):
                with open(out_path, "wb") as f:
                    f.write(resp.content)
                logger.info(f"Wan 2.1: ✅ saved {filename}")
                return filename
            elif resp.status_code in (503, 500):
                logger.warning(f"Wan 2.1 model {model_id} unavailable, trying next...")
                continue
            else:
                logger.warning(f"Wan 2.1 unexpected ({resp.status_code}): {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Wan 2.1 {model_id} error: {e}")

    return None


# ---------------------------------------------------------------------------
#  PROVIDER 3: LTX-Video via Replicate  (free trial credits on signup)
# ---------------------------------------------------------------------------
def generate_ltx_video(prompt: str, filename: str) -> Optional[str]:
    """Text-to-video via LTX-Video (Lightricks) on Replicate."""
    if not REPLICATE_TOKEN:
        return None

    out_path = os.path.join(OUTPUT_DIR, filename)
    model = "lightricks/ltx-video"

    try:
        logger.info("LTX-Video: Submitting prediction...")
        resp = requests.post(
            "https://api.replicate.com/v1/models/lightricks/ltx-video/predictions",
            headers={"Authorization": f"Bearer {REPLICATE_TOKEN}", "Content-Type": "application/json"},
            json={"input": {"prompt": prompt, "num_frames": 121, "width": 704, "height": 480}},
            timeout=30,
        )
        resp.raise_for_status()
        prediction_id = resp.json().get("id")
        if not prediction_id:
            raise ValueError("No prediction ID returned")

        # Poll for completion (max 5 min)
        for _ in range(30):
            time.sleep(10)
            poll = requests.get(
                f"https://api.replicate.com/v1/predictions/{prediction_id}",
                headers={"Authorization": f"Bearer {REPLICATE_TOKEN}"},
                timeout=20,
            )
            poll.raise_for_status()
            data = poll.json()
            if data.get("status") == "succeeded":
                video_url = data.get("output")
                if isinstance(video_url, list):
                    video_url = video_url[0]
                vr = requests.get(video_url, timeout=120, stream=True)
                vr.raise_for_status()
                with open(out_path, "wb") as f:
                    for chunk in vr.iter_content(8192):
                        f.write(chunk)
                logger.info(f"LTX-Video: ✅ saved {filename}")
                return filename
            elif data.get("status") in ("failed", "canceled"):
                raise RuntimeError(f"LTX prediction failed: {data.get('error')}")

    except Exception as e:
        logger.warning(f"LTX-Video failed: {e}")
    return None


# ---------------------------------------------------------------------------
#  PROVIDER 4: Pexels Free Stock Footage  (CONFIGURED ✅ — works now)
# ---------------------------------------------------------------------------
PEXELS_SCENE_QUERIES = {
    1: "johannesburg africa skyline modern city night",
    2: "cluttered office technology chaos overload",
    3: "professional team collaboration modern workspace",
    4: "futuristic data visualization AI technology",
    5: "boardroom executive corporate meeting africa",
    6: "focus discipline close-up professional work",
    7: "confident team business walk modern architecture",
}

def download_pexels_video(scene_number: int, filename: str) -> Optional[str]:
    """Downloads free professional stock footage from Pexels."""
    if not PEXELS_API_KEY:
        logger.warning("PEXELS_API_KEY not set — skipping Pexels.")
        return None

    query = PEXELS_SCENE_QUERIES.get(scene_number, "professional business office")
    out_path = os.path.join(OUTPUT_DIR, filename)

    try:
        logger.info(f"Pexels: Searching '{query}'...")
        r = requests.get(
            "https://api.pexels.com/videos/search",
            headers={"Authorization": PEXELS_API_KEY},
            params={"query": query, "per_page": 10, "orientation": "landscape", "size": "large"},
            timeout=15,
        )
        r.raise_for_status()
        videos = r.json().get("videos", [])
        if not videos:
            logger.warning(f"Pexels: No results for '{query}'")
            return None

        # Prefer higher resolution clips
        for video in videos:
            files = sorted(video.get("video_files", []), key=lambda f: f.get("height", 0), reverse=True)
            best = next((f for f in files if f.get("height", 0) >= 720), files[0] if files else None)
            if not best:
                continue
            vr = requests.get(best["link"], stream=True, timeout=120)
            if vr.status_code == 200:
                with open(out_path, "wb") as f:
                    for chunk in vr.iter_content(8192):
                        f.write(chunk)
                logger.info(f"Pexels: ✅ {best.get('height')}p saved as {filename}")
                return filename

    except Exception as e:
        logger.error(f"Pexels error: {e}")
    return None


# ---------------------------------------------------------------------------
#  MAIN ENTRY POINT — Provider Priority Chain
# ---------------------------------------------------------------------------
def generate_scene(scene_number: int, prompt: str, preferred_provider: str = "auto") -> dict:
    """
    Generates a video for one scene using the first available provider.
    
    preferred_provider: 'auto' | 'kling' | 'wan' | 'ltx' | 'pexels'
    """
    filename = f"scene_{scene_number:02d}_{uuid.uuid4().hex[:6]}.mp4"

    providers = {
        "kling":  lambda: generate_kling_video(prompt, filename),
        "wan":    lambda: generate_wan_video(prompt, filename),
        "ltx":    lambda: generate_ltx_video(prompt, filename),
        "pexels": lambda: download_pexels_video(scene_number, filename),
    }

    # Determine run order
    if preferred_provider != "auto" and preferred_provider in providers:
        order = [preferred_provider, *[k for k in providers if k != preferred_provider]]
    else:
        # Auto: AI providers first, then stock, then placeholder
        order = ["kling", "wan", "ltx", "pexels"]

        # Skip providers with no key configured (fast fail)
        if not PIAPI_KEY:    order.remove("kling")
        if not HF_TOKEN:     order.remove("wan")
        if not REPLICATE_TOKEN: order.remove("ltx")
        # Pexels always stays in — key is configured

    for provider_name in order:
        logger.info(f"Scene {scene_number}: Trying provider [{provider_name}]...")
        try:
            result = providers[provider_name]()
            if result:
                return {"filename": result, "method": provider_name, "success": True}
        except Exception as e:
            logger.error(f"Scene {scene_number} [{provider_name}] crashed: {e}")

    # All providers failed — write placeholder
    placeholder = f"scene_{scene_number:02d}_placeholder.json"
    with open(os.path.join(OUTPUT_DIR, placeholder), "w") as f:
        json.dump({"scene": scene_number, "prompt": prompt, "status": "manual_upload_needed"}, f)
    return {
        "filename": placeholder,
        "method": "placeholder",
        "success": False,
        "error": "All providers failed. Configure at least one API key or upload manually.",
    }
