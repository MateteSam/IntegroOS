import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WCCCSProject {
    id: string;
    name: string;
    displayName: string;
    description: string;
    path: string;
    status: 'production' | 'development' | 'staging' | 'archived' | 'planning';
    category: 'saas' | 'microsite' | 'tool' | 'media' | 'marketing' | 'content';
    deploymentUrl?: string;
    domain?: string;
    healthStatus: 'healthy' | 'warning' | 'error' | 'unknown';
    lastDeployed?: Date;
    assignedAgents: string[];
    techStack: string[];
    hosting: 'hostinger' | 'netlify' | 'local' | 'cloudflare';
    githubUrl?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    launchDate?: string;
    gpuOptimized?: boolean;
}

const WCCCS_PROJECTS: WCCCSProject[] = [
    // ═══════════════════════════════════════════
    // LIVE CLOUDFLARE DEPLOYMENTS
    // ═══════════════════════════════════════════
    {
        id: 'studioworks',
        name: 'studioworks-vision',
        displayName: 'WCCCS StudioWorks',
        description: 'Revenue engine & market-facing arm. Premium publishing, design, software, media and consulting.',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\WSCCC\\studioworks-vision',
        status: 'production',
        category: 'microsite',
        domain: 'studioworks.wcccs.io',
        deploymentUrl: 'https://studioworks.wcccs.io',
        githubUrl: 'https://github.com/MateteSam/studioworks-vision',
        healthStatus: 'healthy',
        lastDeployed: new Date('2026-03-07'),
        assignedAgents: ['FrontendDesigner', 'BrandSpecialist', 'SalesAgent'],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Cloudflare Pages'],
        hosting: 'cloudflare',
        priority: 'critical',
        launchDate: '2026-03-07',
        gpuOptimized: false
    },
    {
        id: 'standard-iq',
        name: 'standard-iq-digital',
        displayName: 'Standard IQ',
        description: 'Premium digital magazine exploring standardisation, quality infrastructure and trade across Africa.',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\standard-iq-digital',
        status: 'production',
        category: 'content',
        domain: 'standardiq.online',
        deploymentUrl: 'https://standardiq.online',
        githubUrl: 'https://github.com/MateteSam/standard-iq-digital',
        healthStatus: 'healthy',
        lastDeployed: new Date('2026-03-07'),
        assignedAgents: ['FrontendDesigner', 'DocumentCoAuthor', 'BrandSpecialist'],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'Cloudflare Pages'],
        hosting: 'cloudflare',
        priority: 'high',
        launchDate: '2026-03-07',
        gpuOptimized: false
    },

    // ═══════════════════════════════════════════
    // NETLIFY DEPLOYMENTS
    // ═══════════════════════════════════════════
    {
        id: 'faith-nexus-2026',
        name: 'faithnexusfinal',
        displayName: 'Faith Nexus 2026',
        description: 'Global Virtual Launch platform for the Digital Renaissance',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\WSCCC\\faithnexusfinal',
        status: 'production',
        category: 'microsite',
        domain: 'faithnexus.digital',
        deploymentUrl: 'https://faith-connect-create.netlify.app',
        githubUrl: 'https://github.com/MateteSam/faithnexusfinal',
        healthStatus: 'healthy',
        lastDeployed: new Date('2026-01-20'),
        assignedAgents: ['FrontendDesigner', 'BrandSpecialist'],
        techStack: ['HTML', 'CSS', 'JavaScript', 'Netlify'],
        hosting: 'netlify',
        priority: 'high',
        gpuOptimized: false
    },

    // ═══════════════════════════════════════════
    // CORE SAAS PRODUCTS — IN DEVELOPMENT
    // ═══════════════════════════════════════════
    {
        id: 'talkworld',
        name: 'talkworld-platform',
        displayName: 'TalkWorld',
        description: 'Social media & virtual meeting platform for creators — AI-native content engine',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\TalkWorld',
        status: 'production',
        category: 'saas',
        domain: 'talkworld.digital',
        deploymentUrl: 'https://talkworld.digital',
        githubUrl: 'https://github.com/MateteSam/TalkWorld',
        healthStatus: 'healthy',
        lastDeployed: new Date('2026-03-07'),
        assignedAgents: ['FrontendDesigner', 'TestingEngineer', 'BrandSpecialist'],
        techStack: ['React 19', 'Vite', 'Tailwind CSS', 'Google Gemini AI', 'Supabase', 'WebRTC', 'Cloudflare Pages'],
        hosting: 'cloudflare',
        priority: 'critical',
        launchDate: '2026-03-07',
        gpuOptimized: true
    },
    {
        id: 'onixone',
        name: 'onixone',
        displayName: 'ONIXone',
        description: 'Document generation and PDF management platform',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\onixone',
        status: 'development',
        category: 'saas',
        domain: 'onixone.digital',
        githubUrl: 'https://github.com/MateteSam/onixone',
        healthStatus: 'unknown',
        assignedAgents: ['DocumentEngineer', 'FrontendDesigner', 'TestingEngineer'],
        techStack: ['React 19', 'TipTap Editor', 'PDF-lib', 'Mammoth', 'Y.js'],
        hosting: 'hostinger',
        priority: 'high',
        gpuOptimized: true
    },
    {
        id: 'prolens',
        name: 'prolens',
        displayName: 'ProLens AI Studio',
        description: 'High-fidelity image processing — Genesis Engine color science & AI enhancement',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\ProLens',
        status: 'development',
        category: 'tool',
        domain: 'prolense.digital',
        githubUrl: 'https://github.com/MateteSam/ProLens',
        healthStatus: 'unknown',
        assignedAgents: ['FrontendDesigner', 'WebArtifactBuilder'],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Python Backend', 'GFPGAN', 'Real-ESRGAN'],
        hosting: 'hostinger',
        priority: 'high',
        gpuOptimized: true
    },
    {
        id: 'bookarchitect-ai',
        name: 'bookarchitect-ai',
        displayName: 'BookArchitect-AI',
        description: "Author's Command Center for manuscript orchestration",
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\bookarchitect-ai',
        status: 'development',
        category: 'tool',
        healthStatus: 'healthy',
        assignedAgents: ['DocumentEngineer', 'FrontendDesigner'],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Google Gemini AI'],
        hosting: 'local',
        priority: 'medium',
        gpuOptimized: true
    },

    // ═══════════════════════════════════════════
    // MEDIA & BROADCASTING
    // ═══════════════════════════════════════════
    {
        id: 'ocean-city-radio',
        name: 'pixel-perfect-replica',
        displayName: 'Ocean City Radio (OCR FM)',
        description: 'Online and FM radio station platform — live streaming & broadcast',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\pixel-perfect-replica',
        status: 'development',
        category: 'media',
        domain: 'ocrfm.online',
        githubUrl: 'https://github.com/MateteSam/pixel-perfect-replica',
        healthStatus: 'unknown',
        assignedAgents: ['FrontendDesigner', 'BrandSpecialist'],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Python Backend'],
        hosting: 'hostinger',
        priority: 'medium',
        gpuOptimized: false
    },
    {
        id: 'content-world',
        name: 'nex-magazine-refresh',
        displayName: 'Content World',
        description: 'Digital magazine platform — Africa content hub',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\nex-magazine-refresh',
        status: 'development',
        category: 'content',
        domain: 'contentworld.online',
        healthStatus: 'unknown',
        assignedAgents: ['FrontendDesigner', 'DocumentCoAuthor'],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'react-pageflip'],
        hosting: 'hostinger',
        priority: 'medium',
        gpuOptimized: false
    },

    // ═══════════════════════════════════════════
    // PLANNING STAGE
    // ═══════════════════════════════════════════
    {
        id: 'wcccs-main',
        name: 'wcccs',
        displayName: 'WCCCS Main Website',
        description: 'Official WCCCS business website and service portal',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\wcccs',
        status: 'development',
        category: 'microsite',
        domain: 'wcccs.io',
        healthStatus: 'unknown',
        assignedAgents: ['FrontendDesigner', 'BrandSpecialist'],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Framer Motion'],
        hosting: 'hostinger',
        priority: 'high',
        gpuOptimized: false
    },
    {
        id: '300-million-connections',
        name: '300-million-connections',
        displayName: '300 Million Connections',
        description: 'Global marketing campaign and outreach initiative',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\300-million-connections',
        status: 'planning',
        category: 'marketing',
        healthStatus: 'unknown',
        assignedAgents: ['BrandSpecialist', 'FrontendDesigner', 'InternalComms'],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Firebase'],
        hosting: 'hostinger',
        priority: 'medium',
        gpuOptimized: false
    },
    {
        id: 'god-lives-in-sandton',
        name: 'god-lives-in-sandton-book',
        displayName: 'God Lives in Sandton',
        description: 'Book project marketing and pre-order platform',
        path: 'C:\\Users\\admin\\OneDrive\\Documents\\god-lives-in-sandton-book',
        status: 'planning',
        category: 'marketing',
        healthStatus: 'unknown',
        assignedAgents: ['DocumentCoAuthor', 'BrandSpecialist'],
        techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
        hosting: 'hostinger',
        priority: 'low',
        gpuOptimized: false
    }
];

