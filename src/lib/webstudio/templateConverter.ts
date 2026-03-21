// ═══════════════════════════════════════════════════════════════
// INTEGRO WEBSTUDIO — Template Converter
// Converts legacy template + CustomState → EditorState
// ═══════════════════════════════════════════════════════════════

import type { WebTemplate } from '../../pages/webTemplateData';
import { CATEGORIES } from '../../pages/webTemplateData';
import type {
  EditorState, EditorBlock, SiteSettings,
  NavBlockData, HeroBlockData, StatsBlockData, ServicesBlockData,
  AboutBlockData, TestimonialsBlockData, PricingBlockData, GalleryBlockData,
  FaqBlockData, ContactBlockData, CtaBannerBlockData, LogosBlockData, FooterBlockData,
} from './editorEngine';
import { createBlock } from './editorEngine';

// ── Hero Images ─────────────────────────────────────────────
const HERO_IMAGES: Record<string, string> = {
  church: '/template-heroes/hero-church.png',
  business: '/template-heroes/hero-business.png',
  'book-launch': '/template-heroes/hero-book-launch.png',
  education: '/template-heroes/hero-education.png',
  'music-artist': '/template-heroes/hero-music.png',
  finance: '/template-heroes/hero-finance.png',
  'network-marketing': '/template-heroes/hero-network-marketing.png',
  'music-studio': '/template-heroes/hero-music-studio.png',
  fashion: '/template-heroes/hero-fashion.png',
  'video-production': '/template-heroes/hero-video-prod.png',
  products: '/template-heroes/hero-products.png',
  'online-store': '/template-heroes/hero-online-store.png',
  agency: '/template-heroes/hero-agency.png',
  travel: '/template-heroes/hero-travel.png',
  events: '/template-heroes/hero-events.png',
  podcasts: '/template-heroes/hero-podcasts.png',
  transport: '/template-heroes/hero-transport.png',
  security: '/template-heroes/hero-security.png',
};

// ── Color + Font helpers ────────────────────────────────────
function getPrimaryForScene(s: string): string {
  const m: Record<string, string> = {
    'scene-warm-church': '#D4AF37', 'scene-luxury-gold': '#D4AF37', 'scene-clean-saas': '#6366f1',
    'scene-cosmic-dark': '#8b5cf6', 'scene-neon-cyber': '#ff00ff', 'scene-neon-data': '#a78bfa',
    'scene-organic': '#10b981', 'scene-bold-gradient': '#f97316', 'scene-glassmorphism': '#818cf8',
    'scene-pastel-soft': '#f97316', 'scene-emerald-finance': '#10b981', 'scene-brutalist': '#1a1a1a',
    'scene-dark-futuristic': '#00ffc8', 'scene-fashion-runway': '#ffffff', 'scene-sunset-warm': '#f472b6',
    'scene-steel-industrial': '#3b82f6', 'scene-podcast-dark': '#8b5cf6', 'scene-event-glow': '#ec4899',
    'scene-network-geo': '#60a5fa', 'scene-product-showcase': '#1a1a1a', 'scene-ecommerce-vibrant': '#ef4444',
    'scene-video-cinematic': '#ffffff', 'scene-book-editorial': '#8b4513', 'scene-transport-bold': '#38bdf8',
  };
  return m[s] || '#D4AF37';
}
function getSecondaryForScene(s: string): string {
  const m: Record<string, string> = {
    'scene-warm-church': '#2e1a3e', 'scene-luxury-gold': '#1a1a1a', 'scene-clean-saas': '#f8f9ff',
    'scene-cosmic-dark': '#1a0a3e', 'scene-neon-cyber': '#0a0a0a', 'scene-neon-data': '#0a0a2e',
    'scene-organic': '#1a2a1e', 'scene-bold-gradient': '#feca57', 'scene-glassmorphism': '#667eea',
    'scene-pastel-soft': '#ffecd2', 'scene-emerald-finance': '#0a2a1a', 'scene-brutalist': '#f5f0e8',
    'scene-dark-futuristic': '#0a0a1a', 'scene-fashion-runway': '#0a0a0a', 'scene-sunset-warm': '#fda085',
    'scene-steel-industrial': '#16213e', 'scene-podcast-dark': '#1a0a2e', 'scene-event-glow': '#2a0a2e',
    'scene-network-geo': '#302b63', 'scene-product-showcase': '#fafafa', 'scene-ecommerce-vibrant': '#1a1a2e',
    'scene-video-cinematic': '#0a0a0a', 'scene-book-editorial': '#f5f0e0', 'scene-transport-bold': '#0f2027',
  };
  return m[s] || '#1a1a2e';
}
function isDarkScene(s: string): boolean {
  const dark = ['scene-dark-futuristic','scene-cosmic-dark','scene-neon-cyber','scene-neon-data','scene-luxury-gold','scene-steel-industrial','scene-podcast-dark','scene-event-glow','scene-network-geo','scene-ecommerce-vibrant','scene-video-cinematic','scene-fashion-runway','scene-emerald-finance','scene-organic','scene-warm-church','scene-transport-bold'];
  return dark.includes(s);
}
function getFontForScene(s: string): string {
  if (s.includes('brutalist') || s.includes('cyber')) return "'Space Grotesk', sans-serif";
  if (s.includes('editorial') || s.includes('church') || s.includes('luxury')) return "'Playfair Display', serif";
  return "'Inter', sans-serif";
}
function getLayoutForCategory(c: string): 'classic' | 'split' | 'immersive' | 'minimal' {
  const m: Record<string, 'classic' | 'split' | 'immersive' | 'minimal'> = {
    church: 'classic', business: 'classic', finance: 'classic', transport: 'classic', security: 'classic',
    agency: 'split', fashion: 'split', 'music-studio': 'split', 'online-store': 'split', products: 'split',
    'video-production': 'immersive', travel: 'immersive', events: 'immersive', 'music-artist': 'immersive',
    'book-launch': 'minimal', education: 'minimal', podcasts: 'minimal', 'network-marketing': 'minimal'
  };
  return m[c] || 'classic';
}

