import { antigravityBridge, AntigravityTask } from './AntigravityBridge';

export interface AgentSkill {
    id: string;
    name: string;
    description: string;
    skillPath: string;
    capabilities: string[];
}

export const AGENT_SKILLS: AgentSkill[] = [
    {
        id: 'frontend-designer',
        name: 'Frontend Designer',
        description: 'Create distinctive, production-grade frontend interfaces',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\frontend-design',
        capabilities: ['UI Design', 'Component Creation', 'Responsive Layouts', 'Animation', 'Typography']
    },
    {
        id: 'brand-specialist',
        name: 'Brand Specialist',
        description: 'Apply consistent brand identity across all projects',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\brand-guidelines',
        capabilities: ['Brand Guidelines', 'Color Palettes', 'Typography Standards', 'Visual Identity']
    },
    {
        id: 'testing-engineer',
        name: 'Testing Engineer',
        description: 'Automated testing with Playwright',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\webapp-testing',
        capabilities: ['Automated Testing', 'UI Verification', 'Screenshot Capture', 'Browser Automation']
    },
    {
        id: 'document-engineer',
        name: 'Document Engineer',
        description: 'Generate and manipulate documents across formats',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\docx',
        capabilities: ['DOCX Generation', 'PDF Creation', 'PPTX Design', 'Document Manipulation']
    },
    {
        id: 'web-artifact-builder',
        name: 'Web Artifact Builder',
        description: 'Create complex React artifacts with shadcn/ui',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\web-artifacts-builder',
        capabilities: ['React Components', 'shadcn/ui', 'Multi-component Apps', 'Bundling']
    },
    {
        id: 'theme-factory',
        name: 'Theme Factory',
        description: 'Generate cohesive design systems',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\theme-factory',
        capabilities: ['Design Systems', 'Theme Generation', 'Color Schemes', 'Component Theming']
    },
    {
        id: 'doc-coauthor',
        name: 'Document Co-Author',
        description: 'Structured workflow for collaborative documentation',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\doc-coauthoring',
        capabilities: ['Technical Specs', 'Proposals', 'Decision Docs', 'Documentation']
    },
    {
        id: 'mcp-builder',
        name: 'MCP Builder',
        description: 'Create MCP servers for external service integration',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\mcp-builder',
        capabilities: ['MCP Servers', 'API Integration', 'TypeScript', 'Python']
    },
    {
        id: 'algorithmic-artist',
        name: 'Algorithmic Artist',
        description: 'Generate algorithmic and generative art',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\algorithmic-art',
        capabilities: ['Generative Art', 'Algorithmic Design', 'Creative Coding']
    },
    {
        id: 'canvas-designer',
        name: 'Canvas Designer',
        description: 'Create canvas-based graphics and visualizations',
        skillPath: 'C:\\Users\\admin\\OneDrive\\Documents\\Billion Rands Filing Cabinet\\marketing-brain-command-center-57078-main\\skills\\canvas-design',
        capabilities: ['Canvas Graphics', 'Data Visualization', 'Interactive Graphics']
    }
];

class AgentOrchestrator {
    /**
     * Route a task to the appropriate agent based on skill requirements
     */
    async routeTask(
        instruction: string,
        projectId: string,
        requiredSkills: string[],
        context: AntigravityTask['context'],
        priority: AntigravityTask['priority'] = 'normal'
    ): Promise<string> {
        // Find the best agent for the job
        const agent = this.selectAgent(requiredSkills);

        if (!agent) {
            throw new Error(`No agent found with required skills: ${requiredSkills.join(', ')}`);
        }

        // Submit task to Antigravity
        const taskId = await antigravityBridge.submitTask({
            projectId,
            agentType: agent.id,
            instruction: `[${agent.name}] ${instruction}`,
            context: {
                ...context,
                constraints: [
                    ...context.constraints,
                    `Use skill: ${agent.skillPath}`,
                    `Agent capabilities: ${agent.capabilities.join(', ')}`
                ]
            },
            priority
        });

        return taskId;
    }

    /**
     * Select the best agent for a set of required skills
     */
    private selectAgent(requiredSkills: string[]): AgentSkill | null {
        // Find agent with the most matching capabilities
        let bestAgent: AgentSkill | null = null;
        let bestScore = 0;

        for (const agent of AGENT_SKILLS) {
            const matchingCapabilities = agent.capabilities.filter(cap =>
                requiredSkills.some(skill =>
                    cap.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(cap.toLowerCase())
                )
            );

            const score = matchingCapabilities.length;
            if (score > bestScore) {
                bestScore = score;
                bestAgent = agent;
            }
        }

        return bestAgent;
    }

    /**
     * Get all available agents
     */
    getAvailableAgents(): AgentSkill[] {
        return AGENT_SKILLS;
    }

    /**
     * Get agent by ID
     */
    getAgentById(id: string): AgentSkill | undefined {
        return AGENT_SKILLS.find(agent => agent.id === id);
    }

    /**
     * Get agents by capability
     */
    getAgentsByCapability(capability: string): AgentSkill[] {
        return AGENT_SKILLS.filter(agent =>
            agent.capabilities.some(cap =>
                cap.toLowerCase().includes(capability.toLowerCase())
            )
        );
    }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
