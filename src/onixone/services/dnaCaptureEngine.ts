/**
 * 🧬 DNA Capture Engine — WCCCS Publishing Engine
 *
 * Extracts the complete "Design DNA" from reference files (PDF, DOCX, images, etc.)
 * so that the design can be replicated with 100% accuracy on new content.
 *
 * DNA includes: page dimensions, margins, font families/sizes, line heights,
 * heading styles, colour palette, image placement patterns, ornament usage.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { ParagraphStyle, FontPairing, FONT_PAIRINGS, createStyleSheet, StyleSheet } from './typographyEngine';
import { MarginSet, PageSpec } from './compositionEngine';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 DESIGN DNA TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DesignDNA {
  id: string;
  name: string;
  source: string;              // origin filename
  capturedAt: number;          // timestamp
  confidence: number;          // 0-1

  // Page geometry
  pageSpec: {
    widthPt: number;
    heightPt: number;
    margins: MarginSet;
    columns: number;
    columnGapPt: number;
  };

  // Typography
  typography: {
    bodyFont: string;
    bodyFontSize: number;
    bodyLineHeight: number;
    bodyTextAlign: 'left' | 'center' | 'right' | 'justify';
    headingFont: string;
    headingFontSize: number;
    headingTextAlign: 'left' | 'center' | 'right';
    headingIsUppercase: boolean;
    textIndent: number;
    quoteFont?: string;
    quoteFontSize?: number;
    captionFont?: string;
  };

  // Colours
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    textColor: string;
    backgroundColor: string;
  };

  // Layout patterns
  layout: {
    chapterStartsOnRecto: boolean;
    chapterSinkDepthPercent: number;   // 0-50 (% of page height before chapter title)
    dropCapEnabled: boolean;
    dropCapLines: number;
    sectionBreakStyle: 'ornament' | 'line' | 'blank' | 'none';
    sectionBreakCharacter: string;
    hasRunningHeaders: boolean;
    hasPageNumbers: boolean;
    pageNumberPosition: 'bottom-center' | 'bottom-outside' | 'top-outside';
  };

  // Ornaments & decorative elements
  ornaments: {
    chapterDivider: string;       // text or character used
    sectionDivider: string;
    usesFleurons: boolean;
    decorativeStyle: string;     // "classical", "modern", "minimal", "ornate"
  };

  // Image handling
  imageRules: {
    defaultWidthRatio: number;    // 0-1 of content width
    alignment: 'left' | 'center' | 'right';
    hasCaptions: boolean;
    captionPosition: 'above' | 'below';
    borderStyle: 'none' | 'thin' | 'shadow';
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧬 DNA LIBRARY (In-Memory Store)
// ═══════════════════════════════════════════════════════════════════════════════

const dnaLibrary: DesignDNA[] = [];

export function saveDNA(dna: DesignDNA): void {
  const existing = dnaLibrary.findIndex(d => d.id === dna.id);
  if (existing >= 0) {
    dnaLibrary[existing] = dna;
  } else {
    dnaLibrary.push(dna);
  }
  // Persist to localStorage
  try {
    localStorage.setItem('wcccs_dna_library', JSON.stringify(dnaLibrary));
  } catch { /* silently fail if no localStorage */ }
}

export function loadDNALibrary(): DesignDNA[] {
  if (dnaLibrary.length > 0) return dnaLibrary;
  try {
    const stored = localStorage.getItem('wcccs_dna_library');
    if (stored) {
      const parsed = JSON.parse(stored) as DesignDNA[];
      dnaLibrary.length = 0;
      dnaLibrary.push(...parsed);
    }
  } catch { /* silently fail */ }
  return dnaLibrary;
}

export function getDNA(id: string): DesignDNA | undefined {
  return loadDNALibrary().find(d => d.id === id);
}

