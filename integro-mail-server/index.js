import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' }); // Load env vars from root .env.local

import express from 'express';
import cors from 'cors';
import { sendEmail } from './mailer.js'; // Note the .js extension is required in ESM

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support large payloads (attachments)

import fs from 'fs/promises';
import path from 'path';

// Routes

// FS Endpoints for Code Studio
app.get('/api/fs/read', async (req, res) => {
    try {
        const filePath = req.query.path;
        const content = await fs.readFile(filePath, 'utf-8');
        res.json({ content });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/fs/write', async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        await fs.writeFile(filePath, content, 'utf-8');
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/fs/list', async (req, res) => {
    try {
        const dir = req.query.dir;
        const files = await fs.readdir(dir);
        const items = [];
        for (const f of files) {
            const stat = await fs.stat(path.join(dir, f));
            items.push({ name: f, isDir: stat.isDirectory() });
        }
        res.json({ items });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/send-email', async (req, res) => {
    const { to, subject, html, from, attachments } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Handle single or multiple recipients
    const recipients = Array.isArray(to) ? to : [to];

    if (recipients.length === 1) {
        // Single email
        const recipientItem = recipients[0];
        let toEmail = typeof recipientItem === 'object' ? recipientItem.email : recipientItem;
        let recipientData = typeof recipientItem === 'object' ? (recipientItem.data || {}) : {};
        
        // Replace variables in HTML: {{key}}
        let personalizedHtml = html;
        if (personalizedHtml) {
            personalizedHtml = personalizedHtml.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
                return recipientData[key] !== undefined ? recipientData[key] : (key === 'name' ? 'Friend' : '');
            });
        }

        const result = await sendEmail({ to: toEmail, subject, html: personalizedHtml, from, attachments });
        if (result.success) {
            return res.json(result);
        } else {
            return res.status(500).json(result);
        }
    } else {
        // Bulk emails (Basic implementation: loops sequentially)
        // In production, use a queue (BullMQ/Redis)
        const results = {
            success: true,
            sent: 0,
            failed: 0,
            errors: []
        };

        // We'll respond immediately to the client that the process started, 
        // OR we wait. For < 50 emails, we can wait. Let's wait for now to keep it simple.
        for (const recipientItem of recipients) {
            let toEmail = typeof recipientItem === 'object' ? recipientItem.email : recipientItem;
            let recipientData = typeof recipientItem === 'object' ? (recipientItem.data || {}) : {};
            
            let personalizedHtml = html;
            if (personalizedHtml) {
                personalizedHtml = personalizedHtml.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
                    return recipientData[key] !== undefined ? recipientData[key] : (key === 'name' ? 'Friend' : '');
                });
            }

            const result = await sendEmail({ to: toEmail, subject, html: personalizedHtml, from, attachments });
            if (result.success) {
                results.sent++;
            } else {
                results.failed++;
                results.errors.push(`${toEmail}: ${result.error}`);
            }
            // Simple rate limit delay
            await new Promise(r => setTimeout(r, 200));
        }

        res.json(results);
    }
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'online', service: 'Integro Mail Backend' });
});

// RSVP Tracking Endpoint (GET Request from Email Link)
app.get('/api/rsvp', async (req, res) => {
    const { email, name } = req.query;
    const targetUrl = 'https://faithnexus.digital/';

    if (!email) {
        return res.redirect(targetUrl); // Fail safe, just redirect
    }

    try {
        // Notify Admin
        await sendEmail({
            to: 'phokasmatete@gmail.com',
            from: '"Faith Nexus RSVP" <rsvp@faithnexus.digital>',
            subject: `New Registration: ${name || 'Unknown'}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 500px;">
                    <h2 style="color: #C5A059;">New RSVP Confirmed</h2>
                    <p><strong>Name:</strong> ${name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <p style="font-size: 12px; color: #888;">Sent from Integro Mail System</p>
                </div>
            `
        });
        console.log(`RSVP Logged: ${email}`);
    } catch (e) {
        console.error('RSVP Notification Failed:', e);
    }

    // Always redirect user to the launch page
    res.redirect(targetUrl);
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
