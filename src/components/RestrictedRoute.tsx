import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RestrictedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export function RestrictedRoute({ children, allowedRoles }: RestrictedRouteProps) {
    const { isAuthenticated, loading, role } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Authenticating Nexus...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login (AuthGate handles this visually, but we need route protection)
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // User is authenticated but doesn't have the required role
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold font-serif tracking-tight">Access Restricted</h2>
                <p className="text-muted-foreground max-w-md">
                    Your current clearance level ({role}) does not permit access to this module of the Integro OS.
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-6 px-6 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                    Return to Previous Node
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
