import { EmailLayout } from './EmailLayout';

export const WeeklyDigestTemplate = (): string => {
  return EmailLayout({
    title: "Weekly Updates & News",
    subtitle: "Everything you missed at {{company}}.",
    icon: "📰",
    content: `
      <p class="greeting">Hi <strong>{{first_name}}</strong>,</p>
      <p>It's been quite a week! Here's a quick recap of the biggest updates, features, and community wins from our team.</p>
      
      <div class="card" style="border-color: #10b981; background: rgba(16, 185, 129, 0.05);">
        <h3 style="color: #10b981;">Feature Highlights</h3>
        <ul style="margin-left: 20px; color: #d0d0d0; line-height: 1.6;">
          <li>New integration with Zapier is live.</li>
          <li>Performance improvements on the dashboard.</li>
          <li>Bug fixes across the mobile app.</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn-primary">View Full Changelog</a>
      </p>
    `
  });
};
