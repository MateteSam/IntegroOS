import React from 'react';
import { Type, Settings, RotateCw, Image as ImageIcon, Maximize, Minimize, AlignLeft, AlignCenter, AlignRight, Sliders, Wand2, Sparkles } from 'lucide-react';
import { Annotation, FontFamily, DocumentSettings, JacketDesign, TypographyStyle, MainTab } from '../types';
import TextEffectsPanel from './TextEffectsPanel';
import { TextEffectType } from '../services/textEffectsEngine';

type JacketElement = keyof JacketDesign;

interface RightSidebarProps {
    activeTab: MainTab;
    selectedJacketElement: JacketElement | null;
    jacketDesign: JacketDesign | null;
    onJacketDesignChange: (updates: Partial<JacketDesign>) => void;
    onJacketTypographyChange: (element: JacketElement, style: Partial<TypographyStyle>) => void;
    selectedAnnotations: Annotation[];
    docSettings: DocumentSettings;
    onOpenSetup: () => void;
    pageDimensions: { width: number; height: number } | null;
    activeJacketZone?: 'front' | 'back' | 'spine';
    onGenerateAICover?: (zone: 'front' | 'back' | 'spine') => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
    activeTab,
    selectedJacketElement,
    jacketDesign,
    onJacketDesignChange,
    onJacketTypographyChange,
    selectedAnnotations,
    docSettings,
    onOpenSetup,
    pageDimensions,
    activeJacketZone,
    onGenerateAICover
}) => {

    if (activeTab !== 'jacket' && activeTab !== 'interior') return null;

    // Jacket Typography Editing
    if (activeTab === 'jacket' && selectedJacketElement && jacketDesign) {
        const element = jacketDesign[selectedJacketElement];
        if (typeof element !== 'object' || !element || !('text' in element)) return null;

        const elementStyle = element as TypographyStyle;

        const handleStyleChange = (key: keyof TypographyStyle, value: any) => {
            onJacketTypographyChange(selectedJacketElement, { [key]: value });
        };

        return (
            <SidebarContainer title={`Edit ${selectedJacketElement}`} icon={<Type size={14} />}>
                <div className="space-y-6">
                    <Group title="Font & Style">
                        <div className="space-y-3">
                            <select
                                value={elementStyle.font}
                                onChange={(e) => handleStyleChange('font', e.target.value as FontFamily)}
                                className="w-full h-9 px-3 border border-slate-700 rounded-lg bg-slate-800 focus:bg-slate-700 focus:border-cyan-500 transition-all outline-none font-medium text-xs text-slate-200"
                            >
                                <option value="Roboto">Roboto</option>
                                <option value="Playfair Display">Playfair Display</option>
                                <option value="Open Sans">Open Sans</option>
                                <option value="Dancing Script">Dancing Script</option>
                                <option value="Times-Roman">Times New Roman</option>
                                <option value="Courier">Courier</option>
                                <option value="Helvetica">Helvetica</option>
                            </select>

                            <div className="grid grid-cols-2 gap-3">
                                <InputNumber label="Size (px)" value={elementStyle.fontSize} onChange={(v) => handleStyleChange('fontSize', v)} />
                                <ColorInput label="Color" value={elementStyle.color} onChange={(v) => handleStyleChange('color', v)} />
                            </div>
                        </div>
                    </Group>

                    <Group title="Alignment">
                        <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
                            {['left', 'center', 'right'].map((align) => (
                                <button
                                    key={align}
                                    onClick={() => handleStyleChange('textAlign', align)}
                                    className={`flex-1 py-1.5 flex justify-center rounded transition-all ${elementStyle.textAlign === align ? 'bg-slate-700 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    title={`Align ${align}`}
                                >
                                    {align === 'left' && <AlignLeft size={14} />}
                                    {align === 'center' && <AlignCenter size={14} />}
                                    {align === 'right' && <AlignRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </Group>

                    <Group title="Transform">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Rotation</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={elementStyle.rotation || 0}
                                        onChange={(e) => handleStyleChange('rotation', Number(e.target.value))}
                                        className="w-full h-8 px-2 border border-slate-700 rounded-lg bg-slate-800 focus:bg-slate-700 transition-all outline-none text-xs text-slate-200"
                                        step="90"
                                    />
                                    <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors" onClick={() => handleStyleChange('rotation', (elementStyle.rotation || 0) - 90)}><RotateCw size={14} /></button>
                                </div>
                            </div>
                            <InputNumber label="Spacing" value={elementStyle.letterSpacing || 0} onChange={(v) => handleStyleChange('letterSpacing', v)} />
                        </div>
                        <div className="flex items-center gap-3 mt-4 p-2.5 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => handleStyleChange('isUppercase', !elementStyle.isUppercase)}>
                            <input type="checkbox" checked={elementStyle.isUppercase} onChange={(e) => handleStyleChange('isUppercase', e.target.checked)} id="uppercase-toggle" className="w-4 h-4 text-cyan-500 rounded border-slate-600 focus:ring-cyan-500 bg-slate-700" />
                            <label className="text-xs font-bold text-slate-400 cursor-pointer">Uppercase Text</label>
                        </div>
                    </Group>

                    {/* Text Effects */}
                    <Group title="Text Effects">
                        <TextEffectsPanel
                            activeEffect={(elementStyle as any).textEffect || 'none'}
                            onSelectEffect={(effect) => handleStyleChange('textEffect' as any, effect)}
                            context="cover"
                        />
                    </Group>
                </div>
            </SidebarContainer>
        );
    }

    // Jacket Zone Settings (When no text element selected)
    if (activeTab === 'jacket' && jacketDesign && activeJacketZone) {
        const handleImageOptionChange = (key: string, value: any) => {
            onJacketDesignChange({
                imageOptions: { ...jacketDesign.imageOptions, [key]: value }
            });
        };

        return (
            <SidebarContainer title={`${activeJacketZone.charAt(0).toUpperCase() + activeJacketZone.slice(1)} Settings`} icon={<ImageIcon size={14} />}>
                <div className="space-y-6">
                    <Group title="Image Scaling">
                        <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
                            <button
                                onClick={() => handleImageOptionChange('size', 'cover')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold rounded transition-all ${!jacketDesign.imageOptions?.size || jacketDesign.imageOptions.size === 'cover' ? 'bg-slate-700 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Maximize size={12} /> Fill
                            </button>
                            <button
                                onClick={() => handleImageOptionChange('size', 'contain')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold rounded transition-all ${jacketDesign.imageOptions?.size === 'contain' ? 'bg-slate-700 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Minimize size={12} /> Fit
                            </button>
                        </div>
                    </Group>

                    <Group title="Appearance">
                        <div className="space-y-4">
                            <ColorInput label="Background Color" value={jacketDesign.backgroundColor} onChange={(v) => onJacketDesignChange({ backgroundColor: v })} />

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Overlay Opacity</Label>
                                    <span className="text-[10px] font-bold text-cyan-400">{Math.round((jacketDesign.overlayOpacity || 0) * 100)}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="1" step="0.05"
                                    value={jacketDesign.overlayOpacity || 0}
                                    onChange={(e) => onJacketDesignChange({ overlayOpacity: Number(e.target.value) })}
                                    className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {onGenerateAICover && (
                                <button
                                    onClick={() => onGenerateAICover(activeJacketZone || 'front')}
                                    className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-purple-900/20"
                                >
                                    <Wand2 size={14} />
                                    Generate AI Cover
                                </button>
                            )}
                        </div>
                    </Group>
                    <Group title="Filters">
                        <div className="relative">
                            <select
                                value={jacketDesign.imageOptions?.filter || 'none'}
                                onChange={(e) => handleImageOptionChange('filter', e.target.value)}
                                className="w-full h-9 px-3 border border-slate-700 rounded-lg bg-slate-800 focus:bg-slate-700 focus:border-cyan-500 transition-all outline-none font-medium text-xs text-slate-200 appearance-none"
                            >
                                <option value="none">No Filter</option>
                                <option value="grayscale(100%)">Black & White</option>
                                <option value="sepia(100%)">Sepia</option>
                                <option value="contrast(1.2)">High Contrast</option>
                                <option value="brightness(1.1)">Bright</option>
                                <option value="saturate(1.5)">Vivid</option>
                                <option value="blur(1px)">Soft Focus</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <Sliders size={12} />
                            </div>
                        </div>
                    </Group>
                </div>
            </SidebarContainer>
        );
    }

    // Interior Settings
    return (
        <SidebarContainer title="Interior Design" icon={<Settings size={14} />}>
            <div className="space-y-6">
                <Group title="Page Configuration">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 space-y-2">
                        <InfoRow label="Safe Margin" value={`${docSettings.marginMm}mm`} />
                        <InfoRow label="Bleed Area" value={`${docSettings.bleedMm}mm`} />
                    </div>
                    <Button onClick={onOpenSetup} fullWidth>Configure Dimensions</Button>

                    <div className="h-px bg-white/5 my-2" />

                    {onGenerateAICover && (
                        <button
                            onClick={() => onGenerateAICover('front')}
                            className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-purple-900/10 border border-white/5"
                        >
                            <Wand2 size={14} />
                            Generate AI Cover
                        </button>
                    )}
                </Group>
            </div>
        </SidebarContainer>
    );
};

const SidebarContainer: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="w-72 h-full flex flex-col z-30 shrink-0 bg-slate-900 border-l border-white/5 md:flex hidden">

        <div className="relative z-10 flex flex-col h-full">
            <div className="h-12 flex items-center px-4 border-b border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-100">
                    <div className="p-1.5 bg-slate-800 rounded-lg text-cyan-400 border border-white/5">{icon}</div>
                    {title}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);

const Group: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-2.5">
        <h4 className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <div className="h-px w-3 bg-cyan-500/50 rounded-full" />
            {title}
        </h4>
        {children}
    </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (<div className="text-[10px] font-bold text-slate-400 mb-1">{children}</div>);

const InfoRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-300 font-mono">{value}</span>
    </div>
);

const Button: React.FC<{ onClick?: () => void, children: React.ReactNode, fullWidth?: boolean }> = ({ onClick, children, fullWidth }) => (
    <button
        onClick={onClick}
        className={`rounded-lg font-bold ${fullWidth ? 'w-full' : ''} px-4 py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 text-xs hover:bg-cyan-500/20 hover:text-cyan-300 transition-all shadow-lg shadow-cyan-900/20 active:scale-95`}
    >
        {children}
    </button>
);

const InputNumber: React.FC<{ label: string, value: number, onChange: (v: number) => void }> = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <Label>{label}</Label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-8 px-2 border border-slate-700 rounded-lg bg-slate-800 hover:border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all outline-none text-xs font-mono text-slate-200"
        />
    </div>
);

const ColorInput: React.FC<{ label: string, value?: string, onChange: (v: string) => void }> = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <Label>{label}</Label>
        <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg border border-slate-700 flex-shrink-0 overflow-hidden relative bg-slate-800 hover:border-slate-600 transition-colors">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer p-0 m-0 border-0"
                />
            </div>
            <input
                type="text"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-8 px-2 border border-slate-700 rounded-lg bg-slate-800 hover:border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all outline-none font-mono text-[10px] font-medium uppercase text-slate-300"
            />
        </div>
    </div>
);

export default RightSidebar;
