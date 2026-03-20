import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Folder, FileText, Cloud, RefreshCw, Link as LinkIcon, Plus, Download, ExternalLink, Search, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProject } from '@/contexts/ProjectContext';

// Mock Data for Google Drive Files
const MOCK_DRIVE_FILES = [
    { id: '1', name: 'Strategic Narrative V1', type: 'doc', modified: '2 hours ago', owner: 'me' },
    { id: '2', name: 'Market Analysis Data', type: 'sheet', modified: '1 day ago', owner: 'me' },
    { id: '3', name: 'Brand Assets', type: 'folder', modified: '3 days ago', owner: 'me' },
    { id: '4', name: 'Q3 Campaign Drafts', type: 'folder', modified: '1 week ago', owner: 'Marketing Team' },
    { id: '5', name: 'Project "Titan" Brief', type: 'doc', modified: '2 weeks ago', owner: 'CEO' },
    { id: '6', name: 'Competitor Research Notes', type: 'doc', modified: '2 weeks ago', owner: 'me' },
];

export default function DraftingWorkspace() {
    const { activeProject } = useProject();
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [driveFiles, setDriveFiles] = useState(MOCK_DRIVE_FILES);

    const handleConnect = () => {
        setIsLoading(true);
        // Simulate API delay
        setTimeout(() => {
            setIsConnected(true);
            setIsLoading(false);
            toast({
                title: "Google Workspace Connected",
                description: "Successfully synchronized with your Google Drive.",
            });
        }, 1500);
    };

    const handleImport = (fileId: string) => {
        const file = driveFiles.find(f => f.id === fileId);
        toast({
            title: "Importing Draft",
            description: `Parsing "${file?.name}" and determining context...`,
        });

        // Simulate extraction and saving to project context
        setTimeout(() => {
            const extractedText = `Strategic Narrative for ${activeProject?.name || 'the project'}\n\nThis is the imported content from ${file?.name}. It contains the mission-critical pillars and core tactical maneuvers for the campaign.`;
            updateBrandData({ draftContent: extractedText });
            toast({
                title: "Import Complete",
                description: "Draft content has been added to your Project Brain and is ready for Book Genesis.",
            });
        }, 1200);
    };

    const FileIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'folder': return <Folder className="h-10 w-10 text-amber-500/80 fill-amber-500/20" />;
            case 'sheet': return <FileText className="h-10 w-10 text-emerald-500/80 fill-emerald-500/20" />;
            case 'doc': return <FileText className="h-10 w-10 text-blue-500/80 fill-blue-500/20" />;
            default: return <FileText className="h-10 w-10 text-slate-500" />;
        }
    };

    return (
        <div className="h-full space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-amber-500/20 rounded-full shadow-lg">
                    <Cloud className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-500 font-medium tracking-wide text-xs uppercase">Neural Drafting Protocol</span>
                </div>
                <h2 className="text-3xl font-playfair font-bold text-white tracking-tight">
                    Google <span className="text-amber-400">Workspace</span> Integration
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto font-light">
                    Synchronize your strategic narratives, draft content in Docs, and seamlessly pipe intelligence back into your Neural OS.
                </p>
            </div>

            {!isConnected ? (
                /* Connection Card */
                <Card className="max-w-md mx-auto bg-[#1E293B] border-slate-800 shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                            <LinkIcon className="h-8 w-8 text-slate-300" />
                        </div>
                        <CardTitle className="text-white">Connect Google Drive</CardTitle>
                        <CardDescription className="text-slate-400">
                            Grant access to read and write drafting documents.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm text-slate-300">Read access to Docs & Sheets</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm text-slate-300">Save exports to "Integro" folder</span>
                            </div>
                        </div>
                        <Button
                            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                            onClick={handleConnect}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Authenticate Connection"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                /* Drive Explorer */
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search Drive..."
                                className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 focus:border-amber-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white flex-1 md:flex-none">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Sync
                            </Button>
                            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold flex-1 md:flex-none">
                                <Plus className="mr-2 h-4 w-4" />
                                New Draft
                            </Button>
                        </div>
                    </div>

                    {/* File Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {driveFiles
                            .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((file) => (
                                <Card key={file.id} className="bg-[#1E293B]/50 border-slate-800 hover:border-amber-500/50 transition-all group cursor-pointer">
                                    <CardContent className="p-6 flex items-start gap-4">
                                        <FileIcon type={file.type} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-medium text-slate-200 truncate group-hover:text-amber-400 transition-colors">
                                                    {file.name}
                                                </h4>
                                                {/* Hover Actions */}
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-white">
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                                <span>{file.modified}</span>
                                                <span>{file.owner}</span>
                                            </div>
                                            {/* Action Area */}
                                            <div className="mt-4 pt-4 border-t border-slate-800/50 flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full text-xs h-8 bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-900"
                                                    onClick={() => handleImport(file.id)}
                                                >
                                                    <Download className="mr-2 h-3 w-3" />
                                                    Import Draft
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
