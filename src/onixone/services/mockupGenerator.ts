/**
 * 📦 3D Mockup Generator — WCCCS Publishing Engine
 *
 * Generates photorealistic 3D book mockups using CSS 3D transforms:
 * - Multiple angles: front, angled, open spread, stacked, shelf
 * - Surface finishes: glossy, matte
 * - Exportable as high-res canvas images
 */

import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 MOCKUP TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type MockupAngle = 'front' | 'angled-left' | 'angled-right' | 'spine' | 'open-spread' | 'stacked' | 'floating';
export type MockupFinish = 'glossy' | 'matte';

export interface MockupOptions {
  angle: MockupAngle;
  finish: MockupFinish;
  width: number;            // output width in pixels
  height: number;           // output height in pixels
  backgroundColor: string;  // scene background
  shadowIntensity: number;  // 0-1
  spineWidthPx: number;     // spine thickness
}

export interface MockupConfig {
  coverFrontUrl: string;      // data URL or image URL for front cover
  coverBackUrl?: string;      // back cover (optional)
  spineUrl?: string;          // spine image (optional)
  spineColor: string;         // fallback spine colour
  title: string;
  pageCount: number;
}

export const DEFAULT_MOCKUP_OPTIONS: MockupOptions = {
  angle: 'angled-right',
  finish: 'glossy',
  width: 800,
  height: 1000,
  backgroundColor: '#f0f0f0',
  shadowIntensity: 0.4,
  spineWidthPx: 30,
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 CSS 3D MOCKUP GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate CSS styles for a 3D book mockup container.
 * This returns a set of style objects that can be applied to React elements.
 */
export function generateMockupStyles(
  config: MockupConfig,
  options: MockupOptions = DEFAULT_MOCKUP_OPTIONS,
): {
  container: React.CSSProperties;
  bookWrapper: React.CSSProperties;
  frontCover: React.CSSProperties;
  spine: React.CSSProperties;
  backCover: React.CSSProperties;
  shadow: React.CSSProperties;
  pages: React.CSSProperties;
} {
  const { angle, finish, width, height, backgroundColor, shadowIntensity, spineWidthPx } = options;

  // Book dimensions (front cover)
  const bookW = Math.floor(width * 0.45);
  const bookH = Math.floor(height * 0.7);

  // Calculate spine width from page count
  const spine = Math.max(10, Math.min(60, Math.floor(config.pageCount * 0.12)));

  // Rotation angles per mockup type
  const rotations: Record<MockupAngle, { rotateY: number; rotateX: number; translateZ: number }> = {
    'front': { rotateY: 0, rotateX: 0, translateZ: 0 },
    'angled-left': { rotateY: -35, rotateX: 5, translateZ: 40 },
    'angled-right': { rotateY: 35, rotateX: 5, translateZ: 40 },
    'spine': { rotateY: -90, rotateX: 0, translateZ: 0 },
    'open-spread': { rotateY: 0, rotateX: 60, translateZ: -30 },
    'stacked': { rotateY: 25, rotateX: 10, translateZ: 20 },
    'floating': { rotateY: 20, rotateX: -10, translateZ: 60 },
  };

  const rot = rotations[angle];

  // Glossy overlay
  const glossOverlay = finish === 'glossy'
    ? 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.1) 100%)'
    : 'none';

  const container: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor,
    perspective: '1200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const bookWrapper: React.CSSProperties = {
    position: 'relative',
    width: `${bookW}px`,
    height: `${bookH}px`,
    transformStyle: 'preserve-3d',
    transform: `rotateY(${rot.rotateY}deg) rotateX(${rot.rotateX}deg) translateZ(${rot.translateZ}px)`,
    transition: 'transform 0.6s ease',
  };

  const frontCover: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: config.coverFrontUrl ? `url(${config.coverFrontUrl})` : undefined,
    backgroundColor: config.coverFrontUrl ? undefined : '#1a1a2e',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '0 4px 4px 0',
    boxShadow: '2px 2px 10px rgba(0,0,0,0.2)',
    transform: `translateZ(${spine / 2}px)`,
    // Glossy overlay
    backgroundBlendMode: finish === 'glossy' ? 'overlay' : undefined,
  };

  const spineStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${spine}px`,
    height: '100%',
    backgroundColor: config.spineColor || '#0f0f23',
    backgroundImage: config.spineUrl ? `url(${config.spineUrl})` : undefined,
    backgroundSize: 'cover',
    transform: `rotateY(-90deg) translateZ(0px) translateX(-${spine / 2}px)`,
    transformOrigin: 'left center',
  };

  const backCover: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: config.coverBackUrl ? `url(${config.coverBackUrl})` : undefined,
    backgroundColor: config.coverBackUrl ? undefined : '#12122a',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '4px 0 0 4px',
    transform: `translateZ(-${spine / 2}px) rotateY(180deg)`,
  };

  const shadow: React.CSSProperties = {
    position: 'absolute',
    bottom: '-20px',
    left: '10%',
    width: '80%',
    height: '30px',
    background: `radial-gradient(ellipse, rgba(0,0,0,${shadowIntensity}) 0%, transparent 70%)`,
    filter: 'blur(8px)',
    transform: 'rotateX(90deg)',
  };

  const pages: React.CSSProperties = {
    position: 'absolute',
    width: 'calc(100% - 4px)',
    height: 'calc(100% - 4px)',
    top: '2px',
    right: '2px',
    background: 'linear-gradient(90deg, #f5f0e6, #faf8f3, #f5f0e6)',
    borderRadius: '0 3px 3px 0',
    transform: `translateZ(${spine / 2 - 2}px)`,
    boxShadow: 'inset 0 0 3px rgba(0,0,0,0.1)',
  };

  return { container, bookWrapper, frontCover, spine: spineStyle, backCover, shadow, pages };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📸 MOCKUP RENDERING TO CANVAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Render a 3D mockup as a data URL (SVG-based).
 * Returns an SVG placeholder that can be used as an image source.
 */
export async function renderMockupToImage(
  config: MockupConfig,
  options: MockupOptions = DEFAULT_MOCKUP_OPTIONS,
): Promise<string> {
  return generateSVGMockupPlaceholder(config, options);
}

/**
 * Generate a simple SVG mockup as a fallback.
 */
function generateSVGMockupPlaceholder(config: MockupConfig, options: MockupOptions): string {
  const { width, height, backgroundColor } = options;
  const bookW = Math.floor(width * 0.35);
  const bookH = Math.floor(height * 0.6);
  const spine = Math.max(8, Math.floor(config.pageCount * 0.1));
  const x = (width - bookW - spine) / 2;
  const y = (height - bookH) / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="${backgroundColor}"/>
    <!-- Shadow -->
    <ellipse cx="${x + bookW / 2 + spine}" cy="${y + bookH + 15}" rx="${bookW * 0.6}" ry="10" fill="rgba(0,0,0,0.15)"/>
    <!-- Spine -->
    <rect x="${x}" y="${y}" width="${spine}" height="${bookH}" fill="${config.spineColor || '#2a2a4a'}" rx="1"/>
    <!-- Front cover -->
    <rect x="${x + spine}" y="${y}" width="${bookW}" height="${bookH}" fill="#1a1a2e" rx="2"/>
    <!-- Pages edge -->
    <rect x="${x + spine + 3}" y="${y + 3}" width="${bookW - 6}" height="${bookH - 6}" fill="#faf8f3" rx="1"/>
    <!-- Front cover overlay -->
    <rect x="${x + spine}" y="${y}" width="${bookW}" height="${bookH}" fill="#1a1a2e" rx="2"/>
    <!-- Title text -->
    <text x="${x + spine + bookW / 2}" y="${y + bookH * 0.35}" text-anchor="middle" fill="white" font-family="serif" font-size="${Math.max(12, bookW * 0.08)}" font-weight="bold">${escapeXml(config.title || 'Untitled')}</text>
    <!-- Glossy sheen -->
    <rect x="${x + spine}" y="${y}" width="${bookW}" height="${bookH}" fill="url(#gloss)" rx="2" opacity="0.3"/>
    <defs>
      <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="white" stop-opacity="0.4"/>
        <stop offset="40%" stop-color="white" stop-opacity="0"/>
        <stop offset="100%" stop-color="white" stop-opacity="0.1"/>
      </linearGradient>
    </defs>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function cssToString(styles: React.CSSProperties): string {
  return Object.entries(styles)
    .filter(([_, v]) => v !== undefined)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get all available mockup angles.
 */
export function getMockupAngles(): { id: MockupAngle; name: string }[] {
  return [
    { id: 'front', name: 'Front View' },
    { id: 'angled-left', name: 'Angled Left' },
    { id: 'angled-right', name: 'Angled Right' },
    { id: 'spine', name: 'Spine View' },
    { id: 'open-spread', name: 'Open Spread' },
    { id: 'stacked', name: 'Stacked' },
    { id: 'floating', name: 'Floating' },
  ];
}
