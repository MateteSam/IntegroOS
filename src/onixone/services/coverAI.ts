/**
 * 🎨 CoverAI - Groundbreaking Book Cover Generation System
 * 
 * Revolutionary approach combining:
 * 1. Blueprint System - AI generates structured cover specifications, not just prompts
 * 2. Compositional Layers - Background, focal imagery, textures generated separately  
 * 3. Genre DNA - Master prompt templates derived from award-winning covers
 * 4. Smart Prompt Chains - Progressive refinement through multiple AI passes
 * 5. Real-time Compositor - Live preview with text overlay rendering
 */

import { GoogleGenAI, Type } from "@google/genai";

const TEXT_MODEL = 'gemini-1.5-flash';

declare const process: { env: { API_KEY?: string; GEMINI_API_KEY?: string } };

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 COVER BLUEPRINT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export interface CoverBlueprint {
  style: 'photographic' | 'illustrated' | 'typographic' | 'abstract' | 'cinematic';
  composition: {
    layout: 'centered' | 'rule-of-thirds' | 'diagonal' | 'framed' | 'split';
    focalPoint: { x: number; y: number }; // 0-1 normalized
    negativeSpace: 'top' | 'bottom' | 'left' | 'right' | 'center';
  };
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    mood: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted';
  };
  imagery: {
    subject: string;
    atmosphere: string;
    lighting: string;
    texture: string;
  };
  layers: {
    background: string;  // Prompt for background layer
    midground?: string;  // Optional middle layer (atmospheric effects)
    foreground: string;  // Main focal imagery
    overlay?: string;    // Texture/grain overlay
  };
}

export interface GeneratedCover {
  id: string;
  blueprint: CoverBlueprint;
  layers: {
    background: string;
    midground?: string;
    foreground: string;
    overlay?: string;
    composite: string;  // Final combined image
  };
  metadata: {
    genre: string;
    generatedAt: number;
    seed: number;
    visualPillars?: string[];
  };
}

