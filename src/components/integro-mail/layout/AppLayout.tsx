import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Mail,
  Users,
  FileText,
  Search,
  Settings,
  Sparkles,
  LogOut,
  Server,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/os/integro-mail", icon: LayoutDashboard },
  { title: "Campaigns", href: "/os/integro-mail/campaigns", icon: Mail },
  { title: "Contacts", href: "/os/integro-mail/contacts", icon: Users },
  { title: "Templates", href: "/os/integro-mail/templates", icon: FileText },
  { title: "Lead Finder", href: "/os/integro-mail/leads", icon: Search },
  { title: "Settings", href: "/os/integro-mail/settings", icon: Settings },
];

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState<"online" | "offline" | "checking">("checking");

  useEffect(() => {
    const checkServer = async () => {
      if (import.meta.env.PROD) return;
      try {
        const res = await fetch('http://localhost:3001/api/status', { method: 'HEAD' });
        setServerStatus(res.ok ? 'online' : 'offline');
      } catch {
        setServerStatus('offline');
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-[80vh] w-full bg-background rounded-2xl border border-border shadow-2xl overflow-hidden relative">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-sidebar transition-all duration-300 relative",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border bg-white/5 px-4 mb-4">
          <Link to="/os/integro-mail" className="flex items-center gap-3">
            <span className="text-2xl pt-1">✉️</span>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-primary">IntegroMail</span>
                <span className="text-[10px] font-medium text-primary -mt-1 uppercase tracking-widest">PRO Engine</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            const navLink = (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                  <TooltipContent side="right" className="glass">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navLink;
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-border bg-black/10 mt-auto">
          {/* Server Status */}
          {!import.meta.env.PROD && (
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-lg text-xs font-medium border mb-3",
              serverStatus === 'online' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                serverStatus === 'offline' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-muted text-muted-foreground border-border"
            )}>
              <Server className="h-3 w-3" />
              {!collapsed && <span>Backend: {serverStatus}</span>}
              <div className={cn(
                "ml-auto h-2 w-2 rounded-full",
                serverStatus === 'online' ? "bg-green-500 animate-pulse" :
                  serverStatus === 'offline' ? "bg-red-500" : "bg-gray-400"
              )} />
            </div>
          )}

          {/* User Profile Section */}
          {!collapsed && user && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {user.email?.charAt(0).toUpperCase() || "I"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{user.email?.split("@")[0] || "Integro Admin"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-4 top-20 z-50 h-8 w-8 rounded-full border border-border bg-background shadow-md hover:bg-muted focus:outline-none"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden relative bg-background">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
          {children}
        </div>
      </main>
    </div>
  );
}

