// Using native crypto.randomUUID instead of uuid package

export interface AntigravityTask {
    id: string;
    projectId: string;
    agentType: string;
    instruction: string;
    context: {
        currentFiles: string[];
        projectGoals: string;
        constraints: string[];
    };
    priority: 'urgent' | 'high' | 'normal' | 'low';
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
}

export interface AntigravityResponse {
    taskId: string;
    status: 'completed' | 'in-progress' | 'failed';
    output: {
        filesModified: string[];
        filesCreated: string[];
        summary: string;
        nextSteps?: string[];
    };
    conversationContext: string;
}

class AntigravityBridge {
    private taskQueue: AntigravityTask[] = [];
    private conversationHistory: string[] = [];

    /**
     * Submit a task to Antigravity for processing
     */
    async submitTask(task: Omit<AntigravityTask, 'id' | 'status' | 'createdAt'>): Promise<string> {
        const fullTask: AntigravityTask = {
            ...task,
            id: crypto.randomUUID(),
            status: 'pending',
            createdAt: new Date()
        };

        this.taskQueue.push(fullTask);

        // Store task in localStorage for persistence
        this.persistTaskQueue();

        // In a real implementation, this would send the task to Antigravity
        // For now, we'll simulate by logging the structured request
        console.log('[Antigravity Bridge] Task Submitted:', {
            taskId: fullTask.id,
            instruction: fullTask.instruction,
            context: fullTask.context
        });

        return fullTask.id;
    }

    /**
     * Get task status
     */
    getTaskStatus(taskId: string): AntigravityTask | undefined {
        return this.taskQueue.find(t => t.id === taskId);
    }

    /**
     * Get all tasks for a project
     */
    getProjectTasks(projectId: string): AntigravityTask[] {
        return this.taskQueue.filter(t => t.projectId === projectId);
    }

    /**
     * Update task status (called when Antigravity responds)
     */
    updateTaskStatus(taskId: string, status: AntigravityTask['status'], response?: AntigravityResponse) {
        const taskIndex = this.taskQueue.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.taskQueue[taskIndex].status = status;
            if (status === 'completed' || status === 'failed') {
                this.taskQueue[taskIndex].completedAt = new Date();
            }

            if (response) {
                this.conversationHistory.push(response.conversationContext);
            }

            this.persistTaskQueue();
        }
    }

    /**
     * Get conversation context for continuity
     */
    getConversationContext(): string {
        return this.conversationHistory.join('\n\n---\n\n');
    }

    /**
     * Clear completed tasks
     */
    clearCompletedTasks() {
        this.taskQueue = this.taskQueue.filter(t => t.status !== 'completed');
        this.persistTaskQueue();
    }

    /**
     * Persist task queue to localStorage
     */
    private persistTaskQueue() {
        try {
            localStorage.setItem('antigravity-task-queue', JSON.stringify(this.taskQueue));
        } catch (error) {
            console.error('[Antigravity Bridge] Failed to persist task queue:', error);
        }
    }

    /**
     * Load task queue from localStorage
     */
    loadTaskQueue() {
        try {
            const stored = localStorage.getItem('antigravity-task-queue');
            if (stored) {
                this.taskQueue = JSON.parse(stored);
            }
        } catch (error) {
            console.error('[Antigravity Bridge] Failed to load task queue:', error);
        }
    }

    /**
     * Format task for Antigravity consumption
     */
    formatTaskForAntigravity(task: AntigravityTask): string {
        return `
# Antigravity Task Request

**Task ID**: ${task.id}
**Project**: ${task.projectId}
**Agent Type**: ${task.agentType}
**Priority**: ${task.priority}

## Instruction
${task.instruction}

## Context
**Current Files**: ${task.context.currentFiles.join(', ')}
**Project Goals**: ${task.context.projectGoals}
**Constraints**: ${task.context.constraints.join(', ')}

## Expected Response Format
Please provide:
1. Summary of changes made
2. List of files modified/created
3. Next steps (if any)
4. Conversation context for continuity
        `.trim();
    }
}

// Singleton instance
export const antigravityBridge = new AntigravityBridge();

// Load persisted tasks on initialization
antigravityBridge.loadTaskQueue();
