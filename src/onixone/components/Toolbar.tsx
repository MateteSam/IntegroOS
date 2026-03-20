
import React, { useRef, useState } from 'react';
import {
    Heading1, Heading2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Image as ImageIcon, Type, Bold, Italic, Underline,
    ChevronDown, Trash2, Copy, MoveUp, MoveDown, Quote, Minus, Plus
} from 'lucide-react';
import { StoryBlock, StoryBlockType, TextStoryBlock, FontFamily } from '../types';

interface ToolbarProps {
    onInsertBlock: (type: StoryBlockType, extraData?: any) => void;
    activeTab: string;
    selectedBlock?: StoryBlock | null;
    onUpdateBlock?: (blockId: string, updates: Partial<TextStoryBlock>) => void;
    onDeleteBlock?: (blockId: string) => void;
    onDuplicateBlock?: (blockId: string) => void;
    onMoveBlock?: (blockId: string, direction: 'up' | 'down') => void;
}

const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
    { value: 'Times-Roman', label: 'Times New Roman' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Dancing Script', label: 'Dancing Script' },
    { value: 'Courier', label: 'Courier' }
];

const Toolbar: React.FC<ToolbarProps> = ({
    onInsertBlock,
    activeTab,
    selectedBlock,
    onUpdateBlock,
    onDeleteBlock,
    onDuplicateBlock,
    onMoveBlock
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showFontDropdown, setShowFontDropdown] = useState(false);

    if (activeTab !== 'interior') return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    onInsertBlock('image', { url: ev.target.result });
                }
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Check if we have a text block selected
    const isTextBlock = selectedBlock && selectedBlock.type !== 'image' && selectedBlock.type !== 'break';
    const textBlock = isTextBlock ? (selectedBlock as TextStoryBlock) : null;

    // Formatting handlers
    const handleChangeType = (newType: StoryBlockType) => {
        if (textBlock && onUpdateBlock) {
            onUpdateBlock(textBlock.id, { type: newType } as any);
        }
    };

    const handleFontChange = (font: FontFamily) => {
        if (textBlock && onUpdateBlock) {
            onUpdateBlock(textBlock.id, { font } as any);
        }
        setShowFontDropdown(false);
    };

    const handleDelete = () => {
        if (selectedBlock && onDeleteBlock) {
            onDeleteBlock(selectedBlock.id);
        }
    };

    const handleDuplicate = () => {
        if (selectedBlock && onDuplicateBlock) {
            onDuplicateBlock(selectedBlock.id);
        }
    };

    const handleMove = (direction: 'up' | 'down') => {
        if (selectedBlock && onMoveBlock) {
            onMoveBlock(selectedBlock.id, direction);
        }
    };

    return (
        <div className="z-40 bg-slate-900/40 backdrop-blur-md border-b border-white/5 py-3 px-6 shrink-0">
            <div className="flex items-center justify-start max-w-7xl mx-auto gap-5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 pb-2 md:pb-0">

                {/* Insert Section */}
                <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2 shadow-md hover:shadow-lg transition-shadow shrink-0">
                    <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest mr-1">Insert</span>
                    <ToolBtn onClick={() => onInsertBlock('chapter')} icon={<Heading1 size={17} strokeWidth={2.5} />} tooltip="Add Chapter" active={false} />
                    <ToolBtn onClick={() => onInsertBlock('heading')} icon={<Heading2 size={17} strokeWidth={2.5} />} tooltip="Add Heading" active={false} />
                    <ToolBtn onClick={() => onInsertBlock('paragraph')} icon={<Type size={17} strokeWidth={2.5} />} tooltip="Add Paragraph" active={false} />
                    <ToolBtn onClick={() => onInsertBlock('quote')} icon={<Quote size={17} strokeWidth={2.5} />} tooltip="Add Quote" active={false} />
                    <div className="w-px h-6 bg-slate-700 mx-1.5" />
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <ToolBtn onClick={() => fileInputRef.current?.click()} icon={<ImageIcon size={17} strokeWidth={2.5} />} tooltip="Insert Image" active={false} />
                </div>

                {/* Block Type Section - Only when block selected */}
                {textBlock && (
                    <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2 shadow-md hover:shadow-lg transition-shadow shrink-0">
                        <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest mr-1">Type</span>
                        <ToolBtn
                            onClick={() => handleChangeType('chapter')}
                            icon={<Heading1 size={17} strokeWidth={2.5} />}
                            tooltip="Chapter"
                            active={textBlock.type === 'chapter'}
                        />
                        <ToolBtn
                            onClick={() => handleChangeType('heading')}
                            icon={<Heading2 size={17} strokeWidth={2.5} />}
                            tooltip="Heading"
                            active={textBlock.type === 'heading'}
                        />
                        <ToolBtn
                            onClick={() => handleChangeType('paragraph')}
                            icon={<Type size={17} strokeWidth={2.5} />}
                            tooltip="Paragraph"
                            active={textBlock.type === 'paragraph'}
                        />
                        <ToolBtn
                            onClick={() => handleChangeType('quote')}
                            icon={<Quote size={17} strokeWidth={2.5} />}
                            tooltip="Quote"
                            active={textBlock.type === 'quote'}
                        />
                    </div>
                )}

                {/* Font & Size Selection - Only when block selected */}
                {textBlock && (
                    <div className="flex items-center gap-2">
                        {/* Font Dropdown */}
                        <div className="relative shrink-0">
                            <button
                                onClick={() => setShowFontDropdown(!showFontDropdown)}
                                className="flex items-center gap-3 px-5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md min-w-[180px] active:scale-95"
                            >
                                <Type size={16} className="text-teal-300" />
                                <span className="truncate flex-1 text-left">{(textBlock as any).font || 'Default Font'}</span>
                                <ChevronDown size={15} className={`text-slate-400 transition-transform duration-300 ${showFontDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showFontDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/30 z-50 py-2 max-h-72 overflow-y-auto backdrop-blur-xl">
                                    {FONT_OPTIONS.map(font => (
                                        <button
                                            key={font.value}
                                            onClick={() => handleFontChange(font.value)}
                                            className="w-full px-5 py-3 text-left text-sm font-medium text-slate-100 hover:bg-slate-800 hover:text-teal-200 transition-all duration-200 border-b border-slate-800 last:border-0 hover:scale-105 hover:shadow-sm active:scale-95"
                                            style={{ fontFamily: font.value }}
                                        >
                                            {font.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Font Size Dropdown */}
                        <select
                            className="ml-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
                            value={textBlock.fontSize || 12}
                            onChange={e => onUpdateBlock && onUpdateBlock(textBlock.id, { fontSize: Number(e.target.value) })}
                        >
                            {[10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64].map(size => (
                                <option key={size} value={size}>{size} pt</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Block Actions - Only when block selected */}
                {selectedBlock && (
                    <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2 shadow-md hover:shadow-lg transition-shadow ml-auto shrink-0">
                        <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest mr-1">Actions</span>
                        <ToolBtn onClick={() => handleMove('up')} icon={<MoveUp size={17} strokeWidth={2.5} />} tooltip="Move Up (Alt+↑)" active={false} />
                        <ToolBtn onClick={() => handleMove('down')} icon={<MoveDown size={17} strokeWidth={2.5} />} tooltip="Move Down (Alt+↓)" active={false} />
                        <div className="w-px h-6 bg-slate-300/50 mx-1.5" />
                        <ToolBtn onClick={handleDuplicate} icon={<Copy size={17} strokeWidth={2.5} />} tooltip="Duplicate (Ctrl+D)" active={false} />
                        <ToolBtn onClick={handleDelete} icon={<Trash2 size={17} strokeWidth={2.5} />} tooltip="Delete (Delete)" active={false} className="hover:!text-red-600 hover:!bg-red-50" />
                    </div>
                )}

                {/* Empty state hint */}
                {!selectedBlock && (
                    <div className="ml-auto flex items-center gap-2 text-sm text-slate-300 italic shrink-0 bg-slate-800/70 px-4 py-2 rounded-xl border border-slate-700">
                        <Minus size={14} className="text-slate-500" />
                        <span>Select a block from the outline to edit</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const ToolBtn: React.FC<{
    onClick: () => void,
    icon: React.ReactNode,
    tooltip?: string,
    active?: boolean,
    className?: string
}> = ({ onClick, icon, tooltip, active, className = '' }) => (
    <button
        onClick={onClick}
        title={tooltip}
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 active:scale-90 ${active
                ? 'bg-slate-800 text-teal-300 shadow-md shadow-black/30 scale-110 border border-teal-500/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-teal-200 hover:shadow-sm hover:scale-110'
            } ${className}`}
    >
        {icon}
    </button>
);

export default Toolbar;
