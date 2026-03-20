import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, Cpu, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/stores';
import APIKeyManager from '@/components/APIKeyManager';

const Settings = () => {
    const { aiProvider, setAIProvider } = useAppStore();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <SettingsIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">System Configuration</h1>
                    <p className="text-muted-foreground">Manage your global AI orchestration protocols and API security.</p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* AI Provider Section */}
                <Card className="glass-sovereign border-border/50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-primary" />
                            <div>
                                <CardTitle>AI Intelligence Layer</CardTitle>
                                <CardDescription>Select the primary neural engine for the OS.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-border">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Active Provider</Label>
                                <p className="text-sm text-muted-foreground">
                                    {aiProvider === 'google' ? 'Google Gemini 2.0 Flash' : 'Groq Llama 3 (Ultra-Fast)'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-medium ${aiProvider === 'google' ? 'text-primary' : 'text-muted-foreground'}`}>Google</span>
                                <Switch
                                    checked={aiProvider === 'groq'}
                                    onCheckedChange={(checked) => setAIProvider(checked ? 'groq' : 'google')}
                                />
                                <span className={`text-sm font-medium ${aiProvider === 'groq' ? 'text-primary' : 'text-muted-foreground'}`}>Groq</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-lg border transition-all ${aiProvider === 'google' ? 'border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-border bg-card'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="font-bold text-sm tracking-tight">Google Gemini</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Optimized for creative writing, image analysis, and high-fidelity book synthesis.
                                </p>
                            </div>

                            <div className={`p-4 rounded-lg border transition-all ${aiProvider === 'groq' ? 'border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-border bg-card'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    <span className="font-bold text-sm tracking-tight">Groq (Llama 3)</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    The world's fastest inference engine. Massive throughput for strategy drafting and clinical reasoning.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* API Key Manager Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold font-serif">Credential Vault</h2>
                    </div>
                    <APIKeyManager />
                </section>
            </div>
        </div>
    );
};

export default Settings;
