import React from 'react';
import { MicrositeLayout } from '@/components/layout/MicrositeLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Calendar, Users, Zap, Shield, Sparkles, Tv, MessageSquare } from 'lucide-react';

export default function FaithNexusMicrosite() {
    return (
        <MicrositeLayout logo="/images/branding/summit/faith_nexus_general_poster.png">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0A0F1A]">
                {/* Neural Background Sweep */}
                <div className="absolute inset-0 z-0 opacity-30 animate-neural-pulse"
                    style={{
                        background: 'radial-gradient(circle at center, #D4AF37 0%, transparent 70%)',
                        filter: 'blur(120px)'
                    }}
                />

                {/* Hero Asset */}
                <div className="container relative z-10 px-6 mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-in slide-in-from-left duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">World Christian Content Creators Summit</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-playfair font-black text-white leading-none">
                            FAITH <span className="text-gold">NEXUS</span> <br />
                            <span className="text-4xl md:text-6xl opacity-80">2026</span>
                        </h1>

                        <p className="text-xl text-slate-300 font-light max-w-lg leading-relaxed">
                            Kingdom Voices. Global Reach. Join the gathering of Africa's most influential Christian creators, leaders, and reformers.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="h-16 px-10 text-lg bg-primary hover:scale-105 transition-all shadow-gold font-bold">
                                Secure Your Seat
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 px-10 text-lg border-primary/50 text-primary hover:bg-primary/5 font-bold">
                                View Blueprint
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white">20–23</span>
                                <span className="text-muted-foreground text-sm uppercase tracking-widest">October 2026</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white text-gold ">Pretoria</span>
                                <span className="text-muted-foreground text-sm uppercase tracking-widest">Moreleta Campus</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative group animate-in zoom-in duration-1000 delay-300">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-amber-600/20 rounded-2xl blur-2xl group-hover:opacity-100 transition-opacity opacity-50" />
                        <Card className="relative glass-sovereign border-primary/20 overflow-hidden rounded-2xl">
                            <CardContent className="p-2">
                                <img
                                    src="/images/branding/summit/faith_nexus_general_poster.png"
                                    alt="Faith Nexus Flagship Poster"
                                    className="rounded-xl w-full h-auto shadow-2xl"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Virtual Activation Banner */}
            <section className="py-12 bg-primary relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="text-primary-foreground space-y-2">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 uppercase tracking-widest mb-2 font-black">SAVE THE DATE</Badge>
                        <h2 className="text-3xl font-playfair font-bold">Global Virtual Activation</h2>
                        <p className="opacity-90 font-medium">Live on TalkWorld – 2 May 2026</p>
                    </div>
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-100 h-14 px-8 font-black text-lg">
                        Register Free Link
                    </Button>
                </div>
            </section>

            {/* Strategic Pillars */}
            <section id="pillars" className="py-32 bg-background relative overflow-hidden">
                <div className="ghost-text left-10 top-20">PILLARS</div>
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mb-24">
                        <h3 className="text-primary font-bold tracking-[0.3em] uppercase mb-4">Strategic Architecture</h3>
                        <h2 className="text-5xl font-playfair font-black text-foreground">A multi-dimensional <br /> gathering of purpose.</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Covenant Conversations */}
                        <Card className="glass-sovereign-card border-amber-500/20 overflow-hidden transform hover:-translate-y-2 transition-all duration-500">
                            <div className="aspect-[3/4] overflow-hidden relative group">
                                <img src="/images/branding/summit/faith_nexus_covenant_conversations_poster.png" alt="Covenant Conversations" className="w-full h-full object-cover grayscale-0 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                                    <MessageSquare className="h-8 w-8 text-primary" />
                                    <h4 className="text-2xl font-bold text-white">Covenant Conversations</h4>
                                    <p className="text-slate-200 text-sm font-light">Exploring the Hebraic foundations of the faith.</p>
                                </div>
                            </div>
                        </Card>

                        {/* FaithNexus100 */}
                        <Card className="glass-sovereign-card border-amber-500/20 overflow-hidden transform hover:-translate-y-2 transition-all duration-500">
                            <div className="aspect-[3/4] overflow-hidden relative group">
                                <img src="/images/branding/summit/faith_nexus_100_honours_poster.png" alt="FaithNexus100" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                                    <Shield className="h-8 w-8 text-primary" />
                                    <h4 className="text-2xl font-bold text-white">FaithNexus100</h4>
                                    <p className="text-slate-200 text-sm font-light">Honouring 100 voices shaping Africa's future.</p>
                                </div>
                            </div>
                        </Card>

                        {/* Industry Exhibition */}
                        <Card className="glass-sovereign-card border-amber-500/20 overflow-hidden transform hover:-translate-y-2 transition-all duration-500">
                            <div className="aspect-[3/4] overflow-hidden relative group">
                                <img src="/images/branding/summit/faith_nexus_industry_exhibition_poster.png" alt="Industry Exhibition" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                                    <Zap className="h-8 w-8 text-primary" />
                                    <h4 className="text-2xl font-bold text-white">Industry Exhibition</h4>
                                    <p className="text-slate-200 text-sm font-light">Where Faith, Media & Innovation Meet.</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* About / Manifesto */}
            <section id="about" className="py-32 bg-card border-y border-primary/10">
                <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
                    <div className="lg:col-span-7 space-y-8">
                        <h3 className="text-primary font-bold tracking-widest uppercase">The Manifesto</h3>
                        <h2 className="text-5xl font-playfair font-black tracking-tight leading-tight">
                            Redefining the <span className="text-gold">Sovereign Standard</span> of Christian Content.
                        </h2>
                        <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
                            <p>
                                In 2026, the global heartbeat of faith-driven creativity finds its nexus in Pretoria. Faith Nexus is not just a summit; it is a movement to unify, professionalize, and propel the voices that are reshaping nations through the Gospel.
                            </p>
                            <p>
                                From pulpit to parliament, studio to startup, we are gathering the architects of the Kingdom for four days of strategic orchestration, revelation, and relationship.
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-5 relative">
                        <div className="absolute -top-10 -left-10 w-40 h-40 border border-primary/20 rounded-full animate-float opacity-50" />
                        <div className="relative glass-sovereign p-12 rounded-3xl border-primary/10 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Globe className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm uppercase tracking-tighter text-muted-foreground">Global Impact</p>
                                    <p className="text-xl font-bold">50+ Nations Participating</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Calendar className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm uppercase tracking-tighter text-muted-foreground">Summit Duration</p>
                                    <p className="text-xl font-bold">4 Days of Intensive Synthesis</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm uppercase tracking-tighter text-muted-foreground">Network</p>
                                    <p className="text-xl font-bold">2,500+ Strategic Delegates</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section id="register" className="py-32 bg-[#0A0F1A] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
                    <h2 className="text-6xl font-playfair font-black mb-8 leading-tight">
                        Be Part of the <span className="text-gold">Nexus Awakening.</span>
                    </h2>
                    <p className="text-xl text-slate-300 font-light mb-12">
                        Receive exclusive pillars, speaker reveals, and first access to registration for the 2026 Summit and the Virtual Global Launch.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your professional email"
                            className="h-16 rounded-full px-8 bg-white/5 border border-white/10 flex-1 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                        <Button className="h-16 rounded-full px-10 text-lg bg-primary hover:scale-105 transition-all shadow-gold font-bold">
                            Join the Nexus
                        </Button>
                    </div>
                    <p className="mt-8 text-sm text-slate-500">
                        Registration link active: <a href="https://www.faithnexus.digital" className="text-primary hover:underline">www.faithnexus.digital</a>
                    </p>
                </div>
            </section>
        </MicrositeLayout>
    );
}
