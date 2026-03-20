import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Command,
    LayoutGrid,
    PenTool,
    Image as ImageIcon,
    BarChart3,
    Settings,
    Search,
    Menu,
    Bell,
    Sparkles,
    ChevronRight,
    LineChart,
    Sun,
    Moon,
    Globe,
    Home,
    Folder,
    Brain,
    Rocket,
    Film,
    DollarSign,
    Users2,
    Activity,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProjectRegistry } from '@/contexts/ProjectRegistry';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { CommandPilot } from '@/components/CommandPilot';
import { FocusGuard } from '@/components/FocusGuard';
import { useEffect } from 'react';

const NavItem = ({
    icon: Icon,
    label,
    path,
    isActive,
    isCollapsed
}: {
    icon: any,
    label: string,
    path: string,
    isActive: boolean,
    isCollapsed: boolean
}) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(path)}
            className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 group relative",
                isActive
                    ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
            {!isCollapsed && (
                <span className={cn(
                    "font-medium text-sm tracking-wide transition-opacity duration-300",
                    isActive ? "font-bold" : "font-normal"
                )}>
                    {label}
                </span>
            )}
            {isActive && !isCollapsed && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
            )}
            {isCollapsed && (
                <div className="absolute left-14 bg-[#1E293B] border border-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <span className="text-xs font-bold text-white">{label}</span>
                </div>
            )}
        </button>
    );
};

export const CommandShell = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { activeProject } = useProjectRegistry();
    const { mode, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handlePilotNavigate = (e: any) => {
            if (e.detail) navigate(e.detail);
        };
        window.addEventListener('pilot-navigate', handlePilotNavigate);
        return () => window.removeEventListener('pilot-navigate', handlePilotNavigate);
    }, [navigate]);

    const { user, role } = useAuth();

    const hasRole = (allowedRoles: string[]) => allowedRoles.includes(role);

    const mainNav = [
        { id: 'nexus', label: 'Nexus', icon: Home, path: '/os/nexus', roles: ['Admin', 'Marketing', 'Design', 'Sales', 'User'] },
        { id: 'projects', label: 'Projects', icon: Folder, path: '/os/projects', roles: ['Admin', 'Marketing', 'Design', 'Sales', 'User'] },
        { id: 'agents', label: 'Agents', icon: Brain, path: '/os/agents', roles: ['Admin'] },
        { id: 'media', label: 'Media Foundry', icon: ImageIcon, path: '/os/media', roles: ['Admin', 'Design'] },
        { id: 'intelligence', label: 'Intelligence Layer', icon: LineChart, path: '/os/intelligence', roles: ['Admin', 'Sales'] },
    ];

    // ── Business Engine ──────────────────────────────────────────────────────
    const businessNav = [
        { id: 'revenue', label: 'Revenue Tracker', icon: DollarSign, path: '/os/revenue', roles: ['Admin', 'Sales'] },
        { id: 'leads', label: 'Lead Pipeline', icon: Users2, path: '/os/leads', roles: ['Admin', 'Sales', 'Marketing'] },
        { id: 'platform-health', label: 'Platform Health', icon: Activity, path: '/os/platform-health', roles: ['Admin'] },
    ];

    const projectTools = [
        { id: 'book-architect', label: 'BookArchitect-AI', icon: Sparkles, path: '/os/book-studio', roles: ['Admin', 'Marketing'] },
        { id: 'faith-nexus', label: 'Faith Nexus 2026', icon: Globe, path: '/os/faith-nexus', roles: ['Admin', 'Marketing'] },
        { id: 'faith-standalone', label: 'Faith Standalone', icon: Rocket, path: '/os/faith-standalone', roles: ['Admin'] },
        { id: 'studioworks-film', label: 'StudioWorks Film', icon: Film, path: '/os/launch-studio', roles: ['Admin', 'Marketing'] },
        { id: 'integro-mail', label: 'IntegroMail™ Pro', icon: Mail, path: '/os/integro-mail', roles: ['Admin', 'Marketing'] },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
            {/* OS Sidebar */}
            <aside
                className={cn(
                    "h-full glass-sovereign border-r border-border flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative z-50",
                    isCollapsed ? "w-20" : "w-72"
                )}
            >
                {/* Header */}
                <div className="h-20 flex items-center px-6 border-b border-border">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-white/5 border border-white/10">
                            <img src="/images/integro-logo.png" alt="Integro OS Logo" className="w-full h-full object-contain p-1" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-serif font-bold text-lg tracking-tight text-foreground whitespace-nowrap">
                                    Integro<span className="text-primary">OS</span>
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                                    v3.0.0 Global
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-8 px-4 space-y-8 overflow-y-auto scrollbar-none">
                    {/* Core OS */}
                    <div className="space-y-2">
                        {mainNav.filter(item => hasRole(item.roles)).map((item) => (
                            <NavItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                path={item.path}
                                isActive={location.pathname.startsWith(item.path)}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </div>

                    {/* Business Engine */}
                    <div className="space-y-4">
                        {!isCollapsed && (
                            <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50">Business Engine</h3>
                        )}
                        <div className="space-y-2">
                            {businessNav.filter(item => hasRole(item.roles)).map((item) => (
                                <NavItem
                                    key={item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    path={item.path}
                                    isActive={location.pathname.startsWith(item.path)}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Foundational Tools */}
                    <div className="space-y-4">
                        {!isCollapsed && (
                            <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Foundational Tools</h3>
                        )}
                        <div className="space-y-2">
                            {projectTools.filter(item => hasRole(item.roles)).map((tool) => (
                                <NavItem
                                    key={tool.id}
                                    icon={tool.icon}
                                    label={tool.label}
                                    path={tool.path}
                                    isActive={location.pathname.startsWith(tool.path)}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border space-y-2">
                    <NavItem
                        icon={Settings}
                        label="System Config"
                        path="/os/settings"
                        isActive={location.pathname.startsWith('/os/settings')}
                        isCollapsed={isCollapsed}
                    />
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            "w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/10",
                            !isCollapsed && "justify-start px-3 gap-3"
                        )}
                        title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
                    >
                        {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {!isCollapsed && <span className="text-sm font-medium">Toggle Theme</span>}
                    </button>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
                {/* Top Bar / Command Strip */}
                <header className="h-20 glass-sovereign border-b border-border flex items-center justify-between px-8 z-40">
                    <div className="flex items-center gap-4 flex-1 max-w-2xl">
                        <button className="flex items-center gap-3 w-full bg-accent/5 hover:bg-accent/10 border border-border rounded-xl px-4 py-2.5 transition-all text-sm text-muted-foreground group">
                            <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
                            <span className="font-medium">Search commands, assets, or intelligence...</span>
                            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-accent/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <FocusGuard />
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-accent/5 rounded-full border border-border">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                System Optimal
                            </span>
                        </div>
                        <button className="relative text-muted-foreground hover:text-primary transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary shadow-lg ring-2 ring-background" />
                        </button>
                        <div className="w-8 h-8 rounded-full gradient-primary p-[1px]">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">AD</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Workspace */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </div>
            </main>
            <CommandPilot />
        </div>
    );
};
