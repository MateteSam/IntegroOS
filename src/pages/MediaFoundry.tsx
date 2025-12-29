import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Video, Sparkles } from 'lucide-react';
import AIBrandStudio from './AIBrandStudio';
import VideoStudio from '@/components/VideoStudio';
import { Card } from '@/components/ui/card';

export default function MediaFoundry() {
    const { activeProject } = useProject();
    const [activeProtocol, setActiveProtocol] = useState('visuals');

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
                        Media Foundry
                    </h1>
                    <p className="text-muted-foreground font-inter">
                        Forge visual identity and cinematic motion.
                        <span className="ml-4 px-3 py-1 rounded-full bg-accent/10 border border-primary/20 text-xs text-primary font-medium backdrop-blur-md">
                            Active Protocol: {activeProtocol.toUpperCase()}
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
