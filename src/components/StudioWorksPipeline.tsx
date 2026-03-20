import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
    Church, TrendingUp, FileText, Handshake, Calendar,
    Plus, Phone, Mail, CheckCircle2, Clock, AlertCircle,
    Target, DollarSign, Users, Zap, Building2, Filter
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type LeadStatus = 'cold' | 'contacted' | 'discovery' | 'proposal' | 'negotiation' | 'signed' | 'retainer';
type ServiceType = 'website' | 'livestream' | 'ai-advisory' | 'ai-workshop' | 'media-support' | 'event' | 'restructure' | 'other';

interface ChurchLead {
    id: string;
    name: string;
    location: string;
    pastor: string;
    contactEmail: string;
    phone?: string;
    status: LeadStatus;
    service: ServiceType;
    estimatedValue: number;
    notes: string;
    nextAction: string;
    nextActionDate: string;
    assignedTo: string;
    dateAdded: string;
    proposalSent: boolean;
    contractSigned: boolean;
    retainerActive: boolean;
}

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INITIAL_LEADS: ChurchLead[] = [
    { id: '1', name: 'Grace Family Church', location: 'Johannesburg, GP', pastor: 'Pastor James', contactEmail: 'admin@gracefamily.co.za', status: 'contacted', service: 'livestream', estimatedValue: 150000, notes: 'Large congregation, currently using phone cameras. Strong growth.', nextAction: 'Send livestream proposal', nextActionDate: '2026-03-09', assignedTo: 'PK', dateAdded: '2026-03-07', proposalSent: false, contractSigned: false, retainerActive: false },
    { id: '2', name: 'New Life Ministries', location: 'Pretoria, GP', pastor: 'Dr. Mokoena', contactEmail: 'info@newlifemin.co.za', status: 'discovery', service: 'ai-advisory', estimatedValue: 45000, notes: 'Very interested in AI for visitor follow-up. Budget confirmed available.', nextAction: 'Send AI advisory retainer proposal', nextActionDate: '2026-03-10', assignedTo: 'Samuel', dateAdded: '2026-03-07', proposalSent: false, contractSigned: false, retainerActive: false },
    { id: '3', name: 'Abundant Life Centre', location: 'Cape Town, WC', pastor: 'Pastor Nkosi', contactEmail: 'contact@abundantlife.org.za', status: 'cold', service: 'website', estimatedValue: 75000, notes: 'No website at all. Congregation of ~400. Ideal for interactive church website.', nextAction: 'Send outreach letter', nextActionDate: '2026-03-08', assignedTo: 'Palesa', dateAdded: '2026-03-07', proposalSent: false, contractSigned: false, retainerActive: false },
    { id: '4', name: 'Kingdom Impact Church', location: 'Durban, KZN', pastor: 'Apostle Dlamini', contactEmail: 'admin@kingdomimpact.co.za', status: 'cold', service: 'ai-workshop', estimatedValue: 28000, notes: 'Leadership team very open to technology. Referred by network.', nextAction: 'Call to introduce StudioWorks', nextActionDate: '2026-03-08', assignedTo: 'Dr. Charles', dateAdded: '2026-03-07', proposalSent: false, contractSigned: false, retainerActive: false },
    { id: '5', name: 'Faith Harvest Christian Centre', location: 'Johannesburg, GP', pastor: 'Pastor Sibande', contactEmail: 'info@faithharvest.co.za', status: 'cold', service: 'media-support', estimatedValue: 35000, notes: 'Existing media team struggling. Monthly retainer opportunity.', nextAction: 'Send media dept restructure letter', nextActionDate: '2026-03-09', assignedTo: 'Palesa', dateAdded: '2026-03-07', proposalSent: false, contractSigned: false, retainerActive: false },
];

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; step: number }> = {
    cold: { label: 'Cold', color: 'text-slate-400', bg: 'bg-slate-800', step: 0 },
    contacted: { label: 'Contacted', color: 'text-blue-400', bg: 'bg-blue-900/40', step: 1 },
    discovery: { label: 'Discovery', color: 'text-purple-400', bg: 'bg-purple-900/40', step: 2 },
    proposal: { label: 'Proposal Sent', color: 'text-amber-400', bg: 'bg-amber-900/40', step: 3 },
    negotiation: { label: 'Negotiating', color: 'text-orange-400', bg: 'bg-orange-900/40', step: 4 },
    signed: { label: 'Signed ✓', color: 'text-green-400', bg: 'bg-green-900/40', step: 5 },
    retainer: { label: 'On Retainer', color: 'text-emerald-400', bg: 'bg-emerald-900/40', step: 6 },
};

