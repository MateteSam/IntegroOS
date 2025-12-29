import React from 'react';

interface SectionIndicatorProps {
  number: string;
  title: string;
  className?: string;
}

export const SectionIndicator: React.FC<SectionIndicatorProps> = ({ 
  number, 
  title,
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-6 mb-12 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-5xl font-light text-primary/40">
          {number}
        </span>
        <div className="h-[1px] w-16 bg-gradient-to-r from-primary/40 to-transparent" />
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
        {title}
      </h2>
    </div>
  );
};
