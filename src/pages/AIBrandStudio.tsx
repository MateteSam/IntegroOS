import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2, Wand2, Download, Upload, X, Image as ImageIcon,
  Lightbulb, FolderOpen, Star, Trash2, Share2, Sparkles,
  Save, Zap, Box, Layers, Settings, History, Eye, MoreHorizontal, ChevronRight, RefreshCw, Calendar, ShieldCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { BrandDNAExtractor } from "@/components/BrandDNAExtractor";
import { MockupGenerator } from "@/components/MockupGenerator";
import { AssetLightbox } from "@/components/AssetLightbox";
import { cn } from "@/lib/utils";
import { ShareDialog } from "@/components/ShareDialog";
import { ComparisonView } from "@/components/ComparisonView";
import { MasonryGrid } from "@/components/MasonryGrid";
import { AssetComments } from "@/components/AssetComments";
import { OptimizedImage } from "@/components/OptimizedImage";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { validateInput, assetGenerationSchema } from "@/lib/validation";
import { cache } from "@/lib/cacheManager";
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimiter";
import { generateBrandAsset } from "@/lib/aiClient";
import { HeroSection } from "@/components/premium/HeroSection";
import { GeometricBackground } from "@/components/premium/GeometricBackground";
import { SectionIndicator } from "@/components/premium/SectionIndicator";
import { PromptBuilderPanel } from "@/components/premium/PromptBuilderPanel";
import { PremiumLoadingState } from "@/components/premium/PremiumLoadingState";
import { DynamicAssetGrid } from "@/components/premium/DynamicAssetGrid";
import { FloatingToolbar } from "@/components/premium/FloatingToolbar";
import { AssetTypeSelector } from "@/components/premium/AssetTypeSelector";
import { ScrollToTop } from "@/components/premium/ScrollToTop";

type AssetType = "logo" | "business-card" | "letterhead" | "poster" | "flyer" |
  "social-ig" | "social-fb" | "social-twitter" | "social-linkedin" | "social-pinterest" | "social-youtube" |
  "app-icon" | "email-sig" | "mockup" | "packaging" | "tshirt";

interface GeneratedAsset {
  type: AssetType;
  url: string;
  fallbackUrl?: string;
  prompt: string;
  variation: number;
  timestamp: number;
}

interface ReferenceImage {
  file: File;
  preview: string;
}

const PROMPT_TEMPLATES = [
  { name: "Sovereign Tech", prompt: "Elite tech architecture, deep space black and silver, surgical minimalism, high-fidelity" },
  { name: "Artisanal Elite", prompt: "Premium artisanal essence, charcoal and gold accents, sophisticated luxury, strategic depth" },
  { name: "High-Performance", prompt: "Dynamic elite performance, monochromatic with platinum accents, architectural precision, bold minimalism" },
  { name: "Cognitive Eco", prompt: "Sustainable luxury intelligence, deep forest and slate, organic geometric precision, earth-conscious elite" },
  { name: "Clinical Luxury", prompt: "Surgical luxury brand, midnight black and pearl gold, elegant, sophisticated, high-end architectural" },
];

const assetCategories = {
  social: [
    { id: "social-ig" as AssetType, label: "Instagram Post", size: "1080x1080", desc: "Square format" },
    { id: "social-fb" as AssetType, label: "Facebook Post", size: "1200x630", desc: "Link preview" },
    { id: "social-twitter" as AssetType, label: "Twitter Post", size: "1200x675", desc: "Tweet image" },
    { id: "social-linkedin" as AssetType, label: "LinkedIn Banner", size: "1584x396", desc: "Profile cover" },
    { id: "social-pinterest" as AssetType, label: "Pinterest Pin", size: "1000x1500", desc: "Tall format" },
    { id: "social-youtube" as AssetType, label: "YouTube Thumbnail", size: "1280x720", desc: "Video cover" },
  ],
  print: [
    { id: "poster" as AssetType, label: "Poster", size: "18x24in", desc: "Large format" },
    { id: "flyer" as AssetType, label: "Flyer", size: "8.5x11in", desc: "Letter size" },
    { id: "business-card" as AssetType, label: "Business Card", size: "3.5x2in", desc: "Standard" },
    { id: "letterhead" as AssetType, label: "Letterhead", size: "8.5x11in", desc: "Official docs" },
  ],
  digital: [
    { id: "logo" as AssetType, label: "Logo", size: "1024x1024", desc: "Square icon" },
    { id: "app-icon" as AssetType, label: "App Icon", size: "1024x1024", desc: "iOS/Android" },
    { id: "email-sig" as AssetType, label: "Email Signature", size: "600x200", desc: "Banner" },
  ],
  merch: [
    { id: "mockup" as AssetType, label: "Brand Mockup", size: "1024x768", desc: "Display" },
    { id: "packaging" as AssetType, label: "Packaging", size: "1024x1024", desc: "Box/bag" },
    { id: "tshirt" as AssetType, label: "T-Shirt Design", size: "1024x1024", desc: "Apparel" },
  ],
};

