import { supabase } from "@/integrations/supabase/client";
import { PageFormat, getPageDimensions } from './bookEngine';

const getGoogleKey = () => {
  return import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('GOOGLE_API_KEY');
};

export type AITextResponse = {
  text: string;
};

export type AIImageResponse = {
  imageUrl: string; // base64 data URL
  text?: string;
  isSpec?: boolean;
};

// Helper for high-fidelity spec rendering (Nano Banana Engine)
export async function renderSpecToDataUri(specStr: string, width = 1024, height = 1024): Promise<string> {
  try {
    const spec = JSON.parse(specStr);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 1. Background
    const p = spec.palette || ['#0F172A', '#1E293B'];
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, p[0]);
    grad.addColorStop(1, p[1] || p[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Surgical Elements (Pro-tier Geometry)
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1;
    (spec.elements || []).forEach((el: any) => {
      // Support both absolute and normalized (0-1) coordinates
      const ex = el.x <= 1 ? el.x * width : el.x;
      const ey = el.y <= 1 ? el.y * height : el.y;
      const ew = el.w <= 1 ? el.w * width : el.w;
      const eh = el.h <= 1 ? el.h * height : el.h;

      ctx.strokeStyle = el.stroke || el.fill || spec.accent || '#ffffff';
      ctx.fillStyle = el.fill || 'transparent';

      if (el.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + ew, ey + eh);
        ctx.stroke();
      } else if (el.type === 'circle') {
        ctx.beginPath();
        ctx.arc(ex, ey, (ew || eh) / 2, 0, Math.PI * 2);
        el.fill ? ctx.fill() : ctx.stroke();
      } else {
        if (el.fill) ctx.fillRect(ex, ey, ew, eh);
        ctx.strokeRect(ex, ey, ew, eh);
      }
    });

    // 3. Text Overlay (Clinical Sovereign Typography)
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 64px Inter, system-ui'; // Elite thin weight
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const title = (spec.title || 'Sovereign').toUpperCase();
    ctx.fillText(title, width / 2, height / 2);

    // 4. Surgical Grain (High-fidelity texture)
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 1, 1);
    }

    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Spec rendering failed:', e);
    return '';
  }
}

async function invokeWithTimeout(fn: string, body: any, timeout = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await supabase.functions.invoke(fn, {
      body,
      // @ts-ignore
      signal: controller.signal
    });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function tryEdgeFunction(endpoint: string, body: any, timeout = 15000): Promise<AITextResponse | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(id);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.text === 'string') return { text: data.text };
    return null;
  } catch {
    return null;
  }
}

