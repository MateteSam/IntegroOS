import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Imagen API configuration
const GOOGLE_PROJECT = Deno.env.get('GOOGLE_PROJECT') || 'your-project-id';
const GOOGLE_LOCATION = Deno.env.get('GOOGLE_LOCATION') || 'us-central1';
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

const IMAGEN_ENDPOINT = `https://${GOOGLE_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT}/locations/${GOOGLE_LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;

// Aspect ratio mappings for different asset types
const ASPECT_RATIOS: Record<string, string> = {
  "logo": "1:1",
  "app-icon": "1:1",
  "business-card": "16:9", // approx 1050x600
  "letterhead": "1:1", // 2550x3300 is 1:1.29, use 4:3
  "poster": "9:16", // 1080x1920
  "flyer": "1:1",
  "social-ig": "1:1",
  "social-fb": "19:10", // approx 1200x630
  "social-twitter": "16:9", // 1200x675
  "social-linkedin": "4:1", // 1584x396
  "social-pinterest": "2:3", // 1000x1500
  "social-youtube": "16:9",
  "mockup": "4:3",
  "packaging": "1:1",
  "tshirt": "1:1",
  "email-sig": "3:1" // 600x200
};

// Asset-specific dimensions
const ASSET_DIMENSIONS: Record<string, string> = {
  "logo": "1024x1024",
  "app-icon": "1024x1024",
  "business-card": "1050x600",
  "letterhead": "2550x3300",
  "poster": "1080x1920",
  "flyer": "1080x1080",
  "social-ig": "1080x1080",
  "social-fb": "1200x630",
  "social-twitter": "1200x675",
  "social-linkedin": "1584x396",
  "social-pinterest": "1000x1500",
  "social-youtube": "1280x720",
  "mockup": "1024x768",
  "packaging": "1024x1024",
  "tshirt": "1024x1024",
  "email-sig": "600x200"
};

// Helper function to convert blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '');
  return btoa(binaryString);
}

// Smart prompt enhancement based on asset type and variation
function enhancePromptForAssetType(basePrompt: string, assetType: string, variationIndex: number = 0): string {
  const variations = [
    "professional, clean, corporate style, high quality",
    "bold, creative, artistic approach, visually striking",
    "minimalist, elegant, sophisticated design, refined",
    "vibrant, energetic, modern aesthetic, contemporary",
    "classic, timeless, traditional design, established"
  ];

  const style = variations[variationIndex % variations.length];

  // Asset-specific enhancements
  const assetEnhancements: Record<string, string> = {
    "logo": ". Vector art style, scalable design, simple yet memorable, brand identity focused",
    "app-icon": ". Mobile app icon design, pixel perfect, clean edges, touch-friendly",
    "business-card": ". Professional business card layout, contact information design, formal typography",
    "letterhead": ". Official letterhead design, corporate stationery, formal layout",
    "poster": ". Large format poster design, impactful, eye-catching, billboard style",
    "flyer": ". Promotional flyer design, marketing focus, call-to-action oriented",
    "social-ig": ". Instagram post design, mobile optimized, engaging, scroll-stopping",
    "social-fb": ". Facebook post design, link preview friendly, shareable format",
    "social-twitter": ". Twitter header design, banner style, profile complement",
    "social-linkedin": ". LinkedIn banner design, professional networking, corporate",
    "social-pinterest": ". Pinterest pin design, tall format, aspirational, inspiring",
    "social-youtube": ". YouTube thumbnail design, clickable, intriguing, video teaser",
    "mockup": ". Product mockup design, realistic presentation, showcase display",
    "packaging": ". Product packaging design, retail ready, shelf appeal",
    "tshirt": ". T-shirt design, apparel graphics, wearable art, screen-print friendly",
    "email-sig": ". Email signature design, professional footer, contact information"
  };

  const assetSpecific = assetEnhancements[assetType] || ". Professional design, high quality, commercially viable";

  // Quality and technical enhancements
  const qualityEnhancements = ", high resolution, sharp details, vibrant colors, professional grade, commercially viable, print-ready if applicable";

  return `${basePrompt}. ${style}${assetSpecific}${qualityEnhancements}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, assetType, referenceImage, variationIndex } = await req.json();

    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: "Valid prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prompt.length < 10 || prompt.length > 500) {
      return new Response(
        JSON.stringify({ error: "Prompt must be between 10 and 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (assetType && typeof assetType !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid asset type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GOOGLE_API_KEY) {
      throw new Error("Google API key not configured");
    }

    console.log(`Generating ${assetType} variation ${variationIndex || 0} using Google Imagen`);

    // Determine aspect ratio
    const aspectRatio = ASPECT_RATIOS[assetType] || "1:1";
    const dimensions = ASSET_DIMENSIONS[assetType] || "1024x1024";

    // Smart prompt engineering based on asset type
    let enhancedPrompt = enhancePromptForAssetType(prompt, assetType, variationIndex);

    // Add reference image support if provided
    if (referenceImage) {
      enhancedPrompt += `. Style reference: maintain visual elements from the reference image while creating the new ${assetType}`;
      console.log("Using reference image for style guidance");
    }

    // Add variation to prompt for different results
    if (variationIndex > 0) {
      enhancedPrompt += `. Variation ${variationIndex}: slightly different composition and color scheme`;
    }

    // Build Imagen API payload
    const payload = {
      instances: [
        {
          prompt: enhancedPrompt
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
        negativePrompt: "blurry, low quality, distorted, ugly, deformed",
        personGeneration: "allow_adult",
        includeSafetyAttributes: true
      }
    };

    let imageUrl = '';
    let model = '';

    // Tier 1: Try Google Imagen
    if (GOOGLE_API_KEY) {
      try {
        console.log('[Tier 1] Trying Google Imagen...');
        const response = await fetch(IMAGEN_ENDPOINT, {
          method: 'POST',
          headers: {
            'x-goog-api-key': GOOGLE_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.predictions?.[0]?.bytesBase64Encoded) {
            const base64Image = result.predictions[0].bytesBase64Encoded;
            const mimeType = result.predictions[0].mimeType || 'image/png';
            imageUrl = `data:${mimeType};base64,${base64Image}`;
            model = 'imagen-3.0';
            console.log('[Tier 1] ✓ Imagen succeeded');
          }
        } else {
          console.log('[Tier 1] ✗ Imagen failed:', response.status);
        }
      } catch (e) {
        console.log('[Tier 1] ✗ Imagen error:', e.message);
      }
    }

    // Tier 2: Together AI FLUX.1 (FREE)
    const TOGETHER_API_KEY = Deno.env.get('TOGETHER_API_KEY');
    if (!imageUrl && TOGETHER_API_KEY) {
      try {
        console.log('[Tier 2] Trying Together AI FLUX.1...');
        const togetherResponse = await fetch('https://api.together.xyz/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TOGETHER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'black-forest-labs/FLUX.1-schnell-Free',
            prompt: enhancedPrompt,
            width: 1024,
            height: 1024,
            steps: 4,
            n: 1,
            response_format: 'b64_json'
          })
        });

        if (togetherResponse.ok) {
          const data = await togetherResponse.json();
          if (data.data?.[0]?.b64_json) {
            imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
            model = 'together-flux-1';
            console.log('[Tier 2] ✓ Together AI succeeded');
          }
        } else {
          console.log('[Tier 2] ✗ Together AI failed:', togetherResponse.status);
        }
      } catch (e) {
        console.log('[Tier 2] ✗ Together AI error:', e.message);
      }
    }

    // Tier 3: Pollinations (FREE, no API key)
    if (!imageUrl) {
      try {
        console.log('[Tier 3] Trying Pollinations...');
        const shortPrompt = enhancedPrompt.slice(0, 200).replace(/[^\w\s]/g, ' ');
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1024&height=1024&nologo=true`;

        const pollResponse = await fetch(pollinationsUrl, {
          signal: AbortSignal.timeout(90000) // 90s timeout
        });

        if (pollResponse.ok) {
          const contentType = pollResponse.headers.get('content-type');
          if (contentType?.startsWith('image/')) {
            const blob = await pollResponse.blob();
            const base64 = await blobToBase64(blob);
            imageUrl = `data:${contentType};base64,${base64}`;
            model = 'pollinations';
            console.log('[Tier 3] ✓ Pollinations succeeded');
          }
        } else {
          console.log('[Tier 3] ✗ Pollinations failed:', pollResponse.status);
        }
      } catch (e) {
        console.log('[Tier 3] ✗ Pollinations error:', e.message);
      }
    }

    if (!imageUrl) {
      throw new Error('All image generation providers failed');
    }

    console.log(`Successfully generated ${assetType} using ${model}`);

    return new Response(
      JSON.stringify({
        imageUrl,
        assetType,
        model,
        dimensions,
        aspectRatio,
        prompt: enhancedPrompt
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating brand asset:", error);

    let errorMessage = "Failed to generate asset";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
        statusCode = 408;
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
