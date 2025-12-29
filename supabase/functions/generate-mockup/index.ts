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
    const { assetUrl, mockupType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Generating mockup:", mockupType);

    const mockupPrompts: Record<string, string> = {
      'iphone': 'Place this design on an iPhone 15 Pro screen held in someone\'s hand, photorealistic lighting, modern lifestyle setting',
      'macbook': 'Display this design on a MacBook Pro screen on a clean white desk, professional workspace, soft natural lighting',
      'ipad': 'Show this design on an iPad Pro screen at an angle on a wooden table, modern minimalist background',
      'business-card': 'Present this design as a business card held between fingers, professional photography, shallow depth of field',
      'poster': 'Show this design as a framed poster on a modern white wall, gallery-style presentation, even lighting',
      'tshirt': 'Display this design on a black t-shirt on a person, lifestyle photography, casual setting',
      'hoodie': 'Show this design on a gray hoodie worn by a person, urban street style background',
      'instagram': 'Create an Instagram post mockup showing this design in a mobile feed with realistic UI elements',
      'twitter': 'Generate a Twitter card mockup displaying this design with typical Twitter post formatting',
      'facebook': 'Show this design as a Facebook post in a realistic feed view with engagement elements'
    };

    const prompt = mockupPrompts[mockupType] || mockupPrompts['iphone'];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: { url: assetUrl }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway failed: ${response.status}`);
    }

    const data = await response.json();
    const mockupImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!mockupImage) {
      throw new Error("No mockup image generated");
    }

    console.log("Mockup generated successfully");

    return new Response(
      JSON.stringify({ mockupImage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-mockup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});