import { EmailLayout } from './EmailLayout';

export const CaseStudyTemplate = (): string => {
  return EmailLayout({
    title: "How We Helped Acme Corp Grow 300%",
    subtitle: "Read our latest success story.",
    icon: "📈",
    content: `
      <p class="greeting">Hi <strong>{{first_name}}</strong>,</p>
      <p>Ever wondered how top companies achieve triple-digit growth in a single quarter? We recently partnered with Acme Corp to overhaul their workflow, and the results speak for themselves.</p>
      
      <div class="card">
        <h3>The Challenge & The Solution</h3>
        <p>Acme Corp was struggling with manual processes that slowed their entire team down. By implementing {{company}}'s automated engine, they eliminated 40 hours of manual work per week.</p>
        <ul style="margin-left: 20px; color: #d0d0d0; line-height: 1.6;">
          <li>300% increase in lead conversion</li>
          <li>40+ hours saved weekly</li>
          <li>100% team adoption</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn-primary">Read the Full Case Study</a>
      </p>
    `
  });
};
