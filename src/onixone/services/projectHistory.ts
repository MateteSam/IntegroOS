import { ProjectData } from '../types';

const STORAGE_KEY = 'onixone_project_history';
const MAX_HISTORY_ITEMS = 20;

export interface ProjectHistoryItem {
    id: string; // timestamp as ID
    title: string;
    author: string;
    lastEdited: number;
    wordCount: number;
    pageCount: number;
    progress: number;
    coverImage?: string; // Base64 thumbnail
    templateId: string;
    type: string; // e.g., 'Novel', 'Textbook'
}

export interface DashboardAnalytics {
    totalProjects: number;
    totalWords: number;
    averageProgress: number;
    completionRate: number;
}

export const ProjectHistoryService = {
    getRecentProjects(): ProjectHistoryItem[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse project history', e);
            return [];
        }
    },

    saveProject(project: ProjectData): void {
        try {
            const history = this.getRecentProjects();

            // Calculate derived stats
            const wordCount = project.storyBlocks.reduce((acc, block) => {
                if ((block.type === 'paragraph' || block.type === 'chapter' || block.type === 'heading') && 'text' in block) {
                    return acc + ((block as any).text?.split(/\s+/).length || 0);
                }
                return acc;
            }, 0);

            const newItem: ProjectHistoryItem = {
                id: project.timestamp.toString(),
                title: project.metadata?.title || 'Untitled Project',
                author: project.metadata?.authors?.[0] || 'Unknown Author',
                lastEdited: Date.now(),
                wordCount: wordCount,
                pageCount: project.metadata?.pageCount || 0,
                progress: 10, // Placeholder logic for now, could be based on chapter count
                templateId: project.templateStyle?.id || 'unknown',
                type: project.templateStyle?.category || 'General',
                // In a real app, generate a thumbnail here. For now, we might skip or use a placeholder if not present.
                // potentially store a small preview if we have one.
            };

            // Remove existing entry if exists (update it)
            const filtered = history.filter(h => h.id !== newItem.id);

            // Add new item to top
            const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        } catch (e) {
            console.error('Failed to save project history', e);
        }
    },

    getAnalytics(): DashboardAnalytics {
        const projects = this.getRecentProjects();
        const totalWords = projects.reduce((acc, p) => acc + p.wordCount, 0);
        const totalProjects = projects.length;
        const averageProgress = totalProjects > 0
            ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects)
            : 0;

        return {
            totalProjects,
            totalWords,
            averageProgress,
            completionRate: 98, // Mocked 'system' stat
        };
    }
};
