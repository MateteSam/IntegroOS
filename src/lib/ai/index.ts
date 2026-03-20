export * from './core';
export { generateAgentProfile } from './core';
export * from './image';
export * from './intelligence';

import { getGoogleKey, getGroqKey } from './core';

import { generateAIImage, generateAISpec, generateAIImageWithReference } from './image';
import { renderSpecToDataUri } from '../book-engine/renderers';

export async function generateBrandAsset(assetConfig: any) {
    const googleKey = getGoogleKey();
    const groqKey = getGroqKey();

    if (!googleKey && !groqKey) {
        throw new Error('API Keys Missing (Google/Groq)');
    }

    console.log('[Brand Asset] Starting generation with cascading fallback...');

    // Try AI image generation with automatic fallback
    const res = await generateAIImage(assetConfig.prompt || 'Professional Brand Identity');

    // CRITICAL: Check if it's a spec FIRST and render it to canvas
    if (res.isSpec && res.imageUrl) {
        try {
            console.log('[Brand Asset] Rendering spec JSON to canvas image...');
            const renderedUrl = await renderSpecToDataUri(res.imageUrl);
            console.log('[Brand Asset] ✓ Spec rendered successfully');
            return { imageUrl: renderedUrl, isSpec: true, local: true, method: 'spec' };
        } catch (e) {
            console.error('[Brand Asset] Spec rendering error:', e);
            return { imageUrl: '', text: 'Spec Rendering Failed' };
        }
    }

    // If we got a real raster image (Imagen or Gemini Vision)
    if (res.imageUrl && !res.text?.toLowerCase().includes('failed') && !res.text?.toLowerCase().includes('missing')) {
        console.log(`[Brand Asset] ✓ Success via ${res.method || 'unknown'}`);
        return {
            imageUrl: res.imageUrl,
            local: true,
            method: res.method,
            text: res.text
        };
    }

    return { imageUrl: '', text: res.text || 'All generation methods failed' };
}

export async function enhanceBrandPrompt(prompt: string) {
    const { generateAIText } = await import('./core');
    const system = "You are a World-Class Brand Strategist and Prompt Engineering Elite. Transform the input into a hyper-detailed, poetic, and technically precise brand specification. Use keywords like 'anodized titanium', 'sub-zero minimalism', 'optical depth', 'vanta-black contrast', and 'surgical precision'. Ensure every asset feels bespoke and high-end.";
    const entropy = ` [Vibe: ${Math.random() > 0.5 ? 'Sovereign' : 'Avant-Garde'}, Seed: ${Math.floor(Math.random() * 999)}]`;
    const res = await generateAIText(prompt + entropy, system);
    return res.text;
}

export function saveGoogleKeyToLocalStorage(key: string) {
    try { localStorage.setItem('GOOGLE_API_KEY', key); } catch { }
}
