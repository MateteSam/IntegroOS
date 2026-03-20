// ============================================================
// Video Engine — Canvas Compositor
// Renders animated layers onto an HTML5 Canvas
// ============================================================
import type { Layer, TextLayerConfig, ShapeLayerConfig, BackgroundLayerConfig, ParticleConfig, ImageLayerConfig } from './types';

interface Particle {
    x: number; y: number; vx: number; vy: number;
    life: number; maxLife: number; size: number; color: string; opacity: number;
}

export class Compositor {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particlePool: Map<string, Particle[]> = new Map();
    private gradientTime = 0;
    private imageCache: Map<string, HTMLImageElement> = new Map();

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })!;
    }

    render(layers: Layer[], time: number) {
        const { ctx, canvas } = this;
        this.gradientTime = time;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sort layers by z-index (order in array = z-order)
        const visible = layers.filter(l => l.visible && l.opacity > 0);

        for (const layer of visible) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));

            // Transform
            const cx = layer.x + (layer.width ?? 0) / 2;
            const cy = layer.y + (layer.height ?? 0) / 2;
            ctx.translate(cx, cy);
            ctx.rotate((layer.rotation ?? 0) * Math.PI / 180);
            ctx.scale(layer.scaleX ?? 1, layer.scaleY ?? 1);
            ctx.translate(-cx, -cy);

            switch (layer.type) {
                case 'background': this.drawBackground(layer, time); break;
                case 'text': this.drawText(layer, time); break;
                case 'shape': this.drawShape(layer); break;
                case 'particle': this.drawParticles(layer, time); break;
                case 'image': this.drawImage(layer); break;
                case 'overlay': this.drawOverlay(layer, time); break;
            }

            ctx.restore();
        }
    }

    private drawBackground(layer: Layer, time: number) {
        const { ctx, canvas } = this;
        const cfg = layer.config as BackgroundLayerConfig;

        if (cfg.type === 'solid') {
            ctx.fillStyle = cfg.fill ?? '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (cfg.type === 'gradient' && cfg.gradient) {
            const g = cfg.gradient;
            let grad: CanvasGradient;
            if (g.type === 'linear' || g.type === 'animated') {
                const angle = ((g.angle ?? 135) + (g.type === 'animated' ? time * (g.animationSpeed ?? 20) : 0)) * Math.PI / 180;
                const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width;
                const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height;
                const x2 = canvas.width / 2 + Math.cos(angle) * canvas.width;
                const y2 = canvas.height / 2 + Math.sin(angle) * canvas.height;
                grad = ctx.createLinearGradient(x1, y1, x2, y2);
            } else {
                grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.8);
            }
            g.colors.forEach((c, i) => grad.addColorStop(i / (g.colors.length - 1), c));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (cfg.type === 'noise') {
            // Subtle grain texture
            ctx.fillStyle = cfg.fill ?? '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            this.drawNoise(0.04);
        }
    }

    private drawNoise(alpha: number) {
        const { ctx, canvas } = this;
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const v = Math.random() * 255;
            imageData.data[i] = v;
            imageData.data[i + 1] = v;
            imageData.data[i + 2] = v;
            imageData.data[i + 3] = alpha * 255;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    private drawText(layer: Layer, time: number) {
        const { ctx } = this;
        const cfg = layer.config as TextLayerConfig;
        const text = cfg.uppercase ? (cfg.text ?? '').toUpperCase() : (cfg.text ?? '');

        ctx.font = `${cfg.fontWeight ?? '700'} ${cfg.fontSize ?? 48}px "${cfg.fontFamily ?? 'Inter'}", sans-serif`;
        ctx.textAlign = cfg.textAlign ?? 'center';
        ctx.textBaseline = 'middle';

        // Glow effect
        if (cfg.glowColor && cfg.glowRadius) {
            ctx.shadowColor = cfg.glowColor;
            ctx.shadowBlur = cfg.glowRadius;
        }

        // Stroke
        if (cfg.stroke && cfg.strokeWidth) {
            ctx.strokeStyle = cfg.stroke;
            ctx.lineWidth = cfg.strokeWidth;
            ctx.strokeText(text, layer.x, layer.y);
        }

        ctx.fillStyle = cfg.fill ?? '#fff';
        ctx.fillText(text, layer.x, layer.y);
        ctx.shadowBlur = 0;
    }

    private drawShape(layer: Layer) {
        const { ctx } = this;
        const cfg = layer.config as ShapeLayerConfig;
        ctx.fillStyle = cfg.fill;
        if (cfg.stroke) { ctx.strokeStyle = cfg.stroke; ctx.lineWidth = cfg.strokeWidth ?? 1; }

        const x = layer.x, y = layer.y, w = cfg.width, h = cfg.height;

        if (cfg.shape === 'rect') {
            if (cfg.rx) {
                this.roundRect(x, y, w, h, cfg.rx);
            } else {
                ctx.fillRect(x, y, w, h);
                if (cfg.stroke) ctx.strokeRect(x, y, w, h);
            }
        } else if (cfg.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
            ctx.fill();
            if (cfg.stroke) ctx.stroke();
        } else if (cfg.shape === 'line') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y + h);
            ctx.strokeStyle = cfg.fill;
            ctx.lineWidth = cfg.strokeWidth ?? 2;
            ctx.stroke();
        }
    }

    private roundRect(x: number, y: number, w: number, h: number, r: number) {
        const { ctx } = this;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }

    private drawParticles(layer: Layer, time: number) {
        const { ctx, canvas } = this;
        const cfg = layer.config as ParticleConfig;

        if (!this.particlePool.has(layer.id)) {
            this.particlePool.set(layer.id, this.createParticles(cfg, canvas.width, canvas.height));
        }
        const particles = this.particlePool.get(layer.id)!;

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy + (cfg.gravity ?? 0);
            p.life -= 0.016;
            if (p.life <= 0) {
                p.x = cfg.emitterX ?? canvas.width / 2;
                p.y = cfg.emitterY ?? canvas.height / 2;
                p.vx = (Math.random() - 0.5) * cfg.speed * 2;
                p.vy = (Math.random() - 0.5) * cfg.speed * 2;
                p.life = p.maxLife;
            }
            const alpha = (p.life / p.maxLife) * layer.opacity;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    private createParticles(cfg: ParticleConfig, w: number, h: number): Particle[] {
        const colors = Array.isArray(cfg.color) ? cfg.color : [cfg.color];
        return Array.from({ length: cfg.count }, () => ({
            x: cfg.emitterX ?? w / 2,
            y: cfg.emitterY ?? h / 2,
            vx: (Math.random() - 0.5) * cfg.speed * 2,
            vy: (Math.random() - 0.5) * cfg.speed * 2,
            life: Math.random() * cfg.lifetime,
            maxLife: cfg.lifetime,
            size: cfg.size * (0.5 + Math.random() * 1),
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 1,
        }));
    }

    private drawImage(layer: Layer) {
        const { ctx } = this;
        const cfg = layer.config as ImageLayerConfig;
        const w = layer.width ?? 400;
        const h = layer.height ?? 300;

        if (!this.imageCache.has(cfg.src)) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = cfg.src;
            img.onload = () => this.imageCache.set(cfg.src, img);
            return;
        }
        const img = this.imageCache.get(cfg.src)!;
        ctx.drawImage(img, layer.x, layer.y, w, h);
    }

    private drawOverlay(layer: Layer, time: number) {
        const { ctx, canvas } = this;
        const cfg = layer.config as any;

        if (cfg.type === 'scanlines') {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            for (let y = 0; y < canvas.height; y += 4) {
                ctx.fillRect(0, y, canvas.width, 2);
            }
        } else if (cfg.type === 'vignette') {
            const grad = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
                canvas.width / 2, canvas.height / 2, canvas.height * 0.9
            );
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, `rgba(0,0,0,${cfg.intensity ?? 0.5})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (cfg.type === 'glitch') {
            // RGB split effect
            const shift = Math.sin(time * 20) * 6;
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = `rgba(255,0,0,0.1)`;
            ctx.fillRect(shift, 0, canvas.width, canvas.height);
            ctx.fillStyle = `rgba(0,0,255,0.1)`;
            ctx.fillRect(-shift, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.particlePool.clear();
    }
}
