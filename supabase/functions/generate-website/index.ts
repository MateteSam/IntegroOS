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

    const { businessName, industry, pages, style, features, colors } = await req.json();
    console.log('Generating website for:', businessName);

    const websitePrompt = `Generate a complete, production-ready website for "${businessName}" in the ${industry} industry.

Requirements:
- Pages: ${pages?.join(', ') || 'Home, About, Contact'}
- Style: ${style || 'Modern and professional'}
- Features: ${features?.join(', ') || 'Responsive, Accessible'}
- Colors: Primary ${colors?.primary || '#663399'}, Secondary ${colors?.secondary || '#4A5568'}

Generate semantic, accessible HTML5 with embedded Tailwind CSS classes. Make it fully responsive and production-ready.

Return ONLY valid JSON:
{
  "pages": {
    "home": "complete HTML with Tailwind classes",
    "about": "complete HTML with Tailwind classes",
    "contact": "complete HTML with Tailwind classes"
  },
  "css": "additional custom CSS if needed",
  "js": "interactive JavaScript code",
  "meta": {
    "title": "website title",
    "description": "SEO description",
    "keywords": ["keyword1", "keyword2"]
  }
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
          content: websitePrompt
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
    const websiteText = data.choices?.[0]?.message?.content || '';
    
    let website;
    try {
      const cleaned = websiteText.replace(/```json\n?|\n?```/g, '').trim();
      website = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      website = {
        pages: {
          home: `<div class="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white">
            <header class="p-8"><h1 class="text-4xl font-bold">${businessName}</h1></header>
            <main class="container mx-auto p-8">
              <section class="text-center py-20">
                <h2 class="text-5xl font-bold mb-6">Welcome to ${businessName}</h2>
                <p class="text-xl mb-8">Your trusted partner in ${industry}</p>
                <button class="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">Get Started</button>
              </section>
            </main>
          </div>`,
          about: `<div class="min-h-screen bg-white"><header class="p-8 border-b"><h1 class="text-3xl font-bold">About Us</h1></header><main class="container mx-auto p-8"><p class="text-lg">We are ${businessName}, dedicated to excellence in ${industry}.</p></main></div>`,
          contact: `<div class="min-h-screen bg-white"><header class="p-8 border-b"><h1 class="text-3xl font-bold">Contact Us</h1></header><main class="container mx-auto p-8"><form class="max-w-lg"><input type="email" placeholder="Email" class="w-full p-3 border rounded mb-4"/><textarea placeholder="Message" class="w-full p-3 border rounded mb-4"></textarea><button class="bg-purple-600 text-white px-6 py-2 rounded">Send</button></form></main></div>`
        },
        css: '',
        js: '',
        meta: {
          title: businessName,
          description: `${businessName} - Professional ${industry} services`,
          keywords: [industry, businessName, 'professional services']
        }
      };
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
          asset_type: 'website',
          title: `${businessName} Website`,
          data: website
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      website
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating website:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
