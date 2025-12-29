import React from 'react';
import { Loader2 } from 'lucide-react';

interface PremiumLoadingStateProps {
  progress?: number;
  message?: string;
  stage?: string;
}

export const PremiumLoadingState: React.FC<PremiumLoadingStateProps> = ({
  progress = 0,
  message = 'Generating your brand assets...',
  stage
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Animated Geometric Loader */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        
        {/* Animated Progress Ring */}
        <svg className="absolute inset-0 w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-primary"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        
        {/* Floating Particles */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary rounded-full animate-pulse" />
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 -right-4 w-2 h-2 bg-electric rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Progress Percentage */}
      {progress > 0 && (
        <div className="text-4xl font-bold text-primary mb-4 animate-fade-in">
          {Math.round(progress)}%
        </div>
      )}
      
      {/* Stage Indicator */}
      {stage && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary uppercase tracking-wide">
            {stage}
          </span>
        </div>
      )}
      
      {/* Message */}
      <p className="text-lg text-center text-muted-foreground max-w-md animate-fade-in">
        {message}
      </p>
      
      {/* Progress Bar */}
      <div className="w-full max-w-md mt-8">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-accent to-electric transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