export function deleteDNA(id: string): void {
  const idx = dnaLibrary.findIndex(d => d.id === id);
  if (idx >= 0) {
    dnaLibrary.splice(idx, 1);
    try {
      localStorage.setItem('wcccs_dna_library', JSON.stringify(dnaLibrary));
    } catch { /* silently fail */ }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔬 DNA EXTRACTION (from AI analysis)
// ═══════════════════════════════════════════════════════════════════════════════

declare const process: { env: { API_KEY?: string; GEMINI_API_KEY?: string } };

function getAI() {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey.length < 10) throw new Error('AI API key required for DNA capture');
  return new GoogleGenAI({ apiKey });
}

/**
 * Extract Design DNA from an image (screenshot, photo of a book page, Canva export, etc.)
 * Uses Gemini Vision to analyse the layout and typography.
 */
export async function captureDNAFromImage(
  imageBase64: string,
  filename: string,
): Promise<DesignDNA> {
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.replace(/^data:image\/[^;]+;base64,/, ''),
            },
          },
          {
            text: `You are a professional book designer. Analyze this page image and extract every visual design detail.

Return a JSON object with:
{
  "bodyFont": string (closest Google Font name),
  "bodyFontSize": number (in pt, estimated),
  "bodyLineHeight": number (multiplier like 1.5),
  "bodyTextAlign": "left" | "justify",
  "headingFont": string,
  "headingFontSize": number,
  "headingTextAlign": "left" | "center",
  "headingIsUppercase": boolean,
  "textIndent": number (in pt, 0 if none),
  "primaryColor": string (hex),
  "secondaryColor": string (hex),
  "accentColor": string (hex),
  "textColor": string (hex),
  "backgroundColor": string (hex),
  "columns": number,
  "hasDropCap": boolean,
  "dropCapLines": number,
  "hasRunningHeaders": boolean,
  "hasPageNumbers": boolean,
  "sectionBreakStyle": "ornament" | "line" | "blank" | "none",
  "chapterStartsOnRecto": boolean,
  "chapterSinkPercent": number (0-50),
  "decorativeStyle": "classical" | "modern" | "minimal" | "ornate",
  "imageAlignment": "left" | "center" | "right",
  "confidence": number (0-1)
}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
    },
  });

  const analysis = JSON.parse(response.text ?? '{}');

  const dna: DesignDNA = {
    id: `dna-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: filename.replace(/\.[^.]+$/, ''),
    source: filename,
    capturedAt: Date.now(),
    confidence: analysis.confidence || 0.7,
    pageSpec: {
      widthPt: 419.53,      // A5 default — can be refined
      heightPt: 595.28,
      margins: { top: 72, bottom: 54, inner: 72, outer: 54 },
      columns: analysis.columns || 1,
      columnGapPt: 14,
    },
    typography: {
      bodyFont: analysis.bodyFont || 'EB Garamond',
      bodyFontSize: analysis.bodyFontSize || 11,
      bodyLineHeight: analysis.bodyLineHeight || 1.6,
      bodyTextAlign: analysis.bodyTextAlign || 'justify',
      headingFont: analysis.headingFont || 'Playfair Display',
      headingFontSize: analysis.headingFontSize || 24,
      headingTextAlign: analysis.headingTextAlign || 'center',
      headingIsUppercase: analysis.headingIsUppercase || false,
      textIndent: analysis.textIndent || 18,
    },
    palette: {
      primary: analysis.primaryColor || '#1a1a1a',
      secondary: analysis.secondaryColor || '#4a4a4a',
      accent: analysis.accentColor || '#8b6914',
      textColor: analysis.textColor || '#1a1a1a',
      backgroundColor: analysis.backgroundColor || '#faf8f5',
    },
    layout: {
      chapterStartsOnRecto: analysis.chapterStartsOnRecto ?? true,
      chapterSinkDepthPercent: analysis.chapterSinkPercent || 25,
      dropCapEnabled: analysis.hasDropCap || false,
      dropCapLines: analysis.dropCapLines || 3,
      sectionBreakStyle: analysis.sectionBreakStyle || 'ornament',
      sectionBreakCharacter: '***',
      hasRunningHeaders: analysis.hasRunningHeaders ?? true,
      hasPageNumbers: analysis.hasPageNumbers ?? true,
      pageNumberPosition: 'bottom-outside',
    },
    ornaments: {
      chapterDivider: '✦',
      sectionDivider: '***',
      usesFleurons: analysis.decorativeStyle === 'classical' || analysis.decorativeStyle === 'ornate',
      decorativeStyle: analysis.decorativeStyle || 'modern',
    },
    imageRules: {
      defaultWidthRatio: 0.8,
      alignment: analysis.imageAlignment || 'center',
      hasCaptions: true,
      captionPosition: 'below',
      borderStyle: 'none',
    },
  };

  saveDNA(dna);
  return dna;
}

/**
 * Extract Design DNA from a PDF by analysing text content.
 * Uses the AI to understand formatting from textual cues.
 */
