import React from 'react';
import { GeometricBackground } from './GeometricBackground';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <GeometricBackground variant="hero" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        {/* Floating AI Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Powered by Advanced AI</span>
        </div>
        
        {/* Hero Title with Mixed Typography */}
        <h1 className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-6xl md:text-8xl font-light text-foreground mb-2 font-['Inter']">
            Generate Your
          </div>
          <div className="text-7xl md:text-9xl font-black text-foreground tracking-tight font-['Archivo']">
            Brand Universe
          </div>
          <div className="inline-flex items-center gap-4 mt-4">
            <span className="text-8xl md:text-9xl font-black text-gradient font-['Archivo']">AI</span>
          </div>
        </h1>
        
        {/* Subtitle */}
        <p 
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up font-light"
          style={{ animationDelay: '0.2s' }}
        >
          Create stunning brand assets, from logos to social media content,
          <br className="hidden md:block" />
          in seconds with AI-powered precision
        </p>
        
        {/* CTA Buttons */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <Button 
            size="lg"
            onClick={onGetStarted}
            className="group px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Start Creating
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg font-semibold border-2 hover:bg-accent/10"
          >
            Explore Features
          </Button>
        </div>
        
        {/* Stats Bar */}
        <div 
          className="mt-20 flex flex-wrap items-center justify-center gap-12 text-sm animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">10K+</div>
            <div className="text-muted-foreground">Assets Generated</div>
          </div>
          <div className="h-12 w-[1px] bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">50+</div>
            <div className="text-muted-foreground">Asset Types</div>
          </div>
          <div className="h-12 w-[1px] bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">2.5s</div>
            <div className="text-muted-foreground">Avg. Generation</div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
