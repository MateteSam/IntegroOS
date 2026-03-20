import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Calendar,
    Globe,
    Shield,
    TrendingUp,
    MapPin,
    Zap,
    Download,
    Share2,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { cn } from '@/lib/utils';

const data = [
    { name: 'Week 1', members: 450, engagement: 2400 },
    { name: 'Week 2', members: 800, engagement: 3200 },
    { name: 'Week 3', members: 1200, engagement: 2800 },
    { name: 'Week 4', members: 2100, engagement: 4500 },
];

const PPCSADashboard = () => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-[0.4em] px-4 py-1">Association Hub</Badge>
                    <div className="space-y-1">
                        <h2 className="text-5xl font-serif font-black tracking-tight text-white leading-tight">
                            The Prophetic Prayer <br />
                            <span className="text-gold">House SA</span>
                        </h2>
                        <p className="text-xl text-slate-400 font-light max-w-2xl">
                            Orchestrating the Sovereign Membership and Global Event Logistics.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="h-14 px-8 border-white/10 hover:bg-white/5 rounded-2xl font-bold">
                        <Share2 className="w-5 h-5 mr-3" />
                        Share Report
                    </Button>
                    <Button className="h-14 px-10 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-xl">
                        <Download className="w-5 h-5 mr-3" />
                        Export Data
                    </Button>
                </div>
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Members', value: '25,482', change: '+12%', icon: Users, color: 'text-primary' },
                    { label: 'Event Capacity', value: '98%', change: 'Optimal', icon: Calendar, color: 'text-blue-500' },
                    { label: 'Regional Hubs', value: '14/ provinces', change: '+2 new', icon: MapPin, color: 'text-emerald-500' },
                    { label: 'Activation Velocity', value: 'High', change: 'Stable', icon: Zap, color: 'text-amber-500' },
                ].map((stat, i) => (
                    <Card key={i} className="glass border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="w-16 h-16" />
                        </div>
                        <CardContent className="p-8">
                            <stat.icon className={cn("w-8 h-8 mb-6", stat.color)} />
                            <div className="space-y-2">
                                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-4xl font-serif font-black text-white">{stat.value}</h3>
                                    <span className="text-xs font-bold text-primary pb-1">{stat.change}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Strategic Analytics */}
            <div className="grid lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 glass border-white/5">
                    <CardHeader className="p-8">
                        <CardTitle className="text-2xl font-serif">Growth Intelligence</CardTitle>
                        <CardDescription>Membership and engagement trajectory across South Africa</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ color: '#D4AF37' }}
                                />
                                <Area type="monotone" dataKey="members" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="glass border-white/5">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-serif">Mission Updates</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            {[
                                { title: 'Gauteng Summit Sync', time: '2h ago', status: 'Confirmed', icon: CheckCircle2 },
                                { title: 'Western Cape Setup', time: '5h ago', status: 'In Progress', icon: Clock },
                                { title: 'FaithNexus Connection', time: '1d ago', status: 'Optimal', icon: Globe },
                            ].map((update, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                    <update.icon className="w-5 h-5 text-primary shrink-0" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-bold text-white">{update.title}</p>
                                        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                            <span>{update.time}</span>
                                            <span className="text-primary">{update.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs uppercase tracking-widest font-bold text-primary hover:bg-primary/5">
                                View Full Intelligence Log
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/10 border border-primary/20 overflow-hidden relative p-8">
                        <Shield className="absolute -bottom-6 -right-6 w-32 h-32 text-primary/10" />
                        <h4 className="text-xl font-serif font-bold text-primary mb-4">Sovereign Governance</h4>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            Ensuring all organizational activations follow the Hebraic standards of excellence and covenant loyalty.
                        </p>
                        <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/20 font-bold">
                            Review Protocols
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PPCSADashboard;
