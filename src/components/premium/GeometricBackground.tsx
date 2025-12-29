import React from 'react';

interface GeometricBackgroundProps {
  variant?: 'hero' | 'section' | 'minimal';
  className?: string;
}

export const GeometricBackground: React.FC<GeometricBackgroundProps> = ({
  variant = 'hero',
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none bg-background ${className}`} />
  );
};
