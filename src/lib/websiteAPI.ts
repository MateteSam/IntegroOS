// Website generation and deployment API integrations
import { generateAIText } from './aiClient';

export type WebsiteTemplate = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  features: string[];
  htmlTemplate: string;
  cssTemplate: string;
  jsTemplate: string;
};

export type WebsiteGenerationRequest = {
  businessName: string;
  industry: string;
  pages: string[];
  style: 'modern' | 'classic' | 'minimal' | 'creative';
  colors: { primary: string; secondary: string; accent: string };
  features: string[];
};

export type GeneratedWebsite = {
  id: string;
  name: string;
  url: string;
  previewUrl: string;
  pages: { [key: string]: string };
  assets: { [key: string]: string };
  status: 'generating' | 'completed' | 'deployed' | 'failed';
  progress: number;
};

// Website template generation
export function getWebsiteTemplates(industry: string): WebsiteTemplate[] {
  const baseTemplates = [
    {
      name: 'Professional Business',
      description: 'Clean, corporate design with hero section and services',
      category: 'business',
      features: ['Hero Section', 'Services Grid', 'About Us', 'Contact Form', 'Testimonials']
    },
    {
      name: 'Modern Startup',
      description: 'Contemporary design with animations and modern layouts',
      category: 'startup',
      features: ['Animated Hero', 'Product Features', 'Team Section', 'Pricing Table', 'CTA Buttons']
    },
    {
      name: 'E-commerce Store',
      description: 'Product-focused design with shopping features',
      category: 'ecommerce',
      features: ['Product Catalog', 'Shopping Cart', 'Product Details', 'Checkout', 'Reviews']
    },
    {
      name: 'Portfolio Showcase',
      description: 'Creative layout for showcasing work and projects',
      category: 'portfolio',
      features: ['Project Gallery', 'Skills Section', 'About Me', 'Contact', 'Blog']
    },
    {
      name: 'Landing Page',
      description: 'Conversion-focused single page design',
      category: 'landing',
      features: ['Hero with CTA', 'Benefits', 'Social Proof', 'FAQ', 'Lead Capture']
    },
    {
      name: 'Restaurant/Food',
      description: 'Appetizing design for food businesses',
      category: 'restaurant',
      features: ['Menu Display', 'Gallery', 'Reservations', 'Location', 'Reviews']
    }
  ];

  return baseTemplates.map((template, index) => ({
    id: `template_${index}`,
    name: template.name,
    description: template.description,
    thumbnail: `https://source.unsplash.com/600x400/?website,${template.category}`,
    category: template.category,
    features: template.features,
    htmlTemplate: generateHTMLTemplate(template.name, template.features),
    cssTemplate: generateCSSTemplate(template.category),
    jsTemplate: generateJSTemplate(template.features)
  }));
}

// AI-powered website generation
export async function generateWebsite(request: WebsiteGenerationRequest): Promise<GeneratedWebsite> {
  const websiteId = `website_${Date.now()}`;
  
  try {
    // Generate website structure using AI
    const structurePrompt = `Create a website structure for "${request.businessName}" in the ${request.industry} industry.
    Style: ${request.style}
    Pages needed: ${request.pages.join(', ')}
    Features: ${request.features.join(', ')}
    
    Return JSON with:
    - sitemap (page hierarchy)
    - navigation structure
    - content outline for each page
    - recommended sections
    Keep it professional and SEO-optimized.`;
    
    const { text: structureText } = await generateAIText(structurePrompt);
    let structure = {};
    try {
      structure = JSON.parse(structureText);
    } catch {
      structure = { sitemap: request.pages, navigation: request.pages };
    }
    
    const website: GeneratedWebsite = {
      id: websiteId,
      name: request.businessName,
      url: `https://${websiteId}.lovable.app`,
      previewUrl: `https://preview-${websiteId}.lovable.app`,
      pages: {},
      assets: {},
      status: 'generating',
      progress: 20
    };
    
    // Generate individual pages
    for (const pageName of request.pages) {
      const pagePrompt = `Generate HTML content for the ${pageName} page of ${request.businessName}.
      Industry: ${request.industry}
      Style: ${request.style}
      
      Include:
      - SEO-optimized structure
      - Semantic HTML5
      - Responsive design classes
      - Engaging content
      - Call-to-action elements
      
      Return only the HTML content for the main section.`;
      
      const { text: pageHTML } = await generateAIText(pagePrompt);
      website.pages[pageName] = pageHTML || generateFallbackPage(pageName, request);
      website.progress += Math.floor(60 / request.pages.length);
    }
    
    // Generate CSS
    const cssPrompt = `Generate CSS for ${request.businessName} website.
    Style: ${request.style}
    Colors: Primary ${request.colors.primary}, Secondary ${request.colors.secondary}, Accent ${request.colors.accent}
    
    Include:
    - Modern, responsive design
    - Smooth animations
    - Professional typography
    - Mobile-first approach
    - Accessibility features
    
    Return CSS code only.`;
    
    const { text: cssContent } = await generateAIText(cssPrompt);
    website.assets['styles.css'] = cssContent || generateFallbackCSS(request);
    website.progress = 90;
    
    // Complete generation
    setTimeout(() => {
      website.status = 'completed';
      website.progress = 100;
    }, 2000);
    
    return website;
    
  } catch (error) {
    return generateFallbackWebsite(request);
  }
}

