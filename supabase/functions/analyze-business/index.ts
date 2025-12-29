import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY not configured');
    }

    const { businessData } = await req.json();
    console.log('Analyzing business:', businessData.businessName);

    const analysisPrompt = `Analyze this MLM/network marketing business comprehensively:

Business: ${businessData.businessName}
Company: ${businessData.companyName}
Industry: ${businessData.industry}
Experience: ${businessData.experience}
Current Rank: ${businessData.currentRank}
Monthly Income: ${businessData.monthlyIncome}
Team Size: ${businessData.teamSize}
Products: ${businessData.mainProducts}
Target Market: ${businessData.targetMarket}
Goals: Income: ${businessData.goals?.income}, Team: ${businessData.goals?.teamSize}, Timeline: ${businessData.goals?.timeline}
Challenges: ${businessData.challenges}

Provide a detailed analysis in JSON format with this EXACT structure (no markdown, pure JSON):
{
  "brandScore": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "threats": ["string"],
  "recommendations": {
    "immediate": ["string"],
    "shortTerm": ["string"],
    "longTerm": ["string"]
  },
  "marketPosition": "string",
  "competitiveAdvantage": "string",
  "growthPotential": "string",
  "targetAudienceInsights": ["string"],
  "contentStrategy": {
    "themes": ["string"],
    "platforms": ["string"],
    "frequency": "string"
  },
  "nextSteps": ["string"]
}

Be specific, actionable, and honest in your analysis.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(GOOGLE_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: analysisPrompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const analysisText =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') || '';
    
    // Clean and parse JSON
    let analysis;
    try {
      const cleaned = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback structure
      analysis = {
        brandScore: 65,
        strengths: ['Existing customer base', 'Industry experience'],
        weaknesses: ['Limited online presence', 'Need better content strategy'],
        opportunities: ['Digital expansion', 'Social media growth'],
        threats: ['Market saturation', 'Competition'],
        recommendations: {
          immediate: ['Set up professional social media profiles', 'Create content calendar'],
          shortTerm: ['Build email list', 'Launch lead magnet'],
          longTerm: ['Scale team', 'Develop personal brand']
        },
        marketPosition: 'Emerging player with growth potential',
        competitiveAdvantage: 'Personal relationships and authenticity',
        growthPotential: 'High with proper digital strategy',
        targetAudienceInsights: ['Value authenticity', 'Seek community'],
        contentStrategy: {
          themes: ['Education', 'Transformation', 'Community'],
          platforms: ['Instagram', 'Facebook', 'TikTok'],
          frequency: 'Daily posts, 3x weekly stories'
        },
        nextSteps: ['Complete brand identity', 'Set up content system', 'Launch outreach campaign']
      };
    }

    return new Response(JSON.stringify({
      success: true,
      analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing business:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
