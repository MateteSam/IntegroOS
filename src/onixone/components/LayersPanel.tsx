import React from 'react';
import { Annotation } from '../types';
import { Layers, Eye, EyeOff, Lock, Unlock, Type, Image as ImageIcon, Box, GripVertical, Trash2 } from 'lucide-react';

interface LayersPanelProps {
    annotations: Annotation[];
    selectedIds: string[];
    onSelect: (id: string, multi: boolean) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onReorder: (dragIndex: number, hoverIndex: number) => void;
    onDelete: (id: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
    annotations,
    selectedIds,
    onSelect,
    onToggleVisibility,
    onToggleLock,
    onDelete
}) => {
    // Sort by z-index (descending to show top layer first)
    const sortedLayers = [...annotations].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    const getIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type size={14} />;
            case 'image': return <ImageIcon size={14} />;
            case 'rect':
            case 'circle':
            case 'line': return <Box size={14} />;
            default: return <Layers size={14} />;
        }
    };

    const getName = (ann: Annotation) => {
        if (ann.type === 'text') return ann.text.replace(/<[^>]*>/g, '').slice(0, 20) || 'Text Layer';
        if (ann.type === 'image') return 'Image Layer';
        return `${ann.type.charAt(0).toUpperCase() + ann.type.slice(1)} Layer`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/40">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-900/60">
                <Layers size={16} className="text-cyan-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-100">Layers</span>
                <span className="ml-auto text-[10px] text-slate-500 font-medium">{annotations.length} items</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {sortedLayers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2 opacity-50">
                        <Layers size={24} strokeWidth={1} />
                        <span className="text-[10px] font-medium uppercase">No layers on this page</span>
                    </div>
                ) : (
                    sortedLayers.map((ann, idx) => {
                        const isSelected = selectedIds.includes(ann.id);
                        return (
                            <div
                                key={ann.id}
                                onClick={(e) => onSelect(ann.id, e.shiftKey || e.metaKey)}
                                className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer border ${isSelected
                                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-50'
                                        : 'border-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <div className="p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                                    <GripVertical size={12} className="text-slate-600" />
                                </div>
                                <div className={`p-1.5 rounded-md ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                                    {getIcon(ann.type)}
                                </div>
                                <div className="flex-1 truncate text-[11px] font-medium">
                                    {getName(ann)}
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleLock(ann.id); }}
                                        className={`p-1 hover:text-white transition-colors ${ann.locked ? 'text-amber-500' : ''}`}
                                    >
                                        {ann.locked ? <Lock size={12} /> : <Unlock size={12} />}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(ann.id); }}
                                        className={`p-1 hover:text-white transition-colors ${ann.hidden ? 'text-red-400' : ''}`}
                                    >
                                        {ann.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(ann.id); }}
                                        className="p-1 hover:text-red-400 text-slate-600 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LayersPanel;
