import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowLeft, Eye, EyeOff, Smartphone, Monitor, Tablet,
  Palette, Type, Save, Download, Settings2, Layout,
  PenTool, Star, Check, ChevronRight, Play, ArrowRight,
  Mail, MapPin, Phone, Clock, Award, Users, TrendingUp,
  Shield, Zap, Heart, Globe, Quote, Instagram, Twitter, Facebook,
  ChevronDown, Send, MessageCircle, HelpCircle, Building2,
  Rocket, Undo2, Redo2
} from 'lucide-react';
import { TEMPLATES, CATEGORIES, type WebTemplate } from './webTemplateData';
import { BlockWrapper, BlockInsertButton } from '../components/webstudio/BlockUI';
import { templateToEditorState } from '../lib/webstudio/templateConverter';
import {
  type EditorState, type EditorBlock, type BlockType,
  addBlock, removeBlock, moveBlock, duplicateBlock,
  toggleBlockVisibility, updateBlockData, EditorHistory,
} from '../lib/webstudio/editorEngine';
import { DeployModal } from '../components/webstudio/DeployModal';
import './TemplatePreview.css';

// ═══════════════════════════════════════════════════════════════
// HERO IMAGE MAP — AI-generated images per category
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// CUSTOMIZATION STATE
// ═══════════════════════════════════════════════════════════════
interface CustomState {
  siteName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  ctaText: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  services: { title: string; desc: string; icon: string }[];
  testimonials: { name: string; role: string; text: string; avatar: string }[];
  stats: { value: string; label: string }[];
  pricingPlans: { name: string; price: string; features: string[]; popular?: boolean }[];
  faq: { q: string; a: string }[];
  showNav: boolean;
  showFooter: boolean;
  showStats: boolean;
  showPricing: boolean;
  showGallery: boolean;
  showFaq: boolean;
  showContact: boolean;
  borderRadius: number;
  layoutTheme: 'classic' | 'split' | 'immersive' | 'minimal';
}

