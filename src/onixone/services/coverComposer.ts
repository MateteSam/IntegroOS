/**
 * 🎨 Cover Composer — WCCCS Publishing Engine
 *
 * AI-powered cover creation with separate editable text and image layers:
 * - Full-wrap cover (front + spine + back + bleed)
 * - Genre-aware AI cover generation
 * - Text effects integration (gold foil, emboss, etc.)
 * - Barcode/ISBN placement
 * - Spine text auto-sizing
 */

import { BookMetadata } from '../types';
import { TextEffectType, getEffectCss } from './textEffectsEngine';
import { generateBarcodeSVG, formatISBN13 } from './registrationEngine';
import { calculateSpine, KDP_TRIM_SIZES, KDPTrimSize } from './kdpExportEngine';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 COVER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CoverLayer {
  id: string;
  type: 'text' | 'image' | 'shape' | 'barcode';
  name: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

export interface TextCoverLayer extends CoverLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  textEffect: TextEffectType;
  x: number; y: number; width: number; height: number;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
}

export interface ImageCoverLayer extends CoverLayer {
  type: 'image';
  imageUrl: string;          // base64 or URL
  x: number; y: number; width: number; height: number;
  objectFit: 'cover' | 'contain' | 'fill';
  filter?: string;           // CSS filter
  opacity: number;
  borderRadius?: number;
}

export interface ShapeCoverLayer extends CoverLayer {
  type: 'shape';
  shapeType: 'rect' | 'circle' | 'line';
  x: number; y: number; width: number; height: number;
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity: number;
}

export interface BarcodeCoverLayer extends CoverLayer {
  type: 'barcode';
  isbn: string;
  x: number; y: number; width: number; height: number;
}

export type AnyCoverLayer = TextCoverLayer | ImageCoverLayer | ShapeCoverLayer | BarcodeCoverLayer;

export interface CoverDesign {
  id: string;
  name: string;

  // Dimensions
  trimSize: KDPTrimSize;
  pageCount: number;
  paperType: 'white' | 'cream';

  // Background
  backgroundColor: string;
  backgroundImageUrl?: string;
  backgroundGradient?: string;

  // Layers
  layers: AnyCoverLayer[];

