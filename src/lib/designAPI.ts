// Design and Graphics API integrations
import { generateAIText } from './ai';

export type DesignAsset = {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
};

export type LogoGeneration = {
  primary: string;
  alternative: string;
  icon: string;
  variations: string[];
};

// Use the unified image API for better functionality
import { searchImages } from './imageAPI';

export async function getUnsplashImages(query: string, count: number = 9): Promise<DesignAsset[]> {
  try {
    const images = await searchImages(query, count);
    return images.map((img, index) => ({
      id: img.id,
      url: img.url,
      thumbnail: img.thumbnail,
      title: img.alt,
      description: img.alt,
      category: 'photography',
      tags: [query, img.source]
    }));
  } catch (error) {
    return [];
  }
}


// Google Fonts API integration (free, no API key required)
export async function getGoogleFonts(): Promise<string[]> {
  try {
    const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=your_google_fonts_key');

    if (!response.ok) {
      return getFallbackFonts();
    }

    const data = await response.json();
    return data.items.slice(0, 50).map((font: any) => font.family);
  } catch (error) {
    return getFallbackFonts();
  }
}

function getFallbackFonts(): string[] {
  return [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
    'Oswald', 'Raleway', 'Nunito', 'Ubuntu', 'Playfair Display', 'Merriweather',
    'Poppins', 'Fira Sans', 'Work Sans', 'Barlow', 'Crimson Text', 'Libre Baskerville'
  ];
}

// AI-powered logo generation using image AI
import { generateAIImage } from './ai';

export async function generateLogo(businessName: string, industry: string, style: string): Promise<LogoGeneration> {
  try {
    const prompt = `Create a professional, modern logo for "${businessName}" in the ${industry} industry. Style: ${style}. Clean, memorable, and versatile design suitable for both web and print.`;

    const { imageUrl } = await generateAIImage(prompt);

    if (imageUrl) {
      // Generate variations using different prompts
      const iconPrompt = `Create a simple icon/symbol logo for "${businessName}". Minimal, iconic, works as small favicon.`;
      const { imageUrl: iconUrl } = await generateAIImage(iconPrompt);

      return {
        primary: imageUrl,
        alternative: imageUrl, // Same for now
        icon: iconUrl || imageUrl,
        variations: [imageUrl] // Could generate more variations
      };
    }
  } catch (error) {
    console.log('AI logo generation failed, using fallback');
  }

  // Fallback logo generation
  const initials = businessName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 3);
  const colors = ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#ea580c'];
  const primaryColor = colors[Math.floor(Math.random() * colors.length)];

  return {
    primary: generateSVGLogo(businessName, initials, primaryColor, 'full'),
    alternative: generateSVGLogo(businessName, initials, primaryColor, 'simple'),
    icon: generateSVGLogo(businessName, initials, primaryColor, 'icon'),
    variations: colors.map(color => generateSVGLogo(businessName, initials, color, 'full'))
  };
}

function generateSVGLogo(name: string, initials: string, color: string, type: 'full' | 'simple' | 'icon'): string {
  const svgContent = type === 'icon'
    ? `<circle cx="50" cy="50" r="40" fill="${color}"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="28" font-weight="bold">${initials}</text>`
    : type === 'simple'
      ? `<rect x="10" y="20" width="80" height="60" rx="8" fill="${color}"/><text x="50" y="45" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${initials}</text><text x="50" y="75" text-anchor="middle" fill="${color}" font-size="8">${name}</text>`
      : `<rect x="5" y="10" width="90" height="80" rx="12" fill="${color}" opacity="0.1"/><circle cx="30" cy="35" r="15" fill="${color}"/><text x="30" y="42" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${initials}</text><text x="50" y="45" fill="${color}" font-size="16" font-weight="bold">${name}</text><text x="50" y="65" fill="${color}" font-size="8">Professional Services</text>`;

  return `data:image/svg+xml;base64,${btoa(`<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`)}`;
}

// Color palette generation
export function generateColorPalette(industry: string, mood: string): { primary: string; secondary: string; accent1: string; accent2: string } {
  const palettes = {
    technology: ['#2563eb', '#1e40af', '#3b82f6', '#60a5fa'],
    healthcare: ['#059669', '#047857', '#10b981', '#34d399'],
    finance: ['#1f2937', '#374151', '#6b7280', '#9ca3af'],
    education: ['#7c3aed', '#6d28d9', '#8b5cf6', '#a78bfa'],
    retail: ['#dc2626', '#b91c1c', '#ef4444', '#f87171'],
    default: ['#2563eb', '#7c3aed', '#dc2626', '#059669']
  };

  const colors = palettes[industry as keyof typeof palettes] || palettes.default;

  return {
    primary: colors[0],
    secondary: colors[1],
    accent1: colors[2],
    accent2: colors[3]
  };
}