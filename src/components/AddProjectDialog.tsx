import React, { useState } from 'react';
import { useProjectRegistry, WCCCSProject } from '@/contexts/ProjectRegistry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FolderOpen, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddProjectDialogProps {
    trigger?: React.ReactNode;
    onProjectAdded?: (project: WCCCSProject) => void;
}

export const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ trigger, onProjectAdded }) => {
    const { addProject } = useProjectRegistry();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [path, setPath] = useState('');
    const [category, setCategory] = useState<WCCCSProject['category']>('tool');
    const [status, setStatus] = useState<WCCCSProject['status']>('development');
    const [hosting, setHosting] = useState<WCCCSProject['hosting']>('local');
    const [priority, setPriority] = useState<WCCCSProject['priority']>('medium');
    const [techStack, setTechStack] = useState('');
    const [domain, setDomain] = useState('');

    const resetForm = () => {
        setDisplayName('');
        setDescription('');
        setPath('');
        setCategory('tool');
        setStatus('development');
        setHosting('local');
        setPriority('medium');
        setTechStack('');
        setDomain('');
    };

    const handleAutoDetect = async () => {
        if (!path) {
            toast.error('Please enter a project path first');
            return;
        }

        setIsLoading(true);
        try {
            // Try to auto-detect project info from path
            const folderName = path.split(/[/\\]/).filter(Boolean).pop() || '';

            // Generate a display name from folder name
            const autoName = folderName
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            if (!displayName) setDisplayName(autoName);

            // Detect tech stack from folder name patterns
            const detectedStack: string[] = [];
            const lowerPath = path.toLowerCase();

            if (lowerPath.includes('react') || lowerPath.includes('vite')) {
                detectedStack.push('React', 'Vite');
            }
            if (lowerPath.includes('next')) {
                detectedStack.push('Next.js');
            }
            if (lowerPath.includes('python') || lowerPath.includes('flask')) {
                detectedStack.push('Python');
            }
            if (lowerPath.includes('typescript') || lowerPath.includes('ts')) {
                detectedStack.push('TypeScript');
            }

            if (detectedStack.length > 0 && !techStack) {
                setTechStack(detectedStack.join(', '));
            }

            toast.success('Auto-detection complete!');
        } catch (e) {
            toast.error('Auto-detection failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!displayName.trim()) {
            toast.error('Project name is required');
            return;
        }

        if (!path.trim()) {
            toast.error('Project path is required');
            return;
        }

        const name = displayName.toLowerCase().replace(/\s+/g, '-');

        const newProject = addProject({
            name,
            displayName: displayName.trim(),
            description: description.trim() || `Custom project: ${displayName}`,
            path: path.trim(),
            category,
            status,
            hosting,
            priority,
            healthStatus: 'unknown',
            assignedAgents: [],
            techStack: techStack.split(',').map(t => t.trim()).filter(Boolean),
            domain: domain.trim() || undefined,
            gpuOptimized: false,
        });

        toast.success(`Project "${displayName}" added successfully!`);
        onProjectAdded?.(newProject);
        resetForm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gradient-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-serif text-xl">Add New Project</DialogTitle>
                    <DialogDescription>
                        Register a new project to your Integro OS workspace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Project Path with Auto-Detect */}
                    <div className="space-y-2">
                        <Label htmlFor="path">Project Path *</Label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="path"
                                    value={path}
                                    onChange={(e) => setPath(e.target.value)}
                                    placeholder="C:\Users\...\my-project"
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAutoDetect}
                                disabled={isLoading}
                            >
                                <Wand2 className="w-4 h-4 mr-1" />
                                Detect
                            </Button>
                        </div>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Project Name *</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="My Awesome Project"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What does this project do?"
                            rows={2}
                        />
                    </div>

                    {/* Category & Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="saas">SaaS Product</SelectItem>
                                    <SelectItem value="microsite">Microsite</SelectItem>
                                    <SelectItem value="tool">Tool</SelectItem>
                                    <SelectItem value="media">Media</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="content">Content</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planning">Planning</SelectItem>
                                    <SelectItem value="development">Development</SelectItem>
                                    <SelectItem value="staging">Staging</SelectItem>
                                    <SelectItem value="production">Production</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Hosting & Priority Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Hosting</Label>
                            <Select value={hosting} onValueChange={(v) => setHosting(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="local">Local</SelectItem>
                                    <SelectItem value="netlify">Netlify</SelectItem>
                                    <SelectItem value="hostinger">Hostinger</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-2">
                        <Label htmlFor="techStack">Tech Stack</Label>
                        <Input
                            id="techStack"
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            placeholder="React, TypeScript, Vite, Tailwind CSS"
                        />
                        <p className="text-xs text-muted-foreground">Comma-separated list</p>
                    </div>

                    {/* Domain */}
                    <div className="space-y-2">
                        <Label htmlFor="domain">Domain (optional)</Label>
                        <Input
                            id="domain"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="myproject.com"
                        />
                    </div>
                </form>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="gradient-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddProjectDialog;
