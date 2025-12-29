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
    const { imageUrl, assetType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Extracting brand DNA from:", assetType);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this brand asset and extract its "Brand DNA" - the core visual elements that define the brand identity. 
                
Extract and return:
1. Color Palette: Primary, secondary, and accent colors with hex codes
2. Typography Style: Font characteristics (serif/sans, weight, modern/classic)
3. Visual Style: Overall aesthetic (minimalist, bold, playful, elegant, etc.)
4. Design Elements: Key visual patterns, shapes, or motifs
5. Brand Personality: Emotional tone (professional, friendly, luxurious, etc.)

Be specific and actionable so these rules can be applied to future assets.`
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_brand_dna",
              description: "Extract brand DNA from the analyzed asset",
              parameters: {
                type: "object",
                properties: {
                  colorPalette: {
                    type: "object",
                    properties: {
                      primary: { type: "string", description: "Primary brand color hex code" },
                      secondary: { type: "string", description: "Secondary color hex code" },
                      accent1: { type: "string", description: "First accent color hex code" },
                      accent2: { type: "string", description: "Second accent color hex code" }
                    },
                    required: ["primary", "secondary", "accent1", "accent2"]
                  },
                  typography: {
                    type: "object",
                    properties: {
                      style: { type: "string", description: "Font style characteristics" },
                      weight: { type: "string", description: "Font weight preference" },
                      category: { type: "string", enum: ["serif", "sans-serif", "display", "script"] }
                    },
                    required: ["style", "weight", "category"]
                  },
                  visualStyle: {
                    type: "object",
                    properties: {
                      aesthetic: { type: "string", description: "Overall aesthetic description" },
                      keywords: { type: "array", items: { type: "string" }, description: "Style keywords" }
                    },
                    required: ["aesthetic", "keywords"]
                  },
                  designElements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key design elements and patterns"
                  },
                  brandPersonality: {
                    type: "object",
                    properties: {
                      tone: { type: "string", description: "Emotional tone" },
                      traits: { type: "array", items: { type: "string" }, description: "Personality traits" }
                    },
                    required: ["tone", "traits"]
                  }
                },
                required: ["colorPalette", "typography", "visualStyle", "designElements", "brandPersonality"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_brand_dna" } }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway failed: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No brand DNA extracted from AI response");
    }

    const brandDNA = JSON.parse(toolCall.function.arguments);
    console.log("Brand DNA extracted successfully");

    return new Response(
      JSON.stringify({ brandDNA }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-brand-dna:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});