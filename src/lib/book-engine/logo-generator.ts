/**
 * Professional Logo Generator
 * Creates actual brand logos with typography, icons, and design elements
 */

import { loadPremiumFonts, getFontForStyle } from './font-manager';
import { getIconForStyle, renderSVGIcon, SVGIcon } from './svg-icons';

export interface LogoSpec {
    brandName: string;
    style: 'modern' | 'classic' | 'tech' | 'luxury' | 'playful' | 'minimal';
    colorScheme: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
    };
    iconType: 'letter' | 'abstract' | 'geometric' | 'emblem' | 'wordmark' | 'icon';
    customFont?: string;
    svgIcon?: SVGIcon | null;
}

export async function generateLogoSpec(prompt: string): Promise<LogoSpec> {
    // CRITICAL: Load premium fonts first
    await loadPremiumFonts();

    // Use AI to generate a sophisticated logo concept
    try {
        const { generateAIText } = await import('../ai/core');

        const logoPrompt = `Create a professional, production-quality logo concept for: "${prompt}"

Return ONLY a JSON object with this exact structure:
{
  "brandName": "extracted brand name (2-3 words max)",
  "style": "modern|classic|tech|luxury|playful|minimal",
  "colorScheme": {
    "primary": "#HEX",
    "secondary": "#HEX", 
    "accent": "#HEX",
    "background": "#HEX"
  },
  "iconType": "letter|abstract|geometric|emblem|wordmark|icon",
  "designConcept": "brief description of the visual concept"
}

Requirements:
- Choose colors that match the brand personality
- For tech brands: use blues, purples, cyans with dark backgrounds
- For luxury brands: use gold (#D4AF37), black (#0F172A), deep reds
- For modern brands: use vibrant blues, greens, purples
- Make it look PROFESSIONAL and PREMIUM, not toy-like
- The iconType should match the style (tech→icon/geometric, luxury→emblem, minimal→letter/wordmark)`;

        const systemPrompt = `You are an elite brand designer who creates logos for Fortune 500 companies. Your designs are sophisticated, memorable, and production-ready. Always return valid JSON only.`;

        const result = await generateAIText(logoPrompt, systemPrompt);

        // Parse AI response
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const aiSpec = JSON.parse(jsonMatch[0]);

            // Get premium font for this style
            const customFont = getFontForStyle(aiSpec.style);

            // Get SVG icon if using icon type
            const svgIcon = aiSpec.iconType === 'icon' ? getIconForStyle(aiSpec.style) : null;

            console.log(`[Logo Spec AI] Brand: "${aiSpec.brandName}", Style: ${aiSpec.style}, Concept: ${aiSpec.designConcept}`);

            return {
                brandName: aiSpec.brandName,
                style: aiSpec.style,
                colorScheme: aiSpec.colorScheme,
                iconType: aiSpec.iconType,
                customFont,
                svgIcon
            };
        }
    } catch (error) {
        console.warn('[Logo Spec AI] AI generation failed, using fallback:', error);
    }

    // Fallback to original logic if AI fails
    const words = prompt.split(' ').filter(w => w.length > 0);
    const capitalizedWords = words.filter(w => /^[A-Z]/.test(w));
    const brandName = (capitalizedWords.length > 0 ? capitalizedWords : words).slice(0, 2).join(' ') || 'Brand';

    // Determine style from keywords
    let style: LogoSpec['style'] = 'modern';
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('tech') || lowerPrompt.includes('digital') || lowerPrompt.includes('ai')) style = 'tech';
    else if (lowerPrompt.includes('luxury') || lowerPrompt.includes('premium') || lowerPrompt.includes('gold')) style = 'luxury';
    else if (lowerPrompt.includes('classic') || lowerPrompt.includes('traditional') || lowerPrompt.includes('heritage')) style = 'classic';
    else if (lowerPrompt.includes('playful') || lowerPrompt.includes('fun') || lowerPrompt.includes('creative')) style = 'playful';
    else if (lowerPrompt.includes('minimal') || lowerPrompt.includes('simple') || lowerPrompt.includes('clean')) style = 'minimal';

    // Color schemes - enhanced with more sophisticated palettes
    const colorSchemes = {
        modern: [
            { primary: '#2563EB', secondary: '#1E40AF', accent: '#60A5FA', background: '#F8FAFC' },
            { primary: '#7C3AED', secondary: '#5B21B6', accent: '#A78BFA', background: '#FAF5FF' },
            { primary: '#059669', secondary: '#047857', accent: '#34D399', background: '#F0FDF4' },
        ],
        tech: [
            { primary: '#0EA5E9', secondary: '#0284C7', accent: '#38BDF8', background: '#0F172A' },
            { primary: '#8B5CF6', secondary: '#6D28D9', accent: '#A78BFA', background: '#1E1B4B' },
            { primary: '#06B6D4', secondary: '#0891B2', accent: '#22D3EE', background: '#0C4A6E' },
        ],
        luxury: [
            { primary: '#D4AF37', secondary: '#B8860B', accent: '#FFD700', background: '#0F172A' },
            { primary: '#1F2937', secondary: '#111827', accent: '#D4AF37', background: '#F9FAFB' },
            { primary: '#7C2D12', secondary: '#991B1B', accent: '#DC2626', background: '#FEF2F2' },
        ],
        classic: [
            { primary: '#1E3A8A', secondary: '#1E40AF', accent: '#3B82F6', background: '#F8FAFC' },
            { primary: '#7F1D1D', secondary: '#991B1B', accent: '#DC2626', background: '#FEF2F2' },
            { primary: '#064E3B', secondary: '#065F46', accent: '#059669', background: '#F0FDF4' },
        ],
        playful: [
            { primary: '#EC4899', secondary: '#DB2777', accent: '#F472B6', background: '#FDF2F8' },
            { primary: '#F59E0B', secondary: '#D97706', accent: '#FBBF24', background: '#FFFBEB' },
            { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A78BFA', background: '#FAF5FF' },
        ],
        minimal: [
            { primary: '#18181B', secondary: '#27272A', accent: '#71717A', background: '#FAFAFA' },
            { primary: '#0F172A', secondary: '#1E293B', accent: '#475569', background: '#F8FAFC' },
            { primary: '#1F2937', secondary: '#374151', accent: '#6B7280', background: '#F9FAFB' },
        ],
    };

    const schemes = colorSchemes[style];
    const colorScheme = schemes[Math.floor(Math.random() * schemes.length)];

    // Determine icon type - prefer more sophisticated types
    let iconType: LogoSpec['iconType'] = 'icon';
    if (brandName.length <= 3) iconType = 'letter';
    else if (style === 'tech') iconType = Math.random() > 0.2 ? 'icon' : 'geometric';
    else if (style === 'luxury' || style === 'classic') iconType = Math.random() > 0.3 ? 'emblem' : 'icon';
    else if (style === 'minimal') iconType = Math.random() > 0.5 ? 'wordmark' : 'letter';
    else iconType = ['icon', 'geometric', 'abstract'][Math.floor(Math.random() * 3)] as any;

    // CRITICAL: Get premium font for this style
    const customFont = getFontForStyle(style);

    // CRITICAL: Get SVG icon if using icon type
    const svgIcon = iconType === 'icon' ? getIconForStyle(style) : null;

    console.log(`[Logo Spec Fallback] Brand: "${brandName}", Style: ${style}, Icon: ${iconType}, Font: ${customFont}`);

    return { brandName, style, colorScheme, iconType, customFont, svgIcon };
}

