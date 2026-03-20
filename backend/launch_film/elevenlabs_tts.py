"""
StudioWorks V4 — ElevenLabs Text-to-Speech Module
===================================================
Generates voiceover audio via ElevenLabs API v1.
"""
import os
import uuid
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)

ELEVENLABS_API_KEY = os.environ.get(
    "ELEVENLABS_API_KEY",
    "44ba5a465997ab75deba0101b9f9af5d15338ba5ccf85972839742d983245a24"
)

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(AUDIO_DIR, exist_ok=True)

# Default voice — Rachel (professional female narrator)
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

BASE_URL = "https://api.elevenlabs.io/v1"


def list_voices() -> list:
    """Fetches available voices from ElevenLabs account."""
    try:
        resp = requests.get(
            f"{BASE_URL}/voices",
            headers={"xi-api-key": ELEVENLABS_API_KEY},
            timeout=15,
        )
        resp.raise_for_status()
        voices = resp.json().get("voices", [])
        return [
            {
                "voice_id": v["voice_id"],
                "name": v["name"],
                "category": v.get("category", "premade"),
                "preview_url": v.get("preview_url", ""),
            }
            for v in voices
        ]
    except Exception as e:
        logger.error(f"ElevenLabs list_voices failed: {e}")
        return []


def generate_voiceover(
    text: str,
    voice_id: Optional[str] = None,
    model_id: str = "eleven_monolingual_v1",
    stability: float = 0.5,
    similarity_boost: float = 0.75,
) -> dict:
    """
    Generates speech from text using ElevenLabs.
    Returns { filename, filepath, duration_estimate, success, error? }
    """
    voice = voice_id or DEFAULT_VOICE_ID
    filename = f"vo_{uuid.uuid4().hex[:8]}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    try:
        logger.info(f"ElevenLabs TTS: generating for {len(text)} chars, voice={voice}")
        resp = requests.post(
            f"{BASE_URL}/text-to-speech/{voice}",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": text,
                "model_id": model_id,
                "voice_settings": {
                    "stability": stability,
                    "similarity_boost": similarity_boost,
                },
            },
            timeout=60,
            stream=True,
        )
        resp.raise_for_status()

        # Save audio file
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(4096):
                f.write(chunk)

        file_size = os.path.getsize(filepath)
        # Rough estimate: MP3 at ~128kbps → 16KB/sec
        duration_estimate = round(file_size / 16000, 1)

        logger.info(f"ElevenLabs TTS: ✅ saved {filename} ({file_size/1024:.0f}KB, ~{duration_estimate}s)")
        return {
            "filename": filename,
            "filepath": filepath,
            "duration_estimate": duration_estimate,
            "file_size": file_size,
            "success": True,
        }

    except requests.exceptions.HTTPError as e:
        error_msg = f"ElevenLabs API error: {e.response.status_code}"
        try:
            detail = e.response.json()
            error_msg += f" — {detail.get('detail', {}).get('message', str(detail))}"
        except Exception:
            pass
        logger.error(error_msg)
        return {"filename": None, "success": False, "error": error_msg}

    except Exception as e:
        logger.error(f"ElevenLabs TTS failed: {e}")
        return {"filename": None, "success": False, "error": str(e)}
