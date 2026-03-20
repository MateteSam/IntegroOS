import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StateCreator } from 'zustand';

// --- Slice Types ---

interface ThemeSlice {
  theme: 'light' | 'dark' | 'system';
  mode: 'light' | 'dark';
  aiProvider: 'google' | 'groq';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  setAIProvider: (provider: 'google' | 'groq') => void;
}

interface UserSlice {
  user: any | null;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  clearUser: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface NotificationSlice {
  notifications: any[];
  unreadNotificationsCount: number;
  addNotification: (notification: any) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

interface ProjectSlice {
  activeProject: any | null;
  projects: any[];
  savedWorkflows: any[];
  setActiveProject: (project: any) => void;
  createProject: (name: string, type: string) => void;
  updateBrandData: (data: Partial<any>) => void;
  saveWorkflow: (workflow: any) => void;
  deleteWorkflow: (workflowId: string) => void;
}

interface AgentSlice {
  activeTasks: Record<string, any>;
  savedAgents: any[];
  addAgentTask: (taskId: string, task: any) => void;
  updateAgentTask: (taskId: string, updates: Partial<any>) => void;
  removeAgentTask: (taskId: string) => void;
  saveAgent: (agent: any) => void;
  deleteAgent: (agentId: string) => void;
}

interface PilotSlice {
  pilotActive: boolean;
  pilotTask: string | null;
  pilotStatus: 'idle' | 'thinking' | 'acting' | 'completed' | 'failed';
  pilotHistory: any[];
  pilotLog: string[];
  setPilotActive: (active: boolean) => void;
  startPilotTask: (task: string) => Promise<void>;
  stopPilot: () => void;
}

type RootStore = ThemeSlice & UserSlice & NotificationSlice & ProjectSlice & AgentSlice & PilotSlice & {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

// --- Slices Implementation ---

const createThemeSlice: StateCreator<RootStore, [], [], ThemeSlice> = (set, get) => ({
  theme: 'dark',
  mode: 'dark',
  setTheme: (theme) => {
    const mode = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    set({ theme, mode });
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
  },
  toggleTheme: () => {
    const newMode = get().mode === 'dark' ? 'light' : 'dark';
    get().setTheme(newMode);
  },
  aiProvider: 'groq',
  setAIProvider: (aiProvider) => set({ aiProvider }),
});

const createUserSlice: StateCreator<RootStore, [], [], UserSlice> = (set, get) => ({
  user: {
    id: '00000000-0000-0000-0000-000000000000',
    full_name: 'Sovereign Administrator',
    email: 'admin@sovereign.os',
  },
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: true, error: null }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const mockUser = { id: '1', name: 'Demo User', email };
      await new Promise(resolve => setTimeout(resolve, 1000));
      get().setUser(mockUser);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to login' });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: () => get().clearUser(),
});

const createNotificationSlice: StateCreator<RootStore, [], [], NotificationSlice> = (set) => ({
  notifications: [],
  unreadNotificationsCount: 0,
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadNotificationsCount: state.unreadNotificationsCount + 1,
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
  })),
  clearNotifications: () => set({ notifications: [], unreadNotificationsCount: 0 }),
});

