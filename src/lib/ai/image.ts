import { getGoogleKey, generateAIText } from './core';
import { generateLogoSpec, renderLogoToDataUri } from '../book-engine/logo-generator';
import { supabase } from '@/integrations/supabase/client';
import { generatePollinationsImage } from './free-image-apis';

// Version tracking to confirm browser cache is cleared
const AI_IMAGE_VERSION = '4.4.0-hybrid-engine';
console.log(`[AI Image Module] Loaded version ${AI_IMAGE_VERSION} (Graphics + Typography Hybrid)`);

export type AIImageResponse = {
  imageUrl: string;
  text?: string;
  isSpec?: boolean;
  method?: 'supabase-edge' | 'imagen' | 'gemini-vision' | 'gemini-image' | 'spec' | 'logo' | 'openrouter' | 'openrouter-gemini' | 'pollinations' | 'together' | 'together-flux';
};

// Tier 1: Try Imagen 3 (Primary - Fast & High Quality)
async function tryImagenGeneration(prompt: string, aspectRatio: string = "1:1"): Promise<AIImageResponse | null> {
  const models = ['imagen-3.0-generate-001', 'imagen-3.0-fast-generate-001', 'imagen-3'];
  const key = getGoogleKey();

  if (!key) {
    console.warn('[Imagen] No Google API key found');
    throw new Error('Missing Google API Key');
  }

  const enhancedPrompt = `Professional brand logo design: ${prompt}. 
Style: Modern, clean, memorable, production-ready.
Quality: High-resolution, vector-style, professional branding.
Aesthetic: Sophisticated, premium, corporate identity.
Format: Centered composition, clean background, suitable for business use.`;

  const body = {
    instances: [{ prompt: enhancedPrompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio,
      safetySetting: "BLOCK_NONE",
      personGeneration: "ALLOW_ADULT"
    }
  };

  let lastError = 'No Key or All models failed';
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${encodeURIComponent(key)}`;
      console.log(`[Imagen] Attempting ${model}...`);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000)
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = `${model} ${res.status}: ${errText.slice(0, 60)}`;
        console.error(`[Imagen] Error:`, lastError);
        continue;
      }

      const data = await res.json();
      if (data.predictions?.[0]?.bytesBase64Encoded) {
        console.log(`[Imagen] ✓ Successfully generated via ${model}`);
        return {
          imageUrl: `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`,
          text: `AI Generated (${model})`,
          method: 'imagen'
        };
      }
    } catch (e: any) {
      lastError = e.message;
      console.error(`[Imagen] Exception:`, e.message);
    }
  }

  throw new Error(lastError);
}

// Tier 2: Try Gemini 2.0 Flash Image (Secondary - Native Image Generation)
async function tryGeminiVisionGeneration(prompt: string): Promise<AIImageResponse | null> {
  try {
    const key = getGoogleKey();
    if (!key) return null;

    console.log('[Gemini Image] Attempting Gemini 2.0 Flash image generation...');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(key)}`;

    const body = {
      contents: [{
        role: 'user',
        parts: [{
          text: `Generate a professional minimalist business logo image for: ${prompt}. 
Style: Modern, clean, high-quality, vector-style design with white background.
Output: Generate ONLY the image, no text explanations.`
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 32,
        topP: 0.9,
        // CRITICAL: Request image output modality
        responseModalities: ["IMAGE"]
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000) // 60s timeout for image generation
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[Gemini Image] API Error:', res.status, errText.slice(0, 100));
      return null;
    }

    const data = await res.json();

    // Look for inline image data in response
    const imagePart = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (imagePart?.inlineData?.data) {
      console.log('[Gemini Image] ✓ Successfully generated image via Gemini 2.0 Flash');
      return {
        imageUrl: `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`,
        text: 'AI Generated (Gemini 2.0)',
        method: 'gemini-image'
      };
    }

    console.warn('[Gemini Image] No image data in response');
    return null;
  } catch (e: any) {
    console.warn('[Gemini Image] Exception:', e.message);
    return null;
  }
}

// Tier 3: Professional Logo Generator (Guaranteed Fallback)
async function generateSpecFallback(prompt: string): Promise<AIImageResponse> {
  try {
    console.log('[Logo Generator] Creating professional logo...');
    const logoSpec = await generateLogoSpec(prompt);
    const logoUrl = await renderLogoToDataUri(logoSpec);
    console.log(`[Logo Generator] ✓ Created ${logoSpec.style} ${logoSpec.iconType} logo for "${logoSpec.brandName}"`);
    return {
      imageUrl: logoUrl,
      method: 'logo',
      text: `Professional ${logoSpec.style} logo`,
      isSpec: false
    };
  } catch (e) {
    console.error('[Logo Generator] Error:', e);
    // Ultimate fallback: simple text logo
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available');

    const brandName = prompt.split(' ').slice(0, 2).join(' ') || 'Brand';

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 120px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(brandName.toUpperCase(), 512, 512);

    return {
      imageUrl: canvas.toDataURL('image/png'),
      method: 'logo',
      text: 'Simple logo',
      isSpec: false
    };
  }
}

// Main orchestrator with cascading fallback - Gemini-First Strategy
export async function generateAIImage(prompt: string, aspectRatio: string = "1:1"): Promise<AIImageResponse> {
  console.log('[AI Image] Starting generation for:', prompt.slice(0, 50));

  const errors: string[] = [];

  // Tier 1: Pollinations AI (The user's preferred reliable method)
  try {
    console.log('[AI Image] Tier 1: Trying Pollinations AI...');
    const pollinationsResult = await generatePollinationsImage(prompt);
    if (pollinationsResult?.imageUrl) {
      console.log('[AI Image] ✓ Pollinations AI succeeded');
      return {
        imageUrl: pollinationsResult.imageUrl,
        text: 'AI Generated (Pollinations)',
        method: 'pollinations'
      };
    }
    errors.push('Pollinations: No image returned');
  } catch (e: any) {
    console.warn('[AI Image] Pollinations failed:', e.message);
    errors.push(`Pollinations: ${e.message}`);
  }

  // Tier 2: Gemini 2.0 Flash Image Generation (uses VITE_GOOGLE_API_KEY)
  try {
    console.log('[AI Image] Tier 2: Trying Gemini 2.0 Flash...');
    const geminiResult = await tryGeminiVisionGeneration(prompt);
    if (geminiResult?.imageUrl) {
      console.log('[AI Image] ✓ Gemini 2.0 Flash image generation succeeded');
      return geminiResult;
    }
    errors.push('Gemini: No image returned');
  } catch (e: any) {
    console.warn('[AI Image] Gemini failed:', e.message);
    errors.push(`Gemini: ${e.message}`);
  }

  // Tier 3: Supabase Edge Function (SERVER-SIDE fallback)
  try {
    console.log('[AI Image] Tier 3: Trying Supabase Edge Function...');
    const { data, error } = await supabase.functions.invoke('generate-ai-brand-asset', {
      body: {
        prompt: prompt,
        assetType: 'logo',
        variationIndex: 0
      }
    });

    if (error) {
      console.warn('[AI Image] Supabase Edge Function error:', error.message);
      errors.push(`Supabase: ${error.message}`);
    } else if (data?.imageUrl) {
      console.log('[AI Image] ✓ Supabase Edge Function succeeded with model:', data.model);
      return {
        imageUrl: data.imageUrl,
        text: `AI Generated (${data.model})`,
        method: 'supabase-edge'
      };
    } else {
      errors.push('Supabase: No image returned');
    }
  } catch (e: any) {
    console.warn('[AI Image] Supabase Edge Function exception:', e.message);
    errors.push(`Supabase: ${e.message}`);
  }

  // Tier 4: LOCAL Logo Generator - Always works, no external API needed!
  console.log('[AI Image] ✗ All Gemini/Google APIs failed, using LOCAL logo generator...');
  try {
    const specResult = await generateSpecFallback(prompt);
    console.log('[AI Image] ✓ Local Canvas logo generator succeeded');
    return specResult;
  } catch (e: any) {
    console.error('[AI Image] Local generator failed:', e.message);
    errors.push(`Local: ${e.message}`);
  }

  // If even local fails, throw with diagnostics
  const diagnosticInfo = errors.map((err, i) => `[${i + 1}] ${err}`).join('; ');
  const errorMessage = `All generation methods failed. Diagnostics: ${diagnosticInfo}`;
  console.error(`[AI Image] ✗ ${errorMessage}`);
  throw new Error(errorMessage);
}

export async function generateAISpec(prompt: string): Promise<AIImageResponse> {
  const seed = Math.floor(Math.random() * 1000000);
  const system = `You are a World-Class Neural Architect (Code: NANO BANANA). 
Your task is to generate a visual design specification in JSON format.
The design MUST be distinct, clinical, and high-fidelity.

JSON Structure:
{
  "title": "Short Brand Name",
  "accent": "#HEX",
  "palette": ["#HEX1", "#HEX2", "#HEX3"],
  "elements": [
    { "type": "rect|circle|hexagon|line", "x": 0-1, "y": 0-1, "w": 0.1-0.5, "h": 0.1-0.5, "fill": "#HEX|transparent", "stroke": "#HEX", "glow": boolean }
  ]
}

- Use at least 5-8 elements.
- Create complex geometric overlaps.
- VARIATION SEED: ${seed}
- Ensure the 'accent' matches the brand vibe.
- For "modern" prompts, use hexagons and lines.
- For "lux" prompts, use circles and gold/black palettes.
Return ONLY the JSON.`;

  const specPrompt = `TASK: Generate a unique high-fidelity visual spec for: "${prompt}". TIMESTAMP: ${Date.now()}`;
  const res = await generateAIText(specPrompt, system);
  const jsonMatch = res?.text?.match(/\{[\s\S]*\}/);
  if (jsonMatch) return { imageUrl: jsonMatch[0], text: 'spec', isSpec: true };

  // Ultimate fallback: return a rich, varied spec from pre-designed schemes
  const colorSchemes = [
    {
      name: "Sovereign Gold",
      palette: ["#0F172A", "#1E293B", "#D4AF37", "#F59E0B"],
      accent: "#D4AF37",
      elements: [
        { type: "hexagon", x: 0.2, y: 0.25, w: 0.3, h: 0.3, fill: "transparent", stroke: "#D4AF37", glow: true },
        { type: "hexagon", x: 0.65, y: 0.35, w: 0.25, h: 0.25, fill: "#1E293B", stroke: "#F59E0B", glow: true },
        { type: "circle", x: 0.5, y: 0.7, w: 0.2, h: 0.2, fill: "transparent", stroke: "#D4AF37", glow: false },
        { type: "line", x: 0.15, y: 0.5, w: 0.7, h: 0.01, fill: "#D4AF37", stroke: "#D4AF37", glow: true },
        { type: "rect", x: 0.4, y: 0.15, w: 0.2, h: 0.15, fill: "transparent", stroke: "#F59E0B", glow: false },
      ]
    },
    {
      name: "Cyber Purple",
      palette: ["#1E1B4B", "#312E81", "#6366F1", "#818CF8"],
      accent: "#818CF8",
      elements: [
        { type: "hexagon", x: 0.3, y: 0.3, w: 0.35, h: 0.35, fill: "transparent", stroke: "#6366F1", glow: true },
        { type: "circle", x: 0.7, y: 0.6, w: 0.25, h: 0.25, fill: "#312E81", stroke: "#818CF8", glow: true },
        { type: "line", x: 0.2, y: 0.65, w: 0.6, h: 0.01, fill: "#6366F1", stroke: "#818CF8", glow: true },
        { type: "rect", x: 0.15, y: 0.15, w: 0.15, h: 0.2, fill: "transparent", stroke: "#6366F1", glow: false },
        { type: "hexagon", x: 0.55, y: 0.15, w: 0.15, h: 0.15, fill: "#1E1B4B", stroke: "#818CF8", glow: true },
      ]
    },
    {
      name: "Emerald Tech",
      palette: ["#064E3B", "#065F46", "#10B981", "#34D399"],
      accent: "#10B981",
      elements: [
        { type: "circle", x: 0.25, y: 0.3, w: 0.3, h: 0.3, fill: "transparent", stroke: "#10B981", glow: true },
        { type: "hexagon", x: 0.65, y: 0.4, w: 0.25, h: 0.25, fill: "#065F46", stroke: "#34D399", glow: true },
        { type: "rect", x: 0.35, y: 0.65, w: 0.3, h: 0.2, fill: "transparent", stroke: "#10B981", glow: false },
        { type: "line", x: 0.1, y: 0.55, w: 0.8, h: 0.01, fill: "#34D399", stroke: "#10B981", glow: true },
        { type: "circle", x: 0.5, y: 0.15, w: 0.12, h: 0.12, fill: "#064E3B", stroke: "#34D399", glow: false },
      ]
    },
    {
      name: "Sunset Orange",
      palette: ["#7C2D12", "#9A3412", "#EA580C", "#FB923C"],
      accent: "#EA580C",
      elements: [
        { type: "hexagon", x: 0.35, y: 0.35, w: 0.3, h: 0.3, fill: "transparent", stroke: "#EA580C", glow: true },
        { type: "circle", x: 0.65, y: 0.25, w: 0.2, h: 0.2, fill: "#9A3412", stroke: "#FB923C", glow: true },
        { type: "rect", x: 0.2, y: 0.6, w: 0.25, h: 0.18, fill: "transparent", stroke: "#EA580C", glow: false },
        { type: "line", x: 0.25, y: 0.45, w: 0.5, h: 0.01, fill: "#FB923C", stroke: "#EA580C", glow: true },
        { type: "hexagon", x: 0.15, y: 0.2, w: 0.15, h: 0.15, fill: "#7C2D12", stroke: "#FB923C", glow: false },
      ]
    },
  ];

  const scheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];

  return {
    imageUrl: JSON.stringify({
      title: prompt.slice(0, 15) || scheme.name,
      accent: scheme.accent,
      palette: scheme.palette,
      elements: scheme.elements
    }),
    text: 'Neural Spec (Fallback)',
    isSpec: true
  };
}

export async function generateAIImageWithReference(prompt: string, imageDataUrl?: string): Promise<AIImageResponse> {
  try {
    const key = getGoogleKey();
    if (!key) return { imageUrl: '', text: 'API Key missing' };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `NEXUS RASTER VISION PROTOCOL: Task: Create a photorealistic RASTER image for: ${prompt}\nAnalyze the attached image and maintain its essence.` },
            ...(imageDataUrl?.startsWith('data:image/') ? [{ inlineData: { mimeType: 'image/png', data: imageDataUrl.split(',')[1] } }] : [])
          ]
        }
      ]
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return { imageUrl: '', text: 'Gemini failed' };
    const data = await res.json();
    const imagePart = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (imagePart?.inlineData?.data) {
      return { imageUrl: `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`, text: 'raster' };
    }
    return { imageUrl: '', text: 'Failed to generate image bytes' };
  } catch (e) {
    return { imageUrl: '', text: 'Generation error' };
  }
}
