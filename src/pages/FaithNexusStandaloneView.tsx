import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe, Shield, MonitorPlay, TerminalSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeStudio } from '@/components/CodeStudio';

const FaithNexusStandaloneView = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-[0.4em] px-4 py-1">Microsite Preview</Badge>
                    <div className="space-y-1">
                        <h2 className="text-5xl font-serif font-black tracking-tight text-white">
                            Faith Nexus <span className="text-gold">Standalone</span>
                        </h2>
                        <p className="text-xl text-slate-400 font-light max-w-2xl">
                            High-fidelity isolated landing page. Orchestrating the Digital Renaissance via standalone archetypes.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => window.open('https://faithnexusvirtualaunch.digital/', '_blank')}
                        className="h-14 px-10 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-xl"
                    >
                        <ExternalLink className="w-5 h-5 mr-3" />
                        Open Live Site
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="preview" className="w-full space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-6 pt-2">
                    <TabsList className="bg-[#0F172A]/80 border border-white/5 h-14 p-1 rounded-xl">
                        <TabsTrigger value="preview" className="rounded-lg h-full data-[state=active]:bg-primary data-[state=active]:text-black text-slate-400 font-bold px-8 uppercase tracking-widest text-[11px]">
                            <MonitorPlay className="w-4 h-4 mr-2" />
                            Live Preview
                        </TabsTrigger>
                        <TabsTrigger value="code" className="rounded-lg h-full data-[state=active]:border-2 data-[state=active]:border-purple-500 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400 text-slate-400 font-bold px-8 uppercase tracking-widest text-[11px] shadow-[0_0_15px_rgba(168,85,247,0)] data-[state=active]:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                            <TerminalSquare className="w-4 h-4 mr-2" />
                            AI Code Studio
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="preview" className="space-y-6 m-0 outline-none">
                    {/* Embedded View */}
            <Card className="glass border-white/5 overflow-hidden h-[800px] relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />
                <CardContent className="p-0 h-full">
                    <iframe
                        src="https://faithnexusvirtualaunch.digital/"
                        title="Faith Nexus Standalone"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </CardContent>
            </Card>

            {/* Environment Status */}
            <div className="flex items-center gap-4 p-6 bg-green-500/5 border border-green-500/10 rounded-2xl">
                <Shield className="w-6 h-6 text-green-500 shrink-0" />
                <p className="text-sm text-green-200/70">
                    <span className="font-bold text-green-500">Live Environment Connected:</span> Securely embedding the high-fidelity standalone environment directly from the edge network.
                </p>
            </div>
            </TabsContent>

            <TabsContent value="code" className="m-0 outline-none">
                <CodeStudio />
            </TabsContent>
            </Tabs>
        </div>
    );
};

export default FaithNexusStandaloneView;
