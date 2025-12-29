import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  hint?: string;
  showCharCount?: boolean;
  maxLength?: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isValid?: boolean;
  containerClassName?: string;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ 
    label, 
    error, 
    hint, 
    showCharCount, 
    maxLength, 
    value, 
    onChange, 
    onBlur,
    isValid,
    required,
    containerClassName,
    className,
    ...props 
  }, ref) => {
    const [touched, setTouched] = useState(false);
    const showError = touched && error;
    const showSuccess = touched && isValid && !error && value.length > 0;

    const handleBlur = () => {
      setTouched(true);
      onBlur?.();
    };

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={props.id} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
          </Label>
          {showCharCount && maxLength && (
            <span 
              className={cn(
                "text-xs",
                value.length > maxLength * 0.9 ? "text-destructive" : "text-muted-foreground"
              )}
              aria-live="polite"
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
        
        <div className="relative">
          <Input
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            maxLength={maxLength}
            required={required}
            className={cn(
              "bg-background/50 transition-all",
              showError && "border-destructive focus-visible:ring-destructive",
              showSuccess && "border-green-500 focus-visible:ring-green-500",
              showSuccess && "pr-10",
              className
            )}
            aria-invalid={showError ? "true" : "false"}
            aria-describedby={
              showError ? `${props.id}-error` : 
              hint ? `${props.id}-hint` : undefined
            }
            {...props}
          />
          {showSuccess && (
            <CheckCircle2 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" 
              aria-label="Valid input"
            />
          )}
        </div>

        {showError && (
          <div 
            id={`${props.id}-error`}
            className="flex items-center gap-1 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
        
        {hint && !showError && (
          <p id={`${props.id}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  error?: string;
  hint?: string;
  showCharCount?: boolean;
  maxLength?: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isValid?: boolean;
  containerClassName?: string;
}

export const ValidatedTextarea = React.forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({ 
    label, 
    error, 
    hint, 
    showCharCount, 
    maxLength, 
    value, 
    onChange, 
    onBlur,
    isValid,
    required,
    containerClassName,
    className,
    ...props 
  }, ref) => {
    const [touched, setTouched] = useState(false);
    const showError = touched && error;
    const showSuccess = touched && isValid && !error && value.length > 0;

    const handleBlur = () => {
      setTouched(true);
      onBlur?.();
    };

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={props.id} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
          </Label>
          {showCharCount && maxLength && (
            <span 
              className={cn(
                "text-xs",
                value.length > maxLength * 0.9 ? "text-destructive" : "text-muted-foreground"
              )}
              aria-live="polite"
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
        
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          maxLength={maxLength}
          required={required}
          className={cn(
            "bg-background/50 transition-all min-h-[100px]",
            showError && "border-destructive focus-visible:ring-destructive",
            showSuccess && "border-green-500 focus-visible:ring-green-500",
            className
          )}
          aria-invalid={showError ? "true" : "false"}
          aria-describedby={
            showError ? `${props.id}-error` : 
            hint ? `${props.id}-hint` : undefined
          }
          {...props}
        />

        {showError && (
          <div 
            id={`${props.id}-error`}
            className="flex items-center gap-1 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
        
        {hint && !showError && (
          <p id={`${props.id}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

ValidatedTextarea.displayName = 'ValidatedTextarea';
