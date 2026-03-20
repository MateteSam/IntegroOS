/**
 * SVG Icon Library for Logo Generator
 * Custom SVG paths for professional logo icons
 */

export interface SVGIcon {
    name: string;
    path: string;
    viewBox?: string;
}

export const SVG_ICONS: Record<string, SVGIcon[]> = {
    tech: [
        {
            name: 'circuit',
            path: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.6v8.72c0 4.7-3.07 9.11-8 10.32-4.93-1.21-8-5.62-8-10.32V7.78l8-3.6z M8 10v2h2v-2H8zm4 0v2h2v-2h-2zm-4 4v2h2v-2H8zm4 0v2h2v-2h-2z',
            viewBox: '0 0 24 24'
        },
        {
            name: 'hexagon-network',
            path: 'M12 2L2 8v8l10 6 10-6V8L12 2zm0 2.5L19.5 9v6L12 19.5 4.5 15V9L12 4.5zM12 8l-4 2.5v5L12 18l4-2.5v-5L12 8z',
            viewBox: '0 0 24 24'
        },
        {
            name: 'atom',
            path: 'M12 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
            viewBox: '0 0 24 24'
        },
    ],
    luxury: [
        {
            name: 'crown',
            path: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z',
            viewBox: '0 0 24 24'
        },
        {
            name: 'diamond',
            path: 'M12 2L2 9l10 13L22 9 12 2zm0 3.6L18.4 9H5.6L12 5.6zM6.8 11h10.4l-5.2 6.8L6.8 11z',
            viewBox: '0 0 24 24'
        },
        {
            name: 'shield-star',
            path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v6.2c0 4.7-3.07 9.11-7 10.32-3.93-1.21-7-5.62-7-10.32V6.3l7-3.12zM12 7l-1.5 3-3.5.5 2.5 2.5L9 17l3-1.5L15 17l-.5-4 2.5-2.5-3.5-.5L12 7z',
            viewBox: '0 0 24 24'
        },
    ],
    modern: [
        {
            name: 'layers',
            path: 'M12 3L2 9l10 6 10-6-10-6zm0 2.18L18.18 9 12 12.82 5.82 9 12 5.18zM2 13l10 6 10-6-2-1.2-8 4.8-8-4.8L2 13zm0 4l10 6 10-6-2-1.2-8 4.8-8-4.8L2 17z',
            viewBox: '0 0 24 24'
        },
        {
            name: 'triangle-stack',
            path: 'M12 2L2 12h20L12 2zm0 3.6L17.4 12H6.6L12 5.6zM2 14v8h20v-8H2zm2 2h16v4H4v-4z',
            viewBox: '0 0 24 24'
        },
    ],
    classic: [
        {
            name: 'laurel',
            path: 'M12 2C8.5 2 5.5 4 4 7c0 0 2-1 4-1s4 1 4 1c0 0 2-1 4-1s4 1 4 1c-1.5-3-4.5-5-8-5zm0 8c-2 0-4 1-4 3s2 3 4 3 4-1 4-3-2-3-4-3zm-8 5c0 3 3.5 7 8 7s8-4 8-7c0 0-2 1-4 1s-4-1-4-1-2 1-4 1-4-1-4-1z',
            viewBox: '0 0 24 24'
        },
        {
            name: 'crest',
            path: 'M12 2L4 6v6c0 5 3 9 8 11 5-2 8-6 8-11V6l-8-4zm0 2.5L18 7v5c0 4-2.5 7.5-6 9-3.5-1.5-6-5-6-9V7l6-2.5z',
            viewBox: '0 0 24 24'
        },
    ],
    abstract: [
        {
            name: 'wave',
            path: 'M2 12c0 0 3-4 6-4s4 4 6 4 4-4 6-4 6 4 6 4v8H2v-8z',
            viewBox: '0 0 24 24'
        },
        {
            name: 'spiral',
            path: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm0 2c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z',
            viewBox: '0 0 24 24'
        },
    ],
};

export function getIconForStyle(style: string): SVGIcon | null {
    const icons = SVG_ICONS[style] || SVG_ICONS.modern;
    if (!icons || icons.length === 0) return null;

    return icons[Math.floor(Math.random() * icons.length)];
}

// Synchronous SVG rendering using Path2D
export function renderSVGIcon(
    ctx: CanvasRenderingContext2D,
    icon: SVGIcon,
    x: number,
    y: number,
    size: number,
    color: string
): void {
    ctx.save();

    // Scale and translate to position
    const scale = size / 24; // Assuming 24x24 viewBox
    ctx.translate(x - size / 2, y - size / 2);
    ctx.scale(scale, scale);

    // Create path from SVG path data
    const path = new Path2D(icon.path);

    // Add glow effect first
    ctx.shadowBlur = 40;
    ctx.shadowColor = color;

    // Fill with color
    ctx.fillStyle = color;
    ctx.fill(path);

    // Stroke for definition
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.stroke(path);

    ctx.restore();
}
