import React, { useState, useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Highlighter, Link as LinkIcon, Save, X } from 'lucide-react';

interface InlineTextEditorProps {
    initialValue: string;
    storyBlockId: string;
    onSave: (storyBlockId: string, newText: string) => void;
    onCancel: () => void;
    style: React.CSSProperties;
    className?: string;
}

/**
 * InlineTextEditor - Richer inline editor with basic toolbar and paste cleanup
 */
const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
    initialValue,
    storyBlockId,
    onSave,
    onCancel,
    style,
    className
}) => {
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null);

    useEffect(() => {
        try {
            const ydoc = new Y.Doc();
            const prov = new HocuspocusProvider({
                url: 'ws://localhost:3001/collaboration',
                name: storyBlockId,
                document: ydoc,
            });
            setProvider(prov);
            return () => prov.destroy();
        } catch (e) {
            // Collaboration optional - fall back silently
            setProvider(null);
        }
    }, [storyBlockId]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Highlight.configure({ multicolor: true }),
            TextStyle,
            Color,
            Link.configure({ openOnClick: false }),
            // Collaboration only if provider exists
            ...(provider ? [Collaboration.configure({ document: (provider as any).document }), CollaborationCursor.configure({ provider, user: { name: 'User', color: '#ffcc00' } })] : []),
        ],
        content: initialValue,
        autofocus: true,
        onBlur: () => {
            const currentHtml = editor?.getHTML() || '';
            if (currentHtml !== initialValue) {
                onSave(storyBlockId, currentHtml);
            }
            onCancel();
        }
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                editor?.commands.blur();
                onCancel();
            } else if (e.key === 'Enter' && e.ctrlKey) {
                editor?.commands.blur();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editor]);

    const editorRef = useRef<HTMLDivElement | null>(null);

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        if (text && editor) {
            // Clean up pasted text: normalize line endings and trim
            const cleaned = text.replace(/\r\n?/g, '\n').trim();
            editor.commands.insertContent(cleaned.replace(/\n/g, '<br/>'));
        }
    };

    if (!editor) return null;

    return (
        <div style={{ width: '100%', zIndex: 10000 }}>
            <div className="inline-editor-toolbar p-1 rounded-t-lg bg-slate-900 border border-slate-700 flex gap-1 items-center shadow-xl">
                <ToolbarButton
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold"
                    icon={<Bold size={14} />}
                />
                <ToolbarButton
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic"
                    icon={<Italic size={14} />}
                />
                <ToolbarButton
                    active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline"
                    icon={<UnderlineIcon size={14} />}
                />
                <ToolbarButton
                    active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    title="Strikethrough"
                    icon={<Strikethrough size={14} />}
                />
                <ToolbarButton
                    active={editor.isActive('highlight')}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    title="Highlight"
                    icon={<Highlighter size={14} />}
                />
                <ToolbarButton
                    active={editor.isActive('code')}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    title="Code"
                    icon={<Code size={14} />}
                />

                <div className="w-px h-6 bg-slate-700 mx-1" />

                <ToolbarButton
                    onClick={() => {
                        const url = window.prompt('URL');
                        if (url) editor.chain().focus().setLink({ href: url }).run();
                    }}
                    title="Link"
                    icon={<LinkIcon size={14} />}
                />

                <div style={{ flex: 1 }} />

                <button
                    onMouseDown={(e) => { e.preventDefault(); const html = editor.getHTML() || ''; onSave(storyBlockId, html); editor.commands.blur(); }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold transition-colors"
                >
                    <Save size={12} /> SAVE
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); onCancel(); }}
                    className="p-1 rounded-md hover:bg-slate-800 text-slate-400"
                >
                    <X size={16} />
                </button>
            </div>

            <div ref={editorRef} onPaste={handlePaste}>
                <EditorContent
                    editor={editor}
                    style={{
                        ...style,
                        resize: 'none',
                        overflow: 'auto',
                        background: 'white',
                        color: '#1e293b',
                        border: '1px solid #334155',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        outline: 'none',
                        padding: '12px 16px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                        width: '100%',
                        minHeight: '1.5em',
                    }}
                    className={className}
                />
            </div>
        </div>
    );
};

export default InlineTextEditor;

const ToolbarButton: React.FC<{ active?: boolean; onClick: () => void; title: string; icon: React.ReactNode }> = ({ active, onClick, title, icon }) => (
    <button
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        title={title}
        className={`p-1.5 rounded transition-colors ${active ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-400'}`}
    >
        {icon}
    </button>
);
