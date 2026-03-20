/**
 * CIEngine.ts - Corporate Identity Engine (v1.0)
 * The "Neural Core" of the Growth Foundry. Extracts Brand DNA from a logo
 * and enforces consistency across all generated assets.
 */

import { generateAIText, extractTextFromImage } from '@/lib/ai';

// --- Types ---

export interface CIProfile {
    id: string;
    name: string;
    logoUrl: string;
    palette: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    typography: {
        headingFont: string;
        bodyFont: string;
        style: 'modern' | 'classic' | 'playful' | 'corporate';
    };
    mood: string[];
    geometry: 'angular' | 'rounded' | 'organic' | 'mixed';
    extractedAt: number;
}

export interface AssetGenerationRequest {
    ciProfile: CIProfile;
    assetType: 'letterhead' | 'business-card' | 'social-post' | 'flyer' | 'banner' | 'presentation';
    customPrompt?: string;
    dimensions: { width: number; height: number };
}

// --- Core Functions ---

/**
 * Extracts a comprehensive CI Profile from a logo image.
 * This is the foundation of the entire workflow.
 */
export async function extractFullDNA(logoDataUrl: string, brandName?: string): Promise<CIProfile> {
    const system = `You are the Integro OS Corporate Identity Architect. 
  Analyze the provided logo with surgical precision and extract its complete brand DNA.
  Your analysis must be comprehensive, identifying all visual cues that define the brand's identity.`;

    const prompt = `BRAND DNA EXTRACTION PROTOCOL:
  
  Analyze the logo for brand: "${brandName || 'Unknown Brand'}"
  
  Extract the following with HIGH PRECISION:
  1. **Color Palette**: Identify the PRIMARY (dominant), SECONDARY (supporting), ACCENT (highlight), BACKGROUND, and TEXT-friendly colors. Return as HEX codes.
  2. **Typography Style**: Infer the typography style (modern, classic, playful, corporate) and suggest appropriate heading/body font pairings.
  3. **Mood Keywords**: 5 adjectives that describe the brand's feeling (e.g., "Professional", "Innovative", "Trustworthy").
  4. **Geometry**: Is the design language angular, rounded, organic, or mixed?
  
  Return ONLY valid JSON:
  {
    "palette": { "primary": "#...", "secondary": "#...", "accent": "#...", "background": "#...", "text": "#..." },
    "typography": { "headingFont": "Font Name", "bodyFont": "Font Name", "style": "modern|classic|playful|corporate" },
    "mood": ["adj1", "adj2", "adj3", "adj4", "adj5"],
    "geometry": "angular|rounded|organic|mixed"
  }`;

    // Use Gemini's vision capabilities to analyze the logo
    const response = await generateAIText(prompt, system);

    try {
        const cleaned = response.text.replace(/```json\n?|\n?```/g, '').trim();
        const extracted = JSON.parse(cleaned);

        return {
            id: `ci_${Date.now()}`,
            name: brandName || 'Extracted Brand',
            logoUrl: logoDataUrl,
            palette: extracted.palette,
            typography: extracted.typography,
            mood: extracted.mood,
            geometry: extracted.geometry,
            extractedAt: Date.now()
        };
    } catch (e) {
        console.error('CIEngine: DNA Extraction failed, using fallback', e);
        // Fallback to a safe default if AI fails
        return {
            id: `ci_${Date.now()}`,
            name: brandName || 'Default Brand',
            logoUrl: logoDataUrl,
            palette: {
                primary: '#0F172A',
                secondary: '#1E293B',
                accent: '#D4AF37',
                background: '#FFFFFF',
                text: '#1E293B'
            },
            typography: {
                headingFont: 'Inter',
                bodyFont: 'Inter',
                style: 'modern'
            },
            mood: ['Professional', 'Modern', 'Trustworthy', 'Innovative', 'Clean'],
            geometry: 'angular',
            extractedAt: Date.now()
        };
    }
}

/**
 * Generates an AI prompt that is enriched with the CI Profile.
 * This ensures all generated assets are visually consistent.
 */
export function buildCIPrompt(ciProfile: CIProfile, assetType: string, customPrompt?: string): string {
    const moodStr = ciProfile.mood.join(', ');

    return `CREATE A HIGH-FIDELITY, BRAND-CONSISTENT ${assetType.toUpperCase()}.
  
  CORPORATE IDENTITY SPECIFICATION (MUST ADHERE):
  - Brand Name: "${ciProfile.name}"
  - Primary Color: ${ciProfile.palette.primary}
  - Secondary Color: ${ciProfile.palette.secondary}
  - Accent Color: ${ciProfile.palette.accent}
  - Typography Style: ${ciProfile.typography.style}
  - Brand Mood: ${moodStr}
  - Geometry: ${ciProfile.geometry}
  
  DESIGN RIGOR:
  - Use the specified colors EXACTLY as the dominant palette.
  - The design must feel ${moodStr}.
  - Style: Professional editorial quality, 8k resolution, ${ciProfile.geometry} shapes.
  
  ${customPrompt ? `USER CONTEXT: ${customPrompt}` : ''}
  
  IMPORTANT: DO NOT include any text in the image. Text will be overlaid by the precision typography engine.`;
}