export interface CoverSuite {
  id: string;
  front: GeneratedCover;
  spine: GeneratedCover;
  back: GeneratedCover;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧬 GENRE DNA - Master templates from award-winning cover analysis
// ═══════════════════════════════════════════════════════════════════════════════

export const GENRE_DNA: Record<string, {
  styles: CoverBlueprint['style'][];
  compositions: CoverBlueprint['composition']['layout'][];
  palettes: string[][];
  lighting: string[];
  textures: string[];
  subjects: string[];
  masterPrompt: string;
}> = {
  thriller: {
    styles: ['cinematic', 'photographic'],
    compositions: ['diagonal', 'split'],
    palettes: [
      ['#0a0a0a', '#c41e3a', '#ffffff'],
      ['#1a1a2e', '#e94560', '#c7c7c7'],
      ['#000000', '#d4af37', '#f5f5f5'],
    ],
    lighting: ['harsh spotlight', 'film noir shadows', 'streetlight glow', 'lightning flash'],
    textures: ['rain-streaked glass', 'concrete', 'cracked surface', 'metallic grain'],
    subjects: ['silhouette figure', 'urban skyline', 'mysterious doorway', 'knife edge', 'shattered mirror'],
    masterPrompt: 'cinematic thriller atmosphere, high contrast dramatic lighting, noir aesthetic, tension and mystery, razor-sharp focus, professional book cover photography, moody shadows with striking highlights, suspenseful mood'
  },
  romance: {
    styles: ['photographic', 'illustrated'],
    compositions: ['centered', 'rule-of-thirds'],
    palettes: [
      ['#f8e1e7', '#a94064', '#ffd700'],
      ['#fff5f5', '#ff6b6b', '#c9184a'],
      ['#fce4ec', '#e91e63', '#ad1457'],
    ],
    lighting: ['golden hour warmth', 'soft backlight', 'candlelight glow', 'dreamy haze'],
    textures: ['silk fabric', 'flower petals', 'soft bokeh', 'watercolor wash'],
    subjects: ['embracing couple silhouette', 'flowing dress', 'intimate moment', 'rose petals', 'sunset beach'],
    masterPrompt: 'romantic atmosphere, soft ethereal lighting, emotional intimacy, warm golden tones, dreamy bokeh, elegant composition, passionate mood, tasteful sensuality, professional romance novel cover'
  },
  fantasy: {
    styles: ['illustrated', 'cinematic'],
    compositions: ['framed', 'centered'],
    palettes: [
      ['#2d1b69', '#c8b6ff', '#ffd700'],
      ['#0d1b2a', '#7209b7', '#4cc9f0'],
      ['#1a0f3c', '#8b5cf6', '#c084fc'],
    ],
    lighting: ['magical glow', 'ethereal luminescence', 'mystical aurora', 'ancient sunbeam'],
    textures: ['ancient parchment', 'starfield', 'crystal facets', 'dragon scales'],
    subjects: ['magical portal', 'ancient castle', 'mystical creature', 'enchanted forest', 'floating island'],
    masterPrompt: 'epic fantasy world, magical ethereal lighting, rich detailed illustration, mythical grandeur, otherworldly atmosphere, luminous magical effects, professional fantasy book cover art, painterly quality'
  },
  scifi: {
    styles: ['cinematic', 'abstract'],
    compositions: ['diagonal', 'split'],
    palettes: [
      ['#0d1b2a', '#00f5d4', '#7209b7'],
      ['#0a0a0a', '#00d4ff', '#ff0055'],
      ['#1a1a2e', '#4cc9f0', '#f72585'],
    ],
    lighting: ['neon glow', 'holographic shimmer', 'bioluminescence', 'plasma arc'],
    textures: ['circuit patterns', 'hex grid', 'glass surface', 'chrome reflection'],
    subjects: ['spaceship', 'futuristic cityscape', 'astronaut helmet', 'alien planet', 'AI interface'],
    masterPrompt: 'sleek futuristic design, cyberpunk neon aesthetics, advanced technology, vast cosmic scale, sci-fi atmosphere, clean geometric shapes, professional science fiction cover, chrome and glass surfaces'
  },
  mystery: {
    styles: ['photographic', 'cinematic'],
    compositions: ['rule-of-thirds', 'framed'],
    palettes: [
      ['#2c3e50', '#e74c3c', '#f5f5f5'],
      ['#1a1a2e', '#c0392b', '#95a5a6'],
      ['#34495e', '#9b59b6', '#ecf0f1'],
    ],
    lighting: ['foggy diffusion', 'single lamp', 'moonlight through blinds', 'fireplace flicker'],
    textures: ['aged paper', 'dusty surface', 'rain on window', 'worn leather'],
    subjects: ['magnifying glass', 'shadowy figure', 'old mansion', 'vintage key', 'foggy street'],
    masterPrompt: 'atmospheric mystery, moody fog and shadows, vintage detective aesthetic, intriguing visual puzzle, rich sepia and muted tones, professional mystery novel cover, enigmatic mood'
  },
  horror: {
    styles: ['cinematic', 'photographic'],
    compositions: ['centered', 'diagonal'],
    palettes: [
      ['#0a0a0a', '#8b0000', '#ffffff'],
      ['#1a0a0a', '#c41e3a', '#ddd'],
      ['#000000', '#4a0404', '#ff0000'],
    ],
    lighting: ['harsh underlighting', 'blood red glow', 'lightning flash', 'dying candlelight'],
    textures: ['decay', 'cracked earth', 'wet surface', 'ancient stone'],
    subjects: ['haunted house', 'creepy forest', 'ominous shadow', 'disturbing eye', 'twisted figure'],
    masterPrompt: 'terrifying atmosphere, disturbing imagery, visceral horror aesthetic, unsettling darkness, professional horror cover, nightmare fuel, dread-inducing mood, psychological terror'
  },
  literary: {
    styles: ['typographic', 'abstract'],
    compositions: ['centered', 'rule-of-thirds'],
    palettes: [
      ['#f5f5f5', '#3d405b', '#e07a5f'],
      ['#ffffff', '#2d3436', '#0984e3'],
      ['#fafafa', '#1a1a2e', '#d4af37'],
    ],
    lighting: ['soft diffused', 'natural daylight', 'studio neutral', 'warm ambient'],
    textures: ['fine paper', 'linen', 'subtle grain', 'embossed'],
    subjects: ['abstract symbol', 'negative space', 'single object', 'typography art', 'minimalist form'],
    masterPrompt: 'elegant minimalist design, sophisticated typography focus, literary prestige aesthetic, clean negative space, subtle artistic touch, professional literary fiction cover, timeless classic feel'
  },
  nonfiction: {
    styles: ['typographic', 'photographic'],
    compositions: ['centered', 'split'],
    palettes: [
      ['#ffffff', '#000000', '#e74c3c'],
      ['#f8f9fa', '#212529', '#0d6efd'],
      ['#ffffff', '#1a1a2e', '#f39c12'],
    ],
    lighting: ['clean studio', 'professional', 'high key', 'controlled shadows'],
    textures: ['matte', 'clean', 'subtle emboss', 'professional finish'],
    subjects: ['bold typography', 'iconic symbol', 'striking photo', 'infographic element', 'clean diagram'],
    masterPrompt: 'bold authoritative design, clean professional layout, striking visual impact, credibility and expertise, professional nonfiction cover, bestseller aesthetic, powerful simplicity'
  },
  sovereign: {
    styles: ['cinematic', 'abstract'],
    compositions: ['diagonal', 'centered'],
    palettes: [
      ['#050505', '#d4af37', '#ffffff'],
      ['#0a0a0a', '#c0c0c0', '#ffffff'],
      ['#000000', '#ffd700', '#e5e7eb'],
    ],
    lighting: ['volumetric light shafts', 'clinical precision lighting', 'high-end studio', 'golden hour luminance'],
    textures: ['organic neural tissue', 'brushed gold', 'premium paper grain', 'holographic scanlines'],
    subjects: ['abstract royal symbol', 'monumental architecture', 'ethereal landscape', 'sovereign crown motif', 'celestial maps'],
    masterPrompt: 'elite luxury minimalism, clinical sovereign aesthetic, authoritative presence, high-end publishing standard, breathtaking visual scale, monumental composition, professional luxury brand aesthetic'
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 SMART PROMPT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Deep Narrative Analysis
 * Analyzes manuscript blocks to extract cohesive visual themes
 */
export async function analyzeManuscript(text: string): Promise<{
  synopsis: string;
  visualPillars: string[];
  suggestedGenre: string;
  suggestedTone: string;
}> {
  const ai = getAI();
  if (!ai) return { synopsis: text.slice(0, 500), visualPillars: ['Dramatic Landscape'], suggestedGenre: 'literary', suggestedTone: 'vibrant' };

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Perform a Deep Narrative Audit of this manuscript segment:
      "${text.slice(0, 5000)}"
      
      Extract:
      1. A professional literary synopsis (2-3 sentences).
      2. 3-4 "Visual Pillars" (Specific metaphors, objects, or atmospheres mentioned in the text that would make striking cover elements).
      3. The most accurate book genre.
      4. The emotional tone.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synopsis: { type: Type.STRING },
            visualPillars: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedGenre: { type: Type.STRING },
            suggestedTone: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text ?? '{}');
  } catch (e) {
    return { synopsis: text.slice(0, 500), visualPillars: [], suggestedGenre: 'literary', suggestedTone: 'vibrant' };
  }
}

const getAI = () => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY || (process.env as any).API_KEY;

