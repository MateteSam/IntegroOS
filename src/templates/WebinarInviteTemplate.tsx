import { EmailLayout } from './EmailLayout';

export const WebinarInviteTemplate = (): string => {
  return EmailLayout({
    title: "You're Invited: Exclusive Masterclass",
    subtitle: "Learn the exact strategies the top 1% use.",
    icon: "🎙️",
    content: `
      <p class="greeting">Hi <strong>{{first_name}}</strong>,</p>
      <p>Are you ready to level up your skills? Join us for an exclusive masterclass where industry leaders will share their exact playbooks.</p>
      
      <div class="card">
        <h3>What You'll Learn</h3>
        <ul style="margin-left: 20px; color: #d0d0d0; line-height: 1.6;">
          <li>The 3 critical mistakes holding you back.</li>
          <li>How to automate your daily outreach.</li>
          <li>Live Q&A with our expert panel.</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="{{rsvp_link}}" class="btn-primary">Claim Your Spot Now</a>
      </p>
    `
  });
};
