import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    Plus, Users, Phone, FileText, CheckCircle, XCircle,
    Building2, DollarSign, Tag, ChevronRight, Trash2, X
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────
type Stage = 'prospect' | 'contacted' | 'proposal' | 'won' | 'lost';

interface Lead {
    id: string;
    company: string;
    contact: string;
    email: string;
    value: number;
    stream: string;
    notes: string;
    stage: Stage;
    createdAt: string;
    updatedAt: string;
}

// ─── Stage Config ────────────────────────────────────────────────────────────
const STAGES: { id: Stage; label: string; icon: React.ElementType; color: string; bg: string }[] = [
    { id: 'prospect', label: 'Prospects', icon: Users, color: 'text-slate-400', bg: 'border-slate-500/20 bg-slate-500/5' },
    { id: 'contacted', label: 'Contacted', icon: Phone, color: 'text-blue-400', bg: 'border-blue-500/20 bg-blue-500/5' },
    { id: 'proposal', label: 'Proposal Sent', icon: FileText, color: 'text-amber-400', bg: 'border-amber-500/20 bg-amber-500/5' },
    { id: 'won', label: 'Closed Won', icon: CheckCircle, color: 'text-emerald-400', bg: 'border-emerald-500/20 bg-emerald-500/5' },
    { id: 'lost', label: 'Lost', icon: XCircle, color: 'text-rose-400', bg: 'border-rose-500/20 bg-rose-500/5' },
];

const REVENUE_STREAMS = [
    'Radio Advertising', 'Studio Booking', 'Content Sponsorship', 'TalkWorld Subscription',
    'Publishing (ONIXone)', 'SaaS Licensing', 'Faith Nexus Sponsorship', 'Books', 'Social Media Mgmt',
];

const STORAGE_KEY = 'integro-leads-v2';

