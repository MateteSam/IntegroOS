/**
 * 🧠 Design Brain — WCCCS Publishing Engine
 *
 * Genre-aware AI design intelligence that:
 * - Recommends complete design configurations by genre/category
 * - Suggests layouts, fonts, colours, and decorative elements
 * - Adapts recommendations based on content analysis
 * - Provides one-click "Design This Book" automation
 */

import { GoogleGenAI, Type } from '@google/genai';
import { StyleSheet, createStyleSheet, FontPairing, FONT_PAIRINGS, recommendFontPairing } from './typographyEngine';
import { CompositionOptions, createDefaultPageSpec, PageSpec, MarginSet } from './compositionEngine';
import { FrontMatterConfig, BackMatterConfig, DEFAULT_FRONT_MATTER, DEFAULT_BACK_MATTER } from './frontBackMatter';
import { DesignDNA } from './dnaCaptureEngine';
import { BookMetadata, StoryBlock, TextStoryBlock, DocumentSettings, PageSize, ProjectCategory } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 DESIGN PRESET TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DesignPreset {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  genre?: string;
  thumbnail?: string;

  // Layout
  pageSpec: PageSpec;
  styleSheet: StyleSheet;

  // Options
  frontMatter: FrontMatterConfig;
  backMatter: BackMatterConfig;
  showRunningHeaders: boolean;
  showPageNumbers: boolean;
  startChapterOnRecto: boolean;

  // Aesthetic
  paperTone: 'white' | 'cream' | 'ivory' | 'warm-grey';
  decorativeStyle: 'classical' | 'modern' | 'minimal' | 'ornate' | 'editorial';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 BUILT-IN DESIGN PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

function makePageSpec(widthIn: number, heightIn: number, marginMm: number = 20, cols: number = 1): PageSpec {
  const marginPt = marginMm * 2.83465;
  return {
    widthPt: widthIn * 72,
    heightPt: heightIn * 72,
    margins: { top: marginPt + 20, bottom: marginPt + 15, inner: marginPt + 10, outer: marginPt },
    columns: cols,
    columnGapPt: 14,
  };
}

export const DESIGN_PRESETS: DesignPreset[] = [
  // ─── NOVELS ───
  {
    id: 'novel-classic',
    name: 'Classic Novel',
    description: 'Timeless elegance for literary fiction — Garamond, justified, drop caps',
    category: 'book',
    genre: 'fiction',
    pageSpec: makePageSpec(6, 9, 22),
    styleSheet: createStyleSheet('book'),
    frontMatter: { ...DEFAULT_FRONT_MATTER, includeDedication: true },
    backMatter: { ...DEFAULT_BACK_MATTER, includeAlsoBy: true, includeColophon: true },
    showRunningHeaders: true,
    showPageNumbers: true,
    startChapterOnRecto: true,
    paperTone: 'cream',
    decorativeStyle: 'classical',
  },
  {
    id: 'novel-modern',
    name: 'Modern Novel',
    description: 'Clean sans-serif for contemporary fiction — minimal, airy',
    category: 'book',
    genre: 'fiction',
    pageSpec: makePageSpec(5.5, 8.5, 20),
    styleSheet: createStyleSheet('nonfiction'),
    frontMatter: { ...DEFAULT_FRONT_MATTER },
    backMatter: { ...DEFAULT_BACK_MATTER },
    showRunningHeaders: true,
    showPageNumbers: true,
    startChapterOnRecto: true,
    paperTone: 'white',
    decorativeStyle: 'modern',
  },
  {
    id: 'novel-thriller',
    name: 'Thriller / Suspense',
    description: 'Bold, urgent typography for page-turners',
    category: 'book',
    genre: 'thriller',
    pageSpec: makePageSpec(5.5, 8.5, 18),
    styleSheet: createStyleSheet('thriller'),
    frontMatter: { ...DEFAULT_FRONT_MATTER },
    backMatter: { ...DEFAULT_BACK_MATTER },
    showRunningHeaders: true,
    showPageNumbers: true,
    startChapterOnRecto: false,
    paperTone: 'white',
    decorativeStyle: 'minimal',
  },

  // ─── NON-FICTION ───
  {
    id: 'nonfiction-business',
    name: 'Business / Self-Help',
    description: 'Professional layout for actionable non-fiction',
    category: 'book',
    genre: 'business',
    pageSpec: makePageSpec(6, 9, 22),
    styleSheet: createStyleSheet('business'),
    frontMatter: { ...DEFAULT_FRONT_MATTER, includeAcknowledgements: true },
    backMatter: { ...DEFAULT_BACK_MATTER, includeAlsoBy: true },
    showRunningHeaders: true,
    showPageNumbers: true,
    startChapterOnRecto: true,
    paperTone: 'white',
    decorativeStyle: 'modern',
  },
  {
    id: 'devotional-warm',
    name: 'Daily Devotional',
    description: 'Warm, inviting layout for spiritual reading',
    category: 'devotional',
    genre: 'devotional',
    pageSpec: makePageSpec(5.5, 8.5, 22),
    styleSheet: createStyleSheet('devotional'),
    frontMatter: { ...DEFAULT_FRONT_MATTER, includeDedication: true },
    backMatter: { ...DEFAULT_BACK_MATTER },
    showRunningHeaders: false,
    showPageNumbers: true,
    startChapterOnRecto: false,
    paperTone: 'cream',
    decorativeStyle: 'ornate',
  },

  // ─── REPORTS & DOCUMENTS ───
  {
    id: 'report-corporate',
    name: 'Corporate Report',
    description: 'Professional multi-column report with charts and data',
    category: 'report',
    genre: 'report',
    pageSpec: makePageSpec(8.5, 11, 18, 2),
    styleSheet: createStyleSheet('report'),
    frontMatter: { ...DEFAULT_FRONT_MATTER, includeHalfTitle: false, includeCopyrightPage: false },
    backMatter: { ...DEFAULT_BACK_MATTER, includeAboutAuthor: false },
    showRunningHeaders: true,
    showPageNumbers: true,
    startChapterOnRecto: false,
    paperTone: 'white',
    decorativeStyle: 'modern',
  },

  // ─── NEWSLETTERS ───
  {
    id: 'newsletter-church',
    name: 'Church Newsletter',
    description: 'Warm, community-focused layout',
    category: 'newsletter',
    genre: 'newsletter',
    pageSpec: makePageSpec(8.5, 11, 15, 2),
    styleSheet: createStyleSheet('newsletter'),
    frontMatter: { ...DEFAULT_FRONT_MATTER, includeHalfTitle: false, includeTitlePage: false, includeCopyrightPage: false },
    backMatter: { ...DEFAULT_BACK_MATTER, includeAboutAuthor: false },
    showRunningHeaders: false,
    showPageNumbers: true,
    startChapterOnRecto: false,
    paperTone: 'white',
    decorativeStyle: 'modern',
  },

  // ─── SLIDESHOWS ───
  {
    id: 'slide-pitch',
    name: 'Pitch Deck',
    description: 'Bold, impactful slides for presentations',
    category: 'slide',
    genre: 'slide',
    pageSpec: makePageSpec(13.333, 7.5, 10),  // 16:9 widescreen
    styleSheet: createStyleSheet('slide'),
    frontMatter: { ...DEFAULT_FRONT_MATTER, includeHalfTitle: false, includeTitlePage: false, includeCopyrightPage: false },
    backMatter: { ...DEFAULT_BACK_MATTER, includeAboutAuthor: false },
    showRunningHeaders: false,
    showPageNumbers: false,
    startChapterOnRecto: false,
    paperTone: 'white',
    decorativeStyle: 'modern',
  },

  // ─── CHILDREN'S ───
  {
    id: 'children-picture',
    name: 'Picture Book',
    description: 'Large format for colourful children\'s books',
    category: 'book',
    genre: 'children',
    pageSpec: makePageSpec(8.5, 8.5, 15),
    styleSheet: createStyleSheet('children'),
    frontMatter: { ...DEFAULT_FRONT_MATTER, includeHalfTitle: false, includeAcknowledgements: false },
    backMatter: { ...DEFAULT_BACK_MATTER, includeColophon: false },
    showRunningHeaders: false,
    showPageNumbers: false,
    startChapterOnRecto: false,
    paperTone: 'white',
    decorativeStyle: 'modern',
  },

  // ─── POETRY ───
  {
    id: 'poetry-elegant',
    name: 'Poetry Collection',
    description: 'Elegant, spacious layout for verse',
    category: 'book',
    genre: 'poetry',
    pageSpec: makePageSpec(5.5, 8.5, 25),
    styleSheet: createStyleSheet('poetry'),
    frontMatter: { ...DEFAULT_FRONT_MATTER, includeDedication: true },
    backMatter: { ...DEFAULT_BACK_MATTER, includeColophon: true },
    showRunningHeaders: false,
    showPageNumbers: true,
    startChapterOnRecto: true,
    paperTone: 'cream',
    decorativeStyle: 'classical',
  },

  // ─── MAGAZINE ───
  {
    id: 'magazine-editorial',
    name: 'Editorial Magazine',
    description: 'Multi-column magazine with headline impact',
    category: 'book',
    genre: 'magazine',
    pageSpec: makePageSpec(8.5, 11, 12, 2),
    styleSheet: createStyleSheet('magazine'),
    frontMatter: { ...DEFAULT_FRONT_MATTER, includeHalfTitle: false, includeTitlePage: false, includeCopyrightPage: false },
    backMatter: { ...DEFAULT_BACK_MATTER, includeAboutAuthor: false },
    showRunningHeaders: false,
    showPageNumbers: true,
    startChapterOnRecto: false,
    paperTone: 'white',
    decorativeStyle: 'editorial',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 AI-POWERED DESIGN RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════════════════

declare const process: { env: { API_KEY?: string; GEMINI_API_KEY?: string } };

function getAI() {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey.length < 10) throw new Error('AI API key required');
  return new GoogleGenAI({ apiKey });
}

/**
 * Analyse content and recommend the best design preset.
 */
export async function recommendDesign(
  storyBlocks: StoryBlock[],
  metadata: BookMetadata,
  category: ProjectCategory,
): Promise<{ preset: DesignPreset; reason: string; alternatives: DesignPreset[] }> {
  // Filter presets by category
  const categoryPresets = DESIGN_PRESETS.filter(p => p.category === category);
  if (categoryPresets.length === 0) {
    return {
      preset: DESIGN_PRESETS[0],
      reason: 'Default preset selected — no presets match the project category.',
      alternatives: DESIGN_PRESETS.slice(1, 3),
    };
  }

  // Try AI recommendation
  try {
    const ai = getAI();
    const textSample = storyBlocks
      .filter((b): b is TextStoryBlock => 'text' in b)
      .slice(0, 10)
      .map(b => b.text)
      .join('\n')
      .substring(0, 5000);

    const presetNames = categoryPresets.map(p => `${p.id}: ${p.name} — ${p.description}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are a professional book designer at WCCCS Publishing.

Given this ${category} manuscript, which design preset is the best fit?

Title: ${metadata.title}
Authors: ${metadata.authors?.join(', ')}
Content sample:
---
${textSample}
---

Available presets:
${presetNames}

Return JSON: { "presetId": string, "reason": string, "alternativeIds": string[] }`,
      config: { responseMimeType: 'application/json' },
    });

    const result = JSON.parse(response.text ?? '{}');
    const chosen = categoryPresets.find(p => p.id === result.presetId) || categoryPresets[0];
    const alts = (result.alternativeIds || [])
      .map((id: string) => categoryPresets.find(p => p.id === id))
      .filter(Boolean) as DesignPreset[];

    return {
      preset: chosen,
      reason: result.reason || 'AI-recommended based on content analysis.',
      alternatives: alts.length > 0 ? alts : categoryPresets.filter(p => p.id !== chosen.id).slice(0, 2),
    };
  } catch {
    // Fallback: pick the first preset for the category
    return {
      preset: categoryPresets[0],
      reason: 'Selected based on project category.',
      alternatives: categoryPresets.slice(1, 3),
    };
  }
}

/**
 * One-click "Design This Book" — applies a preset to the project.
 * Returns updated composition options.
 */
export function applyPreset(
  preset: DesignPreset,
  metadata: BookMetadata,
): {
  pageSpec: PageSpec;
  styleSheet: StyleSheet;
  frontMatter: FrontMatterConfig;
  backMatter: BackMatterConfig;
  showRunningHeaders: boolean;
  showPageNumbers: boolean;
  startPageOnRecto: boolean;
} {
  return {
    pageSpec: preset.pageSpec,
    styleSheet: preset.styleSheet,
    frontMatter: preset.frontMatter,
    backMatter: preset.backMatter,
    showRunningHeaders: preset.showRunningHeaders,
    showPageNumbers: preset.showPageNumbers,
    startPageOnRecto: preset.startChapterOnRecto,
  };
}

/**
 * Get design presets filtered by category.
 */
export function getPresetsForCategory(category: ProjectCategory): DesignPreset[] {
  return DESIGN_PRESETS.filter(p => p.category === category);
}

/**
 * Get all presets.
 */
export function getAllPresets(): DesignPreset[] {
  return DESIGN_PRESETS;
}
