import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { generateBEASTStrategy } from "@/lib/ai";

export interface AgenticTask {
    id: string;
    name: string;
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
    message: string;
    result?: any;
}

export const useAgenticOrchestrator = () => {
    const [activeTasks, setActiveTasks] = useState<Record<string, AgenticTask>>({});

    const runTask = useCallback(async (taskName: string, payload: any) => {
        const taskId = `task-${Date.now()}`;

        setActiveTasks(prev => ({
            ...prev,
            [taskId]: {
                id: taskId,
                name: taskName,
                status: 'running',
                progress: 10,
                message: 'Initializing AI Agents...'
            }
        }));

        try {
            // Step 1: Logic Orchestration (Primary Edge Function)
            let data, error;
            try {
                const res = await supabase.functions.invoke('generate-strategy', {
                    body: payload
                });
                data = res.data;
                error = res.error;
            } catch (e) {
                console.warn('Edge Function unreachable during orchestration, falling back to local intelligence');
                error = true;
            }

            let resultData;
            if (error) {
                // Fallback: Local Intelligence
                const strategy = await generateBEASTStrategy(
                    payload.businessData,
                    payload.goals || 'General growth',
                    payload.timeframe || '1 year'
                );
                resultData = strategy;
            } else {
                resultData = data.strategy;
            }

            setActiveTasks(prev => ({
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    status: 'completed',
                    progress: 100,
                    message: 'Process Complete: Strategic Intelligence Synchronized',
                    result: resultData
                }
            }));

            toast({
                title: "Agentic Task Complete",
                description: `Successfully executed: ${taskName}`,
            });

            return resultData;

        } catch (error) {
            console.error('Agentic orchestration error:', error);
            setActiveTasks(prev => ({
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    status: 'failed',
                    progress: 100,
                    message: `Process Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            }));

            toast({
                title: "Orchestration Failed",
                description: error instanceof Error ? error.message : "Process interrupted",
                variant: "destructive"
            });
        }
    }, []);

    return {
        activeTasks,
        runTask
    };
};