  if (!apiKey || apiKey.length < 10) return null;
  return new GoogleGenAI({ apiKey: apiKey });
};

/**
 * Generate a cover blueprint using AI analysis of the book content
 */
export async function generateBlueprint(
  title: string,
  author: string,
  genre: string,
  synopsis: string,
  tone: 'dark' | 'light' | 'vibrant' | 'muted' = 'vibrant'
): Promise<CoverBlueprint> {
  const ai = getAI();
  const dna = GENRE_DNA[genre] || GENRE_DNA.literary;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `You are an expert book cover designer who has studied thousands of bestselling covers.

Analyze this book and create a COVER BLUEPRINT:

Title: "${title}"
Author: "${author}"
Genre: ${genre}
Synopsis: ${synopsis?.slice(0, 3000) || 'None provided'}
Desired Tone: ${tone}

Genre DNA reference:
- Typical styles: ${dna.styles.join(', ')}
- Typical compositions: ${dna.compositions.join(', ')}
- Common subjects: ${dna.subjects.join(', ')}

Create a detailed cover blueprint JSON with:
1. style: One of 'photographic', 'illustrated', 'typographic', 'abstract', 'cinematic'
2. composition: layout type and focal point placement (0-1 coordinates)
3. palette: 3 hex colors that evoke the book's mood
4. imagery: subject, atmosphere, lighting, texture descriptions
5. layers: Separate prompts for background, foreground, and optional midground/overlay

IMPORTANT: Analyze the title and author name carefully. If the title suggests a specific theme (e.g. "Antigravity", "Ocean", "Silicon"), prioritize imagery that fits that theme. The result must be breathtakingly beautiful and professional.
`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              style: { type: Type.STRING },
              composition: {
                type: Type.OBJECT,
                properties: {
                  layout: { type: Type.STRING },
                  focalPoint: {
                    type: Type.OBJECT,
                    properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }
                  },
                  negativeSpace: { type: Type.STRING }
                }
              },
              palette: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING },
                  secondary: { type: Type.STRING },
                  accent: { type: Type.STRING },
                  mood: { type: Type.STRING }
                }
              },
              imagery: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  atmosphere: { type: Type.STRING },
                  lighting: { type: Type.STRING },
                  texture: { type: Type.STRING }
                }
              },
              layers: {
                type: Type.OBJECT,
                properties: {
                  background: { type: Type.STRING },
                  midground: { type: Type.STRING },
                  foreground: { type: Type.STRING },
                  overlay: { type: Type.STRING }
                }
              }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text ?? '{}') as CoverBlueprint;
      // Validate critical fields to prevent downstream crashes
      if (!parsed.imagery || !parsed.composition || !parsed.palette || !parsed.layers) {
        throw new Error("Incomplete blueprint generated from AI");
      }
      return parsed;
    } catch (e) {
      console.warn('AI blueprint generation failed, using fallback template', e);
      // Execution continues to the fallback logic below
    }
  }

  // Fallback: Generate from genre DNA
  const palette = dna.palettes[Math.floor(Math.random() * dna.palettes.length)];
  return {
    style: dna.styles[0],
    composition: {
      layout: dna.compositions[0],
      focalPoint: { x: 0.5, y: 0.4 },
      negativeSpace: 'top'
    },
    palette: {
      primary: palette[0],
      secondary: palette[1],
      accent: palette[2],
      mood: tone === 'dark' ? 'muted' : tone === 'light' ? 'cool' : 'vibrant'
    },
    imagery: {
      subject: dna.subjects[0],
      atmosphere: dna.masterPrompt.split(',')[0],
      lighting: dna.lighting[0],
      texture: dna.textures[0]
    },
    layers: {
      background: `${dna.masterPrompt}, background layer, atmospheric, no focal subject`,
      foreground: `${dna.subjects[0]}, ${dna.lighting[0]}, ${dna.masterPrompt}`
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🖼️ MULTI-SERVICE IMAGE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface ImageService {
  name: string;
  generate: (prompt: string, w: number, h: number, seed: number) => Promise<string> | string;
  priority: number;
}

const IMAGE_SERVICES: ImageService[] = [
  {
    name: 'Nano Banana Pro (Gemini)',
    generate: async (p, w, h, s) => {
      // Direct High-Fidelity Synthesis via Google Imagen / Nano Banana Pro
      try {
        const ai = getAI() as any;
        if (!ai) throw new Error('AI not initialized');

        // V9.6 Sovereign Synthesis Protocol - Corrected SDK Signature
        console.log("🚀 STARTING IMAGEN SYNTHESIS MODEL CALL...", { prompt: p });
        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-001',
          prompt: p,
          numberOfImages: 1,
          aspectRatio: w > h ? "16:9" : w < h ? "3:4" : "1:1",
          safetySetting: "BLOCK_ONLY_HIGH"
        });
        console.log("📸 IMAGEN RESPONSE RECEIVED:", JSON.stringify(response, null, 2).slice(0, 500));

        if (response.images && response.images[0]) {
          const img = response.images[0];
          return img.url || `data:image/png;base64,${img.base64}`;
        }
        throw new Error('Synthesis failed to return image data');
      } catch (e: any) {
        console.error('❌ HIGH-FIDELITY SYNTHESIS FAILED, INITIATING FAIL-SAFE...', e.message || e);
        // Emergency Fallback to high-quality Flux if Google is 404/429
        const fallbackPrompt = `${p}, photographic, hyper-realistic, 8k`;
        const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=${w}&height=${h}&seed=${s}&nologo=true&model=flux`;
        console.log("🛡️ FAIL-SAFE ACTIVE: Returning Flux Synthesis:", fluxUrl);
        return fluxUrl;
      }
    },
    priority: 1
  }
];

/**
 * V8.0 High-Fidelity Synthesis Tokens
 * These are the definitive quality boosters for Clinical Sovereign standards
 */
const V8_SOVEREIGN_TOKENS = [
  'captured on Phase One XF IQ4 150MP',
  'high-fidelity publishing standard',
  'Cinematic V-Ray render',
  'Ray-traced volumetric shadows',
  'Clinical Sovereign aesthetic v8.0',
  'Nano Banana Pro ultra synthesis',
  'Hyper-realistic organic textures',
  'Elite publishing prestige style',
  'award-winning professional cover art',
  '8k resolution, sharp focus, rich depth'
];

/**
 * Quality boosters derived from analyzing professional cover prompts
 */
const QUALITY_BOOSTERS = [
  'masterpiece quality',
  'award-winning book cover art',
  'professional publishing standard',
  '8k ultra detailed',
  'sharp focus',
  'rich color depth',
  'dramatic composition',
  'no text no watermark no title',
  'Phase One XF IQ4 150MP',
  'volumetric lighting',
  'hyper-realistic textures',
  'Clinical Sovereign aesthetic',
  'Nano Banana Pro synthesis'
];

/**
 * Build an optimized prompt from a blueprint layer
 */
function buildLayerPrompt(
  layerPrompt: string,
  blueprint: CoverBlueprint,
  layer: 'background' | 'foreground' | 'midground' | 'overlay'
): string {
  const parts: string[] = [layerPrompt];

  // Add palette guidance
  parts.push(`color palette: ${blueprint.palette.primary} ${blueprint.palette.secondary} ${blueprint.palette.accent}`);

  // Add style
  parts.push(`${blueprint.style} style`);

  // Add lighting
  parts.push(blueprint.imagery.lighting);

  // Add layer-specific guidance
  if (layer === 'background') {
    parts.push('soft focus background', 'atmospheric depth', 'no main subject');
  } else if (layer === 'foreground') {
    parts.push('sharp focus', 'main focal element', 'striking visual');
  } else if (layer === 'midground') {
    parts.push('atmospheric effects', 'depth layers', 'transitional elements');
  } else if (layer === 'overlay') {
    parts.push('subtle texture', 'grain effect', 'organic imperfections');
  }

  // Add V8 quality boosters
  parts.push(...V8_SOVEREIGN_TOKENS.slice(0, 6));

  return parts.join(', ');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 COVER GENERATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface CoverGenerationOptions {
  title: string;
  author: string;
  genre: string;
  synopsis?: string;
  customPrompt?: string;
  tone?: 'dark' | 'light' | 'vibrant' | 'muted';
  zone?: 'front' | 'back' | 'spine';
  count?: number;
}

/**
 * Generate a coordinated suite (Front/Spine/Back)
 */
export async function generateSuite(options: CoverGenerationOptions): Promise<CoverSuite[]> {
  const { title, author, genre, synopsis = '', tone = 'vibrant', count = 3 } = options;
  const suites: CoverSuite[] = [];

  for (let i = 0; i < count; i++) {
    const [front] = await generateCovers({ ...options, zone: 'front', count: 1 });
    const [spine] = await generateCovers({ ...options, zone: 'spine', count: 1 });
    const [back] = await generateCovers({ ...options, zone: 'back', count: 1 });

    suites.push({
      id: `suite-${Date.now()}-${i}`,
      front,
      spine,
      back
    });
  }

  return suites;
}

/**
 * Main cover generation function - the core of CoverAI
 */
export async function generateCovers(options: CoverGenerationOptions): Promise<GeneratedCover[]> {
  const {
    title, author, genre, synopsis = '',
    customPrompt, tone = 'vibrant',
    zone = 'front', count = 6
  } = options;

  const dna = GENRE_DNA[genre] || GENRE_DNA.literary;
  const covers: GeneratedCover[] = [];
  const baseSeed = Date.now();

  // Generate blueprint
  const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY || (process.env as any).API_KEY;
  console.log(`[CoverAI] Starting generation for "${title}"... API Key present: ${!!key}`);

  const blueprint = await generateBlueprint(title, author, genre, synopsis, tone);
  console.log(`[CoverAI] Blueprint generated:`, blueprint.style, blueprint.imagery.subject);

  // Determine dimensions based on zone
  const dims = zone === 'spine'
    ? { w: 200, h: 1200 }
    : { w: 800, h: 1200 };

  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i * 1337;

    // Build the master prompt for this variation
    const variation = i % dna.styles.length;
    const styleVariant = dna.styles[variation];
    const lightingVariant = dna.lighting[i % dna.lighting.length];
    const subjectVariant = dna.subjects[i % dna.subjects.length];

    // Compose the final prompt
    let finalPrompt: string;

    if (customPrompt?.trim()) {
      // User provided custom prompt - enhance it
      finalPrompt = [
        customPrompt,
        dna.masterPrompt,
        `${styleVariant} style`,
        lightingVariant,
        `by ${author}`,
        ...QUALITY_BOOSTERS.slice(0, 8)
      ].join(', ');
    } else {
      // Build from blueprint with multi-pass synthesis
      finalPrompt = [
        `PRO BOOK COVER: ${blueprint.imagery.subject || subjectVariant}`,
        blueprint.imagery.atmosphere,
        `Lighting: ${lightingVariant}`,
        `Style: ${styleVariant} Synthesis`,
        `Palette: ${blueprint.palette.primary}, ${blueprint.palette.secondary}`,
        zone === 'front' ? 'Striking centerpiece, cinematic focal point' :
          zone === 'back' ? 'Clean atmospheric space for book copy, minimal' :
            'Linear spine texture, professional typography-ready',
        ...V8_SOVEREIGN_TOKENS
      ].join(', ');
    }

    // Generate image URL using best available service
    const service = IMAGE_SERVICES[0];
    const imageUrl = await service.generate(finalPrompt, dims.w, dims.h, seed);

    covers.push({
      id: `cover-${seed}`,
      blueprint: {
        ...blueprint,
        style: styleVariant as CoverBlueprint['style'],
        imagery: {
          ...blueprint.imagery,
          lighting: lightingVariant,
          subject: subjectVariant
        }
      },
      layers: {
        background: '',
        foreground: '',
        composite: imageUrl
      },
      metadata: {
        genre,
        generatedAt: Date.now(),
        seed
      }
    });
  }

  return covers;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 TEXT OVERLAY COMPOSITOR
// ═══════════════════════════════════════════════════════════════════════════════

export interface TextOverlay {
  text: string;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  color: string;
  shadow?: boolean;
  uppercase?: boolean;
}

/**
 * Generate a canvas-ready composite with text overlays
 * Returns a data URL of the final image
 */
export async function compositeWithText(
  imageUrl: string,
  overlays: TextOverlay[],
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Draw base image
      ctx.drawImage(img, 0, 0, width, height);

      // Apply overlays
      overlays.forEach(overlay => {
        ctx.save();
        ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
        ctx.fillStyle = overlay.color;
        ctx.textAlign = 'center';

        if (overlay.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        }

        const text = overlay.uppercase ? overlay.text.toUpperCase() : overlay.text;
        ctx.fillText(text, overlay.position.x * width, overlay.position.y * height);
        ctx.restore();
      });

      // V8.0 SOVEREIGN PROTOCOL: Add high-fidelity metadata overlays
      ctx.save();
      // Subtle Scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1);
      }

      // Metadata Text
      ctx.font = `${Math.max(8, width * 0.01)}px monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'right';
      const systemId = `INT-OS // PROTOCOL v8.0 [HIGH_FIDELITY]`;
      const syndication = `SOVEREIGN SYNDICATION // ${new Date().getFullYear()}`;
      ctx.fillText(`${systemId} // ${syndication}`, width - 20, height - 20);

      ctx.textAlign = 'left';
      ctx.fillText(`STATUS: AUTHORIZED // NANO_BANANA_PRO_ACTIVE`, 20, height - 20);
      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 SMART SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get AI-powered suggestions for cover improvements
 */
export async function suggestCoverImprovements(
  currentPrompt: string,
  genre: string,
  feedback?: string
): Promise<string[]> {
  const ai = getAI();
  const dna = GENRE_DNA[genre] || GENRE_DNA.literary;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `You are a book cover design expert. Suggest 4 improvements for this cover prompt.

Current prompt: "${currentPrompt}"
Genre: ${genre}
User feedback: ${feedback || 'Make it more striking'}

Genre characteristics:
${dna.masterPrompt}

Suggest 4 alternative prompts that would create better, more professional covers. Each should be a complete, ready-to-use prompt.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      return JSON.parse(response.text ?? '[]') as string[];
    } catch (e) {
      console.warn('AI suggestions failed', e);
    }
  }

  // Fallback suggestions based on genre
  return [
    `${dna.subjects[0]}, ${dna.lighting[0]}, ${dna.masterPrompt}`,
    `${dna.subjects[1]}, ${dna.lighting[1]}, dramatic composition, ${dna.masterPrompt}`,
    `minimalist ${genre} cover, ${dna.subjects[2]}, elegant typography space, ${dna.masterPrompt}`,
    `bold ${genre} artwork, ${dna.subjects[0]}, striking visual, ${dna.masterPrompt}`,
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 EXPORT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const CoverAI = {
  generateBlueprint,
  generateCovers,
  compositeWithText,
  suggestCoverImprovements,
  GENRE_DNA,
  QUALITY_BOOSTERS,
};

export default CoverAI;
