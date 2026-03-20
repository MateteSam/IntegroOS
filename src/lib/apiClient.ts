import { supabase } from '@/integrations/supabase/client';
import {
  generateBEASTStrategy,
  generateMarketAnalysis,
  generateBrandAsset,
  generateAIText,
  enhanceBrandPrompt,
  extractBrandDNA,
  generateBrandNexus,
  generateMockup,
  generateVideoStoryboard,
  generateVideoFile,
  generateWebsiteArchitecture,
  findNeuralProspects
} from './ai';
import { cache } from './cacheManager';
import { rateLimiter, RATE_LIMITS } from './rateLimiter';

export interface ApiClientConfig {
  enableCache?: boolean;
  enableRateLimit?: boolean;
  timeout?: number;
}

class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      enableCache: true,
      enableRateLimit: true,
      timeout: 15000,
      ...config
    };
  }

  // Generic method for Supabase function calls with fallbacks
  private async callFunction<T>(
    functionName: string,
    payload: any,
    fallbackFn?: () => Promise<T>,
    cacheKey?: string
  ): Promise<T> {
    // Check cache first
    if (this.config.enableCache && cacheKey) {
      const cached = cache.get<T>(cacheKey);
      if (cached) return cached;
    }

    // Check rate limit
    if (this.config.enableRateLimit && !rateLimiter.check(functionName, RATE_LIMITS.AI_GENERATION)) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }

    // Call Supabase function with potential retry for network errors
    let response;
    try {
      response = await supabase.functions.invoke(functionName, {
        body: payload
      });
    } catch (invokeError: any) {
      // If it's a network/DNS error, try one more time after a short delay
      if (invokeError.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        console.warn(`[API] Transient network error for ${functionName}, retrying in 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        response = await supabase.functions.invoke(functionName, {
          body: payload
        });
      } else {
        throw invokeError;
      }
    }

    const { data, error } = response;

    if (!error && data) {
      // Cache successful response
      if (this.config.enableCache && cacheKey) {
        cache.set(cacheKey, data, 1000 * 60 * 5); // 5 minutes
      }
      return data;
    }

    // Fallback to local implementation
    if (fallbackFn) {
      console.warn(`Supabase function '${functionName}' failed, using fallback`);
      const fallbackResult = await fallbackFn();
      if (this.config.enableCache && cacheKey) {
        cache.set(cacheKey, fallbackResult, 1000 * 60 * 5);
      }
      return fallbackResult;
    }

    throw new Error(`Function ${functionName} failed and no fallback available`);
  }

  // Brand Asset Generation
  async generateBrandAsset(payload: any): Promise<any> {
    // Force direct implementation to bypass unintended geometric fallbacks
    try {
      return await generateBrandAsset(payload);
    } catch (e: any) {
      console.error('[Brand Asset] Crucial Generation Failure:', e.message);
      throw e;
    }
  }

  // Brand Strategy Generation
  async generateStrategy(payload: any): Promise<any> {
    return this.callFunction(
      'generate-strategy',
      payload,
      async () => ({
        success: true,
        strategy: await generateBEASTStrategy(
          payload.businessData,
          payload.goals || 'General growth',
          payload.timeframe || '1 year'
        )
      }),
      `strategy-${JSON.stringify(payload).slice(0, 100)}`
    );
  }

  // Market Analysis
  async analyzeMarket(payload: any): Promise<any> {
    return this.callFunction(
      'analyze-market',
      payload,
      () => generateMarketAnalysis(
        payload.businessName,
        payload.industry,
        payload.location || 'Global',
        payload.targetAudience || 'General',
        payload.competitors ? payload.competitors.split(',') : []
      ),
      `market-analysis-${payload.businessName}-${payload.industry}`
    );
  }

  // Business Analysis
  async analyzeBusiness(payload: any): Promise<any> {
    return this.callFunction(
      'analyze-business',
      payload,
      () => generateMarketAnalysis(
        payload.businessName,
        payload.industry,
        payload.location || 'Global',
        payload.targetAudience || 'General',
        payload.competitors ? payload.competitors.split(',') : []
      ),
      `business-analysis-${payload.businessName}`
    );
  }

  // Content Generation
  async generateContent(payload: any): Promise<any> {
    return this.callFunction(
      'generate-content',
      payload,
      async () => ({
        success: true,
        content: await generateAIText(
          `Generate ${payload.contentType} about ${payload.topic} for ${payload.targetAudience || 'general audience'} with a ${payload.tone || 'professional'} tone.`,
          payload.systemPrompt
        ).then(res => res.text)
      }),
      `content-${payload.contentType}-${payload.topic?.slice(0, 50)}`
    );
  }

  // Brand DNA Extraction
  async extractBrandDNA(imageUrl: string, assetType: string): Promise<any> {
    return this.callFunction(
      'extract-brand-dna',
      { imageUrl, assetType },
      async () => extractBrandDNA(imageUrl, assetType),
      `brand-dna-${imageUrl.slice(-20)}`
    );
  }

  // Brand Nexus Generation
  async generateBrandNexus(payload: any): Promise<any> {
    return this.callFunction(
      'generate-brand-nexus',
      payload,
      async () => generateBrandNexus(payload),
      `brand-nexus-${JSON.stringify(payload).slice(0, 100)}`
    );
  }

  // Mockup Generation
  async generateMockup(payload: any): Promise<any> {
    return this.callFunction(
      'generate-mockup',
      payload,
      async () => generateMockup(payload),
      `mockup-${JSON.stringify(payload).slice(0, 100)}`
    );
  }

  // Video Storyboard Generation
  async generateVideoStoryboard(payload: any): Promise<any> {
    return this.callFunction(
      'generate-video-storyboard',
      payload,
      async () => generateVideoStoryboard(payload),
      `video-storyboard-${payload.title}`
    );
  }

  // Video File Generation
  async generateVideoFile(payload: any): Promise<any> {
    return this.callFunction(
      'generate-video-file',
      payload,
      async () => generateVideoFile(payload.storyboard, payload.title, payload.style, payload.duration || 15),
      `video-file-${payload.title}`
    );
  }

  // Website Architecture Generation
  async generateWebsite(payload: any): Promise<any> {
    return this.callFunction(
      'generate-website',
      payload,
      async () => generateWebsiteArchitecture(payload),
      `website-${payload.businessName}`
    );
  }

  // Neural Prospect Finder
  async findNeuralProspects(business: string, industry: string, targetAudience: string): Promise<any[]> {
    return this.callFunction(
      'find-neural-prospects',
      { business, industry, targetAudience },
      async () => findNeuralProspects(business, industry, targetAudience),
      `prospects-${business}-${industry}`
    );
  }

  // Content Enhancement
  async enhancePrompt(prompt: string): Promise<string> {
    return enhanceBrandPrompt(prompt);
  }

  // Generic AI Text Generation
  async generateText(prompt: string, system?: string): Promise<string> {
    const result = await generateAIText(prompt, system);
    return result.text;
  }

  // User Data Operations with Local Fallback
  async saveUserDesign(userId: string, designData: any): Promise<any> {
    try {
      const { error } = await supabase.from("user_designs").insert([{
        user_id: userId,
        asset_type: "ai-brand-asset",
        title: designData.title || `${designData.prompt?.substring(0, 50)}...`,
        data: designData,
      }]);

      if (error) throw error;
      return { success: true };
    } catch (dbError: any) {
      console.warn('[API] Supabase save failed, using local storage fallback:', dbError.message);

      // Fallback to local storage
      const localKey = `local-designs-${userId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      const newDesign = {
        id: `local-${Date.now()}`,
        user_id: userId,
        asset_type: "ai-brand-asset",
        title: designData.title || `${designData.prompt?.substring(0, 50)}...`,
        data: designData,
        created_at: new Date().toISOString()
      };

      localStorage.setItem(localKey, JSON.stringify([newDesign, ...existing].slice(0, 50)));
      return { success: true, local: true };
    }
  }

  async loadUserDesigns(userId: string, limit = 20): Promise<any[]> {
    const cacheKey = `user-designs-${userId}`;
    const cached = cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const performFetch = async () => {
      try {
        const result = await supabase
          .from("user_designs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit);
        return result;
      } catch (e: any) {
        return { data: null, error: e };
      }
    };

    let response;
    try {
      response = await performFetch();
    } catch (e) {
      response = { data: null, error: e };
    }

    const { data, error } = response;

    if (error) {
      console.warn('[API] Failed to load designs from Supabase, checking local storage:', error.message);

      // Check local storage fallback
      const localKey = `local-designs-${userId}`;
      const localData = JSON.parse(localStorage.getItem(localKey) || '[]');

      if (localData.length > 0) {
        console.log(`[API] ✓ Loaded ${localData.length} designs from local storage`);
        cache.set(cacheKey, localData, 1000 * 60 * 5);
        return localData;
      }

      return [];
    }

    cache.set(cacheKey, data || [], 1000 * 60 * 5); // 5 minutes
    return data || [];
  }

  // Analytics
  async getAnalyticsData(timeframe: string): Promise<any> {
    const cacheKey = `analytics-${timeframe}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("ai_generations")
      .select("*")
      .gte("created_at", this.getTimeframeStart(timeframe))
      .order("created_at", { ascending: false });

    if (error) throw error;

    const analytics = this.processAnalyticsData(data || []);
    cache.set(cacheKey, analytics, 1000 * 60 * 10); // 10 minutes
    return analytics;
  }

  private getTimeframeStart(timeframe: string): string {
    const now = new Date();
    switch (timeframe) {
      case 'today': now.setHours(0, 0, 0, 0); break;
      case 'yesterday': now.setDate(now.getDate() - 1); now.setHours(0, 0, 0, 0); break;
      case 'last7days': now.setDate(now.getDate() - 7); break;
      case 'last30days': now.setDate(now.getDate() - 30); break;
      default: now.setDate(now.getDate() - 7);
    }
    return now.toISOString();
  }

  private processAnalyticsData(data: any[]): any {
    const totalGenerations = data.length;
    const byType = data.reduce((acc: any, item: any) => {
      acc[item.generation_type] = (acc[item.generation_type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalGenerations,
      generationsByType: byType,
      recentActivity: data.slice(0, 5)
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom configurations
export { ApiClient };