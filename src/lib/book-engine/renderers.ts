import { PageFormat } from './types';
import { getPageDimensions } from './utils';

export const renderCoverPNG300DPI = async (svg: string, format: PageFormat): Promise<string> => {
    const dims = getPageDimensions(format);
    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('cover image failed to load'));
        img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = dims.widthPx300;
    canvas.height = dims.heightPx300;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    return canvas.toDataURL('image/png');
};

/**
 * Helper for high-fidelity spec rendering (Nano Banana Engine)
 * Merged from aiClient.ts for consistency in the engine.
 */
export async function renderSpecToDataUri(specStr: string, width = 1024, height = 1024): Promise<string> {
    try {
        const spec = JSON.parse(specStr);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        // 1. Background (Cinematic Depth with Vignette)
        const p = spec.palette || ['#000000', '#0F172A'];
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, p[0]);
        grad.addColorStop(0.4, p[1] || p[0]);
        grad.addColorStop(1, p[0]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        const vignette = ctx.createRadialGradient(width / 2, height / 2, width / 3, width / 2, height / 2, width);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // 2. Surgical elements (Pro-tier Geometry with Glow)
        ctx.globalAlpha = 1.0;
        (spec.elements || []).forEach((el: any) => {
            const ex = el.x <= 1 ? el.x * width : el.x;
            const ey = el.y <= 1 ? el.y * height : el.y;
            const ew = el.w <= 1 ? el.w * width : el.w;
            const eh = el.h <= 1 ? el.h * height : el.h;

            const primaryColor = el.stroke || el.fill || spec.accent || '#D4AF37';

            ctx.save();
            ctx.shadowBlur = el.glow ? 50 : 25;
            ctx.shadowColor = primaryColor;
            ctx.strokeStyle = primaryColor;

            if (el.fill && el.fill !== 'transparent') {
                const elGrad = ctx.createLinearGradient(ex, ey, ex + ew, ey + eh);
                elGrad.addColorStop(0, el.fill);
                elGrad.addColorStop(1, spec.accent || '#000000');
                ctx.fillStyle = elGrad;
            } else {
                ctx.fillStyle = 'transparent';
            }

            ctx.lineWidth = 4;

            if (el.type === 'line') {
                ctx.beginPath();
                ctx.moveTo(ex, ey);
                ctx.lineTo(ex + ew, ey + eh);
                ctx.stroke();
            } else if (el.type === 'circle') {
                ctx.beginPath();
                ctx.arc(ex, ey, (ew || eh) / 2, 0, Math.PI * 2);
                if (el.fill && el.fill !== 'transparent') {
                    ctx.fill();
                }
                ctx.stroke();
            } else if (el.type === 'hexagon') {
                const r = (ew || eh) / 2;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI / 3) - Math.PI / 2;
                    const px = ex + r * Math.cos(angle);
                    const py = ey + r * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                if (el.fill && el.fill !== 'transparent') {
                    ctx.fill();
                }
                ctx.stroke();
            } else {
                if (el.fill && el.fill !== 'transparent') ctx.fillRect(ex, ey, ew, eh);
                ctx.strokeRect(ex, ey, ew, eh);
            }
            ctx.restore();
        });

        // 3. Clinical Scanlines (Holographic Interference)
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < height; i += 6) {
            if (Math.random() > 0.9) continue;
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        ctx.restore();

        // 4. Text Overlay (Subtle Brand Mark - Bottom Corner)
        if (spec.title && spec.title !== "") {
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = spec.accent || '#D4AF37';
            ctx.shadowBlur = 20;
            ctx.shadowColor = spec.accent || '#D4AF37';
            ctx.font = '600 32px Inter, system-ui';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText((spec.title || 'Brand').toUpperCase(), 40, height - 40);
        }

        // 5. Neural Grain & Holographic Noise (Sovereign Texture)
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.05;
        for (let i = 0; i < 20000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 1.5;
            ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 70%)`;
            ctx.fillRect(x, y, size, size);
        }

        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.12;
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            ctx.fillRect(x, y, 1.5, 1.5);
        }

        return canvas.toDataURL('image/png');
    } catch (e) {
        console.error('Spec rendering failed:', e);
        return '';
    }
}
