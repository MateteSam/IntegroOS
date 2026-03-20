import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateTemplate, TEMPLATE_CATEGORIES } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Code, Upload, FileText } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category: z.string().min(1, "Category is required"),
  preview: z.string().min(1, "Description is required"),
  htmlContent: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const categories = TEMPLATE_CATEGORIES.filter(c => c.id !== 'all').map(c => ({
  value: c.id,
  label: c.label,
  icon: c.icon,
}));

const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { padding: 30px; text-align: center; background: #1a1a2e; color: #ffffff; }
    .header h1 { font-size: 24px; font-weight: 700; }
    .content { padding: 30px; color: #333333; line-height: 1.6; }
    .content h2 { font-size: 20px; margin-bottom: 15px; color: #1a1a2e; }
    .content p { margin-bottom: 15px; }
    .cta-button { display: inline-block; background: #6366f1; color: #ffffff; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .footer { padding: 20px 30px; text-align: center; background: #f8f9fa; color: #666; font-size: 12px; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Company</h1>
    </div>
    <div class="content">
      <h2>Hello {first_name},</h2>
      <p>Write your email content here. Use personalization tokens like {first_name}, {name}, {email}, and {company}.</p>
      <p style="text-align: center; margin-top: 25px;">
        <a href="#" class="cta-button">Call to Action</a>
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 {company}. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTemplateDialogProps) {
  const { mutate: createTemplate, isPending } = useCreateTemplate();
  const { toast } = useToast();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      category: "",
      preview: "",
      htmlContent: "",
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm') && file.type !== 'text/html') {
      toast({ title: "Invalid file", description: "Please upload an HTML file.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      form.setValue('htmlContent', content, { shouldDirty: true });
      toast({ title: "HTML Loaded", description: `Loaded ${file.name}` });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const onSubmit = (data: TemplateFormData) => {
    createTemplate(
      {
        ...data,
        htmlContent: data.htmlContent || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Template created successfully" });
          form.reset();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to create template",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto glass border-border">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Build a reusable email template from scratch, paste HTML, or upload a file.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Welcome Series" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span> {cat.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Short description of what this template is for" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Content (HTML)</label>
              <Tabs defaultValue="write">
                <TabsList className="grid w-full grid-cols-3 bg-muted/20">
                  <TabsTrigger value="write" className="gap-1 text-xs">
                    <Code className="h-3 w-3" /> Write HTML
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-1 text-xs">
                    <Upload className="h-3 w-3" /> Upload File
                  </TabsTrigger>
                  <TabsTrigger value="starter" className="gap-1 text-xs">
                    <FileText className="h-3 w-3" /> Use Starter
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="write">
                  <FormField
                    control={form.control}
                    name="htmlContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your email HTML here..."
                            className="min-h-[200px] font-mono text-xs bg-muted/50 border-border"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="upload">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">Drop an HTML file or click to browse</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('html-file-upload')?.click()}>
                      Choose File
                    </Button>
                    <input
                      type="file"
                      id="html-file-upload"
                      className="hidden"
                      accept=".html,.htm"
                      onChange={handleFileUpload}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="starter">
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Start with a clean, responsive template with personalization tokens.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue('htmlContent', STARTER_HTML, { shouldDirty: true });
                        toast({ title: "Starter loaded", description: "Switch to 'Write HTML' tab to customize." });
                      }}
                    >
                      Load Starter Template
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary hover:opacity-90 text-white border-0" disabled={isPending}>
                {isPending ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
