/**
 * 🎬 Slide Composition Engine — Presentation Layout
 *
 * A dedicated composition engine for presentation/slide decks.
 * Unlike the book composition engine (text reflow), slides use:
 * - Fixed-size canvases (e.g. 960×540pt for 16:9)
 * - Absolute positioning of elements per slide
 * - No text reflow, no widow/orphan control
 * - Per-slide backgrounds, layout templates, and brand logos
 *
 * Based on analysis of the Sesotho Fashioneng × KFC presentation deck.
 */

import {
  StoryBlock,
  TextStoryBlock,
  ImageStoryBlock,
  BreakStoryBlock,
  Annotation,
  TextAnnotation,
  ImageAnnotation,
  ShapeAnnotation,
  Bookmark,
  SlideLayout,
  SlideBackground,
  SlideRegion,
  ChartData,
} from '../types';

import {
  PageSpec,
  ComposedPage,
  CompositionResult,
  CompositionOptions,
  TocEntry,
} from './compositionEngine';

import { SLIDE_TEMPLATES, getTemplateForSlide } from './slideTemplates';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 SLIDE COMPOSITION — MAIN ENTRY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compose a presentation deck from story blocks.
 * Each page break in the blocks marks a new slide.
 * Elements are positioned absolutely according to slide layout templates.
 */
