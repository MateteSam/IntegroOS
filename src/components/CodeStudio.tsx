import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { FileCode, Save, Wand2, FolderOpen, RefreshCcw, Search, Sparkles, TerminalSquare } from 'lucide-react';

const REPO_PATH = 'C:/Users/admin/OneDrive/Documents/Billion Rands Filing Cabinet/WSCCC/landing_page_isolated';
const API_BASE = 'http://localhost:3001/api/fs';

interface FileNode {
  name: string;
  isDir: boolean;
  path: string;
}

export const CodeStudio = () => {
    const [files, setFiles] = useState<FileNode[]>([]);
    const [currentPath, setCurrentPath] = useState(REPO_PATH);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const fetchFiles = async (dir: string) => {
        try {
            const res = await fetch(`${API_BASE}/list?dir=${encodeURIComponent(dir)}`);
            if (!res.ok) throw new Error('Failed to fetch FS');
            const data = await res.json();
            const items = data.items.map((i: any) => ({
                name: i.name,
                isDir: i.isDir,
                path: `${dir}/${i.name}`
            }));
            setFiles(items.sort((a, b) => {
                if(a.isDir && !b.isDir) return -1;
                if(!a.isDir && b.isDir) return 1;
                return a.name.localeCompare(b.name);
            }));
        } catch (e: any) {
            toast.error('Local FS Error: ' + e.message);
        }
    };

    const navigateUp = () => {
        if (currentPath.length <= REPO_PATH.length) return;
        const parent = currentPath.substring(0, currentPath.lastIndexOf('/'));
        setCurrentPath(parent || REPO_PATH);
    };

    const loadFile = async (path: string) => {
        try {
            const res = await fetch(`${API_BASE}/read?path=${encodeURIComponent(path)}`);
            if (!res.ok) throw new Error('Failed to read file');
            const data = await res.json();
            setFileContent(data.content);
            setSelectedFile(path);
            setAiPrompt('');
        } catch (e: any) {
            toast.error('Read Error: ' + e.message);
        }
    };

    const saveFile = async () => {
        if (!selectedFile) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/write`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: selectedFile, content: fileContent })
            });
            if (!res.ok) throw new Error('Failed to save file');
            setLastSaved(new Date());
            toast.success('File saved to disk.');
        } catch (e: any) {
            toast.error('Write Error: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAIAssist = async () => {
        if (!selectedFile || !aiPrompt) return;
        setIsThinking(true);
        toast.info('AI is analyzing the codebase...', { id: 'ai' });
        
        try {
            // Simulated AI request for local dev (Since actual LLM requires keys/endpoints)
            // In a production environment, this would call Integro's internal LLM or Groq/OpenAI.
            await new Promise(r => setTimeout(r, 2000));
            
            // Simple mock manipulation
            const newContent = `/* 
 * [AI Auto-Generated Modification] 
 * Prompt: ${aiPrompt}
 * Date: ${new Date().toISOString()}
 */\n` + fileContent;
            
            setFileContent(newContent);
            toast.success('AI generation complete. Review changes in the editor.', { id: 'ai' });
            setAiPrompt('');
        } catch (e) {
            toast.error('AI Processing Failed.', { id: 'ai' });
        } finally {
            setIsThinking(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentPath);
    }, [currentPath]);

    return (
        <Card className="glass border-white/5 overflow-hidden h-[800px] flex flex-col relative text-white">
            <div className="flex items-center justify-between p-4 bg-[#0F172A]/80 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <TerminalSquare className="w-5 h-5 text-primary" />
                    <h3 className="font-serif font-bold tracking-tight">Integrated Code Studio</h3>
                    <Badge variant="outline" className="border-primary/30 text-primary ml-2 text-[10px]">LOCAL REPO</Badge>
                </div>
                {selectedFile && (
                    <div className="flex items-center gap-2">
                        {lastSaved && <span className="text-[10px] text-slate-500 mr-2">Saved {lastSaved.toLocaleTimeString()}</span>}
                        <Button 
                            variant="default" 
                            size="sm" 
                            onClick={saveFile}
                            disabled={isSaving}
                            className="bg-primary text-black font-bold h-8 flex items-center gap-2"
                        >
                            {isSaving ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Write Disk
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden h-full">
                {/* File Explorer Sidebar */}
                <div className="w-64 bg-slate-950 border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-2 border-b border-white/5 sticky top-0 bg-slate-950 z-10">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 truncate">
                            {currentPath.split('/').pop()}
                        </div>
                        {currentPath.length > REPO_PATH.length && (
                            <Button variant="ghost" size="sm" onClick={navigateUp} className="w-full justify-start text-xs h-7 text-slate-400">
                                ↖ .. (Up Directory)
                            </Button>
                        )}
                    </div>
                    <div className="p-1">
                        {files.map(f => (
                            <button
                                key={f.path}
                                onClick={() => f.isDir ? setCurrentPath(f.path) : loadFile(f.path)}
                                className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center gap-2 ${selectedFile === f.path ? 'bg-primary/20 text-primary font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                {f.isDir ? <FolderOpen className="w-3.5 h-3.5 text-amber-500" /> : <FileCode className="w-3.5 h-3.5" />}
                                <span className="truncate">{f.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col bg-[#0f172a]">
                    {selectedFile ? (
                        <>
                            <div className="flex-1 relative">
                                <textarea
                                    title="File Editor"
                                    className="w-full h-full bg-slate-900 text-slate-300 p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none custom-scrollbar"
                                    value={fileContent}
                                    onChange={e => setFileContent(e.target.value)}
                                    spellCheck={false}
                                />
                            </div>
                            
                            {/* AI Assist Toolbar */}
                            <div className="p-4 bg-slate-950 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                                        <Input 
                                            placeholder="Ask AI to modify this file (e.g., 'Make the hero title bolder and gold')"
                                            value={aiPrompt}
                                            onChange={e => setAiPrompt(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAIAssist()}
                                            className="h-12 pl-10 bg-white/5 border-purple-500/30 focus:border-purple-500 w-full placeholder:text-slate-500"
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleAIAssist}
                                        disabled={!aiPrompt || isThinking}
                                        className="h-12 px-6 bg-gradient-to-r from-purple-600 to-primary text-white font-bold rounded-xl"
                                    >
                                        {isThinking ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                        Initialize Prompt
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 space-y-4 text-center">
                            <TerminalSquare className="w-16 h-16 opacity-20" />
                            <div>
                                <h4 className="font-bold text-white text-lg">No File Selected</h4>
                                <p className="text-sm mt-1">Select a file from the explorer to begin editing the source code.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
