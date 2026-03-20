import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Hammer, FileImage, Share2, Printer, Download, Wand2, Eye, Upload, Palette, Type, Layout, Sparkles } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useProject, defaultBrandData } from '@/contexts/ProjectContext';
import { useBrandAI } from '@/hooks/useBrandAI';
import { SuggestionField } from '@/components/ui/suggestion-field';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { generateAIText, generateBrandAsset } from "@/lib/ai";
import { generateBrandAssetsAPI } from "@/lib/api";
import CampaignLibrary from './faith-nexus/CampaignLibrary';

const ContentForge = () => {
  const { activeProject } = useProject();
  const { getSuggestion, suggestionsEnabled } = useBrandAI();
  const brandData = activeProject?.brandData || defaultBrandData;
  const [activeTab, setActiveTab] = useState('campaign');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-fill from brand context
  const [customizationData, setCustomizationData] = useState({
    headline: '',
    subheadline: '',
    body: '',
    cta: '',
    colors: 'brand',
    style: 'modern',
    format: 'social-post'
  });
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Auto-fill when brand data is available
  useEffect(() => {
    if (brandData.businessName && !customizationData.headline) {
      setCustomizationData(prev => ({
        ...prev,
        headline: brandData.generatedBrand?.messaging?.tagline || brandData.businessName,
        body: brandData.mission || brandData.brandStory || '',
      }));
    }
  }, [brandData]);

  const contentCategories = [
    {
      id: 'social',
      name: 'Social Media',
      icon: Share2,
      templates: [
        { id: 1, name: 'Instagram Post', size: '1080x1080', category: 'Social Media' },
        { id: 2, name: 'Facebook Cover', size: '820x312', category: 'Social Media' },
        { id: 3, name: 'LinkedIn Banner', size: '1584x396', category: 'Social Media' },
        { id: 4, name: 'Twitter Header', size: '1500x500', category: 'Social Media' },
        { id: 5, name: 'Story Template', size: '1080x1920', category: 'Social Media' },
        { id: 6, name: 'YouTube Thumbnail', size: '1280x720', category: 'Social Media' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing Materials',
      icon: FileImage,
      templates: [
        { id: 7, name: 'Flyer', size: '8.5x11', category: 'Print Marketing' },
        { id: 8, name: 'Poster', size: '18x24', category: 'Print Marketing' },
        { id: 9, name: 'Brochure', size: '8.5x11', category: 'Print Marketing' },
        { id: 10, name: 'Banner', size: '6x2 ft', category: 'Print Marketing' },
        { id: 11, name: 'Business Card', size: '3.5x2', category: 'Print Marketing' },
        { id: 12, name: 'Postcard', size: '6x4', category: 'Print Marketing' }
      ]
    },
    {
      id: 'digital',
      name: 'Digital Marketing',
      icon: Palette,
      templates: [
        { id: 13, name: 'Email Header', size: '600x200', category: 'Digital Marketing' },
        { id: 14, name: 'Web Banner', size: '728x90', category: 'Digital Marketing' },
        { id: 15, name: 'Ad Creative', size: '1200x628', category: 'Digital Marketing' },
        { id: 16, name: 'Landing Page Hero', size: '1920x1080', category: 'Digital Marketing' },
        { id: 17, name: 'Newsletter Template', size: '600x800', category: 'Digital Marketing' },
        { id: 18, name: 'Display Ad', size: '300x250', category: 'Digital Marketing' }
      ]
    }
  ];

  const designStyles = [
    { id: 'modern', name: 'Modern', desc: 'Clean, minimal, contemporary' },
    { id: 'bold', name: 'Bold', desc: 'Strong typography, vibrant colors' },
    { id: 'elegant', name: 'Elegant', desc: 'Sophisticated, refined, premium' },
    { id: 'playful', name: 'Playful', desc: 'Fun, colorful, energetic' },
    { id: 'corporate', name: 'Corporate', desc: 'Professional, trustworthy' },
    { id: 'vintage', name: 'Vintage', desc: 'Retro, classic, nostalgic' }
  ];

  const colorSchemes = [
    { id: 'brand', name: 'Brand Colors', preview: ['#2563eb', '#7c3aed', '#059669'] },
    { id: 'vibrant', name: 'Vibrant', preview: ['#f59e0b', '#ef4444', '#8b5cf6'] },
    { id: 'pastel', name: 'Pastel', preview: ['#fbbf24', '#34d399', '#60a5fa'] },
    { id: 'monochrome', name: 'Monochrome', preview: ['#1f2937', '#6b7280', '#d1d5db'] },
    { id: 'sunset', name: 'Sunset', preview: ['#f97316', '#ef4444', '#ec4899'] },
    { id: 'ocean', name: 'Ocean', preview: ['#0ea5e9', '#06b6d4', '#10b981'] }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setPreviewImageUrl(`data:image/svg+xml;base64,${btoa(`<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1E293B"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="#f59e0b">Sovereign Preview</text></svg>`)}`);
    setActiveTab('customize');
  };

  const generateContent = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generate content using AI
      const prompt = `Create professional ${selectedTemplate.name} content.
      Style: ${customizationData.style}
      Colors: ${customizationData.colors}
      
      Generate:
      - Engaging headline (if empty): ${customizationData.headline || 'create one'}
      - Compelling subheadline (if empty): ${customizationData.subheadline || 'create one'}
      - Persuasive body text (if empty): ${customizationData.body || 'create one'}
      - Strong call-to-action (if empty): ${customizationData.cta || 'create one'}
      
      Make it professional, engaging, and suitable for ${selectedTemplate.category}.
      Return as JSON with fields: headline, subheadline, body, cta`;

      const { text } = await generateAIText(prompt);

      try {
        const generated = JSON.parse(text);
        setCustomizationData(prev => ({
          ...prev,
          headline: prev.headline || generated.headline || 'Your Compelling Headline',
          subheadline: prev.subheadline || generated.subheadline || 'Supporting message that converts',
          body: prev.body || generated.body || 'Professional content that engages your audience.',
          cta: prev.cta || generated.cta || 'Get Started Today'
        }));
      } catch (parseError) {
        // If AI didn't return JSON, extract content from plain text
        const lines = text.split('\n').filter(l => l.trim());
        setCustomizationData(prev => ({
          ...prev,
          headline: prev.headline || lines[0] || 'Your Compelling Headline',
          subheadline: prev.subheadline || lines[1] || 'Supporting message that converts',
          body: prev.body || lines.slice(2, -1).join(' ') || 'Professional content that engages your audience.',
          cta: prev.cta || lines[lines.length - 1] || 'Get Started Today'
        }));
      }
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Using Default Content",
        description: "AI generation unavailable, using template content.",
        variant: "default"
      });
    }

    setIsGenerating(false);
    setActiveTab('preview');

    toast({
      title: "Content Generated!",
      description: "Your custom design is ready for download."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-amber-500/20 rounded-full shadow-lg">
          <Hammer className="h-4 w-4 text-amber-500" />
          <span className="text-amber-500 font-medium tracking-wide text-xs uppercase">Asset Production Protocol</span>
        </div>
        <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
          Strategic <span className="text-amber-400">Marketing Assets</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto font-light">
          Deploy high-conversion collateral powered by your Brand DNA.
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaign" className="data-[state=active]:text-amber-500">Campaign Assets</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="customize" disabled={!selectedTemplate}>Customize</TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedTemplate}>Preview</TabsTrigger>
          <TabsTrigger value="export" disabled={!selectedTemplate}>Export</TabsTrigger>
        </TabsList>

        <TabsContent value="campaign" className="mt-6">
          <CampaignLibrary />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Category Navigation */}
          <div className="grid md:grid-cols-3 gap-4">
            {contentCategories.map(category => (
              <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow bg-slate-900 border-slate-800">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-[#1E293B] border border-amber-500/20 rounded-lg flex items-center justify-center mb-2 group-hover:border-amber-500/50 transition-colors">
                    <category.icon className="h-6 w-6 text-amber-500" />
                  </div>
                  <CardTitle className="text-slate-100">{category.name}</CardTitle>
                  <CardDescription className="text-slate-500">{category.templates.length} templates</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Template Grid */}
          <div className="space-y-8">
            {contentCategories.map(category => (
              <div key={category.id}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.name}
                </h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.templates.map(template => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-all hover:scale-105 bg-slate-900 border-slate-800"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="pt-4">
                        <div
                          className="aspect-[4/3] rounded-lg mb-3 flex items-center justify-center bg-slate-800"
                        >
                          <div className="w-full h-full flex items-center justify-center opacity-20">
                            <Sparkles className="h-12 w-12 text-amber-500" />
                          </div>
                          <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">{template.name}</span>
                        </div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.size}</p>
                        <Badge variant="outline" className="mt-2">
                          {template.category}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          {selectedTemplate && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Content Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Content
                  </CardTitle>
                  <CardDescription>Customize your text and messaging</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      value={customizationData.headline}
                      onChange={(e) => setCustomizationData(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder="Your main headline"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subheadline">Subheadline</Label>
                    <Input
                      id="subheadline"
                      value={customizationData.subheadline}
                      onChange={(e) => setCustomizationData(prev => ({ ...prev, subheadline: e.target.value }))}
                      placeholder="Supporting text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="body">Body Text</Label>
                    <Textarea
                      id="body"
                      value={customizationData.body}
                      onChange={(e) => setCustomizationData(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Main content"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cta">Call to Action</Label>
                    <Input
                      id="cta"
                      value={customizationData.cta}
                      onChange={(e) => setCustomizationData(prev => ({ ...prev, cta: e.target.value }))}
                      placeholder="Get Started, Learn More, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Design Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Design Style
                  </CardTitle>
                  <CardDescription>Choose your visual style and colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Design Style</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {designStyles.map(style => (
                        <Card
                          key={style.id}
                          className={`cursor-pointer transition-all p-3 ${customizationData.style === style.id ? 'ring-2 ring-amber-500' : ''
                            }`}
                          onClick={() => setCustomizationData(prev => ({ ...prev, style: style.id }))}
                        >
                          <div className="text-sm font-medium">{style.name}</div>
                          <div className="text-xs text-muted-foreground">{style.desc}</div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Color Scheme</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {colorSchemes.map(scheme => (
                        <Card
                          key={scheme.id}
                          className={`cursor-pointer transition-all p-3 ${customizationData.colors === scheme.id ? 'ring-2 ring-amber-500' : ''
                            }`}
                          onClick={() => setCustomizationData(prev => ({ ...prev, colors: scheme.id }))}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {scheme.preview.map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <div className="text-sm font-medium">{scheme.name}</div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="imageUpload" className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Upload Your Images
                    </Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview and Generate */}
              <Card className="md:col-span-2">
                <CardContent className="pt-6">
                  <Button
                    onClick={generateContent}
                    className="w-full h-12 text-lg"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Generating...
                      </div>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-5 w-5" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview Your Design
              </CardTitle>
              <CardDescription>
                Review your {selectedTemplate?.name} before final export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl mx-auto">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg border-2 border-dashed border-amber-500/30 flex items-center justify-center overflow-hidden relative">
                  {previewImageUrl ? (
                    <img src={previewImageUrl} alt="AI Preview" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-amber-500/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center space-y-2 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10 w-full">
                      <div className="text-amber-400 font-bold text-2xl uppercase tracking-wider">
                        {customizationData.headline || 'Your Headline Here'}
                      </div>
                      <div className="text-amber-500 font-medium">
                        {customizationData.subheadline || 'Your subheadline here'}
                      </div>
                      <div className="text-sm text-slate-300 max-w-md mx-auto">
                        {customizationData.body || 'Your body content will appear here...'}
                      </div>
                      <div className="pt-4">
                        <Button variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
                          {customizationData.cta || 'Call to Action'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Design
              </CardTitle>
              <CardDescription>
                Download your {selectedTemplate?.name} in multiple formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="h-16 flex-col gap-1">
                  <FileImage className="h-5 w-5" />
                  <span>PNG (Web)</span>
                  <span className="text-xs opacity-75">High Quality</span>
                </Button>

                <Button variant="outline" className="h-16 flex-col gap-1">
                  <Printer className="h-5 w-5" />
                  <span>PDF (Print)</span>
                  <span className="text-xs opacity-75">300 DPI</span>
                </Button>

                <Button variant="outline" className="h-16 flex-col gap-1">
                  <Layout className="h-5 w-5" />
                  <span>SVG (Vector)</span>
                  <span className="text-xs opacity-75">Scalable</span>
                </Button>

                <Button variant="outline" className="h-16 flex-col gap-1">
                  <Share2 className="h-5 w-5" />
                  <span>All Formats</span>
                  <span className="text-xs opacity-75">ZIP Package</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Rights & License</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox id="commercial" />
                <div>
                  <Label htmlFor="commercial" className="font-medium">
                    I confirm I have the right to use all provided reference materials
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You certify that any uploaded images or reference materials are owned by you or used with permission.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="license" />
                <div>
                  <Label htmlFor="license" className="font-medium">
                    I understand the commercial usage license
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Full commercial rights included. Use for marketing, advertising, and business purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentForge;