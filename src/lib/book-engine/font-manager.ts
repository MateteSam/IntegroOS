/**
 * Font Manager for Logo Generator
 * Loads and manages premium fonts from public folder
 */

export interface FontDefinition {
    name: string;
    path: string;
    weight?: string;
    style?: 'normal' | 'italic';
}

export const PREMIUM_FONTS: Record<string, FontDefinition[]> = {
    tech: [
        { name: 'Noffixa', path: '/fonts/corporate-technology-font-noffixa-2025-11-18-19-09-53-utc/WOFF/Noffixa-Regular.woff2', weight: 'normal' },
        { name: 'Kangge', path: '/fonts/ib-kangge-modern-logo-typeface-2025-03-14-19-44-36-utc/Kangge.woff2', weight: 'normal' },
    ],
    luxury: [
        { name: 'Chicago', path: '/fonts/chicago-classy-luxury-logo-font-2024-06-26-22-27-23-utc/Chicago.woff2', weight: 'normal' },
        { name: 'Glisora', path: '/fonts/glisora-modern-elegant-luxury-logo-2025-07-04-19-10-03-utc/GLISORA/Web-TT/GLISORA-Regular.woff2', weight: 'normal' },
        { name: 'Marque', path: '/fonts/marque-luxury-display-font-2023-11-27-05-36-37-utc/Marque.woff2', weight: 'normal' },
    ],
    classic: [
        { name: 'Eleanor', path: '/fonts/elanor-cinematic-elegance-wedding-font-2025-08-06-16-08-49-utc/Eleanor.woff2', weight: 'normal' },
        { name: 'Faniguen', path: '/fonts/elegant-luxury-serif-font-faniguen-2025-11-04-17-39-07-utc/Faniguen.woff2', weight: 'normal' },
    ],
    modern: [
        { name: 'Kangoro', path: '/fonts/kangoro-modern-elegant-luxury-logo-2025-07-13-05-48-17-utc/Kangoro/Web-TT/Kangoro-Regular.woff2', weight: 'normal' },
        { name: 'Glisora', path: '/fonts/glisora-modern-elegant-luxury-logo-2025-07-04-19-10-03-utc/GLISORA/Web-TT/GLISORA-Regular.woff2', weight: 'normal' },
    ],
    playful: [
        { name: 'Aurigle', path: '/fonts/aurigle-2023-11-27-05-35-56-utc/Aurigle.woff2', weight: 'normal' },
    ],
    minimal: [
        { name: 'Noffixa', path: '/fonts/corporate-technology-font-noffixa-2025-11-18-19-09-53-utc/WOFF/Noffixa-Regular.woff2', weight: 'normal' },
    ],
};

let fontsLoaded = false;
const loadedFonts = new Set<string>();

export async function loadPremiumFonts(): Promise<void> {
    if (fontsLoaded) return;

    const fontPromises: Promise<FontFace>[] = [];

    for (const [style, fonts] of Object.entries(PREMIUM_FONTS)) {
        for (const font of fonts) {
            if (loadedFonts.has(font.name)) continue;

            try {
                const fontFace = new FontFace(
                    font.name,
                    `url(${font.path})`,
                    { weight: font.weight || 'normal', style: font.style || 'normal' }
                );

                fontPromises.push(fontFace.load());
                loadedFonts.add(font.name);
            } catch (e) {
                console.warn(`Failed to load font ${font.name}:`, e);
            }
        }
    }

    try {
        const loadedFontFaces = await Promise.all(fontPromises);
        loadedFontFaces.forEach(fontFace => {
            (document.fonts as any).add(fontFace);
        });
        fontsLoaded = true;
        console.log(`[Font Manager] Loaded ${loadedFontFaces.length} premium fonts`);
    } catch (e) {
        console.error('[Font Manager] Error loading fonts:', e);
    }
}

export function getFontForStyle(style: string): string {
    const fonts = PREMIUM_FONTS[style];
    if (!fonts || fonts.length === 0) return 'Inter';

    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
    return randomFont.name;
}
