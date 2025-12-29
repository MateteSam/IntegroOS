// Universal export system for all content types
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'svg' | 'zip' | 'html';

// Export HTML element as image
export async function exportAsImage(
  element: HTMLElement,
  filename: string,
  format: 'png' | 'jpg' = 'png'
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.95 : 1.0);
    link.click();
  } catch (error) {
    console.error('Export as image failed:', error);
    throw new Error('Failed to export as image');
  }
}

// Export HTML element as PDF
export async function exportAsPDF(
  element: HTMLElement,
  filename: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Export as PDF failed:', error);
    throw new Error('Failed to export as PDF');
  }
}

// Export SVG string as file
export function exportSVG(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Export base64 image as file
export function exportBase64Image(base64: string, filename: string, format: 'png' | 'jpg' = 'png'): void {
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = base64.startsWith('data:') ? base64 : `data:image/${format};base64,${base64}`;
  link.click();
}

// Export logo in multiple formats
export async function exportLogo(
  base64Image: string,
  businessName: string,
  format: 'png' | 'pdf' | 'svg',
  size: 'high' | 'medium' | 'low' = 'high'
): Promise<void> {
  const filename = `${businessName.replace(/\s+/g, '-')}-logo`;
  
  if (format === 'png') {
    // Create image at specified resolution
    const img = new Image();
    img.src = base64Image;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    
    const sizeMap = { high: 2048, medium: 1024, low: 512 };
    const targetSize = sizeMap[size];
    
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      
      const link = document.createElement('a');
      link.download = `${filename}-${size}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  } else if (format === 'pdf') {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    pdf.addImage(base64Image, 'PNG', 20, 20, 170, 170);
    pdf.save(`${filename}.pdf`);
  } else if (format === 'svg') {
    // For SVG, we'll convert the base64 to a data URL and embed it
    // In a real implementation, you'd want to trace the bitmap to vectors
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <image href="${base64Image}" width="1024" height="1024"/>
</svg>`;
    
    exportSVG(svgContent, filename);
  }
}

// Generate favicon set from logo
export async function generateFavicons(base64Image: string): Promise<{
  '16x16': string;
  '32x32': string;
  '180x180': string;
}> {
  const img = new Image();
  img.src = base64Image;
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  
  const sizes = [16, 32, 180];
  const favicons: any = {};
  
  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(img, 0, 0, size, size);
      favicons[`${size}x${size}`] = canvas.toDataURL('image/png');
    }
  }
  
  return favicons;
}

