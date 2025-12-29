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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { title, description, duration, style, platform } = await req.json();
    console.log('Generating video storyboard for:', title);

    const storyboardPrompt = `Create a detailed video storyboard for: "${title}"

Description: ${description}
Duration: ${duration || 60} seconds
Style: ${style || 'Professional'}
Platform: ${platform || 'YouTube'}

Create 5-8 scenes with detailed descriptions. Return ONLY valid JSON:
{
  "scenes": [
    {
      "timestamp": "00:00-00:05",
      "description": "Scene description",
      "voiceover": "Narration text",
      "visualPrompt": "Detailed prompt for image generation"
    }
  ],
  "totalDuration": number,
  "recommendedMusic": "string",
  "transitions": ["string"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: storyboardPrompt
        }],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (response.status === 402) {
      return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const storyboardText = data.choices?.[0]?.message?.content || '';
    
    let storyboard;
    try {
      const cleaned = storyboardText.replace(/```json\n?|\n?```/g, '').trim();
      storyboard = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      storyboard = {
        scenes: [
          {
            timestamp: '00:00-00:05',
            description: 'Opening scene',
            voiceover: 'Welcome to our video',
            visualPrompt: 'Professional opening scene with dynamic graphics'
          }
        ],
        totalDuration: duration || 60,
        recommendedMusic: 'Upbeat, energetic background music',
        transitions: ['Fade', 'Dissolve']
      };
    }

    // Generate images for each scene
    for (const scene of storyboard.scenes) {
      try {
        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [{
              role: 'user',
              content: `${scene.visualPrompt}. Style: ${style}. High quality, professional.`
            }],
            modalities: ['image'],
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imageUrl) {
            scene.image = imageUrl;
          }
        }
      } catch (imgError) {
        console.error('Error generating scene image:', imgError);
      }
    }

    // Save to database
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        await supabaseClient.from('user_designs').insert({
          user_id: user.id,
          asset_type: 'video_storyboard',
          title,
          data: storyboard
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      storyboard
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating video storyboard:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
