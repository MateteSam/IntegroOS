import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionFieldProps {
  value: string;
  onChange: (value: string) => void;
  onGetSuggestion?: () => Promise<string>;
  placeholder?: string;
  type?: 'input' | 'textarea';
  label?: string;
  disabled?: boolean;
  className?: string;
  suggestionsEnabled?: boolean;
}

export const SuggestionField: React.FC<SuggestionFieldProps> = ({
  value,
  onChange,
  onGetSuggestion,
  placeholder,
  type = 'input',
  label,
  disabled = false,
  className,
  suggestionsEnabled = true
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGetSuggestion = async () => {
    if (!onGetSuggestion || !suggestionsEnabled) return;
    
    setIsGenerating(true);
    try {
      const suggestion = await onGetSuggestion();
      if (suggestion) {
        onChange(suggestion);
      }
    } catch (error) {
      console.error('Failed to get suggestion:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isGenerating}
          className={cn(
            suggestionsEnabled && onGetSuggestion && 'pr-12',
            isGenerating && 'opacity-50'
          )}
        />
        {suggestionsEnabled && onGetSuggestion && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGetSuggestion}
            disabled={isGenerating || disabled}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Sparkles className="h-4 w-4 text-primary" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
