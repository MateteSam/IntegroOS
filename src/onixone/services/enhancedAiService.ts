import { GoogleGenAI, Type } from "@google/genai";
import { StoryBlock, TextStoryBlock, DesignTheme, FontFamily, ContentIssue, ContentSuggestion, ManuscriptProfile, ManuscriptAnalysis, ENHANCED_TEMPLATE_STYLES } from '../types';

const TEXT_MODEL_NAME = 'gemini-2.0-flash';
const IMAGE_MODEL_NAME = 'gemini-2.0-flash-exp';

declare const process: { env: { API_KEY?: string; GEMINI_API_KEY?: string } };

// Check if API key is available
const hasApiKey = (): boolean => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  return !!apiKey && apiKey.length > 10;
};

const getAIClient = () => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey || apiKey.length < 10) {
    throw new Error(
      "🔑 AI API Key Required! Please set VITE_GEMINI_API_KEY in your .env.local file."
    );
  }
  return new GoogleGenAI({ apiKey });
};

// Enhanced cover image generation with V8 High-Fidelity Synthesis
export const generateCoverImage = async (prompt: string, zone: 'front' | 'back' | 'spine' = 'front', numImages: number = 4): Promise<string[]> => {
  try {
    const { generateCovers } = await import('./coverAI');
    const covers = await generateCovers({
      title: prompt,
      author: 'Unknown',
      genre: 'Professional',
      synopsis: prompt,
      tone: 'vibrant',
      zone,
      count: numImages
    });
    return covers.map(c => c.layers.composite);
  } catch (e) {
    console.error("Could not generate high-fidelity cover images", e);
    return [];
  }
};


// Original functions (kept for compatibility)
export const generateBackCoverText = async (summary: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: `Based on the following book summary, write a compelling, short back-cover blurb (2-3 paragraphs) to entice readers.
Summary: "${summary}"`
    });
    return response.text ?? "Discover a story that will change the way you see the world.";
  } catch (e) {
    console.error("Could not generate back cover text", e);
    return "Discover a story that will change the way you see the world. Inside, you'll find characters that come to life and a plot that will keep you on the edge of your seat.";
  }
};

export const generateDesignTheme = async (summary: string): Promise<DesignTheme> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: `Based on this book summary, generate a design theme as a JSON object.
- The color palette should have 5 hex codes: primary, secondary, accent, text, and background.
- The fonts should have a 'header' and 'body' font. Choose from: 'Playfair Display', 'Roboto', 'Open Sans', 'Times-Roman', 'Dancing Script'.
- The imageryStyle should be a short, descriptive phrase for finding stock photos (e.g., 'minimalist nature photography', 'dark academia aesthetic', 'vibrant abstract illustrations').

Summary: "${summary}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            palette: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING }, secondary: { type: Type.STRING }, accent: { type: Type.STRING }, text: { type: Type.STRING }, background: { type: Type.STRING }
              },
              required: ["primary", "secondary", "accent", "text", "background"]
            },
            fonts: {
              type: Type.OBJECT,
              properties: { header: { type: Type.STRING }, body: { type: Type.STRING } },
              required: ["header", "body"]
            },
            imageryStyle: { type: Type.STRING }
          },
          required: ["palette", "fonts", "imageryStyle"]
        }
      }
    });

    const theme = JSON.parse(response.text ?? '{}') as DesignTheme;
    const validFonts: FontFamily[] = ['Playfair Display', 'Roboto', 'Open Sans', 'Times-Roman', 'Dancing Script', 'Helvetica', 'Courier'];
    if (!validFonts.includes(theme.fonts.header)) theme.fonts.header = 'Playfair Display';
    if (!validFonts.includes(theme.fonts.body)) theme.fonts.body = 'Roboto';
    return theme;

  } catch (error) {
    console.error("Error generating design theme:", error);
    return {
      palette: { primary: '#312e81', secondary: '#cbd5e1', accent: '#4f46e5', text: '#0f172a', background: '#f8fafc' },
      fonts: { header: 'Playfair Display', body: 'Roboto' },
      imageryStyle: 'general abstract background'
    };
  }
};