const createProjectSlice: StateCreator<RootStore, [], [], ProjectSlice> = (set, get) => ({
  activeProject: {
    id: 'proj-wcccs-2026',
    name: 'WCCCS 2026: Faith Nexus Global Summit',
    type: 'Infrastructure & Platforms',
    lastModified: new Date(),
    brandData: {
      businessName: 'Faith Nexus',
      industry: 'Ministry & Media',
      mission: 'Kingdom Voices. Global Reach.',
      vision: 'A global convergence of theology, creativity and Kingdom influence.',
      values: ['Honour', 'Innovation', 'Covenant'],
      financials: {
        totalBudget: 'R3,000,000',
        marketingPrelaunch: 'R330,000',
        monthlySalaryBurn: 'R105,000',
        infrastructureAllotment: 'R1,000,000'
      },
      launchDates: {
        talkWorld: '2026-02-27',
        virtualPrelaunch: '2026-03-27',
        faithNexus: '2026-10-20'
      },
      preLaunchStrategy: {
        theme: 'The Velocity of Vision',
        platform: 'Talk World',
        budget: 'R330,000',
        highlights: [
          'Live Curation Speedrun',
          'ONIXone Syntactic Layout',
          'Retail Distribution Snap',
          'FaithNexus100 Honors'
        ]
      },
      assets: {
        hero: '/images/branding/wcccs_hero.png',
        talkWorld: '/images/branding/talk_world.png',
        onixone: '/images/branding/onixone.png',
        prolense: '/images/branding/prolense.png',
        summitPoster: '/images/branding/summit/faith_nexus_poster.png'
      }
    }
  },
  projects: [
    {
      id: 'proj-wcccs-core',
      name: 'WCCCS Core',
      type: 'Infrastructure & Platforms',
      lastModified: new Date(),
      brandData: {
        businessName: 'WCCCS',
        industry: 'Faith-based Digital Infrastructure & Multi-Platform Media',
        mission: 'To build modern platforms that empower people to solve global challenges.',
        vision: 'To accelerate human progress through digital excellence.',
        values: ['Strategic Excellence', 'Faith-driven', 'Platform-first', 'Ecosystem mindset'],
        financials: {
          totalBudget: 'R3,000,000',
          monthlySalaryBurn: 'R105,000',
          infrastructureAllotment: 'R1,000,000',
          teamAllocation: {
            founders: 'R50,000',
            growthOps: 'R20,000',
            complianceOps: 'R18,000',
            creativeTech: 'R17,000'
          }
        },
        launchDates: {
          talkWorld: '2026-02-27',
          virtualPrelaunch: '2026-03-27',
          faithNexus: '2026-10-20'
        },
        preLaunchStrategy: {
          theme: 'The Velocity of Vision',
          platform: 'Talk World',
          highlights: ['Live Curation Speedrun', 'ONIXone Syntactic Layout', 'Retail Distribution Snap']
        },
        assets: {
          hero: '/images/branding/wcccs_hero.png',
          talkWorld: '/images/branding/talk_world.png',
          onixone: '/images/branding/onixone.png',
          prolense: '/images/branding/prolense.png'
        }
      }
    }
  ],
  savedWorkflows: [
    {
      id: 'wf-wcccs-prelaunch-01',
      name: 'Manuscript to Marketplace (March 27)',
      objective: 'Launch virtual book series on Talk World via ONIXone/ProLense orchestration.',
      steps: [
        { id: 'step-1', label: 'ProLense Ingestion', status: 'completed', description: 'AI curation and cinema-grade processing of jacket visuals.' },
        { id: 'step-2', label: 'ONIXone Syntactic Layout', status: 'current', description: 'Auto-paginating manuscript and generating ONIX 3.0 metadata.' },
        { id: 'step-3', label: 'Talk World Theater Sync', status: 'pending', description: 'Pushing interactive series to the Online TV infrastructure.' },
        { id: 'step-4', label: 'Nexus Global Distribution', status: 'pending', description: 'One-click retail package distribution to Amazon/Ingram.' }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  setActiveProject: (project) => set({ activeProject: project }),
  createProject: (name, type) => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name,
      type,
      lastModified: new Date(),
      brandData: { businessName: '', industry: '', values: [] }
    };
    set((state) => ({
      projects: [...state.projects, newProject],
      activeProject: newProject
    }));
  },
  updateBrandData: (data) => {
    const activeProject = get().activeProject;
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      brandData: { ...activeProject.brandData, ...data },
      lastModified: new Date()
    };
    set((state) => ({
      activeProject: updated,
      projects: state.projects.map(p => p.id === updated.id ? updated : p)
    }));
  },
  saveWorkflow: (workflow) => set((state) => ({
    savedWorkflows: [workflow, ...state.savedWorkflows.filter(w => w.id !== workflow.id)]
  })),
  deleteWorkflow: (workflowId) => set((state) => ({
    savedWorkflows: state.savedWorkflows.filter(w => w.id !== workflowId)
  })),
});

