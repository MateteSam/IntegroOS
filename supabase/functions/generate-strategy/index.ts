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
    const { businessData, goals, timeframe } = await req.json();
    console.log('Generating strategy for:', businessData?.businessName);

    const strategyPrompt = `You are a world-class Strategic Orchestrator for the year 2026 and beyond. 
Create a hyper-detailed, ACTIONABLE, and researched-backed business strategy.

### 2026 Context & Trends to Incorporate:
- Agentic AI as the core operating system (autonomous agents handling prospecting, SEO, and operations).
- Conversational search dominates marketing; hyper-personalization at scale.
- Skills-based staffing over credential-based (human-AI collaboration).
- Dynamic, real-time budget adjustments based on live ROI data.

### Business Context:
${businessData ? `
- Business: ${businessData.businessName}
- Industry: ${businessData.industry}
- Stage: ${businessData.currentRank || 'Startup/Growth'}
- Target Market: ${businessData.targetMarket}
` : 'General Business Enterprise'}

Goals: ${goals || 'Dominate market and achieve exponential growth'}
Timeframe: ${timeframe || '1 year'}

Generate a comprehensive "BEAST" strategy in JSON format with this structure:
{
  "overview": "Strategic summary for 2026 domination",
  "objectives": ["3-5 SMART goals"],
  "strategies": [
    {
      "category": "Lead Gen / Automation / Brand / Ops",
      "tactics": ["Step-by-step tactical moves"],
      "automationPotential": "High/Medium layer",
      "expectedROI": "string"
    }
  ],
  "staffingEstimation": {
    "totalHeadcount": number,
    "roles": [
      {
        "title": "Role Name",
        "description": "How they watch/manage the AI agents",
        "estimatedHours": "number/week"
      }
    ]
  },
  "automationEcosystem": {
    "agenticWorkflows": ["Specific AI processes to automate"],
    "toolsNeeded": ["Tools/API stack needed for SEO, Lead Gen, Social"],
    "connectionPoints": ["e.g. WhatsApp, Email, CRM"]
  },
  "budget": {
    "estimatedAnnual": "string",
    "breakdown": ["Allocation for AI, Staff, Marketing"]
  },
  "lineOperations": [
    {
      "phase": "string",
      "dailyCadence": ["What happens every morning/afternoon"],
      "aiResponsibilities": ["What the beast does background"],
      "humanTouchPoints": ["Minimal inputs needed"]
    }
  ],
  "successIndicators": ["KPIs for 100% success"]
}

Focus on minimal human input and maximum AI leverage. Make it accurate, powerful, and ready to implement.`;

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || "AIzaSyAd1uhO5mvgV9dW6iqkEboPTUGo7L9JmZA";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: strategyPrompt }]
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

    const result = await response.json();
    const strategyText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!strategyText) {
      throw new Error('No strategy generated from Gemini');
    }

    let strategy;
    try {
      const cleaned = strategyText.replace(/```json\n?|\n?```/g, '').trim();
      strategy = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Invalid JSON received from AI');
    }

    return new Response(JSON.stringify({
      success: true,
      strategy
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating strategy:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
