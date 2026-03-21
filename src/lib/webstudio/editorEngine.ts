// ═══════════════════════════════════════════════════════════════
// INTEGRO WEBSTUDIO — Editor Engine
// Core state management for block-based website editing
// ═══════════════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid';

// ── Block Types ─────────────────────────────────────────────
export type BlockType =
  | 'nav'
  | 'hero'
  | 'stats'
  | 'services'
  | 'about'
  | 'testimonials'
  | 'pricing'
  | 'gallery'
  | 'faq'
  | 'contact'
  | 'cta-banner'
  | 'logos'
  | 'footer'
  | 'custom-html';

export interface BlockImage {
  id: string;
  src: string;        // URL or base64
  alt: string;
  width?: number;
  height?: number;
}

// ── Block Data Interfaces ───────────────────────────────────
export interface NavBlockData {
  siteName: string;
  logoUrl: string;
  links: string[];
  ctaText: string;
  transparent: boolean;
}

export interface HeroBlockData {
  title: string;
  subtitle: string;
  ctaText: string;
  secondaryCtaText: string;
  backgroundImage: string;
  badge: string;
  showTrustBadge: boolean;
}

export interface StatsBlockData {
  stats: { value: string; label: string }[];
}

export interface ServicesBlockData {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: { title: string; desc: string; icon: string; image?: string }[];
}

export interface AboutBlockData {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  checklist: string[];
  ctaText: string;
}

export interface TestimonialsBlockData {
  eyebrow: string;
  title: string;
  items: { name: string; role: string; text: string; avatar: string }[];
}

export interface PricingBlockData {
  eyebrow: string;
  title: string;
  plans: { name: string; price: string; features: string[]; popular?: boolean }[];
}

export interface GalleryBlockData {
  eyebrow: string;
  title: string;
  layout: 'grid' | 'masonry' | 'carousel';
  columns: number;
  images: BlockImage[];
}

export interface FaqBlockData {
  eyebrow: string;
  title: string;
  items: { q: string; a: string }[];
}

export interface ContactBlockData {
  eyebrow: string;
  title: string;
  showMap: boolean;
  email: string;
  phone: string;
  address: string;
}

export interface CtaBannerBlockData {
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface LogosBlockData {
  title: string;
  logos: { name: string; url?: string }[];
}

export interface FooterBlockData {
  showSocials: boolean;
  copyright: string;
  links: string[];
}

export interface CustomHtmlBlockData {
  html: string;
  css: string;
}

export type BlockData =
  | NavBlockData
  | HeroBlockData
  | StatsBlockData
  | ServicesBlockData
  | AboutBlockData
  | TestimonialsBlockData
  | PricingBlockData
  | GalleryBlockData
  | FaqBlockData
  | ContactBlockData
  | CtaBannerBlockData
  | LogosBlockData
  | FooterBlockData
  | CustomHtmlBlockData;

// ── Editor Block ────────────────────────────────────────────
export interface EditorBlock {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;
  locked: boolean;
  label: string;        // Human-readable name for the block panel
  data: BlockData;
}

// ── Global Site Settings ────────────────────────────────────
export interface SiteSettings {
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: number;
  layoutTheme: 'classic' | 'split' | 'immersive' | 'minimal';
  editMode: 'grid' | 'freestyle';
}

// ── Editor State ────────────────────────────────────────────
export interface EditorState {
  siteId: string;
  templateId: string;
  blocks: EditorBlock[];
  settings: SiteSettings;
  media: BlockImage[];
  isDirty: boolean;
  lastSaved: string | null;
}

// ── History Entry ───────────────────────────────────────────
interface HistoryEntry {
  blocks: EditorBlock[];
  settings: SiteSettings;
  timestamp: number;
}

// ── History Manager ─────────────────────────────────────────
export class EditorHistory {
  private stack: HistoryEntry[] = [];
  private pointer = -1;
  private maxSize = 50;

  push(blocks: EditorBlock[], settings: SiteSettings): void {
    // Discard any "future" entries if we rewound
    this.stack = this.stack.slice(0, this.pointer + 1);
    this.stack.push({
      blocks: JSON.parse(JSON.stringify(blocks)),
      settings: JSON.parse(JSON.stringify(settings)),
      timestamp: Date.now(),
    });
    if (this.stack.length > this.maxSize) this.stack.shift();
    this.pointer = this.stack.length - 1;
  }

