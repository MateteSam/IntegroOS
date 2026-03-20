import React from 'react';
import { MicrositeLayout } from '@/components/layout/MicrositeLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv, Zap, Globe, Users, Play, Radio, Share2, Sparkles } from 'lucide-react';

export default function TalkWorldMicrosite() {
    return (
        <MicrositeLayout logo="/images/branding/talkworld/logo_primary.png">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#050A15]">
                <div className="absolute inset-0 z-0 opacity-20"
                    style={{
                        background: 'radial-gradient(circle at center, #3B82F6 0%, transparent 70%)',
                        filter: 'blur(100px)'
                    }}
                />

                <div className="container relative z-10 px-6 mx-auto flex flex-col items-center text-center">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-8 max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <Radio className="h-4 w-4 text-blue-400 animate-pulse" />
                            <span className="text-blue-400 font-bold text-xs uppercase tracking-[0.3em]">Neural TV Infrastructure</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-playfair font-black text-white leading-none tracking-tight">
                            Talk<span className="text-blue-500">World</span>
                        </h1>

                        <p className="text-2xl md:text-3xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                            Don't just broadcast. <br />
                            <span className="text-white font-medium italic">Interact. Integrate. Impact.</span>
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 pt-4">
                            <Button size="lg" className="h-16 px-12 text-lg bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] font-bold rounded-full">
                                <Play className="mr-2 h-5 w-5 fill-current" /> Initialize Stream
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 px-12 text-lg border-blue-500/50 text-blue-400 hover:bg-blue-500/5 font-bold rounded-full">
                                Partner Portal
                            </Button>
                        </div>
                    </div>

                    <div className="mt-20 w-full max-w-5xl animate-in fade-in zoom-in duration-1000 delay-500">
                        <div className="relative group p-1 bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-blue-500/20 rounded-3xl">
                            <img
                                src="/images/branding/talkworld/logo_primary.png"
                                alt="TalkWorld Platform"
                                className="w-full h-auto rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Global Simulcast Countdown */}
            <section className="py-20 bg-blue-600 relative overflow-hidden">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-white space-y-4">
                        <Badge className="bg-white/20 text-white border-white/30 px-4 py-1 font-black tracking-widest">LAUNCH EVENT</Badge>
                        <h2 className="text-5xl font-playfair font-black">The Global Simulcast</h2>
                        <p className="text-xl opacity-90 font-light">Join the multi-platform broadcast reveal of the TalkWorld ecosystem.</p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-6">
                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[100px]">
                                <span className="block text-4xl font-black text-white">27</span>
                                <span className="text-xs uppercase tracking-tighter opacity-70">February</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[100px]">
                                <span className="block text-4xl font-black text-white">12:00</span>
                                <span className="text-xs uppercase tracking-tighter opacity-70">CAT Time</span>
                            </div>
                        </div>
                        <Button variant="secondary" className="h-14 px-10 bg-white text-blue-600 font-black rounded-full hover:bg-slate-100 transition-colors">
                            Add to Calendar
                        </Button>
                    </div>
                </div>
            </section>

            {/* Neural TV Strategy */}
            <section className="py-32 bg-background">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="absolute -inset-10 bg-blue-500/5 rounded-full blur-3xl" />
                            <Card className="glass-sovereign border-blue-500/20 overflow-hidden rounded-3xl shadow-2xl rotate-1 group hover:rotate-0 transition-transform duration-500">
                                <CardContent className="p-4">
                                    <div className="bg-slate-900 rounded-2xl p-8 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <Badge variant="outline" className="border-blue-500/30 text-blue-400">FEATURE ARTICLE</Badge>
                                            <Sparkles className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <h3 className="text-3xl font-playfair font-bold text-white">The Rise of Neural TV</h3>
                                        <p className="text-slate-400 font-light italic">"TalkWorld marks the fundamental shift from traditional broadcasting to AI-orchestrated interaction..."</p>
                                        <Button variant="link" className="text-blue-400 p-0 h-auto font-bold text-lg hover:text-blue-300">Read the Manifesto →</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="order-1 lg:order-2 space-y-8">
                            <h3 className="text-blue-500 font-bold tracking-[0.3em] uppercase">The Platform Paradigm</h3>
                            <h2 className="text-5xl font-playfair font-black leading-tight text-foreground">
                                Why February 27 <br /> Changes Everything.
                            </h2>
                            <div className="space-y-6 text-xl text-muted-foreground font-light leading-relaxed">
                                <p>TalkWorld isn't just a platform; it's a fundamental shift. We move from one-way signals to neural conversations.</p>
                                <div className="grid sm:grid-cols-2 gap-8 pt-6">
                                    <div className="space-y-3">
                                        <Zap className="h-8 w-8 text-blue-500" />
                                        <h4 className="font-bold text-foreground">Real-Time Synthesis</h4>
                                        <p className="text-sm">Automated transcription and translation across 50+ languages.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <Users className="h-8 w-8 text-blue-500" />
                                        <h4 className="font-bold text-foreground">Sovereign Channels</h4>
                                        <p className="text-sm">Own your audience, your data, and your creative narrative.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategic Call to Action */}
            <section className="py-32 bg-[#050A15] relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <h2 className="text-5xl md:text-7xl font-playfair font-black text-white mb-8">
                        Ready to <span className="text-blue-500 italic">Command</span> Your Narrative?
                    </h2>
                    <p className="text-xl text-slate-400 font-light mb-12 max-w-2xl mx-auto">
                        Be among the first 100 organizations to secure a Neural Channel trial. Phase 1 onboarding starts Feb 14.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="h-16 px-12 bg-blue-600 rounded-full text-lg font-bold shadow-blue">
                            Join the Anchor Program
                        </Button>
                        <Button variant="outline" className="h-16 px-12 border-white/20 text-white rounded-full text-lg font-bold hover:bg-white/5">
                            Platform Blueprint
                        </Button>
                    </div>
                </div>
            </section>
        </MicrositeLayout>
    );
}
