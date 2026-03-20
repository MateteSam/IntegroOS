import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Palette, Type, FileText, Download, ArrowRight, ArrowLeft, Lightbulb, TrendingUp, CheckCircle2, Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ModuleHeader } from '@/components/ui/module-header';
import { ValidatedInput, ValidatedTextarea } from '@/components/ui/validated-input';
import { SuggestionField } from '@/components/ui/suggestion-field';
import { LoadingState } from '@/components/LoadingState';
import { useProject, defaultBrandData } from '@/contexts/ProjectContext';
import { useBrandAI } from '@/hooks/useBrandAI';
import { exportEditablePackage, convertBrandAssetToEditable } from '@/lib/exportEditable';
import { generateBrandNexus } from '@/lib/ai';
import styles from './BrandGenesis.module.css';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Retail', 'Food & Beverage',
  'Education', 'Real Estate', 'Consulting', 'Manufacturing', 'Creative Services',
  'Professional Services', 'E-commerce', 'Hospitality', 'Entertainment', 'Non-Profit'
];

const BRAND_ARCHETYPES = [
  'The Hero', 'The Sage', 'The Explorer', 'The Innocent', 'The Creator',
  'The Ruler', 'The Caregiver', 'The Everyman', 'The Lover', 'The Jester',
  'The Rebel', 'The Magician'
];

const BRAND_PERSONALITIES = [
  'Professional', 'Innovative', 'Friendly', 'Luxurious', 'Bold',
  'Minimalist', 'Playful', 'Trustworthy', 'Energetic', 'Sophisticated'
];

interface BrandGenesisProps {
  onNavigateBack?: () => void;
}