export function composePresentation(
  storyBlocks: StoryBlock[],
  options: CompositionOptions,
): CompositionResult {
  const { pageSpec } = options;
  const pages: ComposedPage[] = [];
  const allAnnotations: Annotation[] = [];
  const bookmarks: Bookmark[] = [];
  const tocEntries: TocEntry[] = [];
  const warnings: string[] = [];

  // Split story blocks into slides at page breaks
  const slideGroups = splitIntoSlides(storyBlocks);

  if (slideGroups.length === 0) {
    // Create at least one empty slide
    slideGroups.push([]);
  }

  // Compose each slide
  for (let slideIdx = 0; slideIdx < slideGroups.length; slideIdx++) {
    const slideBlocks = slideGroups[slideIdx];
    const template = getTemplateForSlide(slideBlocks, slideIdx, slideGroups.length);

    const page = createSlidePage(slideIdx, pageSpec);
    pages.push(page);

    // Render background
    const bgAnnotations = renderBackground(template.background, slideIdx, pageSpec);
    page.annotations.push(...bgAnnotations);
    allAnnotations.push(...bgAnnotations);

    // Render content into regions
    const contentAnnotations = renderSlideContent(slideBlocks, template, slideIdx, pageSpec);
    page.annotations.push(...contentAnnotations);
    allAnnotations.push(...contentAnnotations);

    // Render brand logo if configured
    if (template.brandLogo) {
      const logoAnn = renderBrandLogo(template.brandLogo, slideIdx, pageSpec);
      if (logoAnn) {
        page.annotations.push(logoAnn);
        allAnnotations.push(logoAnn);
      }
    }

    // Add slide title as bookmark
    const titleBlock = slideBlocks.find(b => b.type === 'chapter' || b.type === 'heading');
    if (titleBlock && titleBlock.type !== 'break' && titleBlock.type !== 'image') {
      const tb = titleBlock as TextStoryBlock;
      bookmarks.push({ title: tb.text || `Slide ${slideIdx + 1}`, pageIndex: slideIdx });
    }
  }

  return {
    pages,
    totalPages: pages.length,
    annotations: allAnnotations,
    bookmarks,
    tocEntries,
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Split story blocks into groups (one per slide) at page breaks.
 */
function splitIntoSlides(blocks: StoryBlock[]): StoryBlock[][] {
  const slides: StoryBlock[][] = [];
  let current: StoryBlock[] = [];

  for (const block of blocks) {
    if (block.type === 'break' && (block as BreakStoryBlock).breakType === 'page') {
      slides.push(current);
      current = [];
    } else {
      current.push(block);
    }
  }

  // Push final group
  if (current.length > 0) {
    slides.push(current);
  }

  return slides;
}

/**
 * Create a ComposedPage for a slide.
 */
function createSlidePage(slideIndex: number, pageSpec: PageSpec): ComposedPage {
  return {
    pageIndex: slideIndex,
    pageNumber: String(slideIndex + 1),
    numberingStyle: 'arabic',
    section: 'body',
    isRecto: true, // Presentations don't have recto/verso
    annotations: [],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 BACKGROUND RENDERING
// ═══════════════════════════════════════════════════════════════════════════════

function renderBackground(
  bg: SlideBackground,
  slideIndex: number,
  pageSpec: PageSpec,
): Annotation[] {
  const annotations: Annotation[] = [];
  const prefix = `slide-bg-${slideIndex}`;

  switch (bg.type) {
    case 'solid': {
      annotations.push({
        id: `${prefix}-solid`,
        storyBlockId: '__slide_bg__',
        pageIndex: slideIndex,
        type: 'rect',
        x: 0,
        y: 0,
        width: pageSpec.widthPt,
        height: pageSpec.heightPt,
        fillColor: bg.color || '#ffffff',
        strokeWidth: 0,
        zIndex: 0,
      } as ShapeAnnotation);
      break;
    }

    case 'gradient': {
      // Gradient rendered as a rect — the PageRenderer will interpret fillGradient
      annotations.push({
        id: `${prefix}-gradient`,
        storyBlockId: '__slide_bg__',
        pageIndex: slideIndex,
        type: 'rect',
        x: 0,
        y: 0,
        width: pageSpec.widthPt,
        height: pageSpec.heightPt,
        fillColor: bg.gradient?.start || '#000000',
        fillGradient: bg.gradient ? {
          start: bg.gradient.start,
          end: bg.gradient.end,
          angle: bg.gradient.angle,
        } : undefined,
        strokeWidth: 0,
        zIndex: 0,
      } as ShapeAnnotation);
      break;
    }

    case 'split': {
      const splitRatio = bg.split?.ratio ?? 0.5;
      const splitX = pageSpec.widthPt * splitRatio;

      // Left panel
      annotations.push({
        id: `${prefix}-left`,
        storyBlockId: '__slide_bg__',
        pageIndex: slideIndex,
        type: 'rect',
        x: 0,
        y: 0,
        width: splitX,
        height: pageSpec.heightPt,
        fillColor: bg.split?.leftColor || '#ffffff',
        strokeWidth: 0,
        zIndex: 0,
      } as ShapeAnnotation);

      // Right panel
      annotations.push({
        id: `${prefix}-right`,
        storyBlockId: '__slide_bg__',
        pageIndex: slideIndex,
        type: 'rect',
        x: splitX,
        y: 0,
        width: pageSpec.widthPt - splitX,
        height: pageSpec.heightPt,
        fillColor: bg.split?.rightColor || '#1a1a1a',
        strokeWidth: 0,
        zIndex: 0,
      } as ShapeAnnotation);
      break;
    }

    case 'image': {
      // Background image — rendered as a rect with solid fallback
      // The actual image would be set via an image annotation overlay
      annotations.push({
        id: `${prefix}-img-bg`,
        storyBlockId: '__slide_bg__',
        pageIndex: slideIndex,
        type: 'rect',
        x: 0,
        y: 0,
        width: pageSpec.widthPt,
        height: pageSpec.heightPt,
        fillColor: bg.color || '#1a1a1a',
        strokeWidth: 0,
        zIndex: 0,
      } as ShapeAnnotation);

      if (bg.imageBase64) {
        annotations.push({
          id: `${prefix}-img`,
          storyBlockId: '__slide_bg__',
          pageIndex: slideIndex,
          type: 'image',
          x: 0,
          y: 0,
          width: pageSpec.widthPt,
          height: pageSpec.heightPt,
          fileType: 'image/jpeg',
          imageBase64: bg.imageBase64,
          objectFit: 'cover',
          opacity: bg.watermarkOpacity ?? 1,
          zIndex: 1,
        } as ImageAnnotation);
      }
      break;
    }
  }

  return annotations;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 SLIDE CONTENT POSITIONING
// ═══════════════════════════════════════════════════════════════════════════════

function renderSlideContent(
  blocks: StoryBlock[],
  layout: SlideLayout,
  slideIndex: number,
  pageSpec: PageSpec,
): Annotation[] {
  const annotations: Annotation[] = [];
  const prefix = `slide-${slideIndex}`;

  // Separate blocks by type for region matching
  const textBlocks = blocks.filter(b => b.type !== 'image' && b.type !== 'break') as TextStoryBlock[];
  const imageBlocks = blocks.filter(b => b.type === 'image') as ImageStoryBlock[];

  // Track which blocks have been placed
  let textIdx = 0;
  let imageIdx = 0;

  for (const region of layout.regions) {
    switch (region.type) {
      case 'text': {
        // Find appropriate text block for this region
        const block = textBlocks[textIdx];
        if (block) {
          const text = block.text || '';
          annotations.push({
            id: `${prefix}-txt-${region.id}`,
            storyBlockId: block.id,
            pageIndex: slideIndex,
            type: 'text',
            text,
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
            fontSize: region.fontSize || 18,
            color: region.color || '#000000',
            fontFamily: region.fontFamily || 'Roboto',
            textAlign: region.textAlign || 'left',
            zIndex: 5,
          } as TextAnnotation);
          textIdx++;
        }
        break;
      }

      case 'image': {
        const imgBlock = imageBlocks[imageIdx];
        if (imgBlock && imgBlock.url) {
          annotations.push({
            id: `${prefix}-img-${region.id}`,
            storyBlockId: imgBlock.id,
            pageIndex: slideIndex,
            type: 'image',
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
            fileType: 'image/jpeg',
            imageBase64: imgBlock.url,
            borderRadius: region.borderRadius || 0,
            objectFit: 'cover',
            rotation: region.rotation || 0,
            zIndex: 5,
          } as ImageAnnotation);
          imageIdx++;
        } else {
          // Empty image placeholder
          annotations.push({
            id: `${prefix}-imgph-${region.id}`,
            storyBlockId: '__placeholder__',
            pageIndex: slideIndex,
            type: 'rect',
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
            fillColor: region.backgroundColor || '#e5e7eb',
            strokeColor: '#9ca3af',
            strokeWidth: 1,
            borderRadius: region.borderRadius || 0,
            zIndex: 4,
          } as ShapeAnnotation);
          // Placeholder label
          annotations.push({
            id: `${prefix}-imgph-label-${region.id}`,
            storyBlockId: '__placeholder__',
            pageIndex: slideIndex,
            type: 'text',
            text: region.placeholder || 'Image',
            x: region.x,
            y: region.y + region.height / 2 - 10,
            width: region.width,
            height: 20,
            fontSize: 14,
            color: '#9ca3af',
            textAlign: 'center',
            zIndex: 5,
          } as TextAnnotation);
        }
        break;
      }

      case 'chart': {
        // Chart placeholder — actual chart rendering will be data-driven
        annotations.push({
          id: `${prefix}-chart-${region.id}`,
          storyBlockId: '__chart__',
          pageIndex: slideIndex,
          type: 'rect',
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
          fillColor: region.backgroundColor || '#f3f4f6',
          strokeColor: '#d1d5db',
          strokeWidth: 1,
          borderRadius: 4,
          zIndex: 4,
        } as ShapeAnnotation);
        annotations.push({
          id: `${prefix}-chart-label-${region.id}`,
          storyBlockId: '__chart__',
          pageIndex: slideIndex,
          type: 'text',
          text: region.placeholder || 'Chart',
          x: region.x,
          y: region.y + region.height / 2 - 10,
          width: region.width,
          height: 20,
          fontSize: 14,
          color: '#6b7280',
          textAlign: 'center',
          zIndex: 5,
        } as TextAnnotation);
        break;
      }

      case 'shape': {
        annotations.push({
          id: `${prefix}-shape-${region.id}`,
          storyBlockId: '__shape__',
          pageIndex: slideIndex,
          type: 'rect',
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
          fillColor: region.backgroundColor || 'transparent',
          strokeColor: region.color || 'transparent',
          strokeWidth: 1,
          borderRadius: region.borderRadius || 0,
          zIndex: 3,
        } as ShapeAnnotation);
        break;
      }

      case 'logo': {
        // Logo placeholder — can be replaced with actual brand logo image
        annotations.push({
          id: `${prefix}-logo-${region.id}`,
          storyBlockId: '__logo__',
          pageIndex: slideIndex,
          type: 'rect',
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
          fillColor: region.backgroundColor || '#e5e7eb',
          strokeWidth: 0,
          borderRadius: 4,
          zIndex: 6,
        } as ShapeAnnotation);
        annotations.push({
          id: `${prefix}-logo-label-${region.id}`,
          storyBlockId: '__logo__',
          pageIndex: slideIndex,
          type: 'text',
          text: region.placeholder || 'Logo',
          x: region.x,
          y: region.y + region.height / 2 - 8,
          width: region.width,
          height: 16,
          fontSize: 10,
          color: '#9ca3af',
          textAlign: 'center',
          zIndex: 7,
        } as TextAnnotation);
        break;
      }
    }
  }

  // If there are remaining text blocks not placed in regions, stack them
  if (textIdx < textBlocks.length) {
    let stackY = 100; // Default fallback y position
    for (let i = textIdx; i < textBlocks.length; i++) {
      const block = textBlocks[i];
      const fontSize = block.type === 'heading' || block.type === 'chapter' ? 32 : 18;
      const height = Math.ceil((block.text || '').length / 60) * (fontSize * 1.4) + 10;

      annotations.push({
        id: `${prefix}-extra-${i}`,
        storyBlockId: block.id,
        pageIndex: slideIndex,
        type: 'text',
        text: block.text || '',
        x: 40,
        y: stackY,
        width: pageSpec.widthPt - 80,
        height,
        fontSize,
        color: '#000000',
        fontFamily: 'Roboto',
        textAlign: 'left',
        zIndex: 5,
      } as TextAnnotation);

      stackY += height + 10;
    }
  }

  return annotations;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏷️ BRAND LOGO
// ═══════════════════════════════════════════════════════════════════════════════

function renderBrandLogo(
  config: NonNullable<SlideLayout['brandLogo']>,
  slideIndex: number,
  pageSpec: PageSpec,
): Annotation | null {
  const margin = config.margin || 20;
  let x = 0;
  let y = 0;

  switch (config.position) {
    case 'bottom-right':
      x = pageSpec.widthPt - config.width - margin;
      y = pageSpec.heightPt - config.height - margin;
      break;
    case 'bottom-left':
      x = margin;
      y = pageSpec.heightPt - config.height - margin;
      break;
    case 'top-right':
      x = pageSpec.widthPt - config.width - margin;
      y = margin;
      break;
    case 'top-left':
      x = margin;
      y = margin;
      break;
  }

  return {
    id: `slide-logo-${slideIndex}`,
    storyBlockId: '__brand_logo__',
    pageIndex: slideIndex,
    type: 'rect',
    x,
    y,
    width: config.width,
    height: config.height,
    fillColor: '#e5e7eb',
    strokeWidth: 0,
    borderRadius: 4,
    zIndex: 8,
  } as ShapeAnnotation;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 CHART RENDERING (Data-Driven)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Render a data-driven chart as a set of annotations.
 * Converts chart data into rect (bars) and text (labels) annotations.
 */
export function renderChart(
  chartData: ChartData,
  region: SlideRegion,
  slideIndex: number,
): Annotation[] {
  const annotations: Annotation[] = [];
  const prefix = `slide-${slideIndex}-chart-${region.id}`;

  switch (chartData.type) {
    case 'bar':
      return renderBarChart(chartData, region, slideIndex, prefix);
    case 'donut':
      return renderDonutChart(chartData, region, slideIndex, prefix);
    case 'stacked-bar':
      return renderStackedBarChart(chartData, region, slideIndex, prefix);
    default:
      // Fallback placeholder
      annotations.push({
        id: `${prefix}-fallback`,
        storyBlockId: '__chart__',
        pageIndex: slideIndex,
        type: 'text',
        text: `[${chartData.type} chart]`,
        x: region.x + region.width / 2 - 50,
        y: region.y + region.height / 2 - 10,
        width: 100,
        height: 20,
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        zIndex: 5,
      } as TextAnnotation);
  }

  return annotations;
}

function renderBarChart(
  data: ChartData,
  region: SlideRegion,
  slideIndex: number,
  prefix: string,
): Annotation[] {
  const annotations: Annotation[] = [];
  const chartPad = 40;
  const chartX = region.x + chartPad;
  const chartY = region.y + chartPad;
  const chartW = region.width - chartPad * 2;
  const chartH = region.height - chartPad * 2 - 20; // -20 for labels

  // Find max value for scaling
  const allValues = data.datasets.flatMap(d => d.data);
  const maxVal = Math.max(...allValues, 1);

  const groupCount = data.labels.length;
  const barCount = data.datasets.length;
  const groupWidth = chartW / groupCount;
  const barWidth = (groupWidth * 0.7) / barCount;
  const groupGap = groupWidth * 0.3;

  // Render bars
  for (let g = 0; g < groupCount; g++) {
    for (let d = 0; d < barCount; d++) {
      const value = data.datasets[d].data[g] || 0;
      const barH = (value / maxVal) * chartH;
      const barX = chartX + g * groupWidth + groupGap / 2 + d * barWidth;
      const barY = chartY + chartH - barH;

      annotations.push({
        id: `${prefix}-bar-${g}-${d}`,
        storyBlockId: '__chart__',
        pageIndex: slideIndex,
        type: 'rect',
        x: barX,
        y: barY,
        width: barWidth - 2,
        height: barH,
        fillColor: data.datasets[d].color,
        strokeWidth: 0,
        zIndex: 5,
      } as ShapeAnnotation);

      // Data label
      if (data.showDataLabels) {
        annotations.push({
          id: `${prefix}-dlabel-${g}-${d}`,
          storyBlockId: '__chart__',
          pageIndex: slideIndex,
          type: 'text',
          text: String(value),
          x: barX - 5,
          y: barY - 16,
          width: barWidth + 10,
          height: 14,
          fontSize: 9,
          color: '#333333',
          textAlign: 'center',
          zIndex: 6,
        } as TextAnnotation);
      }
    }

    // Category label
    annotations.push({
      id: `${prefix}-clabel-${g}`,
      storyBlockId: '__chart__',
      pageIndex: slideIndex,
      type: 'text',
      text: data.labels[g],
      x: chartX + g * groupWidth,
      y: chartY + chartH + 4,
      width: groupWidth,
      height: 16,
      fontSize: 10,
      color: '#555555',
      textAlign: 'center',
      zIndex: 6,
    } as TextAnnotation);
  }

  // Chart title
  if (data.title) {
    annotations.push({
      id: `${prefix}-title`,
      storyBlockId: '__chart__',
      pageIndex: slideIndex,
      type: 'text',
      text: data.title,
      x: region.x,
      y: region.y + 5,
      width: region.width,
      height: 24,
      fontSize: 16,
      color: '#111111',
      textAlign: 'center',
      zIndex: 6,
    } as TextAnnotation);
  }

  return annotations;
}

function renderDonutChart(
  data: ChartData,
  region: SlideRegion,
  slideIndex: number,
  prefix: string,
): Annotation[] {
  const annotations: Annotation[] = [];
  // Donut charts require SVG arcs — for now render as a circle with labels
  const cx = region.x + region.width / 2;
  const cy = region.y + region.height / 2;
  const radius = Math.min(region.width, region.height) / 2 - 20;

  // Outer circle
  annotations.push({
    id: `${prefix}-donut-outer`,
    storyBlockId: '__chart__',
    pageIndex: slideIndex,
    type: 'circle',
    x: cx - radius,
    y: cy - radius,
    width: radius * 2,
    height: radius * 2,
    fillColor: data.datasets[0]?.color || '#3b82f6',
    strokeWidth: 0,
    zIndex: 5,
  } as ShapeAnnotation);

  // Inner circle (to make donut)
  const innerR = radius * 0.6;
  annotations.push({
    id: `${prefix}-donut-inner`,
    storyBlockId: '__chart__',
    pageIndex: slideIndex,
    type: 'circle',
    x: cx - innerR,
    y: cy - innerR,
    width: innerR * 2,
    height: innerR * 2,
    fillColor: '#ffffff',
    strokeWidth: 0,
    zIndex: 6,
  } as ShapeAnnotation);

  // Percentage labels
  const total = data.datasets.reduce((sum, ds) => sum + (ds.data[0] || 0), 0);
  let labelY = region.y + 10;
  for (const ds of data.datasets) {
    const pct = total > 0 ? Math.round((ds.data[0] / total) * 100) : 0;
    annotations.push({
      id: `${prefix}-donut-label-${ds.label}`,
      storyBlockId: '__chart__',
      pageIndex: slideIndex,
      type: 'text',
      text: `${ds.label}: ${pct}%`,
      x: region.x + region.width - 100,
      y: labelY,
      width: 90,
      height: 16,
      fontSize: 11,
      color: ds.color,
      textAlign: 'right',
      zIndex: 7,
    } as TextAnnotation);
    labelY += 20;
  }

  return annotations;
}

function renderStackedBarChart(
  data: ChartData,
  region: SlideRegion,
  slideIndex: number,
  prefix: string,
): Annotation[] {
  const annotations: Annotation[] = [];
  const chartPad = 20;
  const barHeight = 30;
  const barY = region.y + region.height / 2 - barHeight / 2;
  const chartX = region.x + chartPad;
  const chartW = region.width - chartPad * 2;

  // Sum all values for proportional widths
  const total = data.datasets.reduce((sum, ds) => sum + (ds.data[0] || 0), 0);
  let currentX = chartX;

  for (const ds of data.datasets) {
    const segW = total > 0 ? (ds.data[0] / total) * chartW : 0;
    annotations.push({
      id: `${prefix}-seg-${ds.label}`,
      storyBlockId: '__chart__',
      pageIndex: slideIndex,
      type: 'rect',
      x: currentX,
      y: barY,
      width: segW,
      height: barHeight,
      fillColor: ds.color,
      strokeWidth: 0,
      zIndex: 5,
    } as ShapeAnnotation);

    // Label inside segment
    if (segW > 40) {
      const pct = total > 0 ? Math.round((ds.data[0] / total) * 100) : 0;
      annotations.push({
        id: `${prefix}-seg-label-${ds.label}`,
        storyBlockId: '__chart__',
        pageIndex: slideIndex,
        type: 'text',
        text: `${pct}%`,
        x: currentX,
        y: barY + 7,
        width: segW,
        height: 16,
        fontSize: 12,
        color: '#ffffff',
        textAlign: 'center',
        zIndex: 6,
      } as TextAnnotation);
    }

    currentX += segW;
  }

  return annotations;
}
