
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import randomColor from 'randomcolor';
import { 
    Bold, Italic, List, ListOrdered, Undo, Redo, Sparkles, X, Wand2, 
    History as HistoryIcon, Heading1, Heading2, Heading3, Quote, 
    Check, ChevronDown, AlignLeft, AlignCenter, AlignRight, Type,
    Maximize2, Minimize2, Palette, FileText, Underline as UnderlineIcon,
    Link as LinkIcon, Image as ImageIcon, AlignJustify, Users, Highlighter
} from 'lucide-react';
import { improveText } from '../services/aiService';
import { FONTS, loadFonts } from '../utils/fonts';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    aiEnabled?: boolean;
    onGenerateAI?: () => void;
    collaborationProvider?: any; // External provider
    collaborationId?: string; // ID to auto-create provider
    username?: string; // For cursor label
    readOnly?: boolean;
    minHeight?: string;
    hideToolbar?: boolean;
    extensions?: any[];
}

interface Version {
    id: string;
    timestamp: Date;
    content: string;
    label: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    onBlur,
    placeholder,
    className = '',
    style = {},
    aiEnabled = true,
    onGenerateAI,
    collaborationProvider,
    collaborationId,
    username = 'User',
    readOnly = false,
    minHeight = '150px',
    hideToolbar = false,
    extensions = []
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [versions, setVersions] = useState<Version[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeFont, setActiveFont] = useState(FONTS[0]);
    const [internalProvider, setInternalProvider] = useState<any>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const activeProvider = collaborationProvider || internalProvider;

    useEffect(() => {
        loadFonts();
    }, []);