const SERVICE_LABELS: Record<ServiceType, string> = {
    'website': '🌐 Website',
    'livestream': '📡 Livestream',
    'ai-advisory': '🤖 AI Advisory',
    'ai-workshop': '🎓 AI Workshop',
    'media-support': '🎬 Media Support',
    'event': '🎤 Event Production',
    'restructure': '🔧 Media Restructure',
    'other': '📋 Other',
};

const TARGET_DATE = new Date('2026-03-31');
const today = new Date();
const DAYS_LEFT = Math.max(0, Math.ceil((TARGET_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

const formatRand = (val: number) => `R${val.toLocaleString()}`;

// ─── ADD LEAD MODAL ───────────────────────────────────────────────────────────
const AddLeadForm = ({ onAdd, onClose }: { onAdd: (lead: Omit<ChurchLead, 'id' | 'dateAdded' | 'proposalSent' | 'contractSigned' | 'retainerActive'>) => void; onClose: () => void }) => {
    const [form, setForm] = useState({
        name: '', location: '', pastor: '', contactEmail: '',
        phone: '', status: 'cold' as LeadStatus, service: 'website' as ServiceType,
        estimatedValue: 55000, notes: '', nextAction: '', nextActionDate: '', assignedTo: 'Palesa'
    });

    const handleSubmit = () => {
        if (!form.name || !form.contactEmail) {
            toast({ title: 'Required fields missing', description: 'Church name and email are required.', variant: 'destructive' });
            return;
        }
        onAdd(form);
        onClose();
        toast({ title: '⛪ Lead Added', description: `${form.name} added to the pipeline.` });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-foreground">Add Church Lead</h3>
                <div className="space-y-3">
                    <Input placeholder="Church Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <Input placeholder="Location (City, Province)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    <Input placeholder="Pastor / Contact Name" value={form.pastor} onChange={e => setForm({ ...form, pastor: e.target.value })} />
                    <Input placeholder="Email Address *" type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} />
                    <Input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Service</label>
                            <select className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm" value={form.service} onChange={e => setForm({ ...form, service: e.target.value as ServiceType })}>
                                {Object.entries(SERVICE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Assigned To</label>
                            <select className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                                {['Palesa', 'Samuel', 'Dr. Charles', 'PK', 'Tlali', 'Mamphosi'].map(n => <option key={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Estimated Project Value (R)</label>
                        <Input type="number" value={form.estimatedValue} onChange={e => setForm({ ...form, estimatedValue: parseInt(e.target.value) || 0 })} />
                    </div>
                    <Input placeholder="Next Action" value={form.nextAction} onChange={e => setForm({ ...form, nextAction: e.target.value })} />
                    <Input type="date" value={form.nextActionDate} onChange={e => setForm({ ...form, nextActionDate: e.target.value })} />
                    <textarea className="w-full p-3 border border-border rounded-md bg-background text-foreground text-sm resize-none" rows={3} placeholder="Notes (size of congregation, specific needs, etc.)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div className="flex gap-3 mt-4">
                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={handleSubmit}>Add to Pipeline</Button>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
};

// ─── LEAD CARD ────────────────────────────────────────────────────────────────
const LeadCard = ({ lead, onUpdate }: { lead: ChurchLead; onUpdate: (id: string, updates: Partial<ChurchLead>) => void }) => {
    const cfg = STATUS_CONFIG[lead.status];
    const isOverdue = lead.nextActionDate && new Date(lead.nextActionDate) < today && lead.status !== 'signed' && lead.status !== 'retainer';

    const nextStatus = (): LeadStatus | null => {
        const statuses: LeadStatus[] = ['cold', 'contacted', 'discovery', 'proposal', 'negotiation', 'signed', 'retainer'];
        const idx = statuses.indexOf(lead.status);
        return idx < statuses.length - 1 ? statuses[idx + 1] : null;
    };

    return (
        <Card className="border border-border/60 hover:border-amber-500/30 transition-all duration-200 bg-card/70">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-foreground text-sm leading-tight">{lead.name}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{lead.location} · {lead.pastor}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-amber-400">{formatRand(lead.estimatedValue)}</p>
                        <p className="text-[10px] text-muted-foreground">{SERVICE_LABELS[lead.service]}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{lead.contactEmail}</span>
                    {lead.phone && <><Phone className="h-3 w-3 ml-1" /><span>{lead.phone}</span></>}
                </div>

                {lead.notes && <p className="text-xs text-muted-foreground/70 mb-3 line-clamp-2 italic">"{lead.notes}"</p>}

                <div className={`flex items-center gap-2 text-xs p-2 rounded-lg mb-3 ${isOverdue ? 'bg-red-900/20 text-red-400' : 'bg-background/50 text-muted-foreground'}`}>
                    {isOverdue ? <AlertCircle className="h-3 w-3 shrink-0" /> : <Clock className="h-3 w-3 shrink-0" />}
                    <span className="font-medium">{lead.nextAction || 'No action set'}</span>
                    {lead.nextActionDate && <span className="ml-auto shrink-0">{lead.nextActionDate}</span>}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="bg-background/50 px-2 py-0.5 rounded">👤 {lead.assignedTo}</span>
                    </div>
                    <div className="flex gap-2">
                        {nextStatus() && (
                            <Button
                                size="sm" variant="outline"
                                className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
                                onClick={() => {
                                    const ns = nextStatus()!;
                                    onUpdate(lead.id, {
                                        status: ns,
                                        proposalSent: ns === 'proposal' ? true : lead.proposalSent,
                                        contractSigned: ns === 'signed' ? true : lead.contractSigned,
                                        retainerActive: ns === 'retainer' ? true : lead.retainerActive,
                                    });
                                    toast({ title: `Status updated → ${STATUS_CONFIG[ns].label}`, description: lead.name });
                                }}
                            >
                                → {STATUS_CONFIG[nextStatus()!].label}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const StudioWorksPipeline = () => {
    const [leads, setLeads] = useState<ChurchLead[]>(INITIAL_LEADS);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
    const [filterAssignee, setFilterAssignee] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const updateLead = (id: string, updates: Partial<ChurchLead>) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const addLead = (data: Omit<ChurchLead, 'id' | 'dateAdded' | 'proposalSent' | 'contractSigned' | 'retainerActive'>) => {
        const newLead: ChurchLead = {
            ...data,
            id: Date.now().toString(),
            dateAdded: new Date().toISOString().split('T')[0],
            proposalSent: false,
            contractSigned: false,
            retainerActive: false,
        };
        setLeads(prev => [newLead, ...prev]);
    };

    // ─── METRICS ─────────────────────────────────────────────────────────────────
    const totalLeads = leads.length;
    const signedLeads = leads.filter(l => l.status === 'signed' || l.status === 'retainer');
    const retainerLeads = leads.filter(l => l.status === 'retainer');
    const proposalLeads = leads.filter(l => ['proposal', 'negotiation'].includes(l.status));
    const pipelineValue = leads.filter(l => !['cold'].includes(l.status)).reduce((s, l) => s + l.estimatedValue, 0);
    const signedValue = signedLeads.reduce((s, l) => s + l.estimatedValue, 0);
    const retainerMonthly = retainerLeads.reduce((s, l) => s + Math.floor(l.estimatedValue * 0.15), 0);
    const progressTo90DayTarget = Math.min(100, (signedLeads.length / 5) * 100);
    const overdueLeads = leads.filter(l => l.nextActionDate && new Date(l.nextActionDate) < today && !['signed', 'retainer'].includes(l.status));

    // ─── FILTERED LEADS ───────────────────────────────────────────────────────────
    const filteredLeads = leads.filter(l => {
        const matchStatus = filterStatus === 'all' || l.status === filterStatus;
        const matchAssignee = filterAssignee === 'all' || l.assignedTo === filterAssignee;
        const matchSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.location.toLowerCase().includes(searchQuery.toLowerCase()) || l.pastor.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchAssignee && matchSearch;
    });

    const KANBAN_STATUSES: LeadStatus[] = ['cold', 'contacted', 'discovery', 'proposal', 'negotiation', 'signed', 'retainer'];

    return (
        <div className="space-y-6 p-2">
            {showAddForm && <AddLeadForm onAdd={addLead} onClose={() => setShowAddForm(false)} />}

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-sm font-black text-black">SW</div>
                        <h1 className="text-2xl font-bold text-foreground font-serif">StudioWorks Church Pipeline</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">90-Day Target: 25 engagements · 10 proposals · 5 contracts · 2 retainers</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-amber-400">{DAYS_LEFT}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">days left</div>
                    </div>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={() => setShowAddForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />Add Lead
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Card className="border-border/60 bg-card/70 col-span-1">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Leads</span>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">{totalLeads}</div>
                        <div className="text-xs text-muted-foreground">of 25 target</div>
                        <Progress value={(totalLeads / 25) * 100} className="h-1 mt-2" />
                    </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/70">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Proposals</span>
                            <FileText className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="text-3xl font-bold text-amber-400">{proposalLeads.length}</div>
                        <div className="text-xs text-muted-foreground">of 10 target</div>
                        <Progress value={(proposalLeads.length / 10) * 100} className="h-1 mt-2" />
                    </CardContent>
                </Card>
                <Card className="border-green-900/30 bg-green-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Contracts</span>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-3xl font-bold text-green-400">{signedLeads.length}</div>
                        <div className="text-xs text-muted-foreground">of 5 target</div>
                        <Progress value={progressTo90DayTarget} className="h-1 mt-2" />
                    </CardContent>
                </Card>
                <Card className="border-emerald-900/30 bg-emerald-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Retainers</span>
                            <Zap className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-bold text-emerald-400">{retainerLeads.length}</div>
                        <div className="text-xs text-muted-foreground">of 2 target</div>
                        <Progress value={(retainerLeads.length / 2) * 100} className="h-1 mt-2" />
                    </CardContent>
                </Card>
                <Card className="border-amber-900/30 bg-amber-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Pipeline Value</span>
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-amber-400">{formatRand(pipelineValue)}</div>
                        <div className="text-xs text-muted-foreground">active pipeline</div>
                    </CardContent>
                </Card>
                <Card className={`border-border/60 ${overdueLeads.length > 0 ? 'border-red-500/30 bg-red-900/10' : 'bg-card/70'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Overdue</span>
                            <AlertCircle className={`h-4 w-4 ${overdueLeads.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                        </div>
                        <div className={`text-3xl font-bold ${overdueLeads.length > 0 ? 'text-red-400' : 'text-foreground'}`}>{overdueLeads.length}</div>
                        <div className="text-xs text-muted-foreground">actions overdue</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pipeline">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pipeline">Pipeline Board</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue Tracker</TabsTrigger>
                </TabsList>

                {/* Pipeline Board */}
                <TabsContent value="pipeline" className="mt-4">
                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4 min-w-max">
                            {KANBAN_STATUSES.map(status => {
                                const cfg = STATUS_CONFIG[status];
                                const statusLeads = leads.filter(l => l.status === status);
                                return (
                                    <div key={status} className="w-64 shrink-0">
                                        <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg ${cfg.bg}`}>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-black/30 ${cfg.color}`}>{statusLeads.length}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {statusLeads.map(lead => <LeadCard key={lead.id} lead={lead} onUpdate={updateLead} />)}
                                            {statusLeads.length === 0 && (
                                                <div className="border border-dashed border-border/30 rounded-xl p-6 text-center text-xs text-muted-foreground/50">
                                                    No leads here
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </TabsContent>

                {/* List View */}
                <TabsContent value="list" className="mt-4">
                    {/* Filters */}
                    <div className="flex gap-3 mb-4 flex-wrap">
                        <Input
                            placeholder="Search churches..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="max-w-xs"
                        />
                        <select title="Filter by status" className="border border-border rounded-md px-3 py-2 bg-background text-foreground text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value as LeadStatus | 'all')}>
                            <option value="all">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select title="Filter by team member" className="border border-border rounded-md px-3 py-2 bg-background text-foreground text-sm" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
                            <option value="all">All Team</option>
                            {['Palesa', 'Samuel', 'Dr. Charles', 'PK', 'Tlali', 'Mamphosi'].map(n => <option key={n}>{n}</option>)}
                        </select>
                        <div className="text-sm text-muted-foreground flex items-center">{filteredLeads.length} leads</div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredLeads.map(lead => <LeadCard key={lead.id} lead={lead} onUpdate={updateLead} />)}
                    </div>

                    {filteredLeads.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Church className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No leads match your filters.</p>
                            <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />Add Your First Lead
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Revenue Tracker */}
                <TabsContent value="revenue" className="mt-4 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="border-amber-500/20 bg-amber-900/10">
                            <CardContent className="p-6 text-center">
                                <Target className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-amber-400">R1,000,000</div>
                                <div className="text-sm text-muted-foreground">March 2026 Target</div>
                                <div className="text-xs text-muted-foreground mt-1">{DAYS_LEFT} days remaining</div>
                            </CardContent>
                        </Card>
                        <Card className="border-green-500/20 bg-green-900/10">
                            <CardContent className="p-6 text-center">
                                <Handshake className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-green-400">{formatRand(signedValue)}</div>
                                <div className="text-sm text-muted-foreground">Contracted Value</div>
                                <div className="text-xs text-muted-foreground mt-1">{signedLeads.length} contracts signed</div>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-500/20 bg-blue-900/10">
                            <CardContent className="p-6 text-center">
                                <DollarSign className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-blue-400">{formatRand(retainerMonthly)}</div>
                                <div className="text-sm text-muted-foreground">Monthly Retainer Revenue</div>
                                <div className="text-xs text-muted-foreground mt-1">{retainerLeads.length} active retainers</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-amber-400" />
                                Revenue by Service Type
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(SERVICE_LABELS).map(([type, label]) => {
                                    const typeLeads = leads.filter(l => l.service === type);
                                    const typeValue = typeLeads.reduce((s, l) => s + l.estimatedValue, 0);
                                    const maxVal = Math.max(...Object.keys(SERVICE_LABELS).map(t => leads.filter(l => l.service === t).reduce((s, l) => s + l.estimatedValue, 0)));
                                    if (typeValue === 0) return null;
                                    return (
                                        <div key={type}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-foreground font-medium">{label}</span>
                                                <span className="text-amber-400 font-bold">{formatRand(typeValue)}</span>
                                            </div>
                                            <Progress value={maxVal > 0 ? (typeValue / maxVal) * 100 : 0} className="h-2" />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">90-Day Scoreboard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: 'Church Engagements', current: totalLeads, target: 25, color: 'text-blue-400' },
                                    { label: 'Corporate Leads', current: 0, target: 10, color: 'text-purple-400' },
                                    { label: 'Proposals Submitted', current: proposalLeads.length, target: 10, color: 'text-amber-400' },
                                    { label: 'Contracts Signed', current: signedLeads.length, target: 5, color: 'text-green-400' },
                                    { label: 'Retainer Agreements', current: retainerLeads.length, target: 2, color: 'text-emerald-400' },
                                ].map(({ label, current, target, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-foreground">{label}</span>
                                            <span className={`font-bold ${color}`}>{current} / {target}</span>
                                        </div>
                                        <Progress value={(current / target) * 100} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudioWorksPipeline;