const createAgentSlice: StateCreator<RootStore, [], [], AgentSlice> = (set) => ({
  activeTasks: {},
  savedAgents: [
    {
      id: 'agent-wcccs-prolense-01',
      name: 'ProLense Visual Concierge',
      type: 'growth',
      personality: 'Esthetic & Fast',
      accentColor: '#f43f5e',
      responsibilities: [
        'AI Curation & Tagging for Magazine Visuals',
        'Cinema-grade Processing for Book Jackets',
        'Visual Asset Delivery to ONIXone Layouts'
      ],
      suggestedTools: ['MediaFoundry', 'DesignCanvas'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'agent-wcccs-onixone-01',
      name: 'ONIXone Metadata Guardian',
      type: 'ops',
      personality: 'Clinical & Precise',
      accentColor: '#3b82f6',
      responsibilities: [
        'Ensure 100% ONIX 3.0 Compliance',
        'Auto-Assign ISBN/ISSN & Barcodes',
        'Orchestrate Manuscript to Press-Ready PDF'
      ],
      suggestedTools: ['WorkflowBuilder', 'StrategicInsight'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'agent-wcccs-nexus-01',
      name: 'Nexus Orchestrator (Integro)',
      type: 'reporting',
      personality: 'Visionary Overseer',
      accentColor: '#10b981',
      responsibilities: [
        'Global Cross-Platform Workflow Monitoring',
        'R3M Budget Allocation Reporting',
        'Faith Nexus Pre-Launch Logistics'
      ],
      suggestedTools: ['WorkflowBuilder', 'StrategicInsight'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'agent-wcccs-event-01',
      name: 'WCCCS Event Architect',
      type: 'growth',
      personality: 'Dynamic & Visionary',
      accentColor: '#ec4899',
      responsibilities: [
        'Orchestrate March 27 Virtual Pre-Launch on Talk World',
        'Manage Mainstream Media Placements for Summit',
        'Coordinate Simulcast with Influencer Podcasts'
      ],
      suggestedTools: ['MediaFoundry', 'WorkflowBuilder'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'agent-wcccs-partners-01',
      name: 'Strategic Partnerships Agent',
      type: 'growth',
      personality: 'Diplomatic & Persistent',
      accentColor: '#fbbf24',
      responsibilities: [
        'Secure R250k Anchor Sponsors for Magazines',
        'Manage Outreach to Global Faith Networks',
        'Coordinate Design Partner Program for ProLense'
      ],
      suggestedTools: ['StrategicInsight', 'WorkflowBuilder'],
      createdAt: new Date().toISOString()
    }
  ],
  addAgentTask: (taskId, task) => set((state) => ({
    activeTasks: { ...state.activeTasks, [taskId]: task }
  })),
  updateAgentTask: (taskId, updates) => set((state) => ({
    activeTasks: { ...state.activeTasks, [taskId]: { ...state.activeTasks[taskId], ...updates } }
  })),
  removeAgentTask: (taskId) => set((state) => {
    const { [taskId]: removed, ...remaining } = state.activeTasks;
    return { activeTasks: remaining };
  }),
  saveAgent: (agent) => set((state) => ({
    savedAgents: [agent, ...state.savedAgents.filter(a => a.id !== agent.id)]
  })),
  deleteAgent: (agentId) => set((state) => ({
    savedAgents: state.savedAgents.filter(a => a.id !== agentId)
  })),
});

const createPilotSlice: StateCreator<RootStore, [], [], PilotSlice> = (set, get) => ({
  pilotActive: false,
  pilotTask: null,
  pilotStatus: 'idle',
  pilotHistory: [],
  pilotLog: [],
  setPilotActive: (active) => set({ pilotActive: active }),
  stopPilot: () => set({ pilotActive: false, pilotStatus: 'idle', pilotTask: null, pilotHistory: [], pilotLog: [] }),
  startPilotTask: async (task) => {
    set({ pilotActive: true, pilotTask: task, pilotStatus: 'thinking', pilotHistory: [], pilotLog: [`Synthesizing task: ${task}`] });

    let iterations = 0;
    while (get().pilotActive && iterations < 15) {
      iterations++;
      try {
        const { runPilotCycle, executePilotAction } = await import('../lib/ai/computer');

        set({ pilotStatus: 'thinking' });
        const action = await runPilotCycle(task, get().pilotHistory, get().aiProvider);

        set((state) => ({
          pilotLog: [...state.pilotLog, action.reason],
          pilotHistory: [
            ...state.pilotHistory,
            { role: 'user', parts: [{ text: `Executed action: ${action.action}. Reason: ${action.reason}` }] }
          ]
        }));

        if (action.action === 'done') {
          set({ pilotStatus: 'completed' });
          break;
        }

        set({ pilotStatus: 'acting' });
        await executePilotAction(action);
        await new Promise(r => setTimeout(r, 2000)); // Cool-off for UI updates

      } catch (error) {
        console.error('Pilot Error:', error);
        set({ pilotStatus: 'failed', pilotLog: [...get().pilotLog, `Error: ${error instanceof Error ? error.message : 'Unknown'}`] });
        break;
      }
    }

    if (get().pilotStatus !== 'failed') {
      set({ pilotStatus: 'completed' });
    }
  }
});

// --- Main Store ---

export const useAppStore = create<RootStore>()(
  persist(
    (set, get, api) => ({
      ...createThemeSlice(set, get, api),
      ...createUserSlice(set, get, api),
      ...createNotificationSlice(set, get, api),
      ...createProjectSlice(set, get, api),
      ...createAgentSlice(set, get, api),
      ...createPilotSlice(set, get, api),
      isLoading: false,
      error: null,
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'neural-os-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        mode: state.mode,
        aiProvider: state.aiProvider,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeProject: state.activeProject,
        projects: state.projects,
        savedAgents: state.savedAgents,
        savedWorkflows: state.savedWorkflows,
        notifications: state.notifications,
        unreadNotificationsCount: state.unreadNotificationsCount,
      }),
    }
  )
);

// --- Backward Compatibility Selectors ---

export const useTheme = () => {
  const { theme, mode, toggleTheme, setTheme, aiProvider, setAIProvider } = useAppStore();
  return { theme, mode, toggleTheme, setTheme, aiProvider, setAIProvider };
};

export const useProject = () => {
  const { activeProject, projects, setActiveProject, createProject, updateBrandData } = useAppStore();
  return { activeProject, projects, setActiveProject, createProject, updateBrandData };
};

export const useBrand = () => {
  const { activeProject, updateBrandData } = useAppStore();
  return { brand: activeProject?.brandData, updateBrand: updateBrandData };
};

export const useAgenticOrchestrator = () => {
  const { activeTasks, addAgentTask, updateAgentTask, removeAgentTask, aiProvider } = useAppStore();

  const runTask = async (taskName: string, payload: any) => {
    const taskId = `task-${Date.now()}`;
    addAgentTask(taskId, { id: taskId, name: taskName, status: 'running', progress: 10, message: 'Initializing Agentic Layer...' });
    try {
      const { generateAIText } = await import('../lib/ai');
      const res = await generateAIText(`Analyze and strategize for: ${JSON.stringify(payload)}`, undefined, aiProvider);
      updateAgentTask(taskId, { status: 'completed', progress: 100, message: 'Intelligence Synchronized', result: res.text });
      return res.text;
    } catch (error) {
      updateAgentTask(taskId, { status: 'failed', progress: 100, message: 'Process Failed' });
      throw error;
    }
  };

  return { activeTasks, runTask };
};