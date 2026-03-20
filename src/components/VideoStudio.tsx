import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play, Pause, SkipBack, Download, Sparkles, Video, Layers, Settings2,
  Eye, EyeOff, Lock, Unlock, ChevronRight, Zap, Film, Monitor, Smartphone,
  Square, RefreshCw, Volume2, VolumeX, Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { VIDEO_TEMPLATES } from '@/lib/videoEngine/templates';
import type { TemplateDefinition, Layer, VideoProject } from '@/lib/videoEngine/types';
import { Animator } from '@/lib/videoEngine/animator';
import { Compositor } from '@/lib/videoEngine/compositor';
import { exportCanvasToVideo, downloadBlob } from '@/lib/videoEngine/exporter';
import { motion, AnimatePresence } from 'framer-motion';

// ——— Canvas dimensions by aspect ratio ———
const CANVAS_DIMS: Record<string, { w: number; h: number }> = {
  '16:9': { w: 1920, h: 1080 },
  '9:16': { w: 1080, h: 1920 },
  '1:1': { w: 1080, h: 1080 },
  '4:3': { w: 1440, h: 1080 },
};

// ——— Category colors ———
const CATEGORY_STYLES: Record<string, string> = {
  corporate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  trendy: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  cinematic: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  social: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  minimal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  celebration: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

function createProject(template: TemplateDefinition): VideoProject {
  const dims = CANVAS_DIMS[template.aspectRatio];
  return {
    id: `proj_${Date.now()}`,
    name: template.name,
    templateId: template.id,
    canvasConfig: {
      width: dims.w,
      height: dims.h,
      fps: 30,
      duration: template.duration,
      backgroundColor: '#000',
    },
    layers: template.layers.map((l, i) => ({ ...l, id: `layer_${i}` })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ——— Mini Thumbnail Canvas (pure CSS animated preview) ———
function TemplateThumbnail({ template, isSelected }: { template: TemplateDefinition; isSelected: boolean }) {
  const [g1, g2] = template.thumbnailGradient;
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${isSelected ? 'border-amber-500 shadow-lg shadow-amber-500/30' : 'border-white/10 hover:border-white/30'
        }`}
    >
      <div
        className="aspect-video flex flex-col items-center justify-center gap-2 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
      >
        {/* Animated shimmer */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', width: '40%' }}
        />
        <span className="text-3xl">{template.thumbnailEmoji ?? '🎬'}</span>
        <span
          className="text-[10px] font-black uppercase tracking-widest text-white/90 text-center px-1"
          style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
        >
          {template.name}
        </span>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
          >
            <ChevronRight className="w-3 h-3 text-black" />
          </motion.div>
        )}
      </div>
      <div className={`px-2 py-1.5 flex items-center justify-between ${isSelected ? 'bg-amber-950/40' : 'bg-black/60'}`}>
        <span className="text-[10px] text-white/70 font-medium">{template.duration}s · {template.aspectRatio}</span>
        <Badge className={`text-[8px] px-1.5 py-0 border ${CATEGORY_STYLES[template.category] ?? ''}`}>
          {template.category}
        </Badge>
      </div>
    </motion.div>
  );
}

// ——— Layer Row in Timeline ———
function LayerRow({ layer, totalDuration, isSelected, onSelect, onToggleVisibility, onToggleLock }: {
  layer: Layer;
  totalDuration: number;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}) {
  const startPct = (layer.startTime / totalDuration) * 100;
  const widthPct = ((layer.endTime - layer.startTime) / totalDuration) * 100;
  const typeColors: Record<string, string> = {
    background: 'bg-slate-600',
    text: 'bg-amber-600',
    shape: 'bg-blue-600',
    particle: 'bg-purple-600',
    overlay: 'bg-green-900',
    image: 'bg-red-700',
  };

  return (
    <div
      className={`flex items-center border-b border-white/5 group cursor-pointer ${isSelected ? 'bg-amber-500/10' : 'hover:bg-white/5'}`}
      onClick={onSelect}
    >
      {/* Layer name row */}
      <div className="w-40 flex-shrink-0 flex items-center gap-1.5 px-2 py-1.5 border-r border-white/10">
        <button onClick={e => { e.stopPropagation(); onToggleVisibility(); }} className="text-white/40 hover:text-white transition-colors">
          {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
        <button onClick={e => { e.stopPropagation(); onToggleLock(); }} className="text-white/40 hover:text-white transition-colors">
          {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>
        <span className="text-[10px] text-white/70 truncate flex-1">{layer.name}</span>
      </div>
      {/* Clip bar */}
      <div className="flex-1 relative h-7 overflow-hidden">
        <div
          className={`absolute top-1 bottom-1 rounded ${typeColors[layer.type] ?? 'bg-slate-500'} opacity-80`}
          style={{ left: `${startPct}%`, width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

// ——— Layer Inspector ———
function LayerInspector({ layer, onChange }: { layer: Layer | null; onChange: (id: string, changes: Partial<Layer>) => void }) {
  if (!layer) return (
    <div className="flex-1 flex items-center justify-center text-white/30 text-sm p-4 text-center">
      <div className="space-y-2">
        <Layers className="w-8 h-8 mx-auto opacity-30" />
        <p>Select a layer to inspect</p>
      </div>
    </div>
  );

  const cfg = layer.config as any;

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-semibold">Transform</p>
          <div className="space-y-2">
            <div>
              <Label className="text-[10px] text-white/50">Opacity</Label>
              <Slider
                min={0} max={1} step={0.01}
                value={[layer.opacity]}
                onValueChange={([v]) => onChange(layer.id, { opacity: v })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-white/50">Scale X</Label>
                <Slider min={0.1} max={3} step={0.01} value={[layer.scaleX]} onValueChange={([v]) => onChange(layer.id, { scaleX: v })} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] text-white/50">Scale Y</Label>
                <Slider min={0.1} max={3} step={0.01} value={[layer.scaleY]} onValueChange={([v]) => onChange(layer.id, { scaleY: v })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] text-white/50">Rotation</Label>
              <Slider min={-180} max={180} step={1} value={[layer.rotation]} onValueChange={([v]) => onChange(layer.id, { rotation: v })} className="mt-1" />
            </div>
          </div>
        </div>

        {layer.type === 'text' && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-semibold">Text</p>
            <div className="space-y-2">
              <div>
                <Label className="text-[10px] text-white/50">Content</Label>
                <Input
                  value={cfg.text ?? ''}
                  onChange={e => onChange(layer.id, { config: { ...cfg, text: e.target.value } })}
                  className="h-8 text-xs mt-1 bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label className="text-[10px] text-white/50">Font Size</Label>
                <Slider min={10} max={200} step={1} value={[cfg.fontSize ?? 48]} onValueChange={([v]) => onChange(layer.id, { config: { ...cfg, fontSize: v } })} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] text-white/50">Color</Label>
                <div className="flex gap-2 mt-1 items-center">
                  <input type="color" value={cfg.fill ?? '#ffffff'} onChange={e => onChange(layer.id, { config: { ...cfg, fill: e.target.value } })} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                  <Input value={cfg.fill ?? '#ffffff'} onChange={e => onChange(layer.id, { config: { ...cfg, fill: e.target.value } })} className="h-8 text-xs flex-1 bg-white/5 border-white/10" />
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-white/50">Glow Radius</Label>
                <Slider min={0} max={80} step={1} value={[cfg.glowRadius ?? 0]} onValueChange={([v]) => onChange(layer.id, { config: { ...cfg, glowRadius: v } })} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] text-white/50">Letter Spacing</Label>
                <Slider min={0} max={30} step={0.5} value={[cfg.letterSpacing ?? 0]} onValueChange={([v]) => onChange(layer.id, { config: { ...cfg, letterSpacing: v } })} className="mt-1" />
              </div>
            </div>
          </div>
        )}

        {layer.type === 'background' && cfg.type === 'solid' && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-semibold">Background</p>
            <div className="flex gap-2 items-center">
              <input type="color" value={cfg.fill ?? '#000000'} onChange={e => onChange(layer.id, { config: { ...cfg, fill: e.target.value } })} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
              <Input value={cfg.fill ?? '#000000'} onChange={e => onChange(layer.id, { config: { ...cfg, fill: e.target.value } })} className="h-8 text-xs flex-1 bg-white/5 border-white/10" />
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-semibold">Timing</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-white/50">In (s)</Label>
              <Input type="number" step={0.1} value={layer.startTime} onChange={e => onChange(layer.id, { startTime: parseFloat(e.target.value) })} className="h-8 text-xs mt-1 bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-[10px] text-white/50">Out (s)</Label>
              <Input type="number" step={0.1} value={layer.endTime} onChange={e => onChange(layer.id, { endTime: parseFloat(e.target.value) })} className="h-8 text-xs mt-1 bg-white/5 border-white/10" />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

// ——— Main VideoStudio Component ———
interface VideoStudioProps {
  onNavigateBack?: () => void;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ onNavigateBack }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(VIDEO_TEMPLATES[0]);
  const [project, setProject] = useState<VideoProject>(() => createProject(VIDEO_TEMPLATES[0]));
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimeline, setShowTimeline] = useState(true);

  const animatorRef = useRef<Animator | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compositorRef = useRef<Compositor | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // ——— Initialize engine ———
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dims = CANVAS_DIMS[selectedTemplate.aspectRatio];
    canvas.width = dims.w;
    canvas.height = dims.h;

    const compositor = new Compositor(canvas);
    compositorRef.current = compositor;

    const animator = new Animator(
      (animatedLayers, time) => {
        compositor.render(animatedLayers, time);
        setCurrentTime(time);
      },
      (state) => {
        if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying);
      }
    );
    animatorRef.current = animator;
    animator.load(project.layers, project.canvasConfig.duration);

    return () => animator.destroy();
  }, []);

  // ——— Reload when project layers change ———
  useEffect(() => {
    if (!animatorRef.current) return;
    animatorRef.current.load(project.layers, project.canvasConfig.duration);
  }, [project.layers, project.canvasConfig.duration]);

  const handleTemplateSelect = (template: TemplateDefinition) => {
    setSelectedTemplate(template);
    const newProject = createProject(template);
    setProject(newProject);
    setSelectedLayerId(null);
    setCurrentTime(0);
    animatorRef.current?.seek(0);
    if (isPlaying) { animatorRef.current?.pause(); setIsPlaying(false); }
  };

  const handlePlayPause = () => {
    if (!animatorRef.current) return;
    if (isPlaying) { animatorRef.current.pause(); setIsPlaying(false); }
    else { animatorRef.current.play(); setIsPlaying(true); }
  };

  const handleSeekToStart = () => {
    animatorRef.current?.seek(0);
    setCurrentTime(0);
  };

  const handleScrub = (pct: number) => {
    const t = pct * project.canvasConfig.duration;
    animatorRef.current?.seek(t);
  };

  const handleLayerChange = (id: string, changes: Partial<Layer>) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...changes } : l),
    }));
  };

  const handleToggleVisibility = (id: string) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l),
    }));
  };

  const handleToggleLock = (id: string) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l),
    }));
  };

  const handleExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportProgress(0);
    animatorRef.current?.seek(0);
    await new Promise(r => setTimeout(r, 200));
    animatorRef.current?.play();
    try {
      const blob = await exportCanvasToVideo(canvas, project.canvasConfig.duration, {
        fps: 30,
        onProgress: setExportProgress,
      });
      animatorRef.current?.pause();
      downloadBlob(blob, `${project.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.webm`);
      toast({ title: '🎬 Export Complete!', description: 'Your video is downloaded and ready.' });
    } catch (err) {
      toast({ title: 'Export Failed', description: String(err), variant: 'destructive' });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const selectedLayer = project.layers.find(l => l.id === selectedLayerId) ?? null;
  const filteredTemplates = VIDEO_TEMPLATES.filter(t =>
    (categoryFilter === 'all' || t.category === categoryFilter) &&
    (searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.tags.some(tag => tag.includes(searchQuery.toLowerCase())))
  );

  const dims = CANVAS_DIMS[selectedTemplate.aspectRatio];
  const isPortrait = selectedTemplate.aspectRatio === '9:16';

  const formatTime = (t: number) => `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toFixed(1).padStart(4, '0')}`;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* ——— Header ——— */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0d0d14]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold tracking-wider uppercase">Motion Studio Pro</span>
          </div>
          <span className="text-white/30 text-xs">GPU-Accelerated · 60fps · Real Export</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-white/20 text-white/70 hover:bg-white/10"
            onClick={() => setShowTimeline(v => !v)}
          >
            <Clock className="w-3 h-3 mr-1" />
            Timeline
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />{Math.round(exportProgress * 100)}%</>
            ) : (
              <><Download className="w-3 h-3 mr-1" />Export Video</>
            )}
          </Button>
        </div>
      </div>

      {/* ——— Main NLE Panels ——— */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">

          {/* LEFT: Template Gallery */}
          <ResizablePanel defaultSize={22} minSize={16} maxSize={32} className="flex flex-col bg-[#0d0d14] border-r border-white/10">
            <div className="flex-shrink-0 p-3 border-b border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Templates</p>
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-7 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
              <div className="flex gap-1 mt-2 flex-wrap">
                {['all', 'corporate', 'cinematic', 'social', 'trendy', 'minimal'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${categoryFilter === cat
                        ? 'bg-amber-500 border-amber-500 text-black font-bold'
                        : `border-white/20 text-white/50 hover:text-white/80 ${CATEGORY_STYLES[cat] ?? ''}`
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 grid grid-cols-1 gap-2">
                {filteredTemplates.map(template => (
                  <div key={template.id} onClick={() => handleTemplateSelect(template)}>
                    <TemplateThumbnail template={template} isSelected={template.id === selectedTemplate.id} />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle className="bg-white/10 hover:bg-amber-500/50 transition-colors w-px" />

          {/* CENTER: Canvas Preview */}
          <ResizablePanel defaultSize={54} minSize={30} className="flex flex-col bg-[#070710]">
            {/* Canvas area */}
            <div ref={canvasContainerRef} className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
              {/* Canvas */}
              <div
                className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/80"
                style={{ maxWidth: isPortrait ? '40%' : '100%', maxHeight: '100%', aspectRatio: isPortrait ? '9/16' : '16/9' }}
              >
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
                {/* Overlay badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[9px] text-white/50 font-mono">
                  {dims.w}×{dims.h} · {selectedTemplate.aspectRatio}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex-shrink-0 border-t border-white/10 bg-[#0d0d14]">
              <div className="flex items-center gap-3 px-4 py-2">
                <button
                  onClick={handleSeekToStart}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlayPause}
                  className="w-9 h-9 flex items-center justify-center bg-amber-500 hover:bg-amber-400 rounded-full transition-colors shadow-lg shadow-amber-500/30"
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black ml-0.5" />}
                </motion.button>

                {/* Scrubber */}
                <div className="flex-1 relative group cursor-pointer" onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleScrub((e.clientX - rect.left) / rect.width);
                }}>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      style={{ width: `${(currentTime / project.canvasConfig.duration) * 100}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${(currentTime / project.canvasConfig.duration) * 100}%` }}
                  />
                </div>

                <span className="text-[11px] font-mono text-white/50 whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(project.canvasConfig.duration)}
                </span>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-white/10 hover:bg-amber-500/50 transition-colors w-px" />

          {/* RIGHT: Layer Inspector */}
          <ResizablePanel defaultSize={24} minSize={18} maxSize={32} className="flex flex-col bg-[#0d0d14] border-l border-white/10">
            <div className="flex-shrink-0 px-3 py-2 border-b border-white/10 flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Inspector</p>
            </div>
            <LayerInspector layer={selectedLayer} onChange={handleLayerChange} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* ——— Timeline ——— */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-shrink-0 border-t border-white/10 bg-[#0a0a10] overflow-hidden"
          >
            {/* Ruler */}
            <div className="flex border-b border-white/10">
              <div className="w-40 flex-shrink-0 px-2 py-0.5 border-r border-white/10">
                <span className="text-[9px] text-white/30 font-mono">LAYERS</span>
              </div>
              <div className="flex-1 relative h-5">
                {Array.from({ length: Math.ceil(project.canvasConfig.duration) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full flex flex-col justify-end pb-0.5"
                    style={{ left: `${(i / project.canvasConfig.duration) * 100}%` }}
                  >
                    <div className="w-px h-2 bg-white/20" />
                    <span className="text-[8px] text-white/30 font-mono ml-0.5">{i}s</span>
                  </div>
                ))}
                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-amber-500 z-10"
                  style={{ left: `${(currentTime / project.canvasConfig.duration) * 100}%` }}
                />
              </div>
            </div>
            {/* Layer rows */}
            <div className="max-h-36 overflow-y-auto">
              {project.layers.map(layer => (
                <LayerRow
                  key={layer.id}
                  layer={layer}
                  totalDuration={project.canvasConfig.duration}
                  isSelected={layer.id === selectedLayerId}
                  onSelect={() => setSelectedLayerId(layer.id === selectedLayerId ? null : layer.id)}
                  onToggleVisibility={() => handleToggleVisibility(layer.id)}
                  onToggleLock={() => handleToggleLock(layer.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoStudio;