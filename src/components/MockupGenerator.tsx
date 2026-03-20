import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Card } from '@/components/ui/card';
import { Loader2, Box, Download, Image as ImageIcon, Sparkles, Wand2, Smartphone, Monitor, Tablet, CreditCard, Frame, Shirt } from "lucide-react";
import { generateMockup as aiGenerateMockup } from "@/lib/ai";
import { toast } from "sonner";

interface MockupGeneratorProps {
  assetUrl: string;
  assetType: string;
  activeProject?: { brandData?: any };
  onGenerated: (mockupUrl: string) => void;
}

export const MockupGenerator = ({ assetUrl, assetType, activeProject, onGenerated }: MockupGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generatedMockup, setGeneratedMockup] = useState<string | null>(null);

  const mockupTypes = [
    { id: 'iphone', name: 'iPhone', icon: Smartphone },
    { id: 'macbook', name: 'MacBook', icon: Monitor },
    { id: 'ipad', name: 'iPad', icon: Tablet },
    { id: 'business-card', name: 'Business Card', icon: CreditCard },
    { id: 'poster', name: 'Poster', icon: Frame },
    { id: 'tshirt', name: 'T-Shirt', icon: Shirt },
  ];

  const generateMockup = async (type: string) => {
    setIsGenerating(true);
    setSelectedType(type);
    try {
      const data = await aiGenerateMockup({
        assetUrl,
        assetType,
        brandContext: activeProject?.brandData
      });

      setGeneratedMockup(data.imageUrl);
      onGenerated?.(data.imageUrl);
      toast.success("Mockup generated successfully!");
    } catch (error) {
      console.error('Error generating mockup:', error);
      toast.error('Failed to generate mockup');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Generate Mockups</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {mockupTypes.map((mockup) => {
          const Icon = mockup.icon;
          return (
            <Button
              key={mockup.id}
              variant="outline"
              className="h-24 flex flex-col gap-2 hover-lift"
              onClick={() => generateMockup(mockup.id)}
              disabled={isGenerating}
            >
              {isGenerating && selectedType === mockup.id ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
              <span className="text-xs">{mockup.name}</span>
            </Button>
          );
        })}
      </div>

      {generatedMockup && (
        <div className="mt-4">
          <img
            src={generatedMockup}
            alt="Generated mockup"
            className="w-full rounded-lg shadow-lg hover-lift"
          />
        </div>
      )}
    </Card>
  );
};