// ── Per-scene defaults ──────────────────────────────────────
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
function getDefaultCustom(t: WebTemplate): CustomState {
  const cat = CATEGORIES.find(c => c.id === t.category);
  const dark = isDarkScene(t.scene);
  return {
    siteName: t.name,
    tagline: t.description,
    primaryColor: getPrimaryForScene(t.scene),
    secondaryColor: getSecondaryForScene(t.scene),
    bgColor: dark ? '#0a0a14' : '#fafafa',
    textColor: dark ? '#e2e8f0' : '#1a1a2e',
    fontHeading: getFontForScene(t.scene),
    fontBody: "'Inter', sans-serif",
    ctaText: getCtaForCategory(t.category),
    heroTitle: getHeroTitle(t),
    heroSubtitle: t.description,
    aboutText: `We are dedicated to providing the best ${(cat?.label || 'Business').toLowerCase()} experience. Our team of professionals ensures every detail meets the highest standards of quality and innovation.`,
    services: getServicesForCategory(t.category),
    testimonials: getTestimonialsForCategory(t.category),
    stats: getStatsForCategory(t.category),
    pricingPlans: getPricingForCategory(t.category),
    faq: getFaqForCategory(t.category),
    showNav: true, showFooter: true, showStats: true, showPricing: true, showGallery: true, showFaq: true, showContact: true,
    borderRadius: 12,
    layoutTheme: getLayoutForCategory(t.category),
  };
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
function getHeroTitle(t: WebTemplate): string {
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
  return m[t.category] || t.name;
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
    travel: [
      { title: 'Guided Tours', desc: 'Expertly curated tours to the world\'s most stunning destinations.', icon: '🗺️' },
      { title: 'Flight Booking', desc: 'Best rates on international and domestic flights worldwide.', icon: '✈️' },
      { title: 'Hotel Packages', desc: 'Luxury accommodations at exclusive partner properties.', icon: '🏨' },
      { title: 'Travel Insurance', desc: 'Comprehensive coverage for worry-free adventures.', icon: '🛡️' },
    ],
    events: [
      { title: 'Event Planning', desc: 'Full-service event management from concept to execution.', icon: '🎪' },
      { title: 'Venue Booking', desc: 'Access to exclusive venues for unforgettable experiences.', icon: '🏛️' },
      { title: 'Catering', desc: 'World-class culinary experiences for every type of event.', icon: '🍽️' },
      { title: 'Entertainment', desc: 'Top-tier performers and entertainment packages.', icon: '🎶' },
    ],
    security: [
      { title: 'CCTV Installation', desc: 'HD surveillance systems with 24/7 remote monitoring.', icon: '📹' },
      { title: 'Access Control', desc: 'Biometric and smart card access management systems.', icon: '🔐' },
      { title: 'Cyber Security', desc: 'Enterprise-grade digital threat protection and response.', icon: '🛡️' },
      { title: '24/7 Monitoring', desc: 'Round-the-clock security operations center coverage.', icon: '👁️' },
    ],
  };
  return m[c] || [
    { title: 'Service One', desc: 'Professional solutions tailored to your needs.', icon: '⚡' },
    { title: 'Service Two', desc: 'Expert guidance every step of the way.', icon: '🎯' },
    { title: 'Service Three', desc: 'Cutting-edge tools and technology.', icon: '💎' },
    { title: 'Service Four', desc: 'Dedicated support when you need it most.', icon: '🤝' },
  ];
}
function getTestimonialsForCategory(c: string): CustomState['testimonials'] {
  const m: Record<string, CustomState['testimonials']> = {
    church: [
      { name: 'Pastor James N.', role: 'Lead Pastor, Grace Chapel', text: 'This website transformed how we connect with our congregation. Online giving increased 340% in the first month.', avatar: '👨‍💼' },
      { name: 'Sister Thandi M.', role: 'Youth Director', text: 'The youth ministry page alone brought in 50 new young people. The design speaks to their generation.', avatar: '👩‍💼' },
      { name: 'Deacon Robert K.', role: 'Church Administrator', text: 'Managing events, sermons, and community outreach has never been easier. Truly a game-changer.', avatar: '👨‍💻' },
    ],
    business: [
      { name: 'Sarah Chen', role: 'CEO, TechVentures Inc.', text: 'Our conversion rate jumped 280% after launching with this template. The ROI speaks for itself.', avatar: '👩‍💼' },
      { name: 'Michael O.', role: 'Founder, ScaleOps', text: 'Investors were immediately impressed by our digital presence. Raised $2M within 3 months of launch.', avatar: '👨‍💼' },
      { name: 'Dr. Amina F.', role: 'COO, MedTech Africa', text: 'Professional, modern, and exactly what our enterprise clients expect. 5 stars across the board.', avatar: '👩‍🔬' },
    ],
  };
  return m[c] || [
    { name: 'Sarah M.', role: 'CEO, TechVentures', text: 'Absolutely transformed our online presence. The design is stunning and our conversions tripled.', avatar: '👩‍💼' },
    { name: 'David K.', role: 'Founder, GrowthLabs', text: 'Professional, modern, and exactly what we needed. Highly recommend this template.', avatar: '👨‍💼' },
    { name: 'Amina T.', role: 'Creative Director', text: 'The attention to detail is remarkable. Our clients are always impressed with the website.', avatar: '👩‍🎨' },
  ];
}
function getStatsForCategory(c: string): { value: string; label: string }[] {
  const m: Record<string, { value: string; label: string }[]> = {
    church: [{ value: '2,500+', label: 'Members' }, { value: '15', label: 'Years of Ministry' }, { value: '50+', label: 'Outreach Programs' }, { value: '99%', label: 'Satisfaction' }],
    business: [{ value: '$50M+', label: 'Revenue Generated' }, { value: '500+', label: 'Clients Served' }, { value: '98%', label: 'Client Retention' }, { value: '24/7', label: 'Support' }],
    fashion: [{ value: '10K+', label: 'Products' }, { value: '50+', label: 'Countries' }, { value: '4.9★', label: 'Rating' }, { value: '1M+', label: 'Customers' }],
    finance: [{ value: '$2B+', label: 'Assets Managed' }, { value: '15K+', label: 'Investors' }, { value: '12%', label: 'Avg. Annual Return' }, { value: 'AAA', label: 'Credit Rating' }],
    travel: [{ value: '100+', label: 'Destinations' }, { value: '50K+', label: 'Happy Travelers' }, { value: '4.8★', label: 'Rating' }, { value: '24/7', label: 'Support' }],
    events: [{ value: '500+', label: 'Events Hosted' }, { value: '1M+', label: 'Attendees' }, { value: '98%', label: 'Satisfaction' }, { value: '50+', label: 'Venues' }],
    security: [{ value: '10K+', label: 'Sites Protected' }, { value: '99.9%', label: 'Uptime' }, { value: '24/7', label: 'Monitoring' }, { value: '0', label: 'Breaches' }],
  };
  return m[c] || [{ value: '500+', label: 'Clients' }, { value: '98%', label: 'Satisfaction' }, { value: '24/7', label: 'Support' }, { value: '10+', label: 'Years' }];
}
function getPricingForCategory(c: string): CustomState['pricingPlans'] {
  return [
    { name: 'Starter', price: 'R299', features: ['5 Pages', 'Mobile Responsive', 'SEO Optimized', 'Contact Form', '1 Month Support'] },
    { name: 'Professional', price: 'R599', features: ['15 Pages', 'Custom Animations', 'Blog System', 'Analytics Dashboard', 'Priority Support', 'Email Integration'], popular: true },
    { name: 'Enterprise', price: 'R999', features: ['Unlimited Pages', 'E-Commerce Ready', 'Custom API', 'Multi-Language', 'Dedicated Manager', 'SLA Guarantee', 'White Label'] },
  ];
}
function getFaqForCategory(c: string): { q: string; a: string }[] {
  const m: Record<string, { q: string; a: string }[]> = {
    church: [
      { q: 'What are the service times?', a: 'Sunday services at 8:00 AM and 10:30 AM. Wednesday Bible study at 7:00 PM.' },
      { q: 'Do you have children\'s ministry?', a: 'Yes! We offer age-appropriate programs for children from nursery through 6th grade during every service.' },
      { q: 'How can I get involved?', a: 'We have over 50 ministry teams. Visit our connect page or speak to a welcome team member after any service.' },
    ],
    business: [
      { q: 'How long does onboarding take?', a: 'Our streamlined onboarding process takes 2-3 business days. You\'ll have a dedicated account manager throughout.' },
      { q: 'Do you offer custom solutions?', a: 'Absolutely. Our Enterprise tier includes fully custom solutions tailored to your specific business needs.' },
      { q: 'What\'s your uptime guarantee?', a: 'We guarantee 99.99% uptime with our SLA. Any downtime is compensated at 10x the affected period.' },
    ],
    finance: [
      { q: 'What is the minimum investment?', a: 'Our Starter portfolio begins at R10,000. Premium accounts start at R100,000 with enhanced features.' },
      { q: 'Are my investments insured?', a: 'Yes, all investments are protected up to R1M through our partnership with the Financial Services Board.' },
      { q: 'How do I track my portfolio?', a: 'Our real-time dashboard shows performance metrics, projections, and allows instant portfolio adjustments.' },
    ],
  };
  return m[c] || [
    { q: 'How do I get started?', a: 'Simply click the Get Started button or contact our team. We\'ll guide you through the entire process.' },
    { q: 'What makes you different?', a: 'Our combination of industry expertise, cutting-edge technology, and personalized service sets us apart.' },
    { q: 'Do you offer support?', a: 'Yes! We provide 24/7 support via email, phone, and live chat. Our average response time is under 2 hours.' },
    { q: 'Can I cancel anytime?', a: 'Absolutely. No long-term contracts. Cancel anytime with no hidden fees or penalties.' },
  ];
}

// ── CLIENT LOGOS ──────────────────────────────────
const CLIENT_LOGOS = ['Integro OS', 'WCCCS', 'FaithNexus', 'ONIXone', 'ProLens', 'TalkWorld', 'Ocean City', 'SEKO Sa', 'MediVault'];

