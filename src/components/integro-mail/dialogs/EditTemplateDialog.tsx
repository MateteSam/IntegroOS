import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTemplate, Template, TEMPLATE_CATEGORIES } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Code, Layout, Upload, Link, Eye } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category: z.string().min(1, "Category is required"),
  htmlContent: z.string().min(1, "Template content is required"),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface EditTemplateDialogProps {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const categories = TEMPLATE_CATEGORIES.filter(c => c.id !== 'all').map(c => ({
  value: c.id,
  label: c.label,
  icon: c.icon,
}));

interface ImageInfo {
  index: number;
  src: string;
  alt: string;
  id: string;
}

function extractImages(html: string): ImageInfo[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const imgs = doc.querySelectorAll('img');
    return Array.from(imgs).map((img, i) => ({
      index: i,
      src: img.src,
      alt: img.alt || `Image ${i + 1}`,
      id: img.id || '',
    }));
  } catch {
    return [];
  }
}

function replaceImageAtIndex(html: string, index: number, newSrc: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const imgs = doc.querySelectorAll('img');
    if (imgs[index]) {
      imgs[index].src = newSrc;
      let result = doc.documentElement.outerHTML;
      if (html.trim().toLowerCase().startsWith('<!doctype')) {
        result = '<!DOCTYPE html>\n' + result;
      }
      return result;
    }
    return html;
  } catch {
    return html;
  }
}

export function EditTemplateDialog({ template, open, onOpenChange, onSuccess }: EditTemplateDialogProps) {
  const { mutate: updateTemplate, isPending } = useUpdateTemplate();
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = React.useState(false);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template.name,
      category: template.category,
      htmlContent: template.htmlContent || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: template.name,
        category: template.category,
        htmlContent: template.htmlContent || "",
      });
      setPreviewMode(false);
    }
  }, [open, template]);

  const currentHtml = form.watch('htmlContent');
  const images = React.useMemo(() => extractImages(currentHtml), [currentHtml]);

  const handleImageReplace = (index: number, newSrc: string) => {
    const updated = replaceImageAtIndex(currentHtml, index, newSrc);
    form.setValue('htmlContent', updated, { shouldDirty: true });
    toast({ title: "Image Updated", description: "Image has been replaced in the template." });
  };

  const processFile = (index: number, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload images under 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleImageReplace(index, result);
    };
    reader.readAsDataURL(file);
  };

  const ImageEditor = ({ image, imgIndex }: { image: ImageInfo; imgIndex: number }) => {
    const [urlInput, setUrlInput] = React.useState("");

    return (
      <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
            {image.alt || image.id || `Image ${imgIndex + 1}`}
          </span>
          {image.src && !image.src.startsWith('data:') && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{image.src.split('/').pop()}</span>
          )}
        </div>
        
        {image.src && (
          <div className="w-full h-16 bg-background rounded overflow-hidden flex items-center justify-center">
            <img src={image.src} alt={image.alt} className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs gap-1"
            onClick={() => document.getElementById(`img-upload-${imgIndex}`)?.click()}
          >
            <Upload className="h-3 w-3" />
            Upload
          </Button>
          <input
            type="file"
            id={`img-upload-${imgIndex}`}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(imgIndex, file);
              e.target.value = '';
            }}
          />
        </div>
        
        <div className="flex gap-1">
          <Input
            placeholder="Paste image URL..."
            className="h-7 text-xs bg-background"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 text-xs px-2"
            onClick={() => {
              if (urlInput.trim()) {
                handleImageReplace(imgIndex, urlInput.trim());
                setUrlInput("");
              }
            }}
          >
            <Link className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  const onSubmit = (values: TemplateFormValues) => {
    updateTemplate(
      { id: template.id, data: values },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Template updated successfully" });
          onOpenChange(false);
          onSuccess?.();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update template", variant: "destructive" });
        },
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto glass border-border">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>
            Customize images, edit HTML, and preview your template.
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
                      <Input placeholder="e.g., Welcome Email" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-muted/50 border-border">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass border-border">
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

            <Tabs defaultValue="images" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/20">
                <TabsTrigger value="images">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Images ({images.length})
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code className="w-4 h-4 mr-2" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="preview" onClick={() => setPreviewMode(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="images" className="space-y-3 pt-4">
                {images.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No images found in this template.</p>
                    <p className="text-xs mt-1">Add images via the HTML tab.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img, i) => (
                      <ImageEditor key={i} image={img} imgIndex={i} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="code">
                <FormField
                  control={form.control}
                  name="htmlContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your email template HTML..."
                          className="min-h-[400px] bg-muted/50 border-border font-mono text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="preview">
                <div className="border border-border rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={currentHtml}
                    className="w-full h-[500px] border-0"
                    title="Template Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-primary hover:opacity-90 text-white border-0"
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
