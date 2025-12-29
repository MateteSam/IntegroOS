import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Play, Video, Upload, Download, Wand2, Music, Image, Type, Edit, Settings, Loader2, Box, Sparkles } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { ModuleHeader } from '@/components/ui/module-header';
import { LoadingState } from '@/components/LoadingState';
import { generateVideoStoryboard, generateVideoFile } from '@/lib/aiClient'; // Assuming these are new functions

interface VideoStudioProps {
  onNavigateBack?: () => void;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ onNavigateBack }) => {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(''); // New state for loading step
  const [storyboard, setStoryboard] = useState(null); // New state for storyboard
  const [brandData, setBrandData] = useState({}); // New state for brand data (assuming it's managed here)
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    style: 'professional',
    duration: '30',
    format: 'landscape',
    content: '',
    music: 'upbeat',
    voiceover: false,
    generatedVideo: null as any
  });

  const videoTemplates = [
    {
      id: 'promo',
      name: 'Business Promo',
      description: 'Professional promotional videos for your business',
      duration: '30-60s',
      style: 'Corporate',
      features: ['Logo Animation', 'Text Overlays', 'Professional Music'],
      preview: '/images/video-placeholder.png'
    },
    {
      id: 'social',
      name: 'Social Media',
      description: 'Short-form content for Instagram, TikTok, and Facebook',
      duration: '15-30s',
      style: 'Trendy',
      features: ['Quick Cuts', 'Modern Transitions', 'Trending Music'],
      preview: '/images/video-placeholder.png'
    },
    {
      id: 'explainer',
      name: 'Explainer Video',
      description: 'Educational content explaining your products or services',
      duration: '60-120s',
      style: 'Educational',
      features: ['Animated Graphics', 'Voiceover', 'Clear Structure'],
      preview: '/images/video-placeholder.png'
    },
    {
      id: 'testimonial',
      name: 'Customer Testimonial',
      description: 'Showcase customer reviews and success stories',
      duration: '45-90s',
      style: 'Authentic',
      features: ['Split Screen', 'Quote Graphics', 'Soft Music'],
      preview: '/images/video-placeholder.png'
    },
    {
      id: 'product',
      name: 'Product Showcase',
      description: 'Highlight your products with professional presentation',
      duration: '30-60s',
      style: 'Clean',
      features: ['360° Views', 'Close-ups', 'Feature Highlights'],
      preview: '/images/video-placeholder.png'
    },
    {
      id: 'announcement',
      name: 'Announcement',
      description: 'Special announcements, launches, and updates',
      duration: '20-45s',
      style: 'Exciting',
      features: ['Bold Graphics', 'Countdown Timer', 'Call to Action'],
      preview: '/images/video-placeholder.png'
    }
  ];

  const videoStyles = [
    { id: 'professional', name: 'Professional', desc: 'Corporate, clean, trustworthy' },
    { id: 'creative', name: 'Creative', desc: 'Artistic, unique, inspiring' },
    { id: 'modern', name: 'Modern', desc: 'Trendy, contemporary, sleek' },
    { id: 'energetic', name: 'Energetic', desc: 'Dynamic, fast-paced, exciting' },
    { id: 'minimal', name: 'Minimal', desc: 'Simple, clean, focused' },
    { id: 'luxury', name: 'Luxury', desc: 'Premium, elegant, sophisticated' }
  ];

  const musicOptions = [
    { id: 'upbeat', name: 'Upbeat', desc: 'Energetic and positive' },
    { id: 'corporate', name: 'Corporate', desc: 'Professional and inspiring' },
    { id: 'calm', name: 'Calm', desc: 'Relaxing and peaceful' },
    { id: 'dramatic', name: 'Dramatic', desc: 'Intense and emotional' },
    { id: 'trendy', name: 'Trendy', desc: 'Modern and popular' },
    { id: 'none', name: 'No Music', desc: 'Silent or voice-only' }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setVideoData(prev => ({
      ...prev,
      style: template.style.toLowerCase(),
      duration: template.duration.split('-')[0].replace('s', '')
    }));
    setActiveTab('customize');
  };

  const generateVideo = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a video template first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setActiveTab('generation');

    try {
      // First, generate the storyboard
      setLoadingStep('storyboarding');
      setProgress(20);
      toast({
        title: "Generating Storyboard",
        description: "Creating visual narrative for your video..."
      });

      const storyboardData = await generateVideoStoryboard({
        title: videoData.title || 'Business Video',
        description: videoData.content || 'Professional business presentation',
        duration: parseInt(videoData.duration) || 30,
        style: videoData.style,
        platform: videoData.format,
        brandContext: brandData
      });

      setStoryboard(storyboardData.storyboard);
      setProgress(40);
      toast({
        title: "Compiling Video",
        description: "Creating your video from storyboard scenes..."
      });

      // Now generate the actual video file
      setLoadingStep('video_compilation');
      setProgress(70);
      const generatedVideoData = await generateVideoFile(
        storyboardData.storyboard,
        videoData.title || 'Business Video',
        videoData.style,
        parseInt(videoData.duration) || 30
      );

      setProgress(100);

      // Store the generated video data
      setVideoData(prev => ({
        ...prev,
        generatedVideo: generatedVideoData.video
      }));

      setIsGenerating(false);
      setActiveTab('preview');

      toast({
        title: "Video Generated Successfully!",
        description: "Your professional video is ready for preview and download."
      });

    } catch (error) {
      console.error('Video generation error:', error);
      setIsGenerating(false);
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate video",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (quality: string) => {
    if (!videoData.generatedVideo?.url) {
      toast({
        title: "No Video",
        description: "Please generate a video first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Download the video HTML file
      const link = document.createElement('a');
      link.href = videoData.generatedVideo.url;
      link.download = `${videoData.title.replace(/\s+/g, '-')}-${quality}.html`;
      link.click();

      toast({
        title: "Download Started",
        description: `Downloading video preview in ${quality} quality.`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download video. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAll = async () => {
    if (!videoData.generatedVideo?.url) return;

    toast({
      title: "Download Package",
      description: "Preparing all formats for download. This may take a few moments."
    });

    // In a real implementation, this would create a ZIP with multiple formats
    await handleDownload('all');
  };

  const handlePlatformDownload = async (platform: string) => {
    if (!videoData.generatedVideo?.url) return;

    toast({
      title: `${platform} Version`,
      description: `Downloading ${platform}-optimized version.`
    });

    await handleDownload(platform);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-amber-500/20 rounded-full shadow-lg">
          <Video className="h-4 w-4 text-amber-500" />
          <span className="text-amber-500 font-medium tracking-wide text-xs uppercase">Motion Lab Protocol</span>
        </div>
        <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
          Cinematic <span className="text-amber-400">Motion Synthesis</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto font-light">
          Forge professional motion graphics and promotional content with AI assistance.
        </p>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating Video</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="customize" disabled={!selectedTemplate}>Customize</TabsTrigger>
          <TabsTrigger value="generation" disabled={!selectedTemplate}>Generate</TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedTemplate}>Preview</TabsTrigger>
          <TabsTrigger value="export" disabled={!selectedTemplate}>Export</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Video Type</CardTitle>
              <CardDescription>
                Select the template that best fits your video needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:scale-105 bg-slate-900 border-slate-800"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="pt-4">
                      <div className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-800 rounded-lg mb-4 flex items-center justify-center">
                        <Play className="h-8 w-8 text-amber-500" />
                      </div>
                      <h3 className="font-semibold mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Duration: {template.duration}</span>
                          <Badge variant="outline">{template.style}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 2).map(feature => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Content Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Video Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Video Title</Label>
                  <Input
                    id="title"
                    value={videoData.title}
                    onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter your video title"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Video Script/Content</Label>
                  <Textarea
                    id="content"
                    value={videoData.content}
                    onChange={(e) => setVideoData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Describe what your video should include, key messages, and scenes..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={videoData.duration}
                      onChange={(e) => setVideoData(prev => ({ ...prev, duration: e.target.value }))}
                      min="15"
                      max="180"
                    />
                  </div>
                  <div>
                    <Label htmlFor="format">Video Format</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={videoData.format}
                      onChange={(e) => setVideoData(prev => ({ ...prev, format: e.target.value }))}
                    >
                      <option value="landscape">Landscape (16:9)</option>
                      <option value="square">Square (1:1)</option>
                      <option value="portrait">Portrait (9:16)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Style Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Visual Style
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Video Style</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {videoStyles.map(style => (
                      <Card
                        key={style.id}
                        className={`cursor-pointer transition-all p-3 ${videoData.style === style.id ? 'ring-2 ring-amber-500' : ''
                          }`}
                        onClick={() => setVideoData(prev => ({ ...prev, style: style.id }))}
                      >
                        <div className="text-sm font-medium">{style.name}</div>
                        <div className="text-xs text-muted-foreground">{style.desc}</div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Background Music</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {musicOptions.map(music => (
                      <Card
                        key={music.id}
                        className={`cursor-pointer transition-all p-3 ${videoData.music === music.id ? 'ring-2 ring-amber-500' : ''
                          }`}
                        onClick={() => setVideoData(prev => ({ ...prev, music: music.id }))}
                      >
                        <div className="text-sm font-medium">{music.name}</div>
                        <div className="text-xs text-muted-foreground">{music.desc}</div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="voiceover"
                    checked={videoData.voiceover}
                    onChange={(e) => setVideoData(prev => ({ ...prev, voiceover: e.target.checked }))}
                  />
                  <div>
                    <Label htmlFor="voiceover" className="font-medium cursor-pointer">
                      Add AI Voiceover
                    </Label>
                    <p className="text-sm text-muted-foreground">Generate professional narration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Media Assets
                </CardTitle>
                <CardDescription>
                  Upload your images, videos, and logos to include in the video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="images" className="flex items-center gap-2 cursor-pointer">
                      <Image className="h-4 w-4" />
                      Images/Photos
                    </Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="videos" className="flex items-center gap-2 cursor-pointer">
                      <Video className="h-4 w-4" />
                      Video Clips
                    </Label>
                    <Input
                      id="videos"
                      type="file"
                      accept="video/*"
                      multiple
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer">
                      <Music className="h-4 w-4" />
                      Audio Files
                    </Label>
                    <Input
                      id="audio"
                      type="file"
                      accept="audio/*"
                      multiple
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={generateVideo}
                className="w-full h-12 text-lg"
                disabled={isGenerating || !videoData.title || !videoData.content}
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Video
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generation" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <Video className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold">Creating Your Video...</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our AI is processing your content and generating a professional video with {selectedTemplate?.name} style.
                </p>
                <div className="space-y-2">
                  <Progress value={progress} className="h-2 max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Video Preview
              </CardTitle>
              <CardDescription>
                Review your generated video before final export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-4xl mx-auto">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  {videoData.generatedVideo?.url ? (
                    <video
                      className="w-full h-full object-cover"
                      controls
                      poster={videoData.generatedVideo.thumbnail}
                      src={videoData.generatedVideo.url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center space-y-2">
                        <Play className="h-12 w-12 mx-auto opacity-75" />
                        <p className="opacity-75">Video Preview</p>
                        <p className="text-sm opacity-50">{videoData.title}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Edit Feature Coming Soon",
                        description: "Video editing capabilities will be available in the next update."
                      });
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Video
                  </Button>
                  <Button
                    onClick={() => setActiveTab('export')}
                    disabled={!videoData.generatedVideo?.url}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Approve & Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Details */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{videoData.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span>{videoData.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Style:</span>
                  <span className="capitalize">{videoData.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Music:</span>
                  <span className="capitalize">{videoData.music}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Social Media Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Web Optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Mobile Friendly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>SEO Optimized</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['YouTube', 'Instagram', 'Facebook', 'LinkedIn', 'TikTok'].map(platform => (
                    <Badge key={platform} variant="outline" className="mr-2">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Video
              </CardTitle>
              <CardDescription>
                Download your video in multiple formats and resolutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  className="h-20 flex-col gap-2"
                  onClick={() => handleDownload('1080p')}
                  disabled={!videoData.generatedVideo?.url}
                >
                  <Video className="h-6 w-6" />
                  <span>HD (1080p)</span>
                  <span className="text-xs opacity-75">High Quality</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleDownload('2160p')}
                  disabled={!videoData.generatedVideo?.url}
                >
                  <Video className="h-6 w-6" />
                  <span>4K (2160p)</span>
                  <span className="text-xs opacity-75">Ultra HD</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleDownload('720p')}
                  disabled={!videoData.generatedVideo?.url}
                >
                  <Video className="h-6 w-6" />
                  <span>Web (720p)</span>
                  <span className="text-xs opacity-75">Fast Loading</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleDownloadAll()}
                  disabled={!videoData.generatedVideo?.url}
                >
                  <Download className="h-6 w-6" />
                  <span>All Formats</span>
                  <span className="text-xs opacity-75">ZIP Package</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Versions */}
          <Card>
            <CardHeader>
              <CardTitle>Platform-Specific Versions</CardTitle>
              <CardDescription>
                Get optimized versions for different social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Instagram Stories</h4>
                  <p className="text-sm text-muted-foreground mb-3">9:16 aspect ratio, 15s duration</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePlatformDownload('instagram')}
                    disabled={!videoData.generatedVideo?.url}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">YouTube Shorts</h4>
                  <p className="text-sm text-muted-foreground mb-3">9:16 aspect ratio, 60s max</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePlatformDownload('youtube')}
                    disabled={!videoData.generatedVideo?.url}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">LinkedIn</h4>
                  <p className="text-sm text-muted-foreground mb-3">16:9 aspect ratio, professional format</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePlatformDownload('linkedin')}
                    disabled={!videoData.generatedVideo?.url}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoStudio;