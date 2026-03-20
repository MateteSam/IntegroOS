import { PageFormat, PageDimensions } from './types';

export const mmToPt = (mm: number) => mm * 2.83465;
export const inToMm = (inch: number) => inch * 25.4;

export const hexToRgb = (hex: string) => {
    const m = hex.replace('#', '');
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    return { r, g, b };
};

export const getContrastRatio = (bg: string, fg: string) => {
    // Simple contrast check helper
    const { r, g, b } = hexToRgb(bg);
    const lum = (c: number) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const L = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
    return (L + 0.05) / 0.05; // Simplified
};

export const escapeXML = (str: string) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

export const getPageDimensions = (format: PageFormat, custom?: { widthMm: number; heightMm: number }): PageDimensions => {
    if (format === 'A4') {
        const widthMm = 210;
        const heightMm = 297;
        return { widthMm, heightMm, widthPx300: Math.round((widthMm / 25.4) * 300), heightPx300: Math.round((heightMm / 25.4) * 300) };
    }
    if (format === 'A5') {
        const widthMm = 148;
        const heightMm = 210;
        return { widthMm, heightMm, widthPx300: Math.round((widthMm / 25.4) * 300), heightPx300: Math.round((heightMm / 25.4) * 300) };
    }
    if (format === 'SixByNine') {
        const widthMm = inToMm(6);
        const heightMm = inToMm(9);
        return { widthMm, heightMm, widthPx300: Math.round((widthMm / 25.4) * 300), heightPx300: Math.round((heightMm / 25.4) * 300) };
    }
    if (format === 'EightHalfByEleven') {
        const widthMm = inToMm(8.5);
        const heightMm = inToMm(11);
        return { widthMm, heightMm, widthPx300: Math.round((widthMm / 25.4) * 300), heightPx300: Math.round((heightMm / 25.4) * 300) };
    }
    if (format === 'Custom' && custom) {
        const { widthMm, heightMm } = custom;
        return { widthMm, heightMm, widthPx300: Math.round((widthMm / 25.4) * 300), heightPx300: Math.round((heightMm / 25.4) * 300) };
    }
    const widthMm = 216;
    const heightMm = 279;
    return { widthMm, heightMm, widthPx300: Math.round((widthMm / 25.4) * 300), heightPx300: Math.round((heightMm / 25.4) * 300) };
};