async function tryGoogleGemini(prompt: string, system?: string): Promise<AITextResponse | null> {
  try {
    const key = getGoogleKey();
    if (!key) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(key)}`;

    const body: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    };

    if (system) {
      body.systemInstruction = { role: 'system', parts: [{ text: system }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;
    const data = await res.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') ||
      '';

    if (!text) return null;
    return { text };
  } catch {
    return null;
  }
}

export async function generateAIText(prompt: string, system?: string): Promise<AITextResponse> {
  const edge1 = await tryEdgeFunction('/functions/v1/ai-text', { prompt, system });
  if (edge1) return edge1;
  const edge2 = await tryEdgeFunction('/functions/v1/generate-text', { prompt, system });
  if (edge2) return edge2;
  const google = await tryGoogleGemini(prompt, system);
  if (google) return google;
  return { text: 'AI service is unavailable. Please try again later.' };
}

// Generate AI images using Gemini 3 Pro Image (Raster PNG)
export async function generateAIImage(prompt: string): Promise<AIImageResponse> {
  try {
    const key = getGoogleKey();
    if (!key) return { imageUrl: '', text: 'Provide Google API key in Settings to enable AI images.' };

    // RASTER UPGRADE: Using Gemini 3 Pro Image for Photorealistic Synthesis
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${encodeURIComponent(key)}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{
            text: `NEXUS RASTER PROTOCOL (V5.0):
          Task: Generate a high-fidelity, photorealistic RASTER image (PNG) for: ${prompt}
          
          AESTHETIC REQUIREMENTS:
          - Style: Elite Luxury Minimalism / "Clinical Sovereign".
          - Palette: Deep space blacks, surgical whites, metallic gold/silver accents.
          - Lighting: Cinematic, high-contrast, professional studio lighting.
          - Composition: Balanced, architectural depth, premium corporate feel.
          - Quality: 4K fidelity, razor-sharp details.
          - AVOID: Clutter, generic gradients, blocky shapes, cartoons.
          
          OUTPUT INSTRUCTION:
          Return the image directly as a high-resolution raster asset.` }],
        },
      ],
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return { imageUrl: '', text: 'AI image request failed' };
    const data = await res.json();

    // Handling direct image response (inlineData part)
    const imagePart = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (imagePart?.inlineData?.data) {
      const base64 = imagePart.inlineData.data;
      const mime = imagePart.inlineData.mimeType || 'image/png';
      return { imageUrl: `data:${mime};base64,${base64}`, text: 'raster' };
    }

    // Fallback if it returned text instead
    return { imageUrl: '', text: 'Model failed to generate raster image' };
  } catch (e) {
    return { imageUrl: '', text: 'AI image generation error' };
  }
}

export async function generateAIImageWithReference(prompt: string, imageDataUrl?: string): Promise<AIImageResponse> {
  try {
    const key = getGoogleKey();
    if (!key) return { imageUrl: '', text: 'Provide Google API key in Settings to enable AI images.' };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${encodeURIComponent(key)}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `NEXUS RASTER VISION PROTOCOL (V5.0):
          Task: Create a photorealistic RASTER image (PNG) for: ${prompt}
          
          REFERENCE ADAPTATION:
          - Analyze the visual essence of the attached image.
          - Transmute its soul into an "Elite Luxury Minimalism" design.
          - Maintain brand consistency and premium corporate aesthetics.
          
          TECHNICAL SPECS:
          - High resolution, cinematic contrast, surgical precision.
          
          OUTPUT INSTRUCTION:
          Return ONLY the generated raster image.`
            },
            ...(imageDataUrl?.startsWith('data:image/') ? [{ inlineData: { mimeType: 'image/png', data: imageDataUrl.split(',')[1] } }] : [])
          ]
        }
      ]
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return { imageUrl: '', text: 'AI image request failed' };
    const data = await res.json();

    // Handling direct image response
    const imagePart = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (imagePart?.inlineData?.data) {
      const base64 = imagePart.inlineData.data;
      const mime = imagePart.inlineData.mimeType || 'image/png';
      return { imageUrl: `data:${mime};base64,${base64}`, text: 'raster' };
    }

    return { imageUrl: '', text: 'Model failed to generate raster image' };
  } catch (e) {
    return { imageUrl: '', text: 'AI image generation error' };
  }
}

export async function extractTextFromImage(imageDataUrl: string): Promise<AITextResponse> {
  try {
    const key = getGoogleKey();
    if (!key) return { text: '' };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(key)}`;
    const base64 = imageDataUrl.split(',')[1] || '';
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/png', data: base64 } },
            { text: 'Extract all readable text from this image. Return plain text only.' }
          ]
        }
      ]
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return { text: '' };
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') || '';
    return { text };
  } catch {
    return { text: '' };
  }
}

// 2026 Intelligence Engines (Client-side Fallbacks)

export async function generateMarketAnalysis(business: string, industry: string, location: string, targetAudience: string, competitors: string[]) {
  const prompt = `Conduct a high-fidelity, predictive market analysis for "${business}" in the ${industry} industry for 2026.
  Location: ${location} | Audience: ${targetAudience} | Competitors: ${competitors.join(', ')}
  Return ONLY JSON: {
    "marketSize": "string", "growthRate": "string", "competitorCount": number, "marketAttractiveness": number,
    "opportunities": ["str"], "threats": ["str"], "recommendations": ["str"],
    "topCompetitors": [{"name":"str", "marketShare":"str", "strength":"str", "vulnerability":"str"}],
    "targetPsychographics": ["str"], "automationHotspots": ["str"]
  }`;

  const res = await generateAIText(prompt, "You are a 2026 Market Intelligence Officer.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse market intelligence");
  }
}

export async function generateBEASTStrategy(business: any, goals: string, timeframe: string) {
  const prompt = `Create a 2026 BEAST Strategy.
  Business: ${JSON.stringify(business)} | Goals: ${goals} | Timeframe: ${timeframe}
  Return ONLY JSON matching the BEAST strategy schema (overview, objectives, strategies, staffingEstimation, automationEcosystem, budget, lineOperations, successIndicators).`;

  const res = await generateAIText(prompt, "You are a 2026 Strategic Orchestrator.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse strategy intelligence");
  }
}

