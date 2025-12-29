import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Globe, Search, Zap, BarChart3, Eye, Settings, Code, Palette, Layout, Smartphone, Download, Sparkles } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { ModuleHeader } from '@/components/ui/module-header';
import { LoadingState } from '@/components/LoadingState';
import { useProject, defaultBrandData } from '@/contexts/ProjectContext';
import { useBrandAI } from '@/hooks/useBrandAI';
import { SuggestionField } from '@/components/ui/suggestion-field';
import { generateWebsiteArchitecture } from '@/lib/aiClient';

interface DigitalPresenceProps {
  onNavigateBack?: () => void;
}

const DigitalPresence: React.FC<DigitalPresenceProps> = ({ onNavigateBack }) => {
  const { activeProject } = useProject();
  const { getSuggestion, suggestionsEnabled } = useBrandAI();
  const brandData = activeProject?.brandData || defaultBrandData;
  const [activeTab, setActiveTab] = useState('builder');
  const [websiteData, setWebsiteData] = useState({
    businessName: '',
    industry: '',
    goals: '',
    style: 'modern',
    pages: ['home'],
    features: [],
    content: {},
    generatedWebsite: null as any
  });
  const [buildProgress, setBuildProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);

  // Auto-fill from brand context
  useEffect(() => {
    if (brandData.businessName && !websiteData.businessName) {
      setWebsiteData(prev => ({
        ...prev,
        businessName: brandData.businessName,
        industry: brandData.industry,
        goals: brandData.mission || brandData.differentiation || '',
      }));

      toast({
        title: "✨ Auto-filled from Nexus Genesis",
        description: "Your brand information has been applied",
      });
    }
  }, [brandData]);

  const websiteTemplates = [
    {
      id: 'business',
      name: 'Business Professional',
      description: 'Corporate websites for established businesses',
      features: ['Contact Forms', 'Service Pages', 'About Us', 'Portfolio'],
      style: 'professional',
      pages: 5,
      preview: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center'
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Store',
      description: 'Online stores with payment integration',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Inventory'],
      style: 'modern',
      pages: 8,
      preview: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center'
    },
    {
      id: 'portfolio',
      name: 'Creative Portfolio',
      description: 'Showcase your work and creativity',
      features: ['Gallery', 'Project Showcase', 'Client Testimonials', 'Contact'],
      style: 'creative',
      pages: 4,
      preview: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop&crop=center'
    },
    {
      id: 'service',
      name: 'Service Provider',
      description: 'For consultants and service-based businesses',
      features: ['Booking System', 'Service Listings', 'Testimonials', 'Blog'],
      style: 'clean',
      pages: 6,
      preview: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop&crop=center'
    },
    {
      id: 'restaurant',
      name: 'Restaurant & Food',
      description: 'Restaurants, cafes, and food businesses',
      features: ['Menu Display', 'Online Ordering', 'Reservations', 'Location'],
      style: 'warm',
      pages: 5,
      preview: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop&crop=center'
    },
    {
      id: 'landing',
      name: 'Landing Page',
      description: 'High-converting single-page websites',
      features: ['Lead Capture', 'CTA Optimization', 'Social Proof', 'Analytics'],
      style: 'conversion',
      pages: 1,
      preview: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=200&fit=crop&crop=center'
    }
  ];

  const websiteFeatures = [
    { id: 'responsive', name: 'Mobile Responsive', desc: 'Optimized for all devices' },
    { id: 'seo', name: 'SEO Optimized', desc: 'Built-in search engine optimization' },
    { id: 'fast', name: 'Fast Loading', desc: 'Optimized performance and speed' },
    { id: 'secure', name: 'SSL Security', desc: 'HTTPS encryption included' },
    { id: 'analytics', name: 'Analytics Integration', desc: 'Google Analytics setup' },
    { id: 'forms', name: 'Contact Forms', desc: 'Custom forms with validation' },
    { id: 'social', name: 'Social Integration', desc: 'Social media links and feeds' },
    { id: 'blog', name: 'Blog System', desc: 'Content management for blogging' },
    { id: 'ecommerce', name: 'E-commerce Ready', desc: 'Online store capabilities' },
    { id: 'booking', name: 'Appointment Booking', desc: 'Online scheduling system' }
  ];

  const seoServices = [
    {
      title: 'Keyword Research',
      description: 'Find the best keywords for your industry and location',
      status: 'included'
    },
    {
      title: 'On-Page Optimization',
      description: 'Optimize your content, meta tags, and structure',
      status: 'included'
    },
    {
      title: 'Local SEO Setup',
      description: 'Google My Business optimization for local visibility',
      status: 'included'
    },
    {
      title: 'Technical SEO',
      description: 'Site speed, mobile optimization, and technical improvements',
      status: 'included'
    },
    {
      title: 'Content Strategy',
      description: 'SEO-friendly content planning and creation',
      status: 'premium'
    },
    {
      title: 'Link Building',
      description: 'High-quality backlink acquisition strategy',
      status: 'premium'
    }
  ];

  const handleTemplateSelect = (template) => {
    setWebsiteData(prev => ({
      ...prev,
      style: template.style,
      pages: ['home', 'about', 'services', 'contact'],
      features: template.features
    }));
    setActiveTab('customization');
  };

  const generatePreviewHTML = (websiteData: any) => {
    if (!websiteData?.pages?.home) return '<p>No preview available</p>';

    // Inject Tailwind CDN and make it responsive
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${websiteData.businessName || 'Website'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          ${websiteData.css || ''}
        </style>
      </head>
      <body>
        ${websiteData.pages.home}
        <script>
          ${websiteData.javascript || ''}
        </script>
      </body>
      </html>
    `;
  };

  const handleGenerate = async () => {
    if (!websiteData.businessName || !websiteData.industry) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name and industry",
        variant: "destructive",
      });
      return;
    }

    setIsBuilding(true);
    setBuildProgress(0);

    try {
      const data = await generateWebsiteArchitecture({
        businessName: websiteData.businessName,
        industry: websiteData.industry,
        pages: websiteData.pages,
        style: websiteData.style,
        features: websiteData.features,
        colors: {
          primary: "#2563eb",
          secondary: "#1e40af"
        }
      });

      if (!data || !data.website) {
        toast({
          title: "Generation Failed",
          description: "Could not generate website architecture. Please check your API key.",
          variant: "destructive",
        });
        setIsBuilding(false);
        return;
      }

      // Show progress
      const steps = [
        'Setting up hosting environment...',
        'Installing CMS and frameworks...',
        'Applying design template...',
        'Customizing content and styling...',
        'Implementing features and plugins...',
        'SEO optimization and meta setup...',
        'Testing responsive design...',
        'Final quality assurance...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setBuildProgress(((i + 1) / steps.length) * 100);
        toast({
          title: "Building Website",
          description: steps[i]
        });
      }

      setWebsiteData(prev => ({ ...prev, generatedWebsite: data.website }));
      // Simulate mockup generation
      setMockupUrl('https://via.placeholder.com/1200x800?text=Website+Mockup+Generated');
      setActiveTab('preview');

      toast({
        title: "Website Built Successfully!",
        description: "Your website is ready for preview and deployment."
      });
    } catch (error) {
      console.error('Website generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-amber-500/20 rounded-full shadow-lg">
          <Globe className="h-4 w-4 text-amber-500" />
          <span className="text-amber-500 font-medium tracking-wide text-xs uppercase">Digital Presence Protocol</span>
        </div>
        <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
          AI-Powered <span className="text-amber-400">Web Architecture</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto font-light">
          Create professional websites with built-in SEO optimization and digital marketing tools.
        </p>
      </div>

      {/* Progress Indicator */}
      {isBuilding && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Building Your Website</span>
                <span>{Math.round(buildProgress)}%</span>
              </div>
              <Progress value={buildProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="builder">Templates</TabsTrigger>
          <TabsTrigger value="customization">Customize</TabsTrigger>
          <TabsTrigger value="seo">SEO Setup</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Website Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Website Type</CardTitle>
              <CardDescription>
                Select the template that best fits your business needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {websiteTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:scale-105 bg-slate-900 border-slate-800"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="pt-4">
                      <div
                        className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg mb-4 bg-cover bg-center border border-slate-800"
                        style={{ backgroundImage: `url(${template.preview})` }}
                      >
                      </div>
                      <h3 className="font-semibold mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Pages: {template.pages}</span>
                          <Badge variant="outline">{template.style}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 3).map(feature => (
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

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Tell us about your business to customize your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">
                    Business Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    value={websiteData.businessName}
                    onChange={(e) => setWebsiteData(prev => ({ ...prev, businessName: e.target.value.trim() }))}
                    placeholder="Your Business Name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={websiteData.industry}
                    onChange={(e) => setWebsiteData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Restaurant, Consulting, Retail"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="goals">Website Goals</Label>
                <Textarea
                  id="goals"
                  value={websiteData.goals}
                  onChange={(e) => setWebsiteData(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="What do you want your website to achieve? (e.g., generate leads, sell products, showcase portfolio)"
                  rows={3}
                />
              </div>

              {/* Build Button - Moved Here */}
              <div className="pt-4">
                <Button
                  onClick={handleGenerate}
                  className="w-full h-12 text-lg"
                  disabled={isBuilding || !websiteData.businessName || websiteData.businessName.trim() === ''}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  {isBuilding ? 'Building...' : 'Build My Website'}
                </Button>
                {!websiteData.businessName && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Enter your business name to continue
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customization" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Design Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design & Styling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {['blue', 'purple', 'green', 'orange'].map(color => (
                      <div
                        key={color}
                        className={`h-12 rounded-lg cursor-pointer border-2 ${websiteData.style === color ? 'border-gray-400' : 'border-transparent'
                          }`}
                        style={{ backgroundColor: `var(--${color}-500)` }}
                        onClick={() => setWebsiteData(prev => ({ ...prev, style: color }))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Layout Style</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Modern', 'Classic', 'Minimal', 'Bold'].map(style => (
                      <Button
                        key={style}
                        variant={websiteData.style === style.toLowerCase() ? 'default' : 'outline'}
                        onClick={() => setWebsiteData(prev => ({ ...prev, style: style.toLowerCase() }))}
                        className="h-12"
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Website Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {websiteFeatures.map(feature => (
                    <div key={feature.id} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={feature.id}
                        checked={websiteData.features.includes(feature.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebsiteData(prev => ({
                              ...prev,
                              features: [...prev.features, feature.id]
                            }));
                          } else {
                            setWebsiteData(prev => ({
                              ...prev,
                              features: prev.features.filter(f => f !== feature.id)
                            }));
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                          {feature.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Page Content */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Page Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="homeContent">Homepage Content</Label>
                  <Textarea
                    id="homeContent"
                    placeholder="Describe what should be on your homepage..."
                    rows={3}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aboutContent">About Us</Label>
                    <Textarea
                      id="aboutContent"
                      placeholder="Tell your story..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="servicesContent">Services/Products</Label>
                    <Textarea
                      id="servicesContent"
                      placeholder="List your services or products..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO Optimization Suite
              </CardTitle>
              <CardDescription>
                Built-in search engine optimization to help your website rank higher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {seoServices.map(service => (
                  <div key={service.title} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${service.status === 'included' ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{service.title}</h4>
                        <Badge variant={service.status === 'included' ? 'default' : 'secondary'}>
                          {service.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keyword Research */}
          <Card>
            <CardHeader>
              <CardTitle>Keyword Research & Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetKeywords">Target Keywords</Label>
                <Input
                  id="targetKeywords"
                  placeholder="Enter keywords related to your business"
                />
              </div>
              <div>
                <Label htmlFor="location">Business Location</Label>
                <Input
                  id="location"
                  placeholder="City, State for local SEO"
                />
              </div>
              <Button className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Analyze Keywords & Competition
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Website Preview
                  </CardTitle>
                  <CardDescription>
                    Preview your website before deployment
                  </CardDescription>
                </div>
                {websiteData.generatedWebsite && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const { exportWebsiteZip } = await import('@/lib/exportManager');
                      await exportWebsiteZip(websiteData.generatedWebsite, websiteData.businessName);
                      toast({
                        title: "Download Started",
                        description: "Your website files are being downloaded as a ZIP package."
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download ZIP
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {websiteData.generatedWebsite ? (
                <div className="space-y-4">
                  {mockupUrl && (
                    <div className="space-y-4">
                      <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                        <img src={mockupUrl} alt="Generated Mockup" className="w-full h-full object-contain" />
                      </div>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => window.open(mockupUrl, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Mockup
                      </Button>
                    </div>
                  )}
                  {/* Device Preview Toggle */}
                  <div className="flex justify-center gap-2 mb-4">
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Desktop
                    </Button>
                    <Button variant="outline" size="sm">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Mobile
                    </Button>
                  </div>

                  {/* Website Preview Iframe */}
                  <div className="border-4 border-gray-300 rounded-lg overflow-hidden shadow-2xl">
                    <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600">
                        {websiteData.businessName.toLowerCase().replace(/\s+/g, '')}.com
                      </div>
                    </div>
                    <iframe
                      srcDoc={generatePreviewHTML(websiteData.generatedWebsite)}
                      className="w-full h-[600px] bg-white"
                      title="Website Preview"
                      sandbox="allow-scripts"
                    />
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>This is a live preview of your generated website.</p>
                    <p>Download the files or proceed to deployment.</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  Generate your website to see the preview
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deploy Your Website</CardTitle>
              <CardDescription>
                Launch your website to the world with hosting and domain setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Domain Setup</h3>
                  <div className="space-y-2">
                    <Input placeholder="yourbusiness.com" />
                    <Button variant="outline" className="w-full">
                      Check Domain Availability
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Hosting Options</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Professional Hosting</div>
                      <div className="text-sm text-muted-foreground">SSL, CDN, 99.9% uptime</div>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full h-12">
                <Zap className="mr-2 h-5 w-5" />
                Launch Website
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DigitalPresence;