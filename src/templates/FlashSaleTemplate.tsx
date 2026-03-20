import { EmailLayout } from './EmailLayout';

export const FlashSaleTemplate = (): string => {
  return EmailLayout({
    title: "Flash Sale: 50% Off Everything ⚡",
    subtitle: "Hurry, this offer expires in 24 hours!",
    icon: "🔥",
    content: `
      <p class="greeting">Hey <strong>{{first_name}}</strong>,</p>
      <p>For the next 24 hours only, we are dropping prices by 50% across our entire catalog at {{company}}.</p>
      
      <div class="card" style="text-align: center; border-color: #ef4444; background: rgba(239, 68, 68, 0.05);">
        <h3 style="color: #ef4444; font-size: 24px;">Use Code: FLASH50</h3>
        <p style="margin-bottom: 0;">Apply this code at checkout.</p>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn-primary" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">Shop the Sale</a>
      </p>
    `
  });
};
