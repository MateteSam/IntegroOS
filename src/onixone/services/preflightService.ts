
import { Annotation, DocumentSettings, PreflightIssue, TextAnnotation, ImageAnnotation } from '../types';

// PDF Points per MM (72 points per inch / 25.4 mm per inch)
const PT_PER_MM = 2.83465;

const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = base64;
  });
};

export const runPreflightChecks = async (
  annotations: Annotation[],
  pageDimensions: { width: number; height: number },
  settings: DocumentSettings
): Promise<PreflightIssue[]> => {
  const issues: PreflightIssue[] = [];
  
  const parseHex = (hex: string) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r / 255, g / 255, b / 255];
  };
  const relLum = (rgb: number[]) => {
    const transform = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const [r, g, b] = rgb.map(transform);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrastRatio = (fg: string, bg: string) => {
    const L1 = relLum(parseHex(fg));
    const L2 = relLum(parseHex(bg));
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  };
  
  const marginPt = settings.marginMm * PT_PER_MM;
  const safeZone = {
    x: marginPt,
    y: marginPt,
    width: pageDimensions.width - (marginPt * 2),
    height: pageDimensions.height - (marginPt * 2)
  };

  for (const ann of annotations) {
    if (ann.hidden) continue;

    // Check 1: Margin Safety
    // Simple bounding box check
    const annRight = ann.x + (ann.width || 0);
    const annBottom = ann.y + (ann.height || 0);
    
    // Note: Text height logic is approximate in `types`, handled better in render, 
    // but here we use what we have. For text, width is often calculated during edit.
    // If width is undefined (fresh text), skip width check or assume default.
    
    let isOutside = false;
    
    // Check Left/Top
    if (ann.x < safeZone.x || ann.y < safeZone.y) isOutside = true;
    
    // Check Right/Bottom (Only if we know dimensions)
    if (ann.width && annRight > safeZone.x + safeZone.width) isOutside = true;
    if (ann.height && annBottom > safeZone.y + safeZone.height) isOutside = true;

    if (isOutside) {
        issues.push({
            id: `margin-${ann.id}`,
            annotationId: ann.id,
            pageIndex: ann.pageIndex,
            severity: 'warning',
            type: 'margin',
            message: `${ann.type === 'text' ? 'Text' : 'Image'} is outside the safe margin area.`
        });
    }

    // Check 2: Content
    if (ann.type === 'text') {
        if (!ann.text || ann.text.trim() === '') {
            issues.push({
                id: `empty-${ann.id}`,
                annotationId: ann.id,
                pageIndex: ann.pageIndex,
                severity: 'warning',
                type: 'content',
                message: 'Text annotation is empty.'
            });
        }
        // Check 2b: Color contrast (WCAG)
        const bg = (ann as any).backgroundColor || '#ffffff';
        const fg = ann.color || '#000000';
        try {
          const ratio = contrastRatio(fg, bg);
          const isLargeText = (ann.fontSize || 12) >= 18;
          const minWarn = isLargeText ? 3.0 : 4.5;
          const minError = isLargeText ? 2.5 : 3.0;
          if (ratio < minWarn) {
            issues.push({
              id: `contrast-${ann.id}`,
              annotationId: ann.id,
              pageIndex: ann.pageIndex,
              severity: ratio < minError ? 'error' : 'warning',
              type: 'contrast',
              message: `Low contrast text (${ratio.toFixed(2)}:1).`
            });
          }
        } catch {}
    }

    // Check 3: Image Quality (DPI)
    if (ann.type === 'image') {
        const imgAnn = ann as ImageAnnotation;
        // We need source dimensions. This is async, so we gather promises if we were doing this in bulk perfectly.
        // For simplicity in this function, we assume we might need to await.
        // However, `runPreflightChecks` is async.
        
        const sourceDims = await getImageDimensions(imgAnn.imageBase64);
        
        // Rendered Width (inches) = width (points) / 72
        const renderedWidthInches = imgAnn.width / 72;
        const renderedHeightInches = imgAnn.height / 72;
        
        const dpiX = sourceDims.width / renderedWidthInches;
        const dpiY = sourceDims.height / renderedHeightInches;
        const avgDpi = (dpiX + dpiY) / 2;

        if (avgDpi < settings.targetDpi) {
            issues.push({
                id: `dpi-${ann.id}`,
                annotationId: ann.id,
                pageIndex: ann.pageIndex,
                severity: avgDpi < 72 ? 'error' : 'warning', // <72 is screen res (bad for print), <300 is warning
                type: 'dpi',
                message: `Low resolution image (${Math.round(avgDpi)} DPI). Target is ${settings.targetDpi} DPI.`
            });
        }
    }
  }

  return issues;
};
