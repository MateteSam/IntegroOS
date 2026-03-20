/**
 * StudioWorks Ultimate NLE V4
 * Full non-linear video editor with:
 *  - 6 creative transitions (cut, crossfade, wipe-right, wipe-down, zoom-through, blur-dissolve)
 *  - Smart audio classification (Voiceover / Music / SFX)
 *  - ElevenLabs AI voiceover generation
 *  - Drag-to-move timeline clips with snap
 *  - 5-track timeline (Video, Graphics, VO, Music, SFX)
 *  - Keyboard shortcuts (Space, Delete, ←→)
 *  - Ref-based 60fps playback engine
 */
import './LaunchFilmStudio.css';
import React, { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Download, Loader2, Type, Music, Settings, Video, Wand2,
    MonitorPlay, Save, Rewind, FastForward, Volume2, Clapperboard, Upload,
    SkipBack, SkipForward, Scissors, PanelLeftClose, PanelLeftOpen,
    PanelRightClose, PanelRightOpen, Sparkles, Image, Plus, Trash2,
    AlignCenter, AlignLeft, AlignRight, Bold, Sun, Droplets, Contrast,
    Layers, ChevronDown, RefreshCw, Eye, Palette, Film, Zap, Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// =========================================================================
// Constants & Config
// =========================================================================
const BACKEND_URL = 'http://localhost:5000';
const PPS = 6;  // pixels per second on timeline (6px × 205s = 1230px total width)
const TOTAL_DURATION = 205; // 7 scenes: 25+30+40+45+25+20+20 = 205s

const GOOGLE_FONTS = [
    'Inter', 'Montserrat', 'Bebas Neue', 'Playfair Display',
    'Cinzel', 'Raleway', 'Space Grotesk', 'Syne',
    'Cormorant Garamond', 'DM Serif Display', 'Impact', 'Georgia'
];

const TEXT_STYLES: { id: string; label: string; className: string }[] = [
    { id: 'cinematic', label: '🎬 Cinematic', className: 'text-fx-cinematic' },
    { id: 'neon', label: '✨ Neon Glow', className: 'text-fx-neon' },
    { id: 'outline', label: '⬛ Outline', className: 'text-fx-outline' },
    { id: 'gradient', label: '🌈 Silver Gradient', className: 'text-fx-gradient' },
    { id: 'plain', label: '⬜ Clean White', className: '' },
    { id: 'minimal', label: '— Minimal', className: 'opacity-90 tracking-widest uppercase text-sm' },
];

const TEXT_ANIMATIONS = ['fade', 'slide-up', 'slide-left', 'zoom', 'blur', 'typewriter'] as const;
type TextAnimation = typeof TEXT_ANIMATIONS[number];

const LOGO_ANIMATIONS = ['none', 'fade', 'slide-in', 'zoom-in', 'spin'] as const;
type LogoAnimation = typeof LOGO_ANIMATIONS[number];

const TRANSITIONS = ['cut', 'crossfade', 'wipe-right', 'wipe-down', 'zoom-through', 'blur-dissolve'] as const;
type TransitionType = typeof TRANSITIONS[number];

const AUDIO_CATEGORIES = ['voiceover', 'music', 'sfx'] as const;
type AudioCategory = typeof AUDIO_CATEGORIES[number];

const COLOR_GRADE_PRESETS: Record<string, Partial<ColorGrade>> = {
    none: { brightness: 1, contrast: 1, saturation: 1, hue: 0, sepia: 0 },
    cinematic: { brightness: 0.88, contrast: 1.15, saturation: 0.75, hue: -5, sepia: 0.08 },
    warm: { brightness: 1.05, contrast: 1.05, saturation: 1.2, hue: 12, sepia: 0.05 },
    cool: { brightness: 1.0, contrast: 1.1, saturation: 0.9, hue: -15, sepia: 0 },
    noir: { brightness: 0.85, contrast: 1.4, saturation: 0, hue: 0, sepia: 0.15 },
    vintage: { brightness: 0.95, contrast: 0.95, saturation: 0.7, hue: 8, sepia: 0.25 },
    vivid: { brightness: 1.05, contrast: 1.15, saturation: 1.5, hue: 0, sepia: 0 },
};

// =========================================================================
// Types
// =========================================================================
interface ColorGrade {
    brightness: number; contrast: number; saturation: number; hue: number; sepia: number;
    preset: string;
}

interface VideoClip {
    id: string; type: 'video';
    name: string; row: number;
    start: number; duration: number;
    fileUrl?: string;
    colorGrade: ColorGrade;
    transition: TransitionType;
    sceneNumber?: number;
}

interface TextOverlay {
    id: string; type: 'text';
    name: string; row: number;
    start: number; duration: number;
    text: string;
    font: string; fontSize: number;
    color: string; align: 'left' | 'center' | 'right';
    style: string; animation: TextAnimation;
    x: number; y: number; // percent from left/top
}

interface LogoClip {
    id: string; type: 'logo';
    name: string; row: number;
    start: number; duration: number;
    dataUrl: string;
    x: number; y: number; // percent
    width: number; // percent
    animation: LogoAnimation;
    opacity: number;
}

interface AudioTrack {
    id: string; type: 'audio';
    name: string; row: number;
    start: number; duration: number;
    volume: number; color: string;
    category: AudioCategory;
    fileUrl?: string;
    fadeIn: boolean; fadeOut: boolean;
    duckOnVO: boolean;
}

type TimelineItem = VideoClip | TextOverlay | LogoClip | AudioTrack;

const defaultColorGrade = (): ColorGrade => ({ brightness: 1, contrast: 1, saturation: 1, hue: 0, sepia: 0, preset: 'none' });

// =========================================================================
// Initial Timeline
// =========================================================================
// Total project: 205 seconds (7 scenes, zero gaps)
const INITIAL_CLIPS: TimelineItem[] = [
    // ==========================================
    // ROW 0: VIDEO CLIPS — 7 generated scenes, placed back-to-back with no gap
    // Durations tuned so scene 7 ends exactly at 205s
    // ==========================================
    { id: 'v1', type: 'video', name: 'Scene 1: The Institutional Shift', row: 0, start: 0, duration: 25, colorGrade: { ...defaultColorGrade(), preset: 'cinematic', ...COLOR_GRADE_PRESETS['cinematic'] }, transition: 'blur-dissolve', sceneNumber: 1, fileUrl: '/media/scene_1.mp4' },
    { id: 'v2', type: 'video', name: 'Scene 2: The Modern Challenge', row: 0, start: 25, duration: 30, colorGrade: { ...defaultColorGrade(), preset: 'noir', ...COLOR_GRADE_PRESETS['noir'] }, transition: 'wipe-right', sceneNumber: 2, fileUrl: '/media/scene_2.mp4' },
    { id: 'v3', type: 'video', name: 'Scene 3: The StudioWorks Solution', row: 0, start: 55, duration: 40, colorGrade: { ...defaultColorGrade(), preset: 'cool', ...COLOR_GRADE_PRESETS['cool'] }, transition: 'zoom-through', sceneNumber: 3, fileUrl: '/media/scene_3.mp4' },
    { id: 'v4', type: 'video', name: 'Scene 4: What We Deliver', row: 0, start: 95, duration: 45, colorGrade: { ...defaultColorGrade(), preset: 'cinematic', ...COLOR_GRADE_PRESETS['cinematic'] }, transition: 'crossfade', sceneNumber: 4, fileUrl: '/media/scene_4.mp4' },
    { id: 'v5', type: 'video', name: 'Scene 5: Who We Serve', row: 0, start: 140, duration: 25, colorGrade: { ...defaultColorGrade(), preset: 'warm', ...COLOR_GRADE_PRESETS['warm'] }, transition: 'blur-dissolve', sceneNumber: 5, fileUrl: '/media/scene_5.mp4' },
    { id: 'v6', type: 'video', name: 'Scene 6: Our Philosophy', row: 0, start: 165, duration: 20, colorGrade: { ...defaultColorGrade(), preset: 'cinematic', ...COLOR_GRADE_PRESETS['cinematic'] }, transition: 'wipe-down', sceneNumber: 6, fileUrl: '/media/scene_6.mp4' },
    { id: 'v7', type: 'video', name: 'Scene 7: Closing Declaration', row: 0, start: 185, duration: 20, colorGrade: { ...defaultColorGrade(), preset: 'cinematic', ...COLOR_GRADE_PRESETS['cinematic'] }, transition: 'cut', sceneNumber: 7, fileUrl: '/media/scene_7.mp4' },

    // ==========================================
    // ROW 1: MOTION GRAPHICS & TEXT — timed to hit 2s after each scene cut
    // ==========================================
    { id: 't1', type: 'text', name: 'Title: Institutional Evolution', row: 1, start: 2, duration: 6, text: 'INSTITUTIONS\nARE EVOLVING', font: 'Playfair Display', fontSize: 64, color: '#ffffff', align: 'left', style: 'cinematic', animation: 'slide-up', x: 10, y: 70 },
    { id: 't2', type: 'text', name: 'Title: The Challenge', row: 1, start: 27, duration: 5, text: 'GROWTH WITHOUT STRUCTURE', font: 'Bebas Neue', fontSize: 72, color: '#ff4444', align: 'center', style: 'minimal', animation: 'zoom', x: 50, y: 50 },
    { id: 't3', type: 'text', name: 'Title: The Solution', row: 1, start: 57, duration: 7, text: 'STRUCTURE.\nINTELLIGENCE.\nINTEGRATION.', font: 'Cinzel', fontSize: 56, color: '#d4af37', align: 'left', style: 'gradient', animation: 'fade', x: 10, y: 60 },
    { id: 't4a', type: 'text', name: 'Service: AI', row: 1, start: 97, duration: 6, text: 'INTELLIGENT SYSTEMS', font: 'Montserrat', fontSize: 48, color: '#ffffff', align: 'center', style: 'cinematic', animation: 'typewriter', x: 50, y: 50 },
    { id: 't4b', type: 'text', name: 'Service: Platforms', row: 1, start: 108, duration: 6, text: 'ENTERPRISE PLATFORMS', font: 'Montserrat', fontSize: 48, color: '#ffffff', align: 'center', style: 'minimal', animation: 'slide-up', x: 50, y: 50 },
    { id: 't5', type: 'text', name: 'Who We Serve', row: 1, start: 142, duration: 6, text: 'BUILT FOR LEADERS', font: 'Playfair Display', fontSize: 60, color: '#ffffff', align: 'center', style: 'cinematic', animation: 'fade', x: 50, y: 50 },
    { id: 't6', type: 'text', name: 'Philosophy', row: 1, start: 167, duration: 6, text: 'SYSTEMS THAT ENDURE', font: 'Cinzel', fontSize: 56, color: '#d4af37', align: 'center', style: 'gradient', animation: 'fade', x: 50, y: 50 },
    { id: 't7', type: 'text', name: 'End Card', row: 1, start: 187, duration: 16, text: 'WCCCS StudioWorks\n\nLet\'s build systems that endure.', font: 'Playfair Display', fontSize: 60, color: '#ffffff', align: 'center', style: 'cinematic', animation: 'fade', x: 50, y: 50 },

    // ==========================================
    // ROW 2: VOICEOVER — upload your VO file via Media panel
    // ==========================================
    { id: 'vo1', type: 'audio', name: 'Corporate Script VO (upload yours)', row: 2, start: 0, duration: 205, volume: 1.0, color: 'bg-emerald-600', category: 'voiceover', fadeIn: false, fadeOut: true, duckOnVO: false },

    // ==========================================
    // ROW 3: MUSIC — cinematic score loops for full 205s
    // ==========================================
    { id: 'm1', type: 'audio', name: 'Cinematic Corporate Score', row: 3, start: 0, duration: 205, volume: 0.22, color: 'bg-purple-600', category: 'music', fileUrl: '/media/music_cinematic.mp3', fadeIn: true, fadeOut: true, duckOnVO: true },

    // ==========================================
    // ROW 4: SOUND FX — reuse music file as placeholder hits
    // ==========================================
    { id: 'sfx1', type: 'audio', name: 'Cinematic Whoosh (Scene 1 In)', row: 4, start: 0, duration: 3, volume: 0.7, color: 'bg-amber-600', category: 'sfx', fileUrl: '/media/music_cinematic.mp3', fadeIn: false, fadeOut: true, duckOnVO: false },
    { id: 'sfx2', type: 'audio', name: 'Deep Impact (Scene 2 Cut)', row: 4, start: 25, duration: 4, volume: 0.8, color: 'bg-amber-600', category: 'sfx', fileUrl: '/media/music_cinematic.mp3', fadeIn: true, fadeOut: true, duckOnVO: false },
    { id: 'sfx3', type: 'audio', name: 'Subtle Riser (Scene 3 Transition)', row: 4, start: 53, duration: 3, volume: 0.6, color: 'bg-amber-600', category: 'sfx', fileUrl: '/media/music_cinematic.mp3', fadeIn: true, fadeOut: false, duckOnVO: false },
    { id: 'sfx4', type: 'audio', name: 'Epic Hit (End Card)', row: 4, start: 185, duration: 5, volume: 0.9, color: 'bg-amber-600', category: 'sfx', fileUrl: '/media/music_cinematic.mp3', fadeIn: false, fadeOut: true, duckOnVO: false },
];

// =========================================================================
// Framer Motion Variants per text animation style
// =========================================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const textVariants: Record<TextAnimation, any> = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    'slide-up': { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } },
    'slide-left': { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 40 } },
    zoom: { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.1 } },
    blur: { initial: { opacity: 0, filter: 'blur(12px)' }, animate: { opacity: 1, filter: 'blur(0px)' }, exit: { opacity: 0, filter: 'blur(12px)' } },
    typewriter: { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logoVariants: Record<LogoAnimation, any> = {
    none: { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    'slide-in': { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 50 } },
    'zoom-in': { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.5 } },
    spin: { initial: { opacity: 0, rotate: -90, scale: 0.5 }, animate: { opacity: 1, rotate: 0, scale: 1 }, exit: { opacity: 0, rotate: 90 } },
};

