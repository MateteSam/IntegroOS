import { EmailLayout } from './EmailLayout';

export const EventReminderTemplate = (): string => {
  return EmailLayout({
    title: "Reminder: Event Starts Soon!",
    subtitle: "We're going live in just a few hours.",
    icon: "⏳",
    content: `
      <p class="greeting">Hi <strong>{{first_name}}</strong>,</p>
      <p>This is a quick reminder that our highly anticipated event is starting very soon. We can't wait to see you there!</p>
      
      <div class="card" style="text-align: center;">
        <h3 style="color: #C5A059;">Today's Agenda</h3>
        <p>Join us as we unveil the future of digital connectivity and showcase our newest tools.</p>
        <p><strong>Starts At:</strong> 2:00 PM EST</p>
      </div>

      <p style="text-align: center;">
        <a href="{{rsvp_link}}" class="btn-primary">Join the Live Event</a>
      </p>
    `
  });
};
