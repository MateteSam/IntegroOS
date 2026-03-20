"""
StudioWorks V4 — Script Parser & Production Pipeline
======================================================
Takes raw screenplay/script text and converts it into:
  - Scene definitions (visual prompts for video generation)
  - Voiceover segments (text for ElevenLabs TTS)
  - Timeline layout (start/duration for each scene)

The parser supports two formats:
  1. Simple: Each paragraph = one scene. First sentence = visual description, rest = VO.
  2. Structured: Lines starting with [SCENE N] mark scene boundaries.
     Lines starting with [VO] or [VOICEOVER] mark voiceover text.
     Lines starting with [VISUAL] mark visual descriptions.
     Lines starting with [MUSIC] or [SFX] mark audio cues.
"""
import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def parse_script(raw_script: str) -> List[Dict[str, Any]]:
    """
    Parses a raw script into a list of scene dictionaries.
    Each scene dict:
      {
        "sceneNumber": int,
        "title": str,
        "durationSeconds": int,
        "visualPrompt": str,
        "voiceover": str,
        "musicCue": str | None,
        "sfxCue": str | None,
      }
    """
    raw = raw_script.strip()
    if not raw:
        return []

    # Detect structured format
    if re.search(r'\[SCENE\s*\d+\]', raw, re.IGNORECASE):
        return _parse_structured(raw)
    else:
        return _parse_simple(raw)


def _parse_simple(raw: str) -> List[Dict[str, Any]]:
    """Simple format: Each paragraph (double-newline separated) = one scene."""
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', raw) if p.strip()]

    scenes = []
    for i, para in enumerate(paragraphs, 1):
        sentences = re.split(r'(?<=[.!?])\s+', para)
        # First sentence → visual prompt, rest → voiceover
        visual = sentences[0] if sentences else para
        voiceover = ' '.join(sentences[1:]) if len(sentences) > 1 else ''

        # Estimate duration: ~3 words/sec for voiceover, min 5s
        word_count = len(voiceover.split()) if voiceover else len(visual.split())
        duration = max(5, round(word_count / 3))

        # Build a cinematic visual prompt from the simple description
        cinematic_visual = (
            f"Cinematic 4K shot: {visual} "
            f"Professional lighting, shallow depth of field, premium feel."
        )

        scenes.append({
            "sceneNumber": i,
            "title": f"Scene {i}: {visual[:40]}...",
            "durationSeconds": duration,
            "visualPrompt": cinematic_visual,
            "voiceover": voiceover or visual,
            "musicCue": None,
            "sfxCue": None,
        })

    return scenes


def _parse_structured(raw: str) -> List[Dict[str, Any]]:
    """
    Structured format parsing.
    Supports both traditional tags [SCENE N], [VISUAL], [VO]
    and standard script headers: 'Scene 1', 'Visual:', 'Voiceover:'
    """
    # Split by scene markers: [SCENE 1], Scene 1, Scene 01, etc.
    # This regex creates a list like: [preamble, '1', 'rest of scene 1...', '2', 'rest of scene 2...']
    scene_blocks = re.split(r'(?mi)^(?:\s*\[SCENE\s*|Scene\s*)(\d+)(.*)$', raw)

    scenes = []
    # If the regex matched, scene_blocks will have length > 1
    # Example: ['', '1', ' — Opening...', '\nVisual:\n...', '2', '...']
    # If no matches, fallback to simple parsing just in case.
    if len(scene_blocks) < 3:
        return _parse_simple(raw)

    for idx in range(1, len(scene_blocks), 3):
        scene_num_str = scene_blocks[idx]
        title_line = scene_blocks[idx + 1].strip() if idx + 1 < len(scene_blocks) else ''
        content = scene_blocks[idx + 2] if idx + 2 < len(scene_blocks) else ''
        
        try:
            scene_num = int(scene_num_str)
        except ValueError:
            continue

        # Clean up title line e.g., " — Opening: The Institutional Shift (0:00–0:25)" -> "Opening: The Institutional Shift"
        clean_title = re.sub(r'^[—\-:\s]+', '', title_line)
        clean_title = re.sub(r'\s*\(\d+:\d+[—\-]\d+:\d+\)\s*$', '', clean_title)

        visual = _extract_tag(content, 'VISUAL') or _extract_tag(content, 'VIDEO')
        voiceover = _extract_tag(content, 'VOICEOVER') or _extract_tag(content, 'VO')
        music = _extract_tag(content, 'MUSIC')
        sfx = _extract_tag(content, 'SFX')
        title_text = _extract_tag(content, 'TITLE')

        # If no explicit tags, use the raw content as fallback
        if not visual and not voiceover:
            lines = [l.strip() for l in content.strip().split('\n') if l.strip()]
            visual = lines[0] if lines else f"Scene {scene_num}"
            voiceover = ' '.join(lines[1:]) if len(lines) > 1 else ''

        # Build cinematic visual from description
        # We append a strong style suffix to ensure high production value
        cinematic_visual = (
            f"Cinematic 4K shot: {visual} "
            f"Professional corporate lighting, premium dark cinematic color grade, masterpiece, highly detailed."
        )

        # Duration estimate (~3 words/sec for voiceover, min 5s)
        word_count = len(voiceover.split()) if voiceover else len(visual.split())
        duration = max(5, round(word_count / 2.5)) # Slightly slower pacing for corporate feel

        scenes.append({
            "sceneNumber": scene_num,
            "title": title_text or clean_title or f"Scene {scene_num}",
            "durationSeconds": duration,
            "visualPrompt": cinematic_visual,
            "voiceover": voiceover or '',
            "musicCue": music,
            "sfxCue": sfx,
        })

    return scenes


def _extract_tag(content: str, tag: str) -> str:
    """
    Extract text following a [TAG] or TAG: marker until the next tag or end of block.
    """
    known_tags = ['VISUAL', 'VIDEO', 'VO', 'VOICEOVER', 'MUSIC', 'SFX', 'TITLE']
    tags_pattern = '|'.join(known_tags)
    
    # Match either [TAG] or Tag: (case insensitive)
    pattern = rf'(?i)(?:\[{tag}\]|{tag}:)\s*(.*?)(?=(?:\[(?:{tags_pattern})\]|(?:{tags_pattern}):|\Z))'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        # Clean up the extracted text (remove extra newlines, standardize spacing)
        text = match.group(1).strip()
        text = re.sub(r'\n+', ' ', text)
        return text
    return ''


def scenes_to_pexels_queries(scenes: List[Dict[str, Any]]) -> Dict[int, str]:
    """Generate Pexels search queries from scene visual prompts."""
    queries = {}
    for s in scenes:
        # Extract key visual nouns for search
        visual = s.get("visualPrompt", "")
        # Take first 50 chars as search query, cleaned
        clean = re.sub(r'[^a-zA-Z0-9\s]', '', visual[:80]).strip()
        words = clean.split()[:6]  # Max 6 words for Pexels
        queries[s["sceneNumber"]] = ' '.join(words)
    return queries
