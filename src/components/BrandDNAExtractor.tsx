import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Dna, Palette, Type, Sparkles, Heart } from 'lucide-react';
import { extractBrandDNA } from '@/lib/ai';
import { toast } from 'sonner';

interface BrandDNA {
  colorPalette: {
    primary: string;
    secondary: string;
    accent1: string;
    accent2: string;
  };
  typography: {
    style: string;
    weight: string;
    category: string;
  };
  visualStyle: {
    aesthetic: string;
    keywords: string[];
  };
  designElements: string[];
  brandPersonality: {
    tone: string;
    traits: string[];
  };
}

interface BrandDNAExtractorProps {
  assetUrl: string;
  assetType: string;
  onExtracted: (dna: BrandDNA) => void;
}

export const BrandDNAExtractor = ({ assetUrl, assetType, onExtracted }: BrandDNAExtractorProps) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedDNA, setExtractedDNA] = useState<BrandDNA | null>(null);

  const extractDNA = async () => {
    setIsExtracting(true);
    try {
      const dna = await extractBrandDNA(assetUrl, assetType);
      setExtractedDNA(dna);
      onExtracted(dna);
      toast.success('Brand DNA extracted successfully!');
    } catch (error) {
      console.error('Error extracting brand DNA:', error);
      toast.error('Failed to extract brand DNA');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Brand DNA Extractor</h3>
        </div>
        <Button
          onClick={extractDNA}
          disabled={isExtracting}
          className="gradient-primary hover-lift"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Extract Brand DNA'
          )}
        </Button>
      </div>

      {extractedDNA && (
        <div className="space-y-4 mt-6">
          {/* Color Palette */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Color Palette</h4>
            </div>
            <div className="flex gap-2">
              {Object.entries(extractedDNA.colorPalette).map(([key, color]) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <div
                    className="w-12 h-12 rounded-lg shadow-md hover-lift"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted-foreground">{key}</span>
                  <code className="text-xs">{color}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Typography</h4>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{extractedDNA.typography.category}</Badge>
              <Badge variant="secondary">{extractedDNA.typography.weight}</Badge>
              <Badge variant="secondary">{extractedDNA.typography.style}</Badge>
            </div>
          </div>

          {/* Visual Style */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Visual Style</h4>
            </div>
            <p className="text-sm text-muted-foreground">{extractedDNA.visualStyle.aesthetic}</p>
            <div className="flex gap-2 flex-wrap">
              {extractedDNA.visualStyle.keywords.map((keyword, idx) => (
                <Badge key={idx} variant="outline">{keyword}</Badge>
              ))}
            </div>
          </div>

          {/* Design Elements */}
          <div className="space-y-2">
            <h4 className="font-semibold">Design Elements</h4>
            <div className="flex gap-2 flex-wrap">
              {extractedDNA.designElements.map((element, idx) => (
                <Badge key={idx} variant="secondary">{element}</Badge>
              ))}
            </div>
          </div>

          {/* Brand Personality */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Brand Personality</h4>
            </div>
            <p className="text-sm text-muted-foreground">{extractedDNA.brandPersonality.tone}</p>
            <div className="flex gap-2 flex-wrap">
              {extractedDNA.brandPersonality.traits.map((trait, idx) => (
                <Badge key={idx} variant="outline">{trait}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};