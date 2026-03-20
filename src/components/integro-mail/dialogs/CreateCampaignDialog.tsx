import { useState, useEffect } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCreateCampaign, useTemplates, useContacts } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { FaithNexusInvitationTemplate } from "@/templates/FaithNexusInvitation";
import { Search, Paperclip, X } from "lucide-react";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Email subject is required"),
  fromEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
  template: z.string().min(1, "Please select a template"),
  recipientEmails: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCampaignDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCampaignDialogProps) {
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { data: templates = [] } = useTemplates();
  const { data: contacts = [] } = useContacts();
  const { toast } = useToast();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [attachments, setAttachments] = useState<Array<{ name: string; content: string }>>([]);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      fromEmail: "",
      template: "",
      recipientEmails: "",
    },
  });

  // Reset selected contacts when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedContacts([]);
      setContactSearch("");
      setAttachments([]);
      form.reset();
    }
  }, [open, form]);

  const toggleContact = (email: string) => {
    setSelectedContacts(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const toggleAllFiltered = () => {
    const filteredEmails = filteredContacts.map(c => c.email);
    const allSelected = filteredEmails.every(email => selectedContacts.includes(email));

    if (allSelected) {
      setSelectedContacts(prev => prev.filter(e => !filteredEmails.includes(e)));
    } else {
      setSelectedContacts(prev => [...new Set([...prev, ...filteredEmails])]);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAttachments(prev => [...prev, {
              name: file.name,
              content: event.target!.result as string // Base64
            }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CampaignFormData) => {
    // Combine manual emails and selected contacts
    const manualEmails = data.recipientEmails
      ? data.recipientEmails.split(/[,\n]/).map(e => e.trim()).filter(e => e.length > 0)
      : [];

    const allEmails = [...new Set([...manualEmails, ...selectedContacts])];

    if (allEmails.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    // Get template HTML content
    let htmlContent = "";
    if (data.template === "faith-nexus-2026") {
      htmlContent = FaithNexusInvitationTemplate();
    } else {
      const selectedTemplate = templates.find(t => t.id === data.template);
      htmlContent = selectedTemplate?.htmlContent || selectedTemplate?.preview || "";
    }

    createCampaign(
      {
        name: data.name,
        subject: data.subject,
        template: data.template,
        htmlContent,
        recipientEmails: allEmails,
        recipients: allEmails.length,
        fromEmail: data.fromEmail || undefined,
        attachments: attachments.map(a => ({ filename: a.name, content: a.content })),
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Campaign created successfully",
          });
          form.reset();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to create campaign",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto glass border-border">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Configure your campaign, attach files, and select recipients.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Newsletter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Big News inside!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., contact@faithnexus.digital" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Defaults to default sender if left blank.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Template</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Attachments</FormLabel>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Paperclip className="h-4 w-4" />
                  Attach Files
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map((file, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent" onClick={() => removeAttachment(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <FormLabel>Recipients ({selectedContacts.length} selected)</FormLabel>
              <div className="rounded-md border border-border bg-background/50">
                <div className="p-3 border-b border-border flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                  />
                  <Button variant="ghost" size="sm" onClick={toggleAllFiltered} type="button" className="text-xs h-7 ml-auto">
                    {filteredContacts.every(c => selectedContacts.includes(c.email)) ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <ScrollArea className="h-[200px] p-2">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No contacts found. <br />
                      <span className="text-xs">Add contacts in the Contacts page first.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={`contact-${contact.id}`}
                            checked={selectedContacts.includes(contact.email)}
                            onCheckedChange={() => toggleContact(contact.email)}
                          />
                          <label
                            htmlFor={`contact-${contact.id}`}
                            className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex flex-col gap-1"
                          >
                            <span>{contact.name}</span>
                            <span className="text-xs text-muted-foreground font-normal">{contact.email}</span>
                          </label>
                          {contact.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] h-5">{tag}</Badge>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            <FormField
              control={form.control}
              name="recipientEmails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between">
                    <span>Manual Entry (Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste additional emails here (comma separated)..."
                      className="min-h-[60px] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary text-white" disabled={isPending}>
                {isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