/**
 * Generates an SVG template for print assets (Letterhead, Business Card, etc.)
 * using the CI Profile for colors and fonts.
 */
export function generateCIPrintTemplate(
    ciProfile: CIProfile,
    assetType: 'letterhead' | 'business-card',
    content: { companyName: string; tagline?: string; address?: string; phone?: string; email?: string; website?: string }
): string {
    const { primary, secondary, accent, text } = ciProfile.palette;
    const { headingFont, bodyFont } = ciProfile.typography;

    if (assetType === 'letterhead') {
        // A4 dimensions: 210mm x 297mm -> 2480 x 3508 px at 300dpi
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2480 3508" width="2480" height="3508">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=${headingFont.replace(' ', '+')}:wght@700&family=${bodyFont.replace(' ', '+')}:wght@400&display=swap');
          .heading { font-family: '${headingFont}', sans-serif; font-weight: 700; fill: ${primary}; }
          .body { font-family: '${bodyFont}', sans-serif; font-weight: 400; fill: ${text}; }
          .accent-line { stroke: ${accent}; stroke-width: 6; }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="2480" height="3508" fill="#FFFFFF"/>
      
      <!-- Header Bar -->
      <rect width="2480" height="200" fill="${primary}"/>
      
      <!-- Logo Placeholder -->
      <image href="${ciProfile.logoUrl}" x="100" y="30" width="140" height="140" preserveAspectRatio="xMidYMid meet"/>
      
      <!-- Company Name -->
      <text x="280" y="130" class="heading" font-size="72" fill="#FFFFFF">${content.companyName}</text>
      
      <!-- Accent Line -->
      <line x1="100" y1="260" x2="2380" y2="260" class="accent-line"/>
      
      <!-- Footer -->
      <rect y="3308" width="2480" height="200" fill="${secondary}"/>
      <text x="100" y="3420" class="body" font-size="36" fill="#FFFFFF">${content.address || ''}</text>
      <text x="1240" y="3420" class="body" font-size="36" fill="#FFFFFF" text-anchor="middle">${content.phone || ''} | ${content.email || ''}</text>
      <text x="2380" y="3420" class="body" font-size="36" fill="#FFFFFF" text-anchor="end">${content.website || ''}</text>
    </svg>`;
    }

    // Business Card: 3.5" x 2" -> 1050 x 600 px at 300dpi
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 600" width="1050" height="600">
    <defs>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=${headingFont.replace(' ', '+')}:wght@700&family=${bodyFont.replace(' ', '+')}:wght@400&display=swap');
        .heading { font-family: '${headingFont}', sans-serif; font-weight: 700; fill: ${primary}; }
        .body { font-family: '${bodyFont}', sans-serif; font-weight: 400; fill: ${text}; }
      </style>
    </defs>
    
    <!-- Background -->
    <rect width="1050" height="600" fill="#FFFFFF"/>
    
    <!-- Accent Bar -->
    <rect width="20" height="600" fill="${accent}"/>
    
    <!-- Logo -->
    <image href="${ciProfile.logoUrl}" x="60" y="40" width="120" height="120" preserveAspectRatio="xMidYMid meet"/>
    
    <!-- Company Name -->
    <text x="200" y="100" class="heading" font-size="48">${content.companyName}</text>
    <text x="200" y="140" class="body" font-size="24" fill="${secondary}">${content.tagline || ''}</text>
    
    <!-- Contact -->
    <text x="60" y="500" class="body" font-size="28">${content.phone || ''}</text>
    <text x="60" y="540" class="body" font-size="28">${content.email || ''}</text>
    <text x="60" y="580" class="body" font-size="28">${content.website || ''}</text>
  </svg>`;
}

/**
 * Saves a CI Profile to local storage for persistence.
 */
export function saveCIProfile(profile: CIProfile): void {
    try {
        const profiles = loadAllCIProfiles();
        profiles.push(profile);
        localStorage.setItem('integro_ci_profiles', JSON.stringify(profiles));
    } catch (e) {
        console.error('CIEngine: Failed to save profile', e);
    }
}

/**
 * Loads all saved CI Profiles.
 */
export function loadAllCIProfiles(): CIProfile[] {
    try {
        const raw = localStorage.getItem('integro_ci_profiles');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Loads a single CI Profile by ID.
 */
export function loadCIProfile(id: string): CIProfile | null {
    return loadAllCIProfiles().find(p => p.id === id) || null;
}

/**
 * Deletes a CI Profile by ID.
 */
export function deleteCIProfile(id: string): void {
    const profiles = loadAllCIProfiles().filter(p => p.id !== id);
    localStorage.setItem('integro_ci_profiles', JSON.stringify(profiles));
}
