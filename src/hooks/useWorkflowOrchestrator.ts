import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/stores';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export type WorkflowStepStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface WorkflowExecutionState {
    status: WorkflowStepStatus;
    currentStepIndex: number;
    logs: string[];
    results: Record<string, any>;
}

export const useWorkflowOrchestrator = () => {
    const { savedWorkflows } = useAppStore();
    const [executions, setExecutions] = useState<Record<string, WorkflowExecutionState>>({});
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    // Initialize Socket Connection
    useEffect(() => {
        if (!user) return;

        const newSocket = io('http://localhost:5000', {
            transports: ['websocket'],
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Connected to Backend Telemetry Socket');
            newSocket.emit('join_user_room', { user_id: user.id });
        });

        newSocket.on('workflow_status', (data) => {
            const { workflow_id, message } = data;
            setExecutions(prev => ({
                ...prev,
                [workflow_id]: {
                    ...prev[workflow_id],
                    logs: [...(prev[workflow_id]?.logs || []), message]
                }
            }));
        });

        newSocket.on('workflow_step_complete', (data) => {
            const { workflow_id, step_result } = data;
            setExecutions(prev => {
                const existing = prev[workflow_id] || { logs: [], results: {}, currentStepIndex: 0 };
                return {
                    ...prev,
                    [workflow_id]: {
                        ...existing,
                        currentStepIndex: existing.currentStepIndex + 1,
                        logs: [...existing.logs, `Result: ${step_result.result_text.substring(0, 50)}...`],
                        results: {
                            ...existing.results,
                            [step_result.action]: step_result
                        }
                    }
                };
            });
        });

        newSocket.on('workflow_complete', (data) => {
            const { workflow_id, summary } = data;
            setExecutions(prev => ({
                ...prev,
                [workflow_id]: {
                    ...prev[workflow_id],
                    status: 'completed',
                    logs: [...(prev[workflow_id]?.logs || []), `✅ Orchestration Complete: ${summary}`]
                }
            }));
            toast.success(`Workflow execution finished natively.`);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const runWorkflow = useCallback(async (workflowId: string, initialContext: string = '') => {
        const workflow = savedWorkflows.find(w => w.id === workflowId);
        if (!workflow) {
            toast.error('Workflow not found');
            return;
        }

        setExecutions(prev => ({
            ...prev,
            [workflowId]: {
                status: 'running',
                currentStepIndex: 0,
                logs: [`Initializing Backend Orchestration for: ${workflow.name}`],
                results: {}
            }
        }));

        try {
            // Send the entire workflow payload to the Python backend to run natively
            const response = await fetch('http://localhost:5000/api/agents/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Simulate auth header since we bypassed
                    'Authorization': `Bearer ${user?.id || 'dev-admin'}`
                },
                body: JSON.stringify({
                    workflow_id: workflowId,
                    steps: workflow.steps,
                    initial_context: `Objective: ${workflow.objective}\nTrigger: ${workflow.trigger}\nInitial Context: ${initialContext}`
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to dispatch workflow to backend engine.');
            }

            const data = await response.json();

            setExecutions(prev => ({
                ...prev,
                [workflowId]: {
                    ...prev[workflowId],
                    logs: [...(prev[workflowId]?.logs || []), `⚙️ Background Task Created (ID: ${data.task_id || 'sync-run'})`]
                }
            }));

        } catch (error: any) {
            console.error(`Workflow execution failed to start:`, error);
            setExecutions(prev => ({
                ...prev,
                [workflowId]: {
                    ...(prev[workflowId] || { currentStepIndex: 0, results: {}, logs: [] }),
                    status: 'failed',
                    logs: [...(prev[workflowId]?.logs || []), `CRITICAL ERROR: ${error.message}`]
                }
            }));
            toast.error(`Workflow dispatch failed: ${error.message}`);
        }
    }, [savedWorkflows, user]);

    return {
        executions,
        runWorkflow
    };
};
