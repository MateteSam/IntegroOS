import { EmailLayout } from './EmailLayout';

export const FaithNexusInvitationTemplate = (): string => {
  return EmailLayout({
    title: "Faith Nexus 2026 VIP Invitation",
    subtitle: "You're exclusively invited to join the vanguard of digital ministry.",
    icon: "🕊️",
    content: `
      <p class="greeting">Dear <strong>{{first_name}}</strong>,</p>
      <p>We are honored to invite you to the Faith Nexus Launch Event. This is an exclusive gathering of leaders setting the standard for the future.</p>
      
      <div class="card">
        <h3>📅 Event Details</h3>
        <p><strong>Date:</strong> {{date}}</p>
        <p><strong>Platform:</strong> TalkWorld Virtual Platform</p>
        <p><strong>Access:</strong> Exclusive VIP Pass</p>
      </div>

      <p style="text-align: center;">
        <a href="{{rsvp_link}}" class="btn-primary">Confirm Your VIP Access</a>
      </p>
      
      <p>Once you RSVP, you will receive a calendar invite with the direct access link to the virtual stage.</p>
    `
  });
};
