import React from 'react';
import { cn } from '@/lib/utils';
import theme, { getGradient } from '@/lib/theme';
import type { ThemeGradients } from '@/lib/theme';

export interface GradientWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: keyof ThemeGradients | string;
  direction?: 'r' | 'l' | 't' | 'b' | 'tr' | 'tl' | 'br' | 'bl';
  intensity?: 'default' | 'subtle' | 'strong';
  hover?: boolean;
  active?: boolean;
  rounded?: boolean | string;
  border?: boolean;
  borderOpacity?: string;
  glow?: boolean;
  glowIntensity?: 'default' | 'subtle' | 'strong';
  as?: React.ElementType;
}

/**
 * GradientWrapper component for applying consistent gradients to elements
 */
export const GradientWrapper = React.forwardRef<HTMLDivElement, GradientWrapperProps>(
  ({ 
    gradient = 'primary',
    direction = 'r',
    intensity = 'default',
    hover = false,
    active = false,
    rounded = false,
    border = false,
    borderOpacity = '20',
    glow = false,
    glowIntensity = 'default',
    as: Component = 'div',
    className,
    children,
    ...props 
  }, ref) => {
    // Handle predefined gradients from theme
    let gradientClasses = '';
    const gradientKeys = Object.keys(theme.gradients);
    if (typeof gradient === 'string' && gradientKeys.includes(gradient)) {
      gradientClasses = getGradient(gradient as keyof ThemeGradients);
    } else if (typeof gradient === 'string') {
      // Custom gradient string
      gradientClasses = gradient;
    }
    
    // Direction
    const directionClass = `bg-gradient-to-${direction}`;
    
    // Intensity
    let opacityClass = '';
    if (intensity === 'subtle') {
      opacityClass = 'opacity-75';
    } else if (intensity === 'strong') {
      opacityClass = 'opacity-100';
    }
    
    // Rounded
    let roundedClass = '';
    if (rounded === true) {
      roundedClass = 'rounded-lg';
    } else if (typeof rounded === 'string') {
      roundedClass = rounded;
    }
    
    // Border
    const borderClass = border ? `border border-white/${borderOpacity}` : '';
    
    // Glow
    let glowClass = '';
    if (glow) {
      if (glowIntensity === 'subtle') {
        glowClass = 'shadow-sm';
      } else if (glowIntensity === 'strong') {
        glowClass = 'shadow-lg';
      } else {
        glowClass = 'shadow-md';
      }
    }
    
    // Hover and active states
    const hoverClass = hover ? 'transition-all duration-300 hover:opacity-90 hover:shadow-md' : '';
    const activeClass = active ? 'active:opacity-100 active:scale-95' : '';
    
    return (
      <Component
        ref={ref}
        className={cn(
          directionClass,
          gradientClasses,
          opacityClass,
          roundedClass,
          borderClass,
          glowClass,
          hoverClass,
          activeClass,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

GradientWrapper.displayName = 'GradientWrapper';

export default GradientWrapper;