export async function renderLogoToDataUri(spec: LogoSpec, width = 1024, height = 1024): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const { brandName, style, colorScheme, iconType, customFont, svgIcon } = spec;
    const { primary, secondary, accent, background } = colorScheme;

    // Use custom font if available
    const fontFamily = customFont || 'Inter';
    console.log(`[Logo Render] Using font: ${fontFamily}`);

    // Background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    // Add subtle texture
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? primary : secondary;
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
    ctx.globalAlpha = 1;

    const centerX = width / 2;
    const centerY = height / 2;

    // Render based on icon type
    if (iconType === 'icon' && svgIcon) {
        renderIconLogo(ctx, brandName, centerX, centerY, primary, secondary, accent, fontFamily, svgIcon);
    } else if (iconType === 'letter') {
        renderLetterLogo(ctx, brandName, centerX, centerY, primary, secondary, accent, fontFamily);
    } else if (iconType === 'geometric') {
        renderGeometricLogo(ctx, brandName, centerX, centerY, primary, secondary, accent, fontFamily);
    } else if (iconType === 'abstract') {
        renderAbstractLogo(ctx, brandName, centerX, centerY, primary, secondary, accent, fontFamily);
    } else if (iconType === 'emblem') {
        renderEmblemLogo(ctx, brandName, centerX, centerY, primary, secondary, accent, fontFamily);
    } else if (iconType === 'wordmark') {
        renderWordmarkLogo(ctx, brandName, centerX, centerY, primary, secondary, accent, fontFamily);
    }

    return canvas.toDataURL('image/png');
}

