import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for the Neural OS
export interface BrandData {
    // Stage 1: Business Foundation
    businessName: string;
    industry: string;
    foundedYear: string;
    competitorUrls: string[];

    // Stage 2: Brand Soul
    mission: string;
    vision: string;
    values: string[];
    brandStory: string;

    // Stage 3: Target Market
    targetAudience: string;
    customerPainPoints: string;
    customerAspirations: string;
    geographicMarkets: string;

    // Stage 4: Brand Personality
    brandArchetype: string;
    brandPersonality: string;
    brandAdjectives: string[];
    communicationStyle: string;
    emotionalGoal: string;

    // Stage 5: Visual Preferences
    stylePreferences: string[];
    colorPreferences: string;
    colorRestrictions: string;
    logoStyle: string;

    // Stage 6: Competitive Landscape
    directCompetitors: string;
    marketPositioning: string;
    differentiation: string;

    // Generated Brand Assets
    generatedBrand?: any;
}

export const defaultBrandData: BrandData = {
    businessName: '',
    industry: '',
    foundedYear: '',
    competitorUrls: [],
    mission: '',
    vision: '',
    values: [],
    brandStory: '',
    targetAudience: '',
    customerPainPoints: '',
    customerAspirations: '',
    geographicMarkets: '',
    brandArchetype: '',
    brandPersonality: '',
    brandAdjectives: [],
    communicationStyle: 'balanced',
    emotionalGoal: '',
    stylePreferences: [],
    colorPreferences: '',
    colorRestrictions: '',
    logoStyle: '',
    directCompetitors: '',
    marketPositioning: 'mid-market',
    differentiation: '',
};

export interface Project {
    id: string;
    name: string;
    type: 'startup' | 'campaign' | 'personal_brand';
    lastModified: Date;
    brandData: BrandData;
}

const MOCK_PROJECT: Project = {
    id: 'genesis-01',
    name: 'Sovereign Marketing Initiative',
    type: 'campaign',
    lastModified: new Date(),
    brandData: {
        ...defaultBrandData,
        businessName: 'Sovereign Marketing',
        mission: 'To orchestrate business intelligence',
        industry: 'Technology',
        brandPersonality: 'Authoritative',
        values: ['Sovereignty', 'Intelligence', 'Orchestration']
    }
};

interface ProjectContextType {
    activeProject: Project | null;
    projects: Project[];
    setActiveProject: (project: Project) => void;
    createProject: (name: string, type: Project['type']) => void;
    updateBrandData: (data: Partial<BrandData>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const [activeProject, setActiveProject] = useState<Project | null>(MOCK_PROJECT);
    const [projects, setProjects] = useState<Project[]>([MOCK_PROJECT]);

    const createProject = (name: string, type: Project['type']) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name,
            type,
            lastModified: new Date(),
            brandData: defaultBrandData
        };
        setProjects(prev => [...prev, newProject]);
        setActiveProject(newProject);
    };

    const updateBrandData = (data: Partial<BrandData>) => {
        if (!activeProject) return;
        const updated = {
            ...activeProject,
            brandData: { ...activeProject.brandData, ...data }
        };
        setActiveProject(updated);
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    return (
        <ProjectContext.Provider value={{
            activeProject,
            projects,
            setActiveProject,
            createProject,
            updateBrandData
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