// ── HTML EXPORT ─────────────────────────────────
function exportTemplateHTML(template: WebTemplate, custom: CustomState) {
  const isDark = custom.bgColor === '#0a0a14' || custom.bgColor === '#0a0a0a';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${custom.siteName}</title>
  <meta name="description" content="${custom.tagline}">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${custom.fontBody}; color: ${custom.textColor}; background: ${custom.bgColor}; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
    nav { padding: 16px 0; border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(16px); background: ${custom.bgColor}cc; }
    nav .inner { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; padding: 0 32px; }
    nav .logo { font-family: ${custom.fontHeading}; font-size: 22px; font-weight: 800; color: ${custom.primaryColor}; }
    nav .links { display: flex; align-items: center; gap: 28px; }
    nav .links a { color: ${custom.textColor}aa; text-decoration: none; font-size: 14px; font-weight: 500; }
    .btn-primary { background: ${custom.primaryColor}; color: ${isDark ? '#0a0a14' : '#fff'}; padding: 14px 32px; border: none; border-radius: ${custom.borderRadius}px; font-weight: 700; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
    .btn-secondary { background: transparent; border: 1px solid ${custom.primaryColor}50; color: ${custom.primaryColor}; padding: 14px 32px; border-radius: ${custom.borderRadius}px; font-weight: 700; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
    .hero { min-height: 85vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(135deg, ${custom.secondaryColor} 0%, ${custom.bgColor} 100%); position: relative; overflow: hidden; }
    .hero h1 { font-family: ${custom.fontHeading}; font-size: clamp(36px, 5vw, 64px); font-weight: 800; line-height: 1.08; letter-spacing: -0.03em; margin-bottom: 20px; }
    .hero p { font-size: 18px; color: ${custom.textColor}90; max-width: 600px; margin: 0 auto 36px; }
    .hero .actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    section { padding: 80px 0; }
    .section-header { text-align: center; margin-bottom: 56px; }
    .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: ${custom.primaryColor}; display: block; margin-bottom: 12px; }
    .section-title { font-family: ${custom.fontHeading}; font-size: clamp(28px, 4vw, 42px); font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .card { background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; border-radius: ${custom.borderRadius}px; padding: 32px; }
    .stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; padding: 40px 32px; max-width: 1000px; margin: 0 auto; }
    .stat-value { font-size: 32px; font-weight: 800; color: ${custom.primaryColor}; }
    .stat-label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; }
    footer { padding: 60px 0 0; background: ${isDark ? '#06060e' : '#f0f0f5'}; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; }
    footer .grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; padding-bottom: 40px; }
    footer .bottom { border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; padding: 24px 0; text-align: center; font-size: 13px; color: ${custom.textColor}40; }
    @media (max-width: 768px) { .grid-3 { grid-template-columns: 1fr; } .stats-bar { grid-template-columns: repeat(2, 1fr); } footer .grid { grid-template-columns: 1fr; } nav .links { display: none; } }
  </style>
</head>
<body>
  <nav><div class="inner"><span class="logo">${custom.siteName}</span><div class="links">${['Home','About','Services','Portfolio','Contact'].map(l => `<a href="#">${l}</a>`).join('')}<button class="btn-primary" style="padding:10px 24px;font-size:13px">${custom.ctaText}</button></div></div></nav>
  <section class="hero"><div class="container"><span class="eyebrow">✦ ${CATEGORIES.find(c => c.id === template.category)?.label || ''}</span><h1>${custom.heroTitle}</h1><p>${custom.heroSubtitle}</p><div class="actions"><button class="btn-primary">${custom.ctaText} →</button><button class="btn-secondary">▶ Watch Demo</button></div></div></section>
  <section style="background:${isDark ? '#0e0e1a' : '#f4f4f8'}"><div class="container"><div class="stats-bar">${custom.stats.map(s => `<div><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}</div></div></section>
  <section><div class="container"><div class="section-header"><span class="eyebrow">WHAT WE OFFER</span><h2 class="section-title">Our Services</h2></div><div class="grid-4">${custom.services.map(s => `<div class="card"><div style="font-size:28px;margin-bottom:16px">${s.icon}</div><h3 style="font-family:${custom.fontHeading};font-size:18px;font-weight:700;margin-bottom:8px">${s.title}</h3><p style="color:${custom.textColor}70;font-size:14px;line-height:1.7">${s.desc}</p></div>`).join('')}</div></div></section>
  <section style="background:${isDark ? '#0e0e1a' : '#f0f0f5'}"><div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center"><div><span class="eyebrow">ABOUT US</span><h2 class="section-title" style="text-align:left">Why Choose Us</h2><p style="color:${custom.textColor}80;font-size:16px;line-height:1.8;margin-bottom:24px">${custom.aboutText}</p><button class="btn-primary">${custom.ctaText} →</button></div><div style="aspect-ratio:1;background:linear-gradient(135deg,${custom.primaryColor}15,${custom.secondaryColor}30);border-radius:${custom.borderRadius}px"></div></div></section>
  <section><div class="container"><div class="section-header"><span class="eyebrow">TESTIMONIALS</span><h2 class="section-title">What People Say</h2></div><div class="grid-3">${custom.testimonials.map(t => `<div class="card"><p style="color:${custom.textColor}90;font-size:15px;line-height:1.7;font-style:italic;margin-bottom:16px">&ldquo;${t.text}&rdquo;</p><div><strong>${t.name}</strong><div style="color:${custom.primaryColor};font-size:12px">${t.role}</div></div></div>`).join('')}</div></div></section>
  <section style="background:linear-gradient(135deg,${custom.primaryColor}10 0%,${custom.secondaryColor} 50%,${custom.primaryColor}10 100%);padding:100px 0;text-align:center"><div class="container"><h2 class="section-title">Ready to Get Started?</h2><p style="color:${custom.textColor}70;max-width:500px;margin:0 auto 32px;font-size:16px">Join thousands of satisfied customers.</p><button class="btn-primary" style="font-size:16px;padding:16px 40px">${custom.ctaText} →</button></div></section>
  <footer><div class="container"><div class="grid"><div><span style="font-family:${custom.fontHeading};font-size:22px;font-weight:800;color:${custom.primaryColor}">${custom.siteName}</span><p style="color:${custom.textColor}60;font-size:14px;margin-top:12px;max-width:280px">${custom.tagline}</p></div><div><h4 style="font-weight:700;margin-bottom:16px;font-size:14px">Quick Links</h4>${['Home','About','Services','Contact'].map(l => `<a href="#" style="display:block;color:${custom.textColor}70;text-decoration:none;font-size:14px;margin-bottom:10px">${l}</a>`).join('')}</div><div><h4 style="font-weight:700;margin-bottom:16px;font-size:14px">Contact</h4><p style="color:${custom.textColor}70;font-size:13px;margin-bottom:8px">📧 hello@example.com</p><p style="color:${custom.textColor}70;font-size:13px;margin-bottom:8px">📞 +27 12 345 6789</p><p style="color:${custom.textColor}70;font-size:13px">📍 Johannesburg, South Africa</p></div></div><div class="bottom">© 2026 ${custom.siteName}. Powered by WCCCS / Integro OS</div></div></footer>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${custom.siteName.replace(/\s+/g, '-').toLowerCase()}-template.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════
// ANIMATED COUNTER COMPONENT
// ═══════════════════════════════════════════════════════════════
const AnimatedCounter = ({ value, label, color }: { value: string; label: string; color: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="live-stat-item">
      <div className="live-stat-value" style={{ color }}>{value}</div>
      <div className="live-stat-label">{label}</div>
    </motion.div>
  );
};

// FAQ ACCORDION ITEM
const FaqItem = ({ q, a, primaryColor, textColor, isDark, borderRadius }: { q: string; a: string; primaryColor: string; textColor: string; isDark: boolean; borderRadius: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div className="live-faq-item" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius }}>
      <button className="live-faq-question" onClick={() => setOpen(!open)} style={{ color: textColor }} aria-label={q}>
        <span>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={18} style={{ color: primaryColor }} /></motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <p className="live-faq-answer" style={{ color: textColor + '80' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CUSTOMIZER SIDEBAR
// ═══════════════════════════════════════════════════════════════
type PanelTab = 'content' | 'colors' | 'typography' | 'layout';
const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-1.5 block">{label}</label>{children}</div>
);
const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <FieldGroup label={label}>
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="color-picker" aria-label={label} />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="custom-input flex-1 font-mono text-xs" aria-label={`${label} hex`} />
    </div>
  </FieldGroup>
);
const ToggleField = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-white/70">{label}</span>
    <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition-all relative ${value ? 'bg-primary' : 'bg-white/10'}`} aria-label={label}>
      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: value ? '22px' : '2px' }} />
    </button>
  </div>
);

