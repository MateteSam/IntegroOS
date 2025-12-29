import { useState, useEffect, useMemo } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// Default breakpoints matching Tailwind CSS defaults
const defaultBreakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

/**
 * Custom hook for responsive design logic
 * 
 * @param customBreakpoints Optional custom breakpoints configuration
 * @returns Object with responsive utility functions and current breakpoint
 */
export const useResponsive = (customBreakpoints?: Partial<BreakpointConfig>) => {
  const breakpoints = useMemo(() => ({
    ...defaultBreakpoints,
    ...customBreakpoints
  }), [customBreakpoints]);

  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    // Initial call to set the width
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Determine current breakpoint
  const currentBreakpoint = useMemo<Breakpoint>(() => {
    if (windowWidth >= breakpoints['2xl']) return '2xl';
    if (windowWidth >= breakpoints.xl) return 'xl';
    if (windowWidth >= breakpoints.lg) return 'lg';
    if (windowWidth >= breakpoints.md) return 'md';
    if (windowWidth >= breakpoints.sm) return 'sm';
    return 'xs';
  }, [windowWidth, breakpoints]);

  // Check if current width is greater than or equal to a specific breakpoint
  const isAbove = (breakpoint: Breakpoint): boolean => {
    return windowWidth >= breakpoints[breakpoint];
  };

  // Check if current width is less than a specific breakpoint
  const isBelow = (breakpoint: Breakpoint): boolean => {
    return windowWidth < breakpoints[breakpoint];
  };

  // Check if current width is between two breakpoints
  const isBetween = (minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint): boolean => {
    return windowWidth >= breakpoints[minBreakpoint] && windowWidth < breakpoints[maxBreakpoint];
  };

  // Get value based on current breakpoint
  const value = <T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
    // Try to find the value for the current breakpoint
    if (values[currentBreakpoint] !== undefined) {
      return values[currentBreakpoint] as T;
    }

    // If not found, look for the closest smaller breakpoint
    const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    
    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const breakpoint = breakpointOrder[i];
      if (values[breakpoint] !== undefined) {
        return values[breakpoint] as T;
      }
    }

    // If no smaller breakpoint found, look for the closest larger breakpoint
    for (let i = currentIndex - 1; i >= 0; i--) {
      const breakpoint = breakpointOrder[i];
      if (values[breakpoint] !== undefined) {
        return values[breakpoint] as T;
      }
    }

    // If no matching breakpoint found, return the default value
    return defaultValue;
  };

  return {
    windowWidth,
    currentBreakpoint,
    breakpoints,
    isAbove,
    isBelow,
    isBetween,
    value,
    // Shorthand helpers
    isMobile: isBelow('md'),
    isTablet: isBetween('md', 'lg'),
    isDesktop: isAbove('lg')
  };
};

export default useResponsive;