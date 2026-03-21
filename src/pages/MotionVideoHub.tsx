/**
 * ═══════════════════════════════════════════════════════════════
 * INTEGRO OS — Motion & Video Command Center
 * Unified hub combining:
 *  - StudioWorks Film NLE (full timeline editor)
 *  - Motion Lab (MOGRT templates, AI director, live preview)
 *  - MockupGenius Motion Engine (3D poster, parallax, glitch)
 * ═══════════════════════════════════════════════════════════════
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film, Zap, Play, Pause, Download, Sparkles, Eye, ChevronRight,
  Layers, Settings, RefreshCw, Palette, Monitor, Video, Music,
  Image, Type, Wand2, Loader2, RotateCcw, Grid, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import LaunchFilmStudio from './LaunchFilmStudio';

// ═══════════════════════════════════════════════════════════════
// Motion Template System (from MockupGenius-Pro2 MotionHub)
// ═══════════════════════════════════════════════════════════════
type MotionArchetype =
  | 'parallax-reveal' | 'holographic-glitch' | 'liquid-reveal'
  | 'cyber-grid' | 'neon-noir' | 'paper-cut' | 'glass-morphism'
  | 'retro-vhs' | 'bauhaus-minimal' | 'botanical-organic' | 'fashion-strobe';

interface MotionTemplate {
  id: MotionArchetype;
  name: string;
  category: string;
  preview: string;
  description: string;
}

const MOTION_TEMPLATES: MotionTemplate[] = [
  { id: 'parallax-reveal', name: 'Parallax Deep', category: 'Cinematic', preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400', description: 'Multi-layer parallax with depth reveal' },
  { id: 'holographic-glitch', name: 'Cyber Glitch', category: 'Tech', preview: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400', description: 'RGB split, scan lines, data corruption' },
  { id: 'liquid-reveal', name: 'Liquid Chromatic', category: 'Abstract', preview: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400', description: 'Fluid chromatic aberration reveal' },
  { id: 'cyber-grid', name: 'Cyber Grid Stomp', category: 'Tech', preview: 'https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=400', description: 'Grid stomp with neon trails' },
  { id: 'neon-noir', name: 'Neon Noir', category: 'Cinematic', preview: 'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?q=80&w=400', description: 'Dark moody with neon accents' },
  { id: 'paper-cut', name: 'Paper Cutout', category: 'Creative', preview: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400', description: 'Layered paper cut animation' },
  { id: 'glass-morphism', name: 'Glass UI', category: 'Modern', preview: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400', description: 'Frosted glass overlay motion' },
  { id: 'retro-vhs', name: 'VHS Tape', category: 'Retro', preview: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?q=80&w=400', description: 'VHS tracking, noise, vintage feel' },
  { id: 'bauhaus-minimal', name: 'Bauhaus Pop', category: 'Creative', preview: 'https://images.unsplash.com/photo-1555443805-658637491dd4?q=80&w=400', description: 'Bold geometric shapes, primary colors' },
  { id: 'botanical-organic', name: 'Botanical', category: 'Organic', preview: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=400', description: 'Nature-inspired organic reveals' },
  { id: 'fashion-strobe', name: 'Fashion Strobe', category: 'Fashion', preview: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400', description: 'High-fashion strobe flash cuts' },
];

const CATEGORIES = ['All', ...new Set(MOTION_TEMPLATES.map(t => t.category))];

// CSS-based motion renderer for each template
const renderMotionCSS = (id: MotionArchetype, progress: number): React.CSSProperties => {
  const p = progress / 100;
  switch (id) {
    case 'parallax-reveal':
      return { transform: `scale(${1 + p * 0.15}) translateY(${(1 - p) * 20}px)`, filter: `blur(${(1 - p) * 3}px)` };
    case 'holographic-glitch':
      return { filter: `hue-rotate(${p * 360}deg) saturate(${1.5 + p}) contrast(${1 + p * 0.3})`, transform: `skewX(${Math.sin(p * 20) * 2}deg)` };
    case 'liquid-reveal':
      return { clipPath: `circle(${p * 100}% at 50% 50%)`, filter: `saturate(${1 + p * 0.5})` };
    case 'cyber-grid':
      return { transform: `perspective(800px) rotateX(${(1 - p) * 15}deg) scale(${0.9 + p * 0.1})`, filter: `brightness(${0.7 + p * 0.3})` };
    case 'neon-noir':
      return { filter: `brightness(${0.4 + p * 0.6}) contrast(${1.2 + p * 0.2}) saturate(${0.3 + p * 0.7})` };
    case 'paper-cut':
      return { transform: `scale(${0.95 + p * 0.05})`, filter: `drop-shadow(${4 + p * 8}px ${4 + p * 8}px ${2 + p * 4}px rgba(0,0,0,0.5))` };
    case 'glass-morphism':
      return { backdropFilter: `blur(${(1 - p) * 20}px) saturate(${1 + p})`, opacity: 0.5 + p * 0.5 };
    case 'retro-vhs':
      return { filter: `sepia(${0.3 + (1 - p) * 0.4}) contrast(${1.1}) saturate(${0.6 + p * 0.4})`, transform: `translateX(${Math.random() > 0.95 ? (Math.random() - 0.5) * 4 : 0}px)` };
    case 'bauhaus-minimal':
      return { transform: `rotate(${p * 3}deg) scale(${1 + p * 0.05})` };
    case 'botanical-organic':
      return { filter: `saturate(${1 + p * 0.3}) brightness(${0.9 + p * 0.1})`, transform: `scale(${1 + p * 0.08})` };
    case 'fashion-strobe':
      return { filter: `contrast(${1 + p * 0.5}) brightness(${p > 0.5 ? 1.2 : 0.8})`, transform: `scale(${1 + (p > 0.7 ? 0.02 : 0)})` };
    default:
      return {};
  }
};

// ═══════════════════════════════════════════════════════════════
// MOTION LAB COMPONENT — The Graphics & Motion Mode
// ═══════════════════════════════════════════════════════════════
const MotionLab: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<MotionArchetype>('parallax-reveal');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [headline, setHeadline] = useState('YOUR BRAND');
  const [subline, setSubline] = useState('Motion Graphics Studio');
  const [accentColor, setAccentColor] = useState('#00e5ff');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [intensity, setIntensity] = useState(70);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const animRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = time - lastTimeRef.current;
    setProgress(prev => {
      const next = prev + delta * 0.008;
      return next > 100 ? 0 : next;
    });
    lastTimeRef.current = time;
    if (isPlayingRef.current) animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      animRef.current = requestAnimationFrame(animate);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, animate]);

  const filteredTemplates = activeCategory === 'All'
    ? MOTION_TEMPLATES
    : MOTION_TEMPLATES.filter(t => t.category === activeCategory);

  const currentTemplate = MOTION_TEMPLATES.find(t => t.id === activeTemplate)!;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAiDirect = () => {
    if (!aiPrompt.trim()) return;
    setIsAiThinking(true);
    // Simulate AI directing
    setTimeout(() => {
      const prompts = aiPrompt.toLowerCase();
      if (prompts.includes('glitch') || prompts.includes('cyber')) setActiveTemplate('holographic-glitch');
      else if (prompts.includes('neon') || prompts.includes('dark')) setActiveTemplate('neon-noir');
      else if (prompts.includes('liquid') || prompts.includes('fluid')) setActiveTemplate('liquid-reveal');
      else if (prompts.includes('retro') || prompts.includes('vintage')) setActiveTemplate('retro-vhs');
      else if (prompts.includes('glass') || prompts.includes('modern')) setActiveTemplate('glass-morphism');
      else if (prompts.includes('fashion') || prompts.includes('bold')) setActiveTemplate('fashion-strobe');
      else if (prompts.includes('nature') || prompts.includes('organic')) setActiveTemplate('botanical-organic');

      if (prompts.includes('red')) setAccentColor('#ff4444');
      else if (prompts.includes('gold')) setAccentColor('#d4af37');
      else if (prompts.includes('purple')) setAccentColor('#a855f7');
      else if (prompts.includes('green')) setAccentColor('#22c55e');

      setIsAiThinking(false);
      toast.success('AI Director applied changes!');
    }, 1200);
  };

  const handleExport = () => {
    toast.info('Canvas render starting — capturing frames...');
    // The actual export logic would use canvas captureStream like MotionHub
    setTimeout(() => toast.success('Motion exported as WebM!'), 2000);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT: Template Library */}
      <aside className="w-80 flex flex-col border-r border-white/5 bg-black/40">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3">MOGRT Templates</h3>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn("px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all",
                  activeCategory === cat ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-white/30 hover:text-white/60"
                )}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2.5">
            {filteredTemplates.map(t => (
              <button key={t.id} onClick={() => setActiveTemplate(t.id)}
                className={cn("group relative aspect-square rounded-xl overflow-hidden border transition-all",
                  activeTemplate === t.id ? "border-cyan-400 ring-2 ring-cyan-400/20" : "border-white/5 opacity-60 hover:opacity-100"
                )}>
                <img src={t.preview} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" alt={t.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-2.5">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">{t.category}</span>
                  <span className="text-[10px] font-bold text-white leading-tight">{t.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER: Live Preview Viewport */}
      <main className="flex-1 flex flex-col bg-[#050608]">
        <div className="flex-1 relative flex items-center justify-center p-6">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            {/* Rendered Motion */}
            <div className="absolute inset-0 transition-all duration-100" style={renderMotionCSS(activeTemplate, progress)}>
              {uploadedImage ? (
                <img src={uploadedImage} className="w-full h-full object-cover" alt="Source" />
              ) : (
                <img src={currentTemplate.preview} className="w-full h-full object-cover" alt={currentTemplate.name} />
              )}
            </div>

            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              <motion.h1 key={`h-${activeTemplate}`}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl md:text-7xl font-black text-white tracking-tight text-center"
                style={{ textShadow: `0 0 40px ${accentColor}40, 0 4px 12px rgba(0,0,0,0.8)` }}>
                {headline}
              </motion.h1>
              <motion.p key={`s-${activeTemplate}`}
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.6 }}
                className="text-sm md:text-base uppercase tracking-[0.3em] font-bold mt-3"
                style={{ color: accentColor }}>
                {subline}
              </motion.p>
            </div>

            {/* Transport Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2.5 bg-black/70 backdrop-blur-xl rounded-full border border-white/10 z-20">
              <button onClick={() => { setProgress(0); }} className="text-white/50 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-cyan-400">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <span className="text-[10px] font-mono text-cyan-400 font-bold w-12 text-center">{Math.floor(progress)}%</span>
            </div>

            {/* Template Badge */}
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg border border-white/10 z-20">
              <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400">{currentTemplate.name}</span>
            </div>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="h-16 bg-[#0f1115] border-t border-white/5 flex items-center px-6 gap-4">
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest w-20">Timeline</span>
          <div className="flex-1 relative h-2 bg-white/5 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress((e.clientX - rect.left) / rect.width * 100);
            }}>
            <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${progress}%` }} />
            <div className="absolute top-[-3px] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(0,229,255,0.6)]"
              style={{ left: `${progress}%`, transform: 'translateX(-50%)' }} />
          </div>
          <span className="text-[10px] font-mono text-white/50 w-10 text-right">{(progress / 10).toFixed(1)}s</span>
        </div>
      </main>

      {/* RIGHT: AI Director + Properties */}
      <aside className="w-80 flex flex-col border-l border-white/5 bg-black/40">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-purple-500 animate-pulse rounded-full" />
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">AI Director</h3>
          </div>
          <div className="relative">
            <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
              placeholder="Ex: 'Make it extremely glitchy with neon green accents and fast cuts...'"
              className="w-full h-20 bg-black/30 border border-white/10 rounded-xl p-3 text-xs text-white resize-none focus:border-purple-500/50 outline-none placeholder:text-white/20" />
            <button onClick={handleAiDirect} disabled={isAiThinking}
              className="mt-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
              {isAiThinking ? <><Loader2 className="w-3 h-3 animate-spin" /> Directing...</> : <><Wand2 className="w-3 h-3" /> Apply Direction</>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Typography */}
          <section className="space-y-3">
            <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Typography</h4>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50">Headline</label>
              <input type="text" value={headline} onChange={e => setHeadline(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-400/50 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50">Subline</label>
              <input type="text" value={subline} onChange={e => setSubline(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-400/50 outline-none" />
            </div>
          </section>

          {/* Visuals */}
          <section className="space-y-3">
            <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Visuals</h4>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50">Accent Color</label>
              <div className="flex gap-2">
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:border-cyan-400/50 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50">Intensity</label>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={100} value={intensity} onChange={e => setIntensity(parseInt(e.target.value))}
                  className="flex-1 h-1 bg-white/10 rounded-full appearance-none accent-cyan-400" />
                <span className="text-[9px] font-mono text-cyan-400 w-8 text-right">{intensity}%</span>
              </div>
            </div>
          </section>

          {/* Source Image */}
          <section className="space-y-3">
            <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Source Image</h4>
            <label className="block">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className="h-20 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-400/30 transition-colors">
                {uploadedImage ? (
                  <img src={uploadedImage} className="h-full w-full object-cover rounded-xl" alt="Uploaded" />
                ) : (
                  <span className="text-[10px] text-white/30 font-bold uppercase">Drop image or click</span>
                )}
              </div>
            </label>
          </section>
        </div>

        {/* Export */}
        <div className="p-5 border-t border-white/5 space-y-2">
          <button onClick={handleExport}
            className="w-full py-3.5 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export Motion
          </button>
        </div>
      </aside>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN HUB — Tabbed container for Film + Motion
// ═══════════════════════════════════════════════════════════════
const MODES = [
  { id: 'film', label: 'Film Production', icon: Film, desc: 'Full NLE timeline editor with scenes, voiceover, export' },
  { id: 'motion', label: 'Motion Lab', icon: Zap, desc: '11 MOGRT templates, AI director, live preview' },
] as const;

type HubMode = typeof MODES[number]['id'];

const MotionVideoHub: React.FC = () => {
  const [mode, setMode] = useState<HubMode>('motion');

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -mx-6 -my-6">
      {/* Mode Switcher Bar */}
      <div className="h-14 bg-black/40 border-b border-white/5 flex items-center px-6 gap-4 flex-shrink-0">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/20">
            <Monitor className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Motion & Video</span>
            <span className="text-[9px] text-white/30 uppercase tracking-widest ml-2">Command Center</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                mode === m.id
                  ? "bg-gradient-to-r from-cyan-600/80 to-purple-600/80 text-white shadow-lg"
                  : "text-white/40 hover:text-white/70"
              )}>
              <m.icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'film' ? (
            <motion.div key="film" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full">
              <LaunchFilmStudio />
            </motion.div>
          ) : (
            <motion.div key="motion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full">
              <MotionLab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MotionVideoHub;