export async function captureDNAFromText(
  textContent: string,
  filename: string,
): Promise<DesignDNA> {
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Analyze this document text and infer the design/typography conventions used.
Look for:
- Heading styles (uppercase? bold? centred?)
- Body text patterns (indented first line? justified?)
- Drop caps
- Section break markers (*** or ornaments)
- Chapter numbering patterns

Document:
---
${textContent.substring(0, 20000)}
---

Return a JSON object:
{
  "bodyFont": string (suggest best Google Font),
  "bodyFontSize": number,
  "bodyLineHeight": number,
  "bodyTextAlign": "left" | "justify",
  "headingFont": string,
  "headingFontSize": number,
  "headingTextAlign": "left" | "center",
  "headingIsUppercase": boolean,
  "textIndent": number,
  "decorativeStyle": "classical" | "modern" | "minimal" | "ornate",
  "sectionBreakStyle": "ornament" | "line" | "blank" | "none",
  "hasDropCap": boolean,
  "dropCapLines": number,
  "chapterSinkPercent": number,
  "confidence": number
}`,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const analysis = JSON.parse(response.text ?? '{}');

  const dna: DesignDNA = {
    id: `dna-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: filename.replace(/\.[^.]+$/, ''),
    source: filename,
    capturedAt: Date.now(),
    confidence: analysis.confidence || 0.5,
    pageSpec: {
      widthPt: 419.53,
      heightPt: 595.28,
      margins: { top: 72, bottom: 54, inner: 72, outer: 54 },
      columns: 1,
      columnGapPt: 14,
    },
    typography: {
      bodyFont: analysis.bodyFont || 'EB Garamond',
      bodyFontSize: analysis.bodyFontSize || 11,
      bodyLineHeight: analysis.bodyLineHeight || 1.6,
      bodyTextAlign: analysis.bodyTextAlign || 'justify',
      headingFont: analysis.headingFont || 'Playfair Display',
      headingFontSize: analysis.headingFontSize || 24,
      headingTextAlign: analysis.headingTextAlign || 'center',
      headingIsUppercase: analysis.headingIsUppercase || false,
      textIndent: analysis.textIndent || 18,
    },
    palette: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
      accent: '#8b6914',
      textColor: '#1a1a1a',
      backgroundColor: '#faf8f5',
    },
    layout: {
      chapterStartsOnRecto: true,
      chapterSinkDepthPercent: analysis.chapterSinkPercent || 25,
      dropCapEnabled: analysis.hasDropCap || false,
      dropCapLines: analysis.dropCapLines || 3,
      sectionBreakStyle: analysis.sectionBreakStyle || 'ornament',
      sectionBreakCharacter: '***',
      hasRunningHeaders: true,
      hasPageNumbers: true,
      pageNumberPosition: 'bottom-outside',
    },
    ornaments: {
      chapterDivider: '✦',
      sectionDivider: '***',
      usesFleurons: analysis.decorativeStyle === 'classical',
      decorativeStyle: analysis.decorativeStyle || 'modern',
    },
    imageRules: {
      defaultWidthRatio: 0.8,
      alignment: 'center',
      hasCaptions: true,
      captionPosition: 'below',
      borderStyle: 'none',
    },
  };

  saveDNA(dna);
  return dna;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 DNA → STYLESHEET CONVERSION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert a captured DesignDNA into a StyleSheet usable by the Composition Engine.
 */
export function dnaToStyleSheet(dna: DesignDNA): StyleSheet {
  // Start with the closest genre stylesheet then override with DNA values
  const base = createStyleSheet('book');

  // Override body style
  const body = base.styles['body'];
  body.fontFamily = dna.typography.bodyFont;
  body.fontSize = dna.typography.bodyFontSize;
  body.lineHeight = dna.typography.bodyLineHeight;
  body.textAlign = dna.typography.bodyTextAlign;
  body.textIndent = dna.typography.textIndent;
  body.color = dna.palette.textColor;

  // Override body-first
  const bodyFirst = base.styles['body-first'];
  bodyFirst.fontFamily = dna.typography.bodyFont;
  bodyFirst.fontSize = dna.typography.bodyFontSize;
  bodyFirst.lineHeight = dna.typography.bodyLineHeight;
  bodyFirst.textAlign = dna.typography.bodyTextAlign;
  bodyFirst.textIndent = 0;
  bodyFirst.color = dna.palette.textColor;

  // Setup drop cap
  if (dna.layout.dropCapEnabled) {
    bodyFirst.dropCap = {
      enabled: true,
      lines: dna.layout.dropCapLines,
      marginRight: 4,
      style: 'drop',
    };
  }

  // Override heading styles
  const h1 = base.styles['heading-1'];
  h1.fontFamily = dna.typography.headingFont;
  h1.fontSize = dna.typography.headingFontSize;
  h1.textAlign = dna.typography.headingTextAlign as any;
  h1.color = dna.palette.primary;
  h1.textTransform = dna.typography.headingIsUppercase ? 'uppercase' : 'none';
  h1.marginTop = (dna.layout.chapterSinkDepthPercent / 100) * dna.pageSpec.heightPt;

  const h2 = base.styles['heading-2'];
  h2.fontFamily = dna.typography.headingFont;
  h2.color = dna.palette.primary;

  // Override running header
  const rh = base.styles['running-header'];
  rh.fontFamily = dna.typography.bodyFont;

  // Override page number
  const pn = base.styles['page-number'];
  pn.fontFamily = dna.typography.bodyFont;

  // Find closest font pairing
  const matchedPairing = FONT_PAIRINGS.find(
    p => p.heading === dna.typography.headingFont || p.body === dna.typography.bodyFont
  ) || FONT_PAIRINGS[0];

  return {
    ...base,
    id: `dna-${dna.id}`,
    name: `DNA: ${dna.name}`,
    fontPairing: matchedPairing,
  };
}

/**
 * Convert DNA to CompositionOptions overrides for the compositor.
 */
export function dnaToPageSpec(dna: DesignDNA): PageSpec {
  return {
    widthPt: dna.pageSpec.widthPt,
    heightPt: dna.pageSpec.heightPt,
    margins: dna.pageSpec.margins,
    columns: dna.pageSpec.columns,
    columnGapPt: dna.pageSpec.columnGapPt,
  };
}
