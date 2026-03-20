/**
 * 🎨 Slide Templates — Presentation Layout Blueprints
 *
 * Layout definitions for all slide types identified from the
 * Sesotho Fashioneng × KFC presentation deck analysis.
 *
 * Each template defines:
 * - background (solid, gradient, split-panel, image)
 * - regions (text, image, chart, shape, logo placeholders)
 * - brand logo position
 *
 * Page dimensions: 960 × 540 pt (16:9 HD)
 */

import { SlideLayout, SlideRegion, StoryBlock, TextStoryBlock } from '../types';

const W = 960;
const H = 540;

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 TEMPLATE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const SLIDE_TEMPLATES: Record<string, SlideLayout> = {

  // ── 1. TITLE SPLIT ──────────────────────────────────────────────────────────
  // White left (company logo) + dark right (event badge/graphics)
  'title-split': {
    id: 'title-split',
    name: 'Title Split',
    background: {
      type: 'split',
      split: { ratio: 0.48, leftColor: '#ffffff', rightColor: '#1a1a1a' },
    },
    regions: [
      { id: 'logo-left', type: 'image', x: 100, y: 120, width: 260, height: 300, placeholder: 'Company Logo' },
      { id: 'badge-right', type: 'image', x: 520, y: 40, width: 400, height: 360, placeholder: 'Event Badge' },
      { id: 'date-right', type: 'text', x: 530, y: 420, width: 380, height: 30, fontSize: 18, color: '#ffffff', textAlign: 'center', fontWeight: 'bold', placeholder: 'Date' },
      { id: 'venue-right', type: 'text', x: 530, y: 450, width: 380, height: 24, fontSize: 15, color: '#cccccc', textAlign: 'center', placeholder: 'Venue' },
      { id: 'sponsors', type: 'image', x: 540, y: 490, width: 380, height: 40, placeholder: 'Sponsor Logos' },
    ],
    brandLogo: undefined,
  },

  // ── 2. TEXT BODY ────────────────────────────────────────────────────────────
  // Light background, bold heading, multi-paragraph body text
  'text-body': {
    id: 'text-body',
    name: 'Text Body',
    background: { type: 'solid', color: '#f8f8f8', watermarkOpacity: 0.05, watermarkPattern: 'basotho' },
    regions: [
      { id: 'title', type: 'text', x: 40, y: 30, width: 880, height: 50, fontSize: 32, color: '#111111', textAlign: 'center', fontWeight: 'bold' },
      { id: 'body', type: 'text', x: 34, y: 100, width: 880, height: 380, fontSize: 20, color: '#333333', textAlign: 'left' },
    ],
    brandLogo: { position: 'bottom-right', width: 80, height: 50, margin: 15 },
  },

  // ── 3. SPLIT IMAGE + TEXT ───────────────────────────────────────────────────
  // Photo/badge on left, text content on right with colored pills
  'split-image': {
    id: 'split-image',
    name: 'Split Image',
    background: {
      type: 'split',
      split: { ratio: 0.45, leftColor: '#1a1a1a', rightColor: '#1a1a1a' },
    },
    regions: [
      { id: 'photo', type: 'image', x: 0, y: 0, width: 430, height: 540, placeholder: 'Feature Photo' },
      { id: 'title', type: 'text', x: 460, y: 80, width: 460, height: 60, fontSize: 48, color: '#ffffff', textAlign: 'center', fontWeight: 'bold' },
      { id: 'detail-1', type: 'text', x: 470, y: 220, width: 400, height: 40, fontSize: 24, color: '#ffffff', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e3342f' },
      { id: 'detail-2', type: 'text', x: 470, y: 310, width: 400, height: 40, fontSize: 22, color: '#ffffff', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e3342f' },
    ],
    brandLogo: { position: 'bottom-right', width: 80, height: 50, margin: 15 },
  },

  // ── 4. BAR CHART ────────────────────────────────────────────────────────────
  // Dark background, grouped bar chart with data table
  'bar-chart': {
    id: 'bar-chart',
    name: 'Bar Chart',
    background: { type: 'solid', color: '#1a1a1a' },
    regions: [
      { id: 'title', type: 'text', x: 40, y: 20, width: 880, height: 60, fontSize: 44, color: '#ffffff', textAlign: 'center', fontWeight: 'bold' },
      { id: 'chart', type: 'chart', x: 40, y: 90, width: 580, height: 380, placeholder: 'Bar Chart' },
      { id: 'sidebar', type: 'image', x: 660, y: 100, width: 270, height: 380, placeholder: 'Social Proof' },
    ],
    brandLogo: undefined,
  },

  // ── 5. MULTI CHART ──────────────────────────────────────────────────────────
  // Light background, bar chart + donut + stacked bar
  'multi-chart': {
    id: 'multi-chart',
    name: 'Multi Chart',
    background: { type: 'solid', color: '#f8f8f8', watermarkOpacity: 0.05, watermarkPattern: 'basotho' },
    regions: [
      { id: 'title', type: 'text', x: 40, y: 20, width: 880, height: 60, fontSize: 44, color: '#111111', textAlign: 'center', fontWeight: 'bold' },
      { id: 'chart-main', type: 'chart', x: 40, y: 90, width: 560, height: 400, placeholder: 'Bar Chart' },
      { id: 'chart-donut', type: 'chart', x: 620, y: 90, width: 310, height: 200, placeholder: 'Donut Chart' },
      { id: 'chart-stacked', type: 'chart', x: 620, y: 310, width: 310, height: 80, placeholder: 'Stacked Bar' },
    ],
    brandLogo: undefined,
  },

  // ── 6. SOCIAL COLLAGE ───────────────────────────────────────────────────────
  // Screenshots of social media posts + analytics charts
  'social-collage': {
    id: 'social-collage',
    name: 'Social Collage',
    background: { type: 'solid', color: '#f8f8f8', watermarkOpacity: 0.05, watermarkPattern: 'basotho' },
    regions: [
      { id: 'title', type: 'text', x: 40, y: 10, width: 880, height: 40, fontSize: 32, color: '#111111', textAlign: 'center', fontWeight: 'bold' },
      { id: 'subtitle', type: 'text', x: 40, y: 50, width: 880, height: 30, fontSize: 28, color: '#e3342f', textAlign: 'center', fontWeight: 'bold' },
      { id: 'screenshot-1', type: 'image', x: 20, y: 90, width: 280, height: 300, placeholder: 'Social Post 1', borderRadius: 8 },
      { id: 'screenshot-2', type: 'image', x: 320, y: 90, width: 280, height: 300, placeholder: 'Social Post 2', borderRadius: 8 },
      { id: 'screenshot-3', type: 'image', x: 620, y: 90, width: 320, height: 300, placeholder: 'Social Post 3', borderRadius: 8 },
      { id: 'stats', type: 'chart', x: 40, y: 410, width: 880, height: 120, placeholder: 'Engagement Stats' },
    ],
    brandLogo: undefined,
  },

  // ── 7. CAMPAIGN / BULLETS ───────────────────────────────────────────────────
  // Red background, bullet list left, promotional image right
  'campaign': {
    id: 'campaign',
    name: 'Campaign',
    background: { type: 'solid', color: '#cc1111', watermarkOpacity: 0.08, watermarkPattern: 'basotho' },
    regions: [
      { id: 'title', type: 'text', x: 40, y: 20, width: 880, height: 50, fontSize: 32, color: '#ffffff', textAlign: 'center', fontWeight: 'bold' },
      { id: 'body', type: 'text', x: 23, y: 90, width: 440, height: 400, fontSize: 18, color: '#ffffff', textAlign: 'left' },
      { id: 'promo-image', type: 'image', x: 490, y: 100, width: 440, height: 280, placeholder: 'Campaign Image', borderRadius: 8 },
    ],
    brandLogo: { position: 'bottom-right', width: 80, height: 50, margin: 15 },
  },

  // ── 8. TWO COLUMN ───────────────────────────────────────────────────────────
  // Light background, vertical divider, bullet lists, footer bar
  'two-column': {
    id: 'two-column',
    name: 'Two Column',
    background: { type: 'solid', color: '#f8f8f8', watermarkOpacity: 0.05, watermarkPattern: 'basotho' },
    regions: [
      { id: 'title', type: 'text', x: 40, y: 15, width: 880, height: 55, fontSize: 44, color: '#111111', textAlign: 'center', fontWeight: 'bold' },
      { id: 'divider', type: 'shape', x: 478, y: 80, width: 2, height: 380, backgroundColor: '#cccccc' },
      { id: 'col-left', type: 'text', x: 17, y: 80, width: 450, height: 380, fontSize: 18, color: '#333333', textAlign: 'left' },
      { id: 'col-right', type: 'text', x: 500, y: 80, width: 440, height: 380, fontSize: 18, color: '#333333', textAlign: 'left' },
      // Red footer bar
      { id: 'footer-bar', type: 'shape', x: 0, y: 475, width: 960, height: 65, backgroundColor: '#cc1111' },
      { id: 'footer-text', type: 'text', x: 40, y: 485, width: 880, height: 45, fontSize: 16, color: '#ffffff', textAlign: 'center', fontWeight: 'bold' },
    ],
    brandLogo: undefined,
  },

  // ── 9. TIMELINE ─────────────────────────────────────────────────────────────
  // 4 colored circles (Q1-Q4), date headers, bullet items
  'timeline': {
    id: 'timeline',
    name: 'Timeline',
    background: { type: 'solid', color: '#f0ece4', watermarkOpacity: 0.08, watermarkPattern: 'basotho' },
    regions: [
      { id: 'title', type: 'text', x: 40, y: 15, width: 880, height: 55, fontSize: 44, color: '#111111', textAlign: 'center', fontWeight: 'bold' },
      // Q circles (rendered as shape regions)
      { id: 'q1-circle', type: 'shape', x: 75, y: 110, width: 110, height: 110, borderRadius: 55, backgroundColor: 'transparent', color: '#3b82f6' },
      { id: 'q1-label', type: 'text', x: 90, y: 140, width: 80, height: 50, fontSize: 32, color: '#3b82f6', textAlign: 'center' },
      { id: 'q2-circle', type: 'shape', x: 310, y: 110, width: 110, height: 110, borderRadius: 55, backgroundColor: 'transparent', color: '#8b5cf6' },
      { id: 'q2-label', type: 'text', x: 325, y: 140, width: 80, height: 50, fontSize: 32, color: '#8b5cf6', textAlign: 'center' },
      { id: 'q3-circle', type: 'shape', x: 545, y: 110, width: 110, height: 110, borderRadius: 55, backgroundColor: 'transparent', color: '#22c55e' },
      { id: 'q3-label', type: 'text', x: 560, y: 140, width: 80, height: 50, fontSize: 32, color: '#22c55e', textAlign: 'center' },
      { id: 'q4-circle', type: 'shape', x: 785, y: 110, width: 110, height: 110, borderRadius: 55, backgroundColor: 'transparent', color: '#22c55e' },
      { id: 'q4-label', type: 'text', x: 800, y: 140, width: 80, height: 50, fontSize: 32, color: '#22c55e', textAlign: 'center' },
      // Date + items areas
      { id: 'q1-date', type: 'text', x: 40, y: 240, width: 200, height: 24, fontSize: 18, color: '#3b82f6', textAlign: 'center', fontWeight: 'bold' },
      { id: 'q1-items', type: 'text', x: 40, y: 270, width: 200, height: 250, fontSize: 12, color: '#333333', textAlign: 'left' },
      { id: 'q2-date', type: 'text', x: 260, y: 240, width: 220, height: 24, fontSize: 18, color: '#8b5cf6', textAlign: 'center', fontWeight: 'bold' },
      { id: 'q2-items', type: 'text', x: 260, y: 270, width: 220, height: 250, fontSize: 12, color: '#333333', textAlign: 'left' },
      { id: 'q3-date', type: 'text', x: 500, y: 240, width: 220, height: 24, fontSize: 18, color: '#22c55e', textAlign: 'center', fontWeight: 'bold' },
      { id: 'q3-items', type: 'text', x: 500, y: 270, width: 220, height: 250, fontSize: 12, color: '#333333', textAlign: 'left' },
      { id: 'q4-date', type: 'text', x: 740, y: 240, width: 190, height: 24, fontSize: 18, color: '#22c55e', textAlign: 'center', fontWeight: 'bold' },
      { id: 'q4-items', type: 'text', x: 740, y: 270, width: 190, height: 250, fontSize: 12, color: '#333333', textAlign: 'left' },
    ],
    brandLogo: { position: 'bottom-right', width: 80, height: 50, margin: 15 },
  },

  // ── 10. PHOTO GALLERY ───────────────────────────────────────────────────────
  // Red background, 3 rotated photo frames
  'gallery': {
    id: 'gallery',
    name: 'Photo Gallery',
    background: { type: 'solid', color: '#cc1111', watermarkOpacity: 0.08, watermarkPattern: 'basotho' },
    regions: [
      { id: 'photo-1', type: 'image', x: 40, y: 50, width: 280, height: 400, placeholder: 'Photo 1', borderRadius: 4, rotation: -3 },
      { id: 'photo-2', type: 'image', x: 340, y: 50, width: 280, height: 400, placeholder: 'Photo 2', borderRadius: 4, rotation: 1 },
      { id: 'photo-3', type: 'image', x: 640, y: 50, width: 280, height: 400, placeholder: 'Photo 3', borderRadius: 4, rotation: 2 },
    ],
    brandLogo: { position: 'bottom-right', width: 80, height: 50, margin: 15 },
  },

  // ── 11. SPONSORSHIP ASK ─────────────────────────────────────────────────────
  // White left with bullet list, red right with imagery
  'sponsorship': {
    id: 'sponsorship',
    name: 'Sponsorship Ask',
    background: {
      type: 'split',
      split: { ratio: 0.52, leftColor: '#ffffff', rightColor: '#cc1111' },
    },
    regions: [
      { id: 'title', type: 'text', x: 19, y: 55, width: 260, height: 40, fontSize: 27, color: '#111111', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#ffdd00' },
      { id: 'body', type: 'text', x: 19, y: 105, width: 470, height: 400, fontSize: 17, color: '#333333', textAlign: 'left' },
      { id: 'feature-image', type: 'image', x: 500, y: 100, width: 440, height: 400, placeholder: 'Feature Image' },
    ],
    brandLogo: undefined,
  },

  // ── 12. CONTACT DETAILS ─────────────────────────────────────────────────────
  // Light background, contact cards in 2+1 layout
  'contact': {
    id: 'contact',
    name: 'Contact Details',
    background: { type: 'solid', color: '#f8f8f8', watermarkOpacity: 0.05, watermarkPattern: 'basotho' },
    regions: [
      { id: 'title', type: 'text', x: 40, y: 30, width: 880, height: 55, fontSize: 43, color: '#111111', textAlign: 'center', fontWeight: 'bold' },
      { id: 'contact-1', type: 'text', x: 60, y: 120, width: 380, height: 180, fontSize: 28, color: '#333333', textAlign: 'left' },
      { id: 'contact-2', type: 'text', x: 520, y: 120, width: 380, height: 180, fontSize: 28, color: '#333333', textAlign: 'left' },
      { id: 'contact-3', type: 'text', x: 250, y: 330, width: 460, height: 150, fontSize: 28, color: '#333333', textAlign: 'center' },
    ],
    brandLogo: { position: 'bottom-right', width: 80, height: 50, margin: 15 },
  },

  // ── 13. THANK YOU ───────────────────────────────────────────────────────────
  // Mirror of title split with "THANK YOU" text
  'thank-you': {
    id: 'thank-you',
    name: 'Thank You',
    background: {
      type: 'split',
      split: { ratio: 0.48, leftColor: '#ffffff', rightColor: '#1a1a1a' },
    },
    regions: [
      { id: 'thank-text', type: 'text', x: 40, y: 180, width: 380, height: 200, fontSize: 72, color: '#111111', textAlign: 'center', fontWeight: 'bold' },
      { id: 'badge-right', type: 'image', x: 520, y: 40, width: 400, height: 360, placeholder: 'Event Badge' },
      { id: 'sponsors', type: 'image', x: 540, y: 490, width: 380, height: 40, placeholder: 'Sponsor Logos' },
    ],
    brandLogo: undefined,
  },

  // ── DEFAULT BLANK ───────────────────────────────────────────────────────────
  'blank': {
    id: 'blank',
    name: 'Blank Slide',
    background: { type: 'solid', color: '#ffffff' },
    regions: [
      { id: 'title', type: 'text', x: 40, y: 40, width: 880, height: 60, fontSize: 36, color: '#111111', textAlign: 'center', fontWeight: 'bold' },
      { id: 'body', type: 'text', x: 40, y: 120, width: 880, height: 380, fontSize: 20, color: '#333333', textAlign: 'left' },
    ],
    brandLogo: undefined,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 TEMPLATE SELECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Auto-detect the best template for a slide based on its content.
 * Falls back to 'text-body' for generic slides.
 */
export function getTemplateForSlide(
  blocks: StoryBlock[],
  slideIndex: number,
  totalSlides: number,
): SlideLayout {
  const textBlocks = blocks.filter(b => b.type !== 'image' && b.type !== 'break') as TextStoryBlock[];
  const imageBlocks = blocks.filter(b => b.type === 'image');
  const text = textBlocks.map(b => b.text || '').join(' ').toLowerCase();

  // First slide = title
  if (slideIndex === 0) {
    return SLIDE_TEMPLATES['title-split'];
  }

  // Last slide = thank you
  if (slideIndex === totalSlides - 1) {
    const hasThankYou = text.includes('thank') || text.includes('merci') || text.includes('kea leboha');
    if (hasThankYou || textBlocks.length <= 2) {
      return SLIDE_TEMPLATES['thank-you'];
    }
  }

  // Contact slides
  if (text.includes('contact') || text.includes('email') || text.includes('@') || text.includes('cell:')) {
    return SLIDE_TEMPLATES['contact'];
  }

  // Timeline slides
  if (text.includes('timeline') || text.includes('q1') || text.includes('q2') || text.includes('quarter')) {
    return SLIDE_TEMPLATES['timeline'];
  }

  // Chart/data slides
  if (text.includes('attendance') || text.includes('target audience') || text.includes('insights')) {
    if (text.includes('gender') || text.includes('breakdown')) {
      return SLIDE_TEMPLATES['multi-chart'];
    }
    return SLIDE_TEMPLATES['bar-chart'];
  }

  // Campaign/collateral slides
  if (text.includes('campaign') || text.includes('kfc x') || text.includes('mechanism')) {
    return SLIDE_TEMPLATES['campaign'];
  }

  // Marketing approach (two-column)
  if (text.includes('marketing') || text.includes('media approach') || text.includes('above the line')) {
    return SLIDE_TEMPLATES['two-column'];
  }

  // Social collage
  if (text.includes('collateral') || text.includes('announcement') || text.includes('lineup')) {
    return SLIDE_TEMPLATES['social-collage'];
  }

  // Sponsorship
  if (text.includes('sponsor') || text.includes('financial support') || text.includes('ask')) {
    return SLIDE_TEMPLATES['sponsorship'];
  }

  // Gallery (mostly images, minimal text)
  if (imageBlocks.length >= 3 && textBlocks.length <= 1) {
    return SLIDE_TEMPLATES['gallery'];
  }

  // Split image (has image + limited text)
  if (imageBlocks.length >= 1 && textBlocks.length <= 4) {
    return SLIDE_TEMPLATES['split-image'];
  }

  // Default: text-body for text-heavy slides
  return SLIDE_TEMPLATES['text-body'];
}

/**
 * Get a template by ID.
 */
export function getSlideTemplateById(id: string): SlideLayout {
  return SLIDE_TEMPLATES[id] || SLIDE_TEMPLATES['blank'];
}

/**
 * Get all available template IDs and names for the UI.
 */
export function getAvailableTemplates(): { id: string; name: string }[] {
  return Object.values(SLIDE_TEMPLATES).map(t => ({ id: t.id, name: t.name }));
}
