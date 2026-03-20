import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen,
    Sparkles,
    PenTool,
    Library,
    Layout,
    Download,
    ChevronRight,
    Wand2,
    FileText,
    Settings,
    MessageSquare,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectRegistry } from '@/contexts/ProjectRegistry';
import { cn } from '@/lib/utils';

const BookArchitectStudio = () => {
    const { activeProject } = useProjectRegistry();
    const [activeTab, setActiveTab] = useState('manuscript');
    const [manuscriptContent, setManuscriptContent] = useState(`
        <h1 class="text-4xl font-serif font-black mb-8">Chapter 1: The Sovereign Heart</h1>
        <p class="text-xl leading-relaxed text-slate-300 mb-6">
            In the heart of the Digital Renaissance, we find ourselves at the intersection of ancient truth and futuristic capability...
        </p>
    `);

    const stats = [
        { label: 'Words Generated', value: '12,450', icon: Sparkles, color: 'text-primary' },
        { label: 'Chapters Outlined', value: '8/12', icon: Layout, color: 'text-blue-500' },
        { label: 'Asset Synergy', value: '94%', icon: Wand2, color: 'text-amber-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-foreground">BookArchitect-AI</h2>
                    </div>
                    <p className="text-muted-foreground max-w-xl">
                        Author's Command Center for {activeProject?.name || 'Sovereign Content'}.
                        Orchestrating manuscripts with imperial precision.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-border hover:bg-accent/5">
                        <Save className="w-4 h-4 mr-2" />
                        Save Blueprint
                    </Button>
                    <Button className="gradient-primary text-primary-foreground font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                        <Download className="w-4 h-4 mr-2" />
                        Export Manuscript
                    </Button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-card/30 border-border/50 backdrop-blur-sm overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                    <p className="text-3xl font-serif font-bold text-foreground">{stat.value}</p>
                                </div>
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-accent/5 group-hover:scale-110 transition-transform", stat.color)}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Workbench */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="bg-card/50 border-border border-none shadow-none bg-transparent">
                        <CardContent className="p-0 space-y-2">
                            {[
                                { id: 'manuscript', label: 'Manuscript Editor', icon: PenTool },
                                { id: 'outliner', label: 'Story Outliner', icon: Layout },
                                { id: 'library', label: 'Asset Library', icon: Library },
                                { id: 'intelligence', label: 'AI Co-Author', icon: Sparkles },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-3 w-full p-4 rounded-xl transition-all text-sm font-bold uppercase tracking-widest",
                                        activeTab === tab.id
                                            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                                    )}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border border-primary/10 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-20 h-20 text-primary" />
                        </div>
                        <h4 className="text-sm font-serif font-bold text-primary mb-2">Neural Insight</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                            "Your Brand Voice is currently indexed at 98% Sovereign. Consider deepening the Hebraic metaphors in Chapter 3 for maximum alignment."
                        </p>
                    </Card>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-9 space-y-6">
                    <Card className="glass-sovereign border-border/50 min-h-[600px] flex flex-col">
                        <CardHeader className="border-b border-border/50 px-8 py-6 flex flex-row items-center justify-between bg-accent/5">
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="border-primary/30 text-primary uppercase tracking-widest text-[10px]">Active Session</Badge>
                                <CardTitle className="text-xl font-serif">Sovereign Manuscript Editor</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex-1">
                            <div
                                className="prose prose-invert max-w-none focus:outline-none min-h-[400px]"
                                contentEditable
                                dangerouslySetInnerHTML={{ __html: manuscriptContent }}
                            />
                        </CardContent>
                        <div className="p-6 border-t border-border/50 bg-accent/5 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                <span>Words: 1,245</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span>Reading Level: Advanced</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span>Tone: Sovereign / Imperial</span>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-[10px] uppercase tracking-widest font-black">
                                    Check Calibration
                                </Button>
                                <Button size="sm" className="h-8 gradient-primary text-primary-foreground text-[10px] uppercase tracking-widest font-black px-4">
                                    AI Assist
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BookArchitectStudio;
