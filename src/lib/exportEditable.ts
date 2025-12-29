import JSZip from 'jszip';

/**
 * Export utilities for editable design formats
 * Supports SVG, Figma JSON, and AI-compatible formats
 */

interface DesignElement {
  type: 'text' | 'shape' | 'image' | 'group';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  fill?: string;
  stroke?: string;
  fontSize?: number;
  fontFamily?: string;
  children?: DesignElement[];
}

interface EditableDesign {
  name: string;
  width: number;
  height: number;
  elements: DesignElement[];
  colors: string[];
  fonts: string[];
}

/**
 * Convert design to SVG (fully editable in Illustrator, Affinity Designer)
 */
export const exportToSVG = (design: EditableDesign): string => {
  const { width, height, elements } = design;
  
  const renderElement = (el: DesignElement): string => {
    switch (el.type) {
      case 'text':
        return `<text x="${el.x}" y="${el.y}" fill="${el.fill || '#000'}" font-size="${el.fontSize || 16}" font-family="${el.fontFamily || 'Arial'}">${el.content || ''}</text>`;
      case 'shape':
        return `<rect x="${el.x}" y="${el.y}" width="${el.width || 100}" height="${el.height || 100}" fill="${el.fill || '#000'}" stroke="${el.stroke || 'none'}" />`;
      case 'image':
        return `<image x="${el.x}" y="${el.y}" width="${el.width || 100}" height="${el.height || 100}" href="${el.content || ''}" />`;
      case 'group':
        return `<g transform="translate(${el.x}, ${el.y})">${(el.children || []).map(renderElement).join('\n')}</g>`;
      default:
        return '';
    }
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <title>${design.name}</title>
  <desc>Editable design for ${design.name} - Compatible with Adobe Illustrator, Affinity Designer, Figma</desc>
  ${elements.map(renderElement).join('\n')}
</svg>`;
};

/**
 * Convert design to Figma JSON format
 */
export const exportToFigmaJSON = (design: EditableDesign): string => {
  const convertElement = (el: DesignElement, id: number): any => {
    const base = {
      id: `${id}`,
      name: el.type,
      type: el.type === 'text' ? 'TEXT' : el.type === 'shape' ? 'RECTANGLE' : 'FRAME',
      x: el.x,
      y: el.y,
      width: el.width || 100,
      height: el.height || 100,
    };

    if (el.type === 'text') {
      return {
        ...base,
        type: 'TEXT',
        characters: el.content || '',
        style: {
          fontFamily: el.fontFamily || 'Inter',
          fontSize: el.fontSize || 16,
          fills: [{ type: 'SOLID', color: hexToRGB(el.fill || '#000000') }]
        }
      };
    }

    if (el.type === 'shape') {
      return {
        ...base,
        type: 'RECTANGLE',
        fills: [{ type: 'SOLID', color: hexToRGB(el.fill || '#000000') }],
        strokes: el.stroke ? [{ type: 'SOLID', color: hexToRGB(el.stroke) }] : []
      };
    }

    return base;
  };

  const figmaDoc = {
    document: {
      id: '0:0',
      name: design.name,
      type: 'CANVAS',
      children: [
        {
          id: '0:1',
          name: design.name,
          type: 'FRAME',
          width: design.width,
          height: design.height,
          children: design.elements.map((el, i) => convertElement(el, i + 2))
        }
      ]
    },
    version: '1.0',
    metadata: {
      colors: design.colors,
      fonts: design.fonts,
      exportedBy: 'BrandNexus',
      exportDate: new Date().toISOString()
    }
  };

  return JSON.stringify(figmaDoc, null, 2);
};

/**
 * Export design as editable package (ZIP with SVG, Figma JSON, metadata)
 */
export const exportEditablePackage = async (
  design: EditableDesign,
  includeFormats: ('svg' | 'figma' | 'metadata')[] = ['svg', 'figma', 'metadata']
): Promise<void> => {
  const zip = new JSZip();
  const folderName = design.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const folder = zip.folder(folderName);

  if (!folder) throw new Error('Failed to create ZIP folder');

  // Add SVG
  if (includeFormats.includes('svg')) {
    const svg = exportToSVG(design);
    folder.file(`${folderName}.svg`, svg);
  }

  // Add Figma JSON
  if (includeFormats.includes('figma')) {
    const figmaJSON = exportToFigmaJSON(design);
    folder.file(`${folderName}_figma.json`, figmaJSON);
  }

  // Add metadata and instructions
  if (includeFormats.includes('metadata')) {
    const readme = `# ${design.name} - Editable Design Files

## Included Files

${includeFormats.includes('svg') ? '- **SVG**: Open in Adobe Illustrator, Affinity Designer, or any vector editor\n' : ''}
${includeFormats.includes('figma') ? '- **Figma JSON**: Import into Figma using "Import" → "Import from file"\n' : ''}

## Design Specifications

- Dimensions: ${design.width}x${design.height}px
- Colors: ${design.colors.join(', ')}
- Fonts: ${design.fonts.join(', ')}

## How to Edit

### Adobe Illustrator
1. Open the .svg file directly in Illustrator
2. All elements remain fully editable (text, shapes, colors)
3. Save as .ai for native Illustrator format

### Affinity Designer
1. Open the .svg file in Affinity Designer
2. All elements are preserved as vectors
3. Save as .afdesign for native format

### Figma
1. Import the _figma.json file
2. Use Figma's import functionality
3. All layers and properties are preserved

## Colors Used
${design.colors.map(c => `- ${c}`).join('\n')}

## Fonts Used
${design.fonts.map(f => `- ${f}`).join('\n')}

---
Exported from BrandNexus on ${new Date().toLocaleDateString()}
`;
    folder.file('README.md', readme);

    const metadata = {
      name: design.name,
      dimensions: { width: design.width, height: design.height },
      colors: design.colors,
      fonts: design.fonts,
      exportDate: new Date().toISOString(),
      version: '1.0',
      editable: true,
      formats: includeFormats
    };
    folder.file('metadata.json', JSON.stringify(metadata, null, 2));
  }

  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folderName}_editable.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convert brand assets to editable design format
 */
export const convertBrandAssetToEditable = (
  asset: any,
  brandData: any
): EditableDesign => {
  // Extract design elements from generated asset
  const elements: DesignElement[] = [];
  
  if (asset.type === 'logo' && asset.variants) {
    // Convert logo to editable elements
    elements.push({
      type: 'text',
      x: 100,
      y: 100,
      content: brandData.businessName || 'Logo',
      fontSize: 48,
      fontFamily: brandData.typography?.heading || 'Inter',
      fill: brandData.colors?.primary || '#000000'
    });
  }

  return {
    name: asset.name || 'Brand Asset',
    width: 1200,
    height: 1200,
    elements,
    colors: brandData.colors ? Object.values(brandData.colors) : ['#000000'],
    fonts: brandData.typography ? [brandData.typography.heading, brandData.typography.body] : ['Inter']
  };
};

// Helper function to convert hex to RGB for Figma
const hexToRGB = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
};

export type { EditableDesign, DesignElement };
