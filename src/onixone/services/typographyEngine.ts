/**
 * 🔤 Typography Engine — WCCCS Publishing Engine
 * 
 * Professional typography system with font intelligence, named paragraph styles,
 * drop caps, small caps, optical margin alignment, and genre-aware font pairing.
 */

import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 PARAGRAPH STYLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export interface ParagraphStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;          // in pt
  lineHeight: number;        // multiplier (e.g. 1.6)
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textIndent: number;        // in pt (first-line indent)
  marginTop: number;         // in pt
  marginBottom: number;      // in pt
  letterSpacing: number;     // in em (0 = normal)
  wordSpacing: number;       // in em (0 = normal)
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'small-caps';
  hyphenate: boolean;
  orphans: number;           // min lines at bottom of page
  widows: number;            // min lines at top of page
  keepWithNext: boolean;     // don't separate from next block
  keepTogether: boolean;     // don't break across pages
  dropCap?: DropCapStyle;
  hangingPunctuation: boolean;
  // Inheritance
  basedOn?: string;          // parent style ID
}

export interface DropCapStyle {
  enabled: boolean;
  lines: number;             // how many lines the drop cap spans (2-5)
  fontFamily?: string;       // optional override font
  fontWeight?: string;
  color?: string;
  marginRight: number;       // spacing in pt
  style: 'drop' | 'raised' | 'adjacent';  // drop = sinks into text, raised = sits above baseline
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 FONT PAIRING INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════

export interface FontPairing {
  id: string;
  name: string;
  heading: string;
  body: string;
  accent?: string;           // for quotes, captions
  mood: string;              // e.g. "elegant", "modern", "warm"
  genres: string[];          // recommended genres
}

export const FONT_PAIRINGS: FontPairing[] = [
  // Classic & Literary
  {
    id: 'classic-garamond',
    name: 'Classic Elegance',
    heading: 'Playfair Display',
    body: 'EB Garamond',
    accent: 'Cormorant Garamond',
    mood: 'timeless, refined, literary',
    genres: ['literary-fiction', 'memoir', 'biography', 'history', 'poetry']
  },
  {
    id: 'scholarly',
    name: 'Devotional (Parchments)',
    heading: 'Montserrat',
    body: 'Open Sans',
    accent: 'Playfair Display',
    mood: 'modern, clean, structured',
    genres: ['academic', 'theology', 'philosophy', 'history', 'devotional']
  },
  {
    id: 'warm-serif',
    name: 'Warm & Inviting',
    heading: 'Cormorant Garamond',
    body: 'Merriweather',
    accent: 'Dancing Script',
    mood: 'warm, approachable, friendly',
    genres: ['self-help', 'devotional', 'romance', 'memoir', 'cookbook']
  },

  // Modern & Clean
  {
    id: 'modern-sans',
    name: 'Modern Clarity',
    heading: 'Inter',
    body: 'Inter',
    accent: 'Roboto Mono',
    mood: 'clean, modern, professional',
    genres: ['business', 'technology', 'report', 'newsletter', 'proposal']
  },
  {
    id: 'editorial',
    name: 'Editorial',
    heading: 'Playfair Display',
    body: 'Open Sans',
    accent: 'Roboto Mono',
    mood: 'polished, magazine-quality',
    genres: ['magazine', 'newsletter', 'report', 'nonfiction']
  },
  {
    id: 'bold-statement',
    name: 'Bold Statement',
    heading: 'Roboto',
    body: 'Open Sans',
    accent: 'Roboto',
    mood: 'strong, confident, impactful',
    genres: ['business', 'proposal', 'slide', 'report', 'thriller']
  },

  // Specialty
  {
    id: 'children',
    name: 'Playful & Fun',
    heading: 'Comic Neue',
    body: 'Open Sans',
    accent: 'Dancing Script',
    mood: 'playful, young, energetic',
    genres: ['children', 'young-adult', 'comic']
  },
  {
    id: 'romantic',
    name: 'Romantic Script',
    heading: 'Dancing Script',
    body: 'Cormorant Garamond',
    accent: 'EB Garamond',
    mood: 'romantic, elegant, flowing',
    genres: ['romance', 'poetry', 'wedding', 'devotional']
  },
  {
    id: 'technical',
    name: 'Technical Precision',
    heading: 'Roboto',
    body: 'Roboto',
    accent: 'Roboto Mono',
    mood: 'precise, technical, systematic',
    genres: ['technology', 'science', 'academic', 'textbook', 'manual']
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 DEFAULT STYLE SHEETS BY GENRE
// ═══════════════════════════════════════════════════════════════════════════════

export interface StyleSheet {
  id: string;
  name: string;
  fontPairing: FontPairing;
  styles: Record<string, ParagraphStyle>;
}

function createBaseStyle(overrides: Partial<ParagraphStyle> = {}): ParagraphStyle {
  return {
    id: 'body',
    name: 'Body',
    fontFamily: 'EB Garamond',
    fontSize: 11,
    lineHeight: 1.6,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#1a1a1a',
    textAlign: 'justify',
    textIndent: 18,
    marginTop: 0,
    marginBottom: 0,
    letterSpacing: 0,
    wordSpacing: 0,
    textTransform: 'none',
    hyphenate: true,
    orphans: 2,
    widows: 2,
    keepWithNext: false,
    keepTogether: false,
    hangingPunctuation: true,
    ...overrides,
  };
}

export function createStyleSheet(genre: string, pairing?: FontPairing): StyleSheet {
  const fp = pairing || recommendFontPairing(genre);

  const body = createBaseStyle({
    id: 'body',
    name: 'Body',
    fontFamily: fp.body,
    fontSize: genre === 'devotional' ? 10.5 : (genre === 'children' ? 14 : genre === 'slide' ? 16 : 11),
    lineHeight: genre === 'devotional' ? 1.9 : (genre === 'poetry' ? 1.8 : 1.6),
    textAlign: genre === 'devotional' ? 'justify' : (genre === 'poetry' ? 'left' : 'justify'),
    textIndent: genre === 'devotional' || genre === 'poetry' || genre === 'slide' ? 0 : 18,
    marginTop: genre === 'devotional' ? 0 : 0,
    marginBottom: genre === 'devotional' ? 16 : 0,
    color: genre === 'devotional' ? '#2a2a2a' : '#1a1a1a',
    hyphenate: genre !== 'slide' && genre !== 'children',
  });

  const bodyFirst = createBaseStyle({
    ...body,
    id: 'body-first',
    name: 'Body (First Paragraph)',
    textIndent: 0,           // First paragraph after heading = no indent
    basedOn: 'body',
  });

  const heading1 = createBaseStyle({
    id: 'heading-1',
    name: 'Chapter Title',
    fontFamily: fp.heading,
    fontSize: genre === 'devotional' ? 16 : (genre === 'slide' ? 36 : 24),
    lineHeight: 1.2,
    fontWeight: 'bold',
    textAlign: 'center',
    textIndent: 0,
    textTransform: genre === 'devotional' ? 'uppercase' : 'none',
    letterSpacing: genre === 'devotional' ? 0.05 : 0.02,
    marginTop: genre === 'devotional' ? 12 : (genre === 'slide' ? 20 : 72),
    marginBottom: genre === 'devotional' ? 12 : 24,
    hyphenate: false,
    keepWithNext: true,
    keepTogether: true,
    hangingPunctuation: false,
  });

  const heading2 = createBaseStyle({
    id: 'heading-2',
    name: 'Section Heading',
    fontFamily: fp.heading,
    fontSize: genre === 'devotional' ? 12 : (genre === 'slide' ? 24 : 16),
    lineHeight: 1.3,
    fontWeight: 'bold', // Changed to bold for devotional compatibility
    textAlign: genre === 'devotional' ? 'center' : 'left',
    textIndent: 0,
    textTransform: genre === 'devotional' ? 'uppercase' : 'none',
    marginTop: genre === 'devotional' ? 18 : 24,
    marginBottom: genre === 'devotional' ? 8 : 12,
    hyphenate: false,
    keepWithNext: true,
    keepTogether: true,
    hangingPunctuation: false,
    basedOn: 'heading-1',
  });

  const heading3 = createBaseStyle({
    id: 'heading-3',
    name: 'Sub-section',
    fontFamily: fp.heading,
    fontSize: 13,
    lineHeight: 1.3,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'left',
    textIndent: 0,
    marginTop: 18,
    marginBottom: 8,
    hyphenate: false,
    keepWithNext: true,
    keepTogether: true,
    hangingPunctuation: false,
    basedOn: 'heading-2',
  });

  const quote = createBaseStyle({
    id: 'quote',
    name: 'Theme / Key Verse',
    fontFamily: genre === 'devotional' ? fp.accent || fp.body : fp.heading,
    fontSize: genre === 'devotional' ? 18 : 10.5,
    lineHeight: genre === 'devotional' ? 1.4 : 1.5,
    fontStyle: genre === 'devotional' ? 'normal' : 'italic',
    textAlign: genre === 'devotional' ? 'center' : 'left',
    color: genre === 'devotional' ? '#c47c44' : '#1a1a1a', // The copper/orange accent color
    textIndent: 0,
    marginTop: genre === 'devotional' ? 24 : 12,
    marginBottom: genre === 'devotional' ? 36 : 12,
    hyphenate: false,
    hangingPunctuation: false,
  });

  const caption = createBaseStyle({
    id: 'caption',
    name: 'Caption',
    fontFamily: fp.body,
    fontSize: 9,
    lineHeight: 1.3,
    color: '#555555',
    textAlign: 'center',
    textIndent: 0,
    marginTop: 6,
    marginBottom: 12,
    hyphenate: false,
    hangingPunctuation: false,
  });

  const footnote = createBaseStyle({
    id: 'footnote',
    name: 'Footnote',
    fontFamily: fp.body,
    fontSize: 8.5,
    lineHeight: 1.3,
    textIndent: 12,
    marginTop: 2,
    marginBottom: 2,
    hyphenate: false,
    hangingPunctuation: false,
  });

  const pageNumber = createBaseStyle({
    id: 'page-number',
    name: 'Page Number',
    fontFamily: fp.body,
    fontSize: 9,
    lineHeight: 1,
    textAlign: 'center',
    textIndent: 0,
    hyphenate: false,
    hangingPunctuation: false,
  });

  const runningHeader = createBaseStyle({
    id: 'running-header',
    name: 'Running Header',
    fontFamily: fp.body,
    fontSize: 8,
    lineHeight: 1,
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    textAlign: 'center',
    textIndent: 0,
    hyphenate: false,
    hangingPunctuation: false,
  });

  const tocEntry = createBaseStyle({
    id: 'toc-entry',
    name: 'TOC Entry',
    fontFamily: fp.body,
    fontSize: 11,
    lineHeight: 1.8,
    textAlign: 'left',
    textIndent: 0,
    hyphenate: false,
    hangingPunctuation: false,
  });

  const tocTitle = createBaseStyle({
    id: 'toc-title',
    name: 'TOC Title',
    fontFamily: fp.heading,
    fontSize: 18,
    lineHeight: 1.2,
    fontWeight: 'bold',
    textAlign: 'center',
    textIndent: 0,
    marginTop: 48,
    marginBottom: 36,
    hyphenate: false,
    keepWithNext: true,
    hangingPunctuation: false,
  });

  return {
    id: `stylesheet-${genre}`,
    name: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Style`,
    fontPairing: fp,
    styles: {
      'body': body,
      'body-first': bodyFirst,
      'heading-1': heading1,
      'heading-2': heading2,
      'heading-3': heading3,
      'quote': quote,
      'caption': caption,
      'footnote': footnote,
      'page-number': pageNumber,
      'running-header': runningHeader,
      'toc-entry': tocEntry,
      'toc-title': tocTitle,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 FONT RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════════════════

export function recommendFontPairing(genre: string): FontPairing {
  const normalised = genre.toLowerCase().replace(/[^a-z0-9-]/g, '');

  // Direct match
  for (const pairing of FONT_PAIRINGS) {
    if (pairing.genres.includes(normalised)) return pairing;
  }

  // Fuzzy match by category
  const categoryMap: Record<string, string> = {
    'novel': 'classic-garamond',
    'fiction': 'classic-garamond',
    'book': 'classic-garamond',
    'nonfiction': 'editorial',
    'business': 'modern-sans',
    'report': 'modern-sans',
    'proposal': 'bold-statement',
    'newsletter': 'editorial',
    'magazine': 'editorial',
    'slide': 'bold-statement',
    'devotional': 'scholarly',
    'children': 'children',
    'poetry': 'romantic',
    'cookbook': 'warm-serif',
    'academic': 'technical',
    'textbook': 'technical',
  };

  const pairingId = categoryMap[normalised] || 'classic-garamond';
  return FONT_PAIRINGS.find(p => p.id === pairingId) || FONT_PAIRINGS[0];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📏 TYPOGRAPHIC MEASUREMENTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Convert points to pixels at 96 DPI screen resolution */
export const ptToPx = (pt: number): number => pt * (96 / 72);

/** Convert pixels to points */
export const pxToPt = (px: number): number => px * (72 / 96);

/** Convert mm to points (1mm = 2.83465pt) */
export const mmToPt = (mm: number): number => mm * 2.83465;

/** Convert points to mm */
export const ptToMm = (pt: number): number => pt / 2.83465;

/** Convert inches to points (1in = 72pt) */
export const inToPt = (inches: number): number => inches * 72;

/** Convert points to inches */
export const ptToIn = (pt: number): number => pt / 72;

/**
 * Calculate the number of text lines that fit in a given height, 
 * considering font size, line height, and margins.
 */
export function calculateLinesPerPage(
  contentHeightPt: number,
  fontSizePt: number,
  lineHeight: number,
): number {
  const lineHeightPt = fontSizePt * lineHeight;
  return Math.floor(contentHeightPt / lineHeightPt);
}

/**
 * Calculate the line height in points for a given style.
 */
export function getLineHeightPt(style: ParagraphStyle): number {
  return style.fontSize * style.lineHeight;
}

/**
 * Apply a paragraph style to get a CSS-compatible style object.
 * Used by the PageRenderer to style text annotations from the composition engine.
 */
export function styleToCss(style: ParagraphStyle): React.CSSProperties {
  const css: Record<string, any> = {
    fontFamily: `"${style.fontFamily}", serif`,
    fontSize: `${style.fontSize}pt`,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    color: style.color,
    textAlign: style.textAlign,
    textIndent: style.textIndent > 0 ? `${style.textIndent}pt` : undefined,
    letterSpacing: style.letterSpacing !== 0 ? `${style.letterSpacing}em` : undefined,
    wordSpacing: style.wordSpacing !== 0 ? `${style.wordSpacing}em` : undefined,
    textTransform: style.textTransform !== 'none' ? style.textTransform : undefined,
    hyphens: style.hyphenate ? 'auto' : 'none',
    hangingPunctuation: style.hangingPunctuation ? 'first last' : undefined,
    orphans: style.orphans,
    widows: style.widows,
  };

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(css).filter(([_, v]) => v !== undefined)
  ) as React.CSSProperties;
}

/**
 * Generate CSS for drop cap effect
 */
export function dropCapCss(style: DropCapStyle): string {
  if (!style.enabled) return '';

  return `
    .drop-cap::first-letter {
      float: left;
      font-size: ${style.lines * 1.1}em;
      line-height: 0.8;
      margin-right: ${style.marginRight}pt;
      font-family: ${style.fontFamily ? `"${style.fontFamily}"` : 'inherit'};
      font-weight: ${style.fontWeight || 'bold'};
      color: ${style.color || 'inherit'};
      ${style.style === 'raised' ? 'padding-top: 0.1em;' : ''}
    }
  `;
}