// ── Category-specific content generators ────────────────────
function getCtaForCategory(c: string): string {
  const m: Record<string, string> = {
    church: 'Join Our Community', business: 'Get Started Today', 'book-launch': 'Pre-Order Now',
    education: 'Start Learning', 'music-artist': 'Listen Now', finance: 'Open Account',
    'network-marketing': 'Join the Team', 'music-studio': 'Book a Session', fashion: 'Shop Collection',
    'video-production': 'View Showreel', products: 'Buy Now', 'online-store': 'Shop Now',
    agency: 'Get a Quote', travel: 'Book Your Trip', events: 'Get Tickets', podcasts: 'Listen Now',
    transport: 'Get a Quote', security: 'Request Demo',
  };
  return m[c] || 'Get Started';
}
function getHeroTitle(c: string): string {
  const m: Record<string, string> = {
    church: 'A Place of Hope, Faith & Community', business: 'Accelerate Your Business Growth',
    'book-launch': 'The Book That Changes Everything', education: 'Learn Without Limits',
    'music-artist': 'Feel The Rhythm, Live The Sound', finance: 'Smart Money, Bright Future',
    'network-marketing': 'Build Your Empire From Anywhere', 'music-studio': 'Where Sound Becomes Art',
    fashion: 'Redefining Style, One Piece at a Time', 'video-production': 'Stories That Move The World',
    products: 'Innovation Meets Design', 'online-store': 'Curated Collections, Delivered',
    agency: 'We Make Brands Unforgettable', travel: 'Your Next Adventure Starts Here',
    events: 'Unforgettable Moments Await', podcasts: 'Conversations That Matter',
    transport: 'Moving The World Forward', security: 'Protection You Can Trust',
  };
  return m[c] || 'Welcome to Your Website';
}
function getServicesForCategory(c: string): { title: string; desc: string; icon: string }[] {
  const m: Record<string, { title: string; desc: string; icon: string }[]> = {
    church: [
      { title: 'Sunday Services', desc: 'Join us every Sunday for inspiring worship and community fellowship.', icon: '⛪' },
      { title: 'Youth Ministry', desc: 'Empowering the next generation through faith, mentorship, and growth.', icon: '🌟' },
      { title: 'Community Outreach', desc: 'Making a difference through local and global outreach programs.', icon: '🤝' },
      { title: 'Online Worship', desc: 'Stream services live from anywhere in the world.', icon: '📺' },
    ],
    business: [
      { title: 'Strategy Consulting', desc: 'Data-driven insights to accelerate your market position and revenue.', icon: '📊' },
      { title: 'Digital Transformation', desc: 'Modernize operations with cutting-edge AI and automation.', icon: '⚡' },
      { title: 'Market Analysis', desc: 'Deep-dive competitive intelligence and market opportunity mapping.', icon: '🔍' },
      { title: 'Growth Hacking', desc: 'Unconventional strategies that scale your business 10x faster.', icon: '🚀' },
    ],
    fashion: [
      { title: 'New Arrivals', desc: 'Discover the latest additions to our curated collection.', icon: '✨' },
      { title: 'Seasonal Collections', desc: 'Runway-inspired pieces for every season and occasion.', icon: '🌸' },
      { title: 'Custom Design', desc: 'Bespoke garments tailored to your exact specifications.', icon: '✂️' },
      { title: 'Styling Services', desc: 'Personal styling consultations with our expert team.', icon: '👗' },
    ],
    finance: [
      { title: 'Wealth Management', desc: 'Strategic portfolio management with industry-leading returns.', icon: '💰' },
      { title: 'Investment Advisory', desc: 'Expert guidance for smart, diversified investment decisions.', icon: '📈' },
      { title: 'Tax Planning', desc: 'Optimize your tax strategy with our certified advisors.', icon: '📋' },
      { title: 'Retirement Planning', desc: 'Secure your future with personalized retirement solutions.', icon: '🏦' },
    ],
  };
  return m[c] || [
    { title: 'Service One', desc: 'Professional solutions tailored to your needs.', icon: '⚡' },
    { title: 'Service Two', desc: 'Expert guidance every step of the way.', icon: '🎯' },
    { title: 'Service Three', desc: 'Cutting-edge tools and technology.', icon: '💎' },
    { title: 'Service Four', desc: 'Dedicated support when you need it most.', icon: '🤝' },
  ];
}
function getTestimonialsForCategory(c: string): { name: string; role: string; text: string; avatar: string }[] {
  const m: Record<string, { name: string; role: string; text: string; avatar: string }[]> = {
    church: [
      { name: 'Pastor James N.', role: 'Lead Pastor, Grace Chapel', text: 'This website transformed how we connect with our congregation.', avatar: '👨‍💼' },
      { name: 'Sister Thandi M.', role: 'Youth Director', text: 'The youth ministry page alone brought in 50 new young people.', avatar: '👩‍💼' },
      { name: 'Deacon Robert K.', role: 'Church Administrator', text: 'Managing events, sermons, and community outreach has never been easier.', avatar: '👨‍💻' },
    ],
    business: [
      { name: 'Sarah Chen', role: 'CEO, TechVentures Inc.', text: 'Our conversion rate jumped 280% after launching with this template.', avatar: '👩‍💼' },
      { name: 'Michael O.', role: 'Founder, ScaleOps', text: 'Investors were immediately impressed by our digital presence.', avatar: '👨‍💼' },
      { name: 'Dr. Amina F.', role: 'COO, MedTech Africa', text: 'Professional, modern, and exactly what our enterprise clients expect.', avatar: '👩‍🔬' },
    ],
  };
  return m[c] || [
    { name: 'Sarah M.', role: 'CEO, TechVentures', text: 'Absolutely transformed our online presence.', avatar: '👩‍💼' },
    { name: 'David K.', role: 'Founder, GrowthLabs', text: 'Professional, modern, and exactly what we needed.', avatar: '👨‍💼' },
    { name: 'Amina T.', role: 'Creative Director', text: 'The attention to detail is remarkable.', avatar: '👩‍🎨' },
  ];
}
function getStatsForCategory(c: string): { value: string; label: string }[] {
  const m: Record<string, { value: string; label: string }[]> = {
    church: [{ value: '2,500+', label: 'Members' }, { value: '15', label: 'Years' }, { value: '50+', label: 'Programs' }, { value: '99%', label: 'Satisfaction' }],
    business: [{ value: '$50M+', label: 'Revenue' }, { value: '500+', label: 'Clients' }, { value: '98%', label: 'Retention' }, { value: '24/7', label: 'Support' }],
    finance: [{ value: '$2B+', label: 'Managed' }, { value: '15K+', label: 'Investors' }, { value: '12%', label: 'Returns' }, { value: 'AAA', label: 'Rating' }],
  };
  return m[c] || [{ value: '500+', label: 'Clients' }, { value: '98%', label: 'Satisfaction' }, { value: '24/7', label: 'Support' }, { value: '10+', label: 'Years' }];
}
function getFaqForCategory(c: string): { q: string; a: string }[] {
  return [
    { q: 'How do I get started?', a: 'Simply click the Get Started button or contact our team.' },
    { q: 'What makes you different?', a: 'Our combination of expertise, technology, and personalized service.' },
    { q: 'Do you offer support?', a: 'Yes! We provide 24/7 support via email, phone, and live chat.' },
    { q: 'Can I cancel anytime?', a: 'Absolutely. No long-term contracts or hidden fees.' },
  ];
}