// Create complete brand kit ZIP
export async function createBrandKitZip(
  brandData: any,
  businessName: string
): Promise<void> {
  const zip = new JSZip();
  const folderName = `${businessName.replace(/\s+/g, '-')}-Brand-Kit`;
  
  // Create folder structure
  const logosFolder = zip.folder(`${folderName}/logos`)!;
  const primaryFolder = logosFolder.folder('primary')!;
  const variationsFolder = logosFolder.folder('variations')!;
  const faviconFolder = logosFolder.folder('favicon')!;
  const colorsFolder = zip.folder(`${folderName}/colors`)!;
  const typographyFolder = zip.folder(`${folderName}/typography`)!;
  const guidelinesFolder = zip.folder(`${folderName}/brand-guidelines`)!;
  
  // Add primary logos
  if (brandData.logos && brandData.logos.length > 0) {
    const primaryLogo = brandData.logos[0];
    
    // Add different sizes
    for (const size of ['high', 'medium', 'low']) {
      const sizeMap = { high: 2048, medium: 1024, low: 512 };
      const img = await createResizedImage(primaryLogo.data, sizeMap[size as keyof typeof sizeMap]);
      primaryFolder.file(`logo-${size}.png`, img.split(',')[1], { base64: true });
    }
    
    // Add variations
    brandData.logos.forEach((logo: any, index: number) => {
      const base64Data = logo.data.split(',')[1];
      variationsFolder.file(`logo-variation-${index + 1}.png`, base64Data, { base64: true });
    });
    
    // Generate and add favicons
    const favicons = await generateFavicons(primaryLogo.data);
    Object.entries(favicons).forEach(([size, data]) => {
      faviconFolder.file(`favicon-${size}.png`, (data as string).split(',')[1], { base64: true });
    });
  }
  
  // Add color files
  if (brandData.colors) {
    const colorJSON = JSON.stringify(brandData.colors, null, 2);
    colorsFolder.file('brand-colors.json', colorJSON);
    
    const colorCSS = generateColorCSS(brandData.colors);
    colorsFolder.file('brand-colors.css', colorCSS);
    
    const colorTXT = generateColorTXT(brandData.colors);
    colorsFolder.file('brand-colors.txt', colorTXT);
  }
  
  // Add typography
  if (brandData.typography) {
    const typographyJSON = JSON.stringify(brandData.typography, null, 2);
    typographyFolder.file('typography-config.json', typographyJSON);
    
    const typographyTXT = generateTypographyTXT(brandData.typography);
    typographyFolder.file('typography-guide.txt', typographyTXT);
  }
  
  // Generate brand guidelines PDF
  const guidelinesPDF = await generateBrandGuidelinesPDF(brandData, businessName);
  guidelinesFolder.file('brand-guidelines.pdf', guidelinesPDF, { base64: true });
  
  // Add README
  const readme = generateReadme(businessName);
  zip.file(`${folderName}/README.txt`, readme);
  
  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${folderName}.zip`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Helper: Create resized image
async function createResizedImage(base64: string, size: number): Promise<string> {
  const img = new Image();
  img.src = base64;
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
  }
  
  return canvas.toDataURL('image/png');
}

// Helper: Generate CSS from colors
function generateColorCSS(colors: any): string {
  return `:root {
  --brand-primary: ${colors.primary};
  --brand-secondary: ${colors.secondary};
  --brand-accent: ${colors.accent};
  --brand-neutral: ${colors.neutral || '#666666'};
}`;
}

// Helper: Generate readable color text
function generateColorTXT(colors: any): string {
  return `Brand Colors
============

Primary Color: ${colors.primary}
Secondary Color: ${colors.secondary}
Accent Color: ${colors.accent}
${colors.neutral ? `Neutral Color: ${colors.neutral}` : ''}

Usage Guidelines:
- Use primary color for main branding elements
- Secondary color for supporting elements
- Accent color for calls-to-action and highlights
`;
}

// Helper: Generate typography text
function generateTypographyTXT(typography: any): string {
  return `Typography Guide
================

Primary Font: ${typography.primary}
Secondary Font: ${typography.secondary}

Heading Sizes:
- H1: ${typography.headingSizes?.h1 || '48px'}
- H2: ${typography.headingSizes?.h2 || '36px'}
- H3: ${typography.headingSizes?.h3 || '24px'}

Body: ${typography.bodySize || '16px'}

Usage Guidelines:
- Use primary font for headings and important text
- Use secondary font for body copy and descriptions
`;
}

// Helper: Generate brand guidelines PDF
async function generateBrandGuidelinesPDF(brandData: any, businessName: string): Promise<string> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  let yPos = 20;
  
  // Title
  pdf.setFontSize(24);
  pdf.text(`${businessName} Brand Guidelines`, 20, yPos);
  yPos += 20;
  
  // Colors
  pdf.setFontSize(16);
  pdf.text('Brand Colors', 20, yPos);
  yPos += 10;
  pdf.setFontSize(12);
  if (brandData.colors) {
    pdf.text(`Primary: ${brandData.colors.primary}`, 20, yPos);
    yPos += 7;
    pdf.text(`Secondary: ${brandData.colors.secondary}`, 20, yPos);
    yPos += 7;
    pdf.text(`Accent: ${brandData.colors.accent}`, 20, yPos);
    yPos += 15;
  }
  
  // Typography
  pdf.setFontSize(16);
  pdf.text('Typography', 20, yPos);
  yPos += 10;
  pdf.setFontSize(12);
  if (brandData.typography) {
    pdf.text(`Primary Font: ${brandData.typography.primary}`, 20, yPos);
    yPos += 7;
    pdf.text(`Secondary Font: ${brandData.typography.secondary}`, 20, yPos);
    yPos += 15;
  }
  
  // Logo Usage
  pdf.setFontSize(16);
  pdf.text('Logo Usage', 20, yPos);
  yPos += 10;
  pdf.setFontSize(12);
  pdf.text('• Maintain clear space around logo', 20, yPos);
  yPos += 7;
  pdf.text('• Do not distort or rotate', 20, yPos);
  yPos += 7;
  pdf.text('• Use on appropriate backgrounds', 20, yPos);
  
  const pdfBase64 = pdf.output('datauristring').split(',')[1];
  return pdfBase64;
}

// Helper: Generate README
function generateReadme(businessName: string): string {
  return `${businessName} Brand Kit
${'='.repeat(businessName.length + 10)}

This brand kit contains all the essential assets for your brand identity.

Folder Structure:
- logos/ - All logo variations and formats
  - primary/ - Main logo in different resolutions
  - variations/ - Alternative logo concepts
  - favicon/ - Website favicon files
- colors/ - Brand color definitions
- typography/ - Font specifications
- brand-guidelines/ - Complete brand guidelines PDF

Usage Instructions:
1. Use high-resolution logos (2048px) for print materials
2. Use medium resolution (1024px) for digital content
3. Use low resolution (512px) for thumbnails and icons
4. Refer to brand guidelines PDF for proper usage

For questions or support, please contact your brand designer.
`;
}

// Export website as ZIP
export async function exportWebsiteZip(
  websiteData: any,
  businessName: string
): Promise<void> {
  const zip = new JSZip();
  const folderName = `${businessName.replace(/\s+/g, '-')}-Website`;
  
  // Add HTML files
  if (websiteData.pages) {
    Object.entries(websiteData.pages).forEach(([pageName, pageContent]: [string, any]) => {
      zip.file(`${folderName}/${pageName}.html`, pageContent);
    });
  }
  
  // Add CSS
  if (websiteData.css) {
    const cssFolder = zip.folder(`${folderName}/assets/css`)!;
    cssFolder.file('styles.css', websiteData.css);
  }
  
  // Add JS
  if (websiteData.javascript) {
    const jsFolder = zip.folder(`${folderName}/assets/js`)!;
    jsFolder.file('scripts.js', websiteData.javascript);
  }
  
  // Add README
  const readme = `${businessName} Website
${'='.repeat(businessName.length + 8)}

Setup Instructions:
1. Extract all files to your web server
2. Open index.html in a web browser to test locally
3. Upload to your hosting provider
4. Configure domain settings

Files Included:
- HTML pages for each section
- CSS styling in assets/css/
- JavaScript functionality in assets/js/

For deployment help, contact your web developer.
`;
  
  zip.file(`${folderName}/README.md`, readme);
  
  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${folderName}.zip`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Create ZIP archive with multiple files
export async function exportAsZip(
  files: Array<{ name: string; content: string | Blob }>,
  zipFilename: string
): Promise<void> {
  try {
    const zip = new JSZip();

    files.forEach(({ name, content }) => {
      zip.file(name, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${zipFilename}.zip`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export as ZIP failed:', error);
    throw new Error('Failed to create ZIP archive');
  }
}

// Export text content as file
export function exportText(content: string, filename: string, extension: string = 'txt'): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}.${extension}`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Convert data URL to Blob
export function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}
