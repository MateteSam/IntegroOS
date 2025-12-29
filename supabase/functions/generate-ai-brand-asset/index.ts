import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pollinations.ai configuration
const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

// Model mappings for different asset types
const MODEL_MAPPINGS: Record<string, string> = {
  "logo": "flux",
  "app-icon": "flux",
  "business-card": "turbo",
  "letterhead": "flux",
  "poster": "flux",
  "flyer": "turbo",
  "social-ig": "turbo",
  "social-fb": "turbo",
  "social-twitter": "turbo",
  "social-linkedin": "flux",
  "social-pinterest": "flux",
  "social-youtube": "flux",
  "mockup": "flux",
  "packaging": "flux",
  "tshirt": "flux",
  "email-sig": "turbo"
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

    console.log(`Generating ${assetType} variation ${variationIndex || 0} using Pollinations.ai`);

    // Determine model and dimensions
    const model = MODEL_MAPPINGS[assetType] || "flux";
    const dimensions = ASSET_DIMENSIONS[assetType] || "1024x1024";

    // Smart prompt engineering based on asset type
    let enhancedPrompt = enhancePromptForAssetType(prompt, assetType, variationIndex);

    // Add reference image support if provided
    if (referenceImage) {
      enhancedPrompt += `. Style reference: maintain visual elements from the reference image while creating the new ${assetType}`;
      console.log("Using reference image for style guidance");
    }

    // Generate unique seed for meaningful variations
    const seed = Math.floor(Math.random() * 1000000) + (variationIndex * 12345);

    // Build Pollinations.ai URL
    const params = new URLSearchParams({
      prompt: enhancedPrompt,
      model: model,
      width: dimensions.split('x')[0],
      height: dimensions.split('x')[1],
      seed: seed.toString(),
      nologo: "true",
      private: "true",
      enhance: "true",
    });

    const pollinationsUrl = `${POLLINATIONS_BASE}/${encodeURIComponent(enhancedPrompt)}?${params.toString()}`;

    // Fetch from Pollinations.ai
    const response = await fetch(pollinationsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Pollinations.ai API error: ${response.status}`);
    }

    // Get the image blob
    const imageBlob = await response.blob();

    // Convert to base64 for response
    const base64Image = await blobToBase64(imageBlob);
    const imageUrl = `data:${response.headers.get('content-type')};base64,${base64Image}`;

    console.log(`Successfully generated ${assetType} using ${model} model`);

    return new Response(
      JSON.stringify({
        imageUrl,
        assetType,
        model,
        dimensions,
        seed,
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