const CUSTOM_PROJECTS_KEY = 'integro-custom-projects';
const ACTIVE_PROJECT_KEY = 'integro-active-project';

// Load custom projects from localStorage
function loadCustomProjects(): WCCCSProject[] {
    try {
        const saved = localStorage.getItem(CUSTOM_PROJECTS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('[ProjectRegistry] Failed to load custom projects:', e);
    }
    return [];
}

// Save custom projects to localStorage
function saveCustomProjects(projects: WCCCSProject[]): void {
    try {
        localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(projects));
    } catch (e) {
        console.warn('[ProjectRegistry] Failed to save custom projects:', e);
    }
}

interface ProjectRegistryContextType {
    // Data
    projects: WCCCSProject[];
    customProjects: WCCCSProject[];
    activeProject: WCCCSProject | null;

    // Setters
    setActiveProject: (project: WCCCSProject) => void;

    // CRUD Operations
    addProject: (project: Omit<WCCCSProject, 'id'> & { id?: string }) => WCCCSProject;
    removeProject: (id: string) => boolean;
    updateProject: (id: string, updates: Partial<WCCCSProject>) => WCCCSProject | null;
    updateProjectHealth: (id: string, health: 'healthy' | 'warning' | 'error') => void;

    // Queries
    getProjectById: (id: string) => WCCCSProject | undefined;
    getProjectsByCategory: (category: string) => WCCCSProject[];
    getProjectsByStatus: (status: string) => WCCCSProject[];
    getProjectsByHosting: (hosting: string) => WCCCSProject[];
    getProjectsByPriority: (priority: string) => WCCCSProject[];
    searchProjects: (query: string) => WCCCSProject[];

