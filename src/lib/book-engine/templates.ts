import { CoverOptions, PageFormat } from './types';
import { getPageDimensions, hexToRgb, getContrastRatio, escapeXML } from './utils';

export const generateCoverSVG = (opts: CoverOptions): string => {
  const dims = getPageDimensions(opts.format);
  const w = dims.widthPx300;
  const h = dims.heightPx300;
  const bg = opts.colors.primary;
  const fg = opts.colors.secondary;
  const accent = opts.colors.accent1 || '#f59e0b';
  const baseTitleSize = 120;
  const subSize = 48;
  const authorSize = 42;
  const titleLen = (opts.title || '').length;
  const titleSize = Math.max(72, baseTitleSize - Math.max(0, titleLen - 24) * 2);
  const titleAnchor = opts.titleAlign === 'center' ? 'middle' : 'start';
  const titleX = opts.titleAlign === 'center' ? Math.round(w * 0.5) : Math.round(w * 0.08);
  const subtitleX = opts.titleAlign === 'center' ? Math.round(w * 0.5) : Math.round(w * 0.08);
  const authorX = opts.titleAlign === 'center' ? Math.round(w * 0.5) : Math.round(w * 0.08);

  const chooseText = (hexBg: string) => {
    if (hexBg === 'transparent') return '#ffffff';
    const { r, g, b } = hexToRgb(hexBg);
    const lum = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) };
    const L = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
    return L < 0.4 ? '#ffffff' : '#111827';
  };

  const titleFill = opts.autoContrast ? chooseText(bg) : '#ffffff';
  const subtitleFill = opts.autoContrast ? (titleFill === '#ffffff' ? '#cbd5e1' : '#475569') : '#cbd5e1';
  const authorFill = opts.autoContrast ? (titleFill === '#ffffff' ? '#ffffff' : '#0f172a') : '#ffffff';

  const technicalMetadata = `
    <g opacity="0.4" font-family="Monaco, monospace" font-size="24" fill="${titleFill}">
      <text x="${Math.round(w * 0.08)}" y="${Math.round(h * 0.05)}">INT-OS // PROTOCOL v3.0</text>
      <text x="${Math.round(w * 0.92)}" y="${Math.round(h * 0.05)}" text-anchor="end">${new Date().toISOString().split('T')[0]}</text>
      <text x="${Math.round(w * 0.08)}" y="${Math.round(h * 0.96)}">COORD: 32.74 / 15.12</text>
      <text x="${Math.round(w * 0.92)}" y="${Math.round(h * 0.96)}" text-anchor="end">SOVEREIGN SYNDICATION</text>
    </g>
    <path d="M ${Math.round(w * 0.05)} ${Math.round(h * 0.06)} L ${Math.round(w * 0.95)} ${Math.round(h * 0.06)}" stroke="${accent}" stroke-width="1" opacity="0.3" />
    <path d="M ${Math.round(w * 0.05)} ${Math.round(h * 0.94)} L ${Math.round(w * 0.95)} ${Math.round(h * 0.94)}" stroke="${accent}" stroke-width="1" opacity="0.3" />
  `;

  const scanlines = `
    <defs>
      <pattern id="scanlines" width="${w}" height="4" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="${w}" y2="0" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
      </pattern>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.05" />
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#scanlines)" />
    <rect width="${w}" height="${h}" filter="url(#noise)" opacity="0.3" pointer-events="none" />
  `;

  const commonElements = `
    ${technicalMetadata}
    ${scanlines}
    ${opts.guides ? `<rect x="${Math.round(w * 0.03)}" y="${Math.round(h * 0.03)}" width="${Math.round(w * 0.94)}" height="${Math.round(h * 0.94)}" fill="none" stroke="#ef4444" stroke-width="2"/>` : ''}
  `;

  if (opts.template === 'minimal') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="${bg}" />
<rect x="0" y="${Math.round(h * 0.8)}" width="${w}" height="${Math.round(h * 0.2)}" fill="${accent}" opacity="0.9" />
<text x="${titleX}" y="${Math.round(h * 0.35)}" fill="${titleFill}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="700" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.45)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.93)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${commonElements}
</svg>`;
  }
  if (opts.template === 'modern') {
    const bandH = Math.round(h * 0.28);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${bg}" />
<stop offset="100%" stop-color="${accent}" />
</linearGradient>
</defs>
<rect x="0" y="0" width="${w}" height="${h}" fill="${fg}" />
<rect x="0" y="${Math.round(h * 0.18)}" width="${w}" height="${bandH}" fill="url(#g)" opacity="0.85" />
<text x="${titleX}" y="${Math.round(h * 0.35)}" fill="${titleFill}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="800" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.42)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.92)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${commonElements}
</svg>`;
  }
  if (opts.template === 'Sovereign_Avant_Garde') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="${bg}" />
