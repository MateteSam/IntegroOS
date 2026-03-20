// Client-side brand asset generator that creates real, usable outputs
import type { BrandRequest, ServerResponse } from './api';
import { generateAIImage } from './ai';
import { cache } from './cacheManager';

// Very small color helper
const cssNamedToHex: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#10b981', yellow: '#f59e0b',
  purple: '#8b5cf6', pink: '#ec4899', orange: '#f97316', teal: '#14b8a6',
  cyan: '#06b6d4', rose: '#f43f5e', lime: '#84cc16', amber: '#f59e0b',
  indigo: '#6366f1', emerald: '#10b981', slate: '#64748b', zinc: '#71717a',
};

function pickPalette(input: string[]): { primary: string; secondary: string; accent1: string; accent2: string } {
  const cleaned = input.map(s => s.toLowerCase().replace(/[^a-z]/g, ''));
  const toHex = (c: string) => cssNamedToHex[c] || '#6366f1';
  const p = toHex(cleaned[0] || 'indigo');
  const s = toHex(cleaned[1] || 'purple');
  const a1 = toHex(cleaned[2] || 'pink');
  const a2 = toHex(cleaned[3] || 'cyan');
  return { primary: p, secondary: s, accent1: a1, accent2: a2 };
}

function svgToDataUrl(svg: string): string {
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function makeSVGLogo(text: string, bg: string, fg = '#ffffff', rounded = 16, variant: 'primary' | 'alt' | 'icon' = 'primary'): string {
  const [w, h] = variant === 'icon' ? [256, 256] : [1024, 512];
  const fontSize = variant === 'icon' ? 96 : 144;
  const initials = (text || 'NC').split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${rounded}" fill="url(#g)"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 5}" fill="${fg}" opacity="0.08"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-family="Inter, ui-sans-serif" font-size="${fontSize}" font-weight="700">${initials}</text>
  </svg>`;
  return svgToDataUrl(body);
}

// Generate brand assets with AI logo generation
export async function generateBrandAssets(payload: BrandRequest): Promise<ServerResponse> {
  const colors = pickPalette(payload.colors);
  const headingFont = 'Inter';
  const bodyFont = 'Inter';

  // Try AI logo generation first
  const cacheKey = `logo-${payload.businessName}-${payload.industry}`;
  let primaryLogo: string;
  let altLogo: string;
  let iconLogo: string;

  const cachedLogos = cache.get<{ primary: string; alt: string; icon: string }>(cacheKey);

  if (cachedLogos) {
    primaryLogo = cachedLogos.primary;
    altLogo = cachedLogos.alt;
    iconLogo = cachedLogos.icon;
  } else {
    try {
      const logoPrompt = `Create a professional, modern logo for a business called "${payload.businessName}" in the ${payload.industry} industry. Style: ${payload.brandPersonality}. The logo should be clean, memorable, and work well at different sizes. Include the business name in an elegant font.`;

      const aiLogo = await generateAIImage(logoPrompt);

      if (aiLogo.imageUrl) {
        primaryLogo = aiLogo.imageUrl;
        altLogo = aiLogo.imageUrl; // Use same AI logo for alt

        // Generate icon version
        const iconPrompt = `Create a simple, iconic symbol logo for "${payload.businessName}". Just the icon/symbol, no text. Minimalist, memorable, and works as a small favicon or app icon.`;
        const aiIcon = await generateAIImage(iconPrompt);
        // REBUKE FALLBACK: Do not use makeSVGLogo if icon fails, use primary logo or throw
        iconLogo = aiIcon.imageUrl || primaryLogo;

        cache.set(cacheKey, { primary: primaryLogo, alt: altLogo, icon: iconLogo }, 1000 * 60 * 60); // 1 hour
      } else {
        // REBUKE FALLBACK: Do not return basic shapes
        throw new Error('AI Logo Synthesis Failed: No image returned from providers.');
      }
    } catch (error: any) {
      console.error('AI logo generation failed:', error.message);
      // REBUKE FALLBACK: Pass the error up instead of generating placeholders
      throw new Error(`Critical Synthesis Error: ${error.message}`);
    }
  }

  const voiceMap: Record<string, { tone: string[]; keywords: string[] }> = {
    Professional: { tone: ['confident', 'clear', 'authoritative'], keywords: ['trust', 'quality', 'results'] },
    Creative: { tone: ['imaginative', 'friendly', 'inspiring'], keywords: ['original', 'bold', 'fresh'] },
    Friendly: { tone: ['warm', 'helpful', 'approachable'], keywords: ['community', 'support', 'care'] },
    Luxury: { tone: ['refined', 'exclusive', 'elegant'], keywords: ['premium', 'craft', 'prestige'] },
    Modern: { tone: ['innovative', 'minimal', 'smart'], keywords: ['tech', 'efficiency', 'growth'] },
    Playful: { tone: ['fun', 'energetic', 'optimistic'], keywords: ['joy', 'vibrant', 'bold'] },
  };
  const voice = voiceMap[payload.brandPersonality as keyof typeof voiceMap] || voiceMap.Modern;

  return {
    success: true,
    assets: {
      logo: {
        primary: primaryLogo,
        alternative: altLogo,
        icon: iconLogo,
      },
      colors,
      typography: { headingFont, bodyFont },
      brandGuidelines: {
        mission: payload.mission || 'Deliver exceptional value to our customers.',
        values: payload.values.length ? payload.values : ['Innovation', 'Trust', 'Excellence'],
        voice: {
          personality: payload.brandPersonality || 'Modern',
          tone: voice.tone,
          keywords: voice.keywords,
        },
        targetAudience: payload.targetAudience ? [payload.targetAudience] : ['General Audience'],
        brandPromise: `${payload.businessName || 'Our brand'} stands for quality, clarity, and outcomes.`,
        usage: {
          primary: 'Primary brand mark for all official and large-display use.',
          alternative: 'Use on dark/light backgrounds or tight spaces as needed.',
          icon: 'Favicon, app icon, and social avatars.',
        },
      },
    },
  };
}

// Legacy sync version for backward compatibility
export function localGenerateBrandAssets(payload: BrandRequest): ServerResponse {
  const colors = pickPalette(payload.colors);
  const headingFont = 'Inter';
  const bodyFont = 'Inter';

  const primaryLogo = makeSVGLogo(payload.businessName, colors.primary, '#ffffff', 24, 'primary');
  const altLogo = makeSVGLogo(payload.businessName, colors.secondary, '#ffffff', 24, 'alt');
  const iconLogo = makeSVGLogo(payload.businessName, colors.accent1, '#ffffff', 32, 'icon');

  const voiceMap: Record<string, { tone: string[]; keywords: string[] }> = {
    Professional: { tone: ['confident', 'clear', 'authoritative'], keywords: ['trust', 'quality', 'results'] },
    Creative: { tone: ['imaginative', 'friendly', 'inspiring'], keywords: ['original', 'bold', 'fresh'] },
    Friendly: { tone: ['warm', 'helpful', 'approachable'], keywords: ['community', 'support', 'care'] },
    Luxury: { tone: ['refined', 'exclusive', 'elegant'], keywords: ['premium', 'craft', 'prestige'] },
    Modern: { tone: ['innovative', 'minimal', 'smart'], keywords: ['tech', 'efficiency', 'growth'] },
    Playful: { tone: ['fun', 'energetic', 'optimistic'], keywords: ['joy', 'vibrant', 'bold'] },
  };
  const voice = voiceMap[payload.brandPersonality as keyof typeof voiceMap] || voiceMap.Modern;

  return {
    success: true,
    assets: {
      logo: {
        primary: primaryLogo,
        alternative: altLogo,
        icon: iconLogo,
      },
      colors,
      typography: { headingFont, bodyFont },
      brandGuidelines: {
        mission: payload.mission || 'Deliver exceptional value to our customers.',
        values: payload.values.length ? payload.values : ['Innovation', 'Trust', 'Excellence'],
        voice: {
          personality: payload.brandPersonality || 'Modern',
          tone: voice.tone,
          keywords: voice.keywords,
        },
        targetAudience: payload.targetAudience ? [payload.targetAudience] : ['General Audience'],
        brandPromise: `${payload.businessName || 'Our brand'} stands for quality, clarity, and outcomes.`,
        usage: {
          primary: 'Primary brand mark for all official and large-display use.',
          alternative: 'Use on dark/light backgrounds or tight spaces as needed.',
          icon: 'Favicon, app icon, and social avatars.',
        },
      },
    },
  };
}
