import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Video, Sparkles, Grid, Download, Share2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AIBrandStudio from './AIBrandStudio';
import VideoStudio from '@/components/VideoStudio';
import { Card } from '@/components/ui/card';

export default function MediaFoundry() {
    const { activeProject } = useProject();
    const [activeProtocol, setActiveProtocol] = useState('assets');

    return (
        <div className="h-full flex flex-col space-y-6 p-8 animate-in fade-in duration-500">
            {/* Foundry Header */}
            <div className="relative flex items-center justify-between p-6 rounded-2xl overflow-hidden glass-sovereign border border-border/50">
                <div
                    className="absolute inset-0 z-0 opacity-60 dark:opacity-40"
                    style={{
                        backgroundImage: 'url(/images/media-hero.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-background via-background/50 to-transparent" />

                <div className="space-y-1 relative z-10">
                    <h1 className="text-3xl font-playfair font-bold text-foreground flex items-center gap-3">
                        <ImageIcon className="h-8 w-8 text-primary" />
                        Growth & Comms Agent
                    </h1>
                    <p className="text-muted-foreground font-inter">
                        Specialized AI Agent for content generation, packaging, and campaign scheduling.
                        <span className="ml-4 px-3 py-1 rounded-full bg-accent/10 border border-primary/20 text-xs text-primary font-medium backdrop-blur-md">
                            Protocol: {activeProtocol.toUpperCase()}
                        </span>
                    </p>
                </div>

                {/* Project Context Pill */}
                <div className="hidden md:flex items-center px-4 py-2 bg-accent/5 border border-border rounded-full backdrop-blur-md relative z-10 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
                    <span className="text-sm text-muted-foreground">
                        Operating on: <span className="text-foreground font-semibold">{activeProject?.name || 'No Active Project'}</span>
                    </span>
                </div>
            </div>

            {/* Protocol Selector (Tabs) */}
            <Tabs value={activeProtocol} onValueChange={setActiveProtocol} className="w-full flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8 border-b border-border pb-1">
                    <TabsList className="bg-transparent p-0 gap-8 h-auto">
                        <TabsTrigger
                            value="assets"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-400 data-[state=active]:text-amber-400 text-muted-foreground hover:text-foreground rounded-none px-2 py-4 h-auto font-playfair text-lg transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Grid className="h-5 w-5" />
                                Asset Library
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="visuals"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-400 data-[state=active]:text-amber-400 text-muted-foreground hover:text-foreground rounded-none px-2 py-4 h-auto font-playfair text-lg transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Visual Synthesis
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="motion"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-400 data-[state=active]:text-amber-400 text-muted-foreground hover:text-foreground rounded-none px-2 py-4 h-auto font-playfair text-lg transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Video className="h-5 w-5" />
                                Motion Lab
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Protocol Interfaces */}
                <div className="flex-1 overflow-auto rounded-xl glass-sovereign relative min-h-[600px]">

                    <TabsContent value="assets" className="h-full m-0 p-0 border-none outline-none data-[state=active]:animate-in data-[state=active]:zoom-in-95 duration-300">
                        <div className="p-6 h-full space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold">Global Asset Registry</h2>
                                    <p className="text-muted-foreground">Unified storage for approved campaign visuals.</p>
                                </div>
                                <Button className="gradient-primary"><Sparkles className="w-4 h-4 mr-2" /> Auto-Tag Library</Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[
                                    { url: '/images/branding/summit/faith_nexus_general_poster.png', name: 'Faith Nexus Poster', tags: ['summit', '2026', 'print'] },
                                    { url: '/images/branding/talkworld/logo_primary.png', name: 'TalkWorld Logo', tags: ['branding', 'primary'] },
                                    { url: '/images/content-hero.png', name: 'Content Hero BG', tags: ['ui', 'background'] },
                                    { url: '/images/media-hero.png', name: 'Media Foundry BG', tags: ['ui', 'background'] },
                                ].map((asset, i) => (
                                    <Card key={i} className="group overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-all">
                                        <div className="aspect-square relative flex items-center justify-center bg-black/20 overflow-hidden">
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-center items-center gap-2 backdrop-blur-sm">
                                                <Button size="sm" variant="secondary" className="w-32"><Download className="w-4 h-4 mr-2" /> Download</Button>
                                                <Button size="sm" variant="outline" className="w-32 text-white border-white/20 hover:bg-white/10"><Share2 className="w-4 h-4 mr-2" /> Copy Link</Button>
                                            </div>
                                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="p-3">
                                            <p className="font-semibold text-sm truncate" title={asset.name}>{asset.name}</p>
                                            <div className="flex gap-1 mt-2 overflow-x-auto pb-1 scrollbar-none">
                                                {asset.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary border-none">{tag}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="visuals" className="h-full m-0 p-0 border-none outline-none data-[state=active]:animate-in data-[state=active]:zoom-in-95 duration-300">
                        <div className="p-6 h-full">
                            <AIBrandStudio />
                        </div>
                    </TabsContent>

                    <TabsContent value="motion" className="h-full m-0 p-0 border-none outline-none data-[state=active]:animate-in data-[state=active]:zoom-in-95 duration-300">
                        <div className="p-6">
                            <VideoStudio />
                        </div>
                    </TabsContent>

                </div>
            </Tabs>
        </div>
    );
}
