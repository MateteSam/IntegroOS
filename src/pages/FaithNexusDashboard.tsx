import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Globe,
    Zap,
    Users,
    Calendar,
    Shield,
    Sparkles,
    Tv,
    TrendingUp,
    CheckCircle2,
    Clock,
    Waves,
    Target,
    GanttChartSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { useProjectRegistry } from '@/contexts/ProjectRegistry';

const engagementData = [
    { name: 'Month 1', registrations: 120, reach: 5000 },
    { name: 'Month 2', registrations: 450, reach: 12000 },
    { name: 'Month 3', registrations: 890, reach: 25000 },
    { name: 'Month 4', registrations: 2100, reach: 68000 },
];

const activationStatus = [
    { label: 'Microsite Health', value: 'Healthy', icon: Globe, color: 'text-emerald-500', status: 'optimal' },
    { label: 'Virtual Launch Sync', value: 'Ready', icon: Zap, color: 'text-amber-500', status: 'ready' },
    { label: 'Creator Network', value: '2.4k', icon: Users, color: 'text-primary', status: 'growing' },
    { label: 'Governance Sync', value: 'Covenant', icon: Shield, color: 'text-blue-500', status: 'verified' },
];

const FaithNexusDashboard = () => {
    const { getProjectById } = useProjectRegistry();
    const project = getProjectById('faith-nexus-2026');

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Mission Control Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">Institutional Mission Control</span>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-6xl font-serif font-black tracking-tight text-white flex items-center gap-4">
                            Faith <span className="text-gold">Nexus</span>
                            <Badge className="bg-primary/20 text-primary border-primary/30 h-8 px-4 text-xs font-black uppercase tracking-widest">2026 Live</Badge>
                        </h1>
                        <p className="text-xl text-slate-400 font-light max-w-2xl leading-relaxed">
                            Orchestrating the Digital Renaissance. Managing global activations and strategic content sovereignty.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="h-14 px-8 border-white/10 hover:bg-white/5 rounded-2xl font-bold flex items-center gap-3">
                        <Tv className="w-5 h-5 text-primary" />
                        Preview Microsite
                    </Button>
                    <Button className="h-14 px-10 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                        Launch Global Broadcast
                    </Button>
                </div>
            </div>

            {/* Core Activation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activationStatus.map((item, i) => (
                    <Card key={i} className="glass border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                        <CardContent className="p-8">
                            <item.icon className={cn("w-10 h-10 mb-6", item.color)} />
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-serif font-bold text-white">{item.value}</h3>
                                    <span className="text-[10px] uppercase tracking-widest font-black text-primary opacity-60">{item.status}</span>
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
                    </Card>
                ))}
            </div>

            {/* Strategic Intelligence Area */}
            <div className="grid lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 glass border-white/5 overflow-hidden">
                    <CardHeader className="p-8 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-serif">Growth Trajectory</CardTitle>
                            <CardDescription>Global registrations and digital reach for the 2026 Summit</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-xs font-bold text-slate-400">Registrations</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-xs font-bold text-slate-400">Total Reach</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={engagementData}>
                                <defs>
                                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="registrations" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorReg)" />
                                <Area type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4 glass border-white/5 overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-xl font-serif">Activation Roadmap</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {[
                            { title: 'Global Virtual Landing', date: 'May 02, 2026', status: 'Ready', icon: Zap },
                            { title: 'FaithNexus100 Audit', date: 'June 15, 2026', status: 'In Progress', icon: Shield },
                            { title: 'Flagship Summit Open', date: 'Oct 20, 2026', status: 'Scheduled', icon: Target },
                        ].map((milestone, i) => (
                            <div key={i} className="flex gap-4 group cursor-default">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                    <milestone.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{milestone.title}</p>
                                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black">
                                        <span className="text-slate-500">{milestone.date}</span>
                                        <span className="text-primary">{milestone.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="pt-4">
                            <Card className="bg-primary/10 border border-primary/20 p-6 rounded-2xl relative overflow-hidden group">
                                <Waves className="absolute -bottom-6 -right-6 w-24 h-24 text-primary/10 group-hover:scale-110 transition-transform duration-700" />
                                <p className="text-xs font-serif italic text-primary leading-relaxed">
                                    "The Digital Renaissance is not a technological shift, but a spiritual orchestration of voices."
                                </p>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: 'Covenant Conversations', focus: 'Kingdom Revelation', agents: ['DocumentCoAuthor', 'BrandSpecialist'] },
                    { title: 'FaithNexus100 Honours', focus: 'Influence Auditing', agents: ['CentralIntelligence'] },
                    { title: 'Industry Exhibition', focus: 'SaaS Connectivity', agents: ['FrontendDesigner', 'TestingEngineer'] },
                ].map((pillar, i) => (
                    <Card key={i} className="glass-sovereign border-white/5 hover:border-primary/30 transition-all flex flex-col p-8 gap-4 group">
                        <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                            <GanttChartSquare className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-serif font-black">{pillar.title}</h4>
                            <p className="text-xs font-bold uppercase tracking-widest text-primary">{pillar.focus}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-auto">
                            {pillar.agents.map((agent, j) => (
                                <Badge key={j} variant="outline" className="text-[9px] border-white/10 text-slate-400">{agent}</Badge>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default FaithNexusDashboard;
