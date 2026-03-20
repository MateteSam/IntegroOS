/**
 * ✨ Text Effects Engine — WCCCS Publishing Engine
 *
 * Professional text effects for both screen rendering and print output:
 * - Gold foil, metallic, emboss/deboss
 * - Gradient text, outlined text, glow, 3D text
 * - Each effect generates CSS for screen and print specs for production
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 EFFECT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type TextEffectType =
  | 'none'
  | 'gold-foil'
  | 'silver-foil'
  | 'copper-foil'
  | 'emboss'
  | 'deboss'
  | 'metallic'
  | 'gradient'
  | 'outlined'
  | 'glow'
  | 'shadow-3d'
  | 'neon'
  | 'vintage'
  | 'letterpress';

export interface TextEffect {
  type: TextEffectType;
  name: string;
  description: string;
  css: React.CSSProperties;
  additionalCss?: string;         // Extra CSS rules (pseudo-elements, etc.)
  printSpec?: PrintSpec;           // Instructions for print production
}

export interface PrintSpec {
  technique: string;              // e.g. "hot foil stamping", "blind emboss"
  spotColorName?: string;         // Pantone or spot colour
  notes: string;                  // Production notes
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 EFFECT LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

export const TEXT_EFFECTS: Record<TextEffectType, TextEffect> = {
  'none': {
    type: 'none',
    name: 'None',
    description: 'No effect applied',
    css: {},
  },

  'gold-foil': {
    type: 'gold-foil',
    name: 'Gold Foil',
    description: 'Luxurious gold metallic finish',
    css: {
      background: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      filter: 'brightness(1.1) contrast(1.1)',
    } as React.CSSProperties,
    printSpec: {
      technique: 'Hot foil stamping',
      spotColorName: 'Gold Metallic (Pantone 872 C)',
      notes: 'Requires foil die. Recommend matte laminate on cover with foil overlay for best effect.',
    },
  },

  'silver-foil': {
    type: 'silver-foil',
    name: 'Silver Foil',
    description: 'Elegant silver metallic finish',
    css: {
      background: 'linear-gradient(135deg, #c0c0c0 0%, #f5f5f5 25%, #a8a8a8 50%, #f0f0f0 75%, #8c8c8c 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    } as React.CSSProperties,
    printSpec: {
      technique: 'Hot foil stamping',
      spotColorName: 'Silver Metallic (Pantone 877 C)',
      notes: 'Works best on dark cover backgrounds.',
    },
  },

  'copper-foil': {
    type: 'copper-foil',
    name: 'Copper Foil',
    description: 'Warm copper/rose gold finish',
    css: {
      background: 'linear-gradient(135deg, #b87333 0%, #e8c29a 25%, #9c5e28 50%, #ddb68c 75%, #8b4513 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    } as React.CSSProperties,
    printSpec: {
      technique: 'Hot foil stamping',
      spotColorName: 'Copper Metallic (Pantone 876 C)',
      notes: 'Pairs beautifully with cream and navy backgrounds.',
    },
  },

  'emboss': {
    type: 'emboss',
    name: 'Emboss',
    description: 'Raised 3D impression',
    css: {
      color: 'rgba(255,255,255,0.15)',
      textShadow: '1px 1px 1px rgba(255,255,255,0.6), -1px -1px 1px rgba(0,0,0,0.3)',
    },
    printSpec: {
      technique: 'Multi-level emboss',
      notes: 'Requires emboss die. Works on covers and heavy card stock only. Single-level or multi-level available.',
    },
  },

  'deboss': {
    type: 'deboss',
    name: 'Deboss',
    description: 'Pressed-in impression',
    css: {
      color: 'rgba(0,0,0,0.1)',
      textShadow: '-1px -1px 1px rgba(255,255,255,0.4), 1px 1px 2px rgba(0,0,0,0.5)',
    },
    printSpec: {
      technique: 'Blind deboss',
      notes: 'Requires deboss die. No ink — texture only. Subtle and premium.',
    },
  },

  'metallic': {
    type: 'metallic',
    name: 'Metallic Sheen',
    description: 'Animated metallic shimmer',
    css: {
      background: 'linear-gradient(90deg, #d4af37 0%, #f9f295 20%, #d4af37 40%, #f9f295 60%, #d4af37 80%, #f9f295 100%)',
      backgroundSize: '200% 100%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'metallic-shimmer 3s ease-in-out infinite',
    } as React.CSSProperties,
    additionalCss: `
      @keyframes metallic-shimmer {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }
    `,
    printSpec: {
      technique: 'Metallic ink printing',
      spotColorName: 'Gold Metallic Ink',
      notes: 'Use metallic ink base with standard CMYK overprint. Not as vivid as foil but more cost-effective.',
    },
  },

  'gradient': {
    type: 'gradient',
    name: 'Gradient',
    description: 'Smooth colour transition',
    css: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    } as React.CSSProperties,
    printSpec: {
      technique: 'CMYK gradient printing',
      notes: 'Standard CMYK process. Ensure gradient angle and stops match screen preview.',
    },
  },

  'outlined': {
    type: 'outlined',
    name: 'Outlined',
    description: 'Hollow text with visible stroke',
    css: {
      color: 'transparent',
      WebkitTextStroke: '2px #1a1a1a',
    } as React.CSSProperties,
    printSpec: {
      technique: 'Outline/stroke printing',
      notes: 'Create outline path from text. Fill with background colour, stroke with desired colour.',
    },
  },

  'glow': {
    type: 'glow',
    name: 'Glow',
    description: 'Soft luminous halo around text',
    css: {
      color: '#ffffff',
      textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(100,200,255,0.6), 0 0 30px rgba(100,200,255,0.4), 0 0 40px rgba(100,200,255,0.2)',
    },
    printSpec: {
      technique: 'Spot UV varnish',
      notes: 'Apply gloss spot UV over text area on matte laminate background for glow-like effect.',
    },
  },

  'shadow-3d': {
    type: 'shadow-3d',
    name: '3D Shadow',
    description: 'Dimensional text with layered shadows',
    css: {
      color: '#1a1a1a',
      textShadow: '1px 1px 0 #444, 2px 2px 0 #555, 3px 3px 0 #666, 4px 4px 0 #777, 5px 5px 5px rgba(0,0,0,0.3)',
    },
    printSpec: {
      technique: 'Multi-layer printing or emboss',
      notes: 'Can simulate with graduated shadows in PDF, or use multi-level emboss for physical 3D.',
    },
  },

  'neon': {
    type: 'neon',
    name: 'Neon',
    description: 'Electric neon sign effect',
    css: {
      color: '#fff',
      textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de, 0 0 40px #ff00de, 0 0 55px #ff00de, 0 0 75px #ff00de',
    },
    printSpec: {
      technique: 'Fluorescent ink + spot UV',
      spotColorName: 'Neon Pink (Pantone 806 C)',
      notes: 'Requires fluorescent spot colour. Spot UV overlay to simulate glow. Best on dark backgrounds.',
    },
  },

  'vintage': {
    type: 'vintage',
    name: 'Vintage',
    description: 'Weathered, antique book feel',
    css: {
      color: '#5c4a2e',
      textShadow: '1px 1px 0 rgba(0,0,0,0.1)',
      filter: 'sepia(0.3) contrast(0.95)',
    },
    printSpec: {
      technique: 'Distressed printing',
      notes: 'Use aged/distressed font variant. Print with sepia-toned ink for authentic antique look.',
    },
  },

  'letterpress': {
    type: 'letterpress',
    name: 'Letterpress',
    description: 'Classic pressed-in mechanical type feel',
    css: {
      color: '#333',
      textShadow: '0 1px 0 rgba(255,255,255,0.5)',
      letterSpacing: '0.05em',
    },
    printSpec: {
      technique: 'Letterpress printing',
      notes: 'True letterpress requires letterpress machine + polymer plates. Creates ink impression with slight deboss.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 EFFECT APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get the CSS styles to apply a text effect.
 */
export function getEffectCss(effectType: TextEffectType): React.CSSProperties {
  return TEXT_EFFECTS[effectType]?.css || {};
}

/**
 * Get all available effects as a list.
 */
export function getEffectList(): TextEffect[] {
  return Object.values(TEXT_EFFECTS);
}

/**
 * Get effects suitable for covers (premium effects).
 */
export function getCoverEffects(): TextEffect[] {
  return ['gold-foil', 'silver-foil', 'copper-foil', 'emboss', 'deboss', 'metallic', 'gradient', 'neon']
    .map(id => TEXT_EFFECTS[id as TextEffectType])
    .filter(Boolean);
}

/**
 * Get effects suitable for interior text (subtle effects).
 */
export function getInteriorEffects(): TextEffect[] {
  return ['none', 'vintage', 'letterpress', 'shadow-3d']
    .map(id => TEXT_EFFECTS[id as TextEffectType])
    .filter(Boolean);
}

/**
 * Generate the CSS keyframes/rules that need to be injected into the document.
 */
export function getGlobalEffectCss(): string {
  return Object.values(TEXT_EFFECTS)
    .filter(e => e.additionalCss)
    .map(e => e.additionalCss)
    .join('\n');
}
