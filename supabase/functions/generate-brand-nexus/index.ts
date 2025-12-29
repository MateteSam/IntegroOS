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

    const { questionnaireData, stage } = await req.json();
    
    // Input validation
    if (!questionnaireData || typeof questionnaireData !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid questionnaire data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!questionnaireData.businessName || typeof questionnaireData.businessName !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Business name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!questionnaireData.industry) {
      return new Response(
        JSON.stringify({ success: false, error: 'Industry is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Nexus Genesis - Stage:', stage);

    const startTime = Date.now();
    let result: any = {};

    // Get user from auth
    const authHeader = req.headers.get('authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (stage === 'analyze-competitors' && questionnaireData.competitorUrls?.length > 0) {
      // Analyze competitor brands
      const competitorAnalysis = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `Analyze these competitor brands and provide differentiation insights: ${JSON.stringify(questionnaireData.competitorUrls)}. Industry: ${questionnaireData.industry}. Return JSON with: commonThemes (array), gaps (array), opportunities (array), colorTrends (array), typographyTrends (array).`
          }],
        }),
      });

      const competitorData = await competitorAnalysis.json();
      try {
        const analysisText = competitorData.choices?.[0]?.message?.content || '{}';
        result.competitiveAnalysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, '').trim());
      } catch {
        result.competitiveAnalysis = {
          commonThemes: ['Modern design', 'Minimal approach'],
          gaps: ['Emotional connection', 'Unique voice'],
          opportunities: ['Stand out with bold colors', 'Human-centered messaging'],
          colorTrends: ['Blue', 'White', 'Gray'],
          typographyTrends: ['Sans-serif', 'Clean fonts']
        };
      }
    }

    if (stage === 'generate-complete-brand') {
      // Generate comprehensive color palette
      const colorResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `Create a comprehensive brand color system for "${questionnaireData.businessName}", ${questionnaireData.industry} industry, ${questionnaireData.brandPersonality} personality. Consider: ${questionnaireData.colorPreferences || 'industry-appropriate'}. Return ONLY JSON: {"primary":"#hex","primaryReason":"string","secondary":"#hex","secondaryReason":"string","accent1":"#hex","accent2":"#hex","neutrals":["#hex1","#hex2","#hex3","#hex4","#hex5"],"gradients":[{"name":"string","css":"string"}],"accessibility":{"wcagAA":boolean,"wcagAAA":boolean},"usage":{"primary":"when to use","secondary":"when to use","accents":"when to use"}}`
          }],
        }),
      });

      const colorData = await colorResponse.json();
      let colors = {
        primary: '#663399',
        primaryReason: 'Evokes trust and innovation',
        secondary: '#4A5568',
        secondaryReason: 'Professional and balanced',
        accent1: '#ED8936',
        accent2: '#38B2AC',
        neutrals: ['#F7FAFC', '#EDF2F7', '#CBD5E0', '#4A5568', '#1A202C'],
        gradients: [
          { name: 'Primary Gradient', css: 'linear-gradient(135deg, #663399, #9F7AEA)' },
          { name: 'Accent Gradient', css: 'linear-gradient(135deg, #ED8936, #F6AD55)' }
        ],
        accessibility: { wcagAA: true, wcagAAA: false },
        usage: {
          primary: 'Main CTAs, important headers, brand elements',
          secondary: 'Body text, supporting elements',
          accents: 'Highlights, notifications, secondary CTAs'
        }
      };

      try {
        const colorText = colorData.choices?.[0]?.message?.content || '';
        const parsed = JSON.parse(colorText.replace(/```json\n?|\n?```/g, '').trim());
        if (parsed.primary) colors = { ...colors, ...parsed };
      } catch (e) {
        console.log('Using default color system');
      }

      // Generate multiple logo concepts using AI
      const logoPrompts = [
        `Modern minimalist logo for "${questionnaireData.businessName}", ${questionnaireData.industry}. Style: ${questionnaireData.brandPersonality}. Clean, professional, vector-style. Primary color: ${colors.primary}.`,
        `Geometric abstract logo for "${questionnaireData.businessName}", ${questionnaireData.industry}. Bold, memorable icon + wordmark. Style: ${questionnaireData.brandPersonality}.`,
        `Elegant serif-based logo for "${questionnaireData.businessName}", ${questionnaireData.industry}. Sophisticated wordmark. Style: ${questionnaireData.brandPersonality}.`,
      ];

      const logoGenerations = await Promise.all(
        logoPrompts.map(async (prompt, idx) => {
          try {
            const logoResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image-preview',
                messages: [{ role: 'user', content: prompt }],
                modalities: ['image'],
              }),
            });

            const logoData = await logoResponse.json();
            return logoData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
          } catch (error) {
            console.error(`Logo generation ${idx} failed:`, error);
            return null;
          }
        })
      );

      // Generate typography system
      const typographyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `Recommend typography system for ${questionnaireData.brandPersonality} ${questionnaireData.industry} brand. Return ONLY JSON: {"headingFont":"Google Font name","bodyFont":"Google Font name","displayFont":"Google Font name","monoFont":"Google Font name","rationale":"why these fonts","pairingSynergy":"how they work together","typeScale":{"h1":"size/weight","h2":"size/weight","h3":"size/weight","h4":"size/weight","body":"size/weight","small":"size/weight"},"usage":{"heading":"when to use","body":"when to use","display":"when to use"}}`
          }],
        }),
      });

      const typographyData = await typographyResponse.json();
      let typography = {
        headingFont: 'Inter',
        bodyFont: 'Open Sans',
        displayFont: 'Playfair Display',
        monoFont: 'Fira Code',
        rationale: 'Professional and highly readable combination',
        pairingSynergy: 'Modern sans-serif headlines with classic serif accents',
        typeScale: {
          h1: '48px/bold',
          h2: '36px/bold',
          h3: '28px/semibold',
          h4: '24px/semibold',
          body: '16px/normal',
          small: '14px/normal'
        },
        usage: {
          heading: 'All primary headings and navigation',
          body: 'Paragraphs, descriptions, general content',
          display: 'Hero sections, special callouts'
        }
      };

      try {
        const typoText = typographyData.choices?.[0]?.message?.content || '';
        const parsed = JSON.parse(typoText.replace(/```json\n?|\n?```/g, '').trim());
        if (parsed.headingFont) typography = { ...typography, ...parsed };
      } catch (e) {
        console.log('Using default typography');
      }

      // Generate brand messaging
      const messagingResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `Create brand messaging for "${questionnaireData.businessName}". Mission: ${questionnaireData.mission}. Values: ${questionnaireData.values?.join(', ')}. Target: ${questionnaireData.targetAudience}. Return ONLY JSON: {"brandPromise":"string","taglines":["10 tagline options"],"elevatorPitch":"string","valuePropositions":["3 value props"],"messagingPillars":["3 core messages"],"toneOfVoice":{"personality":"string","dos":["3 dos"],"donts":["3 donts"],"examples":{"headline":"example","body":"example","cta":"example"}}}`
          }],
        }),
      });

      const messagingData = await messagingResponse.json();
      let messaging = {
        brandPromise: `Delivering exceptional ${questionnaireData.industry} solutions`,
        taglines: [
          `${questionnaireData.businessName}: Innovation Delivered`,
          `Where Quality Meets Excellence`,
          `Your Trusted Partner in Success`
        ],
        elevatorPitch: `${questionnaireData.businessName} is revolutionizing the ${questionnaireData.industry} industry.`,
        valuePropositions: ['Quality', 'Innovation', 'Reliability'],
        messagingPillars: ['Excellence', 'Innovation', 'Trust'],
        toneOfVoice: {
          personality: questionnaireData.brandPersonality || 'Professional',
          dos: ['Be clear', 'Be authentic', 'Be helpful'],
          donts: ['Be vague', 'Be overly technical', 'Be pushy'],
          examples: {
            headline: 'Transform Your Business Today',
            body: 'We help businesses like yours achieve their goals.',
            cta: 'Get Started Now'
          }
        }
      };

      try {
        const msgText = messagingData.choices?.[0]?.message?.content || '';
        const parsed = JSON.parse(msgText.replace(/```json\n?|\n?```/g, '').trim());
        if (parsed.brandPromise) messaging = { ...messaging, ...parsed };
      } catch (e) {
        console.log('Using default messaging');
      }

      result = {
        logos: {
          concepts: logoGenerations.filter(Boolean).map((url, idx) => ({
            id: `concept-${idx}`,
            name: ['Minimalist', 'Geometric', 'Elegant'][idx],
            url,
            variants: {
              fullColor: url,
              singleColor: url,
              black: url,
              white: url,
              inverse: url
            }
          }))
        },
        colors,
        typography,
        messaging,
        brandGuidelines: {
          introduction: {
            brandStory: questionnaireData.brandStory || `${questionnaireData.businessName} was founded to transform the ${questionnaireData.industry} industry.`,
            mission: questionnaireData.mission,
            vision: questionnaireData.vision,
            values: questionnaireData.values,
            personality: questionnaireData.brandPersonality
          },
          visualIdentity: {
            logoSpecs: {
              clearSpace: 'Minimum clear space equal to the height of the logo',
              minSize: 'Digital: 32px height, Print: 0.5 inches height',
              placement: 'Top-left or center, never bottom',
              backgrounds: 'Use on white, light backgrounds, or brand primary color'
            },
            colorSystem: colors,
            typography
          },
          voiceAndMessaging: messaging,
          applications: {
            print: ['Business Cards', 'Letterhead', 'Envelopes', 'Brochures'],
            digital: ['Website', 'Social Media', 'Email', 'App Icons'],
            environmental: ['Signage', 'Packaging', 'Merchandise', 'Vehicle Wraps']
          },
          dosAndDonts: {
            logo: {
              dos: ['Use official logo files', 'Maintain proper spacing', 'Use approved colors'],
              donts: ['Distort or skew', 'Add effects or shadows', 'Change colors arbitrarily']
            },
            color: {
              dos: ['Follow accessibility guidelines', 'Use primary for main CTAs', 'Test contrast ratios'],
              donts: ['Mix with unapproved colors', 'Use low-contrast combinations', 'Create custom gradients']
            },
            typography: {
              dos: ['Use approved fonts only', 'Follow type scale', 'Maintain hierarchy'],
              donts: ['Mix too many fonts', 'Use decorative fonts for body', 'Ignore line height']
            }
          }
        }
      };

      // Save to database if user authenticated
      if (user) {
        const { data: brandAsset, error } = await supabaseClient.from('brand_assets').insert({
          user_id: user.id,
          business_name: questionnaireData.businessName,
          industry: questionnaireData.industry,
          brand_data: questionnaireData,
          assets: result,
          questionnaire_data: questionnaireData,
          generation_iterations: 1,
          version_number: 1
        }).select().single();

        if (error) {
          console.error('Error saving brand assets:', error);
        } else {
          result.brandAssetId = brandAsset.id;

          // Log AI generation
          await supabaseClient.from('ai_brand_generations').insert({
            brand_asset_id: brandAsset.id,
            prompt_data: questionnaireData,
            model_used: 'google/gemini-2.5-flash',
            generation_time: `${Date.now() - startTime} milliseconds`
          });
        }
      }
    }

    const generationTime = Date.now() - startTime;
    console.log(`Nexus Genesis completed in ${generationTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      ...result,
      metadata: {
        generationTime,
        stage,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Nexus Genesis error:', error);
    
    let errorMessage = 'Failed to generate brand';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again with fewer options.';
        statusCode = 408;
      } else if (error.message.includes('LOVABLE_API_KEY')) {
        errorMessage = 'AI service not configured';
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
