import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader, Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const GENERATION_TYPES = [
  { id: "subject", label: "Subject Lines", icon: "✉️", description: "Generate catchy email subject lines" },
  { id: "email", label: "Full Email", icon: "📧", description: "Generate complete email content" },
  { id: "cta", label: "Call-to-Action", icon: "🎯", description: "Generate compelling CTA buttons" },
  { id: "improve", label: "Improve Text", icon: "✨", description: "Enhance existing copy" },
];

const TONES = [
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "casual", label: "Casual & Friendly", emoji: "😊" },
  { id: "urgent", label: "Urgent", emoji: "⚡" },
  { id: "persuasive", label: "Persuasive", emoji: "🎯" },
  { id: "warm", label: "Warm & Personal", emoji: "💝" },
];

export function AIGenerateDialog({ open, onOpenChange, onSuccess }: AIGenerateDialogProps) {
  const [selectedType, setSelectedType] = useState("subject");
  const [tone, setTone] = useState("professional");
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what you want to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent([]);

    // Simulate AI generation (in production, this would call Lovable AI)
    await new Promise(resolve => setTimeout(resolve, 1500));

    let results: string[] = [];
    
    if (selectedType === "subject") {
      results = [
        `🚀 ${prompt} - Don't Miss Out!`,
        `Exclusive: ${prompt} Inside`,
        `[Action Required] ${prompt}`,
        `You're Invited: ${prompt}`,
        `${prompt} - Limited Time Offer`,
      ];
    } else if (selectedType === "email") {
      results = [
        `Hi {first_name},\n\nI wanted to reach out personally about ${prompt}.\n\nHere's what makes this special:\n• Benefit 1\n• Benefit 2\n• Benefit 3\n\nReady to get started?\n\nBest regards,\n{company}`,
      ];
    } else if (selectedType === "cta") {
      results = [
        "Get Started Now →",
        "Claim Your Spot",
        "Yes, I Want This!",
        "Start Free Trial",
        "Learn More",
      ];
    } else {
      results = [
        `Enhanced: ${prompt}\n\nThis version is more engaging and action-oriented while maintaining your core message.`,
      ];
    }

    setGeneratedContent(results);
    setIsGenerating(false);
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedContent([]);
    setSelectedType("subject");
    setTone("professional");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleReset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            AI Content Studio
          </DialogTitle>
          <DialogDescription>
            Generate professional email content with AI assistance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Generation Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            {GENERATION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedType === type.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span>{t.emoji}</span>
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>What do you want to generate?</Label>
            <Textarea
              placeholder={
                selectedType === "subject"
                  ? "e.g., Product launch for our new AI tool"
                  : selectedType === "email"
                  ? "e.g., Welcome email for new subscribers"
                  : selectedType === "cta"
                  ? "e.g., Get users to sign up for a free trial"
                  : "Paste your text here to improve it..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-muted/50"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isGenerating ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>

          {/* Generated Content */}
          {generatedContent.length > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Generated Content
              </Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {generatedContent.map((content, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-lg border border-border group hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm whitespace-pre-wrap flex-1">{content}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleCopy(content, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
