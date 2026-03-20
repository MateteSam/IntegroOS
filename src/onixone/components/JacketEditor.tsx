import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { JacketDesign, PageSize, TypographyStyle, StoryBlock, BookMetadata, TextStoryBlock, DocumentSettings } from '../types';
import AutoResizingTextarea from './AutoResizingTextarea';
import RichTextEditor from './RichTextEditor';
import { generateJacketDescription } from '../services/aiService';
import CoverAI, { GENRE_DNA, GeneratedCover, CoverBlueprint } from '../services/coverAI';
import { Upload, RefreshCw, ImageOff, Sparkles, Loader2, Eye, Wand2, Palette, Layers, Zap, Brain } from 'lucide-react';

type JacketElement = keyof JacketDesign;
type Zone = 'front' | 'back' | 'spine';

interface Props {
    jacketDesign: JacketDesign | null;
    pageSize: PageSize;
    spineWidth: number;
    scale: number;
    docSettings?: DocumentSettings;
    onDesignChange: (d: Partial<JacketDesign>) => void;
    onElementSelect: (e: JacketElement | null) => void;
    selectedElement: JacketElement | null;
    onTypographyChange: (e: JacketElement, s: Partial<TypographyStyle>) => void;
    onPreviewBook: () => void;
    activeZone: Zone;
    onZoneChange: (z: Zone) => void;
    numPages: number;
    onGenerateImages?: (options?: { zone?: Zone, prompt?: string, useAnalysis?: boolean }) => void;
    onAnalyzeManuscript?: () => Promise<void>;
    onApplyGeneratedImage?: (url: string) => void;
    storyBlocks?: StoryBlock[];
    metadata?: BookMetadata;
    variables?: Record<string, string>;
}

const MIN_SPINE = 40;
const GENRES = Object.keys(GENRE_DNA);
const TONES = ['vibrant', 'dark', 'light', 'muted'] as const;

// Extract info from manuscript content
const extractInfo = (blocks: StoryBlock[], meta?: BookMetadata) => {
    const title = meta?.title && meta.title !== 'Untitled Project' ? meta.title : '';
    const author = meta?.authors?.[0] || '';
    const text = blocks.filter((b): b is TextStoryBlock => 'text' in b).map(b => b.text).join(' ').toLowerCase();

    // Smart genre detection from content
    let genre = 'literary';
    const genrePatterns: [string, RegExp][] = [
        ['mystery', /murder|detective|crime|clue|suspect/],
        ['fantasy', /magic|dragon|kingdom|wizard|enchant/],
        ['scifi', /spaceship|alien|future|robot|planet/],
        ['romance', /love|heart|passion|kiss|romantic/],
        ['horror', /terror|nightmare|blood|scream|haunted/],
        ['thriller', /chase|escape|danger|conspiracy|agent/],
        ['sovereign', /sovereign|elite|luxury|royal|monument|nexus|integro/],
    ];
    for (const [g, pattern] of genrePatterns) {
        if (pattern.test(text)) { genre = g; break; }
    }

    // Extract synopsis from first meaningful paragraph
    const synopsis = blocks
        .filter((b): b is TextStoryBlock => 'text' in b && b.text.length > 100)
        .slice(0, 2)
        .map(b => b.text.replace(/<[^>]*>/g, '').slice(0, 200))
        .join(' ');

    return { title, author, genre, synopsis };
};

