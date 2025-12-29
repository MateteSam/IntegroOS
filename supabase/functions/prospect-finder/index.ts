import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { business, industry, targetAudience, niche } = await req.json()

        // 2026 Intelligence Persona: Autonomous Prospecting Agent
        const prospectingPrompt = `You are a Lead Generation Beast (2026 Edition).
Your mission is to identify 10 high-fidelity, intent-based prospect profiles for:
- Business: ${business}
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Specific Niche: ${niche}

### 2026 Prospecting Parameters:
- Look for "Digital Intent" signals (active search, social engagement types).
- Identify "Agentic Gatekeepers" (how to reach their AI personal assistants).
- Map "Friction Points" where this business solves a problem.

Return a JSON array of 10 objects with this structure:
{
  "name": "Full Name or Persona Name",
  "role": "Current Role/Title",
  "intentScore": number (1-100),
  "whyHighIntent": "Reasoning based on 2026 trends",
  "suggestedReachout": "Specific agentic hook (WhatsApp/Email/Voice)",
  "personalizedAngle": "Hyper-personalized value prop"
}

Return ONLY valid JSON.`;

        const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || "AIzaSyAd1uhO5mvgV9dW6iqkEboPTUGo7L9JmZA";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prospectingPrompt }]
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
        const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            throw new Error('No prospects generated from Gemini');
        }

        const prospects = JSON.parse(content).prospects || JSON.parse(content)

        // Log to DB for persistent intelligence
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        await supabaseClient.from('ai_generations').insert({
            generation_type: 'prospect_finding',
            prompt: prospectingPrompt,
            result: { prospects },
            user_id: (req.headers.get('x-user-id')) // If auth is passed
        })

        return new Response(JSON.stringify({ prospects }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
