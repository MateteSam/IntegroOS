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
    const { storyboard, title, style, duration } = await req.json();
    
    console.log('Video generation request:', { title, style, duration, scenes: storyboard?.scenes?.length });

    if (!storyboard?.scenes || storyboard.scenes.length === 0) {
      throw new Error('No scenes provided in storyboard');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    // For now, we'll create a mock video URL with the storyboard data
    // In production, this would use FFmpeg or a video API to compile scenes
    
    // Generate a simple HTML5 video representation
    const videoHTML = generateVideoHTML(storyboard.scenes, title, style, duration);
    
    // Store in Supabase Storage
    let videoUrl = null;
    
    if (userId) {
      const videoFileName = `${userId}/${Date.now()}-${title.replace(/\s+/g, '-')}.html`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('generated-assets')
        .upload(videoFileName, new Blob([videoHTML], { type: 'text/html' }), {
          contentType: 'text/html',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
      } else {
        const { data: urlData } = supabase
          .storage
          .from('generated-assets')
          .getPublicUrl(videoFileName);
        
        videoUrl = urlData.publicUrl;
      }

      // Save video metadata to database
      await supabase.from('user_designs').insert({
        user_id: userId,
        asset_type: 'video',
        title: title,
        data: {
          storyboard,
          style,
          duration,
          url: videoUrl,
          scenes: storyboard.scenes.length,
          generatedAt: new Date().toISOString()
        }
      });
    }

    // Return video information
    return new Response(
      JSON.stringify({
        success: true,
        video: {
          url: videoUrl || 'preview-only',
          title,
          duration,
          format: 'html5',
          scenes: storyboard.scenes.length,
          thumbnail: storyboard.scenes[0]?.imageUrl || null,
          downloadFormats: ['html', 'mp4-preview'],
          storyboard
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Video generation failed',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function generateVideoHTML(scenes: any[], title: string, style: string, duration: number): string {
  const sceneHTML = scenes.map((scene, index) => {
    const sceneDuration = duration / scenes.length;
    return `
      <div class="scene" data-duration="${sceneDuration}" style="animation-delay: ${index * sceneDuration}s">
        <img src="${scene.imageUrl}" alt="${scene.description}" />
        <div class="scene-text">
          <h3>${scene.visualDescription}</h3>
          <p>${scene.description}</p>
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #000;
      overflow: hidden;
    }
    .video-container {
      width: 100vw;
      height: 100vh;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .scene {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      animation: fadeInOut ${duration / scenes.length}s ease-in-out forwards;
    }
    .scene img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .scene-text {
      position: absolute;
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: white;
      text-shadow: 0 2px 10px rgba(0,0,0,0.8);
      max-width: 80%;
    }
    .scene-text h3 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: bold;
    }
    .scene-text p {
      font-size: 1.2rem;
      line-height: 1.6;
    }
    @keyframes fadeInOut {
      0% { opacity: 0; transform: scale(1.05); }
      10% { opacity: 1; transform: scale(1); }
      90% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.95); }
    }
    .controls {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      padding: 15px 30px;
      border-radius: 50px;
      display: flex;
      gap: 15px;
      z-index: 1000;
    }
    button {
      background: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="video-container" id="videoContainer">
    ${sceneHTML}
  </div>
  <div class="controls">
    <button onclick="restart()">Restart</button>
    <button onclick="window.close()">Close</button>
  </div>
  <script>
    let currentScene = 0;
    const scenes = document.querySelectorAll('.scene');
    const totalDuration = ${duration} * 1000;
    const sceneDuration = totalDuration / scenes.length;

    function showScene(index) {
      scenes.forEach((scene, i) => {
        scene.style.opacity = i === index ? '1' : '0';
        scene.style.animation = i === index ? 
          \`fadeInOut \${sceneDuration/1000}s ease-in-out forwards\` : 'none';
      });
    }

    function playVideo() {
      currentScene = 0;
      showScene(0);
      
      const interval = setInterval(() => {
        currentScene++;
        if (currentScene >= scenes.length) {
          clearInterval(interval);
          setTimeout(() => playVideo(), 1000);
        } else {
          showScene(currentScene);
        }
      }, sceneDuration);
    }

    function restart() {
      playVideo();
    }

    playVideo();
  </script>
</body>
</html>`;
}