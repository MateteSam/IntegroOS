import { EmailLayout } from './EmailLayout';

export const WelcomeEmailTemplate = (): string => {
  return EmailLayout({
    title: "Welcome to {{company}}!",
    subtitle: "We're absolutely thrilled to have you on board.",
    icon: "🎉",
    content: `
      <p class="greeting">Hi <strong>{{first_name}}</strong>! 👋</p>
      <p>Thank you for joining us! We're excited to help you hit the ground running. Everything you need to get started is right here.</p>
      
      <div class="card">
        <h3>🚀 Get Started in 3 Easy Steps</h3>
        
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4 class="step-title">Complete Your Profile</h4>
            <p class="step-desc">Add your details to personalize your experience and recommendations.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4 class="step-title">Explore the Dashboard</h4>
            <p class="step-desc">Take a quick tour of your new dashboard to discover powerful features.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4 class="step-title">Create Your First Campaign</h4>
            <p class="step-desc">Dive right in! We're here to help every step of the way.</p>
          </div>
        </div>
      </div>
      
      <p style="text-align: center;">
        <a href="#" class="btn-primary">Access Your Dashboard</a>
      </p>
    `
  });
};