export default function BrandGenesis({ onNavigateBack }: BrandGenesisProps) {
  const { toast } = useToast();
  const { activeProject, updateBrandData } = useProject();
  const { getSuggestion, suggestionsEnabled, setSuggestionsEnabled } = useBrandAI();
  const brandData = activeProject?.brandData || defaultBrandData;
  const [currentStage, setCurrentStage] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [generatedBrand, setGeneratedBrand] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Stage 1: Business Foundation
    businessName: '',
    industry: '',
    foundedYear: '',
    existingAssets: null as File | null,
    competitorUrls: [] as string[],

    // Stage 2: Brand Soul
    mission: '',
    vision: '',
    values: [] as string[],
    brandStory: '',

    // Stage 3: Target Market
    targetAudience: '',
    customerPainPoints: '',
    customerAspirations: '',
    geographicMarkets: '',

    // Stage 4: Brand Personality
    brandArchetype: '',
    brandPersonality: '',
    brandAdjectives: [] as string[],
    communicationStyle: 'balanced',
    emotionalGoal: '',

    // Stage 5: Visual Preferences
    stylePreferences: [] as string[],
    colorPreferences: '',
    colorRestrictions: '',
    logoStyle: '',
    referenceImages: [] as File[],

    // Stage 6: Competitive Landscape
    directCompetitors: '',
    marketPositioning: 'mid-market',
    differentiation: '',

    // Stage 7: Use Cases
    applications: [] as string[],
    fileFormats: [] as string[],
    brandTouchpoints: [] as string[]
  });

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('brand-genesis-draft', JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('brand-genesis-draft');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error('Failed to load draft');
      }
    }
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Also update brand context for sharing across components
    updateBrandData({ [field]: value });
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStage = (stage: number): boolean => {
    const errors: Record<string, string> = {};

    if (stage === 1) {
      if (!formData.businessName.trim()) {
        errors.businessName = 'Business name is required';
      } else if (formData.businessName.length < 2) {
        errors.businessName = 'Business name must be at least 2 characters';
      } else if (formData.businessName.length > 100) {
        errors.businessName = 'Business name must be less than 100 characters';
      }

      if (!formData.industry) {
        errors.industry = 'Please select an industry';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addToArray = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), value.trim()]
      }));
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const nextStage = () => {
    if (validateStage(currentStage)) {
      if (currentStage < 7) setCurrentStage(currentStage + 1);
    } else {
      toast({
        title: "Please fix errors",
        description: "Some required fields are missing or invalid",
        variant: "destructive"
      });
    }
  };

  const previousStage = () => {
    if (currentStage > 1) setCurrentStage(currentStage - 1);
  };

  const handleGenerate = async () => {
    if (!validateStage(1)) {
      toast({
        title: "Required fields missing",
        description: "Please fill in Business Name and Industry",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      // Stage 1: Analyze competitors (if provided)
      if (formData.competitorUrls.length > 0) {
        setLoadingStage('analyzing');
        setProgress(15);
        const compAnalysis = await generateBrandNexus({
          questionnaireData: formData,
          stage: 'analyze-competitors'
        });

        if (compAnalysis?.competitiveAnalysis) {
          toast({
            title: "Competitive analysis complete",
            description: `Found ${compAnalysis.competitiveAnalysis.opportunities.length} differentiation opportunities`,
          });
        }
        setProgress(30);
      }

      // Stage 2: Generate complete brand identity
      setLoadingStage('generating');
      setProgress(40);
      const data = await generateBrandNexus({
        questionnaireData: formData,
        stage: 'generate-complete-brand'
      });

      setLoadingStage('finalizing');
      setProgress(90);
      setGeneratedBrand(data);
      // Store generated brand in context for sharing
      updateBrandData({ generatedBrand: data });
      setProgress(100);

      // Clear draft after successful generation
      localStorage.removeItem('brand-genesis-draft');

      toast({
        title: "🎉 Nexus Genesis Complete!",
        description: "Your comprehensive brand identity has been generated with AI",
      });

    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again. If the error persists, check your internet connection.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
      setLoadingStage('');
    }
  };

  const renderStage1 = () => (
    <div className="space-y-6">
      <ValidatedInput
        id="businessName"
        label="Business Name"
        value={formData.businessName}
        onChange={(v) => updateField('businessName', v)}
        placeholder="e.g., TechVision Solutions"
        required
        maxLength={100}
        showCharCount
        error={validationErrors.businessName}
        isValid={formData.businessName.length >= 2 && formData.businessName.length <= 100}
        hint="Your company or brand name"
      />

      <div className="space-y-2">
        <Label htmlFor="industry">
          Industry <span className="text-destructive ml-1">*</span>
        </Label>
        <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
          <SelectTrigger
            id="industry"
            className="bg-background/50"
            aria-invalid={!!validationErrors.industry}
          >
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map(ind => (
              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Founded Year / Business Stage</Label>
        <Input
          value={formData.foundedYear}
          onChange={(e) => updateField('foundedYear', e.target.value)}
          placeholder="e.g., 2020 or 'Early Startup'"
          className="bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <Label>Competitor URLs (one per line)</Label>
        <Textarea
          placeholder="https://competitor1.com&#10;https://competitor2.com"
          onChange={(e) => updateField('competitorUrls', e.target.value.split('\n').filter(Boolean))}
          className="bg-background/50 min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground">
          <Lightbulb className="w-4 h-4 inline mr-1" />
          AI will analyze competitor branding to help you stand out
        </p>
      </div>
    </div>
  );

  const renderStage2 = () => (
    <div className="space-y-6">
      <SuggestionField
        type="textarea"
        label="Mission Statement"
        value={formData.mission}
        onChange={(v) => updateField('mission', v)}
        placeholder="What is your company's purpose?"
        onGetSuggestion={() => getSuggestion('mission')}
        suggestionsEnabled={suggestionsEnabled}
      />

      <SuggestionField
        type="textarea"
        label="Vision Statement"
        value={formData.vision}
        onChange={(v) => updateField('vision', v)}
        placeholder="Where do you see your company in the future?"
        onGetSuggestion={() => getSuggestion('vision')}
        suggestionsEnabled={suggestionsEnabled}
      />

      <div className="space-y-2">
        <Label>Core Values</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a value (press Enter)"
            className="bg-background/50"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('values', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.values.map((value, idx) => (
            <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('values', idx)}>
              {value} ✕
            </Badge>
          ))}
        </div>
      </div>

      <SuggestionField
        type="textarea"
        label="Brand Story"
        value={formData.brandStory}
        onChange={(v) => updateField('brandStory', v)}
        placeholder="Tell us your brand's origin story..."
        onGetSuggestion={() => getSuggestion('brandStory')}
        suggestionsEnabled={suggestionsEnabled}
      />
    </div>
  );

  const renderStage3 = () => (
    <div className="space-y-6">
      <SuggestionField
        type="textarea"
        label="Primary Target Audience"
        value={formData.targetAudience}
        onChange={(v) => updateField('targetAudience', v)}
        placeholder="Describe your ideal customer (age, profession, interests, etc.)"
        onGetSuggestion={() => getSuggestion('targetAudience')}
        suggestionsEnabled={suggestionsEnabled}
      />

      <SuggestionField
        type="textarea"
        label="Customer Pain Points"
        value={formData.customerPainPoints}
        onChange={(v) => updateField('customerPainPoints', v)}
        placeholder="What problems do your customers face?"
        onGetSuggestion={() => getSuggestion('customerPainPoints')}
        suggestionsEnabled={suggestionsEnabled}
      />

      <div className="space-y-2">
        <Label>Customer Aspirations</Label>
        <Textarea
          value={formData.customerAspirations}
          onChange={(e) => updateField('customerAspirations', e.target.value)}
          placeholder="What do your customers aspire to achieve?"
          className="bg-background/50 min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Geographic Markets</Label>
        <Input
          value={formData.geographicMarkets}
          onChange={(e) => updateField('geographicMarkets', e.target.value)}
          placeholder="e.g., North America, Global, Urban areas"
          className="bg-background/50"
        />
      </div>
    </div>
  );

  const renderStage4 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Brand Archetype</Label>
        <Select value={formData.brandArchetype} onValueChange={(v) => updateField('brandArchetype', v)}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Select archetype" />
          </SelectTrigger>
          <SelectContent>
            {BRAND_ARCHETYPES.map(arch => (
              <SelectItem key={arch} value={arch}>{arch}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Brand Personality</Label>
        <Select value={formData.brandPersonality} onValueChange={(v) => updateField('brandPersonality', v)}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Select personality" />
          </SelectTrigger>
          <SelectContent>
            {BRAND_PERSONALITIES.map(pers => (
              <SelectItem key={pers} value={pers}>{pers}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Brand Adjectives (3-5 words that describe your brand)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add an adjective (press Enter)"
            className="bg-background/50"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('brandAdjectives', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.brandAdjectives.map((adj, idx) => (
            <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('brandAdjectives', idx)}>
              {adj} ✕
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Emotional Response Goal</Label>
        <Input
          value={formData.emotionalGoal}
          onChange={(e) => updateField('emotionalGoal', e.target.value)}
          placeholder="e.g., Trust, Excitement, Calm, Inspiration"
          className="bg-background/50"
        />
      </div>
    </div>
  );

  const renderStage5 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Style Preferences</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add style (e.g., Modern, Classic)"
            className="bg-background/50"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('stylePreferences', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.stylePreferences.map((style, idx) => (
            <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeFromArray('stylePreferences', idx)}>
              {style} ✕
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color Preferences</Label>
        <Input
          value={formData.colorPreferences}
          onChange={(e) => updateField('colorPreferences', e.target.value)}
          placeholder="e.g., Blue, Green, Warm tones"
          className="bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <Label>Color Restrictions (colors to avoid)</Label>
        <Input
          value={formData.colorRestrictions}
          onChange={(e) => updateField('colorRestrictions', e.target.value)}
          placeholder="e.g., Red, Orange"
          className="bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <Label>Logo Style</Label>
        <Select value={formData.logoStyle} onValueChange={(v) => updateField('logoStyle', v)}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Select logo style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wordmark">Wordmark (Text only)</SelectItem>
            <SelectItem value="icon">Icon/Symbol only</SelectItem>
            <SelectItem value="combination">Combination (Icon + Text)</SelectItem>
            <SelectItem value="emblem">Emblem (Text inside shape)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStage6 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Direct Competitors</Label>
        <Textarea
          value={formData.directCompetitors}
          onChange={(e) => updateField('directCompetitors', e.target.value)}
          placeholder="List your main competitors"
          className="bg-background/50 min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Market Positioning</Label>
        <Select value={formData.marketPositioning} onValueChange={(v) => updateField('marketPositioning', v)}>
          <SelectTrigger className="bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="economy">Economy / Budget</SelectItem>
            <SelectItem value="mid-market">Mid-Market</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Key Differentiation Points</Label>
        <Textarea
          value={formData.differentiation}
          onChange={(e) => updateField('differentiation', e.target.value)}
          placeholder="What makes you unique compared to competitors?"
          className="bg-background/50 min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderStage7 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Intended Applications</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add application (press Enter)"
            className="bg-background/50"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('applications', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.applications.map((app, idx) => (
            <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeFromArray('applications', idx)}>
              {app} ✕
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">e.g., Website, Business Cards, Signage, Social Media</p>
      </div>

      <div className="space-y-2">
        <Label>Brand Touchpoints</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add touchpoint (press Enter)"
            className="bg-background/50"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('brandTouchpoints', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.brandTouchpoints.map((tp, idx) => (
            <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeFromArray('brandTouchpoints', idx)}>
              {tp} ✕
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const handleDownloadBrandKit = async () => {
    if (!generatedBrand) return;

    toast({
      title: "Preparing Brand Kit",
      description: "Creating your complete brand package...",
    });

    const { createBrandKitZip } = await import('@/lib/exportManager');

    // Convert generated brand to expected format
    const brandData = {
      logos: generatedBrand.logos?.concepts || [],
      colors: generatedBrand.colors || {},
      typography: generatedBrand.typography || {},
    };

    await createBrandKitZip(brandData, formData.businessName);

    toast({
      title: "Download Complete",
      description: "Your brand kit has been downloaded successfully.",
    });
  };

  const handleExportEditable = async () => {
    if (!generatedBrand) return;

    toast({
      title: "Preparing Editable Files",
      description: "Creating SVG, Figma JSON, and metadata...",
    });

    try {
      // Export each logo variant as editable
      for (const logo of generatedBrand.logos?.concepts || []) {
        const editableDesign = convertBrandAssetToEditable(
          { type: 'logo', ...logo },
          {
            businessName: formData.businessName,
            colors: generatedBrand.colors,
            typography: generatedBrand.typography
          }
        );
        await exportEditablePackage(editableDesign, ['svg', 'figma', 'metadata']);
      }

      toast({
        title: "Export Complete",
        description: "Editable design files downloaded. Open in Illustrator, Affinity, or Figma!",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const renderResults = () => {
    if (!generatedBrand) return null;

    return (
      <div className="space-y-6">
        <Tabs defaultValue="logos" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="logos">Logos</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="logos" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-3 gap-4">
              {generatedBrand.logos?.concepts?.map((concept: any) => (
                <Card key={concept.id} className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{concept.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className={styles.mockupContainer}>
                      {concept.url ? (
                        <img src={concept.url} alt={concept.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="text-center text-muted-foreground">Logo Preview</div>
                      )}
                    </div>
                    {concept.url && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={async () => {
                              const { exportLogo } = await import('@/lib/exportManager');
                              await exportLogo(concept.url, formData.businessName, 'png', 'high');
                              toast({ title: "Download Started", description: "Downloading logo as PNG (High)" });
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PNG High
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={async () => {
                              const { exportLogo } = await import('@/lib/exportManager');
                              await exportLogo(concept.url, formData.businessName, 'png', 'medium');
                              toast({ title: "Download Started", description: "Downloading logo as PNG (Medium)" });
                            }}
                          >
                            PNG Med
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={async () => {
                              const { exportLogo } = await import('@/lib/exportManager');
                              await exportLogo(concept.url, formData.businessName, 'pdf');
                              toast({ title: "Download Started", description: "Downloading logo as PDF" });
                            }}
                          >
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={async () => {
                              const { exportLogo } = await import('@/lib/exportManager');
                              await exportLogo(concept.url, formData.businessName, 'svg');
                              toast({ title: "Download Started", description: "Downloading logo as SVG" });
                            }}
                          >
                            SVG
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4 mt-4">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Brand Color System</CardTitle>
                <CardDescription>Your complete color palette with usage guidelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Primary</p>
                    <div className={styles.colorPreview} style={{ backgroundColor: generatedBrand.colors?.primary }} />
                    <p className="text-xs text-muted-foreground mt-1">{generatedBrand.colors?.primary}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Secondary</p>
                    <div className={styles.colorPreview} style={{ backgroundColor: generatedBrand.colors?.secondary }} />
                    <p className="text-xs text-muted-foreground mt-1">{generatedBrand.colors?.secondary}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Accent 1</p>
                    <div className={styles.colorPreview} style={{ backgroundColor: generatedBrand.colors?.accent1 }} />
                    <p className="text-xs text-muted-foreground mt-1">{generatedBrand.colors?.accent1}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Accent 2</p>
                    <div className={styles.colorPreview} style={{ backgroundColor: generatedBrand.colors?.accent2 }} />
                    <p className="text-xs text-muted-foreground mt-1">{generatedBrand.colors?.accent2}</p>
                  </div>
                </div>

                {generatedBrand.colors?.neutrals && (
                  <div>
                    <p className="text-sm font-medium mb-2">Neutral Palette</p>
                    <div className="flex gap-2">
                      {generatedBrand.colors.neutrals.map((neutral: string, idx: number) => (
                        <div key={idx} className={styles.colorPreview} style={{ backgroundColor: neutral }} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Color Rationale</p>
                  <p className="text-sm text-muted-foreground">{generatedBrand.colors?.primaryReason}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4 mt-4">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Typography System</CardTitle>
                <CardDescription>Professional font recommendations and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Heading Font</p>
                  <p className="text-2xl font-bold">{generatedBrand.typography?.headingFont}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Body Font</p>
                  <p className="text-lg">{generatedBrand.typography?.bodyFont}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Display Font</p>
                  <p className="text-xl font-serif">{generatedBrand.typography?.displayFont}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Rationale</p>
                  <p className="text-sm text-muted-foreground">{generatedBrand.typography?.rationale}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-4 mt-4">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Brand Guidelines</CardTitle>
                <CardDescription>Comprehensive usage instructions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Brand Promise</p>
                  <p className="text-sm text-muted-foreground">{generatedBrand.messaging?.brandPromise}</p>
                </div>
                <div>
                  <p className="font-medium mb-2">Tagline Options</p>
                  <div className="space-y-1">
                    {generatedBrand.messaging?.taglines?.slice(0, 3).map((tagline: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{tagline}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Elevator Pitch</p>
                  <p className="text-sm text-muted-foreground">{generatedBrand.messaging?.elevatorPitch}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid md:grid-cols-2 gap-3">
          <Button className="flex-1" size="lg" onClick={handleDownloadBrandKit}>
            <Download className="w-4 h-4 mr-2" />
            Download Complete Brand Kit
          </Button>
          <Button variant="outline" size="lg" onClick={handleExportEditable}>
            <Package className="w-4 h-4 mr-2" />
            Export Editable (SVG/Figma/AI)
          </Button>
        </div>
        <Button variant="ghost" size="lg" onClick={() => setGeneratedBrand(null)} className="w-full">
          Generate New Brand
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Nexus Genesis</CardTitle>
                <CardDescription>
                  AI-Powered Complete Corporate Identity Suite
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <Label htmlFor="suggestions-toggle" className="text-sm font-medium cursor-pointer">
                AI Suggestions
              </Label>
              <Switch
                id="suggestions-toggle"
                checked={suggestionsEnabled}
                onCheckedChange={setSuggestionsEnabled}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {!generatedBrand ? (
        <>
          {/* Progress Tracker */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4, 5, 6, 7].map((stage) => (
                  <Button
                    key={stage}
                    variant={currentStage === stage ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentStage(stage)}
                    className="w-12 h-12 rounded-full p-0"
                  >
                    {stage}
                  </Button>
                ))}
              </div>
              <Progress value={(currentStage / 7) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Current Stage */}
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStage === 1 && '1. Business Foundation'}
                {currentStage === 2 && '2. Brand Soul & Identity'}
                {currentStage === 3 && '3. Target Market Intelligence'}
                {currentStage === 4 && '4. Brand Personality Matrix'}
                {currentStage === 5 && '5. Visual Identity Preferences'}
                {currentStage === 6 && '6. Competitive Landscape'}
                {currentStage === 7 && '7. Use Case Planning'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStage === 1 && renderStage1()}
              {currentStage === 2 && renderStage2()}
              {currentStage === 3 && renderStage3()}
              {currentStage === 4 && renderStage4()}
              {currentStage === 5 && renderStage5()}
              {currentStage === 6 && renderStage6()}
              {currentStage === 7 && renderStage7()}

              <div className="flex gap-2 mt-6">
                {currentStage > 1 && (
                  <Button variant="outline" onClick={previousStage}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                {currentStage < 7 ? (
                  <Button onClick={nextStage} className="ml-auto">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleGenerate} disabled={generating} size="lg" className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500">
                    {generating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating... {progress}%
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Complete Brand Identity
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {generating && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress < 20 && 'Analyzing competitors and market trends...'}
                  {progress >= 20 && progress < 40 && 'Generating color systems and palettes...'}
                  {progress >= 40 && progress < 60 && 'Creating multiple logo concepts...'}
                  {progress >= 60 && progress < 80 && 'Designing typography system...'}
                  {progress >= 80 && progress < 95 && 'Crafting brand messaging and guidelines...'}
                  {progress >= 95 && 'Finalizing your complete brand identity...'}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        renderResults()
      )}
    </div>
  );
}
