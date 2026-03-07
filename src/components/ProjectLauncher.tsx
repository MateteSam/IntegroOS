import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ExternalLink,
    Play,
    FolderOpen,
    Terminal,
    Rocket,
    Activity,
    AlertCircle,
    Github
} from 'lucide-react';
import { WCCCSProject } from '@/contexts/ProjectRegistry';
import { cn } from '@/lib/utils';

interface ProjectLauncherProps {
    project: WCCCSProject;
    onHealthUpdate?: (health: 'healthy' | 'warning' | 'error') => void;
}

export const ProjectLauncher: React.FC<ProjectLauncherProps> = ({ project, onHealthUpdate }) => {
    const [isLaunching, setIsLaunching] = React.useState(false);
    const [devServerRunning, setDevServerRunning] = React.useState(false);

    const launchSystemCommand = async (action: 'vscode' | 'explorer' | 'terminal') => {
        try {
            // Try to call local backend
            const response = await fetch('http://localhost:5000/api/system/launch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ...' // Mock auth doesn't require real token
                },
                body: JSON.stringify({
                    path: project.path,
                    action
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`[ProjectLauncher] Launched ${action}:`, data);
                return true;
            } else {
                console.warn(`[ProjectLauncher] Backend launch failed: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.warn('[ProjectLauncher] Backend unreachable:', error);
            return false;
        }
    };

    const openProjectInVSCode = async () => {
        const success = await launchSystemCommand('vscode');

        if (!success) {
            // Fallback to clipboard
            const command = `code "${project.path}"`;
            navigator.clipboard.writeText(command);
            alert(`Backend Not Connected.\n\nCommand copied to clipboard:\n${command}\n\nPaste this in your terminal.`);
        }
    };

    const openProjectInExplorer = async () => {
        const success = await launchSystemCommand('explorer');

        if (!success) {
            // Fallback to clipboard
            const command = `explorer "${project.path}"`;
            navigator.clipboard.writeText(command);
            alert(`Backend Not Connected.\n\nCommand copied to clipboard:\n${command}`);
        }
    };

    const startDevServer = async () => {
        setIsLaunching(true);

        try {
            // Try to open terminal at location
            const success = await launchSystemCommand('terminal');

            if (success) {
                setDevServerRunning(true);
                if (onHealthUpdate) onHealthUpdate('healthy');

                // Open localhost after a delay to allow manual start
                setTimeout(() => {
                    const port = getDefaultPort(project.id);
                    window.open(`http://localhost:${port}`, '_blank');
                }, 3000);
            } else {
                // Fallback simulation
                console.log('[ProjectLauncher] Starting dev server simulation for:', project.name);
                await new Promise(resolve => setTimeout(resolve, 1000));
                setDevServerRunning(true);
                if (onHealthUpdate) onHealthUpdate('healthy');
                const port = getDefaultPort(project.id);
                window.open(`http://localhost:${port}`, '_blank');
                alert(`Backend Not Connected.\n\nPlease run 'npm run dev' manually in:\n${project.path}`);
            }

        } catch (error) {
            console.error('[ProjectLauncher] Failed to start dev server:', error);
            if (onHealthUpdate) {
                onHealthUpdate('error');
            }
        } finally {
            setIsLaunching(false);
        }
    };

    const openLiveDeployment = () => {
        if (project.deploymentUrl) {
            window.open(project.deploymentUrl, '_blank');
        }
    };

    const getDefaultPort = (projectId: string): number => {
        // Map projects to their default dev server ports
        const portMap: Record<string, number> = {
            'talkworld': 5173,
            'onixone': 5174,
            'prolens': 5175,
            'bookarchitect-ai': 5176,
            'theppcsa': 5177,
            'wcccs-main': 5178,
            'content-world': 5179,
            'faith-nexus-2026': 5180,
            'pixel-perfect-replica': 5181,
            '300-million-connections': 5182,
            'god-lives-in-sandton': 5183
        };
        return portMap[projectId] || 5173;
    };

    const getPriorityColor = (priority: WCCCSProject['priority']) => {
        switch (priority) {
            case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'low': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-3">
            {/* Priority & Launch Date */}
            <div className="flex items-center gap-2">
                <Badge className={cn("text-[10px] uppercase tracking-widest font-bold", getPriorityColor(project.priority))}>
                    {project.priority} Priority
                </Badge>
                {project.launchDate && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-border/30">
                        Launch: {project.launchDate}
                    </Badge>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={openProjectInVSCode}
                    className="text-xs uppercase tracking-widest font-bold"
                >
                    <Terminal className="w-3 h-3 mr-1" />
                    VS Code
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={openProjectInExplorer}
                    className="text-xs uppercase tracking-widest font-bold"
                >
                    <FolderOpen className="w-3 h-3 mr-1" />
                    Explorer
                </Button>
            </div>

            {/* GitHub Repo */}
            {project.githubUrl && (
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs uppercase tracking-widest font-bold border-border/40 hover:bg-accent/10"
                    onClick={() => window.open(project.githubUrl, '_blank')}
                >
                    <Github className="w-3 h-3 mr-1" />
                    View on GitHub
                </Button>
            )}

            {/* Dev Server */}
            <Button
                size="sm"
                className="w-full gradient-primary text-xs uppercase tracking-widest font-bold"
                onClick={startDevServer}
                disabled={isLaunching || devServerRunning}
            >
                {isLaunching ? (
                    <>
                        <Activity className="w-3 h-3 mr-1 animate-spin" />
                        Launching...
                    </>
                ) : devServerRunning ? (
                    <>
                        <Play className="w-3 h-3 mr-1" />
                        Running on :{getDefaultPort(project.id)}
                    </>
                ) : (
                    <>
                        <Rocket className="w-3 h-3 mr-1" />
                        Start Dev Server
                    </>
                )}
            </Button>

            {/* Live Deployment */}
            {project.deploymentUrl && (
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs uppercase tracking-widest font-bold border-primary/20 hover:bg-primary/5"
                    onClick={openLiveDeployment}
                >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Live Site
                </Button>
            )}

            {/* Hosting Info */}
            <div className="pt-2 border-t border-border/30">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Hosting</p>
                <Badge
                    variant="outline"
                    className={`text-[10px] font-mono ${project.hosting === 'cloudflare' ? 'border-orange-500/30 text-orange-400 bg-orange-500/5' :
                            project.hosting === 'netlify' ? 'border-teal-500/30 text-teal-400 bg-teal-500/5' :
                                'border-border/50'
                        }`}
                >
                    {project.hosting}
                </Badge>
            </div>
        </div>
    );
};
