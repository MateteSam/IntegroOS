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
    const { brandPrompt, assetTypes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating brand copy for:", brandPrompt);

    // Generate comprehensive brand copy
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert brand copywriter. Generate compelling, concise, and creative copy that captures brand essence. Return only valid JSON."
          },
          {
            role: "user",
            content: `Generate brand copy for: "${brandPrompt}". Asset types: ${assetTypes.join(', ')}. 
            
Return a JSON object with:
{
  "tagline": "A punchy 5-7 word tagline",
  "brandStory": "A compelling 2-3 sentence brand narrative",
  "socialMedia": {
    "instagram": "An engaging Instagram caption with emojis (max 150 chars)",
    "twitter": "A concise Twitter post (max 280 chars)",
    "linkedin": "A professional LinkedIn post (max 200 chars)"
  },
  "adHeadlines": ["Headline 1", "Headline 2", "Headline 3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_brand_copy",
              description: "Generate comprehensive brand copywriting",
              parameters: {
                type: "object",
                properties: {
                  tagline: { type: "string" },
                  brandStory: { type: "string" },
                  socialMedia: {
                    type: "object",
                    properties: {
                      instagram: { type: "string" },
                      twitter: { type: "string" },
                      linkedin: { type: "string" }
                    }
                  },
                  adHeadlines: {
                    type: "array",
                    items: { type: "string" }
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["tagline", "brandStory", "socialMedia", "adHeadlines", "keywords"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_brand_copy" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const copyData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(copyData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("Error generating brand copy:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
