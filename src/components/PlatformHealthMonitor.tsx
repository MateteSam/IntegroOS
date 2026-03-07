import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectRegistry } from '@/contexts/ProjectRegistry';
import {
    Activity, Globe, CheckCircle, AlertCircle, Clock,
    RefreshCw, ExternalLink, Github, Loader2
} from 'lucide-react';

interface HealthResult {
    projectId: string;
    status: 'online' | 'degraded' | 'offline' | 'checking';
    statusCode?: number;
    responseMs?: number;
    checkedAt?: Date;
    error?: string;
}

// We ping via a no-cors fetch — we can't read the body but we can detect if the
// server responded at all (opaque response = online).
async function pingUrl(url: string): Promise<{ ok: boolean; ms: number }> {
    const start = Date.now();
    try {
        await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
        return { ok: true, ms: Date.now() - start };
    } catch {
        return { ok: false, ms: Date.now() - start };
    }
}

export const PlatformHealthMonitor: React.FC = () => {
    const { projects } = useProjectRegistry();
    const [health, setHealth] = useState<Record<string, HealthResult>>({});
    const [isChecking, setIsChecking] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const liveProjects = projects.filter(p => p.deploymentUrl);
    const devProjects = projects.filter(p => !p.deploymentUrl && p.status !== 'archived');

    const runHealthCheck = useCallback(async () => {
        if (isChecking) return;
        setIsChecking(true);

        // Set all to checking
        const checking: Record<string, HealthResult> = {};
        liveProjects.forEach(p => {
            checking[p.id] = { projectId: p.id, status: 'checking' };
        });
        setHealth(checking);

        // Ping all in parallel
        const results = await Promise.allSettled(
            liveProjects.map(async (p) => {
                const { ok, ms } = await pingUrl(p.deploymentUrl!);
                return { id: p.id, ok, ms };
            })
        );

        const updated: Record<string, HealthResult> = {};
        results.forEach((r, i) => {
            const p = liveProjects[i];
            if (r.status === 'fulfilled') {
                updated[p.id] = {
                    projectId: p.id,
                    status: r.value.ok ? (r.value.ms > 3000 ? 'degraded' : 'online') : 'offline',
                    responseMs: r.value.ms,
                    checkedAt: new Date(),
                };
            } else {
                updated[p.id] = { projectId: p.id, status: 'offline', checkedAt: new Date() };
            }
        });

        setHealth(updated);
        setLastChecked(new Date());
        setIsChecking(false);
    }, [liveProjects, isChecking]);

    // Auto-check on mount + every 2 minutes
    useEffect(() => {
        runHealthCheck();
        const interval = setInterval(runHealthCheck, 120_000);
        return () => clearInterval(interval);
    }, []); // eslint-disable-line

    const getStatusBadge = (h: HealthResult | undefined) => {
        if (!h || h.status === 'checking') return (
            <Badge variant="outline" className="text-[9px] border-border/40 text-muted-foreground">
                <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" /> Checking
            </Badge>
        );
        switch (h.status) {
            case 'online': return (
                <Badge className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    <CheckCircle className="w-2.5 h-2.5 mr-1" /> Online
                </Badge>
            );
            case 'degraded': return (
                <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                    <AlertCircle className="w-2.5 h-2.5 mr-1" /> Degraded
                </Badge>
            );
            case 'offline': return (
                <Badge className="text-[9px] bg-rose-500/10 text-rose-400 border-rose-500/20">
                    <AlertCircle className="w-2.5 h-2.5 mr-1" /> Offline
                </Badge>
            );
        }
    };

    const getHostingColor = (hosting: string) => {
        if (hosting === 'cloudflare') return 'text-orange-400';
        if (hosting === 'netlify') return 'text-teal-400';
        return 'text-slate-400';
    };

    const onlineCount = Object.values(health).filter(h => h.status === 'online').length;
    const allCount = liveProjects.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${onlineCount === allCount && allCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <h3 className="text-xl font-serif font-bold text-foreground">Platform Health</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {onlineCount}/{allCount} live sites online
                        {lastChecked && ` · Last checked ${lastChecked.toLocaleTimeString()}`}
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="text-xs uppercase tracking-widest font-bold border-border/50"
                    onClick={runHealthCheck}
                    disabled={isChecking}
                >
                    <RefreshCw className={`w-3 h-3 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                    {isChecking ? 'Checking...' : 'Refresh Now'}
                </Button>
            </div>

            {/* Live sites */}
            <Card className="glass-sovereign border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="w-4 h-4 text-primary" />
                        Live Deployments
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {liveProjects.map(project => {
                        const h = health[project.id];
                        return (
                            <div
                                key={project.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border/30 bg-accent/5 hover:border-primary/20 transition-all"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-sm text-foreground">{project.displayName}</p>
                                        <Badge variant="outline" className={`text-[9px] border-border/30 ${getHostingColor(project.hosting)}`}>
                                            {project.hosting}
                                        </Badge>
                                        {getStatusBadge(h)}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{project.domain}</p>
                                    {h?.responseMs && h.status !== 'checking' && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                                            <span className="text-[9px] text-muted-foreground font-mono">{h.responseMs}ms</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {project.deploymentUrl && (
                                        <Button size="sm" variant="outline" className="h-7 text-[9px] border-border/40 uppercase tracking-widest font-bold"
                                            onClick={() => window.open(project.deploymentUrl, '_blank')}>
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            Visit
                                        </Button>
                                    )}
                                    {project.githubUrl && (
                                        <Button size="sm" variant="outline" className="h-7 text-[9px] border-border/40 uppercase tracking-widest font-bold"
                                            onClick={() => window.open(project.githubUrl, '_blank')}>
                                            <Github className="w-3 h-3 mr-1" />
                                            Repo
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* In-development projects */}
            {devProjects.length > 0 && (
                <Card className="glass-sovereign border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            In Development
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {devProjects.map(project => (
                            <div
                                key={project.id}
                                className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/20 bg-muted/10 hover:border-border/40 transition-all"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{project.displayName}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">{project.domain || 'Domain TBD'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`text-[9px] ${project.priority === 'critical' ? 'border-red-500/30 text-red-400' :
                                            project.priority === 'high' ? 'border-orange-500/30 text-orange-400' :
                                                'border-border/40 text-muted-foreground'
                                        }`}>
                                        {project.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-[9px] border-border/40 text-muted-foreground">
                                        {project.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PlatformHealthMonitor;
