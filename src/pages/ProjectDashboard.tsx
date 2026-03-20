import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Rocket,
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    ExternalLink,
    Play,
    Pause,
    Settings,
    Users,
    Zap,
    Server,
    Globe,
    TrendingUp,
    Calendar
} from 'lucide-react';
import { useProjectRegistry, WCCCSProject } from '@/contexts/ProjectRegistry';
import { agentOrchestrator } from '@/services/AgentOrchestrator';
import { ProjectLauncher } from '@/components/ProjectLauncher';
import { AddProjectDialog } from '@/components/AddProjectDialog';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const ProjectDashboard = () => {
    const { projects, activeProject, setActiveProject, updateProjectHealth } = useProjectRegistry();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterHosting, setFilterHosting] = useState<string>('all');
    const navigate = useNavigate();

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
        const matchesHosting = filterHosting === 'all' || project.hosting === filterHosting;
        return matchesSearch && matchesCategory && matchesHosting;
    });

    const getHealthIcon = (health: WCCCSProject['healthStatus']) => {
        switch (health) {
            case 'healthy': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-slate-500" />;
        }
    };

    const getStatusColor = (status: WCCCSProject['status']) => {
        switch (status) {
            case 'production': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'staging': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'development': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'planning': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getCategoryIcon = (category: WCCCSProject['category']) => {
        switch (category) {
            case 'saas': return <Rocket className="w-5 h-5" />;
            case 'microsite': return <ExternalLink className="w-5 h-5" />;
            case 'tool': return <Settings className="w-5 h-5" />;
            case 'media': return <Play className="w-5 h-5" />;
            case 'marketing': return <TrendingUp className="w-5 h-5" />;
            case 'content': return <Globe className="w-5 h-5" />;
        }
    };

    const stats = [
        { label: 'Total Projects', value: projects.length, icon: Rocket, color: 'text-primary' },
        { label: 'Production', value: projects.filter(p => p.status === 'production').length, icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'In Development', value: projects.filter(p => p.status === 'development').length, icon: Activity, color: 'text-amber-500' },
        { label: 'Active Agents', value: agentOrchestrator.getAvailableAgents().length, icon: Users, color: 'text-blue-500' },
    ];

    const hostingStats = [
        { label: 'Hostinger', value: projects.filter(p => p.hosting === 'hostinger').length, icon: Server },
        { label: 'Local Dev', value: projects.filter(p => p.hosting === 'local').length, icon: Globe },
        { label: 'Netlify', value: projects.filter(p => p.hosting === 'netlify').length, icon: Rocket },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-foreground">WCCCS Ecosystem</h2>
                    </div>
                    <p className="text-muted-foreground max-w-xl">
                        Complete business operating system. 11 projects. One unified command center.
                    </p>
                </div>
                <div className="flex gap-3">
                    <AddProjectDialog />
                    <Button variant="outline" className="border-border hover:bg-accent/5">
                        <Activity className="w-4 h-4 mr-2" />
                        Health Check All
                    </Button>
                    <Button className="gradient-primary text-primary-foreground font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                        <Rocket className="w-4 h-4 mr-2" />
                        Deploy All
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-card/30 border-border/50 backdrop-blur-sm overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                    <p className="text-3xl font-serif font-bold text-foreground">{stat.value}</p>
                                </div>
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-accent/5 group-hover:scale-110 transition-transform", stat.color)}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Hosting Distribution */}
            <Card className="bg-card/30 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-serif">Hosting Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {hostingStats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-border/30">
                                <stat.icon className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-serif font-bold text-foreground">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card/30 border-border/50"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Filter className="w-3 h-3" />
                        Category:
                    </p>
                    {['all', 'saas', 'microsite', 'tool', 'media', 'marketing', 'content'].map((category) => (
                        <Button
                            key={category}
                            variant={filterCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterCategory(category)}
                            className={cn(
                                "text-xs uppercase tracking-widest font-bold",
                                filterCategory === category && "gradient-primary"
                            )}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Server className="w-3 h-3" />
                        Hosting:
                    </p>
                    {['all', 'hostinger', 'local', 'netlify'].map((hosting) => (
                        <Button
                            key={hosting}
                            variant={filterHosting === hosting ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterHosting(hosting)}
                            className={cn(
                                "text-xs uppercase tracking-widest font-bold",
                                filterHosting === hosting && "gradient-primary"
                            )}
                        >
                            {hosting}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <Card
                        key={project.id}
                        className={cn(
                            "glass border-border/50 hover:border-primary/20 transition-all group overflow-hidden",
                            activeProject?.id === project.id && "border-primary/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                        )}
                        onClick={() => setActiveProject(project)}
                    >
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {getCategoryIcon(project.category)}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-lg font-serif truncate">{project.displayName}</CardTitle>
                                        <CardDescription className="text-xs mt-1 line-clamp-2">{project.description}</CardDescription>
                                    </div>
                                </div>
                                {getHealthIcon(project.healthStatus)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={cn("text-[10px] uppercase tracking-widest font-bold", getStatusColor(project.status))}>
                                    {project.status}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-border/30">
                                    {project.category}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tech Stack</p>
                                <div className="flex flex-wrap gap-1">
                                    {project.techStack.slice(0, 3).map((tech, i) => (
                                        <span key={i} className="text-[10px] px-2 py-1 rounded bg-accent/10 text-foreground font-mono">
                                            {tech}
                                        </span>
                                    ))}
                                    {project.techStack.length > 3 && (
                                        <span className="text-[10px] px-2 py-1 rounded bg-accent/10 text-muted-foreground font-mono">
                                            +{project.techStack.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assigned Agents</p>
                                <div className="flex flex-wrap gap-1">
                                    {project.assignedAgents.slice(0, 2).map((agent, i) => (
                                        <span key={i} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary font-bold">
                                            {agent}
                                        </span>
                                    ))}
                                    {project.assignedAgents.length > 2 && (
                                        <span className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary font-bold">
                                            +{project.assignedAgents.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ProjectLauncher
                                project={project}
                                onHealthUpdate={(health) => updateProjectHealth(project.id, health)}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <Card className="bg-card/30 border-border/50 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-serif text-foreground mb-2">No projects found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProjectDashboard;