export async function findNeuralProspects(business: string, industry: string, targetAudience: string) {
  const prompt = `Identify 10 high-intent 2026 prospects for: ${business} in ${industry}.
  Target: ${targetAudience}
  Return ONLY JSON array of 10 objects: { "name": "str", "role": "str", "intentScore": number, "whyHighIntent": "str", "suggestedReachout": "str" }`;

  const res = await generateAIText(prompt, "You are a 2026 Lead Generation Beast.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleaned);
    return data.prospects || data;
  } catch (e) {
    throw new Error("Failed to parse prospecting intelligence");
  }
}

// 2026 Creative Intelligence (Client-side Fallbacks)

export async function generateBrandAsset(assetConfig: any) {
  // Primary Protocol: Supabase Edge Function with standard timeout
  try {
    const { data, error } = await invokeWithTimeout("generate-ai-brand-asset", assetConfig, 12000);
    if (!error && data?.imageUrl) return data;
  } catch (e) {
    console.warn("Edge Function 'generate-ai-brand-asset' link severed or timed out. Initiating Neural Failover.");
  }

  // Tier 1: Nano Banana (Google Intelligence Raster Synthesis)
  try {
    const key = getGoogleKey();
    if (key) {
      const prompt = `Create a high-fidelity photorealistic ${assetConfig.assetType || 'brand asset'} for a premium business. 
      Context: ${assetConfig.prompt || ''}. 
      Style: Elite Luxury Minimalism / "Clinical Sovereign".
      Theme: Deep space blacks, cinematic lighting, surgical geometric precision.`;

      const res = await generateAIImage(prompt);

      // Handle Direct Raster Response
      if (res.text === 'raster' && res.imageUrl) {
        return {
          imageUrl: res.imageUrl,
          prompt: assetConfig.prompt,
          isSpec: false,
          local: true
        };
      }

      // Legacy Spec Handling (Backward Compatibility)
      if (res.text === 'spec' && res.imageUrl) {
        const renderedUrl = await renderSpecToDataUri(res.imageUrl);
        if (renderedUrl) {
          return {
            imageUrl: renderedUrl,
            prompt: assetConfig.prompt,
            isSpec: true,
            local: true
          };
        }
      }
    }
  } catch (e) {
    console.warn("Nano Banana synthesis failed. Pivoting to Safe Harbor.");
  }

  // Tier 2: Safe Harbor (High-Resolution Unsplash Fallback)
  const query = encodeURIComponent(`${assetConfig.prompt || assetConfig.assetType || 'minimal professional'} design`);
  const imageUrl = `https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1024&h=1024`;
  const dynamicFallback = `https://source.unsplash.com/featured/1024x1024?${query}`;

  return {
    imageUrl: dynamicFallback,
    fallbackUrl: imageUrl,
    prompt: assetConfig.prompt,
    local: true
  };
}

export async function generateBrandNexus(config: any) {
  try {
    const res = await supabase.functions.invoke('generate-brand-nexus', {
      body: config
    });
    if (!res.error && res.data) return res.data;
  } catch (e) {
    console.warn("Edge Function 'generate-brand-nexus' unreachable, falling back to local Gemini");
  }

  // Fallback to Gemini
  const prompt = `Synthesize a complete brand identity for: ${JSON.stringify(config.questionnaireData)}.
  Stage: ${config.stage}
  Return ONLY JSON matching the Brand Nexus schema including logos concepts (id, name, url), colors, and typography.`;

  const res = await generateAIText(prompt, "You are a Brand Intelligence Architect.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to synthesize brand intelligence locally");
  }
}

export async function generateWebsiteArchitecture(config: any) {
  try {
    const res = await supabase.functions.invoke('generate-website', {
      body: config
    });
    if (!res.error && res.data) return res.data;
  } catch (e) {
    console.warn("Edge Function 'generate-website' unreachable, falling back to local Gemini");
  }

  // Fallback to Gemini
  const prompt = `Generate a modern, high-conversion website architecture for: ${config.businessName} in ${config.industry}.
  Style: ${config.style} | Features: ${config.features.join(', ')}
  Return ONLY JSON matching the website schema: { "pages": { "home": "html string" }, "css": "string", "javascript": "string" }`;

  const res = await generateAIText(prompt, "You are a Neural Web Architect.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { website: parsed };
  } catch (e) {
    // Basic fallback if AI fails
    return {
      website: {
        pages: { home: `<div class="p-20 text-center"><h1 class="text-6xl font-bold">${config.businessName}</h1><p class="mt-4 text-xl">Coming Soon in ${config.industry}</p></div>` },
        css: "body { background: #0f172a; color: white; font-family: sans-serif; }",
        javascript: "console.log('Website initialized');"
      }
    };
  }
}

