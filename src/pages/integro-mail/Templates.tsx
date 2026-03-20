import { useState, useMemo } from "react";
import { AppLayout } from "@/components/integro-mail/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Copy, Trash2, Eye, Sparkles, Loader, Edit2 } from "lucide-react";
import { useTemplates, useDeleteTemplate, Template, TEMPLATE_CATEGORIES } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { CreateTemplateDialog } from "@/components/integro-mail/dialogs/CreateTemplateDialog";
import { EditTemplateDialog } from "@/components/integro-mail/dialogs/EditTemplateDialog";
import { EmailPreviewDialog } from "@/components/integro-mail/dialogs/EmailPreviewDialog";
import { AIGenerateDialog } from "@/components/integro-mail/dialogs/AIGenerateDialog";

const categoryColors: Record<string, string> = {
  marketing: "bg-primary/20 text-primary",
  newsletter: "bg-secondary/20 text-secondary",
  onboarding: "bg-accent/20 text-accent",
  sales: "bg-warning/20 text-warning",
  events: "bg-success/20 text-success",
  engagement: "bg-destructive/20 text-destructive",
  general: "bg-muted text-muted-foreground",
};

const Templates = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: templates = [], isLoading, refetch } = useTemplates();
  const { mutate: deleteTemplate } = useDeleteTemplate();
  const { toast } = useToast();

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.preview.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  const handleDelete = (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    deleteTemplate(templateId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Template deleted successfully",
        });
        refetch();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive",
        });
      },
    });
  };

  const handleEditClick = (template: Template) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  };

  const handlePreviewClick = (template: Template) => {
    const html = template.htmlContent || "<p>No preview available</p>";
    setPreviewHtml(html);
    setPreviewSubject(template.name);
    setPreviewDialogOpen(true);
  };

  const handleCopyTemplate = (template: Template) => {
    // Copy template HTML to clipboard
    if (template.htmlContent) {
      navigator.clipboard.writeText(template.htmlContent);
      toast({
        title: "Copied!",
        description: "Template HTML copied to clipboard",
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Templates</h1>
            <p className="text-muted-foreground">
              {templates.length} professional templates ready to use
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2 border-primary/50 hover:bg-primary/10"
              onClick={() => setAiDialogOpen(true)}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              AI Generate
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 text-white border-0" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TEMPLATE_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={`gap-2 ${
                selectedCategory === category.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-primary/10"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              {category.label}
              {category.id !== 'all' && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {templates.filter(t => t.category === category.id).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Search */}
        <Card className="glass mb-6">
          <CardContent className="p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name or description..."
                className="pl-10 bg-muted/50 border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all' 
                ? "No templates match your filters." 
                : "No templates found."}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="glass glass-hover group overflow-hidden"
              >
                {/* Preview Area */}
                <div className="h-48 bg-muted/20 relative group-hover:bg-muted/30 transition-colors border-b border-border overflow-hidden">
                  {template.htmlContent ? (
                    <div className="w-[200%] h-[200%] origin-top-left transform scale-50 pointer-events-none select-none">
                      <iframe
                        srcDoc={template.htmlContent}
                        className="w-full h-full border-0 bg-white"
                        title="Template Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="w-16 h-2 bg-primary/30 rounded mb-2 mx-auto" />
                        <div className="w-24 h-2 bg-muted-foreground/20 rounded mb-1 mx-auto" />
                        <div className="w-20 h-2 bg-muted-foreground/20 rounded mb-3 mx-auto" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                    <Button size="sm" variant="secondary" className="gap-1" onClick={() => handlePreviewClick(template)}>
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                    <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90" onClick={() => handleEditClick(template)}>
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{template.preview}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge className={categoryColors[template.category] || categoryColors.general}>
                      {template.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleCopyTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created {template.createdAt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <CreateTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => refetch()}
      />
      <AIGenerateDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onSuccess={() => refetch()}
      />
      {selectedTemplate && (
        <EditTemplateDialog
          template={selectedTemplate}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            refetch();
            setSelectedTemplate(null);
          }}
        />
      )}
      <EmailPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        htmlContent={previewHtml}
        subject={previewSubject}
      />
    </AppLayout>
  );
};

export default Templates;
