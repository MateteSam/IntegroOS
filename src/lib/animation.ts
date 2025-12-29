// Animation utilities for consistent motion design

/**
 * Animation timing values in milliseconds
 */
export const timing = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800
};

/**
 * CSS easing functions for animations
 */
export const easing = {
  // Standard easing functions
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom cubic-bezier easing functions
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  standardDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  standardAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)'
};

/**
 * Animation keyframes for common animations
 */
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  slideInUp: `
    @keyframes slideInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  slideInDown: `
    @keyframes slideInDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  slideInLeft: `
    @keyframes slideInLeft {
      from {
        transform: translateX(-20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  slideInRight: `
    @keyframes slideInRight {
      from {
        transform: translateX(20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  zoomIn: `
    @keyframes zoomIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
  zoomOut: `
    @keyframes zoomOut {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(0.95);
        opacity: 0;
      }
    }
  `,
  pulse: `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `,
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `
};

/**
 * Generate CSS for an animation
 * 
 * @param name The name of the animation from keyframes
 * @param duration Animation duration in ms
 * @param easingFunction Easing function to use
 * @param delay Delay before animation starts in ms
 * @param iterationCount Number of times to run the animation
 * @param fillMode Animation fill mode
 * @param direction Animation direction
 * @returns CSS animation string
 */
export const getAnimation = (
  name: keyof typeof keyframes,
  duration: number = timing.normal,
  easingFunction: string = easing.standard,
  delay: number = 0,
  iterationCount: number | 'infinite' = 1,
  fillMode: 'none' | 'forwards' | 'backwards' | 'both' = 'both',
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse' = 'normal'
): string => {
  return `${name} ${duration}ms ${easingFunction} ${delay}ms ${iterationCount} ${fillMode} ${direction}`;
};

/**
 * Generate a staggered animation delay for list items
 * 
 * @param index The index of the item in the list
 * @param baseDelay Base delay before starting the stagger
 * @param staggerDelay Delay between each item
 * @returns Delay in milliseconds
 */
export const getStaggerDelay = (
  index: number,
  baseDelay: number = 0,
  staggerDelay: number = 50
): number => {
  return baseDelay + (index * staggerDelay);
};

/**
 * Common animation presets
 */
export const presets = {
  fadeIn: {
    animation: getAnimation('fadeIn', timing.normal, easing.standardDecelerate),
    className: 'animate-fadeIn'
  },
  fadeOut: {
    animation: getAnimation('fadeOut', timing.normal, easing.standardAccelerate),
    className: 'animate-fadeOut'
  },
  slideInUp: {
    animation: getAnimation('slideInUp', timing.normal, easing.standardDecelerate),
    className: 'animate-slideInUp'
  },
  slideInDown: {
    animation: getAnimation('slideInDown', timing.normal, easing.standardDecelerate),
    className: 'animate-slideInDown'
  },
  slideInLeft: {
    animation: getAnimation('slideInLeft', timing.normal, easing.standardDecelerate),
    className: 'animate-slideInLeft'
  },
  slideInRight: {
    animation: getAnimation('slideInRight', timing.normal, easing.standardDecelerate),
    className: 'animate-slideInRight'
  },
  zoomIn: {
    animation: getAnimation('zoomIn', timing.normal, easing.standardDecelerate),
    className: 'animate-zoomIn'
  },
  zoomOut: {
    animation: getAnimation('zoomOut', timing.normal, easing.standardAccelerate),
    className: 'animate-zoomOut'
  },
  pulse: {
    animation: getAnimation('pulse', timing.slow, easing.emphasizedDecelerate, 0, 'infinite'),
    className: 'animate-pulse'
  },
  spin: {
    animation: getAnimation('spin', timing.slow, easing.linear, 0, 'infinite'),
    className: 'animate-spin'
  },
  shimmer: {
    animation: getAnimation('shimmer', 2000, easing.linear, 0, 'infinite'),
    className: 'animate-shimmer'
  }
};

export default {
  timing,
  easing,
  keyframes,
  getAnimation,
  getStaggerDelay,
  presets
};