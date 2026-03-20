import React, { ReactNode } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface MicrositeLayoutProps {
    children: ReactNode;
    brandColor?: string;
    logo?: string;
}

export const MicrositeLayout: React.FC<MicrositeLayoutProps> = ({
    children,
    brandColor = '#D4AF37',
    logo
}) => {
    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground font-inter selection:bg-primary/30 scroll-smooth">
                {/* Fixed Navigation for Landing Pages */}
                <nav className="fixed top-0 left-0 right-0 z-50 glass-sovereign border-b border-primary/10">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {logo ? (
                                <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-amber-600 shadow-gold" />
                            )}
                            <span className="font-playfair font-bold text-xl tracking-tight text-gold">FAITH NEXUS</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <a href="#about" className="hover:text-primary transition-colors">About</a>
                            <a href="#pillars" className="hover:text-primary transition-colors">Pillars</a>
                            <a href="#schedule" className="hover:text-primary transition-colors">Schedule</a>
                            <a href="#register" className="px-5 py-2 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-all shadow-gold">
                                Register Now
                            </a>
                        </div>
                    </div>
                </nav>

                <main className="pt-20">
                    {children}
                </main>

                <footer className="py-20 bg-card border-t border-primary/10 text-center">
                    <div className="max-w-7xl mx-auto px-6">
                        <p className="text-muted-foreground text-sm">
                            © 2026 Faith Nexus. All Rights Reserved. | <a href="https://www.faithnexus.digital" className="hover:text-primary underline">faithnexus.digital</a>
                        </p>
                    </div>
                </footer>

                <Toaster />
                <Sonner />
            </div>
        </TooltipProvider>
    );
};