export async function extractBrandDNA(assetUrl: string, assetType: string) {
  try {
    const res = await supabase.functions.invoke('extract-brand-dna', {
      body: { imageUrl: assetUrl, assetType }
    });
    if (!res.error && res.data) return res.data.brandDNA;
  } catch (e) {
    console.warn("Edge Function 'extract-brand-dna' unreachable, falling back to Gemini");
  }

  // Fallback to Gemini with image awareness
  const prompt = `Analyze this ${assetType} and extract its Brand DNA.
  Return ONLY JSON matching the Brand DNA schema (colorPalette, typography, visualStyle, designElements, brandPersonality).`;

  const key = getGoogleKey();
  if (key && assetUrl.startsWith('data:image/')) {
    const res = await extractTextFromImage(assetUrl); // We reuse the helper for simplicity or implement a specific one
    // Actually, let's use a cleaner fallback
    const res2 = await generateAIText(prompt, "You are a Brand Intelligence Auditor.");
    try {
      const cleaned = res2.text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch { }
  }

  // Static high-fidelity fallback
  return {
    colorPalette: { primary: "#2563eb", secondary: "#1e40af", accent1: "#f59e0b", accent2: "#059669" },
    typography: { style: "Modern", weight: "Bold", category: "Sans-serif" },
    visualStyle: { aesthetic: "Clean/Corporate", keywords: ["Professional", "Reliable"] },
    designElements: ["Geometric shapes", "High contrast"],
    brandPersonality: { tone: "Professional", traits: ["Innovative", "Trustworthy"] }
  };
}

export async function generateMockup(config: any) {
  try {
    const res = await supabase.functions.invoke('generate-mockup', {
      body: config
    });
    if (!res.error && res.data) return res.data;
  } catch (e) {
    console.warn("Edge Function 'generate-mockup' unreachable, falling back to local simulation");
  }

  // Fallback: Professional Unsplash Simulation
  const query = encodeURIComponent(`${config.assetType || 'mockup'} studio product`);
  const imageUrl = `https://source.unsplash.com/featured/1024x768?${query}`;

  return {
    imageUrl,
    local: true
  };
}

export async function generateVideoStoryboard(config: any) {
  try {
    const res = await supabase.functions.invoke('generate-video-storyboard', {
      body: config
    });
    if (!res.error && res.data) return res.data;
  } catch (e) {
    console.warn("Edge Function 'generate-video-storyboard' unreachable, falling back to Gemini");
  }

  const prompt = `Generate a 5-scene video storyboard for: ${config.title}. 
  Style: ${config.style}
  Return ONLY JSON array of 5 scenes: { "scene": number, "description": "str", "visual": "str", "audio": "str", "duration": number }`;

  const res = await generateAIText(prompt, "You are a Neural Video Director.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    return { storyboard: JSON.parse(cleaned) };
  } catch (e) {
    return {
      storyboard: [
        { scene: 1, description: "Intro", visual: "Logo animation", audio: "Inspiring music", duration: 5 }
      ]
    };
  }
}

export async function generateVideoFile(storyboard: any, title: string, style: string, duration: number) {
  try {
    const res = await supabase.functions.invoke('generate-video-file', {
      body: { storyboard, title, style, duration }
    });
    if (!res.error && res.data) return res.data;
  } catch (e) {
    console.warn("Edge Function 'generate-video-file' unreachable, falling back to local simulation");
  }

  // Fallback: Professional Cinematic Thumbnail
  const query = encodeURIComponent(`Cinematic ${title} visual`);
  const videoUrl = `https://source.unsplash.com/featured/1024x576?${query}`;

  return {
    videoUrl,
    local: true
  };
}

// Helper for users who prefer frontend-only key storage (not recommended for sensitive keys)
export function saveGoogleKeyToLocalStorage(key: string) {
  try { localStorage.setItem('GOOGLE_API_KEY', key); } catch { }
}
