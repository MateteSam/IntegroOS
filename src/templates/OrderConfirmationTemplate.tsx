import { EmailLayout } from './EmailLayout';

export const OrderConfirmationTemplate = (): string => {
  return EmailLayout({
    title: "Order Confirmed!",
    subtitle: "Thanks for shopping with {{company}}.",
    icon: "🛍️",
    content: `
      <p class="greeting">Hi <strong>{{first_name}}</strong>,</p>
      <p>We've received your order and we're getting it ready to ship immediately.</p>
      
      <div class="card">
        <h3>Order Summary</h3>
        <p><strong>Order #:</strong> 8274-XYZ</p>
        <p><strong>Date:</strong> {{date}}</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 15px 0;" />
        <p>We'll send you another email when your items have shipped, complete with your tracking details.</p>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn-primary">View Order Status</a>
      </p>
    `
  });
};
