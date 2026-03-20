import React, { useEffect, useState } from 'react';
import { Plus, Book, Clock, TrendingUp, FileCheck, ArrowRight, MoreHorizontal, Search, Sparkles, Layout, Grid, Database, Atom } from 'lucide-react';
import { ProjectHistoryItem, ProjectHistoryService, DashboardAnalytics } from '../services/projectHistory';

interface DashboardProps {
    onNewProject: () => void;
    onOpenProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
    userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewProject, onOpenProject, userName }) => {
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

    // State for Real Analytics
    const [recentProjects, setRecentProjects] = useState<ProjectHistoryItem[]>([]);
    const [analytics, setAnalytics] = useState<DashboardAnalytics>({ totalProjects: 0, totalWords: 0, averageProgress: 0, completionRate: 0 });

    useEffect(() => {
        // Load real data from service
        const projects = ProjectHistoryService.getRecentProjects();
        const stats = ProjectHistoryService.getAnalytics();
        setRecentProjects(projects);
        setAnalytics(stats);
    }, []);

    return (
        <div className="flex-1 min-h-screen bg-[#0f172a] relative overflow-y-auto overflow-x-hidden font-sans selection:bg-cyan-500/30">
            {/* Scientific Grid Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Aurora Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />

            <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto p-8 md:p-12 space-y-12">

                {/* Header & Logo */}
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl border border-white/10 flex items-center justify-center p-2 shadow-lg">
                                <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-light text-slate-100 tracking-tight">
                                    {greeting}, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">{userName}</span>
                                </h1>
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono tracking-widest uppercase">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                    System Online • v2.4.0
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex gap-4">
                        <div className="relative group">
                            <input type="file" id="dash-open" className="hidden" accept=".wpp,.json" onChange={onOpenProject} />
                            <label htmlFor="dash-open" className="flex items-center gap-3 px-6 py-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800 transition-all cursor-pointer group-hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                                <Database size={18} /> <span className="text-sm font-medium">Load Project</span>
                            </label>
                        </div>
                        <button onClick={onNewProject} className="flex items-center gap-3 px-6 py-3 bg-cyan-600/90 hover:bg-cyan-500 backdrop-blur-md rounded-lg text-white font-medium shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/20 hover:-translate-y-0.5 transition-all">
                            <Plus size={18} /> <span className="text-sm">Initialize New</span>
                        </button>
                    </div>
                </div>

                {/* Scientific Analytics HUD */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MetricCard
                        label="TOTAL WORDS"
                        value={analytics.totalWords.toLocaleString()}
                        icon={<FileCheck size={16} className="text-emerald-400" />}
                        trend="+12% vs last week"
                    />
                    <MetricCard
                        label="ACTIVE PROJECTS"
                        value={analytics.totalProjects.toString().padStart(2, '0')}
                        icon={<Layout size={16} className="text-cyan-400" />}
                        subLabel="In Progress"
                    />
                    <MetricCard
                        label="AVG. PROGRESS"
                        value={`${analytics.averageProgress}%`}
                        icon={<TrendingUp size={16} className="text-purple-400" />}
                        chart={true}
                    />
                    <MetricCard
                        label="SYSTEM STATUS"
                        value="OPTIMAL"
                        icon={<Atom size={16} className="text-amber-400" />}
                        subLabel="All engines fired"
                    />
                </div>

                {/* Recent Projects Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h3 className="font-mono text-sm tracking-widest text-slate-400 uppercase flex items-center gap-2">
                            <Grid size={16} /> Recent Workspace Data
                        </h3>
                        <div className="relative group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="FILTER PROTOCOLS..."
                                className="pl-9 pr-4 py-1.5 text-xs bg-slate-900/50 border border-slate-800 rounded text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-900/50 placeholder:text-slate-600 font-mono w-64 transition-all"
                            />
                        </div>
                    </div>

                    {recentProjects.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <p className="text-slate-500 font-light">No project data currently in persistence layer.</p>
                            <button onClick={onNewProject} className="text-cyan-400 hover:text-cyan-300 text-sm mt-4 underline decoration-dashed underline-offset-4">
                                Initialize first project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-components for clean file structure (could be separate files, keeping here for cohesion in this edit)

const MetricCard: React.FC<{ label: string, value: string, icon: React.ReactNode, trend?: string, subLabel?: string, chart?: boolean }> =
    ({ label, value, icon, trend, subLabel, chart }) => (
        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 p-5 rounded-lg hover:bg-slate-800/40 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">{icon}</div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>

            <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">{label}</div>
            <div className="text-2xl font-light text-slate-100">{value}</div>

            {trend && <div className="text-[10px] text-emerald-500/80 mt-2 font-mono flex items-center gap-1">▲ {trend}</div>}
            {subLabel && <div className="text-[10px] text-slate-500 mt-2 font-mono">{subLabel}</div>}

            {chart && (
                <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 w-[65%]"></div>
                </div>
            )}
        </div>
    );

const ProjectCard: React.FC<{ project: ProjectHistoryItem }> = ({ project }) => (
    <div className="group relative bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 rounded-lg overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-black/20">
        <div className="flex h-32">
            {/* Thumbnail */}
            <div className="w-24 bg-slate-950 flex-shrink-0 relative overflow-hidden border-r border-white/5">
                {project.coverImage ? (
                    <img src={project.coverImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <Book size={20} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-slate-200 group-hover:text-cyan-300 transition-colors truncate pr-2">{project.title}</h4>
                        <MoreHorizontal size={14} className="text-slate-600 hover:text-white cursor-pointer" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{project.author}</p>
                </div>

                <div className="flex items-end justify-between mt-2">
                    <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{project.type}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <Clock size={10} />
                            {new Date(project.lastEdited).toLocaleDateString()}
                        </div>
                    </div>
                    <button className="p-2 rounded bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>

        {/* Progress Bar (Bottom) */}
        <div className="h-[2px] w-full bg-slate-800">
            <div className="h-full bg-cyan-500" style={{ width: `${project.progress}%` }}></div>
        </div>
    </div>
);

export default Dashboard;
