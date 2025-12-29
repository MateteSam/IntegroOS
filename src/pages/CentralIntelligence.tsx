import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, LineChart, Globe, Sparkles } from 'lucide-react';
import { DashboardStats } from '@/components/DashboardStats';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import BusinessIntelligence from '@/components/BusinessIntelligence';

export default function CentralIntelligence() {
    const { activeProject } = useProject();
    const [activeProtocol, setActiveProtocol] = useState('command-center');

    return (
        <div className="h-full flex flex-col space-y-6 p-8 animate-in fade-in duration-500">
            {/* Intelligence Header */}
            <div className="relative flex items-center justify-between p-6 rounded-2xl overflow-hidden bg-card border border-border/50">
                {/* Background simplified to plain themed color */}

                <div className="space-y-1 relative z-10">
                    <h1 className="text-3xl font-playfair font-bold text-foreground flex items-center gap-3">
                        <Brain className="h-8 w-8 text-amber-400" />
                        Central Intelligence
                    </h1>
                    <p className="text-muted-foreground font-inter">
                        Monitor commercial performance and market dynamics.
                        <span className="ml-4 px-3 py-1 rounded-full bg-accent/5 border border-border text-xs text-amber-500 font-medium backdrop-blur-md">
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
                            value="command-center"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-400 data-[state=active]:text-amber-400 text-muted-foreground hover:text-foreground rounded-none px-2 py-4 h-auto font-playfair text-lg transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <LineChart className="h-5 w-5" />
                                Command Center
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="market-intel"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-400 data-[state=active]:text-amber-400 text-muted-foreground hover:text-foreground rounded-none px-2 py-4 h-auto font-playfair text-lg transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Market Intelligence
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Protocol Interfaces */}
                <div className="flex-1 overflow-auto">

                    <TabsContent value="command-center" className="space-y-8 m-0 p-0 border-none outline-none data-[state=active]:animate-in data-[state=active]:zoom-in-95 duration-300">
                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-playfair font-semibold text-foreground mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    Key Performance Indicators
                                </h2>
                                <DashboardStats />
                            </section>

                            <section className="glass-sovereign-card rounded-xl p-6">
                                <h2 className="text-xl font-playfair font-semibold text-foreground mb-6">Analytics Overview</h2>
                                <AnalyticsDashboard />
                            </section>
                        </div>
                    </TabsContent>

                    <TabsContent value="market-intel" className="h-full m-0 p-0 border-none outline-none data-[state=active]:animate-in data-[state=active]:zoom-in-95 duration-300">
                        <div className="glass-sovereign-card rounded-xl p-6 min-h-[600px]">
                            <BusinessIntelligence />
                        </div>
                    </TabsContent>

                </div>
            </Tabs>
        </div>
    );
}
