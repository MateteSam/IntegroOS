import { EmailLayout } from './EmailLayout';

export const ProductLaunchTemplate = (): string => {
  return EmailLayout({
    title: "Introducing Our Newest Feature",
    subtitle: "The next generation of tools is finally here.",
    icon: "🚀",
    content: `
      <p class="greeting">Hi <strong>{{first_name}}</strong>,</p>
      <p>After months of development and testing with our top users, we are thrilled to announce that our completely redesigned workflow engine is now live!</p>
      
      <div class="card">
        <h3>✨ What's New?</h3>
        <ul>
          <li style="margin-bottom: 10px; color: #d0d0d0;"><strong>Lightning Fast:</strong> 10x faster rendering speeds.</li>
          <li style="margin-bottom: 10px; color: #d0d0d0;"><strong>AI Powered:</strong> Automate your daily repetitive tasks implicitly.</li>
          <li style="margin-bottom: 10px; color: #d0d0d0;"><strong>Stunning UI:</strong> A completely fresh coat of paint.</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn-primary">Try It Now</a>
      </p>
    `
  });
};