const CustomizerSidebar = ({ custom, setCustom, activeTab, setActiveTab }: {
  custom: CustomState; setCustom: React.Dispatch<React.SetStateAction<CustomState>>; activeTab: PanelTab; setActiveTab: (t: PanelTab) => void;
}) => {
  const update = <K extends keyof CustomState>(key: K, value: CustomState[K]) => setCustom(prev => ({ ...prev, [key]: value }));
  const tabs: { id: PanelTab; label: string; icon: any }[] = [
    { id: 'content', label: 'Content', icon: PenTool }, { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Fonts', icon: Type }, { id: 'layout', label: 'Layout', icon: Layout },
  ];
  return (
    <div className="customizer-sidebar">
      <div className="customizer-tabs">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`customizer-tab ${activeTab === tab.id ? 'active' : ''}`} title={tab.label}>
            <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="customizer-panel-content">
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.div key="content" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <FieldGroup label="Site Name"><input value={custom.siteName} onChange={e => update('siteName', e.target.value)} className="custom-input" aria-label="Site Name" /></FieldGroup>
              <FieldGroup label="Hero Title"><input value={custom.heroTitle} onChange={e => update('heroTitle', e.target.value)} className="custom-input" aria-label="Hero Title" /></FieldGroup>
              <FieldGroup label="Tagline"><input value={custom.tagline} onChange={e => update('tagline', e.target.value)} className="custom-input" aria-label="Tagline" /></FieldGroup>
              <FieldGroup label="Hero Subtitle"><textarea value={custom.heroSubtitle} onChange={e => update('heroSubtitle', e.target.value)} className="custom-input custom-textarea" rows={3} aria-label="Hero Subtitle" /></FieldGroup>
              <FieldGroup label="CTA Button"><input value={custom.ctaText} onChange={e => update('ctaText', e.target.value)} className="custom-input" aria-label="CTA" /></FieldGroup>
              <FieldGroup label="About Text"><textarea value={custom.aboutText} onChange={e => update('aboutText', e.target.value)} className="custom-input custom-textarea" rows={4} aria-label="About" /></FieldGroup>
            </motion.div>
          )}
          {activeTab === 'colors' && (
            <motion.div key="colors" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <ColorField label="Primary" value={custom.primaryColor} onChange={v => update('primaryColor', v)} />
              <ColorField label="Background" value={custom.bgColor} onChange={v => update('bgColor', v)} />
              <ColorField label="Text" value={custom.textColor} onChange={v => update('textColor', v)} />
              <ColorField label="Secondary" value={custom.secondaryColor} onChange={v => update('secondaryColor', v)} />
              <div className="mt-4 p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-[11px] text-white/50 mb-2">Quick Presets</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { name: 'Gold Sovereign', p: '#D4AF37', bg: '#0a0a14', t: '#e2e8f0', s: '#1a1a2e' },
                    { name: 'Neon Cyber', p: '#ff00ff', bg: '#0a0a0a', t: '#e2e8f0', s: '#1a0030' },
                    { name: 'Ocean Blue', p: '#3b82f6', bg: '#0a0a14', t: '#e2e8f0', s: '#0f172a' },
                    { name: 'Fresh Green', p: '#10b981', bg: '#fafafa', t: '#1a1a2e', s: '#ecfdf5' },
                    { name: 'Sunset Rose', p: '#f472b6', bg: '#fafafa', t: '#1a1a2e', s: '#fdf2f8' },
                    { name: 'Royal Purple', p: '#8b5cf6', bg: '#0a0a14', t: '#e2e8f0', s: '#1a0a3e' },
                    { name: 'Crimson Fire', p: '#ef4444', bg: '#0a0a14', t: '#e2e8f0', s: '#1a0a0a' },
                    { name: 'Arctic Ice', p: '#06b6d4', bg: '#0a0a14', t: '#e2e8f0', s: '#082f49' },
                  ].map(pr => (
                    <button key={pr.name} onClick={() => setCustom(prev => ({ ...prev, primaryColor: pr.p, bgColor: pr.bg, textColor: pr.t, secondaryColor: pr.s }))}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 hover:border-white/20 transition-all" title={pr.name}>
                      <div className="w-3 h-3 rounded-full" style={{ background: pr.p }} />{pr.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'typography' && (
            <motion.div key="typography" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <FieldGroup label="Heading Font">
                <select value={custom.fontHeading} onChange={e => update('fontHeading', e.target.value)} className="custom-input" aria-label="Heading Font">
                  {["'Inter', sans-serif","'Playfair Display', serif","'Space Grotesk', sans-serif","'Outfit', sans-serif","'Poppins', sans-serif","'DM Serif Display', serif"].map(f => (
                    <option key={f} value={f}>{f.split("'")[1]}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Body Font">
                <select value={custom.fontBody} onChange={e => update('fontBody', e.target.value)} className="custom-input" aria-label="Body Font">
                  {["'Inter', sans-serif","'Poppins', sans-serif","'DM Sans', sans-serif","'Outfit', sans-serif"].map(f => (
                    <option key={f} value={f}>{f.split("'")[1]}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Border Radius">
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={24} value={custom.borderRadius} onChange={e => update('borderRadius', Number(e.target.value))} className="flex-1" aria-label="Border Radius" />
                  <span className="text-xs font-mono text-white/50 w-8">{custom.borderRadius}px</span>
                </div>
              </FieldGroup>
            </motion.div>
          )}
          {activeTab === 'layout' && (
            <motion.div key="layout" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <FieldGroup label="Layout Architecture">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'classic', label: 'Classic' },
                    { id: 'split', label: 'Creative Split' },
                    { id: 'immersive', label: 'Immersive' },
                    { id: 'minimal', label: 'Minimalist' }
                  ].map(arch => (
                    <button
                      key={arch.id}
                      onClick={() => update('layoutTheme', arch.id as any)}
                      className={`py-2 px-3 text-xs rounded-lg border transition-all ${custom.layoutTheme === arch.id ? 'bg-primary/20 border-primary text-primary font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                    >
                      {arch.label}
                    </button>
                  ))}
                </div>
              </FieldGroup>
              <div className="h-px w-full bg-white/10 my-4" />
              <ToggleField label="Navigation Bar" value={custom.showNav} onChange={v => update('showNav', v)} />
              <ToggleField label="Stats Section" value={custom.showStats} onChange={v => update('showStats', v)} />
              <ToggleField label="Pricing Table" value={custom.showPricing} onChange={v => update('showPricing', v)} />
              <ToggleField label="FAQ Section" value={custom.showFaq} onChange={v => update('showFaq', v)} />
              <ToggleField label="Contact Form" value={custom.showContact} onChange={v => update('showContact', v)} />
              <ToggleField label="Image Gallery" value={custom.showGallery} onChange={v => update('showGallery', v)} />
              <ToggleField label="Footer" value={custom.showFooter} onChange={v => update('showFooter', v)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LIVE TEMPLATE RENDERER — The 10x version
// ═══════════════════════════════════════════════════════════════
const LiveTemplateRenderer = ({ template, custom }: { template: WebTemplate; custom: CustomState }) => {
  const isDark = custom.bgColor === '#0a0a14' || custom.bgColor === '#0a0a0a';
  const navLinks = ['Home', 'About', 'Services', 'Portfolio', 'Contact'];
  const heroImg = HERO_IMAGES[template.category];
  const headingStyle: React.CSSProperties = { fontFamily: custom.fontHeading };
  const btnPrimary: React.CSSProperties = {
    background: custom.primaryColor, color: isDark ? '#0a0a14' : '#ffffff', borderRadius: custom.borderRadius,
    padding: '14px 32px', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '8px', letterSpacing: '0.02em', transition: 'all 0.3s ease',
  };
  const btnSecondary: React.CSSProperties = { ...btnPrimary, background: 'transparent', border: `1px solid ${custom.primaryColor}50`, color: custom.primaryColor };
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className={`live-template-frame layout-${custom.layoutTheme}`} style={{ background: custom.bgColor, fontFamily: custom.fontBody, color: custom.textColor }}>
      {/* ══ NAV ═══════════════════════════════ */}
      {custom.showNav && (
        <nav className="live-nav" style={{ borderBottom: `1px solid ${divider}` }}>
          <div className="live-nav-inner">
            <span className="live-nav-logo" style={{ ...headingStyle, color: custom.primaryColor }}>{custom.siteName}</span>
            <div className="live-nav-links">
              {navLinks.map(l => <a key={l} href="#" className="live-nav-link" style={{ color: custom.textColor + 'aa' }}>{l}</a>)}
              <button style={{ ...btnPrimary, padding: '10px 24px', fontSize: '13px' }}>{custom.ctaText}</button>
            </div>
          </div>
        </nav>
      )}

      {/* ══ HERO WITH IMAGE ════════════════════ */}
      <section className="live-hero-10x" style={{ background: `linear-gradient(135deg, ${custom.secondaryColor} 0%, ${custom.bgColor} 100%)` }}>
        {heroImg && <div className="live-hero-img-wrapper"><img src={heroImg} alt="" className="live-hero-img" /><div className="live-hero-img-overlay" style={{ background: `linear-gradient(180deg, ${custom.bgColor}00 0%, ${custom.bgColor}cc 60%, ${custom.bgColor} 100%)` }} /></div>}
        <div className="live-hero-glow" style={{ background: `radial-gradient(ellipse at 30% 40%, ${custom.primaryColor}20 0%, transparent 60%)` }} />
        <div className="live-hero-content-10x">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="live-hero-badge-10x" style={{ background: custom.primaryColor + '15', color: custom.primaryColor, borderRadius: 999 }}>
            ✦ {CATEGORIES.find(c => c.id === template.category)?.label}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }} className="live-hero-title-10x" style={{ ...headingStyle, color: custom.textColor }}>
            {custom.heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="live-hero-subtitle-10x" style={{ color: custom.textColor + '90' }}>
            {custom.heroSubtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="live-hero-actions">
            <button style={btnPrimary}>{custom.ctaText} <ArrowRight size={16} /></button>
            <button style={btnSecondary}><Play size={14} /> Watch Demo</button>
          </motion.div>
          {/* Floating trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="live-trust-row">
            <div className="live-trust-avatars">
              {['👩🏽', '👨🏻', '👩🏾', '👨🏼', '👩🏿'].map((a, i) => <span key={i} className="live-trust-avatar" style={{ zIndex: 5 - i, marginLeft: i > 0 ? '-10px' : 0 }}>{a}</span>)}
            </div>
            <div className="live-trust-text">
              <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill={custom.primaryColor} color={custom.primaryColor} />)}</div>
              <span style={{ color: custom.textColor + '70', fontSize: '12px' }}>Trusted by 2,500+ clients</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ STATS BAR ═════════════════════════ */}
      {custom.showStats && (
        <section className="live-stats-bar" style={{ background: isDark ? '#0e0e1a' : '#f4f4f8', borderTop: `1px solid ${divider}`, borderBottom: `1px solid ${divider}` }}>
          <div className="live-stats-inner">
            {custom.stats.map((s, i) => <AnimatedCounter key={i} value={s.value} label={s.label} color={custom.primaryColor} />)}
          </div>
        </section>
      )}

      {/* ══ SERVICES ══════════════════════════ */}
      <section className="live-section" style={{ background: custom.bgColor }}>
        <div className="live-section-inner">
          <div className="live-section-header">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="live-section-eyebrow" style={{ color: custom.primaryColor }}>WHAT WE OFFER</motion.span>
            <h2 className="live-section-title" style={{ ...headingStyle, color: custom.textColor }}>Our Services</h2>
            <p className="live-section-subtitle" style={{ color: custom.textColor + '70' }}>Tailored solutions designed for your success</p>
          </div>
          <div className="live-features-grid-10x">
            {custom.services.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="live-feature-card-10x" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: custom.borderRadius }}>
                <div className="live-feature-icon-10x" style={{ background: custom.primaryColor + '12', borderRadius: custom.borderRadius * 0.6 }}>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 style={{ ...headingStyle, color: custom.textColor, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ color: custom.textColor + '70', fontSize: '14px', lineHeight: 1.7 }}>{s.desc}</p>
                <a href="#" className="live-feature-link" style={{ color: custom.primaryColor }}>Learn more <ChevronRight size={14} /></a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT WITH IMAGE ══════════════════ */}
      <section className="live-section" style={{ background: isDark ? '#0e0e1a' : '#f0f0f5' }}>
        <div className="live-section-inner live-about-grid-10x">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="live-section-eyebrow" style={{ color: custom.primaryColor }}>ABOUT US</span>
            <h2 className="live-section-title" style={{ ...headingStyle, color: custom.textColor, textAlign: 'left' }}>Why Choose Us</h2>
            <p style={{ color: custom.textColor + '80', fontSize: '16px', lineHeight: 1.8, marginBottom: '24px' }}>{custom.aboutText}</p>
            <div className="live-about-checks">
              {['Industry Leading Quality', 'Dedicated Support Team', 'Proven Track Record', 'Innovation First Approach'].map((item, i) => (
                <div key={i} className="live-about-check-item">
                  <div className="live-about-check-icon" style={{ background: custom.primaryColor + '15', color: custom.primaryColor }}><Check size={14} /></div>
                  <span style={{ color: custom.textColor + '90', fontSize: '14px' }}>{item}</span>
                </div>
              ))}
            </div>
            <button style={{ ...btnPrimary, marginTop: '24px' }}>Discover More <ArrowRight size={16} /></button>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="live-about-visual-10x"
            style={{ background: `linear-gradient(135deg, ${custom.primaryColor}15, ${custom.secondaryColor}30)`, borderRadius: custom.borderRadius, border: `1px solid ${cardBorder}` }}>
            {heroImg && <img src={heroImg} alt="" className="live-about-img" style={{ borderRadius: custom.borderRadius }} />}
          </motion.div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════ */}
      <section className="live-section" style={{ background: custom.bgColor }}>
        <div className="live-section-inner">
          <div className="live-section-header">
            <span className="live-section-eyebrow" style={{ color: custom.primaryColor }}>TESTIMONIALS</span>
            <h2 className="live-section-title" style={{ ...headingStyle, color: custom.textColor }}>What People Say</h2>
          </div>
          <div className="live-testimonials-grid-10x">
            {custom.testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="live-testimonial-card-10x" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: custom.borderRadius }}>
                <Quote size={24} style={{ color: custom.primaryColor + '30' }} />
                <p style={{ color: custom.textColor + '90', fontSize: '15px', lineHeight: 1.7, fontStyle: 'italic', margin: '16px 0' }}>"{t.text}"</p>
                <div className="live-testimonial-author">
                  <span className="live-testimonial-avatar">{t.avatar}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: custom.textColor, fontSize: '14px' }}>{t.name}</div>
                    <div style={{ color: custom.primaryColor, fontSize: '12px' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING TABLE ════════════════════ */}
      {custom.showPricing && (
        <section className="live-section" style={{ background: isDark ? '#0e0e1a' : '#f0f0f5' }}>
          <div className="live-section-inner">
            <div className="live-section-header">
              <span className="live-section-eyebrow" style={{ color: custom.primaryColor }}>PRICING PLANS</span>
              <h2 className="live-section-title" style={{ ...headingStyle, color: custom.textColor }}>Choose Your Plan</h2>
              <p className="live-section-subtitle" style={{ color: custom.textColor + '70' }}>Transparent pricing, no hidden fees</p>
            </div>
            <div className="live-pricing-grid">
              {custom.pricingPlans.map((plan, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className={`live-pricing-card ${plan.popular ? 'popular' : ''}`}
                  style={{ background: plan.popular ? `linear-gradient(135deg, ${custom.primaryColor}15, ${custom.secondaryColor}30)` : cardBg,
                    border: `1px solid ${plan.popular ? custom.primaryColor + '40' : cardBorder}`, borderRadius: custom.borderRadius }}>
                  {plan.popular && <div className="live-pricing-badge" style={{ background: custom.primaryColor, color: isDark ? '#0a0a14' : '#fff' }}>Most Popular</div>}
                  <h3 style={{ ...headingStyle, color: custom.textColor, fontSize: '20px', marginBottom: '8px' }}>{plan.name}</h3>
                  <div className="live-pricing-price" style={{ color: custom.primaryColor }}>{plan.price}<span style={{ color: custom.textColor + '50', fontSize: '14px' }}>/mo</span></div>
                  <ul className="live-pricing-features">
                    {plan.features.map((f, fi) => (
                      <li key={fi} style={{ color: custom.textColor + '80' }}><Check size={14} style={{ color: custom.primaryColor, flexShrink: 0 }} />{f}</li>
                    ))}
                  </ul>
                  <button style={plan.popular ? btnPrimary : btnSecondary} className="w-full justify-center">{custom.ctaText}</button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ FAQ ACCORDION ════════════════════ */}
      {custom.showFaq && (
        <section className="live-section" style={{ background: isDark ? '#0e0e1a' : '#f0f0f5' }}>
          <div className="live-section-inner">
            <div className="live-section-header">
              <span className="live-section-eyebrow" style={{ color: custom.primaryColor }}>FAQ</span>
              <h2 className="live-section-title" style={{ ...headingStyle, color: custom.textColor }}>Frequently Asked Questions</h2>
              <p className="live-section-subtitle" style={{ color: custom.textColor + '70' }}>Everything you need to know</p>
            </div>
            <div className="live-faq-list">
              {custom.faq.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} primaryColor={custom.primaryColor} textColor={custom.textColor} isDark={isDark} borderRadius={custom.borderRadius} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ CONTACT FORM ══════════════════════ */}
      {custom.showContact && (
        <section className="live-section" style={{ background: custom.bgColor }}>
          <div className="live-section-inner">
            <div className="live-section-header">
              <span className="live-section-eyebrow" style={{ color: custom.primaryColor }}>GET IN TOUCH</span>
              <h2 className="live-section-title" style={{ ...headingStyle, color: custom.textColor }}>Contact Us</h2>
            </div>
            <div className="live-contact-grid">
              <div className="live-contact-info">
                {[{ icon: Mail, label: 'Email Us', text: 'hello@example.com' }, { icon: Phone, label: 'Call Us', text: '+27 12 345 6789' }, { icon: MapPin, label: 'Visit Us', text: 'Johannesburg, South Africa' }, { icon: Clock, label: 'Hours', text: 'Mon-Fri: 8AM - 6PM' }].map((item, i) => (
                  <div key={i} className="live-contact-info-item" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: custom.borderRadius }}>
                    <div className="live-contact-info-icon" style={{ background: custom.primaryColor + '12', color: custom.primaryColor, borderRadius: custom.borderRadius * 0.5 }}><item.icon size={20} /></div>
                    <div><div style={{ fontWeight: 700, color: custom.textColor, fontSize: '14px', marginBottom: '2px' }}>{item.label}</div><div style={{ color: custom.textColor + '70', fontSize: '13px' }}>{item.text}</div></div>
                  </div>
                ))}
              </div>
              <div className="live-contact-form" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: custom.borderRadius }}>
                <div className="live-contact-form-row">
                  <input type="text" placeholder="First Name" className="live-contact-input" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${cardBorder}`, color: custom.textColor, borderRadius: custom.borderRadius * 0.6 }} />
                  <input type="text" placeholder="Last Name" className="live-contact-input" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${cardBorder}`, color: custom.textColor, borderRadius: custom.borderRadius * 0.6 }} />
                </div>
                <input type="email" placeholder="Email Address" className="live-contact-input" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${cardBorder}`, color: custom.textColor, borderRadius: custom.borderRadius * 0.6 }} />
                <textarea placeholder="Your Message" rows={4} className="live-contact-input" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${cardBorder}`, color: custom.textColor, borderRadius: custom.borderRadius * 0.6, resize: 'vertical' }} />
                <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}><Send size={16} /> Send Message</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ CLIENT LOGOS MARQUEE ═══════════════ */}
      <section className="live-logos-section" style={{ background: isDark ? '#08080f' : '#f4f4f8', borderTop: `1px solid ${divider}`, borderBottom: `1px solid ${divider}` }}>
        <div className="live-logos-inner">
          <div className="live-logos-track">
            {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, i) => (
              <span key={i} className="live-logo-item" style={{ color: custom.textColor + '30', borderColor: custom.textColor + '08' }}>{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════ */}
      <section className="live-cta-10x" style={{ background: `linear-gradient(135deg, ${custom.primaryColor}10 0%, ${custom.secondaryColor} 50%, ${custom.primaryColor}10 100%)` }}>
        <div className="live-section-inner" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="live-section-title" style={{ ...headingStyle, color: custom.textColor }}>Ready to Get Started?</motion.h2>
          <p style={{ color: custom.textColor + '70', maxWidth: '500px', margin: '0 auto 32px', fontSize: '16px' }}>Join thousands of satisfied customers. Build something incredible today.</p>
          <div className="live-hero-actions">
            <button style={{ ...btnPrimary, fontSize: '16px', padding: '16px 40px' }}>{custom.ctaText} <ArrowRight size={16} /></button>
            <button style={{ ...btnSecondary, fontSize: '16px', padding: '16px 40px' }}><Mail size={16} /> Contact Us</button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════ */}
      {custom.showFooter && (
        <footer className="live-footer-10x" style={{ background: isDark ? '#06060e' : '#f0f0f5', borderTop: `1px solid ${divider}` }}>
          <div className="live-section-inner">
            <div className="live-footer-grid">
              <div>
                <span style={{ ...headingStyle, fontSize: '22px', fontWeight: 800, color: custom.primaryColor }}>{custom.siteName}</span>
                <p style={{ color: custom.textColor + '60', fontSize: '14px', marginTop: '12px', maxWidth: '280px', lineHeight: 1.6 }}>{custom.tagline}</p>
                <div className="live-footer-socials">
                  {[Instagram, Twitter, Facebook].map((Icon, i) => (
                    <a key={i} href="#" className="live-footer-social" style={{ background: custom.primaryColor + '10', color: custom.primaryColor }}><Icon size={16} /></a>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ color: custom.textColor, fontWeight: 700, marginBottom: '16px', fontSize: '14px' }}>Quick Links</h4>
                {navLinks.map(l => <a key={l} href="#" className="live-footer-link" style={{ color: custom.textColor + '70' }}>{l}</a>)}
              </div>
              <div>
                <h4 style={{ color: custom.textColor, fontWeight: 700, marginBottom: '16px', fontSize: '14px' }}>Contact</h4>
                {[{ icon: Mail, text: 'hello@example.com' }, { icon: Phone, text: '+27 12 345 6789' }, { icon: MapPin, text: 'Johannesburg, South Africa' }].map((item, i) => (
                  <div key={i} className="live-footer-contact-item">
                    <item.icon size={14} style={{ color: custom.primaryColor }} />
                    <span style={{ color: custom.textColor + '70', fontSize: '13px' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="live-footer-bottom" style={{ borderTop: `1px solid ${divider}`, color: custom.textColor + '40' }}>
              © 2026 {custom.siteName}. All rights reserved. Powered by WCCCS / Integro OS
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
const TemplatePreview = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = TEMPLATES.find(t => t.id === templateId);
  const [custom, setCustom] = useState<CustomState>(() => template ? getDefaultCustom(template) : {} as CustomState);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<PanelTab>('content');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // ── Block Editor State ──────────────────────────────────
  const [editorState, setEditorState] = useState<EditorState | null>(() =>
    template ? templateToEditorState(template) : null
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const historyRef = useRef(new EditorHistory());

  // Push initial state to history
  useEffect(() => {
    if (editorState) {
      historyRef.current.push(editorState.blocks, editorState.settings);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p') { e.preventDefault(); setIsPreviewMode(p => !p); }
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const entry = historyRef.current.undo();
        if (entry && editorState) setEditorState(s => s ? { ...s, blocks: entry.blocks, settings: entry.settings } : s);
      }
      if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const entry = historyRef.current.redo();
        if (entry && editorState) setEditorState(s => s ? { ...s, blocks: entry.blocks, settings: entry.settings } : s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editorState]);

  // Block operations
  const pushHistory = useCallback(() => {
    if (editorState) historyRef.current.push(editorState.blocks, editorState.settings);
  }, [editorState]);

  const handleMoveBlock = useCallback((id: string, dir: 'up' | 'down') => {
    pushHistory();
    setEditorState(s => s ? { ...s, blocks: moveBlock(s.blocks, id, dir), isDirty: true } : s);
  }, [pushHistory]);

  const handleDuplicateBlock = useCallback((id: string) => {
    pushHistory();
    setEditorState(s => s ? { ...s, blocks: duplicateBlock(s.blocks, id), isDirty: true } : s);
  }, [pushHistory]);

  const handleDeleteBlock = useCallback((id: string) => {
    pushHistory();
    setEditorState(s => s ? { ...s, blocks: removeBlock(s.blocks, id), isDirty: true } : s);
    if (selectedBlockId === id) setSelectedBlockId(null);
  }, [pushHistory, selectedBlockId]);

  const handleToggleVisibility = useCallback((id: string) => {
    pushHistory();
    setEditorState(s => s ? { ...s, blocks: toggleBlockVisibility(s.blocks, id), isDirty: true } : s);
  }, [pushHistory]);

  const handleInsertBlock = useCallback((type: BlockType, afterIndex: number) => {
    pushHistory();
    setEditorState(s => s ? { ...s, blocks: addBlock(s.blocks, type, afterIndex), isDirty: true } : s);
  }, [pushHistory]);

  if (!template) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div><h2 className="font-serif text-2xl font-bold mb-2">Template Not Found</h2>
          <p className="text-muted-foreground mb-4">The template you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/os/web-templates')} className="text-primary font-bold flex items-center gap-2 mx-auto"><ArrowLeft className="w-4 h-4" /> Back to Templates</button>
        </div>
      </div>
    );
  }

  const viewportWidth = viewportMode === 'desktop' ? '100%' : viewportMode === 'tablet' ? '768px' : '375px';
  return (
    <div className="template-preview-page">
      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
          <button onClick={() => navigate('/os/web-templates')} className="preview-toolbar-btn"><ArrowLeft className="w-4 h-4" /><span>Back</span></button>
          <div className="preview-toolbar-divider" />
          <span className="preview-toolbar-name">{template.name}</span>
          <span className="preview-toolbar-cat">{CATEGORIES.find(c => c.id === template.category)?.label}</span>
        </div>
        <div className="preview-toolbar-center">
          {([{ mode: 'desktop' as const, icon: Monitor }, { mode: 'tablet' as const, icon: Tablet }, { mode: 'mobile' as const, icon: Smartphone }]).map(v => (
            <button key={v.mode} onClick={() => setViewportMode(v.mode)} className={`preview-viewport-btn ${viewportMode === v.mode ? 'active' : ''}`} title={v.mode}>
              <v.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div className="preview-toolbar-right">
          {/* Undo / Redo */}
          <button onClick={() => { const e = historyRef.current.undo(); if (e && editorState) setEditorState(s => s ? { ...s, blocks: e.blocks, settings: e.settings } : s); }} className="preview-toolbar-btn" title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
          <button onClick={() => { const e = historyRef.current.redo(); if (e && editorState) setEditorState(s => s ? { ...s, blocks: e.blocks, settings: e.settings } : s); }} className="preview-toolbar-btn" title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
          <div className="preview-toolbar-divider" />
          {/* Preview Mode */}
          <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`preview-toolbar-btn ${isPreviewMode ? 'active' : ''}`} title="Preview Mode (Ctrl+P)">
            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreviewMode ? 'Edit' : 'Preview'}</span>
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)} className="preview-toolbar-btn">
            <Settings2 className="w-4 h-4" />
            <span>{showSidebar ? 'Hide Panel' : 'Customize'}</span>
          </button>
          <div className="preview-toolbar-divider" />
          <button className="preview-toolbar-btn primary"><Save className="w-4 h-4" /><span>Save</span></button>
          <button className="preview-toolbar-btn primary" onClick={() => exportTemplateHTML(template, custom)}><Download className="w-4 h-4" /><span>Export</span></button>
          <button className="preview-toolbar-btn deploy" title="Deploy Website" onClick={() => setShowDeployModal(true)}><Rocket className="w-4 h-4" /><span>Deploy</span></button>
        </div>
      </div>
      <div className="preview-workspace">
        <div className={`preview-canvas ${!showSidebar ? 'full' : ''}`}>
          <div className="preview-frame" style={{ maxWidth: viewportWidth, margin: '0 auto' }}>
            {!isPreviewMode && editorState && (
              <BlockInsertButton onInsert={(type) => handleInsertBlock(type, -1)} />
            )}
            <LiveTemplateRenderer template={template} custom={custom} />
          </div>
        </div>
        <AnimatePresence>
          {showSidebar && !isPreviewMode && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 360, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="preview-sidebar-wrapper">
              <CustomizerSidebar custom={custom} setCustom={setCustom} activeTab={activeTab} setActiveTab={setActiveTab} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {editorState && (
        <DeployModal
          isOpen={showDeployModal}
          onClose={() => setShowDeployModal(false)}
          editorState={editorState}
          templateName={template.name}
        />
      )}
    </div>
  );
};

export default TemplatePreview;