// =========================================================================
// Typewriter Hook
// =========================================================================
function useTypewriter(text: string, active: boolean, speed = 35) {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
        if (!active) { setDisplayed(''); return; }
        setDisplayed('');
        let i = 0;
        const iv = setInterval(() => {
            if (i >= text.length) { clearInterval(iv); return; }
            setDisplayed(text.slice(0, ++i));
        }, speed);
        return () => clearInterval(iv);
    }, [active, text]);
    return displayed;
}

// =========================================================================
// Colour-Grade CSS filter string
// =========================================================================
const gradeToFilter = (g: ColorGrade) =>
    `brightness(${g.brightness}) contrast(${g.contrast}) saturate(${g.saturation}) hue-rotate(${g.hue}deg) sepia(${g.sepia})`;

// =========================================================================
// Pure-DOM overlay components — rendered once, opacity driven by RAF via getElementById
// =========================================================================

/** Static placeholder rendered once. The RAF engine toggles opacity via getElementById. */
const TextOverlayDOM: React.FC<{ item: TextOverlay }> = React.memo(({ item }) => {
    const fxClass = item.style === 'neon' ? 'text-fx-neon'
        : item.style === 'outline' ? 'text-fx-outline'
            : item.style === 'gradient' ? 'text-fx-gradient'
                : item.style === 'cinematic' ? 'text-fx-cinematic'
                    : item.style === 'minimal' ? 'tracking-widest uppercase' : '';
    return (
        <div
            id={`tl-${item.id}`}
            className={cn('absolute z-40 pointer-events-none font-bold leading-[1.1] whitespace-pre-line', fxClass)}
            style={{
                left: `${item.x}%`, top: `${item.y}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: `'${item.font}', sans-serif`,
                fontSize: item.fontSize,
                color: item.color,
                textAlign: item.align,
                maxWidth: '80%',
                opacity: 0,
                transition: 'opacity 0.45s cubic-bezier(0.16,1,0.3,1)',
                willChange: 'opacity',
            }}
        >
            {item.text}
        </div>
    );
});

const LogoOverlayDOM: React.FC<{ item: LogoClip }> = React.memo(({ item }) => {
    if (!item.dataUrl) return null;
    return (
        <div
            id={`ll-${item.id}`}
            style={{
                position: 'absolute', zIndex: 50, pointerEvents: 'none',
                left: `${item.x}%`, top: `${item.y}%`,
                transform: 'translate(-50%,-50%)',
                width: `${item.width}%`,
                opacity: 0,
                transition: 'opacity 0.45s ease',
                willChange: 'opacity',
            }}
        >
            <img src={item.dataUrl} alt="logo" style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.8))' }} />
        </div>
    );
});

// =========================================================================
// Main NLE Component
// =========================================================================
const LaunchFilmStudio: React.FC = () => {
    const [clips, setClips] = useState<TimelineItem[]>(INITIAL_CLIPS);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const [activeProvider, setActiveProvider] = useState<'pexels' | 'wan' | 'kling'>('pexels');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    // Per-scene generation status: { sceneNumber: 'pending'|'generating'|'ready'|'error' }
    const [sceneStatuses, setSceneStatuses] = useState<Record<number, string>>({});
    const [genMessage, setGenMessage] = useState('');
    // V4: Audio classification modal
    const [audioModal, setAudioModal] = useState<{ file: File; url: string } | null>(null);
    // V4: AI Voiceover
    const [ttsText, setTtsText] = useState('');
    const [ttsLoading, setTtsLoading] = useState(false);
    const [voices, setVoices] = useState<{ voice_id: string; name: string }[]>([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    // V4: Drag-to-move
    const [dragState, setDragState] = useState<{ id: string; offsetX: number } | null>(null);
    // V4: Timeline zoom
    const [pps, setPps] = useState(PPS);
    // V4: Script import
    const [scriptText, setScriptText] = useState('');
    const [scriptLoading, setScriptLoading] = useState(false);
    const [leftTab, setLeftTab] = useState<'media' | 'script'>('media');

    const animRef = useRef<number>();
    const lastTRef = useRef(0);
    const ctRef = useRef(0);          // currentTime in a ref — no re-renders on every frame
    const lastUiUpdate = useRef(0);   // throttle React state updates to ~10fps
    const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
    const timelineRef = useRef<HTMLDivElement>(null);
    const timecodeRef = useRef<HTMLSpanElement>(null); // direct DOM update for timecode
    const playheadRef = useRef<HTMLDivElement>(null);  // direct DOM update for playhead
    const pollRef = useRef<ReturnType<typeof setInterval>>();
    const exportPollRef = useRef<ReturnType<typeof setInterval>>();

    // Cleanup all intervals on unmount
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            if (exportPollRef.current) clearInterval(exportPollRef.current);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    const videoClips = clips.filter(c => c.type === 'video') as VideoClip[];
    const textLayers = clips.filter(c => c.type === 'text') as TextOverlay[];
    const logoLayers = clips.filter(c => c.type === 'logo') as LogoClip[];
    const selectedItem = clips.find(c => c.id === selectedId) ?? null;

    // ---- Playback Engine (ref-based, smooth, no re-render storm) ----
    const audioClips = clips.filter(c => c.type === 'audio') as AudioTrack[];
    const formatTc = (t: number) =>
        `${Math.floor(t / 60).toString().padStart(2, '0')}:${Math.floor(t % 60).toString().padStart(2, '0')}.${Math.floor((t % 1) * 30).toString().padStart(2, '0')}`;

    const engineRef = useRef<(ts: number) => void>();
    engineRef.current = (ts: number) => {
        const delta = Math.min((ts - lastTRef.current) / 1000, 0.1);
        lastTRef.current = ts;
        const next = Math.min(ctRef.current + delta, TOTAL_DURATION);
        ctRef.current = next;

        // --- Direct DOM: timecode & playhead (no React re-render) ---
        if (timecodeRef.current) timecodeRef.current.textContent = formatTc(next);
        if (playheadRef.current) playheadRef.current.style.left = `${next * PPS}px`;

        // --- Video sync ---
        videoClips.forEach(vc => {
            const vid = videoRefs.current[vc.id];
            if (!vid || !vc.fileUrl) return;
            const visible = next >= vc.start && next < vc.start + vc.duration;
            vid.style.opacity = visible ? '1' : '0';
            if (visible) {
                const expected = next - vc.start;
                if (Math.abs(vid.currentTime - expected) > 0.3) vid.currentTime = expected;
                if (vid.paused) vid.play().catch(() => { });
            } else if (!vid.paused) vid.pause();
        });

        // --- Audio sync ---
        audioClips.forEach(ac => {
            const aud = audioRefs.current[ac.id];
            if (!aud || !(ac as any).fileUrl) return;
            const active = next >= ac.start && next < ac.start + ac.duration;
            aud.volume = ac.volume;
            if (active) {
                const expected = next - ac.start;
                if (Math.abs(aud.currentTime - expected) > 0.5) aud.currentTime = expected;
                if (aud.paused) aud.play().catch(() => { });
            } else if (!aud.paused) aud.pause();
        });

        // --- Text overlays: direct DOM opacity toggle — zero React re-renders ---
        textLayers.forEach(tl => {
            const el = document.getElementById(`tl-${tl.id}`);
            if (!el) return;
            const show = next >= tl.start && next < tl.start + tl.duration;
            el.style.opacity = show ? '1' : '0';
        });

        // --- Logo overlays: same pure-DOM approach ---
        logoLayers.forEach(ll => {
            const el = document.getElementById(`ll-${ll.id}`);
            if (!el) return;
            const show = next >= ll.start && next < ll.start + ll.duration;
            el.style.opacity = show ? String(ll.opacity) : '0';
        });

        // --- React state: update at ~8fps only (for Inspector/active video state) ---
        if (ts - lastUiUpdate.current > 125) {
            lastUiUpdate.current = ts;
            setCurrentTime(next);
        }

        if (next >= TOTAL_DURATION) {
            setIsPlaying(false);
            setCurrentTime(TOTAL_DURATION);
            return;
        }
        animRef.current = requestAnimationFrame(engineRef.current!);
    };

    useEffect(() => {
        if (isPlaying) {
            lastTRef.current = performance.now();
            animRef.current = requestAnimationFrame(engineRef.current!);
        } else {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            Object.values(videoRefs.current).forEach(v => v?.pause());
            Object.values(audioRefs.current).forEach(a => a?.pause());
        }
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [isPlaying]);

    // ---- Timeline click-to-scrub ----
    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const t = Math.max(0, Math.min((e.clientX - rect.left) / PPS, TOTAL_DURATION));
        ctRef.current = t;
        setCurrentTime(t);
        if (timecodeRef.current) timecodeRef.current.textContent = formatTc(t);
        if (playheadRef.current) playheadRef.current.style.left = `${t * PPS}px`;
        videoClips.forEach(vc => {
            const vid = videoRefs.current[vc.id];
            if (vid && vc.fileUrl) {
                const vis = t >= vc.start && t < vc.start + vc.duration;
                vid.style.opacity = vis ? '1' : '0';
                vid.currentTime = Math.max(0, t - vc.start);
            }
        });
        audioClips.forEach(ac => {
            const aud = audioRefs.current[ac.id];
            if (aud && (ac as any).fileUrl) aud.currentTime = Math.max(0, t - ac.start);
        });
    };

    // ---- Active video with cross-fade logic ----
    const getActiveVideo = () => videoClips.find(vc => currentTime >= vc.start && currentTime < vc.start + vc.duration);
    const activeVideo = getActiveVideo();

    // ---- Mutate helpers ----
    const updateClip = (id: string, patch: Partial<TimelineItem>) =>
        setClips(prev => prev.map(c => c.id === id ? { ...c, ...patch } as TimelineItem : c));
    const deleteSelected = () => { setClips(prev => prev.filter(c => c.id !== selectedId)); setSelectedId(null); };

    // ---- Add text / logo ----
    const addTextOverlay = () => {
        const id = `t${Date.now()}`;
        const newText: TextOverlay = { id, type: 'text', name: 'New Text', row: 1, start: currentTime, duration: 4, text: 'Your Text Here', font: 'Inter', fontSize: 60, color: '#ffffff', align: 'center', style: 'cinematic', animation: 'fade', x: 50, y: 50 };
        setClips(prev => [...prev, newText]);
        setSelectedId(id);
    };

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const id = `logo${Date.now()}`;
            const logo: LogoClip = { id, type: 'logo', name: file.name, row: 1, start: currentTime, duration: 10, dataUrl: ev.target?.result as string, x: 85, y: 10, width: 12, animation: 'fade', opacity: 1 };
            setClips(prev => [...prev, logo]);
            setSelectedId(id);
            toast.success('Logo added to timeline!');
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // ---- Audio Upload (V4: opens classification modal) ----
    const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAudioModal({ file, url });
        e.target.value = '';
    };

    // ---- V4: Generate from Script ----
    const generateFromScript = async () => {
        if (!scriptText.trim()) { toast.error('Paste a script first!'); return; }
        setScriptLoading(true);
        setGenMessage('Parsing script and generating media...');
        setIsGenerating(true);
        try {
            const r = await fetch(`${BACKEND_URL}/api/film/from-script`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script: scriptText.trim(), provider: activeProvider, generateVO: true })
            });
            const data = await r.json();
            if (!data.success) throw new Error(data.error || 'Script parsing failed');

            const newClips: TimelineItem[] = [];
            for (const scene of data.timeline) {
                newClips.push({
                    id: `v${scene.sceneNumber}`, type: 'video',
                    name: scene.title, row: 0,
                    start: scene.start, duration: scene.duration,
                    colorGrade: defaultColorGrade(), transition: 'crossfade' as TransitionType,
                    sceneNumber: scene.sceneNumber,
                });
                if (scene.voiceover) {
                    const shortText = scene.voiceover.split('.')[0] || scene.title;
                    newClips.push({
                        id: `t${scene.sceneNumber}`, type: 'text',
                        name: `Text: Scene ${scene.sceneNumber}`, row: 1,
                        start: scene.start + 0.5, duration: Math.min(scene.duration - 1, 4),
                        text: shortText, font: 'Cinzel', fontSize: 48,
                        color: '#ffffff', align: 'center', style: 'cinematic', animation: 'fade',
                        x: 50, y: 85,
                    });
                }
            }
            for (const vo of data.voiceovers || []) {
                const scene = data.timeline.find((s: any) => s.sceneNumber === vo.sceneNumber);
                if (scene) {
                    newClips.push({
                        id: `vo${vo.sceneNumber}`, type: 'audio',
                        name: `VO: Scene ${vo.sceneNumber}`, row: 2,
                        start: scene.start, duration: vo.duration,
                        volume: 1.0, color: 'bg-emerald-600', category: 'voiceover',
                        fileUrl: `${BACKEND_URL}${vo.download_url}`,
                        fadeIn: false, fadeOut: true, duckOnVO: false,
                    });
                }
            }
            newClips.push({
                id: 'bgm_auto', type: 'audio', name: 'Background Music', row: 3,
                start: 0, duration: data.totalDuration,
                volume: 0.25, color: 'bg-purple-600', category: 'music',
                fadeIn: true, fadeOut: true, duckOnVO: true,
            });
            setClips(newClips);
            setGenMessage(`${data.sceneCount} scenes parsed, ${data.voiceovers?.length || 0} VOs generated`);
            toast.success(`${data.sceneCount} scenes ready! Video generation started.`);

            if (data.filmJobId) {
                pollRef.current = setInterval(async () => {
                    try {
                        const poll = await fetch(`${BACKEND_URL}/api/film/status/${data.filmJobId}`);
                        const ct = poll.headers.get('content-type') || '';
                        if (!ct.includes('application/json')) { clearInterval(pollRef.current!); setIsGenerating(false); return; }
                        const status = await poll.json();
                        if (status.scenes && typeof status.scenes === 'object') {
                            const arr = Object.values(status.scenes) as any[];
                            const newStatuses: Record<number, string> = {};
                            arr.forEach((s: any) => { newStatuses[s.sceneNumber] = s.status; });
                            setSceneStatuses(newStatuses);
                            const ready = arr.filter((s: any) => s.status === 'ready').length;
                            setGenMessage(`${ready}/${arr.length} scenes ready...`);
                            setClips(prev => prev.map(c => {
                                if (c.type === 'video' && (c as VideoClip).sceneNumber) {
                                    const s = arr.find(s => s.sceneNumber === (c as VideoClip).sceneNumber);
                                    if (s?.status === 'ready' && s.videoFilename) return { ...c, fileUrl: `${BACKEND_URL}/api/film/download/${s.videoFilename}` };
                                }
                                return c;
                            }));
                        }
                        if (status.status === 'ready' || status.status === 'error') {
                            clearInterval(pollRef.current!); setIsGenerating(false);
                            if (status.status === 'ready') { toast.success('All scenes ready!'); setGenMessage('All scenes downloaded'); }
                            else { toast.error('Some scenes failed.'); setGenMessage('Completed with errors.'); }
                        }
                    } catch { clearInterval(pollRef.current!); setIsGenerating(false); }
                }, 5000);
            }
        } catch (e: any) { toast.error(e.message); setGenMessage(e.message); }
        setScriptLoading(false);
    };


    // ---- Generate footage ----
    const generateFootage = async () => {
        // Stop any previous stale poll
        if (pollRef.current) clearInterval(pollRef.current);
        try {
            setIsGenerating(true);
            setGenMessage('Sending request to backend...');
            const r = await fetch(`${BACKEND_URL}/api/film/generate`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: activeProvider })
            });
            if (!r.ok) throw new Error(`Backend error: ${r.status}`);
            const data = await r.json();
            if (!data.filmJobId) throw new Error('Backend failed to start job');
            setGenMessage(`Job started (${activeProvider}). Downloading footage...`);

            pollRef.current = setInterval(async () => {
                try {
                    const poll = await fetch(`${BACKEND_URL}/api/film/status/${data.filmJobId}`);
                    const ct = poll.headers.get('content-type') || '';
                    if (!ct.includes('application/json')) {
                        clearInterval(pollRef.current!); setIsGenerating(false);
                        setGenMessage('Rate limited — wait 30s and try again.');
                        return;
                    }
                    const status = await poll.json();
                    if (status.scenes && typeof status.scenes === 'object') {
                        const arr = Object.values(status.scenes) as any[];
                        // Update per-scene status display
                        const newStatuses: Record<number, string> = {};
                        arr.forEach((s: any) => { newStatuses[s.sceneNumber] = s.status; });
                        setSceneStatuses(newStatuses);
                        const ready = arr.filter((s: any) => s.status === 'ready').length;
                        setGenMessage(`${ready}/${arr.length} scenes ready...`);
                        setClips(prev => prev.map(c => {
                            if (c.type === 'video' && (c as VideoClip).sceneNumber) {
                                const s = arr.find(s => s.sceneNumber === (c as VideoClip).sceneNumber);
                                if (s?.status === 'ready' && s.videoFilename) return { ...c, fileUrl: `${BACKEND_URL}/api/film/download/${s.videoFilename}` };
                            }
                            return c;
                        }));
                    }
                    if (status.status === 'ready' || status.status === 'error') {
                        clearInterval(pollRef.current!); setIsGenerating(false);
                        if (status.status === 'ready') { toast.success('All scenes ready!'); setGenMessage('All scenes downloaded ✓'); }
                        else { toast.error('Some scenes failed.'); setGenMessage('Completed with errors.'); }
                    }
                } catch {
                    clearInterval(pollRef.current!); setIsGenerating(false);
                    setGenMessage('Polling error — check console.');
                }
            }, 5000);
        } catch (e: any) { toast.error(e.message); setIsGenerating(false); setGenMessage(e.message); }
    };

    // ---- Export (Browser-Native Canvas Recorder — no backend needed) ----
    const exportMasterpiece = async () => {
        if (exportPollRef.current) clearInterval(exportPollRef.current);
        setIsExporting(true);
        toast('Starting browser export — playing timeline to record…');

        try {
            // Determine best supported MIME
            const mimes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
            const mimeType = mimes.find(m => MediaRecorder.isTypeSupported(m)) ?? 'video/webm';

            // Create offscreen canvas at 1920x1080 (HD)
            const W = 1920, H = 1080;
            const offscreen = document.createElement('canvas');
            offscreen.width = W; offscreen.height = H;
            const ctx = offscreen.getContext('2d')!;

            const stream = offscreen.captureStream(60);
            const chunks: Blob[] = [];
            const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 25_000_000 });
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

            // Seek to start
            ctRef.current = 0;
            setCurrentTime(0);
            Object.values(videoRefs.current).forEach(v => { if (v) { v.currentTime = 0; v.pause(); } });
            Object.values(audioRefs.current).forEach(a => { if (a) { a.currentTime = 0; a.pause(); } });
            await new Promise(r => setTimeout(r, 200));

            recorder.start(500);

            // Drive the canvas frame by frame using rAF
            const FPS = 60;
            const frameDuration = 1000 / FPS;
            let t = 0;

            const renderFrame = (): Promise<void> => new Promise(resolve => {
                const active = videoClips.find(vc => t >= vc.start && t < vc.start + vc.duration);
                ctx.clearRect(0, 0, W, H);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, W, H);

                if (active) {
                    const vid = videoRefs.current[active.id];
                    if (vid && vid.readyState >= 2) {
                        // Apply color grade as CSS filter
                        const g = (active as VideoClip).colorGrade;
                        ctx.filter = `brightness(${g.brightness}) contrast(${g.contrast}) saturate(${g.saturation}) hue-rotate(${g.hue}deg) sepia(${g.sepia})`;
                        const vw = vid.videoWidth || W, vh = vid.videoHeight || H;
                        const scale = Math.max(W / vw, H / vh);
                        const dw = vw * scale, dh = vh * scale;
                        ctx.drawImage(vid, (W - dw) / 2, (H - dh) / 2, dw, dh);
                        ctx.filter = 'none';
                    }
                }

                // Draw active text overlays
                const activeTexts = textLayers.filter(tl => t >= tl.start && t < tl.start + tl.duration);
                for (const tl of activeTexts) {
                    ctx.save();
                    ctx.font = `bold ${tl.fontSize * 1.0}px "${tl.font}", sans-serif`;
                    ctx.fillStyle = tl.color;
                    ctx.textAlign = tl.align as CanvasTextAlign;
                    const tx = tl.align === 'center' ? W / 2 : tl.align === 'right' ? W * 0.9 : W * 0.1;
                    const ty = H * (tl.y / 100);
                    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
                    tl.text.split('\n').forEach((line, i) => ctx.fillText(line, tx, ty + i * tl.fontSize * 1.1));
                    ctx.restore();
                }

                // Progress update (~10fps React state update)
                const pct = Math.min(t / TOTAL_DURATION, 0.99);
                if (Math.round(t * 10) % 3 === 0) setCurrentTime(t);

                resolve();
            });

            // Step through time at real speed using wall clock
            const startWall = performance.now();
            await new Promise<void>((resolve, reject) => {
                const step = async () => {
                    t = Math.min((performance.now() - startWall) / 1000, TOTAL_DURATION);

                    // Sync video elements to current time
                    videoClips.forEach(vc => {
                        const vid = videoRefs.current[vc.id];
                        if (!vid) return;
                        const isActive = t >= vc.start && t < vc.start + vc.duration;
                        if (isActive) {
                            vid.style.opacity = '1';
                            const expected = t - vc.start;
                            if (Math.abs(vid.currentTime - expected) > 0.1) vid.currentTime = expected;
                            vid.play().catch(() => { });
                        } else {
                            vid.pause();
                            vid.style.opacity = '0';
                        }
                    });

                    await renderFrame();

                    if (t >= TOTAL_DURATION) { resolve(); return; }
                    requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            });

            // Final flush
            await renderFrame();
            await new Promise(r => setTimeout(r, 600));

            recorder.stop();
            stream.getTracks().forEach(t => t.stop());
            Object.values(videoRefs.current).forEach(v => v?.pause());
            Object.values(audioRefs.current).forEach(a => a?.pause());

            await new Promise<void>(resolve => { recorder.onstop = () => resolve(); });

            if (chunks.length === 0) throw new Error('Export produced an empty file. Ensure the timeline has video clips with uploaded files.');

            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `studioworks-export-${Date.now()}.webm`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 10000);

            toast.success(`✅ Exported ${(blob.size / 1024 / 1024).toFixed(1)} MB WebM! Check your downloads.`);
            setCurrentTime(0); ctRef.current = 0;
        } catch (e: any) {
            toast.error('Export failed: ' + e.message);
        } finally {
            setIsExporting(false);
        }
    };

    const timecode = `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}.${Math.floor((currentTime % 1) * 30).toString().padStart(2, '0')}`;

    // ---- Track row configs (V4: 5 tracks) ----
    const TRACKS = [
        { row: 0, label: 'Video', icon: <Video className="w-3.5 h-3.5 text-blue-400" />, height: 48 },
        { row: 1, label: 'Graphics & Text', icon: <Type className="w-3.5 h-3.5 text-amber-400" />, height: 34 },
        { row: 2, label: 'Voiceover', icon: <Mic className="w-3.5 h-3.5 text-emerald-400" />, height: 30 },
        { row: 3, label: 'Music', icon: <Music className="w-3.5 h-3.5 text-purple-400" />, height: 30 },
        { row: 4, label: 'Sound FX', icon: <Zap className="w-3.5 h-3.5 text-orange-400" />, height: 30 },
    ];

    const trackTopOffset = (row: number) => TRACKS.slice(0, row).reduce((acc, t) => acc + t.height + 1, 0);

    // ---- V4: Smart Audio Upload (stage 1: file → modal) ----
    const handleAudioUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAudioModal({ file, url });
        e.target.value = '';
    };

    // ---- V4: Commit audio with category from modal ----
    const commitAudio = (category: AudioCategory) => {
        if (!audioModal) return;
        const { file, url } = audioModal;
        const id = `a${Date.now()}`;
        const row = category === 'voiceover' ? 2 : category === 'music' ? 3 : 4;
        const volume = category === 'voiceover' ? 1.0 : category === 'music' ? 0.3 : 0.7;
        const color = category === 'voiceover' ? 'bg-emerald-600' : category === 'music' ? 'bg-purple-600' : 'bg-orange-600';
        const newAudio: AudioTrack = {
            id, type: 'audio', name: file.name.replace(/\.[^.]+$/, ''),
            row, start: 0, duration: TOTAL_DURATION,
            volume, color, category, fileUrl: url,
            fadeIn: false, fadeOut: false, duckOnVO: category === 'music',
        };
        setClips(prev => [...prev, newAudio]);
        setSelectedId(id);
        setAudioModal(null);
        toast.success(`${category.toUpperCase()} track added!`);
    };

    // ---- V4: AI Voiceover via ElevenLabs ----
    const generateAIVoiceover = async () => {
        if (!ttsText.trim()) { toast.error('Enter voiceover text first!'); return; }
        setTtsLoading(true);
        try {
            const r = await fetch(`${BACKEND_URL}/api/film/tts`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: ttsText.trim(), voice_id: selectedVoice || undefined })
            });
            const data = await r.json();
            if (!data.success) throw new Error(data.error || 'TTS failed');
            const id = `vo${Date.now()}`;
            const newVO: AudioTrack = {
                id, type: 'audio', name: 'AI Voiceover',
                row: 2, start: currentTime, duration: data.duration_estimate,
                volume: 1.0, color: 'bg-emerald-600', category: 'voiceover',
                fileUrl: `${BACKEND_URL}${data.download_url}`,
                fadeIn: false, fadeOut: true, duckOnVO: false,
            };
            setClips(prev => [...prev, newVO]);
            setSelectedId(id);
            setTtsText('');
            toast.success(`AI Voiceover generated! (~${data.duration_estimate}s)`);
        } catch (e: any) { toast.error(e.message); }
        setTtsLoading(false);
    };

    // ---- V4: Fetch ElevenLabs voices on mount (only if backend is reachable) ----
    useEffect(() => {
        // Probe the backend first with a short timeout to avoid console noise when offline
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 2000);
        fetch(`${BACKEND_URL}/api/film/voices`, { signal: ctrl.signal })
            .then(r => r.json())
            .then(d => { if (d.voices) setVoices(d.voices); })
            .catch(() => { /* backend offline — voices list stays empty */ })
            .finally(() => clearTimeout(timer));
    }, []);

    // ---- V4: Drag-to-move clips ----
    const handleClipPointerDown = (e: React.PointerEvent, clipId: string) => {
        e.stopPropagation();
        const clip = clips.find(c => c.id === clipId);
        if (!clip || !timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const offsetX = clickX - clip.start * pps;
        setDragState({ id: clipId, offsetX });
        setSelectedId(clipId);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };
    const handleClipPointerMove = (e: React.PointerEvent) => {
        if (!dragState || !timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - dragState.offsetX;
        let newStart = Math.max(0, x / pps);
        // Snap to other clip edges (within 0.3s)
        clips.forEach(c => {
            if (c.id === dragState.id) return;
            const cEnd = c.start + c.duration;
            if (Math.abs(newStart - c.start) < 0.3) newStart = c.start;
            if (Math.abs(newStart - cEnd) < 0.3) newStart = cEnd;
        });
        setClips(prev => prev.map(c => c.id === dragState.id ? { ...c, start: Math.round(newStart * 100) / 100 } as TimelineItem : c));
    };
    const handleClipPointerUp = () => setDragState(null);

    // ---- V4: Keyboard shortcuts ----
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'SELECT') return;
            if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); }
            if (e.code === 'Delete' && selectedId) { setClips(prev => prev.filter(c => c.id !== selectedId)); setSelectedId(null); }
            if (e.code === 'ArrowRight') { e.preventDefault(); const t = Math.min(TOTAL_DURATION, ctRef.current + 1 / 30); ctRef.current = t; setCurrentTime(t); }
            if (e.code === 'ArrowLeft') { e.preventDefault(); const t = Math.max(0, ctRef.current - 1 / 30); ctRef.current = t; setCurrentTime(t); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [selectedId]);

    // ---- V4: Timeline zoom via Ctrl+scroll ----
    useEffect(() => {
        const div = timelineRef.current;
        if (!div) return;
        const handler = (e: WheelEvent) => {
            if (!e.ctrlKey) return;
            e.preventDefault();
            setPps(prev => Math.max(8, Math.min(80, prev + (e.deltaY > 0 ? -2 : 2))));
        };
        div.addEventListener('wheel', handler, { passive: false });
        return () => div.removeEventListener('wheel', handler);
    }, []);

    // ---- Color grade of active clip ----
    const activeGrade = activeVideo ? gradeToFilter(activeVideo.colorGrade) : 'none';

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <div className="nle-root h-screen w-full flex flex-col select-none overflow-hidden">

            {/* Export overlay */}
            {isExporting && (
                <div className="nle-export-overlay">
                    <div className="nle-export-ring" />
                    <p className="text-white font-bold text-lg mb-2">Rendering Masterpiece…</p>
                    <p className="text-white/40 text-sm">Playing timeline in real time — do not close this tab</p>
                    <div className="nle-progress-bar mt-6" style={{ width: 320 }}>
                        <div className="nle-progress-fill" style={{ width: '100%' }} />
                    </div>
                </div>
            )}

            {/* Audio Classification Modal */}
            {audioModal && (
                <div className="nle-modal-overlay">
                    <div className="nle-modal">
                        <h3 className="text-sm font-bold text-white mb-1">Classify Audio Track</h3>
                        <p className="text-[11px] text-white/40 mb-4">How should &ldquo;{audioModal.file.name}&rdquo; be placed?</p>
                        <div className="space-y-2">
                            <button onClick={() => commitAudio('voiceover')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
                                <Mic className="w-5 h-5 text-emerald-400" />
                                <div className="text-left"><p className="text-xs font-bold text-emerald-300">🎤 Voiceover</p><p className="text-[10px] text-white/40">Narration, dialogue — Row 2, Vol 100%</p></div>
                            </button>
                            <button onClick={() => commitAudio('music')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all">
                                <Music className="w-5 h-5 text-purple-400" />
                                <div className="text-left"><p className="text-xs font-bold text-purple-300">🎵 Music</p><p className="text-[10px] text-white/40">Background score — Row 3, Vol 30%, auto-duck</p></div>
                            </button>
                            <button onClick={() => commitAudio('sfx')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-all">
                                <Zap className="w-5 h-5 text-orange-400" />
                                <div className="text-left"><p className="text-xs font-bold text-orange-300">💥 Sound Effect</p><p className="text-[10px] text-white/40">Whoosh, impact, ambience — Row 4, Vol 70%</p></div>
                            </button>
                        </div>
                        <button onClick={() => setAudioModal(null)} className="mt-3 w-full text-[10px] text-white/30 hover:text-white/60 transition-colors">Cancel</button>
                    </div>
                </div>
            )}

            {/* ================================================================ TOP NAV */}
            <header className="nle-header">
                <div className="nle-logo-badge">
                    <div className="nle-logo-icon">
                        <Clapperboard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="nle-logo-text">StudioWorks Ultra</div>
                        <div className="nle-logo-sub">GPU · 60fps · No-Code Cinema</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Provider selector */}
                    <div className="nle-provider-group">
                        {(['pexels', 'kling', 'wan'] as const).map(p => (
                            <button key={p} title={p} onClick={() => setActiveProvider(p)}
                                className={cn('nle-provider-btn', activeProvider === p && 'active')}>{p}</button>
                        ))}
                    </div>
                    <button title="Add Text Overlay" onClick={addTextOverlay} className="nle-btn">
                        <Type className="w-3.5 h-3.5" />Text
                    </button>
                    <label title="Upload Logo" className="nle-btn cursor-pointer">
                        <Image className="w-3.5 h-3.5" />Logo
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    <label title="Upload Audio" className="nle-btn cursor-pointer">
                        <Music className="w-3.5 h-3.5" />Audio
                        <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                    </label>
                    <button title="Generate AI footage" onClick={generateFootage} disabled={isGenerating}
                        className={cn('nle-btn nle-btn-primary', isGenerating && 'opacity-50')}>
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {isGenerating ? 'Generating…' : 'AI Generate'}
                    </button>
                    <button title="Export full video" onClick={exportMasterpiece} disabled={isExporting}
                        className={cn('nle-btn nle-btn-export', isExporting && 'opacity-60 pointer-events-none')}>
                        <Download className="w-3.5 h-3.5" />
                        Export Masterpiece
                    </button>
                </div>
            </header>

            {/* ================================================================ WORKSPACE */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* ========================== LEFT PANEL */}
                <div className={cn("nle-panel-collapse border-r border-white/6 bg-[#14161c] flex flex-col shrink-0", showLeftPanel ? "w-52 opacity-100" : "w-0 opacity-0")}>
                    {/* Tab switcher */}
                    <div className="flex border-b border-white/5 shrink-0">
                        <button onClick={() => setLeftTab('media')} className={cn('flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all', leftTab === 'media' ? 'text-white bg-white/5' : 'text-white/30 hover:text-white/60')}>Media</button>
                        <button onClick={() => setLeftTab('script')} className={cn('flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all', leftTab === 'script' ? 'text-white bg-white/5' : 'text-white/30 hover:text-white/60')}>Script</button>
                    </div>

                    {/* Script Import Tab */}
                    {leftTab === 'script' && (
                        <div className="flex-1 flex flex-col p-2.5 gap-2 overflow-hidden">
                            <p className="text-[9px] text-white/30 leading-relaxed">Paste your script. Each paragraph = one scene. The system auto-generates video + voiceover for every scene.</p>
                            <textarea title="Script input" placeholder={'[SCENE 1]\n[VISUAL] City skyline at dusk\n[VO] Welcome to the future...\n\n[SCENE 2]\n[VISUAL] Team collaboration\n[VO] Together we build...'}
                                value={scriptText} onChange={e => setScriptText(e.target.value)}
                                className="flex-1 nle-inspector-input resize-none text-[10px] leading-relaxed" />
                            <button onClick={generateFromScript} disabled={scriptLoading || !scriptText.trim()}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold transition-all disabled:opacity-40 shadow-lg">
                                {scriptLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                                Generate from Script
                            </button>
                            <p className="text-[8px] text-white/15 text-center">Video + AI voiceover per scene</p>
                        </div>
                    )}

                    {/* Media Pool Tab */}
                    {leftTab === 'media' && (<>
                        <div className="p-3 border-b border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Media Pool</span>
                            {isGenerating && <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />}
                        </div>

                        {/* Generation progress bar */}
                        {(isGenerating || genMessage) && (
                            <div className="px-2.5 pt-2">
                                <p className="text-[9px] text-indigo-300/80 mb-1.5 truncate">{genMessage}</p>
                                {isGenerating && (
                                    <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: `${Math.round((Object.values(sceneStatuses).filter(s => s === 'ready').length / Math.max(Object.values(sceneStatuses).length, 1)) * 100)}%` }} />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 mt-1">
                            {(clips.filter(c => c.type === 'video') as VideoClip[]).map(vc => {
                                const sceneStatus = sceneStatuses[vc.sceneNumber ?? 0];
                                const statusLabel = vc.fileUrl ? '● Ready' : sceneStatus === 'generating' ? '⟳ Generating...' : sceneStatus === 'error' ? '✗ Error' : '○ Pending';
                                const statusColor = vc.fileUrl ? 'text-emerald-400' : sceneStatus === 'generating' ? 'text-amber-400 animate-pulse' : sceneStatus === 'error' ? 'text-red-400' : 'text-white/25';
                                return (
                                    <button key={vc.id} title={vc.name} onClick={() => setSelectedId(vc.id)} className={cn("w-full text-left p-2 rounded-lg border transition-all", selectedId === vc.id ? "border-white/25 bg-white/10" : "border-white/5 bg-white/3 hover:bg-white/7")}>
                                        <div className="w-full aspect-video bg-black rounded-sm overflow-hidden mb-1.5 relative">
                                            {vc.fileUrl
                                                ? <video src={vc.fileUrl} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center">
                                                    {sceneStatus === 'generating' ? <Loader2 className="w-3 h-3 text-amber-400 animate-spin" /> : <MonitorPlay className="w-4 h-4 text-white/10" />}
                                                </div>}
                                        </div>
                                        <p className="text-[10px] truncate text-white/60 font-medium">{vc.name}</p>
                                        <p className={cn('text-[9px] mt-0.5', statusColor)}>{statusLabel}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </>)}
                </div>

                {/* ========================== CANVAS AREA */}
                <div className="flex-1 flex flex-col min-w-0 relative">

                    {/* Panel toggle buttons */}
                    <div className="absolute left-2 top-2 z-50 flex gap-1">
                        <button title={showLeftPanel ? 'Hide Media Pool' : 'Show Media Pool'} onClick={() => setShowLeftPanel(p => !p)} className="p-1.5 rounded-md bg-black/50 backdrop-blur border border-white/10 text-white/50 hover:text-white transition-all">
                            {showLeftPanel ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    <div className="absolute right-2 top-2 z-50">
                        <button title={showRightPanel ? 'Hide Inspector' : 'Show Inspector'} onClick={() => setShowRightPanel(p => !p)} className="p-1.5 rounded-md bg-black/50 backdrop-blur border border-white/10 text-white/50 hover:text-white transition-all">
                            {showRightPanel ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                        </button>
                    </div>

                    {/* Preview Canvas */}
                    <div className="flex-1 flex items-center justify-center relative overflow-hidden p-6" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, #0d0e18 0%, #07080d 100%)' }}>
                        <div className="nle-canvas-wrapper relative" style={{ height: '100%', maxHeight: 'calc(100vh - 310px)', aspectRatio: '16/9', maxWidth: '100%' }}>
                            {/* Vignette overlay */}
                            <div className="nle-canvas-vignette" />

                            {/* Video layers — GPU composited, smooth 0.35s crossfade */}
                            {videoClips.map(vc => (
                                <video
                                    key={vc.id}
                                    ref={el => { if (el) videoRefs.current[vc.id] = el; }}
                                    src={vc.fileUrl}
                                    muted playsInline loop preload="auto"
                                    className="nle-video-layer"
                                    style={{ opacity: 0, filter: gradeToFilter(vc.colorGrade) }}
                                />
                            ))}

                            {/* Hidden audio elements */}
                            {audioClips.map(ac => (ac as any).fileUrl ? (
                                <audio
                                    key={ac.id}
                                    ref={el => { if (el) audioRefs.current[ac.id] = el; else delete audioRefs.current[ac.id]; }}
                                    src={(ac as any).fileUrl}
                                    preload="auto"
                                    style={{ display: 'none' }}
                                />
                            ) : null)}

                            {/* Empty state */}
                            {!videoClips.some(v => v.fileUrl) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: 'rgba(255,255,255,0.12)' }}>
                                    <Film className="w-16 h-16 mb-3" />
                                    <p className="text-sm font-semibold tracking-wide">Your generated scenes appear here</p>
                                    <p className="text-xs mt-1 opacity-60">Press AI Generate to fetch footage</p>
                                </div>
                            )}

                            {/* Text overlays — static DOM, opacity driven by RAF engine at 60fps */}
                            {textLayers.map(tl => <TextOverlayDOM key={tl.id} item={tl} />)}

                            {/* Logo overlays — same pure-DOM approach */}
                            {logoLayers.map(ll => <LogoOverlayDOM key={ll.id} item={ll} />)}

                            {/* Timecode corner — direct DOM update at 60fps */}
                            <div className="absolute bottom-3 right-3 font-mono text-[11px] px-2.5 py-1 rounded-lg text-white/80" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                                <span ref={timecodeRef}>00:00.00</span>
                            </div>

                            {/* Color grade badge */}
                            {activeVideo && activeVideo.colorGrade.preset !== 'none' && (
                                <div className="absolute top-3 left-3 nle-badge nle-badge-gen">
                                    <Palette className="w-2.5 h-2.5" />{activeVideo.colorGrade.preset}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transport Controls */}
                    <div className="nle-transport">
                        <button title="Go to Start" onClick={() => { ctRef.current = 0; setCurrentTime(0); if (timecodeRef.current) timecodeRef.current.textContent = '00:00.00'; if (playheadRef.current) playheadRef.current.style.left = '0px'; }} className="nle-transport-btn"><SkipBack className="w-4 h-4" /></button>
                        <button title="Step Back" onClick={() => { const t = Math.max(0, ctRef.current - 1 / 30); ctRef.current = t; setCurrentTime(t); if (timecodeRef.current) timecodeRef.current.textContent = formatTc(t); if (playheadRef.current) playheadRef.current.style.left = `${t * PPS}px`; }} className="nle-transport-btn"><Rewind className="w-4 h-4" /></button>
                        <button title={isPlaying ? 'Pause (Space)' : 'Play (Space)'} onClick={() => setIsPlaying(p => !p)} className="nle-play-btn">
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <button title="Step Forward" onClick={() => { const t = Math.min(TOTAL_DURATION, ctRef.current + 1 / 30); ctRef.current = t; setCurrentTime(t); if (timecodeRef.current) timecodeRef.current.textContent = formatTc(t); if (playheadRef.current) playheadRef.current.style.left = `${t * PPS}px`; }} className="nle-transport-btn"><FastForward className="w-4 h-4" /></button>
                        <button title="Go to End" onClick={() => { ctRef.current = TOTAL_DURATION; setCurrentTime(TOTAL_DURATION); if (timecodeRef.current) timecodeRef.current.textContent = formatTc(TOTAL_DURATION); if (playheadRef.current) playheadRef.current.style.left = `${TOTAL_DURATION * PPS}px`; }} className="nle-transport-btn"><SkipForward className="w-4 h-4" /></button>
                        <div className="nle-timecode"><span ref={timecodeRef}>00:00.00</span></div>
                        <div className="nle-scrub-bar flex-1" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); const t = Math.max(0, Math.min((e.clientX - r.left) / r.width * TOTAL_DURATION, TOTAL_DURATION)); ctRef.current = t; setCurrentTime(t); if (timecodeRef.current) timecodeRef.current.textContent = formatTc(t); if (playheadRef.current) playheadRef.current.style.left = `${t * PPS}px`; }}>
                            <div className="nle-scrub-fill" style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }} />
                        </div>
                        {selectedId && <button title="Delete Selected (Del)" onClick={deleteSelected} className="nle-transport-btn text-red-400/60 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                </div>

                {/* ========================== RIGHT INSPECTOR PANEL */}
                <div className={cn("nle-panel-collapse border-l border-white/6 bg-[#14161c] flex flex-col shrink-0 overflow-y-auto", showRightPanel ? "w-64 opacity-100" : "w-0 opacity-0")}>
                    <div className="p-3 border-b border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Inspector</span>
                    </div>

                    {!selectedItem && (
                        <div className="flex-1 flex flex-col p-3 gap-3">
                            <p className="text-[11px] text-white/20 text-center leading-relaxed">Click a clip on the timeline to edit properties</p>
                            {/* V4: AI Voiceover Generator */}
                            <div className="border border-white/5 rounded-lg p-3 bg-white/2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">AI Voiceover</span>
                                </div>
                                <textarea title="Voiceover script" placeholder="Type your voiceover script here..." value={ttsText} onChange={e => setTtsText(e.target.value)} rows={4}
                                    className="nle-inspector-input resize-none mb-2 text-[11px]" />
                                {voices.length > 0 && (
                                    <select title="Voice" value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} className="nle-inspector-input mb-2 text-[10px]">
                                        <option value="">Default Voice</option>
                                        {voices.map(v => <option key={v.voice_id} value={v.voice_id}>{v.name}</option>)}
                                    </select>
                                )}
                                <button onClick={generateAIVoiceover} disabled={ttsLoading || !ttsText.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold transition-all disabled:opacity-40">
                                    {ttsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    Generate Voiceover
                                </button>
                            </div>
                            <p className="text-[9px] text-white/15 text-center">Powered by ElevenLabs</p>
                        </div>
                    )}

                    {/* VIDEO INSPECTOR */}
                    {selectedItem?.type === 'video' && (() => {
                        const vc = selectedItem as VideoClip;
                        const g = vc.colorGrade;
                        return (
                            <div className="p-3 space-y-4">
                                <p className="text-xs font-bold text-white/60 truncate">{vc.name}</p>

                                {/* Preset buttons */}
                                <div>
                                    <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">Color Preset</p>
                                    <div className="grid grid-cols-3 gap-1">
                                        {Object.keys(COLOR_GRADE_PRESETS).map(pk => (
                                            <button key={pk} title={pk} onClick={() => updateClip(vc.id, { colorGrade: { ...g, preset: pk, ...COLOR_GRADE_PRESETS[pk] } })} className={cn("text-[9px] py-1.5 rounded border uppercase tracking-widest transition-all", g.preset === pk ? "border-indigo-400 bg-indigo-500/20 text-indigo-300" : "border-white/8 text-white/40 hover:text-white/70 hover:border-white/15")}>{pk}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sliders */}
                                {([['brightness', 0.4, 1.6], ['contrast', 0.4, 2], ['saturation', 0, 2], ['hue', -180, 180], ['sepia', 0, 1]] as [keyof ColorGrade, number, number][]).map(([key, min, max]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-[10px] text-white/40 mb-1"><span className="capitalize">{key}</span><span>{typeof g[key] === 'number' ? (g[key] as number).toFixed(2) : ''}</span></div>
                                        <input type="range" min={min} max={max} step={0.01} value={g[key] as number}
                                            onChange={e => updateClip(vc.id, { colorGrade: { ...g, preset: 'custom', [key]: parseFloat(e.target.value) } })}
                                            className="nle-slider" />
                                    </div>
                                ))}

                                {/* Transition (V4: 6 types) */}
                                <div>
                                    <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">Transition (out)</p>
                                    <div className="grid grid-cols-3 gap-1">
                                        {TRANSITIONS.map(tr => (
                                            <button key={tr} title={tr} onClick={() => updateClip(vc.id, { transition: tr } as Partial<VideoClip>)} className={cn("text-[8px] py-1.5 rounded border uppercase tracking-widest transition-all", vc.transition === tr ? "border-indigo-400 bg-indigo-500/20 text-indigo-300" : "border-white/8 text-white/40 hover:text-white/70")}>{tr.replace('-', '\n')}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* TEXT INSPECTOR */}
                    {selectedItem?.type === 'text' && (() => {
                        const tl = selectedItem as TextOverlay;
                        return (
                            <div className="p-3 space-y-3">
                                <p className="text-xs font-bold text-white/60">Text Properties</p>

                                <textarea title="Text content" value={tl.text} onChange={e => updateClip(tl.id, { text: e.target.value } as Partial<TextOverlay>)} rows={3} className="nle-inspector-input resize-none" />

                                <div>
                                    <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Font</p>
                                    <select title="Font family" value={tl.font} onChange={e => updateClip(tl.id, { font: e.target.value } as Partial<TextOverlay>)} className="nle-inspector-input">
                                        {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>Font Size</span><span>{tl.fontSize}px</span></div>
                                    <input type="range" min={20} max={120} step={2} value={tl.fontSize} onChange={e => updateClip(tl.id, { fontSize: +e.target.value } as Partial<TextOverlay>)} className="nle-slider" />
                                </div>

                                <div className="flex gap-2 items-center">
                                    <div>
                                        <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Color</p>
                                        <input type="color" title="Text color" value={tl.color} onChange={e => updateClip(tl.id, { color: e.target.value } as Partial<TextOverlay>)} className="w-10 h-7 rounded border border-white/10 bg-transparent cursor-pointer" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Align</p>
                                        <div className="flex gap-1">
                                            {(['left', 'center', 'right'] as const).map(a => (
                                                <button key={a} title={a} onClick={() => updateClip(tl.id, { align: a } as Partial<TextOverlay>)} className={cn("flex-1 py-1 rounded border transition-all", tl.align === a ? "border-indigo-400 bg-indigo-500/20" : "border-white/8 text-white/40 hover:text-white/70")}>
                                                    {a === 'left' ? <AlignLeft className="w-3 h-3 mx-auto" /> : a === 'center' ? <AlignCenter className="w-3 h-3 mx-auto" /> : <AlignRight className="w-3 h-3 mx-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Style Effect</p>
                                    <div className="space-y-1">
                                        {TEXT_STYLES.map(s => (
                                            <button key={s.id} title={s.label} onClick={() => updateClip(tl.id, { style: s.id } as Partial<TextOverlay>)} className={cn("w-full text-left text-[10px] px-2.5 py-1.5 rounded border transition-all", tl.style === s.id ? "border-indigo-400 bg-indigo-500/20 text-indigo-300" : "border-white/6 text-white/40 hover:text-white/70 hover:border-white/15")}>{s.label}</button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Animation</p>
                                    <select title="Animation style" value={tl.animation} onChange={e => updateClip(tl.id, { animation: e.target.value as TextAnimation } as Partial<TextOverlay>)} className="nle-inspector-input capitalize">
                                        {TEXT_ANIMATIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">Position (X / Y)</p>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input type="range" min={5} max={95} value={tl.x} onChange={e => updateClip(tl.id, { x: +e.target.value } as Partial<TextOverlay>)} className="nle-slider" title="X position" />
                                        </div>
                                        <div className="flex-1">
                                            <input type="range" min={5} max={95} value={tl.y} onChange={e => updateClip(tl.id, { y: +e.target.value } as Partial<TextOverlay>)} className="nle-slider" title="Y position" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* LOGO INSPECTOR */}
                    {selectedItem?.type === 'logo' && (() => {
                        const ll = selectedItem as LogoClip;
                        return (
                            <div className="p-3 space-y-3">
                                <p className="text-xs font-bold text-white/60">Logo / Image</p>
                                <div className="bg-black rounded-lg p-2">
                                    <img src={ll.dataUrl} alt="logo" className="w-full object-contain max-h-20" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>Width</span><span>{ll.width}%</span></div>
                                    <input type="range" min={5} max={60} value={ll.width} onChange={e => updateClip(ll.id, { width: +e.target.value } as Partial<LogoClip>)} className="nle-slider" title="Logo width" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>Opacity</span><span>{(ll.opacity * 100).toFixed(0)}%</span></div>
                                    <input type="range" min={0} max={1} step={0.01} value={ll.opacity} onChange={e => updateClip(ll.id, { opacity: +e.target.value } as Partial<LogoClip>)} className="nle-slider" title="Logo opacity" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">Position (X / Y)</p>
                                    <div className="flex gap-2">
                                        <input type="range" min={5} max={95} value={ll.x} onChange={e => updateClip(ll.id, { x: +e.target.value } as Partial<LogoClip>)} className="nle-slider" title="X position" />
                                        <input type="range" min={5} max={95} value={ll.y} onChange={e => updateClip(ll.id, { y: +e.target.value } as Partial<LogoClip>)} className="nle-slider" title="Y position" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Entry Animation</p>
                                    <select title="Logo animation" value={ll.animation} onChange={e => updateClip(ll.id, { animation: e.target.value as LogoAnimation } as Partial<LogoClip>)} className="nle-inspector-input">
                                        {LOGO_ANIMATIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>
                        );
                    })()}

                    {/* V4: AUDIO INSPECTOR */}
                    {selectedItem?.type === 'audio' && (() => {
                        const ac = selectedItem as AudioTrack;
                        return (
                            <div className="p-3 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded',
                                        ac.category === 'voiceover' ? 'bg-emerald-500/20 text-emerald-400' :
                                            ac.category === 'music' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-orange-500/20 text-orange-400'
                                    )}>{ac.category}</span>
                                    <p className="text-xs font-bold text-white/60 truncate flex-1">{ac.name}</p>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>Volume</span><span>{(ac.volume * 100).toFixed(0)}%</span></div>
                                    <input type="range" min={0} max={1.5} step={0.01} value={ac.volume} onChange={e => updateClip(ac.id, { volume: +e.target.value } as Partial<AudioTrack>)} className="nle-slider" title="Volume" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>Start</span><span>{ac.start.toFixed(1)}s</span></div>
                                    <input type="range" min={0} max={TOTAL_DURATION - 1} step={0.1} value={ac.start} onChange={e => updateClip(ac.id, { start: +e.target.value } as Partial<AudioTrack>)} className="nle-slider" title="Start time" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => updateClip(ac.id, { fadeIn: !ac.fadeIn } as Partial<AudioTrack>)} className={cn('flex-1 text-[9px] py-1.5 rounded border transition-all', ac.fadeIn ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300' : 'border-white/8 text-white/40')}>Fade In</button>
                                    <button onClick={() => updateClip(ac.id, { fadeOut: !ac.fadeOut } as Partial<AudioTrack>)} className={cn('flex-1 text-[9px] py-1.5 rounded border transition-all', ac.fadeOut ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300' : 'border-white/8 text-white/40')}>Fade Out</button>
                                </div>
                                {ac.category === 'music' && (
                                    <button onClick={() => updateClip(ac.id, { duckOnVO: !ac.duckOnVO } as Partial<AudioTrack>)} className={cn('w-full text-[9px] py-1.5 rounded border transition-all', ac.duckOnVO ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-white/8 text-white/40')}>
                                        🎤 Auto-duck when VO active
                                    </button>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* ================================================================ TIMELINE */}
            <div className="h-48 shrink-0 border-t border-white/10 bg-[#0f1115] flex flex-col">
                <div className="flex h-full overflow-hidden">
                    {/* Track label column */}
                    <div className="w-48 shrink-0 border-r border-white/6 bg-[#14161c] flex flex-col z-10">
                        <div className="h-6 border-b border-white/5 bg-[#1a1c23] shrink-0" />
                        {TRACKS.map(tr => (
                            <div key={tr.row} className="nle-track-header shrink-0" style={{ height: tr.height }}>
                                {tr.icon}
                                <span className="text-[10px] font-semibold text-white/60 truncate">{tr.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Timeline scrollable area */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden relative" ref={timelineRef} onClick={handleTimelineClick}>
                        {/* Time ruler */}
                        <div className="h-6 bg-[#1a1c23] border-b border-white/5 shrink-0 relative" style={{ width: TOTAL_DURATION * pps }}>
                            {Array.from({ length: TOTAL_DURATION + 1 }).map((_, i) => (
                                <div key={i} className="absolute bottom-0 border-l border-white/10 h-2" style={{ left: i * pps }}>
                                    {i % 5 === 0 && <span className="absolute text-[8px] text-white/30 -left-3 -top-3.5">0:{i.toString().padStart(2, '0')}</span>}
                                </div>
                            ))}
                        </div>

                        {/* Clip tracks */}
                        <div className="relative" style={{ width: TOTAL_DURATION * pps, height: TRACKS.reduce((a, t) => a + t.height + 1, 0) }}>
                            {/* Track bg stripes */}
                            {TRACKS.map(tr => (
                                <div key={tr.row} className="absolute left-0 right-0 border-b border-white/4" style={{ top: trackTopOffset(tr.row), height: tr.height, background: tr.row % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }} />
                            ))}

                            {/* Clips — gradient fills, GPU layer */}
                            {clips.map(clip => {
                                const tr = TRACKS.find(t => t.row === clip.row);
                                if (!tr) return null;
                                const top = trackTopOffset(clip.row);
                                const h = tr.height - 6;
                                const ac = clip as AudioTrack;
                                const typeClass = clip.type === 'video' ? 'nle-clip-video'
                                    : clip.type === 'text' ? 'nle-clip-text'
                                        : clip.type === 'logo' ? 'nle-clip-logo'
                                            : ac.category === 'voiceover' ? 'nle-clip-audio-vo'
                                                : ac.category === 'music' ? 'nle-clip-music'
                                                    : 'nle-clip-sfx';

                                return (
                                    <div
                                        key={clip.id}
                                        title={clip.name}
                                        onClick={e => { e.stopPropagation(); setSelectedId(clip.id); }}
                                        onPointerDown={e => handleClipPointerDown(e, clip.id)}
                                        onPointerMove={handleClipPointerMove}
                                        onPointerUp={handleClipPointerUp}
                                        className={cn('nle-timeline-clip', typeClass, selectedId === clip.id && 'selected', dragState?.id === clip.id && 'opacity-70')}
                                        style={{ left: clip.start * pps, width: Math.max(clip.duration * pps, 24), top: top + 3, height: h, cursor: 'grab', touchAction: 'none' }}
                                    >
                                        {/* Waveform bars for audio clips */}
                                        {(clip.type === 'audio') && (
                                            <div className="nle-waveform" style={{ height: h - 4 }}>
                                                {Array.from({ length: Math.min(Math.floor(clip.duration * pps / 3), 60) }).map((_, i) => (
                                                    <div key={i} className="nle-waveform-bar" style={{ '--d': `${0.4 + (i % 7) * 0.1}s` } as any} />
                                                ))}
                                            </div>
                                        )}
                                        <span className="nle-timeline-clip-label">{clip.name}</span>
                                        {clip.type === 'video' && !(clip as VideoClip).fileUrl && <Loader2 className="w-2.5 h-2.5 shrink-0 animate-spin text-white/50 ml-auto" />}
                                    </div>
                                );
                            })}

                            {/* Playhead */}
                            <div className="nle-playhead" ref={playheadRef} style={{ left: currentTime * pps }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LaunchFilmStudio;
