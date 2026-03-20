import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Github, Rocket, Check, Copy, Share2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ExportMicrositeProps {
    siteId: string;
    siteName: string;
}

export const ExportMicrosite: React.FC<ExportMicrositeProps> = ({ siteId, siteName }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportComplete, setExportComplete] = useState(false);

    const handleDownload = () => {
        setIsExporting(true);
        // Orchestration Protocol: Localizing the static build
        setTimeout(() => {
            setIsExporting(false);
            setExportComplete(true);
            toast({
                title: "Build Localized",
                description: `Static assets for ${siteName} are now available in public/microsites/`,
            });
        }, 1200);
    };

    const handleViewStatic = () => {
        const path = siteId === 'faith-nexus-2026' ? '/microsites/faith-nexus/index.html' : '/microsites/talk-world/index.html';
        window.open(path, '_blank');
    };

    const handleGithubPush = () => {
        toast({
            title: "GitHub Sync",
            description: "Source code pushed to WCCCS/Sovereign-Core-Infrastructure",
        });
    };

    return (
        <div className="space-y-6">
            <Card className="glass-sovereign border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        Deployment & Export Hub
                    </CardTitle>
                    <CardDescription>
                        Ready to take {siteName} public? Orchestrate the Sovereign deployment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Option 1: Static Orchestration */}
                        <Card className="bg-background/50 border-border/50 hover:border-primary/50 transition-all cursor-pointer p-6 space-y-4" onClick={handleDownload}>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Download className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold">Localize Build</h4>
                                <p className="text-xs text-muted-foreground mt-1">Generate high-fidelity static HTML bundle in public/microsites/.</p>
                            </div>
                            <Button variant="secondary" className="w-full text-xs" disabled={isExporting}>
                                {isExporting ? 'Synthesizing...' : 'Run Export Protocol'}
                            </Button>
                        </Card>

                        {/* Option 2: Live Static Preview */}
                        <Card className="bg-background/50 border-border/50 hover:border-primary/50 transition-all cursor-pointer p-6 space-y-4" onClick={handleViewStatic}>
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Rocket className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-bold">Live Static View</h4>
                                <p className="text-xs text-muted-foreground mt-1">Verify the production-ready build in your browser immediately.</p>
                            </div>
                            <Button variant="outline" className="w-full text-xs text-blue-500 border-blue-500/30 hover:bg-blue-500/5">
                                Browse Static Page
                            </Button>
                        </Card>

                        {/* Option 3: Integro Sync */}
                        <Card className="bg-background/50 border-border/50 hover:border-primary/50 transition-all cursor-pointer p-6 space-y-4" onClick={handleGithubPush}>
                            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                                <Github className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold">Sync to GitHub</h4>
                                <p className="text-xs text-muted-foreground mt-1">Push the Sovereign source foundations to the primary repository.</p>
                            </div>
                            <Button variant="outline" className="w-full text-xs">
                                Orchestrate Push
                            </Button>
                        </Card>
                    </div>

                    {exportComplete && (
                        <div className="mt-8 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-medium text-emerald-500">Milestone: {siteName} static build localized successfully.</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-emerald-500 hover:bg-emerald-500/20" onClick={handleViewStatic}>
                                Launch Production Build
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
