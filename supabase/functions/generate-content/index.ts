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

    const { contentType, topic, tone, targetAudience, brandData } = await req.json();
    console.log('Generating content:', contentType, topic);

    const contentPrompt = `Generate high-quality ${contentType} content about "${topic}".

Tone: ${tone || 'Professional and engaging'}
Target Audience: ${targetAudience || 'General audience'}
Brand Context: ${brandData?.businessName ? `For ${brandData.businessName} in ${brandData.industry}` : 'General'}

Requirements:
- Make it compelling and actionable
- Include a strong hook
- Add value and insights
- Use engaging language
- Include a clear call-to-action

Return ONLY a JSON object with this structure:
{
  "title": "string",
  "content": "string (full content, well-formatted with paragraphs)",
  "hook": "string (attention-grabbing opening)",
  "cta": "string (call to action)",
  "hashtags": ["string"] (if social media),
  "keyPoints": ["string"] (3-5 main takeaways)
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
          content: contentPrompt
        }],
      }),
    });

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content || '';
    
    let generatedContent;
    try {
      const cleaned = contentText.replace(/```json\n?|\n?```/g, '').trim();
      generatedContent = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      generatedContent = {
        title: `${topic} - Expert Insights`,
        content: `Here's valuable content about ${topic}. [Content generation failed - please try again]`,
        hook: `Discover the truth about ${topic}`,
        cta: 'Take action today!',
        hashtags: ['#business', '#growth', '#success'],
        keyPoints: ['Key insight 1', 'Key insight 2', 'Key insight 3']
      };
    }

    // Save to database if user is authenticated
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        await supabaseClient.from('content').insert({
          user_id: user.id,
          title: generatedContent.title,
          body: generatedContent.content,
          content_type: contentType,
          status: 'draft',
          metadata: {
            topic,
            tone,
            targetAudience,
            hook: generatedContent.hook,
            cta: generatedContent.cta,
            hashtags: generatedContent.hashtags,
            keyPoints: generatedContent.keyPoints
          }
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