function generateHTMLTemplate(templateName: string, features: string[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{BUSINESS_NAME}} - {{PAGE_TITLE}}</title>
    <meta name="description" content="{{META_DESCRIPTION}}">
    <link href="styles.css" rel="stylesheet">
</head>
<body>
    <header class="header">
        <nav class="navigation">
            <div class="nav-brand">{{BUSINESS_NAME}}</div>
            <ul class="nav-menu">
                {{NAVIGATION_ITEMS}}
            </ul>
        </nav>
    </header>
    
    <main class="main-content">
        {{MAIN_CONTENT}}
    </main>
    
    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2024 {{BUSINESS_NAME}}. All rights reserved.</p>
        </div>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`;
}

function generateCSSTemplate(category: string): string {
  const colorSchemes = {
    business: { primary: '#2563eb', secondary: '#1e40af', accent: '#60a5fa' },
    startup: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#a78bfa' },
    ecommerce: { primary: '#059669', secondary: '#047857', accent: '#34d399' },
    portfolio: { primary: '#dc2626', secondary: '#b91c1c', accent: '#f87171' },
    landing: { primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c' },
    restaurant: { primary: '#92400e', secondary: '#78350f', accent: '#d97706' }
  };
  
  const colors = colorSchemes[category as keyof typeof colorSchemes] || colorSchemes.business;
  
  return `:root {
    --primary-color: ${colors.primary};
    --secondary-color: ${colors.secondary};
    --accent-color: ${colors.accent};
    --text-color: #1f2937;
    --background-color: #ffffff;
    --border-color: #e5e7eb;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
}

.header {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.navigation {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-menu a:hover {
    color: var(--primary-color);
}

.main-content {
    min-height: calc(100vh - 200px);
}

.footer {
    background: var(--text-color);
    color: white;
    text-align: center;
    padding: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .navigation {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-menu {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
}`;
}

function generateJSTemplate(features: string[]): string {
  return `// Website JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuButton && navMenu) {
        mobileMenuButton.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Form validation and submission
    const contactForms = document.querySelectorAll('form');
    contactForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add form validation logic here
            console.log('Form submitted:', new FormData(form));
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.textContent = 'Thank you for your message!';
            successMessage.className = 'success-message';
            form.appendChild(successMessage);
            
            // Reset form
            form.reset();
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .slide-in').forEach(el => {
        observer.observe(el);
    });
});`;
}

function generateFallbackPage(pageName: string, request: WebsiteGenerationRequest): string {
  const pageContent = {
    home: `
      <section class="hero">
        <div class="hero-content">
          <h1>Welcome to ${request.businessName}</h1>
          <p>Your trusted partner in ${request.industry}</p>
          <button class="cta-button">Get Started</button>
        </div>
      </section>
    `,
    about: `
      <section class="about">
        <div class="container">
          <h1>About ${request.businessName}</h1>
          <p>We are a leading company in the ${request.industry} industry, committed to delivering exceptional results.</p>
        </div>
      </section>
    `,
    services: `
      <section class="services">
        <div class="container">
          <h1>Our Services</h1>
          <div class="services-grid">
            <div class="service-card">
              <h3>Professional Solutions</h3>
              <p>Expert ${request.industry} services tailored to your needs.</p>
            </div>
          </div>
        </div>
      </section>
    `,
    contact: `
      <section class="contact">
        <div class="container">
          <h1>Contact Us</h1>
          <form class="contact-form">
            <input type="text" placeholder="Your Name" required>
            <input type="email" placeholder="Your Email" required>
            <textarea placeholder="Your Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>
    `
  };
  
  return pageContent[pageName as keyof typeof pageContent] || pageContent.home;
}

function generateFallbackCSS(request: WebsiteGenerationRequest): string {
  return generateCSSTemplate('business') + `
    .hero {
      background: linear-gradient(135deg, ${request.colors.primary}, ${request.colors.secondary});
      color: white;
      padding: 6rem 2rem;
      text-align: center;
    }
    
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .hero p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }
    
    .cta-button {
      background: ${request.colors.accent};
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }
  `;
}

function generateFallbackWebsite(request: WebsiteGenerationRequest): GeneratedWebsite {
  const websiteId = `fallback_${Date.now()}`;
  
  return {
    id: websiteId,
    name: request.businessName,
    url: `https://${websiteId}.lovable.app`,
    previewUrl: `https://preview-${websiteId}.lovable.app`,
    pages: {
      home: generateFallbackPage('home', request),
      about: generateFallbackPage('about', request),
      services: generateFallbackPage('services', request),
      contact: generateFallbackPage('contact', request)
    },
    assets: {
      'styles.css': generateFallbackCSS(request)
    },
    status: 'completed',
    progress: 100
  };
}

// Website deployment (placeholder for actual deployment APIs)
export async function deployWebsite(website: GeneratedWebsite): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In a real implementation, this would deploy to Netlify, Vercel, etc.
    return {
      success: true,
      url: website.url
    };
  } catch (error) {
    return {
      success: false,
      error: 'Deployment failed. Please try again.'
    };
  }
}