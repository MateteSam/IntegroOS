import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Zap, GitBranch, Bell, CheckCircle, Plus, Search, Sparkles, ArrowRight, Play, Settings, Clock, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateWorkflowBlueprint } from '@/lib/ai';
import { useProject, useAppStore } from '@/stores';
import { useWorkflowOrchestrator } from '@/hooks/useWorkflowOrchestrator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const WorkflowBuilder = () => {
    const { toast } = useToast();
    const { activeProject } = useProject();
    const { savedWorkflows, saveWorkflow, deleteWorkflow, savedAgents } = useAppStore();
    const { executions, runWorkflow } = useWorkflowOrchestrator();
    const [isCreating, setIsCreating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [workflowInput, setWorkflowInput] = useState({
        trigger: '',
        objective: '',
    });

    const [blueprint, setBlueprint] = useState<any>(null);

    // Initial contextual suggestions
    React.useEffect(() => {
        if (activeProject && !workflowInput.objective) {
            setWorkflowInput(prev => ({
                ...prev,
                objective: `Automate ${activeProject.name} operations for ${activeProject.brandData.industry}.`
            }));
        }
    }, [activeProject]);

    const handleGenerate = async () => {
        if (!workflowInput.trigger || !workflowInput.objective) {
            toast({ title: "Inputs Required", description: "Please define the trigger and objective.", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const context = activeProject ? `Project: ${activeProject.name}. Industry: ${activeProject.brandData.industry}` : '';
            const result = await generateWorkflowBlueprint(workflowInput.trigger, workflowInput.objective);

            // Map saved agents to steps if they match type
            const enhancedSteps = result.steps.map((step: any) => {
                const matchingAgent = savedAgents.find(a => a.type === step.agent.toLowerCase());
                return {
                    ...step,
                    agentName: matchingAgent ? matchingAgent.name : step.agent,
                    isPersonalized: !!matchingAgent
                };
            });

            setBlueprint({ ...result, steps: enhancedSteps });
            toast({ title: "Blueprint Orchestrated", description: `${result.title} is ready for deployment.` });
        } catch (error) {
            console.error(error);
            toast({ title: "Orchestration Failed", description: "The Workflow Architect encountered a logic loop.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeploy = () => {
        if (blueprint) {
            const newWorkflow = {
                ...blueprint,
                id: `wf-${Date.now()}`,
                trigger: workflowInput.trigger,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            saveWorkflow(newWorkflow);
            toast({ title: "Workflow Deployed", description: `${blueprint.title} has joined the OS orchestration layer.` });
            setBlueprint(null);
            setIsCreating(false);
            setWorkflowInput({ trigger: '', objective: '' });
        }
    };

    const triggers = [
        "Inbound Customer Ticket",
        "New Marketing Lead",
        "Every Friday at 9AM",
        "Social Media Engagement Spike",
        "Internal SOP Milestone"
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-6xl font-serif font-bold text-foreground tracking-tight">
                        Workflow <span className="text-primary italic">Orchestration</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-light">Connect AI agents and external tools into multi-step automated cycles.</p>
                </div>
                <Button className="gradient-primary h-14 px-8 font-bold rounded-2xl glow-gold shadow-lg" onClick={() => setIsCreating(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    New Workflow
                </Button>
            </div>

            {!isCreating && !blueprint ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedWorkflows.map((flow, i) => (
                        <Card key={flow.id} className="glass hover:border-primary/40 transition-all group relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 p-2 z-10">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteWorkflow(flow.id); }}>
                                    <AlertCircle className="w-3 h-3" />
                                </Button>
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="secondary" className="bg-accent/10 text-[8px] uppercase tracking-widest">{flow.trigger}</Badge>
                                    <ShieldCheck className="w-4 h-4 text-primary glow" />
                                </div>
                                <CardTitle className="text-lg font-serif">{flow.title || flow.name}</CardTitle>
                                <CardDescription className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">{flow.impactMetric || 'Optimizing...'}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                {executions[flow.id] && executions[flow.id].status === 'running' ? (
                                    <div className="space-y-2 mt-4">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Running Step {executions[flow.id].currentStepIndex + 1}/{flow.steps.length}</span>
                                            <span className="text-primary animate-pulse">Orchestrating</span>
                                        </div>
                                        <div className="h-1 w-full bg-accent/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${((executions[flow.id].currentStepIndex + 1) / flow.steps.length) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground truncate italic">
                                            &gt; {executions[flow.id].logs[executions[flow.id].logs.length - 1]}
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        className="h-12 w-full mt-4 bg-accent/5 rounded-lg border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
                                        onClick={() => runWorkflow(flow.id)}
                                    >
                                        <Play className={`w-4 h-4 transition-all group-hover:scale-110 ${executions[flow.id]?.status === 'completed' ? 'text-emerald-500' : 'text-muted-foreground group-hover:text-primary'}`} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {savedWorkflows.length === 0 && [
                        { title: 'Support Triage', trigger: 'Inbound Ticket', impact: '85% automated', icon: ShieldCheck },
                        { title: 'Market Intelligence', trigger: 'Weekly/Friday', impact: '12h saved/wk', icon: Clock },
                        { title: 'Growth Pipeline', trigger: 'Brand Mention', impact: '3x reactivity', icon: TrendingUp },
                    ].map((flow, i) => (
                        <Card key={i} className="glass hover:border-primary/40 transition-all cursor-pointer group">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="secondary" className="bg-accent/10 text-[8px] uppercase tracking-widest">{flow.trigger}</Badge>
                                    <flow.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <CardTitle className="text-lg font-serif">{flow.title}</CardTitle>
                                <CardDescription className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">{flow.impact}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-12 w-full bg-accent/5 rounded-lg border border-dashed border-border flex items-center justify-center">
                                    <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:scale-110" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Card onClick={() => setIsCreating(true)} className="glass border-dashed hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center p-8 space-y-4">
                        <div className="w-12 h-12 rounded-full border border-dashed border-muted-foreground flex items-center justify-center">
                            <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Create Automation</p>
                    </Card>
                </div>
            ) : isCreating && !blueprint ? (
                <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
                    <Card className="glass overflow-hidden">
                        <CardHeader className="p-8 border-b border-border/50">
                            <CardTitle className="text-2xl font-serif">Configure Automation</CardTitle>
                            <CardDescription>Model the trigger and objective for the AI to architect.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase tracking-widest font-bold text-primary">Intelligence Trigger</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {triggers.map(t => (
                                        <Button
                                            key={t}
                                            variant="outline"
                                            size="sm"
                                            className={`text-[10px] h-10 border-border/50 ${workflowInput.trigger === t ? 'border-primary bg-primary/5 text-primary' : 'text-muted-foreground'}`}
                                            onClick={() => setWorkflowInput({ ...workflowInput, trigger: t })}
                                        >
                                            {t}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3 pt-4">
                                <Label className="text-[10px] uppercase tracking-widest font-bold text-primary">Business Objective</Label>
                                <Input
                                    className="h-14 bg-accent/5 border-border/50 focus:border-primary/50 text-lg font-light"
                                    placeholder="e.g. Generate social posts from new reports and schedule them."
                                    value={workflowInput.objective}
                                    onChange={(e) => setWorkflowInput({ ...workflowInput, objective: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 bg-muted/30 flex justify-between">
                            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                            <Button className="gradient-primary h-12 px-10 font-bold" onClick={handleGenerate} disabled={isGenerating}>
                                {isGenerating ? <Sparkles className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                                {isGenerating ? "Orchestrating..." : "Orchestrate Cycle"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ) : blueprint && (
                <div className="space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="flex items-center justify-between bg-card border border-border p-6 rounded-2xl shadow-xl border-l-4 border-l-primary">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-serif font-bold text-foreground">{blueprint.title}</h2>
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Triggered by: <span className="text-foreground font-medium">{workflowInput.trigger}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Projected Impact</p>
                            <p className="text-lg font-bold text-emerald-500">{blueprint.impactMetric}</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Orchestration Steps</h3>
                            {blueprint.steps.map((step: any, i: number) => (
                                <div key={i} className="group relative flex gap-6 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                        <span className="text-xs font-bold text-primary">{step.id}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={cn(
                                                "border-primary/20 text-primary text-[8px] tracking-widest uppercase",
                                                step.isPersonalized && "bg-primary/5 border-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                                            )}>
                                                {step.agentName}
                                            </Badge>
                                            <ArrowRight className="w-3 h-3 text-muted-foreground opacity-50" />
                                            <span className="text-sm font-bold text-foreground uppercase tracking-tight">{step.action}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed italic">"{step.output}"</p>
                                    </div>
                                    <div className="absolute left-11 top-16 bottom-[-24px] w-[2px] bg-gradient-to-b from-primary/30 to-transparent group-last:hidden" />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <Card className="glass border-amber-500/20 bg-amber-500/5">
                                <CardHeader>
                                    <CardTitle className="text-amber-500 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Human in the Loop
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground leading-relaxed font-light">
                                        {blueprint.humanInTheLoop}
                                    </p>
                                </CardContent>
                            </Card>

                            <Button className="w-full h-16 gradient-primary font-bold text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all" onClick={handleDeploy}>
                                <CheckCircle className="w-5 h-5 mr-3" />
                                Deploy Workflow
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowBuilder;