export default function AIBrandStudio() {
  const { user, isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<AssetType[]>(["logo"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [activeTab, setActiveTab] = useState("social");
  const [variations, setVariations] = useState(3);
  const [savedAssets, setSavedAssets] = useState<any[]>([]);
  const [view, setView] = useState<'studio' | 'library' | 'analytics'>('studio');
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<GeneratedAsset | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<any>(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // New features state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentCollectionId, setCurrentCollectionId] = useState<string>("");
  const [showDNAExtractor, setShowDNAExtractor] = useState(false);
  const [showMockupGen, setShowMockupGen] = useState(false);
  const [extractedDNA, setExtractedDNA] = useState<any>(null);
  const [selectedForComments, setSelectedForComments] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const assetGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSavedAssets();
  }, []);

  const loadSavedAssets = async () => {
    if (!user) return;

    try {
      const cacheKey = `saved-assets-${user.id}`;
      const cached = cache.get<any[]>(cacheKey);

      if (cached) {
        setSavedAssets(cached);
        return;
      }

      const { data, error } = await supabase
        .from("user_designs")
        .select("*")
        .eq("user_id", user.id)
        .eq("asset_type", "ai-brand-asset")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setSavedAssets(data);
        cache.set(cacheKey, data, 1000 * 60 * 5);
      }
    } catch (error) {
      console.error("Error loading saved assets:", error);
      toast.error("Failed to load saved assets");
    }
  };

  const toggleAssetType = (type: AssetType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (referenceImages.length + files.length > 5) {
      toast.error("Maximum 5 reference images allowed");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImages((prev) => [
          ...prev,
          { file, preview: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const enhancePromptWithContext = (basePrompt: string, assetType: AssetType, variationIndex: number) => {
    const allAssets = Object.values(assetCategories).flat();
    const assetConfig = allAssets.find((a) => a.id === assetType);

    const variations = [
      "clean, professional, corporate style",
      "bold, creative, artistic approach",
      "minimal, elegant, sophisticated design"
    ];

    const styleGuide = variations[variationIndex % 3];

    return `${basePrompt}. ${styleGuide}. Professional ${assetConfig?.label.toLowerCase()} design optimized for ${assetConfig?.size}. High quality, modern aesthetic, print-ready.`;
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to generate assets");
      return;
    }

    if (!rateLimiter.check('ai-generation', RATE_LIMITS.AI_GENERATION)) {
      const waitTime = Math.ceil(rateLimiter.getWaitTime('ai-generation', RATE_LIMITS.AI_GENERATION) / 1000);
      toast.error(`Rate limit reached. Please wait ${waitTime} seconds before generating again.`);
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a description for your brand assets");
      return;
    }

    if (selectedTypes.length === 0) {
      toast.error("Please select at least one asset type");
      return;
    }

    setIsGenerating(true);
    setGeneratedAssets([]);

    try {
      const allPromises = [];

      for (const type of selectedTypes) {
        for (let i = 0; i < variations; i++) {
          const enhancedPrompt = enhancePromptWithContext(prompt, type, i);

          const validation = validateInput(assetGenerationSchema, {
            prompt: enhancedPrompt,
            assetType: type,
            variationIndex: i,
            referenceImage: referenceImages[0]?.preview,
          });

          if (!validation.success) {
            console.error('Validation failed, skipping asset');
            continue;
          }

          const validatedData = validation.data;

          allPromises.push(
            generateBrandAsset(validatedData).then((data) => {
              return { type, variation: i, ...data };
            })
          );
        }
      }

      const batchSize = 3;
      for (let i = 0; i < allPromises.length; i += batchSize) {
        const batch = allPromises.slice(i, i + batchSize);
        const results = await Promise.all(batch);

        results.forEach((result) => {
          if (result?.imageUrl) {
            setGeneratedAssets((prev) => [
              ...prev,
              {
                type: result.type,
                url: result.imageUrl,
                fallbackUrl: result.fallbackUrl,
                prompt: result.prompt || prompt,
                variation: result.variation,
                timestamp: Date.now()
              },
            ]);
          }
        });

        if (i + batchSize < allPromises.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      toast.success(`Generated ${selectedTypes.length * variations} brand assets!`);
      await saveToLibrary();
    } catch (error: any) {
      console.error("Generation error:", error);
      if (error.message?.includes("Rate limit")) {
        toast.error("Rate limit reached. Please wait a moment and try again.");
      } else if (error.message?.includes("credits") || error.status === 402) {
        toast.error("AI credits depleted. Please add credits to continue.");
      } else {
        toast.error(error.message || "Failed to generate assets");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToLibrary = async () => {
    if (!user || generatedAssets.length === 0) return;

    try {
      const { error } = await supabase.from("user_designs").insert([{
        user_id: user.id,
        asset_type: "ai-brand-asset",
        title: `${prompt.slice(0, 50)}...`,
        data: {
          prompt,
          assets: generatedAssets.map(a => ({
            type: a.type,
            url: a.url,
            fallbackUrl: a.fallbackUrl, // Ensure fallbackUrl is saved
            prompt: a.prompt,
            variation: a.variation
          })),
          referenceImages: referenceImages.length,
        } as any,
      }]);

      if (!error) {
        cache.delete(`saved-assets-${user.id}`);
        loadSavedAssets();
        toast.success("Saved to library");
      } else {
        throw error;
      }
    } catch (error) {
      console.error("Save to library error:", error);
      toast.error("Failed to save to library");
    }
  };

  const downloadAsset = async (asset: GeneratedAsset, format: string = "png") => {
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${asset.type}-v${asset.variation + 1}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download asset");
    }
  };

  const downloadAll = async () => {
    toast.info("Downloading all assets...");
    for (const asset of generatedAssets) {
      await downloadAsset(asset);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast.success("All assets downloaded!");
  };

  const toggleFavorite = (asset: GeneratedAsset, index: number) => {
    const key = asset.url + index;
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(key)) {
        newFavorites.delete(key);
        toast.success('Removed from favorites');
      } else {
        newFavorites.add(key);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });
  };

  const handlePreview = (asset: GeneratedAsset, index: number) => {
    setLightboxIndex(index);
    setSelectedAsset(asset);
    setLightboxOpen(true);
  };

  const deleteFromLibrary = async (id: string) => {
    try {
      const { error } = await supabase.from("user_designs").delete().eq("id", id);
      if (error) throw error;
      cache.delete(`saved-assets-${user.id}`);
      loadSavedAssets();
      toast.success("Deleted from library");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const scrollToGeneration = () => {
    assetGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-primary/20 rounded-full shadow-lg">
          <ImageIcon className="h-4 w-4 text-primary" />
          <span className="text-primary font-medium tracking-wide text-xs uppercase">Visual Synthesis Protocol</span>
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">
          Visual <span className="text-primary">Brand Architecture</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto font-light">
          Generate professional brand assets and visual identity systems with AI.
        </p>

        {/* View Toggle */}
        <div className="flex justify-center mt-6">
          <div className="flex p-1 bg-muted/50 rounded-lg border border-border backdrop-blur-sm">
            <button
              onClick={() => setView('studio')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                view === 'studio' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
              )}
            >
              <Sparkles className="h-3 w-3" />
              Creation Studio
            </button>
            <button
              onClick={() => setView('library')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                view === 'library' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
              )}
            >
              <FolderOpen className="h-3 w-3" />
              Asset Library
            </button>
          </div>
        </div>
      </div >

      <main className="space-y-8">
        {view === 'studio' && (
          <>
            <div className="space-y-8" ref={assetGridRef}>
              <div className="lg:col-span-2 space-y-12">
                {/* Prompt Builder */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Visual Specification</label>
                    <div className="flex flex-wrap gap-2">
                      {PROMPT_TEMPLATES.map((template) => (
                        <Badge
                          key={template.name}
                          variant="outline"
                          className="cursor-pointer border-border bg-accent/5 hover:bg-primary/20 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all px-3 py-1 text-[10px] uppercase tracking-wider"
                          onClick={() => setPrompt(template.prompt)}
                        >
                          {template.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
                    <Card className="relative bg-card/50 border-border/50 glass p-0 overflow-hidden">
                      <PromptBuilderPanel
                        prompt={prompt}
                        onPromptChange={setPrompt}
                        placeholder="Describe your brand vision, style, colors, and personality..."
                      />
                    </Card>
                  </div>
                </div>

                {/* Reference Media */}
                <div className="space-y-6">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Aesthetic Reference</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {referenceImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border group hover:border-primary/40 transition-all">
                        <img src={img.preview} className="w-full h-full object-cover" alt={`Reference ${i + 1}`} />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(i)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {referenceImages.length < 4 && (
                      <label className="aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-accent/5 hover:bg-accent/10 hover:border-primary/20 cursor-pointer transition-all">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Add Media</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          multiple
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {/* Controls */}
                <div className="bg-card/30 border border-border/50 glass rounded-3xl p-8 space-y-10">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Asset Output</span>
                      <span className="text-[10px] font-mono text-primary">{variations} Variations</span>
                    </div>
                    <Slider
                      value={[variations]}
                      onValueChange={([v]) => setVariations(v)}
                      min={1}
                      max={5}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Primary Vector</label>
                    <AssetTypeSelector
                      selectedType={selectedTypes[0] || "logo"}
                      onTypeSelect={(type) => setSelectedTypes([type as AssetType])}
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim() || selectedTypes.length === 0}
                    className="w-full h-16 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg hover-lift glow-gold border-none"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin mr-3" />
                        Orchestrating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 mr-3" />
                        Initialize Studio
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-8 rounded-3xl border border-border bg-accent/5 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Lightbulb className="w-5 h-5" />
                    <h4 className="text-xs uppercase tracking-widest font-bold">Strategic Tip</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Specify exact HEX codes or material textures (e.g. "Brushed Gold", "Tactile Matte") for more precise creative outputs.
                  </p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {generatedAssets.length > 0 && (
              <section className="relative py-24 px-6 border-t border-border bg-accent/5">
                <div className="max-w-7xl mx-auto space-y-12">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                      <SectionIndicator number="03" title="Creative Output" />
                      <p className="text-muted-foreground text-sm">Professional vector and raster assets generated for your brand</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={downloadAll}
                        className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export All
                      </Button>
                      {isAuthenticated && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveToLibrary}
                          className="border-border bg-card text-xs text-foreground px-6 h-10 hover:bg-accent/10 transition-all rounded-xl"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Archive Collection
                        </Button>
                      )}
                    </div>
                  </div>

                  <DynamicAssetGrid
                    assets={generatedAssets}
                    onPreview={handlePreview}
                    onDownload={downloadAsset}
                    onFavorite={toggleFavorite}
                    favorites={favorites}
                  />
                </div>
              </section>
            )}
          </>
        )}

        {view === 'library' && (
          <section className="relative py-12 px-6 max-w-7xl mx-auto">
            <SectionIndicator number="04" title="Strategic Archive" />

            {savedAssets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {savedAssets.map((saved) => (
                  <Card key={saved.id} className="bg-card/30 border-border/50 glass group hover-lift p-0 overflow-hidden">
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">{saved.title}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">
                            {new Date(saved.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground/60 hover:text-destructive transition-colors"
                          onClick={() => deleteFromLibrary(saved.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Display the first asset from the collection */}
                      {saved.data?.assets?.[0]?.url && (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
                          <OptimizedImage
                            src={saved.data.assets[0].url}
                            fallbackSrc={saved.data.assets[0].fallbackUrl}
                            alt={`Generated ${saved.data.assets[0].type}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="h-1 w-full bg-accent/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-primary/40 group-hover:w-full transition-all duration-700" />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 h-12 bg-accent/5 border border-border text-xs font-bold uppercase tracking-widest text-foreground hover:bg-accent/10 transition-all rounded-xl"
                          onClick={() => {
                            setPrompt(saved.data.prompt);
                            setView('studio');
                            toast.success("Design DNA reloaded!");
                          }}
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          Reload
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-accent/10"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-40">
                <FolderOpen className="w-16 h-16 text-muted-foreground" />
                <p className="text-sm uppercase tracking-[0.3em] font-bold text-muted-foreground">Archive Currently Empty</p>
              </div>
            )}
          </section>
        )}
      </main>

      <FloatingToolbar
        selectedCount={selectedForComparison.length}
        onDownloadAll={downloadAll}
      />

      <ScrollToTop />

      {lightboxOpen && selectedAsset && (
        <AssetLightbox
          assets={generatedAssets.map((asset, idx) => ({
            id: asset.url + idx,
            title: asset.type,
            asset_type: 'ai-brand-asset',
            created_at: new Date().toISOString(),
            data: { url: asset.url }
          }))}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(index) => {
            setLightboxIndex(index);
            setSelectedAsset(generatedAssets[index]);
          }}
        />
      )}
    </div>
  );
}
