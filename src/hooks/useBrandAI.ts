import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { generateAIText } from '@/lib/ai';

export const useBrandAI = () => {
    const { activeProject } = useProject();
    const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);

    const getSuggestion = async (field: string, context?: any): Promise<string> => {
        if (!suggestionsEnabled) return '';
        if (!activeProject) return '';

        const brandData = activeProject.brandData;

        try {
            const contextStr = context || JSON.stringify(brandData);
            const prompts: Record<string, string> = {
                mission: `Based on a ${brandData.industry} business named "${brandData.businessName}", suggest a compelling mission statement (1-2 sentences).`,
                vision: `Based on a ${brandData.industry} business named "${brandData.businessName}" with mission "${brandData.mission}", suggest an inspiring vision statement (1-2 sentences).`,
                brandStory: `Create a brief brand story (2-3 sentences) for "${brandData.businessName}", a ${brandData.industry} company with mission: "${brandData.mission}"`,
                targetAudience: `Describe the ideal target audience for a ${brandData.industry} business named "${brandData.businessName}" (1-2 sentences).`,
                customerPainPoints: `List 3-5 pain points that customers of a ${brandData.industry} business typically face.`,
                emotionalGoal: `What emotional response should "${brandData.businessName}" (${brandData.industry}) evoke in customers? (1 sentence)`,
                differentiation: `Based on "${brandData.businessName}" being in ${brandData.industry}, suggest 2-3 unique differentiators that would set it apart.`,
                headline: `Create a compelling headline for ${brandData.businessName} (${brandData.industry}). Mission: ${brandData.mission}`,
                tagline: `Create a memorable tagline for ${brandData.businessName} that embodies: ${brandData.brandPersonality}`,
                description: `Write a brief business description for ${brandData.businessName} (${brandData.industry}). Target audience: ${brandData.targetAudience}`,
            };

            // Enhanced prompting if previous data exists
            const activePrompt = prompts[field] || `Suggest content for ${field} based on: ${contextStr.substring(0, 300)}`;

            // Primary: Edge Function
            let data, error;
            try {
                const res = await supabase.functions.invoke('generate-brand-copy', {
                    body: {
                        prompt: activePrompt,
                        type: 'suggestion',
                        brandContext: brandData
                    }
                });
                data = res.data;
                error = res.error;
            } catch (e) {
                console.warn('Edge Function unreachable for brand suggestions, falling back to local AI');
                error = true;
            }

            if (error) {
                // Fallback: Local AI
                const res = await generateAIText(activePrompt, "You are a brand strategy expert.");
                return res.text || '';
            }

            return data?.text || '';
        } catch (error) {
            console.error('Failed to get suggestion:', error);
            return '';
        }
    };

    return {
        getSuggestion,
        suggestionsEnabled,
        setSuggestionsEnabled
    };
};
