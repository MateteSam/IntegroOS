import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Undo, Redo, Sparkles, X, Wand2, History as HistoryIcon } from 'lucide-react';

interface JacketTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    onGenerateAI?: () => void;
    onImproveAI?: () => void;
    isGenerating?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

interface Version {
    id: string;
    timestamp: Date;
    content: string;
    label: string;
}

const JacketTextEditor: React.FC<JacketTextEditorProps> = ({
    value,
    onChange,
    onBlur,
    onGenerateAI,
    onImproveAI,
    isGenerating = false,
    style,
    className
}) => {
    const [versions, setVersions] = React.useState<Version[]>([]);
    const [showHistory, setShowHistory] = React.useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-invert focus:outline-none max-w-none w-full h-full',
                style: 'min-height: 100px;'
            }
        },
        autofocus: true
    });

    // Save version helper
    const saveVersion = (label: string) => {
        if (!editor) return;
        const content = editor.getHTML();
        setVersions(prev => [
            {
                id: Date.now().toString(),
                timestamp: new Date(),
                content,
                label
            },
            ...prev.slice(0, 9) // Keep last 10
        ]);
    };

    // Handle AI generation with version saving
    const handleGenerateAI = () => {
        saveVersion('Before AI Generation');
        onGenerateAI?.();
    };

    const handleImproveAI = () => {
        saveVersion('Before AI Improvement');
        onImproveAI?.();
    };

    const restoreVersion = (version: Version) => {
        if (!editor) return;
        // onChange will be called by editor update, but we want to be explicit
        editor.commands.setContent(version.content);
        onChange(version.content);
        setShowHistory(false);
    };

    // Force update when AI generation finishes or value changes externally
    useEffect(() => {
        if (editor && value !== undefined) {
             const currentHTML = editor.getHTML();
             if (currentHTML !== value) {
                 if (value === '' && currentHTML === '<p></p>') return;
                 
                 if (!editor.isFocused || isGenerating === false) {
                     // If coming from AI (likely), we might want to save the *new* version too?
                     // But usually we save *before* change.
                     // Use insertContent to try to preserve history stack if possible, 
                     // but setContent is more reliable for full replacement.
                     editor.commands.setContent(value);
                 }
             }
        }
    }, [value, editor, isGenerating]);


    if (!editor) {
        return null;
    }

    return (
        <div className={`flex flex-col h-full bg-slate-950/70 text-slate-100 rounded-lg shadow-2xl shadow-cyan-500/10 border border-slate-800 overflow-hidden backdrop-blur ${className}`} style={{ ...style, pointerEvents: 'auto' }}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-800 bg-slate-950/70 shrink-0 overflow-x-auto scrollbar-thin relative backdrop-blur shadow-inner shadow-cyan-500/5">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${editor.isActive('bold') ? 'bg-cyan-500/20 text-cyan-100' : 'text-slate-300'}`}
                    title="Bold"
                >
                    <Bold size={14} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${editor.isActive('italic') ? 'bg-cyan-500/20 text-cyan-100' : 'text-slate-300'}`}
                    title="Italic"
                >
                    <Italic size={14} />
                </button>
                <div className="w-px h-4 bg-slate-800 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${editor.isActive('bulletList') ? 'bg-cyan-500/20 text-cyan-100' : 'text-slate-300'}`}
                    title="Bullet List"
                >
                    <List size={14} />
                </button>
                 <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${editor.isActive('orderedList') ? 'bg-cyan-500/20 text-cyan-100' : 'text-slate-300'}`}
                    title="Ordered List"
                >
                    <ListOrdered size={14} />
                </button>
                <div className="w-px h-4 bg-slate-800 mx-1" />
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-1.5 rounded hover:bg-slate-800 transition-colors text-slate-300 disabled:opacity-30"
                    title="Undo"
                >
                    <Undo size={14} />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-1.5 rounded hover:bg-slate-800 transition-colors text-slate-300 disabled:opacity-30"
                    title="Redo"
                >
                    <Redo size={14} />
                </button>
                
                {/* Version History Button */}
                <div className="relative ml-1">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${showHistory ? 'bg-cyan-500/20 text-cyan-100' : 'text-slate-300'}`}
                        title="Version History"
                    >
                        <HistoryIcon size={14} />
                    </button>
                    {showHistory && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-slate-950/95 rounded-lg shadow-2xl shadow-cyan-500/10 border border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur">
                            <div className="p-2 bg-slate-900/80 border-b border-slate-800 font-semibold text-xs text-slate-300 uppercase tracking-wider flex justify-between items-center">
                                <span>History</span>
                                <button onClick={() => setShowHistory(false)} className="hover:text-red-400"><X size={12} /></button>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {versions.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500 text-xs">No history yet</div>
                                ) : (
                                    versions.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => restoreVersion(v)}
                                            className="w-full text-left p-2 hover:bg-cyan-500/10 border-b border-slate-900 last:border-0 text-xs group text-slate-100"
                                        >
                                            <div className="font-medium text-slate-100">{v.label}</div>
                                            <div className="text-slate-500 text-[10px]">{v.timestamp.toLocaleTimeString()}</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {onGenerateAI && (
                    <button
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20"
                    >
                        <Sparkles size={12} className={isGenerating ? 'animate-spin' : ''} />
                        {isGenerating ? 'Writing...' : 'AI Write'}
                    </button>
                )}

                {onImproveAI && (
                    <button
                        onClick={handleImproveAI}
                        disabled={isGenerating}
                        className="ml-2 flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-colors shadow-lg shadow-fuchsia-500/20"
                        title="Improve with AI"
                    >
                        <Wand2 size={12} className={isGenerating ? 'animate-spin' : ''} />
                        {isGenerating ? 'Improving...' : 'Improve'}
                    </button>
                )}
                
                <button
                    onClick={onBlur}
                    className="ml-2 p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-300 transition-colors"
                    title="Close Editor"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto p-3 cursor-text text-left bg-slate-950/40" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
};

export default JacketTextEditor;
