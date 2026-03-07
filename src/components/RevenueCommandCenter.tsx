import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
    DollarSign, TrendingUp, Radio, Mic, Newspaper, BookOpen,
    Layers, Church, Pencil, Users, Target, Clock, CheckCircle2,
    AlertCircle, BarChart3, Edit3, Save, X
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Blueprint Revenue Targets (from CEO Operations Blueprint) ───────────────
const REVENUE_TARGETS = [
    {
        id: 'radio',
        stream: 'Ocean City Radio Advertising',
        target: 120000,
        description: '4 advertisers × R30,000/month',
        icon: Radio,
        color: 'from-orange-500 to-red-500',
        accent: 'text-orange-400',
        lead: 'Radio Agent + PK',
    },
    {
        id: 'studio',
        stream: 'Studio Bookings (Video/Audio/Photo)',
        target: 200000,
        description: '20 bookings × R10,000 avg',
        icon: Mic,
        color: 'from-violet-500 to-purple-500',
        accent: 'text-violet-400',
        lead: 'Creative Agent + Tlali',
    },
    {
        id: 'sponsorship',
        stream: 'Content World / Standard IQ Sponsorship',
        target: 150000,
        description: '3 sponsors × R50,000',
        icon: Newspaper,
        color: 'from-blue-500 to-cyan-500',
        accent: 'text-blue-400',
        lead: 'Lead Gen Agent + Palesa',
    },
    {
        id: 'talkworld',
        stream: 'TalkWorld Subscriptions + Ad Rev',
        target: 80000,
        description: 'Creator monetization launch',
        icon: Users,
        color: 'from-pink-500 to-rose-500',
        accent: 'text-pink-400',
        lead: 'Publishing Agent',
    },
    {
        id: 'publishing',
        stream: 'Publishing Services (ONIXone)',
        target: 120000,
        description: '6 book projects × R20,000',
        icon: BookOpen,
        color: 'from-emerald-500 to-teal-500',
        accent: 'text-emerald-400',
        lead: 'Publishing Agent',
    },
    {
        id: 'saas',
        stream: 'SaaS Licensing (ProLens / Onixone / Integro Mail)',
        target: 100000,
        description: 'Agency clients × R per license',
        icon: Layers,
        color: 'from-indigo-500 to-blue-500',
        accent: 'text-indigo-400',
        lead: 'Samuel / All',
    },
    {
        id: 'faith',
        stream: 'Faith Nexus Event Sponsorship',
        target: 150000,
        description: '3 sponsors × R50,000',
        icon: Church,
        color: 'from-amber-500 to-yellow-500',
        accent: 'text-amber-400',
        lead: 'Lead Gen Agent',
    },
    {
        id: 'book',
        stream: '"Systems Over Hustle" Book Sales',
        target: 30000,
        description: '150 copies × R200',
        icon: Pencil,
        color: 'from-slate-500 to-gray-500',
        accent: 'text-slate-400',
        lead: 'Afro ISO Agent',
    },
    {
        id: 'social',
        stream: 'Social Media Management (Agency)',
        target: 50000,
        description: '5 clients × R10,000/month',
        icon: BarChart3,
        color: 'from-green-500 to-lime-500',
        accent: 'text-green-400',
        lead: 'Palesa',
    },
];

const TOTAL_TARGET = 1_000_000;
const DEADLINE = new Date('2026-03-31T23:59:59+02:00');
const STORAGE_KEY = 'integro-revenue-actuals';

function loadActuals(): Record<string, number> {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
}