function loadLeads(): Lead[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveLeads(leads: Lead[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}
function formatRand(n: number) {
    if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}K`;
    return `R${n.toLocaleString()}`;
}

// ─── Empty form ───────────────────────────────────────────────────────────────
const emptyForm = { company: '', contact: '', email: '', value: '', stream: '', notes: '' };

export const LeadPipeline: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>(loadLeads);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { saveLeads(leads); }, [leads]);

    const addLead = () => {
        if (!form.company.trim()) { toast.error('Company name is required.'); return; }
        const lead: Lead = {
            id: `lead-${Date.now()}`,
            company: form.company.trim(),
            contact: form.contact.trim(),
            email: form.email.trim(),
            value: parseFloat(form.value) || 0,
            stream: form.stream || 'General',
            notes: form.notes.trim(),
            stage: 'prospect',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setLeads(prev => [lead, ...prev]);
        setForm(emptyForm);
        setShowForm(false);
        toast.success(`Lead added: ${lead.company}`);
    };

    const advanceLead = (id: string) => {
        const order: Stage[] = ['prospect', 'contacted', 'proposal', 'won'];
        setLeads(prev => prev.map(l => {
            if (l.id !== id) return l;
            const idx = order.indexOf(l.stage);
            if (idx === -1 || idx >= order.length - 1) return l;
            return { ...l, stage: order[idx + 1], updatedAt: new Date().toISOString() };
        }));
    };

    const markLost = (id: string) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: 'lost', updatedAt: new Date().toISOString() } : l));
    };

    const deleteLead = (id: string) => {
        setLeads(prev => prev.filter(l => l.id !== id));
        toast.success('Lead removed.');
    };

    // ── Pipeline metrics ──────────────────────────────────────────────────────
    const pipelineValue = leads.filter(l => l.stage !== 'lost').reduce((s, l) => s + l.value, 0);
    const wonValue = leads.filter(l => l.stage === 'won').reduce((s, l) => s + l.value, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-serif font-bold text-foreground">Lead Pipeline</h3>
                    <p className="text-xs text-muted-foreground">
                        Pipeline: <span className="text-primary font-bold">{formatRand(pipelineValue)}</span>
                        {' · '}Won: <span className="text-emerald-400 font-bold">{formatRand(wonValue)}</span>
                        {' · '}{leads.length} total leads
                    </p>
                </div>
                <Button
                    className="gradient-primary font-bold text-xs uppercase tracking-widest"
                    onClick={() => setShowForm(!showForm)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                </Button>
            </div>

            {/* Add Lead Form */}
            {showForm && (
                <Card className="glass-sovereign border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>New Lead</span>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowForm(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Company *</Label>
                            <Input placeholder="e.g. TymeBank" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Contact Name</Label>
                            <Input placeholder="e.g. John Doe" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Email</Label>
                            <Input type="email" placeholder="john@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Deal Value (R)</Label>
                            <Input type="number" placeholder="e.g. 30000" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Revenue Stream</Label>
                            <Select value={form.stream} onValueChange={v => setForm(p => ({ ...p, stream: v }))}>
                                <SelectTrigger title="Select revenue stream"><SelectValue placeholder="Select stream..." /></SelectTrigger>
                                <SelectContent>
                                    {REVENUE_STREAMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Notes</Label>
                            <Textarea placeholder="Any context, referrals, timeline..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="min-h-[60px]" />
                        </div>
                        <div className="sm:col-span-2">
                            <Button className="w-full gradient-primary font-bold" onClick={addLead}>
                                <Plus className="w-4 h-4 mr-2" /> Add to Pipeline
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Kanban columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {STAGES.map(stage => {
                    const stageLeads = leads.filter(l => l.stage === stage.id);
                    const StageIcon = stage.icon;
                    const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);

                    return (
                        <div key={stage.id} className="space-y-3">
                            {/* Column header */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${stage.bg}`}>
                                <StageIcon className={`w-4 h-4 ${stage.color}`} />
                                <span className={`text-[10px] uppercase tracking-widest font-bold ${stage.color}`}>{stage.label}</span>
                                <Badge variant="outline" className="ml-auto text-[9px] font-mono border-border/40">
                                    {stageLeads.length}
                                </Badge>
                            </div>
                            {stageValue > 0 && (
                                <p className={`text-[10px] font-mono font-bold text-center ${stage.color}`}>
                                    {formatRand(stageValue)}
                                </p>
                            )}

                            {/* Lead cards */}
                            <div className="space-y-2 min-h-[80px]">
                                {stageLeads.map(lead => (
                                    <Card key={lead.id} className="glass border-border/30 hover:border-primary/30 transition-all group">
                                        <CardContent className="p-3 space-y-2">
                                            <div className="flex items-start justify-between gap-1">
                                                <div>
                                                    <p className="text-sm font-bold text-foreground leading-tight">{lead.company}</p>
                                                    {lead.contact && <p className="text-[10px] text-muted-foreground">{lead.contact}</p>}
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                                    onClick={() => deleteLead(lead.id)}>
                                                    <Trash2 className="w-3 h-3 text-destructive" />
                                                </Button>
                                            </div>

                                            {lead.value > 0 && (
                                                <div className="flex items-center gap-1 text-emerald-400">
                                                    <DollarSign className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold font-mono">{formatRand(lead.value)}</span>
                                                </div>
                                            )}

                                            {lead.stream && (
                                                <div className="flex items-center gap-1">
                                                    <Tag className="w-3 h-3 text-primary/60" />
                                                    <span className="text-[9px] text-primary/80 font-medium">{lead.stream}</span>
                                                </div>
                                            )}

                                            {lead.notes && (
                                                <p className="text-[10px] text-muted-foreground line-clamp-2 italic">{lead.notes}</p>
                                            )}

                                            {/* Action buttons */}
                                            {lead.stage !== 'won' && lead.stage !== 'lost' && (
                                                <div className="flex gap-1 pt-1">
                                                    <Button size="sm" className="h-6 text-[9px] flex-1 gradient-primary font-bold uppercase tracking-widest"
                                                        onClick={() => advanceLead(lead.id)}>
                                                        <ChevronRight className="w-3 h-3 mr-0.5" />
                                                        Advance
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="h-6 text-[9px] border-rose-500/30 text-rose-400 w-7 p-0"
                                                        onClick={() => markLost(lead.id)}>
                                                        <XCircle className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}

                                {stageLeads.length === 0 && (
                                    <div className="flex items-center justify-center h-16 rounded-xl border border-dashed border-border/30 text-muted-foreground/30">
                                        <p className="text-[10px] uppercase tracking-widest">Empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeadPipeline;