function renderIconLogo(ctx: CanvasRenderingContext2D, brandName: string, x: number, y: number, primary: string, secondary: string, accent: string, font: string, icon: SVGIcon) {
    ctx.save();

    // Render SVG icon
    const iconSize = 400;
    renderSVGIcon(ctx, icon, x, y - 50, iconSize, primary);

    // Brand name below
    ctx.fillStyle = primary;
    ctx.font = `700 ${iconSize * 0.15}px "${font}", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowBlur = 20;
    ctx.shadowColor = accent;
    ctx.fillText(brandName.toUpperCase(), x, y + iconSize / 2 + 40);

    ctx.restore();
}

function renderLetterLogo(ctx: CanvasRenderingContext2D, brandName: string, x: number, y: number, primary: string, secondary: string, accent: string, font: string) {
    const initials = brandName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const size = 400;

    ctx.save();

    // Container with gradient
    const grad = ctx.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
    grad.addColorStop(0, primary);
    grad.addColorStop(1, secondary);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.shadowBlur = 40;
    ctx.shadowColor = accent;

    // Letters with custom font
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.5}px "${font}", "Inter", "Helvetica Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, x, y);

    ctx.shadowBlur = 0;

    // Brand name below with custom font
    ctx.fillStyle = primary;
    ctx.font = `600 ${size * 0.12}px "${font}", "Inter", sans-serif`;
    ctx.fillText(brandName.toUpperCase(), x, y + size / 2 + 80);

    ctx.restore();
}

function renderGeometricLogo(ctx: CanvasRenderingContext2D, brandName: string, x: number, y: number, primary: string, secondary: string, accent: string, font: string) {
    const size = 350;

    ctx.save();

    // Hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const grad = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
    grad.addColorStop(0, primary);
    grad.addColorStop(0.5, accent);
    grad.addColorStop(1, secondary);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    ctx.shadowBlur = 30;
    ctx.shadowColor = accent;
    ctx.stroke();

    // Inner geometric pattern
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFFFFF';

    // Triangle
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.5);
    ctx.lineTo(x - size * 0.43, y + size * 0.25);
    ctx.lineTo(x + size * 0.43, y + size * 0.25);
    ctx.closePath();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Brand name
    ctx.fillStyle = primary;
    ctx.font = `700 ${size * 0.15}px "${font}", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(brandName.toUpperCase(), x, y + size + 100);

    ctx.restore();
}

function renderAbstractLogo(ctx: CanvasRenderingContext2D, brandName: string, x: number, y: number, primary: string, secondary: string, accent: string, font: string) {
    const size = 300;

    ctx.save();

    // Abstract swoosh/wave
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.bezierCurveTo(x - size, y - size * 0.8, x, y - size * 0.8, x, y);
    ctx.bezierCurveTo(x, y + size * 0.8, x + size, y + size * 0.8, x + size, y);
    ctx.closePath();

    const grad = ctx.createLinearGradient(x - size, y, x + size, y);
    grad.addColorStop(0, primary);
    grad.addColorStop(0.5, accent);
    grad.addColorStop(1, secondary);
    ctx.fillStyle = grad;
    ctx.shadowBlur = 40;
    ctx.shadowColor = accent;
    ctx.fill();

    // Overlapping circle
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y, size * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = secondary;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;

    // Brand name
    ctx.fillStyle = primary;
    ctx.font = `700 ${size * 0.2}px "${font}", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(brandName.toUpperCase(), x, y + size + 120);

    ctx.restore();
}

function renderEmblemLogo(ctx: CanvasRenderingContext2D, brandName: string, x: number, y: number, primary: string, secondary: string, accent: string, font: string) {
    const size = 380;

    ctx.save();

    // Shield shape
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.5);
    ctx.lineTo(x + size * 0.4, y - size * 0.3);
    ctx.lineTo(x + size * 0.4, y + size * 0.3);
    ctx.lineTo(x, y + size * 0.55);
    ctx.lineTo(x - size * 0.4, y + size * 0.3);
    ctx.lineTo(x - size * 0.4, y - size * 0.3);
    ctx.closePath();

    const grad = ctx.createLinearGradient(x, y - size * 0.5, x, y + size * 0.55);
    grad.addColorStop(0, primary);
    grad.addColorStop(1, secondary);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 30;
    ctx.shadowColor = accent;
    ctx.stroke();

    // Initials in center
    const initials = brandName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.35}px "${font}", "Georgia", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#000000';
    ctx.fillText(initials, x, y);

    ctx.shadowBlur = 0;

    // Brand name
    ctx.fillStyle = primary;
    ctx.font = `600 ${size * 0.12}px "${font}", "Georgia", serif`;
    ctx.fillText(brandName.toUpperCase(), x, y + size * 0.55 + 80);

    ctx.restore();
}

function renderWordmarkLogo(ctx: CanvasRenderingContext2D, brandName: string, x: number, y: number, primary: string, secondary: string, accent: string, font: string) {
    ctx.save();

    // Main text
    const fontSize = Math.min(180, 1200 / brandName.length);
    ctx.font = `900 ${fontSize}px "${font}", "Inter", "Helvetica Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Gradient text
    const textWidth = ctx.measureText(brandName.toUpperCase()).width;
    const grad = ctx.createLinearGradient(x - textWidth / 2, y, x + textWidth / 2, y);
    grad.addColorStop(0, primary);
    grad.addColorStop(0.5, accent);
    grad.addColorStop(1, secondary);
    ctx.fillStyle = grad;

    ctx.shadowBlur = 40;
    ctx.shadowColor = accent;
    ctx.fillText(brandName.toUpperCase(), x, y);

    // Underline accent
    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(x - textWidth / 2, y + fontSize * 0.6);
    ctx.lineTo(x + textWidth / 2, y + fontSize * 0.6);
    ctx.stroke();

    ctx.restore();
}
