// Email service for sending campaigns via Local SMTP Backend
export interface Attachment {
    content: string; // Base64 content
    filename: string;
    type?: string;
    disposition?: 'attachment' | 'inline';
}

class EmailService {
    // Dynamically choose backend URL based on environment
    // In PROD (Netlify), use the function path: /.netlify/functions/send-email
    // In DEV (Local), use the Express server: http://localhost:3001/api/send-email
    private backendUrl = import.meta.env.PROD
        ? '/.netlify/functions/send-email'
        : 'http://localhost:3001/api/send-email';

    async sendEmail(params: {
        to: string | string[];
        subject: string;
        html: string;
        from?: string;
        attachments?: Attachment[];
    }): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: params.to,
                    subject: params.subject,
                    html: params.html,
                    from: params.from,
                    attachments: params.attachments,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            return {
                success: true,
                messageId: data.messageId,
            };
        } catch (error) {
            console.error('Send Email Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    async sendBulkEmails(params: {
        recipients: string[];
        subject: string;
        html: string;
        from?: string;
        attachments?: Attachment[];
    }): Promise<{
        success: boolean;
        sent: number;
        failed: number;
        errors: string[];
    }> {
        try {
            // Updated to send as a bulk request to the backend if supported, 
            // or loop here. Backend currently handles arrays.
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: params.recipients, // Pass all recipients at once
                    subject: params.subject,
                    html: params.html,
                    from: params.from,
                    attachments: params.attachments,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If backend fails completely
                return {
                    success: false,
                    sent: 0,
                    failed: params.recipients.length,
                    errors: [data.error || 'Backend failed'],
                };
            }

            return {
                success: data.success,
                sent: data.sent || (data.success ? params.recipients.length : 0),
                failed: data.failed || 0,
                errors: data.errors || [],
            };

        } catch (error) {
            console.error('Bulk Send Error:', error);
            return {
                success: false,
                sent: 0,
                failed: params.recipients.length,
                errors: [error instanceof Error ? error.message : 'Network error'],
            };
        }
    }
}

export const emailService = new EmailService();
