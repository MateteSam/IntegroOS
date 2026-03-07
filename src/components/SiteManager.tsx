import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, Github, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useProjectRegistry } from '@/contexts/ProjectRegistry';

export default function SiteManager() {
    const { projects } = useProjectRegistry();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Only show projects that have a live deployment URL (real sites)
    const liveSites = projects.filter(p => p.deploymentUrl);
    const selectedProject = liveSites.find(p => p.id === selectedId) || null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-3 h-3 text-emerald-400" />;
            case 'warning': return <AlertCircle className="w-3 h-3 text-amber-400" />;
            case 'error': return <AlertCircle className="w-3 h-3 text-red-400" />;
            default: return <Clock className="w-3 h-3 text-muted-foreground" />;
        }
    };

    const getHostingBadge = (hosting: string) => {
        const colors: Record<string, string> = {
            cloudflare: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            netlify: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
            hostinger: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            local: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        };
        return colors[hosting] || 'bg-slate-500/10 text-slate-400';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Site List Panel */}
                <Card className="glass-sovereign border-border/50 md:w-1/3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Globe className="w-5 h-5 text-primary" />
                            Live Deployments
                        </CardTitle>
                        <CardDescription>{liveSites.length} site{liveSites.length !== 1 ? 's' : ''} currently live</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {liveSites.map(site => (
                            <button
                                key={site.id}
                                onClick={() => setSelectedId(site.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${selectedId === site.id
                                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                        : 'border-border/50 bg-accent/5 hover:bg-accent/10 hover:border-primary/50'
                                    }`}
                            >
                                <div>
                                    <div className={`font-semibold text-sm ${selectedId === site.id ? 'text-primary' : 'text-foreground'}`}>
                                        {site.displayName}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                        {site.domain}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(site.healthStatus)}
                                    {selectedId === site.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    )}
                                </div>
                            </button>
                        ))}

                        {liveSites.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Globe className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No live deployments yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Site Detail Panel */}
                <Card className="glass-sovereign border-border/50 md:w-2/3">
                    <CardHeader className="border-b border-border/10 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Activity className="w-5 h-5 text-primary" />
                            {selectedProject ? selectedProject.displayName : 'Select a site'}
                        </CardTitle>
                        <CardDescription>
                            {selectedProject ? selectedProject.description : 'Click a site on the left to view details and launch controls.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        {!selectedProject ? (
                            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                <Globe className="w-12 h-12 opacity-20" />
                                <p>Select a deployment to inspect it.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Status Row */}
                                <div className="flex flex-wrap gap-2">
                                    <Badge className={`text-[10px] uppercase tracking-widest font-bold border ${getHostingBadge(selectedProject.hosting)}`}>
                                        {selectedProject.hosting}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold">
                                        {selectedProject.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold">
                                        {selectedProject.category}
                                    </Badge>
                                    <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold border ${getHostingBadge(selectedProject.healthStatus)}`}>
                                        {getStatusIcon(selectedProject.healthStatus)}
                                        <span className="ml-1">{selectedProject.healthStatus}</span>
                                    </Badge>
                                </div>

                                {/* Live URL */}
                                {selectedProject.deploymentUrl && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Live URL</p>
                                        <Button
                                            className="w-full justify-start gradient-primary text-primary-foreground font-mono text-sm"
                                            onClick={() => window.open(selectedProject.deploymentUrl, '_blank')}
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                                            {selectedProject.deploymentUrl}
                                        </Button>
                                    </div>
                                )}

                                {/* GitHub Repo */}
                                {selectedProject.githubUrl && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Source Repo</p>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start font-mono text-sm border-border/50"
                                            onClick={() => window.open(selectedProject.githubUrl, '_blank')}
                                        >
                                            <Github className="w-4 h-4 mr-2 flex-shrink-0" />
                                            {selectedProject.githubUrl?.replace('https://github.com/', '')}
                                        </Button>
                                    </div>
                                )}

                                {/* Tech Stack */}
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Tech Stack</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedProject.techStack.map(tech => (
                                            <Badge key={tech} variant="secondary" className="text-[10px] font-mono">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Last Deployed */}
                                {selectedProject.lastDeployed && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Last Deployed</p>
                                        <p className="text-sm font-mono text-foreground">
                                            {new Date(selectedProject.lastDeployed).toLocaleDateString('en-ZA', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}

                                {/* Assigned Agents */}
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Assigned Agents</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedProject.assignedAgents.map(agent => (
                                            <Badge key={agent} variant="outline" className="text-[10px]">
                                                {agent}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
