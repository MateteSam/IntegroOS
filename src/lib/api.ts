import { supabase } from '@/integrations/supabase/client';
import { generateBEASTStrategy, generateMarketAnalysis, generateBrandAsset, generateAIText } from './ai';

export type BrandRequest = {
  businessName: string;
  industry: string;
  targetAudience: string;
  brandPersonality: string;
  colors: string[];
  competitors: string;
  values: string[];
  mission: string;
};

export type ServerResponse = {
  success: boolean;
  error?: string;
  assets: {
    logo: { primary: string; alternative: string; icon: string };
    colors: { primary: string; secondary: string; accent1: string; accent2: string };
    typography: { headingFont: string; bodyFont: string };
    brandGuidelines: {
      mission: string;
      values: string[];
      voice: { personality: string; tone: string[]; keywords: string[] };
      targetAudience: string[];
      brandPromise: string;
      usage: { primary: string; alternative: string; icon: string };
    };
  };
};

export async function generateBrandAssetsAPI(payload: BrandRequest): Promise<ServerResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-brand-assets', {
      body: { brandData: payload }
    });

    if (!error && data) return data as ServerResponse;
  } catch (error) {
    console.warn('Edge Function brand asset generation failed, falling back to local intelligence');
  }

  // Fallback to resilient synthesis
  const asset = await generateBrandAsset({
    assetType: 'logo',
    prompt: `Professional logo for ${payload.businessName} in ${payload.industry} industry, personality: ${payload.brandPersonality}`
  });

  return {
    success: true,
    assets: {
      logo: { primary: asset.imageUrl, alternative: asset.imageUrl, icon: asset.imageUrl },
      colors: {
        primary: payload.colors[0] || "#2563eb",
        secondary: payload.colors[1] || "#1e40af",
        accent1: payload.colors[2] || "#f59e0b",
        accent2: payload.colors[3] || "#059669"
      },
      typography: { headingFont: "Inter", bodyFont: "Inter" },
      brandGuidelines: {
        mission: payload.mission,
        values: payload.values,
        voice: { personality: payload.brandPersonality, tone: ["Professional"], keywords: ["Innovative"] },
        targetAudience: [payload.targetAudience],
        brandPromise: "Excellence delivered",
        usage: { primary: asset.imageUrl, alternative: asset.imageUrl, icon: asset.imageUrl }
      }
    }
  };
}

export async function analyzeBusinessAPI(businessData: any): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-business', {
      body: { businessData }
    });

    if (!error && data) return data;
  } catch (error) {
    console.warn('Edge Function business analysis failed, falling back to local intelligence');
  }

  return generateMarketAnalysis(
    businessData.businessName,
    businessData.industry,
    businessData.location || 'Global',
    businessData.targetAudience || 'General',
    businessData.competitors ? businessData.competitors.split(',') : []
  );
}

export async function generateContentAPI(contentRequest: {
  contentType: string;
  topic: string;
  tone?: string;
  targetAudience?: string;
  brandData?: any;
}): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: contentRequest
    });

    if (!error && data) return data;
  } catch (error) {
    console.warn('Edge Function content generation failed, falling back to local intelligence');
  }

  const prompt = `Generate ${contentRequest.contentType} about ${contentRequest.topic} for ${contentRequest.targetAudience || 'general audience'} with a ${contentRequest.tone || 'professional'} tone.`;
  const res = await generateAIText(prompt);
  return { success: true, content: res.text };
}

export async function generateStrategyAPI(strategyRequest: {
  businessData?: any;
  goals?: string;
  timeframe?: string;
}): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-strategy', {
      body: strategyRequest
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Edge Function strategy generation failed, falling back to local intelligence:', error);
    try {
      const strategy = await generateBEASTStrategy(
        strategyRequest.businessData,
        strategyRequest.goals || 'General growth',
        strategyRequest.timeframe || '1 year'
      );
      return { success: true, strategy };
    } catch (fallbackError) {
      console.error('Local strategy fallback failed:', fallbackError);
      throw new Error('Failed to generate strategy. Please try again.');
    }
  }
}