    useEffect(() => {
        if (collaborationId && !collaborationProvider) {
            const ydoc = new Y.Doc();
            const provider = new HocuspocusProvider({
                url: 'ws://localhost:3001/collaboration',
                name: collaborationId,
                document: ydoc,
            });
            setInternalProvider(provider);

            return () => {
                provider.destroy();
            };
        }
    }, [collaborationId, collaborationProvider]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: !activeProvider, // Disable local history if collaborating
            }),
            TextStyle,
            Color,
            FontFamily,
            Highlight.configure({ multicolor: true }),
            Image,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            activeProvider ? Collaboration.configure({
                document: activeProvider.document,
            }) : undefined,
            activeProvider ? CollaborationCursor.configure({
                provider: activeProvider,
                user: {
                    name: username,
                    color: randomColor(),
                },
            }) : undefined,
            ...extensions
        ].filter(Boolean),
        content: value,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onFocus: () => setIsFocused(true),
        onBlur: ({ event }) => {
            // Prevent closing if clicking inside the toolbar or bubble menu (which might be ported)
            const relatedTarget = event.relatedTarget as HTMLElement;
            
            // Check if focus moved to something inside our container
            if (containerRef.current?.contains(relatedTarget)) {
                return;
            }

            // Check if focus moved to a Tippy tooltip (BubbleMenu)
            if (relatedTarget?.closest('[data-tippy-root]')) {
                return;
            }

            setIsFocused(false);
            onBlur?.();
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm md:prose-base focus:outline-none max-w-none w-full h-full p-4',
                style: `min-height: ${minHeight}; font-family: ${activeFont.value}`
            }
        }
    }, [activeProvider]);

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== undefined) {
            const currentHTML = editor.getHTML();
            if (currentHTML !== value) {
                // Prevent infinite loops on empty/initial
                if (value === '' && currentHTML === '<p></p>') return;
                
                // Only update if not focused to avoid cursor jumping
                // Or if we have a collaborative provider, we might rely on Yjs instead
                if (!editor.isFocused && !collaborationProvider) {
                    editor.commands.setContent(value);
                }
            }
        }
    }, [value, editor, collaborationProvider]);

    // History Management
    const saveVersion = useCallback((label: string) => {
        if (!editor) return;
        const content = editor.getHTML();
        setVersions(prev => [
            {
                id: Date.now().toString(),
                timestamp: new Date(),
                content,
                label
            },
            ...prev.slice(0, 19) // Keep last 20
        ]);
    }, [editor]);

    const restoreVersion = (version: Version) => {
        if (!editor) return;
        saveVersion(`Before restore: ${version.label}`);
        editor.commands.setContent(version.content);
        onChange(version.content);
        setShowHistory(false);
    };

    // AI Functions
    const handleAiAction = async (instruction: string, label: string) => {
        if (!editor || isAiProcessing) return;
        
        setIsAiProcessing(true);
        saveVersion(`Before AI: ${label}`);
        
        try {
            // If selection, only process selection?
            // For now, let's process the whole text or selection if meaningful
            // Tiptap selection:
            const { from, to, empty } = editor.state.selection;
            const textToProcess = empty ? editor.getText() : editor.state.doc.textBetween(from, to, ' ');
            
            if (!textToProcess.trim()) {
                setIsAiProcessing(false);
                return;
            }

            const improved = await improveText(textToProcess, instruction);
            
            if (empty) {
                editor.commands.setContent(improved);
            } else {
                editor.commands.insertContent(improved);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAiProcessing(false);
        }
    };

    const addImage = useCallback(() => {
        const url = window.prompt('URL');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    const ToolbarButton = ({ onClick, isActive = false, disabled = false, icon: Icon, title }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded-lg transition-all ${
                isActive 
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
            title={title}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div 
            ref={containerRef}
            className={`
                flex flex-col bg-white rounded-xl border transition-all duration-300
                ${isFocused ? 'border-indigo-500 shadow-lg ring-4 ring-indigo-500/10' : 'border-slate-200 shadow-sm'}
                ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}
                ${className}
            `}
            style={style}
        >
            {/* Main Toolbar */}
            {!hideToolbar && (
            <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm shrink-0 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().undo().run()} 
                        disabled={!editor.can().undo()} 
                        icon={Undo} 
                        title="Undo" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().redo().run()} 
                        disabled={!editor.can().redo()} 
                        icon={Redo} 
                        title="Redo" 
                    />
                     {/* History Dropdown */}
                     <div className="relative">
                        <ToolbarButton 
                            onClick={() => setShowHistory(!showHistory)} 
                            isActive={showHistory}
                            icon={HistoryIcon} 
                            title="Version History" 
                        />
                        {showHistory && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">History</span>
                                    <button onClick={() => setShowHistory(false)}><X size={14} className="text-slate-400 hover:text-red-500" /></button>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-1">
                                    {versions.length === 0 ? (
                                        <div className="p-4 text-center text-slate-400 text-xs">No versions saved yet</div>
                                    ) : (
                                        versions.map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => restoreVersion(v)}
                                                className="w-full text-left p-2.5 hover:bg-indigo-50 rounded-lg text-sm group flex items-start gap-3 transition-colors"
                                            >
                                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md shrink-0">
                                                    <HistoryIcon size={12} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-slate-700 truncate">{v.label}</div>
                                                    <div className="text-slate-400 text-[10px] mt-0.5">{v.timestamp.toLocaleTimeString()}</div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 px-2 border-r border-slate-200">
                    <div className="relative group">
                         <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Type size={16} />
                            <span className="max-w-[80px] truncate">{activeFont.name}</span>
                            <ChevronDown size={14} className="opacity-50" />
                         </button>
                         <div className="absolute top-full left-0 mt-1 w-48 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-100 hidden group-hover:block z-50 p-1">
                            {FONTS.map(font => (
                                <button
                                    key={font.name}
                                    onClick={() => { 
                                        setActiveFont(font); 
                                        editor.chain().focus().setFontFamily(font.value).run();
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between ${activeFont.name === font.name ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}
                                    style={{ fontFamily: font.value }}
                                >
                                    {font.name}
                                    {activeFont.name === font.name && <Check size={14} />}
                                </button>
                            ))}
                         </div>
                    </div>

                    {/* Color Picker */}
                    <div className="relative group">
                        <button className="flex items-center gap-1 px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Text Color">
                            <Palette size={16} style={{ color: editor.getAttributes('textStyle').color }} />
                            <ChevronDown size={14} className="opacity-50" />
                        </button>
                        <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 hidden group-hover:block z-50 p-2">
                            <div className="grid grid-cols-4 gap-1">
                                {['#000000', '#4b5563', '#9ca3af', '#ffffff', '#dc2626', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777', '#be185d', '#0891b2'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => editor.chain().focus().setColor(color).run()}
                                        className={`w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform ${editor.isActive('textStyle', { color }) ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 px-2 border-r border-slate-200">
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleBold().run()} 
                        isActive={editor.isActive('bold')} 
                        icon={Bold} 
                        title="Bold (Ctrl+B)" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleItalic().run()} 
                        isActive={editor.isActive('italic')} 
                        icon={Italic} 
                        title="Italic (Ctrl+I)" 
                    />
                     <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleUnderline().run()} 
                        isActive={editor.isActive('underline')} 
                        icon={UnderlineIcon} 
                        title="Underline (Ctrl+U)" 
                    />
                     <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleHighlight().run()} 
                        isActive={editor.isActive('highlight')} 
                        icon={Highlighter} 
                        title="Highlight" 
                    />
                </div>

                <div className="flex items-center gap-1 px-2 border-r border-slate-200">
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().setTextAlign('left').run()} 
                        isActive={editor.isActive({ textAlign: 'left' })} 
                        icon={AlignLeft} 
                        title="Align Left" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().setTextAlign('center').run()} 
                        isActive={editor.isActive({ textAlign: 'center' })} 
                        icon={AlignCenter} 
                        title="Align Center" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().setTextAlign('right').run()} 
                        isActive={editor.isActive({ textAlign: 'right' })} 
                        icon={AlignRight} 
                        title="Align Right" 
                    />
                     <ToolbarButton 
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()} 
                        isActive={editor.isActive({ textAlign: 'justify' })} 
                        icon={AlignJustify} 
                        title="Justify" 
                    />
                </div>

                <div className="flex items-center gap-1 px-2 border-r border-slate-200">
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
                        isActive={editor.isActive('heading', { level: 1 })} 
                        icon={Heading1} 
                        title="Heading 1" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
                        isActive={editor.isActive('heading', { level: 2 })} 
                        icon={Heading2} 
                        title="Heading 2" 
                    />
                     <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleBulletList().run()} 
                        isActive={editor.isActive('bulletList')} 
                        icon={List} 
                        title="Bullet List" 
                    />
                     <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                        isActive={editor.isActive('orderedList')} 
                        icon={ListOrdered} 
                        title="Ordered List" 
                    />
                     <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                        isActive={editor.isActive('blockquote')} 
                        icon={Quote} 
                        title="Quote" 
                    />
                </div>
                
                 <div className="flex items-center gap-1 px-2 border-r border-slate-200">
                     <ToolbarButton 
                        onClick={setLink} 
                        isActive={editor.isActive('link')} 
                        icon={LinkIcon} 
                        title="Link" 
                    />
                     <ToolbarButton 
                        onClick={addImage} 
                        icon={ImageIcon} 
                        title="Image" 
                    />
                 </div>

                {/* AI Tools */}
                {aiEnabled && (
                    <div className="flex items-center gap-1 px-2 ml-auto">
                        {onGenerateAI && (
                             <button 
                                onClick={onGenerateAI}
                                className="mr-2 flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-emerald-700 hover:shadow-glow transition-all"
                                title="Generate content from metadata"
                            >
                                <Sparkles size={14} /> Generate
                            </button>
                        )}
                        <div className="relative group">
                            <button 
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all
                                    ${isAiProcessing 
                                        ? 'bg-slate-100 text-slate-400 cursor-wait' 
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-glow hover:scale-105'
                                    }
                                `}
                            >
                                <Sparkles size={14} className={isAiProcessing ? 'animate-spin' : ''} />
                                {isAiProcessing ? 'AI Working...' : 'AI Edit'}
                            </button>
                            
                            {!isAiProcessing && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 hidden group-hover:block z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        AI Actions
                                    </div>
                                    <div className="p-1">
                                        <button onClick={() => handleAiAction("Fix grammar and improve flow", "Grammar Fix")} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2">
                                            <Wand2 size={14} /> Improve Writing
                                        </button>
                                        <button onClick={() => handleAiAction("Make it shorter and more concise", "Shorten")} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2">
                                            <Minimize2 size={14} /> Shorten
                                        </button>
                                        <button onClick={() => handleAiAction("Expand and add more detail", "Expand")} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2">
                                            <Maximize2 size={14} /> Expand
                                        </button>
                                        <button onClick={() => handleAiAction("Make the tone more professional", "Professional Tone")} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2">
                                            <FileText size={14} /> Professional Tone
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="pl-2 border-l border-slate-200">
                    <ToolbarButton 
                        onClick={() => setIsFullscreen(!isFullscreen)} 
                        isActive={isFullscreen} 
                        icon={isFullscreen ? Minimize2 : Maximize2} 
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} 
                    />
                </div>
            </div>
            )}

            {/* Editor Area */}
            <div className={`flex-1 overflow-auto bg-white ${isFullscreen ? 'p-8 max-w-4xl mx-auto w-full' : ''}`} onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} className="h-full" />
            </div>
            
            {/* Bubble Menu for quick edits */}
            {editor && (
                <BubbleMenu 
                    editor={editor} 
                    tippyOptions={{ duration: 100, zIndex: 999, maxWidth: 600 }}
                    shouldShow={({ editor, from, to }) => {
                        return !editor.state.selection.empty && editor.isEditable && (to - from) > 0;
                    }}
                >
                    <div className="flex items-center gap-1 p-1 bg-white rounded-lg shadow-xl border border-slate-200 animate-in fade-in zoom-in-95" onMouseDown={(e) => e.preventDefault()}>
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('bold') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
                        >
                            <Bold size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('italic') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
                        >
                            <Italic size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('underline') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
                        >
                            <UnderlineIcon size={14} />
                        </button>
                         <button
                            onClick={setLink}
                            className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('link') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
                        >
                            <LinkIcon size={14} />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button
                            onClick={() => handleAiAction("Improve this text", "Quick Improve")}
                            className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700"
                        >
                            <Sparkles size={10} /> Improve
                        </button>
                    </div>
                </BubbleMenu>
            )}

            {/* Word Count / Stats Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] font-medium text-slate-400 flex justify-between items-center">
                <div className="flex gap-4">
                    <span>{editor.getText().split(/\s+/).filter(w => w.length > 0).length} words</span>
                    <span>{editor.getText().length} characters</span>
                </div>
                <div>
                    {isAiProcessing ? (
                        <span className="text-indigo-500 animate-pulse">AI is writing...</span>
                    ) : (
                        <span>{versions.length} versions saved</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RichTextEditor;
