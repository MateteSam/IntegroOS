import { EmailLayout } from './EmailLayout';

export const WinBackTemplate = (): string => {
  return EmailLayout({
    title: "We've Missed You! ❤️",
    subtitle: "Come back and see what's new.",
    icon: "👋",
    content: `
      <p class="greeting">Hi <strong>{{first_name}}</strong>,</p>
      <p>It's been a while since we last saw you at {{company}}. We've been working hard on some incredible new updates that we know you'll love.</p>
      
      <div class="card" style="text-align: center;">
        <h3>A Special Gift for You</h3>
        <p>To celebrate your return, we're offering you a <strong>complimentary upgrade</strong> for your first month back.</p>
        <p style="color: #888; font-size: 14px;">Valid until {{date}}</p>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn-primary">Claim My Upgrade</a>
      </p>
      
      <p>If you have any questions, our support team is standing by to help.</p>
    `
  });
};