  undo(): HistoryEntry | null {
    if (this.pointer <= 0) return null;
    this.pointer--;
    return JSON.parse(JSON.stringify(this.stack[this.pointer]));
  }

  redo(): HistoryEntry | null {
    if (this.pointer >= this.stack.length - 1) return null;
    this.pointer++;
    return JSON.parse(JSON.stringify(this.stack[this.pointer]));
  }

  canUndo(): boolean { return this.pointer > 0; }
  canRedo(): boolean { return this.pointer < this.stack.length - 1; }
}

// ── Block Factory ───────────────────────────────────────────
export const BLOCK_LIBRARY: { type: BlockType; label: string; icon: string; description: string }[] = [
  { type: 'nav', label: 'Navigation', icon: '🧭', description: 'Top navigation bar with logo and links' },
  { type: 'hero', label: 'Hero Section', icon: '🏔️', description: 'Full-width hero with title, subtitle, and CTA' },
  { type: 'stats', label: 'Stats Bar', icon: '📊', description: 'Animated statistics counter row' },
  { type: 'services', label: 'Services', icon: '⚡', description: 'Feature/service cards grid' },
  { type: 'about', label: 'About / Content', icon: '📝', description: 'Split content with image and text' },
  { type: 'testimonials', label: 'Testimonials', icon: '💬', description: 'Client testimonial cards' },
  { type: 'pricing', label: 'Pricing Table', icon: '💰', description: 'Tiered pricing plans' },
  { type: 'gallery', label: 'Image Gallery', icon: '🖼️', description: 'Photo gallery with multiple layouts' },
  { type: 'faq', label: 'FAQ', icon: '❓', description: 'Expandable frequently asked questions' },
  { type: 'contact', label: 'Contact Form', icon: '✉️', description: 'Contact form with details' },
  { type: 'cta-banner', label: 'CTA Banner', icon: '📢', description: 'Full-width call-to-action banner' },
  { type: 'logos', label: 'Client Logos', icon: '🏢', description: 'Scrolling partner/client logo strip' },
  { type: 'footer', label: 'Footer', icon: '📋', description: 'Site footer with links and copyright' },
  { type: 'custom-html', label: 'Custom HTML', icon: '🧩', description: 'Raw HTML/CSS block for advanced users' },
];

export function createDefaultBlockData(type: BlockType): BlockData {
  switch (type) {
    case 'nav': return { siteName: 'My Site', logoUrl: '', links: ['Home', 'About', 'Services', 'Portfolio', 'Contact'], ctaText: 'Get Started', transparent: false };
    case 'hero': return { title: 'Welcome to Your New Website', subtitle: 'A stunning website tailored just for you.', ctaText: 'Get Started', secondaryCtaText: 'Watch Demo', backgroundImage: '', badge: '', showTrustBadge: true };
    case 'stats': return { stats: [{ value: '500+', label: 'Clients' }, { value: '98%', label: 'Satisfaction' }, { value: '24/7', label: 'Support' }, { value: '10+', label: 'Years' }] };
    case 'services': return { eyebrow: 'WHAT WE OFFER', title: 'Our Services', subtitle: 'Tailored solutions designed for your success', items: [{ title: 'Service One', desc: 'A description of this service.', icon: '⚡' }, { title: 'Service Two', desc: 'A description of this service.', icon: '🎯' }, { title: 'Service Three', desc: 'A description of this service.', icon: '🚀' }, { title: 'Service Four', desc: 'A description of this service.', icon: '💎' }] };
    case 'about': return { eyebrow: 'ABOUT US', title: 'Why Choose Us', text: 'We are dedicated to providing the best experience. Our team of professionals ensures every detail meets the highest standards.', image: '', checklist: ['Industry Leading Quality', 'Dedicated Support Team', 'Proven Track Record', 'Innovation First Approach'], ctaText: 'Learn More' };
    case 'testimonials': return { eyebrow: 'TESTIMONIALS', title: 'What People Say', items: [{ name: 'Alex Johnson', role: 'CEO, TechCorp', text: 'Absolutely amazing service. Exceeded all expectations.', avatar: '👩🏽' }, { name: 'Maria Santos', role: 'Founder, Bloom', text: 'Professional, reliable, and incredibly talented team.', avatar: '👨🏻' }, { name: 'David Okafor', role: 'Director, NextGen', text: 'The results speak for themselves. Truly outstanding.', avatar: '👩🏾' }] };
    case 'pricing': return { eyebrow: 'PRICING', title: 'Choose Your Plan', plans: [{ name: 'Starter', price: 'R499/mo', features: ['5 Pages', 'Basic Support', 'Free Domain'] }, { name: 'Professional', price: 'R999/mo', features: ['Unlimited Pages', 'Priority Support', 'Free Domain', 'Analytics'], popular: true }, { name: 'Enterprise', price: 'R2499/mo', features: ['Everything in Pro', 'Dedicated Manager', 'Custom Integrations', 'SLA'] }] };
    case 'gallery': return { eyebrow: 'GALLERY', title: 'Our Work', layout: 'grid', columns: 3, images: [] };
    case 'faq': return { eyebrow: 'FAQ', title: 'Frequently Asked Questions', items: [{ q: 'How do I get started?', a: 'Simply click Get Started and follow the guided setup process.' }, { q: 'Can I customize my website?', a: 'Absolutely! Every element is fully customizable.' }, { q: 'Do you offer support?', a: 'Yes, we offer 24/7 support via chat, email, and phone.' }] };
    case 'contact': return { eyebrow: 'CONTACT', title: 'Get In Touch', showMap: false, email: 'hello@example.com', phone: '+27 12 345 6789', address: 'Johannesburg, South Africa' };
    case 'cta-banner': return { title: 'Ready to Get Started?', subtitle: 'Join thousands of satisfied customers.', ctaText: 'Start Now' };
    case 'logos': return { title: 'Trusted By', logos: [{ name: 'Partner One' }, { name: 'Partner Two' }, { name: 'Partner Three' }, { name: 'Partner Four' }, { name: 'Partner Five' }] };
    case 'footer': return { showSocials: true, copyright: '© 2026 My Site. All rights reserved. Powered by WCCCS / Integro OS', links: ['Privacy Policy', 'Terms of Service'] };
    case 'custom-html': return { html: '<div style="padding:40px;text-align:center"><h2>Custom Section</h2><p>Add your own HTML here.</p></div>', css: '' };
  }
}

export function createBlock(type: BlockType, order: number): EditorBlock {
  const meta = BLOCK_LIBRARY.find(b => b.type === type);
  return {
    id: generateId(),
    type,
    order,
    visible: true,
    locked: false,
    label: meta?.label || type,
    data: createDefaultBlockData(type),
  };
}

// ── Block Operations ────────────────────────────────────────
export function addBlock(blocks: EditorBlock[], type: BlockType, afterIndex: number): EditorBlock[] {
  const newBlock = createBlock(type, afterIndex + 1);
  const updated = [...blocks];
  updated.splice(afterIndex + 1, 0, newBlock);
  return reorderBlocks(updated);
}

export function removeBlock(blocks: EditorBlock[], blockId: string): EditorBlock[] {
  return reorderBlocks(blocks.filter(b => b.id !== blockId));
}

export function moveBlock(blocks: EditorBlock[], blockId: string, direction: 'up' | 'down'): EditorBlock[] {
  const idx = blocks.findIndex(b => b.id === blockId);
  if (idx < 0) return blocks;
  const newIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= blocks.length) return blocks;
  const updated = [...blocks];
  [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
  return reorderBlocks(updated);
}

export function duplicateBlock(blocks: EditorBlock[], blockId: string): EditorBlock[] {
  const idx = blocks.findIndex(b => b.id === blockId);
  if (idx < 0) return blocks;
  const clone: EditorBlock = {
    ...JSON.parse(JSON.stringify(blocks[idx])),
    id: generateId(),
    label: blocks[idx].label + ' (Copy)',
  };
  const updated = [...blocks];
  updated.splice(idx + 1, 0, clone);
  return reorderBlocks(updated);
}

export function toggleBlockVisibility(blocks: EditorBlock[], blockId: string): EditorBlock[] {
  return blocks.map(b => b.id === blockId ? { ...b, visible: !b.visible } : b);
}

export function updateBlockData(blocks: EditorBlock[], blockId: string, data: Partial<BlockData>): EditorBlock[] {
  return blocks.map(b => b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b);
}

function reorderBlocks(blocks: EditorBlock[]): EditorBlock[] {
  return blocks.map((b, i) => ({ ...b, order: i }));
}

// ── ID Generator (no external dependency) ───────────────────
function generateId(): string {
  return 'blk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// ── Serialize / Deserialize ─────────────────────────────────
export function serializeEditorState(state: EditorState): string {
  return JSON.stringify(state);
}

export function deserializeEditorState(json: string): EditorState {
  return JSON.parse(json);
}