  // Metadata
  createdAt: number;
  updatedAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 COVER DIMENSION CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CoverDimensions {
  // Full wrap dimensions (pt)
  totalWidthPt: number;
  totalHeightPt: number;
  // Zone positions (pt)
  backCover: { x: number; y: number; width: number; height: number };
  spine: { x: number; y: number; width: number; height: number };
  frontCover: { x: number; y: number; width: number; height: number };
  // Bleed
  bleedPt: number;
}

export function calculateCoverDimensions(
  trimSize: KDPTrimSize,
  pageCount: number,
  paperType: 'white' | 'cream' = 'white',
): CoverDimensions {
  const spineCalc = calculateSpine(pageCount, trimSize, paperType);
  const bleedPt = 0.125 * 72; // 0.125" in pt

  const totalWidthPt = spineCalc.fullCoverWidthPt;
  const totalHeightPt = spineCalc.fullCoverHeightPt;

  return {
    totalWidthPt,
    totalHeightPt,
    backCover: {
      x: bleedPt,
      y: bleedPt,
      width: trimSize.widthPt,
      height: trimSize.heightPt,
    },
    spine: {
      x: bleedPt + trimSize.widthPt,
      y: bleedPt,
      width: spineCalc.spineWidthPt,
      height: trimSize.heightPt,
    },
    frontCover: {
      x: bleedPt + trimSize.widthPt + spineCalc.spineWidthPt,
      y: bleedPt,
      width: trimSize.widthPt,
      height: trimSize.heightPt,
    },
    bleedPt,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 COVER TEMPLATE CREATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a default cover design with pre-positioned layers.
 */
export function createDefaultCover(
  metadata: BookMetadata,
  pageCount: number,
  trimSize?: KDPTrimSize,
  paperType: 'white' | 'cream' = 'white',
): CoverDesign {
  const ts = trimSize || KDP_TRIM_SIZES[0]; // default 6x9
  const dims = calculateCoverDimensions(ts, pageCount, paperType);

  const layers: AnyCoverLayer[] = [];
  let zIndex = 1;

  // Background image layer (full front cover)
  layers.push({
    id: 'bg-image',
    type: 'image',
    name: 'Background Image',
    visible: true,
    locked: false,
    zIndex: zIndex++,
    imageUrl: '',
    x: dims.frontCover.x,
    y: dims.frontCover.y,
    width: dims.frontCover.width,
    height: dims.frontCover.height,
    objectFit: 'cover',
    opacity: 1,
  });

  // Dark overlay for text readability
  layers.push({
    id: 'overlay',
    type: 'shape',
    name: 'Dark Overlay',
    visible: true,
    locked: false,
    zIndex: zIndex++,
    shapeType: 'rect',
    x: dims.frontCover.x,
    y: dims.frontCover.y,
    width: dims.frontCover.width,
    height: dims.frontCover.height,
    fillColor: 'rgba(0,0,0,0.35)',
    opacity: 1,
  });

  // Title text
  layers.push({
    id: 'title',
    type: 'text',
    name: 'Title',
    visible: true,
    locked: false,
    zIndex: zIndex++,
    text: metadata.title || 'Book Title',
    fontFamily: 'Playfair Display',
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textEffect: 'none',
    x: dims.frontCover.x + 20,
    y: dims.frontCover.y + dims.frontCover.height * 0.25,
    width: dims.frontCover.width - 40,
    height: 100,
    letterSpacing: 0.02,
    textTransform: 'uppercase',
  });

  // Subtitle
  if (metadata.subtitle) {
    layers.push({
      id: 'subtitle',
      type: 'text',
      name: 'Subtitle',
      visible: true,
      locked: false,
      zIndex: zIndex++,
      text: metadata.subtitle,
      fontFamily: 'Open Sans',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#cccccc',
      textAlign: 'center',
      textEffect: 'none',
      x: dims.frontCover.x + 40,
      y: dims.frontCover.y + dims.frontCover.height * 0.45,
      width: dims.frontCover.width - 80,
      height: 40,
    });
  }

  // Author name
  layers.push({
    id: 'author',
    type: 'text',
    name: 'Author',
    visible: true,
    locked: false,
    zIndex: zIndex++,
    text: metadata.authors?.[0] || 'Author Name',
    fontFamily: 'Open Sans',
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    textEffect: 'none',
    x: dims.frontCover.x + 30,
    y: dims.frontCover.y + dims.frontCover.height * 0.75,
    width: dims.frontCover.width - 60,
    height: 30,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  });

  // Spine title (rotated in rendering)
  layers.push({
    id: 'spine-title',
    type: 'text',
    name: 'Spine Title',
    visible: true,
    locked: false,
    zIndex: zIndex++,
    text: metadata.title || 'Title',
    fontFamily: 'Open Sans',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textEffect: 'none',
    x: dims.spine.x,
    y: dims.spine.y + 20,
    width: dims.spine.width,
    height: dims.spine.height - 40,
  });

  // Publisher on spine bottom
  layers.push({
    id: 'spine-publisher',
    type: 'text',
    name: 'Spine Publisher',
    visible: true,
    locked: false,
    zIndex: zIndex++,
    text: metadata.publisher || 'WCCCS',
    fontFamily: 'Open Sans',
    fontSize: 6,
    fontWeight: 'normal',
    color: '#cccccc',
    textAlign: 'center',
    textEffect: 'none',
    x: dims.spine.x,
    y: dims.spine.y + dims.spine.height - 50,
    width: dims.spine.width,
    height: 30,
  });

  // ISBN barcode on back cover
  if (metadata.isbn) {
    layers.push({
      id: 'barcode',
      type: 'barcode',
      name: 'ISBN Barcode',
      visible: true,
      locked: false,
      zIndex: zIndex++,
      isbn: metadata.isbn,
      x: dims.backCover.x + dims.backCover.width - 160,
      y: dims.backCover.y + dims.backCover.height - 100,
      width: 140,
      height: 80,
    });
  }

  return {
    id: `cover-${Date.now()}`,
    name: `${metadata.title || 'Untitled'} Cover`,
    trimSize: ts,
    pageCount,
    paperType,
    backgroundColor: '#0f172a',
    layers,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 GENRE-BASED COVER PALETTES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CoverPalette {
  id: string;
  name: string;
  genres: string[];
  backgroundColor: string;
  titleColor: string;
  authorColor: string;
  accentColor: string;
  titleEffect: TextEffectType;
}

export const COVER_PALETTES: CoverPalette[] = [
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    genres: ['fiction', 'literary', 'thriller'],
    backgroundColor: '#0f172a',
    titleColor: '#d4af37',
    authorColor: '#94a3b8',
    accentColor: '#d4af37',
    titleEffect: 'gold-foil',
  },
  {
    id: 'ivory-classic',
    name: 'Ivory Classic',
    genres: ['memoir', 'biography', 'history'],
    backgroundColor: '#faf8f3',
    titleColor: '#1a1a2e',
    authorColor: '#5c5c7a',
    accentColor: '#8b6914',
    titleEffect: 'emboss',
  },
  {
    id: 'bold-modern',
    name: 'Bold Modern',
    genres: ['business', 'self-help', 'nonfiction'],
    backgroundColor: '#1e1b4b',
    titleColor: '#ffffff',
    authorColor: '#a5b4fc',
    accentColor: '#6366f1',
    titleEffect: 'none',
  },
  {
    id: 'romance-blush',
    name: 'Romance Blush',
    genres: ['romance'],
    backgroundColor: '#4a1a2e',
    titleColor: '#fecdd3',
    authorColor: '#f9a8d4',
    accentColor: '#f472b6',
    titleEffect: 'copper-foil',
  },
  {
    id: 'nature-earth',
    name: 'Nature Earth',
    genres: ['devotional', 'spiritual', 'wellness'],
    backgroundColor: '#1a2e1a',
    titleColor: '#d4e8c1',
    authorColor: '#a3c78f',
    accentColor: '#6d9f4f',
    titleEffect: 'none',
  },
  {
    id: 'children-bright',
    name: 'Children Bright',
    genres: ['children', 'picture-book'],
    backgroundColor: '#1e40af',
    titleColor: '#fbbf24',
    authorColor: '#ffffff',
    accentColor: '#f97316',
    titleEffect: 'none',
  },
  {
    id: 'horror-dark',
    name: 'Horror Dark',
    genres: ['horror', 'dark-fantasy'],
    backgroundColor: '#0a0a0a',
    titleColor: '#dc2626',
    authorColor: '#737373',
    accentColor: '#7f1d1d',
    titleEffect: 'neon',
  },
];

export function recommendCoverPalette(genre: string): CoverPalette {
  const normalised = genre.toLowerCase();
  return COVER_PALETTES.find(p => p.genres.some(g => normalised.includes(g))) || COVER_PALETTES[0];
}
