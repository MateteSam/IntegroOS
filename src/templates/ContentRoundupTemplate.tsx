import { EmailLayout } from './EmailLayout';

export const ContentRoundupTemplate = (): string => {
  return EmailLayout({
    title: "Your Weekly Top Reads",
    subtitle: "Curated specifically for you.",
    icon: "📚",
    content: `
      <p class="greeting">Hi <strong>{{first_name}}</strong>,</p>
      <p>We've scoured the web and our own archives to bring you the best content from this week. Grab a coffee and dive in.</p>
      
      <div class="card">
        <h3>🔥 Trending This Week</h3>
        <p><strong>1. How to scale your systems</strong><br/><span style="color: #888; font-size: 14px;">A deep dive into architecture.</span></p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 15px 0;" />
        <p><strong>2. The Future of AI Workflows</strong><br/><span style="color: #888; font-size: 14px;">Why implicit automation wins.</span></p>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn-primary">Browse All Articles</a>
      </p>
    `
  });
};