    // Bulk Operations
    refreshProjects: () => void;
    exportProjects: () => string;
    importProjects: (json: string) => number;
}

const ProjectRegistryContext = createContext<ProjectRegistryContextType | undefined>(undefined);

export const ProjectRegistryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customProjects, setCustomProjects] = useState<WCCCSProject[]>(() => loadCustomProjects());
    const [coreProjects, setCoreProjects] = useState<WCCCSProject[]>(WCCCS_PROJECTS);

    // Combine core and custom projects
    const projects = [...coreProjects, ...customProjects];

    const [activeProject, setActiveProjectState] = useState<WCCCSProject | null>(() => {
        try {
            const savedId = localStorage.getItem(ACTIVE_PROJECT_KEY);
            if (savedId) {
                const allProjects = [...WCCCS_PROJECTS, ...loadCustomProjects()];
                return allProjects.find(p => p.id === savedId) || null;
            }
        } catch (e) {
            console.warn('[ProjectRegistry] Failed to load active project:', e);
        }
        return WCCCS_PROJECTS.find(p => p.id === 'faith-nexus-2026') || null;
    });

    // Persist custom projects when they change
    React.useEffect(() => {
        saveCustomProjects(customProjects);
    }, [customProjects]);

    const setActiveProject = (project: WCCCSProject) => {
        setActiveProjectState(project);
        localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    };

    // CRUD Operations
    const addProject = (projectData: Omit<WCCCSProject, 'id'> & { id?: string }): WCCCSProject => {
        const id = projectData.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newProject: WCCCSProject = {
            ...projectData,
            id,
            healthStatus: projectData.healthStatus || 'unknown',
            assignedAgents: projectData.assignedAgents || [],
            techStack: projectData.techStack || [],
        } as WCCCSProject;

        setCustomProjects(prev => [...prev, newProject]);
        console.log('[ProjectRegistry] Added project:', newProject.displayName);
        return newProject;
    };

    const removeProject = (id: string): boolean => {
        // Check if it's a core project (can't delete those)
        if (coreProjects.some(p => p.id === id)) {
            console.warn('[ProjectRegistry] Cannot remove core project:', id);
            return false;
        }

        const exists = customProjects.some(p => p.id === id);
        if (!exists) {
            console.warn('[ProjectRegistry] Project not found:', id);
            return false;
        }

        setCustomProjects(prev => prev.filter(p => p.id !== id));

        // If the removed project was active, clear it
        if (activeProject?.id === id) {
            setActiveProjectState(null);
            localStorage.removeItem(ACTIVE_PROJECT_KEY);
        }

        console.log('[ProjectRegistry] Removed project:', id);
        return true;
    };

    const updateProject = (id: string, updates: Partial<WCCCSProject>): WCCCSProject | null => {
        // Check if it's a core project
        const coreIndex = coreProjects.findIndex(p => p.id === id);
        if (coreIndex !== -1) {
            setCoreProjects(prev => prev.map(p =>
                p.id === id ? { ...p, ...updates } : p
            ));
            const updated = { ...coreProjects[coreIndex], ...updates };

            // Update active project if it's the same
            if (activeProject?.id === id) {
                setActiveProjectState(updated);
            }

            return updated;
        }

        // Check custom projects
        const customIndex = customProjects.findIndex(p => p.id === id);
        if (customIndex !== -1) {
            const updated = { ...customProjects[customIndex], ...updates };
            setCustomProjects(prev => prev.map(p =>
                p.id === id ? updated : p
            ));

            // Update active project if it's the same
            if (activeProject?.id === id) {
                setActiveProjectState(updated);
            }

            return updated;
        }

        console.warn('[ProjectRegistry] Project not found for update:', id);
        return null;
    };

    const updateProjectHealth = (id: string, health: 'healthy' | 'warning' | 'error') => {
        updateProject(id, { healthStatus: health });
    };

    // Query Methods
    const getProjectById = (id: string) => projects.find(p => p.id === id);

    const getProjectsByCategory = (category: string) =>
        projects.filter(p => p.category === category);

    const getProjectsByStatus = (status: string) =>
        projects.filter(p => p.status === status);

    const getProjectsByHosting = (hosting: string) =>
        projects.filter(p => p.hosting === hosting);

    const getProjectsByPriority = (priority: string) =>
        projects.filter(p => p.priority === priority);

    const searchProjects = (query: string): WCCCSProject[] => {
        const lowerQuery = query.toLowerCase();
        return projects.filter(p =>
            p.displayName.toLowerCase().includes(lowerQuery) ||
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            p.techStack.some(t => t.toLowerCase().includes(lowerQuery))
        );
    };

    // Bulk Operations
    const refreshProjects = () => {
        // Reload custom projects from storage
        setCustomProjects(loadCustomProjects());
        console.log('[ProjectRegistry] Projects refreshed');
    };

    const exportProjects = (): string => {
        return JSON.stringify({
            coreProjects,
            customProjects,
            exportedAt: new Date().toISOString()
        }, null, 2);
    };

    const importProjects = (json: string): number => {
        try {
            const data = JSON.parse(json);
            if (data.customProjects && Array.isArray(data.customProjects)) {
                // Merge with existing, avoiding duplicates
                const newProjects = data.customProjects.filter(
                    (p: WCCCSProject) => !customProjects.some(ep => ep.id === p.id)
                );
                setCustomProjects(prev => [...prev, ...newProjects]);
                return newProjects.length;
            }
        } catch (e) {
            console.error('[ProjectRegistry] Failed to import projects:', e);
        }
        return 0;
    };

    return (
        <ProjectRegistryContext.Provider value={{
            projects,
            customProjects,
            activeProject,
            setActiveProject,
            addProject,
            removeProject,
            updateProject,
            updateProjectHealth,
            getProjectById,
            getProjectsByCategory,
            getProjectsByStatus,
            getProjectsByHosting,
            getProjectsByPriority,
            searchProjects,
            refreshProjects,
            exportProjects,
            importProjects
        }}>
            {children}
        </ProjectRegistryContext.Provider>
    );
};

export const useProjectRegistry = () => {
    const context = useContext(ProjectRegistryContext);
    if (!context) {
        throw new Error('useProjectRegistry must be used within ProjectRegistryProvider');
    }
    return context;
};
