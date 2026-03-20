import { JacketDesign } from '../types';

export interface CoverTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  design: Partial<JacketDesign>;
}

export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: 'dramatic-dark',
    name: 'Dramatic Dark',
    description: 'Bold and mysterious with deep contrasts',
    preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    design: {
      backgroundColor: '#1a1a2e',
      overlayOpacity: 0.4,
      imageOptions: { size: 'cover', filter: 'contrast(1.2)' },
      title: { font: 'Playfair Display', fontSize: 52, color: '#ffffff', textAlign: 'center', letterSpacing: 2, lineHeight: 1.1, isUppercase: false, rotation: 0 },
      author: { font: 'Roboto', fontSize: 16, color: '#b8b8b8', textAlign: 'center', letterSpacing: 3, lineHeight: 1, isUppercase: true, rotation: 0 }
    }
  },
  {
    id: 'warm-autumn',
    name: 'Warm Autumn',
    description: 'Cozy and inviting with warm earth tones',
    preview: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd23f 100%)',
    design: {
      backgroundColor: '#ff6b35',
      overlayOpacity: 0.2,
      imageOptions: { size: 'cover', filter: 'saturate(1.3)' },
      title: { font: 'Dancing Script', fontSize: 48, color: '#2c1810', textAlign: 'center', letterSpacing: 1, lineHeight: 1.2, isUppercase: false, rotation: 0 },
      author: { font: 'Open Sans', fontSize: 14, color: '#4a3c28', textAlign: 'center', letterSpacing: 2, lineHeight: 1, isUppercase: true, rotation: 0 }
    }
  },
  {
    id: 'cool-professional',
    name: 'Cool Professional',
    description: 'Clean and modern with cool blue tones',
    preview: 'linear-gradient(135deg, #2c5aa0 0%, #4a90e2 50%, #7bb3f0 100%)',
    design: {
      backgroundColor: '#2c5aa0',
      overlayOpacity: 0.25,
      imageOptions: { size: 'cover', filter: 'brightness(1.1)' },
      title: { font: 'Helvetica', fontSize: 44, color: '#ffffff', textAlign: 'center', letterSpacing: 1, lineHeight: 1.1, isUppercase: false, rotation: 0 },
      author: { font: 'Roboto', fontSize: 16, color: '#e8f4f8', textAlign: 'center', letterSpacing: 2, lineHeight: 1, isUppercase: true, rotation: 0 }
    }
  },
  {
    id: 'minimalist-elegant',
    name: 'Minimalist Elegant',
    description: 'Simple and sophisticated with clean lines',
    preview: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
    design: {
      backgroundColor: '#f8f9fa',
      overlayOpacity: 0.1,
      imageOptions: { size: 'contain', filter: 'none' },
      title: { font: 'Times-Roman', fontSize: 40, color: '#212529', textAlign: 'center', letterSpacing: 3, lineHeight: 1.3, isUppercase: false, rotation: 0 },
      author: { font: 'Helvetica', fontSize: 14, color: '#6c757d', textAlign: 'center', letterSpacing: 2, lineHeight: 1, isUppercase: true, rotation: 0 }
    }
  },
  {
    id: 'vibrant-energy',
    name: 'Vibrant Energy',
    description: 'Bold and energetic with bright colors',
    preview: 'linear-gradient(135deg, #ff0084 0%, #ff8c00 50%, #ffea00 100%)',
    design: {
      backgroundColor: '#ff0084',
      overlayOpacity: 0.3,
      imageOptions: { size: 'cover', filter: 'saturate(1.5)' },
      title: { font: 'Roboto', fontSize: 56, color: '#ffffff', textAlign: 'center', letterSpacing: 0, lineHeight: 1, isUppercase: true, rotation: 0 },
      author: { font: 'Open Sans', fontSize: 18, color: '#fff3cd', textAlign: 'center', letterSpacing: 4, lineHeight: 1, isUppercase: true, rotation: 0 }
    }
  },
  {
    id: 'classic-literary',
    name: 'Classic Literary',
    description: 'Timeless and traditional for serious literature',
    preview: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)',
    design: {
      backgroundColor: '#8b4513',
      overlayOpacity: 0.35,
      imageOptions: { size: 'cover', filter: 'sepia(30%)' },
      title: { font: 'Times-Roman', fontSize: 46, color: '#f5f5dc', textAlign: 'center', letterSpacing: 2, lineHeight: 1.2, isUppercase: false, rotation: 0 },
      author: { font: 'Times-Roman', fontSize: 16, color: '#deb887', textAlign: 'center', letterSpacing: 1, lineHeight: 1, isUppercase: false, rotation: 0 }
    }
  }
];

export const applyTemplate = (currentDesign: JacketDesign, template: CoverTemplate): JacketDesign => {
  return {
    ...currentDesign,
    ...template.design,
    title: { ...currentDesign.title, ...template.design.title },
    author: { ...currentDesign.author, ...template.design.author },
    subtitle: currentDesign.subtitle ? { ...currentDesign.subtitle, ...template.design.subtitle } : undefined,
    backCoverText: currentDesign.backCoverText ? { ...currentDesign.backCoverText, ...template.design.backCoverText } : undefined,
    spineText: currentDesign.spineText ? { ...currentDesign.spineText, ...template.design.spineText } : undefined,
    imageOptions: { ...currentDesign.imageOptions, ...template.design.imageOptions }
  };
};

export const getTemplatePreview = (template: CoverTemplate): string => {
  return template.preview;
};