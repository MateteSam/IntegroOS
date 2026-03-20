import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface EmailPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    htmlContent: string;
    subject: string;
}

export function EmailPreviewDialog({
    open,
    onOpenChange,
    htmlContent,
    subject,
}: EmailPreviewDialogProps) {
    const previewHtml = htmlContent
        .replace(/\{\{?\s*name\s*\}?\}/g, 'John Doe')
        .replace(/\{\{?\s*first_name\s*\}?\}/g, 'John')
        .replace(/\{\{?\s*company\s*\}?\}/g, 'Faith Nexus')
        .replace(/\{\{?\s*email\s*\}?\}/g, 'john@example.com')
        .replace(/\{\{?\s*rsvp_link\s*\}?\}/g, '#')
        .replace(/\{\{?\s*date\s*\}?\}/g, new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Email Preview: {subject}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto border rounded-lg bg-white">
                    <iframe
                        srcDoc={previewHtml}
                        className="w-full h-full min-h-[600px]"
                        title="Email Preview"
                        sandbox="allow-same-origin"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
