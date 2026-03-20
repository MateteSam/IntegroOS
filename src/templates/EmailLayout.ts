export interface EmailLayoutProps {
  title: string;
  subtitle?: string;
  icon?: string;
  content: string;
}

export function EmailLayout({ title, subtitle, icon = '✨', content }: EmailLayoutProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%); }
    .header { padding: 50px 30px; text-align: center; background: linear-gradient(135deg, #C5A059 0%, #8C6D23 100%); }
    .welcome-icon { font-size: 48px; margin-bottom: 20px; }
    .hero-title { font-size: 32px; font-weight: 700; line-height: 1.2; margin-bottom: 10px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .hero-subtitle { font-size: 16px; opacity: 0.9; color: #f0f0f0; }
    .content { padding: 40px 30px; }
    
    /* Typography */
    h2 { font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #C5A059; }
    h3 { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #e0e0e0; }
    p { font-size: 16px; line-height: 1.7; color: #d0d0d0; margin-bottom: 25px; }
    .greeting { font-size: 18px; margin-bottom: 35px; }
    .greeting strong { color: #C5A059; }
    
    /* Components */
    .btn-primary { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #C5A059 0%, #8C6D23 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; margin: 20px 0; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(197,160,89,0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px; }
    
    /* Steps */
    .step { display: flex; align-items: flex-start; margin-bottom: 25px; }
    .step-number { width: 40px; height: 40px; background: linear-gradient(135deg, #C5A059 0%, #8C6D23 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; margin-right: 20px; flex-shrink: 0; color: #fff; }
    .step-content { flex: 1; }
    .step-title { font-size: 16px; font-weight: 600; margin-bottom: 5px; color: #fff; }
    .step-desc { font-size: 14px; color: #b8b8d0; line-height: 1.5; }
    
    /* Footer */
    .footer { padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); background: #0a0a0f; }
    .footer p { font-size: 12px; color: #666; margin-bottom: 8px; }
    .footer a { color: #C5A059; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="welcome-icon">${icon}</div>
      <h1 class="hero-title">${title}</h1>
      ${subtitle ? `<p class="hero-subtitle">${subtitle}</p>` : ''}
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} {company}. All rights reserved.</p>
      <p>This email was sent to {email}.</p>
      <p><a href="#">Unsubscribe</a> • <a href="#">Preferences</a> • <a href="#">View in browser</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
