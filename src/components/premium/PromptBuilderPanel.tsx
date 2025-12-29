import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2 } from 'lucide-react';

interface PromptBuilderPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onEnhancePrompt?: () => void;
  placeholder?: string;
}

export const PromptBuilderPanel: React.FC<PromptBuilderPanelProps> = ({
  prompt,
  onPromptChange,
  onEnhancePrompt,
  placeholder = 'Describe your brand vision...'
}) => {
  return (
    <div className="relative glass-strong rounded-2xl p-6 border-2 hover:border-primary/30 transition-colors">
      {/* Floating label */}
      <div className="absolute -top-3 left-6 px-3 bg-background">
        <span className="text-sm font-semibold text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Brand Prompt
        </span>
      </div>
      
      <Textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] text-lg border-0 focus-visible:ring-0 resize-none bg-transparent"
      />
      
      {/* Character count and enhance button */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <span className="text-sm text-muted-foreground">
          {prompt.length} characters
        </span>
        
        {onEnhancePrompt && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEnhancePrompt}
            className="gap-2 hover:bg-primary/10 hover:text-primary"
          >
            <Wand2 className="w-4 h-4" />
            Enhance with AI
          </Button>
        )}
      </div>
    </div>
  );
};
