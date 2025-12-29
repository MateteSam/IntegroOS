import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business, industry, location, targetAudience, competitors } = await req.json();
    console.log('Analyzing market for:', business);

    const competitorsList = competitors?.length ? competitors.join(', ') : 'Unknown';

    const analysisPrompt = `You are the Lead Intelligence Officer for a 2026 Global Command Center.
Conduct a high-fidelity, predictive market analysis for "${business}" in the ${industry} industry.

### 2026 Intelligence Parameters:
- Shift from Search to Intent-based Discovery.
- Proliferation of AI agents as the primary consumer/prospect interface.
- Real-time competitive agility and hyper-local targeting.

Location: ${location || 'Global'}
Target Audience: ${targetAudience || 'General'}
Known Competitors: ${competitorsList}

Analyze:
1. **Market Vitality 2026**: Current size, predicted velocity, and saturation points.
2. **Agentic Opportunity**: Where can AI agents replace manual human outreach for this business?
3. **Competitive Gaps**: What are competitors ${competitorsList} missing in their 2026 stack?
4. **Deep Psychographics**: Beyond demographics—what are the specific Intent signals of the audience?
5. **Strategic Pivot points**: What should this business do differently to BE A BEAST?

Return ONLY valid JSON with this structure:
{
  "marketSize": "string ($ value)",
  "growthRate": "percentage (velocity)",
  "competitorCount": number,
  "marketAttractiveness": number (1-10),
  "opportunities": ["AI-driven opportunities"],
  "threats": ["2026 specific threats"],
  "recommendations": ["Directives for Success"],
  "topCompetitors": [
    {
      "name": "string",
      "marketShare": "string",
      "strength": "string",
      "vulnerability": "How we beat them"
    }
  ],
  "targetPsychographics": ["Intent signals and behaviors"],
  "automationHotspots": ["Specific tasks for agentic deployment"]
}`;

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: analysisPrompt }]
        }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      throw new Error('No analysis generated from Gemini');
    }

    let analysis;
    try {
      const cleaned = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Invalid JSON received from AI');
    }

    // Save to database
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const userId = req.headers.get('x-user-id');
      if (userId) {
        await supabaseClient.from('ai_generations').insert({
          user_id: userId,
          generation_type: 'market_analysis',
          prompt: analysisPrompt,
          result: analysis,
          model: 'google/gemini-1.5-pro'
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing market:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