function saveActuals(data: Record<string, number>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatRand(n: number) {
    if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}K`;
    return `R${n.toLocaleString()}`;
}

export const RevenueCommandCenter: React.FC = () => {
    const [actuals, setActuals] = useState<Record<string, number>>(loadActuals);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [timeLeft, setTimeLeft] = useState('');

    const totalActual = Object.values(actuals).reduce((a, b) => a + b, 0);
    const totalPercent = Math.min((totalActual / TOTAL_TARGET) * 100, 100);

    // ── Countdown ────────────────────────────────────────────────────────────
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const diff = DEADLINE.getTime() - now.getTime();
            if (diff <= 0) { setTimeLeft('DEADLINE PASSED'); return; }
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        };
        tick();
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
    }, []);

    const startEdit = (id: string) => {
        setEditingId(id);
        setEditValue(String(actuals[id] || ''));
    };

    const saveEdit = (id: string) => {
        const val = parseFloat(editValue.replace(/[^0-9.]/g, '')) || 0;
        const updated = { ...actuals, [id]: val };
        setActuals(updated);
        saveActuals(updated);
        setEditingId(null);
        toast.success('Revenue updated & saved.');
    };

    const getStatusIcon = (actual: number, target: number) => {
        const pct = actual / target;
        if (pct >= 1) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
        if (pct >= 0.5) return <TrendingUp className="w-4 h-4 text-amber-400" />;
        return <AlertCircle className="w-4 h-4 text-muted-foreground/50" />;
    };

    return (
        <div className="space-y-6">
            {/* ── Header KPIs ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Progress */}
                <Card className="glass-sovereign border-border/50 col-span-1 sm:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                                    Total Revenue
                                </p>
                                <p className="text-4xl font-serif font-bold text-foreground mt-1">
                                    {formatRand(totalActual)}
                                    <span className="text-lg text-muted-foreground font-normal ml-2">
                                        of {formatRand(TOTAL_TARGET)}
                                    </span>
                                </p>
                            </div>
                            <Badge className={`text-sm font-bold px-3 py-1 ${totalPercent >= 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                {totalPercent.toFixed(1)}%
                            </Badge>
                        </div>
                        <Progress value={totalPercent} className="h-3 bg-muted/50" />
                        <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                            Remaining: {formatRand(Math.max(0, TOTAL_TARGET - totalActual))}
                        </p>
                    </CardContent>
                </Card>

                {/* Countdown */}
                <Card className="glass-sovereign border-border/50 bg-primary/5">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                        <Clock className="w-6 h-6 text-primary mb-2" />
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                            Time to Deadline
                        </p>
                        <p className="text-2xl font-mono font-bold text-primary mt-1">{timeLeft}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">March 31, 2026</p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Revenue Streams ─────────────────────────────────────────── */}
            <Card className="glass-sovereign border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-primary" />
                        Revenue Streams — R1M Sprint
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {REVENUE_TARGETS.map((stream) => {
                        const actual = actuals[stream.id] || 0;
                        const pct = Math.min((actual / stream.target) * 100, 100);
                        const Icon = stream.icon;
                        const isEditing = editingId === stream.id;

                        return (
                            <div
                                key={stream.id}
                                className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border/30 bg-accent/5 hover:border-primary/30 hover:bg-accent/10 transition-all"
                            >
                                {/* Icon + Info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stream.color} flex items-center justify-center flex-shrink-0`}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {stream.stream}
                                            </p>
                                            {getStatusIcon(actual, stream.target)}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{stream.description}</p>
                                        <Progress value={pct} className="h-1.5 mt-1.5 bg-muted/30" />
                                    </div>
                                </div>

                                {/* Numbers */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right">
                                        <p className={`text-sm font-bold font-mono ${stream.accent}`}>
                                            {formatRand(actual)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-mono">
                                            / {formatRand(stream.target)}
                                        </p>
                                    </div>

                                    {/* Edit */}
                                    {isEditing ? (
                                        <div className="flex items-center gap-1">
                                            <Input
                                                className="w-24 h-7 text-xs font-mono"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(stream.id); if (e.key === 'Escape') setEditingId(null); }}
                                                autoFocus
                                                placeholder="0"
                                            />
                                            <Button size="sm" className="h-7 w-7 p-0 gradient-primary" onClick={() => saveEdit(stream.id)}>
                                                <Save className="w-3 h-3" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => startEdit(stream.id)}
                                        >
                                            <Edit3 className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <p className="text-[10px] text-muted-foreground text-center font-mono">
                Revenue actuals saved locally. Click the ✏️ icon on any stream to update. Target: R1,000,000 by 31 March 2026.
            </p>
        </div>
    );
};

export default RevenueCommandCenter;
