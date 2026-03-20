import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Brain, Shield, PenTool, Search, Plus, Sparkles, Wand2, ArrowRight, CheckCircle2, ListChecks, Settings2, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateAgentProfile } from '@/lib/ai';
import { useProject, useAppStore } from '@/stores';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const AgentDesignStudio = () => {
    const { toast } = useToast();
    const { activeProject } = useProject();
    const { saveAgent, savedAgents } = useAppStore();
    const [step, setStep] = useState(1); // 1: Select Type, 2: Describe, 3: Synthesize, 4: Results
    const [isGenerating, setIsGenerating] = useState(false);

    const [config, setConfig] = useState({
        type: '',
        description: '',
    });

    const [profile, setProfile] = useState<any>(null);

    // Context Awareness: Pre-populate description based on brand data
    React.useEffect(() => {
        if (activeProject && config.type && !config.description) {
            const { brandData } = activeProject;
            if (brandData.businessName) {
                const autoMission = `Agent for ${brandData.businessName} specializing in ${config.type}. Industry: ${brandData.industry}. Mission: ${brandData.mission}`;
                setConfig(prev => ({ ...prev, description: autoMission.trim() }));
            }
        }
    }, [activeProject, config.type]);

    const agentTypes = [
        { id: 'support', title: 'Customer Support', desc: 'Auto-triage, routing, and drafting.', icon: Shield },
        { id: 'reporting', title: 'Executive Insight', desc: 'Automated reporting and deck generation.', icon: ListChecks },
        { id: 'ops', title: 'Internal Ops', desc: 'Process orchestration and reminders.', icon: Settings2 },
        { id: 'research', title: 'Research & Intel', desc: 'Synthesis of complex market data.', icon: Search },
        { id: 'growth', title: 'Growth & Comms', desc: 'Social content and campaign scaling.', icon: PenTool },
    ];

    const handleGenerate = async () => {
        if (!config.description) {
            toast({ title: "Configuration Required", description: "Please define the agent's target role.", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        setStep(3);

        try {
            const result = await generateAgentProfile(config.type, config.description);
            // Inject metadata
            const agentProfile = {
                ...result,
                id: `agent-${Date.now()}`,
                type: config.type,
                baseMission: config.description,
                createdAt: new Date().toISOString()
            };
            setProfile(agentProfile);
            setStep(4);
            toast({ title: "Agent Architected", description: `${result.name} profile successfully synthesized.` });
        } catch (error) {
            console.error(error);
            toast({ title: "Synthesis Error", description: "The Agent Architect encountered a neural interference.", variant: "destructive" });
            setStep(2);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeploy = () => {
        if (profile) {
            saveAgent(profile);
            toast({
                title: "Agent Deployed",
                description: `${profile.name} is now active in the Integro OS ecosystem.`
            });
            setStep(1);
            setProfile(null);
            setConfig({ type: '', description: '' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-6xl font-serif font-bold text-foreground tracking-tight">
                        Agent <span className="text-primary italic">Design</span> Studio
                    </h1>
                    <p className="text-muted-foreground text-lg font-light">Architect specialized AI agents to orchestrate your team's global narrative.</p>
                </div>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`w-12 h-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter transition-all flex items-center justify-center ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-accent/10 text-muted-foreground'}`}>
                            {s === 1 ? 'Archetype' : s === 2 ? 'Mission' : s === 3 ? 'Synthesis' : 'Deploy'}
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid md:grid-cols-3 lg:grid-cols-5 gap-4"
                    >
                        {agentTypes.map((type) => (
                            <Card
                                key={type.id}
                                onClick={() => { setConfig({ ...config, type: type.id }); setStep(2); }}
                                className={`group cursor-pointer transition-all duration-500 hover:border-primary/50 overflow-hidden relative glass ${config.type === type.id ? 'border-primary ring-1 ring-primary/20' : ''}`}
                            >
                                <div className="p-6 relative z-10 space-y-4">
                                    <div className={`w-12 h-12 rounded-xl bg-accent/5 border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500`}>
                                        <type.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{type.title}</h3>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">{type.desc}</p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Card>
                        ))}
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-3xl mx-auto space-y-8"
                    >
                        <Card className="glass overflow-hidden">
                            <CardHeader className="p-8 border-b border-border/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="outline" className="text-primary border-primary/20 uppercase tracking-widest text-[8px]">{config.type}</Badge>
                                    <div className="h-px flex-1 bg-border/50" />
                                </div>
                                <CardTitle className="text-2xl font-serif">Define Agent Mission</CardTitle>
                                <CardDescription>Describe the specific tasks and outcomes you want this agent to handle.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Target Role & Objectives</Label>
                                    <Textarea
                                        className="min-h-[150px] bg-accent/5 border-border/50 focus:border-primary/50 text-lg font-light leading-relaxed"
                                        placeholder="e.g. Handle all high-priority customer tickets regarding billing and account security, ensuring 10-minute response times with clinical context..."
                                        value={config.description}
                                        onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 bg-muted/30 flex justify-between">
                                <Button variant="ghost" onClick={() => setStep(1)}>Change Type</Button>
                                <Button className="gradient-primary h-12 px-10 font-bold" onClick={handleGenerate}>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Synthesize Agent
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="py-24 space-y-8 text-center"
                    >
                        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
                            <div className="absolute inset-4 rounded-full border border-primary/50 animate-spin-reverse" style={{ animationDuration: '5s' }} />
                            <Brain className="w-12 h-12 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-serif font-bold text-foreground">Synthesis in Progress</h2>
                            <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] animate-pulse">Architecting Neural Identity & SOPs...</p>
                        </div>
                    </motion.div>
                )}

                {step === 4 && profile && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid lg:grid-cols-2 gap-8"
                    >
                        {/* Identity Reveal */}
                        <Card className="glass overflow-hidden border-primary/20">
                            <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
                                <div className="absolute -bottom-8 left-8 w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl border-4 border-background">
                                    <Brain className="w-10 h-10 text-primary-foreground" />
                                </div>
                            </div>
                            <CardHeader className="pt-12 px-8">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-3xl font-serif font-bold">{profile.name}</CardTitle>
                                    <Badge variant="outline" style={{ borderColor: profile.accentColor, color: profile.accentColor }} className="uppercase tracking-widest text-[8px]">
                                        {profile.personality}
                                    </Badge>
                                </div>
                                <CardDescription className="text-lg italic font-light">"Built in Africa, Deploying Globally."</CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-primary">Primary Responsibilities</h4>
                                    <ul className="space-y-2">
                                        {profile.responsibilities.map((r: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-primary">Tool Integration</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.suggestedTools.map((t: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-accent/10 border-border/50 text-muted-foreground font-mono text-[9px]">
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Operational SOP */}
                        <div className="space-y-6">
                            <Card className="glass h-full flex flex-col">
                                <CardHeader className="p-8 border-b border-border/50">
                                    <CardTitle className="text-xl font-serif flex items-center gap-2">
                                        <ListChecks className="w-5 h-5 text-primary" />
                                        Initial Deployment SOP
                                    </CardTitle>
                                    <CardDescription>Strategic guidance for the agent's first 24h phase.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 flex-1">
                                    <p className="text-foreground leading-relaxed font-light whitespace-pre-wrap">
                                        {profile.initialSOP}
                                    </p>
                                </CardContent>
                                <CardFooter className="p-8 bg-muted/30">
                                    <Button className="gradient-primary w-full h-14 text-lg font-bold rounded-xl shadow-xl shadow-primary/10" onClick={handleDeploy}>
                                        Deploy to Integro OS
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AgentDesignStudio;