const JacketEditor: React.FC<Props> = (props) => {
    const {
        jacketDesign, pageSize, spineWidth, scale = 1, docSettings,
        onDesignChange, onElementSelect, selectedElement, onTypographyChange, onPreviewBook,
        activeZone, onZoneChange, numPages, generatedImages = [], isGeneratingImages = false,
        onGenerateImages, onAnalyzeManuscript,
        onApplyGeneratedImage, storyBlocks = [], metadata, variables = {}
    } = props;
    const fileRef = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<Set<string>>(new Set());
    const [loaded, setLoaded] = useState<Set<string>>(new Set());
    const [generating, setGenerating] = useState(false);
    const [covers, setCovers] = useState<GeneratedCover[]>([]);
    const [blueprint, setBlueprint] = useState<CoverBlueprint | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const info = useMemo(() => extractInfo(storyBlocks, metadata), [storyBlocks, metadata]);

    // Sync blueprint from global images if they change
    useEffect(() => {
        if (generatedImages && generatedImages.length > 0) {
            const first = generatedImages[0];
            if (first.blueprint) {
                setBlueprint(first.blueprint);
            }
        }
    }, [generatedImages]);

    const [title, setTitle] = useState(info.title || 'Untitled');
    const [author, setAuthor] = useState(info.author || 'Author Name');
    const [genre, setGenre] = useState(info.genre);
    const [tone, setTone] = useState<typeof TONES[number]>('vibrant');
    const [prompt, setPrompt] = useState('');
    const [showGuides, setShowGuides] = useState(true);

    // Get genre DNA for palette display
    const genreDNA = GENRE_DNA[genre] || GENRE_DNA.literary;
    const palette = genreDNA.palettes[0];

    // Sync from content
    useEffect(() => {
        if (info.title) setTitle(info.title);
        if (info.author) setAuthor(info.author);
        if (info.genre) setGenre(info.genre);
    }, [info]);

    // Sync to design
    useEffect(() => {
        if (!jacketDesign) return;
        if (title !== jacketDesign.title?.text) onTypographyChange('title', { ...jacketDesign.title, text: title });
        if (author !== jacketDesign.author?.text) onTypographyChange('author', { ...jacketDesign.author, text: author });
    }, [title, author]);

    if (!jacketDesign) return <div className="flex-1 flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>;

    const { frontCoverUrl, backCoverUrl, spineUrl, backgroundColor, overlayOpacity, imageOptions } = jacketDesign;
    const PT_PER_MM = 2.83465;
    const bleed = ((docSettings?.bleedMm ?? 3.175) * PT_PER_MM) * scale;
    const marginPx = ((docSettings?.marginMm ?? 20) * PT_PER_MM) * scale;
    const showCrop = docSettings?.showCropMarks ?? true;
    const spineOk = numPages >= MIN_SPINE;

    const getZoneUrl = (z: Zone) => z === 'front' ? frontCoverUrl : z === 'back' ? backCoverUrl : spineUrl;

    const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = ev => {
            const url = ev.target?.result as string;
            if (activeZone === 'front') onDesignChange({ frontCoverUrl: url });
            else if (activeZone === 'back') onDesignChange({ backCoverUrl: url });
            else if (spineOk) onDesignChange({ spineUrl: url });
        };
        r.readAsDataURL(f);
        if (fileRef.current) fileRef.current.value = '';
    };

    const apply = (url: string) => {
        if (activeZone === 'front') onDesignChange({ frontCoverUrl: url });
        else if (activeZone === 'back') onDesignChange({ backCoverUrl: url });
        else if (spineOk) onDesignChange({ spineUrl: url });
        onApplyGeneratedImage?.(url);
        // Close the gallery after selection
        setCovers([]);
    };

    // 🎨 CoverAI Generation - The groundbreaking approach
    const generate = async () => {
        setGenerating(true);
        setCovers([]);
        setLoaded(new Set());
        setErrors(new Set());

        try {
            // Generate covers using CoverAI blueprint system
            const newCovers = await CoverAI.generateCovers({
                title,
                author,
                genre,
                synopsis: info.synopsis,
                customPrompt: prompt.trim() || undefined,
                tone,
                zone: activeZone,
                count: 6
            });

            setCovers(newCovers);
            if (newCovers[0]?.blueprint) {
                setBlueprint(newCovers[0].blueprint);
            }

            // Also trigger parent callback
            onGenerateImages?.({
                zone: activeZone,
                prompt: prompt.trim() || undefined,
                useAnalysis: !!variables?.narrative_synopsis
            });
        } catch (e) {
            console.error('Cover generation failed:', e);
        } finally {
            setGenerating(false);
        }
    };

    // Get AI suggestions for better prompts
    const getSuggestions = async () => {
        try {
            const sug = await CoverAI.suggestCoverImprovements(
                prompt || `${title} ${genre} book cover`,
                genre,
                'Make it more striking and professional'
            );
            setSuggestions(sug);
        } catch (e) {
            console.error('Failed to get suggestions:', e);
        }
    };

    const genDescription = async () => {
        try {
            const desc = await generateJacketDescription(title, author, genre, [], 'engaging');
            onTypographyChange('backCoverText', { ...jacketDesign.backCoverText, text: desc });
        } catch (e) { console.error(e); }
    };

    // Only use CoverAI results (no legacy fallbacks)
    // Merge local and global results
    const allImgs = useMemo(() => {
        const local = covers?.filter(c => c?.layers?.composite).map(c => c.layers.composite) || [];
        const global = (generatedImages as any[])?.filter(c => typeof c === 'object' && c?.layers?.composite).map(c => c.layers.composite) || [];

        // If we have global results, they might be from the sidebar, so we should prioritize them
        // but if we just generated locally, locally is probably more relevant.
        // For simplicity, let's just use global if it exists and has content, otherwise local.
        if (global.length > 0) return global;
        return local;
    }, [covers, generatedImages]);

    const busy = generating || isGeneratingImages;

    // Editable text renderer
    const renderText = (el: 'title' | 'author' | 'subtitle' | 'backCoverText' | 'spineText', zone: Zone) => {
        const d = jacketDesign[el];
        if (!d || (zone === 'spine' && !spineOk)) return null;

        const editing = selectedElement === el;
        const css: React.CSSProperties = {
            fontFamily: d.font, fontSize: d.fontSize * scale, color: d.color,
            letterSpacing: d.letterSpacing, lineHeight: d.lineHeight, textAlign: d.textAlign,
            textTransform: d.isUppercase ? 'uppercase' : 'none', whiteSpace: 'pre-wrap',
            width: '100%', transform: `rotate(${d.rotation || 0}deg)`, transformOrigin: 'center'
        };

        if (el === 'backCoverText' && editing) {
            return (
                <div onClick={e => e.stopPropagation()} className="h-full w-full z-20">
                    <RichTextEditor value={d.text} onChange={v => onTypographyChange(el, { ...d, text: v })}
                        onBlur={() => onElementSelect(null)} onGenerateAI={genDescription} style={{ height: '100%' }} />
                </div>
            );
        }

        return (
            <div onClick={e => { e.stopPropagation(); onElementSelect(el); onZoneChange(zone); }}
                className={`p-1 cursor-pointer z-20 ${editing ? 'ring-2 ring-cyan-400' : 'hover:ring-1 ring-cyan-400/40'}`}
                style={el === 'backCoverText' ? { height: '100%', overflow: 'hidden' } : undefined}>
                {editing ? (
                    <AutoResizingTextarea value={d.text} onChange={v => onTypographyChange(el, { ...d, text: v })}
                        onBlur={() => onElementSelect(null)} style={css} autoFocus />
                ) : el === 'backCoverText' ? (
                    <div style={{ ...css, whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: d.text || `[${el}]` }} />
                ) : (
                    <div style={css}>{d.text || `[${el}]`}</div>
                )}
            </div>
        );
    };

    // Zone renderer
    const renderZone = (zone: Zone, w: number, children: React.ReactNode) => {
        const active = activeZone === zone;
        const url = getZoneUrl(zone);
        const hasErr = url ? errors.has(url) : false;

        if (zone === 'spine' && !spineOk) {
            return <div className="h-full bg-slate-900/50 border-x border-slate-800" style={{ width: w }} />;
        }

        return (
            <div className={`relative h-full transition-all group ${active ? 'z-10' : 'opacity-80 hover:opacity-100'}`}
                style={{ width: w }} onClick={() => { onZoneChange(zone); onElementSelect(null); }}>

                <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase px-2 py-0.5 rounded transition-colors
                    ${active ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                    {zone}
                </div>

                <div className={`w-full h-full relative overflow-hidden bg-slate-950 border border-slate-800 ${active ? 'ring-2 ring-cyan-500/30' : ''}`}>
                    {url && !hasErr ? (
                        <img src={url} className="w-full h-full object-cover" alt={zone}
                            style={{ filter: imageOptions?.filter !== 'none' ? imageOptions?.filter : undefined }}
                            onError={() => setErrors(p => new Set(p).add(url))} />
                    ) : (
                        <div className="w-full h-full" style={{ backgroundColor }} />
                    )}

                    {url && <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor, opacity: overlayOpacity }} />}

                    {active && (!url || hasErr) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-cyan-400 transition-colors">
                                <Upload size={24} />
                                <span className="text-[10px] font-bold uppercase">Upload</span>
                            </button>
                        </div>
                    )}

                    {active && url && !hasErr && (
                        <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <RefreshCw size={14} />
                        </button>
                    )}

                    <div className="absolute inset-0 p-6 flex flex-col pointer-events-none">
                        <div className="pointer-events-auto h-full flex flex-col">{children}</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full text-slate-100 overflow-hidden bg-[#080f1a]">
            <input type="file" ref={fileRef} onChange={upload} accept="image/*" className="hidden" />

            {/* 🎨 CoverAI Control Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-slate-800">
                {/* Book Info */}
                <div className="flex items-center gap-2">
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Book Title"
                        className="w-[160px] bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none" />

                    <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author"
                        className="w-[120px] bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                </div>

                <div className="w-px h-6 bg-slate-700" />

                {/* Genre & Tone */}
                <div className="flex items-center gap-2">
                    <select value={genre} onChange={e => setGenre(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none cursor-pointer">
                        {GENRES.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                    </select>

                    <select value={tone} onChange={e => setTone(e.target.value as typeof TONES[number])}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none cursor-pointer">
                        {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>

                    {/* Genre DNA Palette Preview */}
                    <div className="flex gap-0.5" title={`${genre} palette`}>
                        {palette.map((c, i) => (
                            <div key={i} className="w-4 h-4 rounded-sm border border-white/10" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>

                <div className="w-px h-6 bg-slate-700" />

                {/* Zone Selector */}
                <div className="flex rounded-lg overflow-hidden border border-slate-700">
                    {(['front', 'back', 'spine'] as Zone[]).map(z => (
                        <button key={z} onClick={() => onZoneChange(z)}
                            disabled={z === 'spine' && !spineOk}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${activeZone === z ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'
                                } ${z === 'spine' && !spineOk ? 'opacity-40 cursor-not-allowed' : ''}`}>
                            {z.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="flex-1" />

                {/* Custom Prompt & Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowGuides(s => !s)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${showGuides ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'} transition-colors`}
                        title="Toggle print guides"
                    >
                        Guides
                    </button>
                    <div className="relative">
                        <input value={prompt} onChange={e => setPrompt(e.target.value)}
                            placeholder="Custom vision (optional)"
                            className="w-[200px] bg-slate-950 border border-slate-700 rounded px-2 py-1.5 pr-8 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                        <button onClick={getSuggestions} title="Get AI suggestions"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-cyan-400 transition-colors">
                            <Wand2 size={14} />
                        </button>
                    </div>

                    <button onClick={generate} disabled={busy}
                        className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-sm font-semibold disabled:opacity-50 hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20">
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                        Generate
                    </button>

                    <button onClick={onPreviewBook} className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors" title="Preview Book">
                        <Eye size={14} />
                    </button>
                </div>
            </div>

            {/* AI Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
                    <Wand2 size={12} className="text-cyan-400 shrink-0" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Suggestions:</span>
                    {suggestions.slice(0, 4).map((s, i) => (
                        <button key={i} onClick={() => { setPrompt(s); setSuggestions([]); }}
                            className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded hover:border-cyan-500 transition-colors truncate max-w-[200px]"
                            title={s}>
                            {s.slice(0, 40)}...
                        </button>
                    ))}
                    <button onClick={() => setSuggestions([])} className="text-slate-500 hover:text-white ml-auto">×</button>
                </div>
            )}

            {/* Blueprint Info Bar */}
            {blueprint && (
                <div className="px-4 py-1.5 bg-slate-950/80 border-b border-slate-800/50 flex items-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Layers size={10} className="text-cyan-400" />
                        <span className="uppercase font-bold">Blueprint:</span>
                    </div>
                    <span className="text-slate-500">Style: <span className="text-slate-300">{blueprint.style}</span></span>
                    <span className="text-slate-500">Layout: <span className="text-slate-300">{blueprint.composition.layout}</span></span>
                    <span className="text-slate-500">Mood: <span className="text-slate-300">{blueprint.palette.mood}</span></span>
                    <div className="flex items-center gap-1">
                        <Palette size={10} className="text-slate-500" />
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: blueprint.palette.primary }} />
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: blueprint.palette.secondary }} />
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: blueprint.palette.accent }} />
                    </div>
                </div>
            )}

            {/* Canvas */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                <div className="relative" style={{ padding: bleed }}>
                    <div className="flex shadow-2xl" style={{ height: pageSize.heightPt * scale }}>
                        {renderZone('back', pageSize.widthPt * scale, renderText('backCoverText', 'back'))}
                        <div className="w-px bg-slate-800" />
                        {renderZone('spine', spineWidth * scale, (
                            <div className="h-full flex items-center justify-center">{renderText('spineText', 'spine')}</div>
                        ))}
                        <div className="w-px bg-slate-800" />
                        {renderZone('front', pageSize.widthPt * scale, (
                            genre === 'devotional' ? (
                                <div className="h-full flex flex-col text-center pt-8 relative z-10 overflow-hidden">
                                    <div className="mx-auto w-24 h-24 rounded-full border-[3px] border-yellow-500 bg-slate-900/60 flex items-center justify-center shadow-xl mb-4 backdrop-blur-sm relative">
                                        <div className="absolute inset-1 rounded-full border border-yellow-600/50"></div>
                                        <span className="text-yellow-500 font-serif font-bold text-2xl tracking-tighter">TCMA</span>
                                    </div>
                                    <div className="px-2 relative z-10">
                                        <div className="absolute inset-x-0 h-full top-0 bg-black/30 blur-2xl -z-10"></div>
                                        {renderText('title', 'front')}
                                    </div>
                                    <div className="mt-2 bg-[#4a2e24] mx-auto px-4 py-1.5 rounded-sm shadow-md border-y border-[#754f40] relative z-10">
                                        {renderText('subtitle', 'front')}
                                    </div>
                                    <div className="mt-auto mb-[20%] mx-8 bg-[#8a6a42]/90 p-3 border border-[#bd9c75] shadow-xl transform -skew-y-2 relative">
                                       <span className="block transform skew-y-2 text-white font-serif italic text-lg shadow-black/50 drop-shadow-md">
                                           A daily devotional to guide<br/>your walk with God
                                       </span>
                                    </div>
                                    <div className="w-full bg-gradient-to-b from-[#e3bf7d] via-[#f7dfa6] to-[#d4aa5c] py-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] border-t border-[#fff3d4] mt-auto">
                                        <div className="max-w-[80%] mx-auto">
                                            {renderText('author', 'front')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col justify-center text-center">
                                    {renderText('title', 'front')}
                                    {renderText('subtitle', 'front')}
                                    <div className="mt-auto pb-4">{renderText('author', 'front')}</div>
                                </div>
                            )
                        ))}
                    </div>
                    <div className="absolute inset-0 border border-cyan-500/20 border-dashed pointer-events-none" style={{ margin: bleed }} />

                    {showGuides && (
                        <div className="absolute inset-0 pointer-events-none" style={{ margin: bleed }}>
                            {showCrop && (
                                <>
                                    <div className="absolute top-[-8px] left-0 w-6 h-px bg-cyan-500/40" />
                                    <div className="absolute top-0 left-[-8px] w-px h-6 bg-cyan-500/40" />
                                    <div className="absolute top-[-8px] right-0 w-6 h-px bg-cyan-500/40" />
                                    <div className="absolute top-0 right-[-8px] w-px h-6 bg-cyan-500/40" />
                                    <div className="absolute bottom-[-8px] left-0 w-6 h-px bg-cyan-500/40" />
                                    <div className="absolute bottom-0 left-[-8px] w-px h-6 bg-cyan-500/40" />
                                    <div className="absolute bottom-[-8px] right-0 w-6 h-px bg-cyan-500/40" />
                                    <div className="absolute bottom-0 right-[-8px] w-px h-6 bg-cyan-500/40" />
                                </>
                            )}
                            {/* Fold lines between zones */}
                            <div
                                className="absolute top-0 h-full border-l border-dashed border-cyan-500/40"
                                style={{ left: pageSize.widthPt * scale }}
                            />
                            <div
                                className="absolute top-0 h-full border-l border-dashed border-cyan-500/40"
                                style={{ left: (pageSize.widthPt + spineWidth) * scale }}
                            />
                            {/* Spine center */}
                            <div
                                className="absolute top-0 h-full border-l border-cyan-400/40"
                                style={{ left: (pageSize.widthPt + spineWidth / 2) * scale }}
                            />
                            {/* Safe areas */}
                            <div
                                className="absolute border border-emerald-400/40"
                                style={{
                                    top: marginPx,
                                    left: marginPx,
                                    width: pageSize.widthPt * scale - marginPx * 2,
                                    height: pageSize.heightPt * scale - marginPx * 2
                                }}
                            />
                            <div
                                className="absolute border border-emerald-400/40"
                                style={{
                                    top: marginPx,
                                    left: pageSize.widthPt * scale + marginPx,
                                    width: spineWidth * scale - marginPx * 2 > 0 ? spineWidth * scale - marginPx * 2 : 0,
                                    height: pageSize.heightPt * scale - marginPx * 2
                                }}
                            />
                            <div
                                className="absolute border border-emerald-400/40"
                                style={{
                                    top: marginPx,
                                    left: (pageSize.widthPt + spineWidth) * scale + marginPx,
                                    width: pageSize.widthPt * scale - marginPx * 2,
                                    height: pageSize.heightPt * scale - marginPx * 2
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery - Slideshow Style */}
            {(allImgs.length > 0 || busy) && (
                <div className="bg-slate-900/80 border-t border-slate-800 p-4 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <Wand2 className="text-cyan-400" size={18} />
                                Jacket Synthesis Engine
                            </h2>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">v8.0 Professional Synthesis</p>
                        </div>

                        <button
                            onClick={onAnalyzeManuscript}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold text-cyan-400 uppercase tracking-wider transition-all"
                        >
                            <Brain size={12} />
                            Deep Narrative Audit
                        </button>
                    </div>

                    {variables?.narrative_synopsis && (
                        <div className="mb-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                    <Sparkles size={16} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-1">Visual Narrative Pillars</h3>
                                    <p className="text-[11px] text-slate-300 leading-relaxed italic mb-2">"{variables.narrative_synopsis.slice(0, 150)}..."</p>
                                    <div className="flex flex-wrap gap-2">
                                        {variables.visual_pillars?.split(',').map((p, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[9px] font-bold rounded-full uppercase tracking-tighter">
                                                {p.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-medium text-slate-300">Generated • {activeZone}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500">Click to apply</span>
                            {!busy && allImgs.length > 0 && (
                                <button
                                    onClick={() => setCovers([])}
                                    className="text-[10px] text-slate-500 hover:text-white px-2 py-0.5 rounded hover:bg-slate-700 transition-colors"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-4 px-1">
                        {busy && allImgs.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="w-28 shrink-0 aspect-[2/3] bg-slate-800 rounded animate-pulse flex items-center justify-center">
                                <Loader2 className="animate-spin text-cyan-500/30" size={20} />
                            </div>
                        ))}
                        {allImgs.map((url, i) => (
                            <div key={url + i} onClick={() => apply(url)}
                                className="w-28 shrink-0 aspect-[2/3] rounded overflow-hidden cursor-pointer border-2 border-transparent hover:border-cyan-500 transition-all bg-slate-800 relative group/item">
                                {!loaded.has(url) && !errors.has(url) && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-cyan-500/40" size={16} />
                                    </div>
                                )}
                                {errors.has(url) ? (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <ImageOff size={16} />
                                    </div>
                                ) : (
                                    <img src={url} alt="" className={`w-full h-full object-cover ${loaded.has(url) ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setLoaded(p => new Set(p).add(url))}
                                        onError={() => setErrors(p => new Set(p).add(url))} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JacketEditor;