<path d="M ${Math.round(w * 0.4)} 0 L ${w} 0 L ${w} ${h} Z" fill="${accent}" opacity="0.15" />
<rect x="${Math.round(w * 0.08)}" y="${Math.round(h * 0.08)}" width="${Math.round(w * 0.02)}" height="${Math.round(h * 0.84)}" fill="${accent}" />
<text x="${Math.round(w * 0.15)}" y="${Math.round(h * 0.25)}" fill="${titleFill}" font-size="${titleSize * 1.2}" font-family="${opts.fonts.title}" font-weight="900" text-anchor="start" style="letter-spacing:-2px">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${Math.round(w * 0.15)}" y="${Math.round(h * 0.35)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="start" font-style="italic">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${Math.round(w * 0.15)}" y="${Math.round(h * 0.92)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="800" text-anchor="start" style="letter-spacing:4px">${escapeXML(opts.author).toUpperCase()}</text>
${commonElements}
</svg>`;
  }
  if (opts.template === 'Clinical_Luxury') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="${bg}" />
<circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.35}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.4" stroke-dasharray="10 20" />
<circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.45}" fill="none" stroke="${accent}" stroke-width="0.5" opacity="0.2" />
<text x="${w / 2}" y="${h / 2 - 40}" fill="${titleFill}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="300" text-anchor="middle" style="letter-spacing:12px">${escapeXML(opts.title).toUpperCase()}</text>
<rect x="${w / 2 - 100}" y="${h / 2 + 20}" width="200" height="1" fill="${accent}" />
${opts.subtitle ? `<text x="${w / 2}" y="${h / 2 + 80}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="middle" style="letter-spacing:4px">${escapeXML(opts.subtitle).toUpperCase()}</text>` : ''}
<text x="${w / 2}" y="${Math.round(h * 0.9)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="500" text-anchor="middle" style="letter-spacing:4px">${escapeXML(opts.author).toUpperCase()}</text>
${commonElements}
</svg>`;
  }
  if (opts.template === 'big_type') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
<linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${bg}" />
<stop offset="100%" stop-color="${accent}" />
</linearGradient>
</defs>
<rect x="0" y="0" width="${w}" height="${h}" fill="url(#g2)" />
<text x="${titleX}" y="${Math.round(h * 0.4)}" fill="${titleFill}" font-size="${Math.max(titleSize, 140)}" font-family="${opts.fonts.title}" font-weight="800" text-anchor="${titleAnchor}" style="letter-spacing:-4px">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.5)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.94)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${commonElements}
</svg>`;
  }
  if (opts.template === 'split_band') {
    const bandH = Math.round(h * 0.24);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${Math.round(h * 0.38)}" fill="${bg}" />
<rect x="0" y="${Math.round(h * 0.38)}" width="${w}" height="${bandH}" fill="${accent}" />
<rect x="0" y="${Math.round(h * 0.38) + bandH}" width="${w}" height="${h - (Math.round(h * 0.38) + bandH)}" fill="${fg}" />
<text x="${titleX}" y="${Math.round(h * 0.38) + Math.round(bandH * 0.65)}" fill="${getContrastRatio(accent, '#ffffff') >= 4.5 ? '#ffffff' : '#111827'}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="800" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.32)}" fill="${titleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.93)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${commonElements}
</svg>`;
  }
  if (opts.template === 'diagonal_mask') {
    const p1 = `0,${Math.round(h * 0.35)}`;
    const p2 = `${w},${Math.round(h * 0.15)}`;
    const p3 = `${w},0`;
    const p4 = `0,0`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="${fg}" />
<polygon points="${p4} ${p3} ${p2} ${p1}" fill="${bg}" />
<text x="${titleX}" y="${Math.round(h * 0.38)}" fill="${titleFill}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="800" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.48)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.93)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${commonElements}
</svg>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="${bg}" />
<rect x="${Math.round(w * 0.05)}" y="${Math.round(h * 0.05)}" width="${Math.round(w * 0.9)}" height="${Math.round(h * 0.9)}" fill="none" stroke="${accent}" stroke-width="4" />
<text x="${titleX}" y="${Math.round(h * 0.35)}" fill="${titleFill}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="700" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.45)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.9)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${commonElements}
</svg>`;
};
