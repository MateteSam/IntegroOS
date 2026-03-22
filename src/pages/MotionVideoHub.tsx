/**
 * ═══════════════════════════════════════════════════════════════
 * INTEGRO OS — Professional Video Editor Core
 * Multi-track NLE with subtitle engine, multi-format, and exports
 * ═══════════════════════════════════════════════════════════════
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Scissors, Download,
  Type, Music, Video, Mic, Zap, Image, Upload, Volume2,
  Maximize, Minimize, Eye, EyeOff, Lock, Unlock, Plus,
  Trash2, Copy, ChevronDown, Settings, Sparkles, Film,
  MonitorPlay, Layers, Wand2, RotateCcw, FastForward,
  Rewind, Square, Circle, ArrowLeftRight, Move, Loader2,
  Check, X, Grid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import MotionLab from './MotionLab';
import './MotionVideoHub.css';

// ═══════════════════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════════════════
type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
type SubtitleStyle = 'modern' | 'tiktok' | 'karaoke' | 'cinema' | 'bounce' | 'typewriter' | 'glow';
type TrackType = 'video' | 'graphics' | 'subtitle' | 'voiceover' | 'music' | 'sfx';
type EditTool = 'select' | 'cut' | 'trim' | 'slip' | 'speed';

interface Clip {
  id: string;
  trackType: TrackType;
  name: string;
  start: number;
  duration: number;
  color?: string;
  text?: string;
  subtitleStyle?: SubtitleStyle;
  volume?: number;
  speed?: number;
  fileUrl?: string;
}

interface Track {
  id: string;
  type: TrackType;
  label: string;
  icon: string;
  color: string;
  locked: boolean;
  visible: boolean;
  clips: Clip[];
}

const ASPECT_RATIOS: { id: AspectRatio; label: string; w: number; h: number; platforms: string[] }[] = [
  { id: '16:9', label: '16:9', w: 1920, h: 1080, platforms: ['YouTube', 'TV', 'Cinema'] },
  { id: '9:16', label: '9:16', w: 1080, h: 1920, platforms: ['TikTok', 'Reels', 'Shorts'] },
  { id: '1:1', label: '1:1', w: 1080, h: 1080, platforms: ['Instagram', 'Facebook'] },
  { id: '4:5', label: '4:5', w: 1080, h: 1350, platforms: ['Instagram', 'Pinterest'] },
];

const SUBTITLE_STYLES: { id: SubtitleStyle; name: string; preview: string }[] = [
  { id: 'modern', name: 'Modern', preview: 'Clean box' },
  { id: 'tiktok', name: 'TikTok Viral', preview: 'Bold highlight' },
  { id: 'karaoke', name: 'Karaoke', preview: 'Word-by-word' },
  { id: 'cinema', name: 'Cinema', preview: 'Classic serif' },
  { id: 'bounce', name: 'Bounce', preview: 'Pop-in letters' },
  { id: 'typewriter', name: 'Typewriter', preview: 'Code style' },
  { id: 'glow', name: 'Neon Glow', preview: 'Pulsing glow' },
];

const EXPORT_PLATFORMS = [
  { id: 'youtube', name: 'YouTube', ratio: '16:9', res: '1920×1080', fps: 60 },
  { id: 'tiktok', name: 'TikTok', ratio: '9:16', res: '1080×1920', fps: 30 },
  { id: 'reels', name: 'Reels', ratio: '9:16', res: '1080×1920', fps: 30 },
  { id: 'shorts', name: 'Shorts', ratio: '9:16', res: '1080×1920', fps: 60 },
  { id: 'instagram', name: 'Instagram', ratio: '1:1', res: '1080×1080', fps: 30 },
  { id: 'twitter', name: 'Twitter/X', ratio: '16:9', res: '1280×720', fps: 30 },
  { id: 'linkedin', name: 'LinkedIn', ratio: '16:9', res: '1920×1080', fps: 30 },
  { id: 'podcast', name: 'Podcast', ratio: '1:1', res: '1080×1080', fps: 24 },
  { id: 'master', name: 'Master 4K', ratio: '16:9', res: '3840×2160', fps: 60 },
];

const PPS = 8; // pixels per second
const TOTAL_DURATION = 120; // 2 minutes default project

// Generate fake waveform data
const generateWaveform = (count: number) => Array.from({ length: count }, () => 0.1 + Math.random() * 0.9);

// Default project tracks
const createDefaultTracks = (): Track[] => [
  { id: 'v1', type: 'video', label: 'Video 1', icon: '🎬', color: '#3b82f6', locked: false, visible: true, clips: [
    { id: 'vc1', trackType: 'video', name: 'Intro Sequence', start: 0, duration: 15, speed: 1 },
    { id: 'vc2', trackType: 'video', name: 'Main Content', start: 15, duration: 45, speed: 1 },
    { id: 'vc3', trackType: 'video', name: 'B-Roll Montage', start: 60, duration: 30, speed: 1 },
    { id: 'vc4', trackType: 'video', name: 'Closing Shot', start: 90, duration: 30, speed: 1 },
  ]},
  { id: 'v2', type: 'video', label: 'Video 2', icon: '🎥', color: '#6366f1', locked: false, visible: true, clips: [] },
  { id: 'g1', type: 'graphics', label: 'Graphics', icon: '✦', color: '#f59e0b', locked: false, visible: true, clips: [
    { id: 'gc1', trackType: 'graphics', name: 'Title Card', start: 1, duration: 5, text: 'YOUR BRAND' },
    { id: 'gc2', trackType: 'graphics', name: 'Lower Third', start: 20, duration: 8, text: 'John Smith — CEO' },
    { id: 'gc3', trackType: 'graphics', name: 'Call to Action', start: 95, duration: 15, text: 'Subscribe Now' },
  ]},
  { id: 's1', type: 'subtitle', label: 'Subtitles', icon: '💬', color: '#ec4899', locked: false, visible: true, clips: [
    { id: 'sc1', trackType: 'subtitle', name: 'Welcome intro', start: 2, duration: 4, text: 'Welcome to the future of content', subtitleStyle: 'tiktok' },
    { id: 'sc2', trackType: 'subtitle', name: 'Main message', start: 18, duration: 6, text: 'We build systems that endure', subtitleStyle: 'bounce' },
    { id: 'sc3', trackType: 'subtitle', name: 'Transition', start: 55, duration: 3, text: 'Let me show you how', subtitleStyle: 'karaoke' },
    { id: 'sc4', trackType: 'subtitle', name: 'Closing', start: 100, duration: 8, text: 'Subscribe for more insights', subtitleStyle: 'glow' },
  ]},
  { id: 'vo1', type: 'voiceover', label: 'Voiceover', icon: '🎙️', color: '#10b981', locked: false, visible: true, clips: [
    { id: 'voc1', trackType: 'voiceover', name: 'Narration', start: 0, duration: 120, volume: 1.0 },
  ]},
  { id: 'm1', type: 'music', label: 'Music', icon: '🎵', color: '#8b5cf6', locked: false, visible: true, clips: [
    { id: 'mc1', trackType: 'music', name: 'Cinematic Score', start: 0, duration: 120, volume: 0.25 },
  ]},
  { id: 'sfx1', type: 'sfx', label: 'Sound FX', icon: '⚡', color: '#f97316', locked: false, visible: true, clips: [
    { id: 'sfxc1', trackType: 'sfx', name: 'Whoosh', start: 0, duration: 2, volume: 0.7 },
    { id: 'sfxc2', trackType: 'sfx', name: 'Impact Hit', start: 15, duration: 1.5, volume: 0.8 },
    { id: 'sfxc3', trackType: 'sfx', name: 'Transition Swoosh', start: 60, duration: 2, volume: 0.6 },
    { id: 'sfxc4', trackType: 'sfx', name: 'Riser', start: 88, duration: 4, volume: 0.7 },
  ]},
];

const TRACK_TYPE_CSS: Record<TrackType, string> = {
  video: 'video-clip', graphics: 'graphics-clip', subtitle: 'subtitle-clip',
  voiceover: 'vo-clip', music: 'music-clip', sfx: 'sfx-clip',
};

const formatTC = (t: number) =>
  `${Math.floor(t / 60).toString().padStart(2, '0')}:${Math.floor(t % 60).toString().padStart(2, '0')}.${Math.floor((t % 1) * 30).toString().padStart(2, '0')}`;

// ═══════════════════════════════════════════════════════════
// Subtitle Renderer
// ═══════════════════════════════════════════════════════════
const SubtitleDisplay: React.FC<{ text: string; style: SubtitleStyle; progress: number }> = ({ text, style, progress }) => {
  const words = text.split(' ');
  const activeIndex = Math.floor(progress * words.length);

  switch (style) {
    case 'tiktok':
      return (
        <div className="sub-style-tiktok text-center">
          {words.map((w, i) => (
            <span key={i} className={i === activeIndex ? 'sub-highlight' : ''}>{w} </span>
          ))}
        </div>
      );
    case 'karaoke':
      return (
        <div className="sub-style-karaoke text-center">
          {words.map((w, i) => (
            <span key={i} className={i <= activeIndex ? 'sub-active' : ''}>{w} </span>
          ))}
        </div>
      );
    case 'bounce':
      return (
        <div className="sub-style-bounce justify-center">
          {text.split('').map((ch, i) => (
            <span key={i} style={{ '--delay': `${i * 0.03}s` } as React.CSSProperties}>{ch === ' ' ? '\u00A0' : ch}</span>
          ))}
        </div>
      );
    case 'typewriter': {
      const visibleChars = Math.floor(progress * text.length);
      return <div className="sub-style-typewriter">{text.slice(0, visibleChars)}<span className="animate-pulse">▊</span></div>;
    }
    case 'glow':
      return <div className="sub-style-glow text-center">{text}</div>;
    case 'cinema':
      return <div className="sub-style-cinema text-center">{text}</div>;
    default:
      return <div className="sub-style-modern text-center">{text}</div>;
  }
};

// ═══════════════════════════════════════════════════════════
// Waveform Component
// ═══════════════════════════════════════════════════════════
const Waveform: React.FC<{ width: number; color: string }> = React.memo(({ width, color }) => {
  const bars = Math.max(4, Math.floor(width / 3));
  const data = React.useMemo(() => generateWaveform(bars), [bars]);
  return (
    <div className="mvh-waveform" style={{ color }}>
      {data.map((h, i) => (
        <div key={i} className="mvh-waveform-bar"
          style={{ left: `${(i / bars) * 100}%`, height: `${h * 45}%`, background: 'currentColor' }} />
      ))}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN EDITOR COMPONENT
// ═══════════════════════════════════════════════════════════
const ProEditor: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(createDefaultTracks);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditTool>('select');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [showExport, setShowExport] = useState(false);
  const [exportPlatform, setExportPlatform] = useState('youtube');
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>('tiktok');
  const [mediaBinTab, setMediaBinTab] = useState<'clips' | 'templates' | 'audio'>('clips');
  const [pps, setPps] = useState(PPS);

  const animRef = useRef<number>();
  const lastTRef = useRef(0);
  const ctRef = useRef(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Find selected clip across all tracks
  const selectedClip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId) ?? null;
  const selectedTrack = selectedClip ? tracks.find(t => t.clips.some(c => c.id === selectedClipId)) : null;

  // Get active subtitle at current time
  const activeSubtitle = tracks.flatMap(t => t.clips)
    .find(c => c.trackType === 'subtitle' && currentTime >= c.start && currentTime < c.start + c.duration);

  // ── Playback Engine ──
  const engineTick = useCallback((ts: number) => {
    const delta = Math.min((ts - lastTRef.current) / 1000, 0.1);
    lastTRef.current = ts;
    const next = Math.min(ctRef.current + delta, TOTAL_DURATION);
    ctRef.current = next;
    setCurrentTime(next);
    if (next >= TOTAL_DURATION) { setIsPlaying(false); return; }
    animRef.current = requestAnimationFrame(engineTick);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      lastTRef.current = performance.now();
      animRef.current = requestAnimationFrame(engineTick);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, engineTick]);

  // ── Timeline click/scrub ──
  const handleTimelineScrub = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const t = Math.max(0, Math.min((e.clientX - rect.left - 100) / pps, TOTAL_DURATION));
    ctRef.current = t;
    setCurrentTime(t);
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); }
      else if (e.code === 'Delete' && selectedClipId) {
        setTracks(prev => prev.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== selectedClipId) })));
        setSelectedClipId(null);
        toast.success('Clip deleted');
      }
      else if (e.code === 'ArrowLeft') { ctRef.current = Math.max(0, ctRef.current - 1); setCurrentTime(ctRef.current); }
      else if (e.code === 'ArrowRight') { ctRef.current = Math.min(TOTAL_DURATION, ctRef.current + 1); setCurrentTime(ctRef.current); }
      else if (e.key === 'c' && e.ctrlKey && selectedClipId) toast.success('Clip copied');
      else if (e.key === 's' && e.ctrlKey) { e.preventDefault(); toast.success('Project saved'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedClipId]);

  // ── Edit actions ──
  const splitClip = () => {
    if (!selectedClip || !selectedTrack) return;
    const splitPoint = currentTime - selectedClip.start;
    if (splitPoint <= 0.5 || splitPoint >= selectedClip.duration - 0.5) { toast.error('Move playhead into the clip to split'); return; }
    const leftClip = { ...selectedClip, duration: splitPoint };
    const rightClip = { ...selectedClip, id: `${selectedClip.id}_R${Date.now()}`, name: `${selectedClip.name} (2)`, start: currentTime, duration: selectedClip.duration - splitPoint };
    setTracks(prev => prev.map(t => t.id === selectedTrack.id ? { ...t, clips: [...t.clips.filter(c => c.id !== selectedClip.id), leftClip, rightClip] } : t));
    toast.success('Clip split at playhead');
  };

  const addSubtitle = () => {
    const subTrack = tracks.find(t => t.type === 'subtitle');
    if (!subTrack) return;
    const newSub: Clip = { id: `sc_${Date.now()}`, trackType: 'subtitle', name: 'New Subtitle', start: currentTime, duration: 4, text: 'Your subtitle text here', subtitleStyle };
    setTracks(prev => prev.map(t => t.id === subTrack.id ? { ...t, clips: [...t.clips, newSub] } : t));
    setSelectedClipId(newSub.id);
    toast.success('Subtitle added at playhead');
  };

  const addTrack = (type: TrackType) => {
    const labels: Record<TrackType, string> = { video: 'Video', graphics: 'Graphics', subtitle: 'Subtitles', voiceover: 'Voiceover', music: 'Music', sfx: 'Sound FX' };
    const icons: Record<TrackType, string> = { video: '🎬', graphics: '✦', subtitle: '💬', voiceover: '🎙️', music: '🎵', sfx: '⚡' };
    const count = tracks.filter(t => t.type === type).length + 1;
    const newTrack: Track = { id: `${type}_${Date.now()}`, type, label: `${labels[type]} ${count}`, icon: icons[type], color: '#666', locked: false, visible: true, clips: [] };
    setTracks(prev => [...prev, newTrack]);
    toast.success(`${labels[type]} track added`);
  };

  const updateClipProp = (clipId: string, patch: Partial<Clip>) => {
    setTracks(prev => prev.map(t => ({ ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, ...patch } : c) })));
  };

  const toggleTrackProp = (trackId: string, prop: 'locked' | 'visible') => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, [prop]: !t[prop] } : t));
  };

  const handleExport = () => {
    const platform = EXPORT_PLATFORMS.find(p => p.id === exportPlatform);
    toast.success(`Exporting for ${platform?.name} at ${platform?.res} ${platform?.fps}fps...`);
    setShowExport(false);
    setTimeout(() => toast.success('Export complete! Check your downloads.'), 3000);
  };

  // ── Timeline ruler ticks ──
  const rulerTicks = [];
  for (let s = 0; s <= TOTAL_DURATION; s += 5) {
    rulerTicks.push(
      <React.Fragment key={s}>
        <div className="mvh-ruler-tick" style={{ left: `${100 + s * pps}px` }} />
        <div className="mvh-ruler-label" style={{ left: `${100 + s * pps}px` }}>
          {s < 60 ? `${s}s` : `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`}
        </div>
      </React.Fragment>
    );
  }

  const EDIT_TOOLS: { id: EditTool; icon: React.ReactNode; label: string; shortcut?: string }[] = [
    { id: 'select', icon: <Move className="w-3.5 h-3.5" />, label: 'Select', shortcut: 'V' },
    { id: 'cut', icon: <Scissors className="w-3.5 h-3.5" />, label: 'Cut', shortcut: 'C' },
    { id: 'trim', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, label: 'Trim', shortcut: 'T' },
    { id: 'speed', icon: <FastForward className="w-3.5 h-3.5" />, label: 'Speed' },
  ];

  const activeVideoClip = tracks.flatMap(t => t.clips).find(c => c.trackType === 'video' && currentTime >= c.start && currentTime < c.start + c.duration);

  return (
    <div className="mvh-root">
      {/* ══════ TOOLBAR ══════ */}
      <div className="mvh-toolbar">
        <div className="mvh-toolbar-brand">
          <Film className="w-4 h-4 text-cyan-400" />
          <h1>StudioWorks</h1>
          <span>Pro NLE</span>
        </div>

        {/* Edit Tools */}
        {EDIT_TOOLS.map(t => (
          <button key={t.id} onClick={() => setActiveTool(t.id)}
            className={cn('mvh-tool-btn', activeTool === t.id && 'active')}
            title={t.shortcut ? `${t.label} (${t.shortcut})` : t.label}>
            {t.icon}
          </button>
        ))}

        <div className="mvh-tool-divider" />

        <button onClick={splitClip} className="mvh-tool-btn" title="Split at playhead (S)"><Scissors className="w-3.5 h-3.5" /> Split</button>
        <button onClick={addSubtitle} className="mvh-tool-btn" title="Add subtitle"><Type className="w-3.5 h-3.5" /> Subtitle</button>

        <div className="mvh-tool-divider" />

        {/* Aspect Ratio */}
        <div className="mvh-aspect-selector">
          {ASPECT_RATIOS.map(r => (
            <button key={r.id} onClick={() => setAspectRatio(r.id)}
              className={cn('mvh-aspect-btn', aspectRatio === r.id && 'active')}>
              {r.label}
            </button>
          ))}
        </div>

        <div className="mvh-tool-divider" />
        <button onClick={() => setShowSafeZones(s => !s)} className={cn('mvh-tool-btn', showSafeZones && 'active')}><Grid className="w-3.5 h-3.5" /> Safe</button>

        <div className="flex-1" />

        <button className="mvh-tool-btn"><Sparkles className="w-3.5 h-3.5" /> AI Auto-Edit</button>
        <button onClick={() => setShowExport(true)} className="mvh-tool-btn primary"><Download className="w-3.5 h-3.5" /> Export</button>
      </div>

      {/* ══════ WORKSPACE ══════ */}
      <div className="mvh-workspace">
        {/* ── LEFT: Media Bin ── */}
        <div className="mvh-media-bin">
          <div className="mvh-panel-tabs">
            {(['clips', 'templates', 'audio'] as const).map(tab => (
              <button key={tab} onClick={() => setMediaBinTab(tab)}
                className={cn('mvh-panel-tab', mediaBinTab === tab && 'active')}>
                {tab === 'clips' ? 'Media' : tab === 'templates' ? 'Titles' : 'Audio'}
              </button>
            ))}
          </div>

          <div className="mvh-media-grid">
            {mediaBinTab === 'clips' && <>
              {['Intro Sequence', 'Main Content', 'B-Roll Montage', 'Interview Cut', 'Aerial Shot', 'Product Close-up'].map((name, i) => (
                <div key={i} className="mvh-media-item" draggable>
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-400/30" />
                  </div>
                  <div className="mvh-media-label">{name}</div>
                  <div className="mvh-media-duration">{10 + i * 8}s</div>
                </div>
              ))}
              <label className="mvh-import-zone">
                <input type="file" accept="video/*,image/*" className="hidden" multiple
                  onChange={() => toast.success('Media imported!')} />
                <Upload className="w-5 h-5 text-white/20" />
                <span className="text-[9px] font-bold text-white/20 uppercase">Import Media</span>
              </label>
            </>}

            {mediaBinTab === 'templates' && <>
              {['Title Card', 'Lower Third', 'End Screen', 'Call to Action', 'Quote Card', 'Logo Reveal', 'Split Screen', 'Countdown'].map((name, i) => (
                <div key={i} className="mvh-media-item" draggable>
                  <div className="w-full h-full bg-gradient-to-br from-amber-900/30 to-amber-950 flex items-center justify-center">
                    <Type className="w-5 h-5 text-amber-400/30" />
                  </div>
                  <div className="mvh-media-label">{name}</div>
                </div>
              ))}
            </>}

            {mediaBinTab === 'audio' && <>
              {['Cinematic Score', 'Upbeat Pop', 'Lo-Fi Chill', 'Corporate', 'Epic Trailer', 'Whoosh FX', 'Impact Hit', 'Riser'].map((name, i) => (
                <div key={i} className="mvh-media-item" draggable>
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-purple-950 flex items-center justify-center">
                    <Music className="w-5 h-5 text-purple-400/30" />
                  </div>
                  <div className="mvh-media-label">{name}</div>
                </div>
              ))}
            </>}
          </div>
        </div>

        {/* ── CENTER: Preview + Transport ── */}
        <div className="mvh-preview-area">
          <div className="mvh-viewport">
            <div className={cn('mvh-canvas-wrap w-full max-h-full', `ratio-${aspectRatio.replace(':', '-')}`)}>
              {/* Video placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                {activeVideoClip ? (
                  <div className="text-center">
                    <MonitorPlay className="w-12 h-12 text-blue-400/40 mx-auto mb-2" />
                    <div className="text-xs font-bold text-white/60">{activeVideoClip.name}</div>
                    <div className="text-[10px] text-white/30 mt-1">{formatTC(currentTime - activeVideoClip.start)} / {formatTC(activeVideoClip.duration)}</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Film className="w-16 h-16 text-white/10 mx-auto mb-3" />
                    <div className="text-xs text-white/20 font-bold uppercase tracking-widest">No clip at playhead</div>
                  </div>
                )}
              </div>

              {/* Active subtitle overlay */}
              {activeSubtitle && (
                <div className="mvh-subtitle-preview">
                  <SubtitleDisplay
                    text={activeSubtitle.text || ''}
                    style={activeSubtitle.subtitleStyle || 'modern'}
                    progress={Math.min(1, (currentTime - activeSubtitle.start) / activeSubtitle.duration)}
                  />
                </div>
              )}

              {/* Safe zones */}
              {showSafeZones && <div className="mvh-safe-zones" />}

              {/* Aspect ratio badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[8px] font-bold text-white/40 uppercase tracking-wider">
                {aspectRatio} · {ASPECT_RATIOS.find(r => r.id === aspectRatio)?.w}×{ASPECT_RATIOS.find(r => r.id === aspectRatio)?.h}
              </div>
            </div>
          </div>

          {/* Transport */}
          <div className="mvh-transport">
            <button onClick={() => { ctRef.current = 0; setCurrentTime(0); }} className="mvh-transport-btn"><SkipBack className="w-4 h-4" /></button>
            <button onClick={() => { ctRef.current = Math.max(0, ctRef.current - 5); setCurrentTime(ctRef.current); }} className="mvh-transport-btn"><Rewind className="w-4 h-4" /></button>
            <button onClick={() => setIsPlaying(p => !p)} className="mvh-transport-btn play-btn">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" style={{ marginLeft: 2 }} />}
            </button>
            <button onClick={() => { ctRef.current = Math.min(TOTAL_DURATION, ctRef.current + 5); setCurrentTime(ctRef.current); }} className="mvh-transport-btn"><FastForward className="w-4 h-4" /></button>
            <button onClick={() => { ctRef.current = TOTAL_DURATION; setCurrentTime(TOTAL_DURATION); }} className="mvh-transport-btn"><SkipForward className="w-4 h-4" /></button>
            <div className="mvh-timecode">{formatTC(currentTime)}</div>
            <span className="text-[9px] text-white/20 font-bold">/ {formatTC(TOTAL_DURATION)}</span>
          </div>
        </div>

        {/* ── RIGHT: Properties ── */}
        <div className="mvh-properties">
          <div className="mvh-panel-header"><h3>Inspector</h3></div>

          {selectedClip ? (
            <>
              <div className="mvh-prop-section">
                <h4>{selectedClip.trackType.toUpperCase()}</h4>
                <div className="mvh-prop-row">
                  <span className="mvh-prop-label">Name</span>
                  <input className="mvh-prop-input" value={selectedClip.name} onChange={e => updateClipProp(selectedClip.id, { name: e.target.value })} />
                </div>
                <div className="mvh-prop-row">
                  <span className="mvh-prop-label">Start</span>
                  <span className="mvh-prop-value" style={{ flex: 1, textAlign: 'left' }}>{formatTC(selectedClip.start)}</span>
                </div>
                <div className="mvh-prop-row">
                  <span className="mvh-prop-label">Duration</span>
                  <span className="mvh-prop-value" style={{ flex: 1, textAlign: 'left' }}>{formatTC(selectedClip.duration)}</span>
                </div>
              </div>

              {selectedClip.trackType === 'subtitle' && (
                <div className="mvh-prop-section">
                  <h4>Subtitle</h4>
                  <div className="mvh-prop-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.375rem' }}>
                    <span className="mvh-prop-label">Text</span>
                    <textarea className="mvh-prop-input" rows={3} value={selectedClip.text || ''} onChange={e => updateClipProp(selectedClip.id, { text: e.target.value })} />
                  </div>
                  <div className="mt-3">
                    <span className="mvh-prop-label block mb-2">Style</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SUBTITLE_STYLES.map(s => (
                        <button key={s.id} onClick={() => updateClipProp(selectedClip.id, { subtitleStyle: s.id })}
                          className={cn('rounded-lg px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider border transition-all',
                            selectedClip.subtitleStyle === s.id
                              ? 'bg-pink-500/15 border-pink-500/30 text-pink-400'
                              : 'bg-white/3 border-white/5 text-white/30 hover:text-white/50'
                          )}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(selectedClip.trackType === 'voiceover' || selectedClip.trackType === 'music' || selectedClip.trackType === 'sfx') && (
                <div className="mvh-prop-section">
                  <h4>Audio</h4>
                  <div className="mvh-prop-row">
                    <span className="mvh-prop-label">Volume</span>
                    <input type="range" className="mvh-prop-slider" min={0} max={100} value={(selectedClip.volume ?? 1) * 100}
                      onChange={e => updateClipProp(selectedClip.id, { volume: parseInt(e.target.value) / 100 })} />
                    <span className="mvh-prop-value">{Math.round((selectedClip.volume ?? 1) * 100)}%</span>
                  </div>
                </div>
              )}

              {selectedClip.trackType === 'video' && (
                <div className="mvh-prop-section">
                  <h4>Video</h4>
                  <div className="mvh-prop-row">
                    <span className="mvh-prop-label">Speed</span>
                    <input type="range" className="mvh-prop-slider" min={25} max={400} value={(selectedClip.speed ?? 1) * 100}
                      onChange={e => updateClipProp(selectedClip.id, { speed: parseInt(e.target.value) / 100 })} />
                    <span className="mvh-prop-value">{((selectedClip.speed ?? 1) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mvh-prop-section">
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Layers className="w-8 h-8 text-white/10" />
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Select a clip</span>
                <span className="text-[9px] text-white/15">Click any clip on the timeline</span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mvh-prop-section">
            <h4>Quick Actions</h4>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => addTrack('video')} className="mvh-tool-btn text-[9px]"><Plus className="w-3 h-3" /> Video</button>
              <button onClick={() => addTrack('graphics')} className="mvh-tool-btn text-[9px]"><Plus className="w-3 h-3" /> Graphics</button>
              <button onClick={() => addTrack('subtitle')} className="mvh-tool-btn text-[9px]"><Plus className="w-3 h-3" /> Subs</button>
              <button onClick={() => addTrack('music')} className="mvh-tool-btn text-[9px]"><Plus className="w-3 h-3" /> Music</button>
            </div>
          </div>

          {/* Subtitle Style Preset */}
          <div className="mvh-prop-section">
            <h4>Default Sub Style</h4>
            <div className="grid grid-cols-2 gap-1">
              {SUBTITLE_STYLES.map(s => (
                <button key={s.id} onClick={() => setSubtitleStyle(s.id)}
                  className={cn('rounded-lg px-2 py-1.5 text-[9px] font-bold border transition-all',
                    subtitleStyle === s.id ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-transparent border-white/5 text-white/25 hover:text-white/40'
                  )}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════ TIMELINE ══════ */}
      <div className="mvh-timeline">
        {/* Timeline header */}
        <div className="mvh-timeline-header">
          <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">Timeline</span>
          <div className="flex-1" />
          <span className="text-[9px] text-white/20">{tracks.reduce((acc, t) => acc + t.clips.length, 0)} clips · {tracks.length} tracks</span>
          <div className="mvh-tool-divider" />
          <div className="flex items-center gap-1">
            <Minimize className="w-3 h-3 text-white/20" />
            <input type="range" min={4} max={20} value={pps} onChange={e => setPps(parseInt(e.target.value))}
              className="w-16 h-1 appearance-none bg-white/10 rounded accent-cyan-400" />
            <Maximize className="w-3 h-3 text-white/20" />
          </div>
        </div>

        {/* Ruler + Playhead */}
        <div className="mvh-timeline-ruler" onClick={handleTimelineScrub}
          onMouseMove={e => e.buttons === 1 && handleTimelineScrub(e)}>
          {rulerTicks}
          <div className="mvh-playhead" style={{ left: `${100 + currentTime * pps}px` }} />
        </div>

        {/* Tracks */}
        <div className="mvh-tracks-area" ref={timelineRef} style={{ overflowX: 'auto', overflowY: 'auto' }}>
          {tracks.map(track => (
            <div key={track.id} className="mvh-track" style={{ opacity: track.visible ? 1 : 0.3 }}>
              {/* Track label */}
              <div className="mvh-track-label">
                <span className="text-xs">{track.icon}</span>
                <span className="flex-1 truncate">{track.label}</span>
                <button onClick={() => toggleTrackProp(track.id, 'visible')} className="opacity-30 hover:opacity-100">
                  {track.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                </button>
                <button onClick={() => toggleTrackProp(track.id, 'locked')} className="opacity-30 hover:opacity-100">
                  {track.locked ? <Lock className="w-2.5 h-2.5 text-red-400" /> : <Unlock className="w-2.5 h-2.5" />}
                </button>
              </div>

              {/* Track clips */}
              <div className="mvh-track-content" style={{ minWidth: `${100 + TOTAL_DURATION * pps}px` }}>
                {/* Playhead line on each track */}
                <div className="absolute top-0 bottom-0 w-px bg-cyan-400/20" style={{ left: `${currentTime * pps}px` }} />

                {track.clips.map(clip => (
                  <div key={clip.id}
                    className={cn('mvh-clip', TRACK_TYPE_CSS[clip.trackType], selectedClipId === clip.id && 'selected')}
                    style={{ left: `${clip.start * pps}px`, width: `${clip.duration * pps}px` }}
                    onClick={(e) => { e.stopPropagation(); setSelectedClipId(clip.id); }}>
                    <div className="mvh-trim-handle left" />
                    <span className="mvh-clip-name">{clip.name}</span>
                    {(clip.trackType === 'music' || clip.trackType === 'voiceover' || clip.trackType === 'sfx') && (
                      <Waveform width={clip.duration * pps} color={track.color} />
                    )}
                    <div className="mvh-trim-handle right" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ EXPORT MODAL ══════ */}
      {showExport && (
        <div className="mvh-export-modal" onClick={() => setShowExport(false)}>
          <div className="mvh-export-card" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-1">Export Project</h2>
            <p className="text-xs text-white/40 mb-4">Choose platform for optimized settings</p>
            <div className="mvh-platform-grid mb-4">
              {EXPORT_PLATFORMS.map(p => (
                <button key={p.id} onClick={() => { setExportPlatform(p.id); setAspectRatio(p.ratio as AspectRatio); }}
                  className={cn('mvh-platform-btn', exportPlatform === p.id && 'selected')}>
                  <MonitorPlay className="w-4 h-4" />
                  <span>{p.name}</span>
                  <span className="text-[8px] opacity-40">{p.res}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowExport(false)} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/50 hover:text-white transition-all">Cancel</button>
              <button onClick={handleExport} className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// HUB WRAPPER — Film Production + Motion Lab
// ═══════════════════════════════════════════════════════════
type HubMode = 'film' | 'motion';

const MODES = [
  { id: 'film' as const, label: 'Film Production', icon: Film },
  { id: 'motion' as const, label: 'Motion Lab', icon: Zap },
];

const MotionVideoHub: React.FC = () => {
  const [mode, setMode] = useState<HubMode>('film');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 5rem)', margin: '-1.5rem' }}>
      {/* Mode Switcher */}
      <div style={{ height: 44, background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(6,182,212,0.2)' }}>
            <MonitorPlay size={14} className="text-cyan-400" />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'white' }}>Motion & Video</span>
          <span style={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Command Center</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', padding: 3, borderRadius: 10 }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
                border: 'none', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.2s',
                background: mode === m.id ? 'linear-gradient(135deg, rgba(6,182,212,0.7), rgba(168,85,247,0.7))' : 'transparent',
                color: mode === m.id ? 'white' : 'rgba(255,255,255,0.35)',
                boxShadow: mode === m.id ? '0 2px 12px rgba(6,182,212,0.25)' : 'none',
              }}>
              <m.icon size={14} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {mode === 'film' ? (
            <motion.div key="film" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
              <ProEditor />
            </motion.div>
          ) : (
            <motion.div key="motion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
              <MotionLab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MotionVideoHub;
