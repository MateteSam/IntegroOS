/**
 * DesignCanvas.tsx - Lovart-Inspired Premium Editor (v3.0)
 * Fixed: Robust image loading with CORS/data URL support.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Type, Image as ImageIcon, Square, Circle, Download, Undo2, Redo2, Trash2,
    X, Wand2, Palette, RefreshCw, Sparkles, Layers, Loader2,
    ChevronUp, ChevronDown, ArrowUpToLine, ArrowDownToLine,
    SlidersHorizontal, Sun, Contrast, Droplets, Type as TypeIcon,
    AlignLeft, AlignCenter, AlignRight, Pipette,
    ScanLine, Maximize, Focus, LayoutDashboard, MousePointer2
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DesignCanvasProps {
    initialImageUrl?: string;
    textOverlay?: string;
    style?: {
        fontFamily?: string;
        fontSize?: string;
        color?: string;
        position?: 'top' | 'middle' | 'bottom';
    };
    width?: number;
    height?: number;
    onClose?: () => void;
    onSave?: (dataUrl: string) => void;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
    initialImageUrl,
    textOverlay,
    style,
    width = 800,
    height = 800,
    onClose,
    onSave
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [layerCount, setLayerCount] = useState(0);
    const [backgroundObject, setBackgroundObject] = useState<fabric.FabricImage | null>(null);

    // Advanced Property State
    const [filters, setFilters] = useState({
        brightness: 0,
        contrast: 0,
        blur: 0,
        saturation: 0
    });

    // Robust image loading function
    const loadImageToCanvas = async (canvas: fabric.Canvas, imageUrl: string) => {
        return new Promise<void>((resolve, reject) => {
            const imgElement = new Image();
            imgElement.crossOrigin = 'anonymous';

            imgElement.onload = () => {
                const fabricImg = new fabric.FabricImage(imgElement, {
                    selectable: false,
                    evented: false,
                    left: 0,
                    top: 0
                });

                const scale = Math.min(width / imgElement.width, height / imgElement.height);
                fabricImg.scale(scale);

                // Center the image
                fabricImg.set({
                    left: (width - imgElement.width * scale) / 2,
                    top: (height - imgElement.height * scale) / 2
                });

                canvas.add(fabricImg);
                canvas.sendObjectToBack(fabricImg);
                setBackgroundObject(fabricImg);
                canvas.renderAll();
                setLayerCount(canvas.getObjects().length);
                resolve();
            };

            imgElement.onerror = (err) => {
                console.error('Image load failed:', err);
                reject(new Error('Failed to load image'));
            };

            imgElement.src = imageUrl;
        });
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        setIsLoading(true);

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: width || 800,
            height: height || 800,
            backgroundColor: '#000000',
            preserveObjectStacking: true
        });

        fabricRef.current = canvas;

        const initCanvas = async () => {
            if (initialImageUrl) {
                try {
                    await loadImageToCanvas(canvas, initialImageUrl);
                    toast.success('Image loaded into canvas');

                    // Hybrid Logic: Add the editable text on top of the AI foundation
                    if (textOverlay) {
                        const text = new fabric.IText(textOverlay, {
                            left: width / 2,
                            top: style?.position === 'top' ? 100 : style?.position === 'bottom' ? height - 100 : height / 2,
                            fontSize: parseInt(style?.fontSize || '60'),
                            fontFamily: style?.fontFamily?.replace(/'/g, "") || 'Playfair Display',
                            fill: style?.color || '#D4AF37',
                            originX: 'center',
                            originY: 'center',
                            fontWeight: '800',
                            charSpacing: 100,
                            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 20, offsetX: 5, offsetY: 5 })
                        });
                        canvas.add(text);
                        canvas.setActiveObject(text);
                    }
                } catch (e) {
                    toast.error('Failed to load image - using blank canvas');
                    console.error('Canvas image load error:', e);
                }
            }
            saveToHistory();
            setIsLoading(false);
        };

        initCanvas();

        canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
        canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
        canvas.on('selection:cleared', () => setSelectedObject(null));
        canvas.on('object:modified', () => { saveToHistory(); setLayerCount(canvas.getObjects().length); });
        canvas.on('object:added', () => setLayerCount(canvas.getObjects().length));
        canvas.on('object:removed', () => setLayerCount(canvas.getObjects().length));

        return () => { canvas.dispose(); };
    }, [initialImageUrl, width, height]);

    const saveToHistory = () => {
        if (!fabricRef.current) return;
        const json = JSON.stringify(fabricRef.current.toJSON());
        setHistory(prev => [...prev.slice(0, historyIndex + 1), json]);
        setHistoryIndex(prev => prev + 1);
    };

    const undo = () => {
        if (historyIndex <= 0 || !fabricRef.current) return;
        const newIndex = historyIndex - 1;
        fabricRef.current.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
            fabricRef.current?.renderAll();
            setHistoryIndex(newIndex);
            setLayerCount(fabricRef.current?.getObjects().length || 0);
        });
    };

    const redo = () => {
        if (historyIndex >= history.length - 1 || !fabricRef.current) return;
        const newIndex = historyIndex + 1;
        fabricRef.current.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
            fabricRef.current?.renderAll();
            setHistoryIndex(newIndex);
            setLayerCount(fabricRef.current?.getObjects().length || 0);
        });
    };

    const addText = () => {
        if (!fabricRef.current) return;
        const text = new fabric.IText('Your Text', {
            left: width / 2 - 100,
            top: height / 2 - 30,
            fontSize: 48,
            fontFamily: 'Inter',
            fill: '#FFFFFF',
            editable: true,
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.6)', blur: 8, offsetX: 2, offsetY: 2 })
        });
        fabricRef.current.add(text);
        fabricRef.current.setActiveObject(text);
        saveToHistory();
    };

    const addShape = (type: 'rect' | 'circle') => {
        if (!fabricRef.current) return;
        let shape: fabric.Object;
        if (type === 'rect') {
            shape = new fabric.Rect({ left: width / 2 - 60, top: height / 2 - 40, width: 120, height: 80, fill: '#D4AF37', rx: 8, ry: 8 });
        } else {
            shape = new fabric.Circle({ left: width / 2 - 40, top: height / 2 - 40, radius: 40, fill: '#1E293B', stroke: '#D4AF37', strokeWidth: 2 });
        }
        fabricRef.current.add(shape);
        fabricRef.current.setActiveObject(shape);
        saveToHistory();
    };

    const moveObject = (direction: 'forward' | 'backward' | 'front' | 'back') => {
        if (!fabricRef.current || !selectedObject) return;
        switch (direction) {
            case 'forward': fabricRef.current.bringObjectForward(selectedObject); break;
            case 'backward': fabricRef.current.sendObjectBackwards(selectedObject); break;
            case 'front': fabricRef.current.bringObjectToFront(selectedObject); break;
            case 'back': fabricRef.current.sendObjectToBack(selectedObject); break;
        }
        fabricRef.current.renderAll();
        saveToHistory();
    };

    const applyFilter = (filterType: keyof typeof filters, value: number) => {
        if (!backgroundObject || !fabricRef.current) return;

        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);

        // Map UI values to Fabric filters
        // Note: In Fabric 6.x, filters are differently handled but we use standard ones
        const f = fabric.filters;
        const activeFilters: any[] = [];

        if (newFilters.brightness !== 0) activeFilters.push(new f.Brightness({ brightness: newFilters.brightness / 100 }));
        if (newFilters.contrast !== 0) activeFilters.push(new f.Contrast({ contrast: newFilters.contrast / 100 }));
        if (newFilters.blur !== 0) activeFilters.push(new f.Blur({ blur: newFilters.blur / 100 }));
        if (newFilters.saturation !== 0) activeFilters.push(new f.Saturation({ saturation: newFilters.saturation / 100 }));

        backgroundObject.filters = activeFilters;
        backgroundObject.applyFilters();
        fabricRef.current.renderAll();
    };

    const updateObjectProperty = (prop: string, value: any) => {
        if (!selectedObject || !fabricRef.current) return;
        selectedObject.set(prop as any, value);
        fabricRef.current.renderAll();
        saveToHistory();
    };

    const magicAlign = (type: 'center' | 'thirds' | 'golden' | 'top-left' | 'bottom-right') => {
        if (!selectedObject || !fabricRef.current) return;

        const padding = 40;
        switch (type) {
            case 'center':
                selectedObject.set({ left: width / 2, top: height / 2, originX: 'center', originY: 'center' });
                break;
            case 'top-left':
                selectedObject.set({ left: padding, top: padding, originX: 'left', originY: 'top' });
                break;
            case 'bottom-right':
                selectedObject.set({ left: width - padding, top: height - padding, originX: 'right', originY: 'bottom' });
                break;
            case 'thirds':
                selectedObject.set({ left: width * (2 / 3), top: height / 2, originX: 'center', originY: 'center' });
                break;
            case 'golden':
                selectedObject.set({ left: width * 0.618, top: height * 0.382, originX: 'center', originY: 'center' });
                break;
        }
        fabricRef.current.renderAll();
        saveToHistory();
    };

    const autoFitText = () => {
        if (!selectedObject || selectedObject.type !== 'i-text' || !fabricRef.current) return;
        const textObj = selectedObject as fabric.IText;
        const targetWidth = width * 0.8;
        if ((textObj.width || 0) > targetWidth) {
            const scale = targetWidth / (textObj.width || 1);
            textObj.set({ fontSize: (textObj.fontSize || 48) * scale });
            fabricRef.current.renderAll();
            saveToHistory();
            toast.success('Text scaled to fit canvas');
        }
    };

    const applyTextEffect = (effect: 'glow' | 'stroke' | 'neon') => {
        if (!selectedObject || selectedObject.type !== 'i-text' || !fabricRef.current) return;

        switch (effect) {
            case 'glow':
                selectedObject.set('shadow', new fabric.Shadow({
                    color: (selectedObject as any).fill || '#FFFFFF',
                    blur: 30,
                    offsetX: 0,
                    offsetY: 0
                }));
                break;
            case 'stroke':
                selectedObject.set({
                    stroke: (selectedObject as any).fill || '#FFFFFF',
                    strokeWidth: 2,
                    fill: 'transparent'
                });
                break;
            case 'neon':
                selectedObject.set({
                    stroke: '#00F3FF',
                    strokeWidth: 1,
                    shadow: new fabric.Shadow({ color: '#00F3FF', blur: 15 })
                });
                break;
        }
        fabricRef.current.renderAll();
        saveToHistory();
    };

    const applyGradient = () => {
        if (!selectedObject || !fabricRef.current) return;
        const grad = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: (selectedObject.width || 200), y2: 0 },
            colorStops: [
                { offset: 0, color: '#D4AF37' }, // Gold
                { offset: 0.5, color: '#FFFACD' }, // Shine
                { offset: 1, color: '#D4AF37' }  // Gold
            ]
        });
        selectedObject.set('fill', grad);
        fabricRef.current.renderAll();
        saveToHistory();
    };

    const deleteSelected = () => {
        if (!fabricRef.current || !selectedObject) return;
        fabricRef.current.remove(selectedObject);
        setSelectedObject(null);
        saveToHistory();
    };

    const exportPNG = () => {
        if (!fabricRef.current) return;
        const dataUrl = fabricRef.current.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
        const link = document.createElement('a');
        link.download = 'integro-design.png';
        link.href = dataUrl;
        link.click();
        toast.success('Exported as high-res PNG');
        onSave?.(dataUrl);
    };

    const exportPDF = () => {
        if (!fabricRef.current) return;
        const dataUrl = fabricRef.current.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
        const pdf = new jsPDF({ orientation: width > height ? 'landscape' : 'portrait', unit: 'px', format: [width, height] });
        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
        pdf.save('integro-design.pdf');
        toast.success('Exported as PDF');
    };

    const handleAIAction = async (action: 'enhance' | 'recolor' | 'regenerate') => {
        setIsProcessing(true);
        toast.info(`AI ${action} in progress...`);
        // Placeholder - would connect to Gemini API
        setTimeout(() => {
            setIsProcessing(false);
            toast.success(`${action} complete!`);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#050508] flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="h-14 bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-white font-semibold text-sm">Integro Design Studio</span>
                </div>
                <div className="flex-1 max-w-xl mx-6">
                    <div className="relative">
                        <Input
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Describe changes... (AI-powered)"
                            className="w-full h-9 bg-white/5 border-white/10 rounded-full px-4 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50"
                        />
                        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                            <Wand2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white rounded-full w-8 h-8">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                {/* Left Toolbar */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 p-2 rounded-xl bg-[#1E293B]/80 backdrop-blur border border-white/10">
                    <ToolButton icon={<Type className="w-4 h-4" />} label="Text" onClick={addText} />
                    <ToolButton icon={<Square className="w-4 h-4" />} label="Rectangle" onClick={() => addShape('rect')} />
                    <ToolButton icon={<Circle className="w-4 h-4" />} label="Circle" onClick={() => addShape('circle')} />
                    <div className="h-px bg-white/10 my-1" />
                    <ToolButton icon={<Undo2 className="w-4 h-4" />} label="Undo" onClick={undo} disabled={historyIndex <= 0} />
                    <ToolButton icon={<Redo2 className="w-4 h-4" />} label="Redo" onClick={redo} disabled={historyIndex >= history.length - 1} />
                    {selectedObject && (
                        <>
                            <div className="h-px bg-white/10 my-1" />
                            <ToolButton icon={<Trash2 className="w-4 h-4" />} label="Delete" onClick={deleteSelected} variant="danger" />
                        </>
                    )}
                </div>

                {/* Canvas Container */}
                <div className="relative group">
                    <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative rounded-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/5 bg-[#0A0A0F]">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F] z-10">
                                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                            </div>
                        )}
                        <canvas ref={canvasRef} />

                        {/* Contextual Property Panel (Floating) */}
                        {selectedObject && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1E293B]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 z-30">
                                <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
                                    <ToolButton icon={<ChevronUp className="w-3.5 h-3.5" />} label="Forward" onClick={() => moveObject('forward')} />
                                    <ToolButton icon={<ChevronDown className="w-3.5 h-3.5" />} label="Backward" onClick={() => moveObject('backward')} />
                                    <ToolButton icon={<ArrowUpToLine className="w-3.5 h-3.5" />} label="Front" onClick={() => moveObject('front')} />
                                    <ToolButton icon={<ArrowDownToLine className="w-3.5 h-3.5" />} label="Back" onClick={() => moveObject('back')} />
                                </div>

                                {selectedObject.type === 'i-text' && (
                                    <div className="flex items-center gap-3 px-2">
                                        {/* Layout Intelligence */}
                                        <div className="flex items-center gap-1 pr-2 border-r border-white/10">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Magic Align</span>
                                                <div className="flex gap-1">
                                                    <ToolButton icon={<Focus className="w-3 h-3" />} label="Center" onClick={() => magicAlign('center')} />
                                                    <ToolButton icon={<Maximize className="w-3 h-3" />} label="Auto-Fit" onClick={autoFitText} />
                                                    <ToolButton icon={<LayoutDashboard className="w-3 h-3" />} label="Rule of Thirds" onClick={() => magicAlign('top-left')} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Text Visual Effects */}
                                        <div className="flex flex-col gap-1 pr-2 border-r border-white/10">
                                            <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">FX</span>
                                            <div className="flex gap-1">
                                                <ToolButton icon={<Sparkles className="w-3 h-3 text-amber-400" />} label="Premium Glow" onClick={() => applyTextEffect('glow')} />
                                                <ToolButton icon={<Palette className="w-3 h-3 text-blue-400" />} label="Gold Gradient" onClick={applyGradient} />
                                                <ToolButton icon={<MousePointer2 className="w-3 h-3" />} label="Stroke Only" onClick={() => applyTextEffect('stroke')} />
                                            </div>
                                        </div>

                                        {/* Font Family Selector */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Font</span>
                                            <select
                                                className="bg-accent/5 border border-white/10 rounded-lg text-[10px] text-white px-2 py-1 outline-none focus:border-amber-500/50"
                                                value={(selectedObject as any).fontFamily}
                                                onChange={(e) => updateObjectProperty('fontFamily', e.target.value)}
                                            >
                                                <option value="Inter">Inter</option>
                                                <option value="Playfair Display">Playfair</option>
                                                <option value="Outfit">Outfit</option>
                                                <option value="Cormorant Garamond">Cormorant</option>
                                            </select>
                                        </div>

                                        <div className="h-8 w-px bg-white/10" />

                                        {/* Color Presets */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Color</span>
                                            <div className="flex gap-1">
                                                {['#FFFFFF', '#D4AF37', '#60A5FA', '#000000'].map(c => (
                                                    <button
                                                        key={c}
                                                        className={cn(
                                                            "w-4 h-4 rounded-full border border-white/20 transition-transform active:scale-90",
                                                            (selectedObject as any).fill === c && "scale-125 border-white ring-1 ring-amber-500/50"
                                                        )}
                                                        style={{ backgroundColor: c }}
                                                        onClick={() => updateObjectProperty('fill', c)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-8 w-px bg-white/10" />

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Spacing</span>
                                            <Slider
                                                defaultValue={[(selectedObject as any).charSpacing || 0]}
                                                max={1000}
                                                step={10}
                                                className="w-24"
                                                onValueChange={(val) => updateObjectProperty('charSpacing', val[0])}
                                            />
                                        </div>
                                        <div className="h-8 w-px bg-white/10" />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Size</span>
                                            <Slider
                                                defaultValue={[(selectedObject as any).fontSize || 48]}
                                                max={200}
                                                min={10}
                                                step={1}
                                                className="w-24"
                                                onValueChange={(val) => updateObjectProperty('fontSize', val[0])}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="pl-2 border-l border-white/10 ml-1">
                                    <ToolButton icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete" onClick={deleteSelected} variant="danger" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Filter Sidebar */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                    <div className="flex flex-col gap-1 p-2 rounded-xl bg-[#1E293B]/80 backdrop-blur border border-white/10">
                        <ToolButton icon={<Sparkles className="w-4 h-4" />} label="AI Enhance" onClick={() => handleAIAction('enhance')} variant="amber" disabled={isProcessing} />
                        <ToolButton icon={<Palette className="w-4 h-4" />} label="AI Recolor" onClick={() => handleAIAction('recolor')} variant="purple" disabled={isProcessing} />
                        <ToolButton icon={<RefreshCw className={cn("w-4 h-4", isProcessing && "animate-spin")} />} label="Regenerate" onClick={() => handleAIAction('regenerate')} variant="blue" disabled={isProcessing} />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 transition-all shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent side="left" className="w-64 bg-[#0F172A]/95 backdrop-blur-xl border-white/10 p-4 rounded-2xl shadow-2xl">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-white">Base Image Filters</span>
                                </div>
                                <FilterSlider label="Brightness" icon={<Sun className="w-3 h-3" />} value={filters.brightness} min={-100} max={100} onChange={(v) => applyFilter('brightness', v)} />
                                <FilterSlider label="Contrast" icon={<Contrast className="w-3 h-3" />} value={filters.contrast} min={-100} max={100} onChange={(v) => applyFilter('contrast', v)} />
                                <FilterSlider label="Saturation" icon={<Palette className="w-3 h-3" />} value={filters.saturation} min={-100} max={100} onChange={(v) => applyFilter('saturation', v)} />
                                <FilterSlider label="Blur" icon={<Droplets className="w-3 h-3" />} value={filters.blur} min={0} max={100} onChange={(v) => applyFilter('blur', v)} />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-[10px] uppercase font-bold border-white/5 hover:bg-white/5 h-8 mt-2"
                                    onClick={() => {
                                        const reset = { brightness: 0, contrast: 0, blur: 0, saturation: 0 };
                                        setFilters(reset);
                                        if (backgroundObject) {
                                            backgroundObject.filters = [];
                                            backgroundObject.applyFilters();
                                            fabricRef.current?.renderAll();
                                        }
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="h-12 bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-t border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{layerCount} layers</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={exportPNG} size="sm" className="h-8 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium rounded-full text-xs">
                        <Download className="w-3.5 h-3.5 mr-1.5" /> PNG
                    </Button>
                    <Button onClick={exportPDF} size="sm" variant="outline" className="h-8 px-4 border-white/20 text-white hover:bg-white/5 rounded-full text-xs">
                        <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                    </Button>
                </div>
            </div>
        </div>
    );
};

const FilterSlider: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}> = ({ label, icon, value, min, max, onChange }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
                {icon}
                <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-500/80">{value}</span>
        </div>
        <Slider
            value={[value]}
            min={min}
            max={max}
            step={1}
            onValueChange={(val) => onChange(val[0])}
            className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
        />
    </div>
);

// Reusable Tool Button Component
const ToolButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'danger' | 'amber' | 'purple' | 'blue';
}> = ({ icon, label, onClick, disabled, variant = 'default' }) => {
    const colorClasses = {
        default: 'text-slate-400 hover:text-white hover:bg-white/10',
        danger: 'text-red-400 hover:bg-red-500/20',
        amber: 'text-amber-400 hover:bg-amber-500/20',
        purple: 'text-purple-400 hover:bg-purple-500/20',
        blue: 'text-blue-400 hover:bg-blue-500/20'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "p-2 rounded-lg transition-all duration-200 group relative active:scale-95",
                colorClasses[variant],
                disabled && "opacity-30 cursor-not-allowed"
            )}
        >
            {icon}
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0F172A] border border-white/10 rounded-lg shadow-2xl text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50">
                {label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#0F172A]" />
            </div>
        </button>
    );
};

export default DesignCanvas;
