import nodemailer from 'nodemailer';

const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        console.warn('Missing SMTP configuration. Emails will NOT be sent.');
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user,
            pass,
        },
    });
};

export const sendEmail = async ({ to, subject, html, from, text, attachments }) => {
    const transporter = createTransporter();

    if (!transporter) {
        return { success: false, error: 'SMTP Configuration missing' };
    }

    try {
        const info = await transporter.sendMail({
            from: from || process.env.SMTP_FROM || '"Integro Mail" <noreply@example.com>',
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // Fallback text
            attachments
        });

        console.log(`Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};
