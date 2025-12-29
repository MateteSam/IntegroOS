import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  background?: string | boolean;
  backgroundOpacity?: string;
  backgroundSize?: 'sm' | 'md' | 'lg' | 'xl';
  backgroundShape?: 'circle' | 'square' | 'rounded';
  gradient?: string;
  strokeWidth?: number;
  animated?: boolean;
}

/**
 * Icon component for consistent icon usage throughout the application
 */
export const Icon: React.FC<IconProps> = ({
  icon: LucideIcon,
  size = 'md',
  color = 'text-current',
  background,
  backgroundOpacity = '20',
  backgroundSize = 'md',
  backgroundShape = 'rounded',
  gradient,
  strokeWidth = 2,
  animated = false,
  className,
  ...props
}) => {
  // Icon sizes
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  // Background sizes
  const backgroundSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  // Background shapes
  const backgroundShapes = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };

  // Determine if we need a container
  const needsContainer = background || gradient;

  // Generate background class
  let backgroundClass = '';
  if (typeof background === 'string') {
    backgroundClass = `${background}/${backgroundOpacity}`;
  } else if (background === true) {
    backgroundClass = `bg-gray-500/${backgroundOpacity}`;
  }

  // Generate the icon element
  const iconElement = (
    <LucideIcon 
      className={cn(
        iconSizes[size],
        color,
        animated && 'transition-transform duration-300 group-hover:scale-110',
        !needsContainer && className
      )} 
      strokeWidth={strokeWidth}
    />
  );

  // If no container is needed, return just the icon
  if (!needsContainer) {
    return iconElement;
  }

  // Return icon with container
  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        backgroundSizes[backgroundSize],
        backgroundShapes[backgroundShape],
        backgroundClass,
        gradient,
        animated && 'transition-all duration-300 group-hover:shadow-lg',
        className
      )}
      {...props}
    >
      {iconElement}
    </div>
  );
};

export default Icon;