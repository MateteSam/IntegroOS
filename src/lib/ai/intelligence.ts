import { generateAIText } from './core';
import { generateAIImage } from './image';

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
export async function enhanceBrandPrompt(prompt: string) {
  const sys = "You are a Neural Vision Architect. Enhance any brand prompt into a high-fidelity, clinical, Sovereign-style visual specification.";
  const result = await generateAIText(`Enhance this brand prompt for 8K synthesis: ${prompt}`, sys);
  return result.text;
}
export async function generateWorkflowBlueprint(trigger: string, objective: string) {
  const prompt = `Architect a 2026 AI Workflow Blueprint.
  Trigger: ${trigger}
  Objective: ${objective}
  
  Return ONLY JSON: {
    "title": "string",
    "impactMetric": "string (e.g. 85% automated or 12h saved/wk)",
    "steps": [
      { "id": 1, "agent": "Agent Name", "action": "Specific Action", "output": "Output Description" }
    ],
    "humanInTheLoop": "Description of human intervention points"
  }`;

  const res = await generateAIText(prompt, "You are a 2026 Workflow Architect.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse workflow intelligence");
  }
}
export async function generateAgentProfile(type: string, description: string) {
  const prompt = `Architect a specialized 2026 AI Agent Profile.
  Type: ${type}
  Mission: ${description}
  
  Return ONLY JSON: {
    "name": "string (Agent Name)",
    "personality": "string (Personality trait)",
    "accentColor": "string (Hex color)",
    "responsibilities": ["string", "string", "string"],
    "suggestedTools": ["string", "string", "string"],
    "initialSOP": "Text description of initial deployment SOP"
  }`;

  const res = await generateAIText(prompt, "You are a specialized AI Agent Architect.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse agent intelligence");
  }
}
export async function generateWebsiteArchitecture(config: any) {
  const prompt = `Generate a modern, high-conversion website architecture for: ${config.businessName} in ${config.industry}.
  Style: ${config.style} | Features: ${config.features.join(', ')}
  Return ONLY JSON matching the website schema: { "pages": { "home": "html string" }, "css": "string", "javascript": "string" }`;

  const res = await generateAIText(prompt, "You are a Neural Web Architect.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { website: parsed };
  } catch (e) {
    return {
      website: {
        pages: { home: `<div class="p-20 text-center"><h1 class="text-6xl font-bold">${config.businessName}</h1><p class="mt-4 text-xl">Coming Soon in ${config.industry}</p></div>` },
        css: "body { background: #0f172a; color: white; font-family: sans-serif; }",
        javascript: "console.log('Website initialized');"
      }
    };
  }
}
export async function generateVideoStoryboard(config: any) {
  const prompt = `Create a cinematic video storyboard for: ${config.title}.
  Brand: ${config.brandContext?.businessName} | Purpose: ${config.description} | Style: ${config.style}
  Return JSON: { "storyboard": [ { "scene": 1, "visual": "description", "text": "overlay text", "audio": "audio cue" } ] }`;

  const res = await generateAIText(prompt, "You are a Cinematic Storyboard Architect.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    return { storyboard: JSON.parse(cleaned).storyboard };
  } catch (e) {
    return { storyboard: [{ scene: 1, visual: "Title card with business logo", text: config.title, audio: "Professional intro music" }] };
  }
}

export async function generateVideoFile(storyboard: any, title: string, style: string, duration: number) {
  // This is a complex synthesis that would normally call a video engine
  // Returning a structured mock response for the Motion Lab Protocol
  return {
    video: {
      url: `data:text/html;base64,${btoa(`<html><body style="background:black;color:gold;display:flex;align-items:center;justify-content:center;height:100vh;font-family:serif;text-align:center;"><div><h1 style="font-size:4rem;">${title}</h1><p style="font-size:1.5rem;opacity:0.8;">Sovereign Motion Synthesis | ${style} | ${duration}s</p></div></body></html>`)}`,
      thumbnail: `data:image/svg+xml;base64,${btoa(`<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="48" fill="#f59e0b">${title}</text></svg>`)}`
    }
  };
}
export async function generateMockup(config: any) {
  const prompt = `Create a high-fidelity 3D mockup for: ${config.assetType}.
  Context: ${config.assetUrl} | Brand: ${config.brandContext?.businessName}
  Return a cinematic image representation.`;

  const res = await generateAIImage(prompt);
  return { imageUrl: res.imageUrl || config.assetUrl };
}
export async function extractBrandDNA(imageUrl: string, assetType: string) {
  const prompt = `Analyze this ${assetType} (${imageUrl}) and extract its Brand DNA.
  Return ONLY JSON: { "colorPalette": { "primary": "hex", "secondary": "hex", "accent1": "hex", "accent2": "hex" }, "typography": { "style": "str", "weight": "str", "category": "str" }, "visualStyle": { "aesthetic": "str", "keywords": ["str"] }, "designElements": ["str"], "brandPersonality": { "tone": "str", "traits": ["str"] } }`;

  const res = await generateAIText(prompt, "You are a Brand Intelligence Auditor.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      colorPalette: { primary: "#2563eb", secondary: "#1e40af", accent1: "#f59e0b", accent2: "#059669" },
      typography: { style: "Modern", weight: "Bold", category: "Sans-serif" },
      visualStyle: { aesthetic: "Clean/Corporate", keywords: ["Professional", "Reliable"] },
      designElements: ["Geometric shapes", "High contrast"],
      brandPersonality: { tone: "Professional", traits: ["Innovative", "Trustworthy"] }
    };
  }
}

export async function generateBrandNexus(payload: any) {
  const prompt = `Synthesize a complete brand identity for: ${JSON.stringify(payload.questionnaireData)}.
  Stage: ${payload.stage}
  Return ONLY JSON: { "logos": { "concepts": [{ "id": 1, "name": "string", "url": "string" }] }, "colors": { "primary": "hex", "secondary": "hex" }, "typography": { "title": "font", "body": "font" } }`;

  const res = await generateAIText(prompt, "You are a Brand Intelligence Architect.");
  try {
    const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to synthesize brand intelligence");
  }
}