// ═══════════════════════════════════════════════════════════════
// MAIN CONVERTER: Template → EditorState
// ═══════════════════════════════════════════════════════════════
export function templateToEditorState(template: WebTemplate): EditorState {
  const cat = CATEGORIES.find(c => c.id === template.category);
  const dark = isDarkScene(template.scene);
  const cta = getCtaForCategory(template.category);

  const blocks: EditorBlock[] = [];
  let order = 0;

  // NAV
  const navBlock = createBlock('nav', order++);
  (navBlock.data as NavBlockData).siteName = template.name;
  (navBlock.data as NavBlockData).ctaText = cta;
  blocks.push(navBlock);

  // HERO
  const heroBlock = createBlock('hero', order++);
  (heroBlock.data as HeroBlockData).title = getHeroTitle(template.category);
  (heroBlock.data as HeroBlockData).subtitle = template.description;
  (heroBlock.data as HeroBlockData).ctaText = cta;
  (heroBlock.data as HeroBlockData).backgroundImage = HERO_IMAGES[template.category] || '';
  (heroBlock.data as HeroBlockData).badge = cat?.label || '';
  blocks.push(heroBlock);

  // STATS
  const statsBlock = createBlock('stats', order++);
  (statsBlock.data as StatsBlockData).stats = getStatsForCategory(template.category);
  blocks.push(statsBlock);

  // SERVICES
  const servicesBlock = createBlock('services', order++);
  (servicesBlock.data as ServicesBlockData).items = getServicesForCategory(template.category);
  blocks.push(servicesBlock);

  // ABOUT
  const aboutBlock = createBlock('about', order++);
  (aboutBlock.data as AboutBlockData).text = `We are dedicated to providing the best ${(cat?.label || 'business').toLowerCase()} experience. Our team of professionals ensures every detail meets the highest standards.`;
  (aboutBlock.data as AboutBlockData).ctaText = cta;
  blocks.push(aboutBlock);

  // TESTIMONIALS
  const testimonialsBlock = createBlock('testimonials', order++);
  (testimonialsBlock.data as TestimonialsBlockData).items = getTestimonialsForCategory(template.category);
  blocks.push(testimonialsBlock);

  // PRICING
  blocks.push(createBlock('pricing', order++));

  // GALLERY
  blocks.push(createBlock('gallery', order++));

  // FAQ
  const faqBlock = createBlock('faq', order++);
  (faqBlock.data as FaqBlockData).items = getFaqForCategory(template.category);
  blocks.push(faqBlock);

  // CONTACT
  blocks.push(createBlock('contact', order++));

  // CTA BANNER
  blocks.push(createBlock('cta-banner', order++));

  // LOGOS
  blocks.push(createBlock('logos', order++));

  // FOOTER
  const footerBlock = createBlock('footer', order++);
  (footerBlock.data as FooterBlockData).copyright = `© 2026 ${template.name}. All rights reserved. Powered by WCCCS / Integro OS`;
  blocks.push(footerBlock);

  const settings: SiteSettings = {
    primaryColor: getPrimaryForScene(template.scene),
    secondaryColor: getSecondaryForScene(template.scene),
    bgColor: dark ? '#0a0a14' : '#fafafa',
    textColor: dark ? '#e2e8f0' : '#1a1a2e',
    fontHeading: getFontForScene(template.scene),
    fontBody: "'Inter', sans-serif",
    borderRadius: 12,
    layoutTheme: getLayoutForCategory(template.category),
    editMode: 'grid',
  };

  return {
    siteId: 'site_' + Date.now().toString(36),
    templateId: template.id,
    blocks,
    settings,
    media: [],
    isDirty: false,
    lastSaved: null,
  };
}
