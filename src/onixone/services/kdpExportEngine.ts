/**
 * 📚 Amazon KDP Export Engine
 * 
 * Generates print-ready PDFs that meet Amazon KDP's strict requirements:
 * - Proper bleed (0.125" / 3.175mm)
 * - Trim size accuracy
 * - Embedded fonts
 * - CMYK color conversion ready
 * - Spine width calculations based on page count
 * - Barcode/ISBN placement
 * - PDF/X-1a compliance
 */

import { BookMetadata, PageSize, DocumentSettings } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 KDP SPECIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const KDP_SPECS = {
  // Bleed requirements
  BLEED_INCHES: 0.125,
  BLEED_MM: 3.175,
  
  // Minimum safe margins from trim edge
  SAFE_MARGIN_INCHES: 0.25,
  SAFE_MARGIN_MM: 6.35,
  
  // Spine width calculation (based on paper type)
  SPINE_WIDTH: {
    WHITE_PAPER: 0.002252, // inches per page
    CREAM_PAPER: 0.0025,   // inches per page
  },
  
  // Barcode placement
  BARCODE: {
    WIDTH: 2.0,    // inches
    HEIGHT: 1.2,   // inches
    MARGIN_FROM_EDGE: 0.25, // inches
  },
  
  // PDF requirements
  PDF: {
    MIN_RESOLUTION: 300, // DPI
    MAX_FILE_SIZE: 650,  // MB
    COLOR_SPACE: 'CMYK' as const,
    PDF_VERSION: 'PDF/X-1a:2001',
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📏 TRIM SIZES (KDP Supported)
// ═══════════════════════════════════════════════════════════════════════════════

export interface KDPTrimSize {
  id: string;
  name: string;
  widthInches: number;
  heightInches: number;
  widthMm: number;
  heightMm: number;
  widthPt: number;
  heightPt: number;
  category: 'standard' | 'large' | 'premium';
  popular: boolean;
}

export const KDP_TRIM_SIZES: KDPTrimSize[] = [
  // Standard sizes
  { id: '6x9', name: 'US Trade (6" x 9")', widthInches: 6, heightInches: 9, widthMm: 152.4, heightMm: 228.6, widthPt: 432, heightPt: 648, category: 'standard', popular: true },
  { id: '5.5x8.5', name: 'Digest (5.5" x 8.5")', widthInches: 5.5, heightInches: 8.5, widthMm: 139.7, heightMm: 215.9, widthPt: 396, heightPt: 612, category: 'standard', popular: true },
  { id: '5x8', name: 'Novel (5" x 8")', widthInches: 5, heightInches: 8, widthMm: 127, heightMm: 203.2, widthPt: 360, heightPt: 576, category: 'standard', popular: true },
  { id: '5.06x7.81', name: 'Royal (5.06" x 7.81")', widthInches: 5.06, heightInches: 7.81, widthMm: 128.5, heightMm: 198.4, widthPt: 364.32, heightPt: 562.32, category: 'standard', popular: false },
  
  // Large sizes
  { id: '7x10', name: 'Large (7" x 10")', widthInches: 7, heightInches: 10, widthMm: 177.8, heightMm: 254, widthPt: 504, heightPt: 720, category: 'large', popular: true },
  { id: '8.5x11', name: 'Letter (8.5" x 11")', widthInches: 8.5, heightInches: 11, widthMm: 215.9, heightMm: 279.4, widthPt: 612, heightPt: 792, category: 'large', popular: false },
  
  // Premium sizes
  { id: '8.5x8.5', name: 'Square (8.5" x 8.5")', widthInches: 8.5, heightInches: 8.5, widthMm: 215.9, heightMm: 215.9, widthPt: 612, heightPt: 612, category: 'premium', popular: true },
  { id: '8.25x6', name: 'Landscape (8.25" x 6")', widthInches: 8.25, heightInches: 6, widthMm: 209.55, heightMm: 152.4, widthPt: 594, heightPt: 432, category: 'premium', popular: false },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 SPINE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SpineCalculation {
  pageCount: number;
  paperType: 'white' | 'cream';
  spineWidthInches: number;
  spineWidthMm: number;
  spineWidthPt: number;
  // Cover dimensions with spine
  fullCoverWidthInches: number;
  fullCoverHeightInches: number;
  fullCoverWidthPt: number;
  fullCoverHeightPt: number;
}

export function calculateSpine(
  pageCount: number,
  trimSize: KDPTrimSize,
  paperType: 'white' | 'cream' = 'white'
): SpineCalculation {
  const multiplier = paperType === 'cream' 
    ? KDP_SPECS.SPINE_WIDTH.CREAM_PAPER 
    : KDP_SPECS.SPINE_WIDTH.WHITE_PAPER;
  
  const spineWidthInches = Math.max(0.055, pageCount * multiplier); // Minimum 0.055"
  const spineWidthMm = spineWidthInches * 25.4;
  const spineWidthPt = spineWidthInches * 72;
  
  // Full cover = back + spine + front + bleed on both sides
  const bleedInches = KDP_SPECS.BLEED_INCHES;
  const fullCoverWidthInches = trimSize.widthInches + spineWidthInches + trimSize.widthInches + (bleedInches * 2);
  const fullCoverHeightInches = trimSize.heightInches + (bleedInches * 2);
  
  return {
    pageCount,
    paperType,
    spineWidthInches,
    spineWidthMm,
    spineWidthPt,
    fullCoverWidthInches,
    fullCoverHeightInches,
    fullCoverWidthPt: fullCoverWidthInches * 72,
    fullCoverHeightPt: fullCoverHeightInches * 72,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📄 INTERIOR PDF SPECIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface KDPInteriorSpec {
  trimSize: KDPTrimSize;
  pageCount: number;
  paperType: 'white' | 'cream';
  bleed: boolean;
  // Calculated values
  pageWidthWithBleedPt: number;
  pageHeightWithBleedPt: number;
  safeMarginPt: number;
  gutterMarginPt: number;
}

export function createInteriorSpec(
  trimSize: KDPTrimSize,
  pageCount: number,
  paperType: 'white' | 'cream' = 'white',
  hasBleed: boolean = false
): KDPInteriorSpec {
  const bleedPt = hasBleed ? KDP_SPECS.BLEED_MM * 2.83465 : 0;
  
  return {
    trimSize,
    pageCount,
    paperType,
    bleed: hasBleed,
    pageWidthWithBleedPt: trimSize.widthPt + (bleedPt * 2),
    pageHeightWithBleedPt: trimSize.heightPt + (bleedPt * 2),
    safeMarginPt: KDP_SPECS.SAFE_MARGIN_MM * 2.83465,
    gutterMarginPt: pageCount > 24 ? 17 : 12, // Larger gutter for thicker books
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 COVER GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

export interface KDPCoverSpec {
  spine: SpineCalculation;
  trimSize: KDPTrimSize;
  barcodePosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  safeZones: {
    front: { x: number; y: number; width: number; height: number };
    back: { x: number; y: number; width: number; height: number };
    spine: { x: number; y: number; width: number; height: number };
  };
}

export function createCoverSpec(
  pageCount: number,
  trimSize: KDPTrimSize,
  paperType: 'white' | 'cream' = 'white'
): KDPCoverSpec {
  const spine = calculateSpine(pageCount, trimSize, paperType);
  const bleedPt = KDP_SPECS.BLEED_INCHES * 72;
  const safeMarginPt = KDP_SPECS.SAFE_MARGIN_INCHES * 72;
  
  // Barcode position (bottom right of back cover, 0.25" from edges)
  const barcodeWidthPt = KDP_SPECS.BARCODE.WIDTH * 72;
  const barcodeHeightPt = KDP_SPECS.BARCODE.HEIGHT * 72;
  const barcodeMarginPt = KDP_SPECS.BARCODE.MARGIN_FROM_EDGE * 72;
  
  const barcodePosition = {
    x: bleedPt + barcodeMarginPt,
    y: bleedPt + barcodeMarginPt,
    width: barcodeWidthPt,
    height: barcodeHeightPt,
  };
  
  // Safe zones for text (inside trim, away from bleed)
  const safeZones = {
    back: {
      x: bleedPt + safeMarginPt,
      y: bleedPt + safeMarginPt,
      width: trimSize.widthPt - (safeMarginPt * 2),
      height: trimSize.heightPt - (safeMarginPt * 2),
    },
    front: {
      x: bleedPt + trimSize.widthPt + spine.spineWidthPt + safeMarginPt,
      y: bleedPt + safeMarginPt,
      width: trimSize.widthPt - (safeMarginPt * 2),
      height: trimSize.heightPt - (safeMarginPt * 2),
    },
    spine: {
      x: bleedPt + trimSize.widthPt,
      y: bleedPt + safeMarginPt,
      width: spine.spineWidthPt,
      height: trimSize.heightPt - (safeMarginPt * 2),
    },
  };
  
  return {
    spine,
    trimSize,
    barcodePosition,
    safeZones,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 METADATA EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export interface KDPMetadata {
  // Book Details
  title: string;
  subtitle?: string;
  series?: string;
  volume?: number;
  edition?: string;
  description: string;
  
  // Contributors
  authors: string[];
  contributors?: Array<{ name: string; role: string }>;
  
  // Publishing
  publisher?: string;
  imprint?: string;
  publicationDate?: string;
  
  // Identifiers
  isbn?: string;
  isbn13?: string;
  
  // Categories
  bisacCodes: string[];
  keywords: string[];
  
  // Pricing
  price?: {
    usd: number;
    gbp?: number;
    eur?: number;
    cad?: number;
    aud?: number;
  };
  
  // Print specs
  printSpecs: {
    trimSize: string;
    pageCount: number;
    paperType: 'white' | 'cream';
    ink: 'black' | 'premium_color' | 'standard_color';
    binding: 'paperback' | 'hardcover';
    finish: 'glossy' | 'matte';
  };
}

export function generateKDPMetadata(
  metadata: BookMetadata,
  pageCount: number,
  trimSize: KDPTrimSize,
  paperType: 'white' | 'cream' = 'white'
): KDPMetadata {
  return {
    title: metadata.title,
    subtitle: metadata.subtitle,
    description: metadata.description || '',
    authors: metadata.authors,
    contributors: [],
    publisher: metadata.publisher,
    imprint: metadata.imprint,
    publicationDate: metadata.publicationDate,
    isbn: metadata.isbn,
    bisacCodes: metadata.bisacCodes || [],
    keywords: metadata.keywords || [],
    printSpecs: {
      trimSize: trimSize.name,
      pageCount,
      paperType,
      ink: 'black',
      binding: 'paperback',
      finish: 'matte',
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 EXPORT PACKAGE
// ═══════════════════════════════════════════════════════════════════════════════

export interface KDPExportPackage {
  interior: {
    pdf: Blob;
    filename: string;
    specs: KDPInteriorSpec;
  };
  cover: {
    pdf: Blob;
    filename: string;
    specs: KDPCoverSpec;
  };
  metadata: KDPMetadata;
  validation: {
    passed: boolean;
    warnings: string[];
    errors: string[];
  };
}

export function validateForKDP(
  pageCount: number,
  trimSize: KDPTrimSize,
  metadata: BookMetadata
): { passed: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Page count validation
  if (pageCount < 24) {
    errors.push(`Page count (${pageCount}) is below KDP minimum of 24 pages`);
  }
  if (pageCount > 828) {
    errors.push(`Page count (${pageCount}) exceeds KDP maximum of 828 pages for paperback`);
  }
  
  // Metadata validation
  if (!metadata.title || metadata.title.length < 1) {
    errors.push('Book title is required');
  }
  if (!metadata.authors || metadata.authors.length === 0) {
    errors.push('At least one author is required');
  }
  if (!metadata.description || metadata.description.length < 10) {
    warnings.push('Description is very short - consider adding more detail for better discoverability');
  }
  if (!metadata.bisacCodes || metadata.bisacCodes.length === 0) {
    warnings.push('No BISAC categories selected - this will affect categorization on Amazon');
  }
  if (!metadata.keywords || metadata.keywords.length === 0) {
    warnings.push('No keywords provided - this will affect searchability on Amazon');
  }
  
  // ISBN validation (optional but recommended)
  if (!metadata.isbn) {
    warnings.push('No ISBN provided - Amazon will assign a free ISBN but it will be Amazon-exclusive');
  }
  
  return {
    passed: errors.length === 0,
    warnings,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateKDPInteriorPDF(
  annotations: any[],
  pageCount: number,
  trimSize: KDPTrimSize,
  paperType: 'white' | 'cream' = 'white'
): Promise<Blob> {
  // This would integrate with your existing PDF generation
  // For now, returning a placeholder
  const spec = createInteriorSpec(trimSize, pageCount, paperType);
  
  // TODO: Implement actual PDF generation using existing layout engine
  // This should:
  // 1. Generate pages at the correct trim size
  // 2. Add bleed if images extend to edge
  // 3. Embed all fonts
  // 4. Set PDF/X-1a compliance
  
  return new Blob(['PDF content placeholder'], { type: 'application/pdf' });
}

export async function generateKDPCoverPDF(
  coverDesign: any,
  pageCount: number,
  trimSize: KDPTrimSize,
  paperType: 'white' | 'cream' = 'white'
): Promise<Blob> {
  const spec = createCoverSpec(pageCount, trimSize, paperType);
  
  // TODO: Implement actual cover PDF generation
  // This should:
  // 1. Generate full cover with spine
  // 2. Include barcode placeholder
  // 3. Add bleed
  // 4. Ensure text is in safe zones
  
  return new Blob(['Cover PDF placeholder'], { type: 'application/pdf' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 BISAC CATEGORIES (Common)
// ═══════════════════════════════════════════════════════════════════════════════

export const COMMON_BISAC_CATEGORIES = [
  { code: 'FIC000000', name: 'Fiction / General' },
  { code: 'FIC027000', name: 'Fiction / Romance / General' },
  { code: 'FIC031000', name: 'Fiction / Thrillers / General' },
  { code: 'FIC022000', name: 'Fiction / Mystery & Detective / General' },
  { code: 'FIC009000', name: 'Fiction / Fantasy / General' },
  { code: 'FIC028000', name: 'Fiction / Science Fiction / General' },
  { code: 'FIC016000', name: 'Fiction / Horror' },
  { code: 'FIC043000', name: 'Fiction / Christian / General' },
  { code: 'NON000000', name: 'Non-Fiction / General' },
  { code: 'SEL000000', name: 'Self-Help / General' },
  { code: 'BUS000000', name: 'Business & Economics / General' },
  { code: 'HEA000000', name: 'Health & Fitness / General' },
  { code: 'COU000000', name: 'Family & Relationships / General' },
  { code: 'JUV000000', name: 'Juvenile Fiction / General' },
  { code: 'YAF000000', name: 'Young Adult Fiction / General' },
  { code: 'POE000000', name: 'Poetry / General' },
  { code: 'DRA000000', name: 'Drama / General' },
  { code: 'COM000000', name: 'Comics & Graphic Novels / General' },
  { code: 'CKB000000', name: 'Cooking / General' },
  { code: 'TRA000000', name: 'Travel / General' },
  { code: 'BIO000000', name: 'Biography & Autobiography / General' },
  { code: 'HIS000000', name: 'History / General' },
  { code: 'REL000000', name: 'Religion / General' },
  { code: 'PHI000000', name: 'Philosophy / General' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 RECOMMENDED SETTINGS BY GENRE
// ═══════════════════════════════════════════════════════════════════════════════

export function getKDPRecommendations(genre: string): {
  trimSize: KDPTrimSize;
  paperType: 'white' | 'cream';
  finish: 'glossy' | 'matte';
} {
  const recommendations: Record<string, { trimId: string; paperType: 'white' | 'cream'; finish: 'glossy' | 'matte' }> = {
    'fiction': { trimId: '6x9', paperType: 'cream', finish: 'matte' },
    'novel': { trimId: '6x9', paperType: 'cream', finish: 'matte' },
    'literary': { trimId: '5.5x8.5', paperType: 'cream', finish: 'matte' },
    'romance': { trimId: '5x8', paperType: 'white', finish: 'glossy' },
    'thriller': { trimId: '5.5x8.5', paperType: 'white', finish: 'glossy' },
    'mystery': { trimId: '5.5x8.5', paperType: 'white', finish: 'glossy' },
    'fantasy': { trimId: '6x9', paperType: 'white', finish: 'glossy' },
    'scifi': { trimId: '6x9', paperType: 'white', finish: 'glossy' },
    'nonfiction': { trimId: '6x9', paperType: 'white', finish: 'matte' },
    'business': { trimId: '6x9', paperType: 'white', finish: 'matte' },
    'self-help': { trimId: '5.5x8.5', paperType: 'white', finish: 'matte' },
    'memoir': { trimId: '5.5x8.5', paperType: 'cream', finish: 'matte' },
    'biography': { trimId: '6x9', paperType: 'white', finish: 'matte' },
    'history': { trimId: '6x9', paperType: 'white', finish: 'matte' },
    'cookbook': { trimId: '8.5x11', paperType: 'white', finish: 'glossy' },
    'children': { trimId: '8.5x8.5', paperType: 'white', finish: 'glossy' },
    'picture': { trimId: '8.5x8.5', paperType: 'white', finish: 'glossy' },
    'devotional': { trimId: '5.5x8.5', paperType: 'cream', finish: 'matte' },
    'religious': { trimId: '5.5x8.5', paperType: 'cream', finish: 'matte' },
    'poetry': { trimId: '5.5x8.5', paperType: 'cream', finish: 'matte' },
    'journal': { trimId: '6x9', paperType: 'white', finish: 'matte' },
    'workbook': { trimId: '8.5x11', paperType: 'white', finish: 'matte' },
    'textbook': { trimId: '8.5x11', paperType: 'white', finish: 'matte' },
  };
  
  const rec = recommendations[genre.toLowerCase()] || recommendations['fiction'];
  const trimSize = KDP_TRIM_SIZES.find(t => t.id === rec.trimId) || KDP_TRIM_SIZES[0];
  
  return {
    trimSize,
    paperType: rec.paperType,
    finish: rec.finish,
  };
}
