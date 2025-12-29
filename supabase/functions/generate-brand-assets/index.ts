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
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

    const { brandData } = await req.json();
    console.log('Generating brand assets for:', brandData.businessName);

    // Generate color palette with Google Generative Language API
    // Color palette: try Google, else rule-based defaults
    let colors = { primary: '#663399', secondary: '#4A5568', accent1: '#ED8936', accent2: '#38B2AC' };
    try {
      if (GOOGLE_API_KEY) {
        const colorResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(GOOGLE_API_KEY)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text:
                        `Generate a professional color palette for a ${brandData.industry} business named "${brandData.businessName}" with personality: ${brandData.brandPersonality || 'professional'}. Return ONLY a JSON object with this exact structure: {"primary":"#hexcode","secondary":"#hexcode","accent1":"#hexcode","accent2":"#hexcode"}. Use colors that evoke the right emotions for this industry.`,
                    },
                  ],
                },
              ],
            }),
          }
        );
        const colorData = await colorResponse.json();
        const colorText =
          colorData?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') || '';
        const parsed = JSON.parse(colorText.replace(/```json\n?|\n?```/g, '').trim());
        if (parsed.primary) colors = parsed;
      } else {
        // Simple rule-based palette by personality
        const map: Record<string, string> = {
          Professional: '#1e40af',
          Creative: '#7c2d92',
          Friendly: '#047857',
          Luxury: '#92400e',
          Modern: '#111827',
          Playful: '#be185d',
        };
        const base = map[brandData.brandPersonality || 'Professional'] || '#1e40af';
        colors = { primary: base, secondary: '#64748b', accent1: '#f59e0b', accent2: '#10b981' };
      }
    } catch {
      // keep defaults
    }

    // Placeholder logo generation (server-side) using dynamic color
    const hex = colors.primary?.replace('#', '') || '663399';
    const text = encodeURIComponent(brandData.businessName || 'Brand');
    const primaryLogo = `https://placehold.co/300x150/${hex}/ffffff?text=${text}`;

    // Generate brand guidelines with AI
    let guidelines = {
      brandPromise: `Deliver exceptional value in ${brandData.industry}`,
      mission: brandData.mission || `Transform the ${brandData.industry} industry`,
      values: brandData.values || ['Excellence', 'Innovation', 'Integrity'],
      voice: {
        personality: brandData.brandPersonality || 'Professional',
        tone: ['Confident', 'Authentic', 'Clear'],
        keywords: ['Quality', 'Reliable', 'Innovative']
      },
      targetAudience: [brandData.targetAudience || 'Professionals'],
      usage: {
        primary: 'Use for main brand presence',
        alternative: 'Use for secondary applications',
        icon: 'Use for small spaces and favicons'
      }
    };
    try {
      if (GOOGLE_API_KEY) {
        const guidelinesResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(GOOGLE_API_KEY)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `Create comprehensive brand guidelines for "${brandData.businessName}", a ${brandData.industry} business. Target audience: ${brandData.targetAudience}. Mission: ${brandData.mission}. Values: ${brandData.values?.join(', ')}. Return ONLY valid JSON with structure: {"brandPromise":"string","mission":"string","values":["string"],"voice":{"personality":"string","tone":["string"],"keywords":["string"]},"targetAudience":["string"]}`,
                    },
                  ],
                },
              ],
            }),
          }
        );
        const guidelinesData = await guidelinesResponse.json();
        const guideText =
          guidelinesData?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') || '';
        const parsed = JSON.parse(guideText.replace(/```json\n?|\n?```/g, '').trim());
        if (parsed.brandPromise) {
          guidelines = { ...guidelines, ...parsed };
        }
      }
    } catch {
      // keep defaults
    }

    // Generate typography recommendation
    const fonts = {
      headingFont: 'Inter',
      bodyFont: 'Open Sans'
    };

    const result = {
      success: true,
      assets: {
        logo: {
          primary: primaryLogo,
          alternative: primaryLogo,
          icon: primaryLogo
        },
        colors,
        typography: fonts,
        brandGuidelines: guidelines
      }
    };

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
        await supabaseClient.from('brand_assets').insert({
          user_id: user.id,
          business_name: brandData.businessName,
          industry: brandData.industry,
          brand_data: brandData,
          assets: result.assets
        });
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating brand assets:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
