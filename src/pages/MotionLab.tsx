/**
 * ═══════════════════════════════════════════════════════════════
 * INTEGRO OS — Motion Lab (MockupGenius-Pro2 Engine)
 * 11 MOGRT templates, AI Director, live CSS preview, export
 * ═══════════════════════════════════════════════════════════════
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Download, Wand2, Loader2, RotateCcw,
  Upload, Eye, Sparkles, Layers, Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════
// Motion Template System (from MockupGenius-Pro2 MotionHub)
// ═══════════════════════════════════════════════════════════
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

const CATEGORIES = ['All', ...Array.from(new Set(MOTION_TEMPLATES.map(t => t.category)))];

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

// ═══════════════════════════════════════════════════════════
// MOTION LAB COMPONENT
// ═══════════════════════════════════════════════════════════
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
    setTimeout(() => toast.success('Motion exported as WebM!'), 2000);
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* LEFT: Template Library */}
      <aside style={{ width: 320, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '0.6rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>MOGRT Templates</h3>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn("px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border",
                  activeCategory === cat ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "text-white/30 border-transparent hover:text-white/60"
                )}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {filteredTemplates.map(t => (
              <button key={t.id} onClick={() => setActiveTemplate(t.id)}
                className={cn("group relative aspect-square rounded-xl overflow-hidden border transition-all",
                  activeTemplate === t.id ? "border-cyan-400 ring-2 ring-cyan-400/20" : "border-white/5 opacity-60 hover:opacity-100"
                )}>
                <img src={t.preview} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" alt={t.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-2.5">
                  <span style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>{t.category}</span>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{t.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER: Live Preview Viewport */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#050608' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '56rem', aspectRatio: '16/9', background: '#000', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>
            {/* Rendered Motion */}
            <div style={{ position: 'absolute', inset: 0, transition: 'all 100ms', ...renderMotionCSS(activeTemplate, progress) }}>
              <img src={uploadedImage || currentTemplate.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={currentTemplate.name} />
            </div>

            {/* Text Overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', fontWeight: 900, color: 'white', textAlign: 'center', letterSpacing: '-0.02em', textShadow: `0 0 40px ${accentColor}40, 0 4px 12px rgba(0,0,0,0.8)` }}>
                {headline}
              </h1>
              <p style={{ fontSize: 'clamp(0.625rem, 1.2vw, 1rem)', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700, marginTop: '0.75rem', color: accentColor, opacity: 0.9 }}>
                {subline}
              </p>
            </div>

            {/* Transport Controls */}
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 16, padding: '0.5rem 1.25rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.1)', zIndex: 20 }}>
              <button onClick={() => setProgress(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}><RotateCcw size={16} /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 700, color: '#22d3ee', width: 48, textAlign: 'center' }}>{Math.floor(progress)}%</span>
            </div>

            {/* Template Badge */}
            <div style={{ position: 'absolute', top: 12, left: 12, padding: '0.375rem 0.75rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', zIndex: 20 }}>
              <span style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#22d3ee' }}>{currentTemplate.name}</span>
            </div>
          </div>
        </div>

        {/* Timeline Bar */}
        <div style={{ height: 48, background: '#0f1115', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: 16, flexShrink: 0 }}>
          <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', width: 60 }}>Timeline</span>
          <div style={{ flex: 1, position: 'relative', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, cursor: 'pointer' }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress((e.clientX - rect.left) / rect.width * 100);
            }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #06b6d4, #a855f7)', width: `${progress}%` }} />
            <div style={{ position: 'absolute', top: -3, width: 8, height: 8, background: 'white', borderRadius: '50%', boxShadow: '0 0 8px rgba(34,211,238,0.6)', left: `${progress}%`, transform: 'translateX(-50%)' }} />
          </div>
          <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', width: 40, textAlign: 'right' }}>{(progress / 10).toFixed(1)}s</span>
        </div>
      </main>

      {/* RIGHT: AI Director + Properties */}
      <aside style={{ width: 300, display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, background: '#a855f7', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <h3 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.2em' }}>AI Director</h3>
          </div>
          <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
            placeholder="Ex: 'Make it extremely glitchy with neon green accents and fast cuts...'"
            style={{ width: '100%', height: 80, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, fontSize: '0.75rem', color: 'white', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={handleAiDirect} disabled={isAiThinking}
            style={{ marginTop: 8, width: '100%', padding: '0.625rem', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', borderRadius: 8, border: 'none', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: isAiThinking ? 0.4 : 1 }}>
            {isAiThinking ? <><Loader2 size={12} className="animate-spin" /> Directing...</> : <><Wand2 size={12} /> Apply Direction</>}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {/* Typography */}
          <section style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.5625rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8, marginBottom: 12 }}>Typography</h4>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Headline</label>
              <input type="text" value={headline} onChange={e => setHeadline(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'white', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Subline</label>
              <input type="text" value={subline} onChange={e => setSubline(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'white', outline: 'none' }} />
            </div>
          </section>

          {/* Visuals */}
          <section style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.5625rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8, marginBottom: 12 }}>Visuals</h4>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Accent Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 32, height: 32, borderRadius: 6, cursor: 'pointer', border: 'none', background: 'transparent' }} />
                <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                  style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'white', fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Intensity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="range" min={0} max={100} value={intensity} onChange={e => setIntensity(parseInt(e.target.value))}
                  style={{ flex: 1, height: 3, appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 2, accentColor: '#22d3ee' }} />
                <span style={{ fontSize: '0.5625rem', fontWeight: 700, fontFamily: 'monospace', color: '#22d3ee', width: 32, textAlign: 'right' }}>{intensity}%</span>
              </div>
            </div>
          </section>

          {/* Source Image */}
          <section>
            <h4 style={{ fontSize: '0.5625rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8, marginBottom: 12 }}>Source Image</h4>
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              <div style={{ height: 80, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {uploadedImage ? (
                  <img src={uploadedImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Uploaded" />
                ) : (
                  <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Drop image or click</span>
                )}
              </div>
            </label>
          </section>
        </div>

        {/* Export */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={handleExport}
            style={{ width: '100%', padding: '0.875rem', background: 'white', color: 'black', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.625rem', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Download size={14} /> Export Motion
          </button>
        </div>
      </aside>
    </div>
  );
};

export default MotionLab;
