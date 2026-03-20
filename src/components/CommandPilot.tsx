import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Bot,
    X,
    Terminal,
    Sparkles,
    Zap,
    Loader2,
    ChevronRight,
    Eye,
    Activity,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    actions?: any[];
}

export const CommandPilot = () => {
    const {
        pilotActive,
        pilotStatus,
        pilotLog,
        startPilotTask,
        stopPilot,
        aiProvider,
        setAIProvider
    } = useAppStore();

    const [isOpen, setIsOpen] = useState(false);
    const [taskInput, setTaskInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, pilotLog]);

    const sendMessage = async () => {
        if (!taskInput.trim() || isProcessing) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: taskInput,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setTaskInput('');
        setIsProcessing(true);

        try {
            // Call AI Gateway Edge Function
            const { data, error } = await supabase.functions.invoke('ai-assistant', {
                body: {
                    messages: messages.concat([userMessage]).map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    userId: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
                },
            });

            if (error) throw error;

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: data.response.replace(/\[ACTION:.*?\].*?\[\/ACTION\]/g, '').trim(),
                timestamp: data.timestamp,
                actions: data.actions,
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Show action results
            if (data.actions && data.actions.length > 0) {
                data.actions.forEach((action: any) => {
                    if (action.success) {
                        toast.success(action.data?.message || `Action completed: ${action.action}`);
                    } else {
                        toast.error(action.error || `Action failed: ${action.action}`);
                    }
                });
            }
        } catch (error) {
            console.error('AI Assistant Error:', error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `I apologize, I encountered an error: ${error.message}. Please try again.`,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
            toast.error('Failed to communicate with AI assistant');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStart = () => {
        sendMessage();
    };

    return (
        <>
            {/* Floating Trigger */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl z-[100] transition-all duration-500 hover:scale-110",
                    isOpen ? "bg-destructive rotate-90" : "gradient-primary glow-gold"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </Button>

            {/* Pilot Interface */}
            <div className={cn(
                "fixed bottom-24 right-6 w-96 max-h-[600px] z-[100] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-bottom-right",
                isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
            )}>
                <Card className="h-full bg-card/80 backdrop-blur-xl border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                <Activity className={cn("w-4 h-4", (pilotActive || isProcessing) && "animate-pulse")} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold tracking-tight">AI Command Pilot</h3>
                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                                    {isProcessing ? 'THINKING' : 'READY'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-background/40 rounded-full p-0.5 border border-white/5 mr-2">
                                <button
                                    onClick={() => setAIProvider('google')}
                                    className={cn("px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter transition-all", aiProvider === 'google' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}
                                >
                                    Gemini
                                </button>
                                <button
                                    onClick={() => setAIProvider('groq')}
                                    className={cn("px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter transition-all", aiProvider === 'groq' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}
                                >
                                    Groq
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs scrollbar-thin scrollbar-thumb-white/10">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 opacity-50">
                                <Sparkles className="w-8 h-8" />
                                <p className="text-center">Ask me to create campaigns, generate brands, or analyze performance...</p>
                            </div>
                        ) : (
                            messages.map((message, i) => (
                                <div key={i} className={cn(
                                    "flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300",
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                )}>
                                    {message.role === 'assistant' && (
                                        <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0">
                                            <Bot className="w-3 h-3" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-[80%] p-3 rounded-lg",
                                        message.role === 'user'
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-background/50 border border-white/10"
                                    )}>
                                        <p className="leading-relaxed">{message.content}</p>
                                        {message.actions && message.actions.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                                                {message.actions.map((action, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-[10px]">
                                                        {action.success ? (
                                                            <CheckCircle className="w-3 h-3 text-success" />
                                                        ) : (
                                                            <AlertCircle className="w-3 h-3 text-destructive" />
                                                        )}
                                                        <span className="opacity-70">{action.action}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold">YOU</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={logEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/5 border-t border-white/10 space-y-3">
                        {!isProcessing ? (
                            <div className="flex gap-2">
                                <Input
                                    value={taskInput}
                                    onChange={(e) => setTaskInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                                    placeholder="Create a campaign for my coffee shop..."
                                    className="bg-background/50 border-white/10 h-10 text-xs"
                                />
                                <Button onClick={handleStart} className="gradient-primary h-10 px-4">
                                    <Zap className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-3 py-2 text-primary">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">
                                    PROCESSING REQUEST
                                </span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setTaskInput('Create a campaign for my new product with $10,000 budget')}
                                className="text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                            >
                                <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Quick Action</div>
                                <div className="text-[10px] font-medium">Create Campaign</div>
                            </button>
                            <button
                                onClick={() => setTaskInput('Generate a complete brand identity for TechStart Inc')}
                                className="text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                            >
                                <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Quick Action</div>
                                <div className="text-[10px] font-medium">Generate Brand</div>
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
};
