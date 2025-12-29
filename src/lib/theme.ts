// Theme configuration for the Marketing Brain Command Center
// This centralizes all design tokens for consistent styling

export type ColorShade = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export type GradientDefinition = {
  from: string;
  to: string;
  via?: string;
};

export type ThemeColors = {
  primary: ColorShade;
  secondary: ColorShade;
  accent: ColorShade;
  success: ColorShade;
  warning: ColorShade;
  danger: ColorShade;
  info: ColorShade;
  gray: ColorShade;
};

export type ThemeGradients = {
  primary: GradientDefinition;
  secondary: GradientDefinition;
  accent: GradientDefinition;
  success: GradientDefinition;
  warning: GradientDefinition;
  danger: GradientDefinition;
  info: GradientDefinition;
  premium: GradientDefinition;
  neon: GradientDefinition;
};

export type ThemeShadows = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  inner: string;
  glow: string;
};

export type ThemeRadii = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
};

export type ThemeSpacing = {
  px: string;
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
};

export type ThemeAnimations = {
  fast: string;
  normal: string;
  slow: string;
  easings: {
    default: string;
    linear: string;
    in: string;
    out: string;
    inOut: string;
  };
};

export type Theme = {
  colors: ThemeColors;
  gradients: ThemeGradients;
  shadows: ThemeShadows;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  animations: ThemeAnimations;
};

// Default theme configuration
export const theme: Theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    accent: {
      50: '#f5f5f5',
      100: '#f0abfc',
      200: '#e879f9',
      300: '#d946ef',
      400: '#c026d3',
      500: '#a21caf',
      600: '#86198f',
      700: '#701a75',
      800: '#4a044e',
      900: '#3b0764',
    },
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  gradients: {
    primary: {
      from: 'from-blue-500',
      to: 'to-purple-600',
    },
    secondary: {
      from: 'from-purple-500',
      to: 'to-pink-500',
    },
    accent: {
      from: 'from-pink-500',
      to: 'to-rose-500',
    },
    success: {
      from: 'from-green-500',
      to: 'to-emerald-600',
    },
    warning: {
      from: 'from-yellow-400',
      to: 'to-orange-500',
    },
    danger: {
      from: 'from-red-500',
      to: 'to-pink-600',
    },
    info: {
      from: 'from-cyan-500',
      to: 'to-blue-500',
    },
    premium: {
      from: 'from-yellow-500',
      via: 'via-orange-500',
      to: 'to-red-500',
    },
    neon: {
      from: 'from-cyan-400',
      to: 'to-blue-500',
    },
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    '3xl': 'shadow-3xl',
    inner: 'shadow-inner',
    glow: 'shadow-[0_0_15px_rgba(255,255,255,0.3)]',
  },
  radii: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  },
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    easings: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// Helper functions to use the theme
export const getGradient = (name: keyof ThemeGradients): string => {
  const gradient = theme.gradients[name];
  return `bg-gradient-to-r ${gradient.from} ${gradient.via ? gradient.via : ''} ${gradient.to}`;
};

export const getHoverGradient = (name: keyof ThemeGradients): string => {
  const gradient = theme.gradients[name];
  // Create a darker version for hover by replacing the number in the color
  const fromHover = gradient.from.replace(/\d+/, (match) => {
    const num = parseInt(match);
    return (num + 100).toString();
  });
  
  const toHover = gradient.to.replace(/\d+/, (match) => {
    const num = parseInt(match);
    return (num + 100).toString();
  });
  
  const viaHover = gradient.via ? gradient.via.replace(/\d+/, (match) => {
    const num = parseInt(match);
    return (num + 100).toString();
  }) : '';
  
  return `hover:bg-gradient-to-r ${fromHover} ${viaHover ? viaHover : ''} ${toHover}`;
};

export const getShadow = (name: keyof ThemeShadows): string => {
  return theme.shadows[name];
};

export const getRadius = (name: keyof ThemeRadii): string => {
  return theme.radii[name];
};

export const getTransition = (speed: keyof ThemeAnimations = 'normal'): string => {
  return `transition-all duration-${theme.animations[speed]} ease-${theme.animations.easings.default}`;
};

export default theme;