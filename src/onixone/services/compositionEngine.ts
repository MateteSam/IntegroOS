/**
 * 📐 Composition Engine — WCCCS Publishing Engine
 *
 * The beating heart of the platform. A smart reflow engine that:
 * - Flows text across pages with widow/orphan control
 * - Keeps headings with their following paragraphs
 * - Generates running headers/footers and page numbers
 * - Supports recto/verso (left/right) page awareness
 * - Handles columns, image wrapping, and section breaks
 * - Updates the TOC automatically on every reflow
 */

import { StoryBlock, TextStoryBlock, ImageStoryBlock, BreakStoryBlock, Annotation, TextAnnotation, ImageAnnotation, PageSize, DocumentSettings, BookMetadata, Bookmark } from '../types';
import {
  ParagraphStyle,
  StyleSheet,
  createStyleSheet,
  getLineHeightPt,
  ptToPx,
  mmToPt,
} from './typographyEngine';
import { composePresentation } from './slideCompositionEngine';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PageSpec {
  widthPt: number;
  heightPt: number;
  margins: MarginSet;
  columns: number;
  columnGapPt: number;
}

export interface MarginSet {
  top: number;     // pt
  bottom: number;  // pt
  inner: number;   // pt (gutter side)
  outer: number;   // pt
}

export interface ComposedPage {
  pageIndex: number;
  pageNumber: string;           // "i", "ii", "1", "2", etc.
  numberingStyle: 'roman' | 'arabic' | 'none';
  section: 'front-matter' | 'body' | 'back-matter';
  isRecto: boolean;             // right page (odd numbered)
  runningHeaderLeft?: string;
  runningHeaderRight?: string;
  annotations: Annotation[];
}

export interface CompositionResult {
  pages: ComposedPage[];
  totalPages: number;
  annotations: Annotation[];    // flat list of all annotations
  bookmarks: Bookmark[];
  tocEntries: TocEntry[];
  warnings: string[];
}

export interface TocEntry {
  level: number;                // 1 = chapter, 2 = section, etc.
  title: string;
  pageIndex: number;
  pageNumber: string;
  blockId: string;
}

export interface CompositionOptions {
  pageSpec: PageSpec;
  styleSheet: StyleSheet;
  metadata: BookMetadata;
  category: string;
  genre?: string;
  generateTOC: boolean;
  generateFrontMatter: boolean;
  generateBackMatter: boolean;
  showRunningHeaders: boolean;
  showPageNumbers: boolean;
  startPageOnRecto: boolean;    // chapters start on right page
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 DEFAULT OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function createDefaultPageSpec(pageSize: PageSize, docSettings: DocumentSettings): PageSpec {
  const marginPt = mmToPt(docSettings.marginMm || 20);

  return {
    widthPt: pageSize.widthPt || 419.53,
    heightPt: pageSize.heightPt || 595.28,
    margins: {
      top: marginPt + 20,       // extra for running header
      bottom: marginPt + 15,    // extra for page number
      inner: marginPt + 10,     // extra gutter for binding
      outer: marginPt,
    },
    columns: docSettings.columnCount || 1,
    columnGapPt: mmToPt(docSettings.gutterMm || 5),
  };
}

export function createCompositionOptions(
  pageSize: PageSize,
  docSettings: DocumentSettings,
  metadata: BookMetadata,
  category: string,
  options?: Partial<CompositionOptions>,
): CompositionOptions {
  const pageSpec = createDefaultPageSpec(pageSize, docSettings);
  const styleSheet = createStyleSheet(category);

  // Derive genre from project category
  const genreMap: Record<string, string> = {
    slide: 'presentation',
    devotional: 'devotional',
  };
  const genre = genreMap[category] || category;

  if (genre === 'devotional') {
    // Exact margins from PDF analysis: body text at x=42-48pt, bottom at y~53pt
    // Continuation pages: top at y~50pt from page top
    pageSpec.margins.top = 50;      // Continuation pages start body at ~50pt from top
    pageSpec.margins.bottom = 45;   // Body goes down to ~y=53 (from bottom), footer at y=27
    pageSpec.margins.inner = 48;    // PDF: left page body at x=48, right page at x=42
    pageSpec.margins.outer = 42;    // Outer edge margin
  } else if (genre === 'presentation') {
    // Presentations use zero margins — content is positioned absolutely
    pageSpec.margins.top = 0;
    pageSpec.margins.bottom = 0;
    pageSpec.margins.inner = 0;
    pageSpec.margins.outer = 0;
    pageSpec.columns = 1;
  }

  return {
    pageSpec,
    styleSheet,
    metadata,
    category,
    genre,
    generateTOC: false,
    generateFrontMatter: options?.generateFrontMatter ?? false,
    generateBackMatter: options?.generateBackMatter ?? false,
    showRunningHeaders: options?.showRunningHeaders ?? true,
    showPageNumbers: options?.showPageNumbers ?? true,
    startPageOnRecto: options?.startPageOnRecto ?? true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 CONTENT AREA CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getContentArea(spec: PageSpec, isRecto: boolean) {
  const leftMargin = isRecto ? spec.margins.inner : spec.margins.outer;
  const rightMargin = isRecto ? spec.margins.outer : spec.margins.inner;

  return {
    x: leftMargin,
    y: spec.margins.top,
    width: spec.widthPt - leftMargin - rightMargin,
    height: spec.heightPt - spec.margins.top - spec.margins.bottom,
  };
}

function getColumnWidth(contentWidth: number, columns: number, gapPt: number): number {
  if (columns <= 1) return contentWidth;
  return (contentWidth - (gapPt * (columns - 1))) / columns;
}

function getColumnX(contentX: number, columnIndex: number, columnWidth: number, gapPt: number): number {
  return contentX + columnIndex * (columnWidth + gapPt);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TEXT MEASUREMENT (Approximate)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate the height of a text block when rendered in a given width.
 * Uses character-based estimation with font metrics.
 * This is an approximation — the browser will do the final rendering.
 */
function estimateTextHeight(
  text: string,
  style: ParagraphStyle,
  columnWidthPt: number,
): number {
  if (!text.trim()) return style.fontSize * style.lineHeight;

  // Normalize block breaks into newlines
  const normalized = text
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '') // Strip remaining tags like <strong>
    .trim();
    
  if (!normalized) return style.fontSize * style.lineHeight;

  // Average character width ratio (approximate per font category)
  const isSerif = ['EB Garamond', 'Merriweather', 'Cormorant Garamond', 'Playfair Display', 'Times-Roman', 'Cinzel'].includes(style.fontFamily);
  const charWidthRatio = isSerif ? 0.48 : 0.52; 
  const avgCharWidthPt = style.fontSize * charWidthRatio;

  // Available width after indent
  const effectiveWidth = columnWidthPt - (style.textIndent || 0);
  const charsPerLine = Math.max(1, Math.floor(effectiveWidth / avgCharWidthPt));

  const paragraphs = normalized.split('\n');
  let totalLineCount = 0;

  for (const p of paragraphs) {
    if (!p.trim()) {
      totalLineCount++; // Empty line
      continue;
    }
    
    // Estimate line count for this paragraph
    const words = p.trim().split(/\s+/);
    let currentLineLength = 0;
    let lineCount = 1;

    for (const word of words) {
      const wordLength = word.length;
      if (currentLineLength + wordLength + 1 > charsPerLine && currentLineLength > 0) {
        lineCount++;
        currentLineLength = wordLength;
        // After first line, use full width
      } else {
        currentLineLength += (currentLineLength > 0 ? 1 : 0) + wordLength;
      }
    }
    totalLineCount += lineCount;
  }

  const lineHeightPt = style.fontSize * style.lineHeight;
  const textHeight = totalLineCount * lineHeightPt;
  const totalHeight = style.marginTop + textHeight + style.marginBottom;

  return totalHeight;
}

/**
 * Estimate lines of text that fit in a given height.
 */
function linesInHeight(heightPt: number, style: ParagraphStyle): number {
  const lineHeightPt = style.fontSize * style.lineHeight;
  return Math.floor((heightPt - style.marginTop) / lineHeightPt);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 SMART REFLOW ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The main composition function. Takes story blocks and produces
 * a complete set of composed pages with annotations.
 */
export function compose(
  storyBlocks: StoryBlock[],
  options: CompositionOptions,
): CompositionResult {
  // Route presentations to the dedicated slide engine
  if (options.genre === 'presentation') {
    return composePresentation(storyBlocks, options);
  }

  const { pageSpec, styleSheet, metadata } = options;
  const pages: ComposedPage[] = [];
  const allAnnotations: Annotation[] = [];
  const bookmarks: Bookmark[] = [];
  const tocEntries: TocEntry[] = [];
  const warnings: string[] = [];

  // Current position state
  let currentPageIndex = 0;
  let currentColumn = 0;
  let cursorY = 0;  // Y position within current content area
  let isRecto = true;
  let currentChapterTitle = metadata.title || '';
  let arabicPageNum = 1;

  // Helper: create a new page
  function newPage(section: ComposedPage['section'] = 'body'): ComposedPage {
    const pageIndex = pages.length;
    isRecto = pageIndex % 2 === 0; // Even index = recto (right page in spread)

    let pageNumber: string;
    let numberingStyle: ComposedPage['numberingStyle'] = 'arabic';

    if (section === 'front-matter') {
      pageNumber = toRoman(pageIndex + 1);
      numberingStyle = 'roman';
    } else if (section === 'back-matter') {
      pageNumber = String(arabicPageNum++);
    } else {
      pageNumber = String(arabicPageNum++);
    }

    const page: ComposedPage = {
      pageIndex,
      pageNumber,
      numberingStyle,
      section,
      isRecto,
      runningHeaderLeft: isRecto ? undefined : currentChapterTitle,
      runningHeaderRight: isRecto ? metadata.title : undefined,
      annotations: [],
    };

    pages.push(page);
    currentPageIndex = pageIndex;
    currentColumn = 0;

    // Reset cursor to top of content area
    const content = getContentArea(pageSpec, isRecto);
    cursorY = content.y;

    return page;
  }

  // Start with first page
  let currentPage = newPage('body');

  // Helper: get remaining height on current page/column
  function getRemainingHeight(): number {
    const content = getContentArea(pageSpec, isRecto);
    return (content.y + content.height) - cursorY;
  }

  // Helper: resolve style for a story block
  function resolveStyle(block: StoryBlock): ParagraphStyle {
    const styles = styleSheet.styles;
    switch (block.type) {
      case 'chapter': return styles['heading-1'] || styles['body'];
      case 'heading': return styles['heading-2'] || styles['body'];
      case 'paragraph': return styles['body'];
      case 'quote': return styles['quote'] || styles['body'];
      case 'note': return styles['footnote'] || styles['body'];
      default: return styles['body'];
    }
  }

  // Process each story block
  for (let i = 0; i < storyBlocks.length; i++) {
    const block = storyBlocks[i];

    // === CHAPTER / HEADING ===
    if (block.type === 'chapter' || block.type === 'heading') {
      const textBlock = block as TextStoryBlock;
      const style = resolveStyle(block);

      // Chapters start on new page (optionally recto)
      if (block.type === 'chapter') {
        if (currentPageIndex > 0 || cursorY > getContentArea(pageSpec, isRecto).y + 10) {
          currentPage = newPage('body');

          // If startPageOnRecto and we landed on verso, add blank page
          if (options.startPageOnRecto && !isRecto) {
            currentPage = newPage('body');
          }
        }
        currentChapterTitle = textBlock.text.replace(/<[^>]*>/g, '');
        currentPage.runningHeaderLeft = isRecto ? undefined : currentChapterTitle;
      }

      // Keep-with-next: check if heading + first paragraph fit
      const headingHeight = estimateTextHeight(textBlock.text, style, getColumnWidth(
        getContentArea(pageSpec, isRecto).width, pageSpec.columns, pageSpec.columnGapPt
      ));
      const remaining = getRemainingHeight();

      // If heading doesn't fit, go to next page
      if (headingHeight > remaining && cursorY > getContentArea(pageSpec, isRecto).y + 20) {
        currentPage = newPage('body');
      }

      // Place the heading
      const content = getContentArea(pageSpec, isRecto);
      const colWidth = getColumnWidth(content.width, pageSpec.columns, pageSpec.columnGapPt);
      const colX = getColumnX(content.x, currentColumn, colWidth, pageSpec.columnGapPt);

      const annotation: TextAnnotation = {
        id: `comp-${block.id}`,
        storyBlockId: block.id,
        pageIndex: currentPageIndex,
        type: 'text',
        text: textBlock.text,
        x: colX,
        y: cursorY + style.marginTop,
        width: colWidth,
        height: headingHeight - style.marginTop,
        fontSize: style.fontSize,
        color: style.color,
        fontFamily: style.fontFamily as any,
        textAlign: style.textAlign,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        zIndex: 10,
      };

      allAnnotations.push(annotation);
      currentPage.annotations.push(annotation);

      // Add to TOC
      if (block.type === 'chapter') {
        tocEntries.push({
          level: 1,
          title: textBlock.text.replace(/<[^>]*>/g, ''),
          pageIndex: currentPageIndex,
          pageNumber: currentPage.pageNumber,
          blockId: block.id,
        });
        bookmarks.push({
          title: textBlock.text.replace(/<[^>]*>/g, ''),
          pageIndex: currentPageIndex,
        });
      } else {
        tocEntries.push({
          level: 2,
          title: textBlock.text.replace(/<[^>]*>/g, ''),
          pageIndex: currentPageIndex,
          pageNumber: currentPage.pageNumber,
          blockId: block.id,
        });
      }

      cursorY += headingHeight;
      continue;
    }

    // === PARAGRAPH / QUOTE / NOTE / DEVOTIONAL ===
    if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'note') {
      const textBlock = block as TextStoryBlock;

      // Smart Devotional Auto-Tagger
      if (options.genre === 'devotional' && !textBlock.sectionRole) {
         const t = textBlock.text.trim();
         const lower = t.toLowerCase();
         if (lower.match(/^\d{1,2}(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/)) {
            textBlock.sectionRole = 'date';
         } else if (lower.match(/^acts\s+\d+$/) || lower.match(/^bible\s*:/) || t.match(/^[A-Z][a-z]+\s+\d+$/)) {
            textBlock.sectionRole = 'bible_ref';
         } else if (lower.match(/^acts\s+\d+:\d+/) || lower.match(/^\d+\s+[A-Z]/) || lower.match(/^[A-Z][a-z]+\s+\d+:\d+/)) {
            textBlock.sectionRole = 'verse';
         } else if (lower.match(/^(theme|topic)\b/i) || t === 'Look after what God committed to your trust') {
            textBlock.sectionRole = 'theme';
         } else if (lower.match(/^(message|devotion|reflection)\b/i) || t.startsWith('Whatever God has entrusted')) {
            textBlock.sectionRole = 'message';
         } else if (lower.match(/^(prayer|confession)/i) || t.startsWith('Father,') || t.startsWith('Lord,')) {
            textBlock.sectionRole = 'prayer';
         } else {
            textBlock.sectionRole = undefined;
         }
      }

      // --- DEVOTIONAL CUSTOM RULES ---
      if (options.genre === 'devotional' && textBlock.sectionRole) {
        const role = textBlock.sectionRole;
        const content = getContentArea(pageSpec, isRecto);
        const colWidth = getColumnWidth(content.width, pageSpec.columns, pageSpec.columnGapPt);
        const colX = getColumnX(content.x, currentColumn, colWidth, pageSpec.columnGapPt);

        if (role === 'date') {
          // PDF: Banner top y=523 (72pt from top), subtitle y=499 (96pt)
          const bannerHeight = 72;
          // Always start a new page and render the banner for each day
          if (currentPageIndex > 0) currentPage = newPage('body');
             
             // Top Banner Background
             const bannerRect = { id: `comp-ban-${block.id}`, storyBlockId: '__banner__', pageIndex: currentPageIndex, type: 'rect', x: 0, y: 0, width: pageSpec.widthPt, height: bannerHeight, fillColor: '#583832', zIndex: 1 } as any;
             
             // Pastor Photo — CIRCULAR, positioned on the left
             const circleSize = 60;
             const circleX = 20;
             const circleY = (bannerHeight - circleSize) / 2;
             const circle = { id: `comp-circ-${block.id}`, storyBlockId: '__banner__', pageIndex: currentPageIndex, type: 'circle', x: circleX, y: circleY, width: circleSize, height: circleSize, fillColor: '#8a6458', zIndex: 3 } as any;

             // Banner Title — PDF: fs=23.6, positioned right of photo
             const textStartX = circleX + circleSize + 10;
             const textWidth = pageSpec.widthPt - textStartX - 15;
             const pText = { id: `comp-pt-${block.id}`, storyBlockId: '__banner__', pageIndex: currentPageIndex, type: 'text', text: 'Parchments of truth', x: textStartX, y: 12, width: textWidth, height: 30, fontSize: 24, color: '#ffffff', fontFamily: 'Luminari Grandis, Playfair Display, serif', textAlign: 'center', lineHeight: 1, letterSpacing: 0.1, zIndex: 5 } as any;
             // Subtitle — PDF: fs=17.1
             const aText = { id: `comp-at-${block.id}`, storyBlockId: '__banner__', pageIndex: currentPageIndex, type: 'text', text: '- By Pastor Alex -', x: textStartX, y: 42, width: textWidth, height: 20, fontSize: 17, color: '#e8dbd1', fontFamily: 'Playfair Display', fontStyle: 'italic', textAlign: 'center', lineHeight: 1, zIndex: 5 } as any;
             
             allAnnotations.push(bannerRect, circle, pText, aText);
             currentPage.annotations.push(bannerRect, circle, pText, aText);
             cursorY = bannerHeight + 15; // reset below banner
          
          // PDF: date at y=463 = 132pt from top. After banner(72pt)+15 = 87pt. Need +45 gap
          cursorY += 45;
          const dHeight = 18;
          const cleanDate = textBlock.text.toUpperCase();
          // PDF: fs=12.3
          const dText = { id: `comp-d-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'text', text: cleanDate, x: colX, y: cursorY, width: colWidth, height: dHeight, fontSize: 12.3, color: '#2a2a2a', fontFamily: 'Playfair Display', textAlign: 'center', letterSpacing: 0.1, zIndex: 5 } as any;
          
          // Underline below date
          const lineW = colWidth * 0.4;
          const lineStartX = colX + (colWidth - lineW)/2;
          const dLine = { id: `comp-dl-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'line', x: lineStartX, y: cursorY + dHeight + 2, width: lineW, height: 1, strokeWidth: 1, strokeColor: '#2a2a2a', zIndex: 5 } as any;

          allAnnotations.push(dText, dLine);
          currentPage.annotations.push(dText, dLine);
          cursorY += dHeight + 15;  // PDF: bible_ref at y=434, date at y=463 → 29pt gap
          continue;
        }

        if (role === 'bible_ref') {
           const text = textBlock.text.replace(/^bible\s*:\s*/i, '');
           const bText = { id: `comp-br-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'text', text: `<b>Bible:</b> ${text}`, x: colX, y: cursorY, width: colWidth, height: 16, fontSize: 12, color: '#2a2a2a', fontFamily: 'Open Sans', textAlign: 'center', lineHeight: 1.4, zIndex: 5 } as any;
           
           if (cursorY + 40 > content.y + content.height) currentPage = newPage('body');
           
           allAnnotations.push(bText);
           currentPage.annotations.push(bText);
           cursorY += 24;
           
           // We store the Y coordinate so that the next block (the verse) can align the rotated "KEY VERSE" text with it
           (currentPage as any).lastBibleRefY = cursorY - 24;
           continue;
        }

        if (role === 'verse') {
           const vMatch = textBlock.text.match(/^(\d+)/);
           const vNum = vMatch ? vMatch[1] : '1';
           
           // PDF: verse at fs=12, full width x=42 to ~375
           const vStyle = { ...styleSheet.styles['body'], fontSize: 12, textAlign: 'center', color: '#333333' } as ParagraphStyle;
           const vHeight = estimateTextHeight(textBlock.text, vStyle, colWidth) * 1.05; 
           
           if (cursorY + vHeight + 40 > content.y + content.height) currentPage = newPage('body');

           // KEY VERSE rotated text — PDF: x=25, vertically centered alongside Bible ref + verse
           const refY = (currentPage as any).lastBibleRefY || cursorY - 20;
           const verseEndY = cursorY + vHeight;
           const kvCenterY = refY + (verseEndY - refY) / 2;
           
           const kV = { id: `comp-kv-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'text', text: `KEY VERSE: ${vNum}`, x: 5, y: kvCenterY + 30, width: 100, height: 14, fontSize: 9, color: '#000000', fontFamily: 'Open Sans', fontWeight: 'bold', letterSpacing: 0.1, rotation: -90, textAlign: 'center', zIndex: 5 } as any;
           
           // Verse text — full column width as in PDF
           const vText = { id: `comp-v-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'text', text: textBlock.text, x: colX, y: cursorY, width: colWidth, height: vHeight, fontSize: 12, color: '#333333', fontFamily: 'Open Sans', textAlign: 'center', lineHeight: 1.5, zIndex: 5 } as any;
           
           allAnnotations.push(kV, vText);
           currentPage.annotations.push(kV, vText);
           cursorY += vHeight + 20; // PDF: verse end at ~y380, theme at ~y364 → ~16pt gap
           continue;
        }

        if (role === 'theme') {
           const cleanTheme = textBlock.text.replace(/^theme\s*:\s*/i, '');
           // PDF: theme at fs=16
           const tStyle = { ...styleSheet.styles['body'], fontFamily: 'Playfair Display', fontSize: 16, textAlign: 'left', lineHeight: 1.4 } as ParagraphStyle;
           
           // Bracket graphic on the left
           const bracketWidth = 35;
           const tWidth = colWidth - bracketWidth - 10;
           
           const totalBlockWidth = tWidth + bracketWidth;
           const groupStartX = colX + (colWidth - totalBlockWidth) / 2;
           const tX = groupStartX + bracketWidth;
           
           const tHeight = estimateTextHeight(`Theme: ${cleanTheme}`, tStyle, tWidth) * 1.1;
           
           if (cursorY + tHeight + 40 > content.y + content.height) currentPage = newPage('body');
           
           const themeColor = '#b6642d';

           // Large left quote mark
           const qTop = { id: `comp-qt-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'text', text: '“', x: groupStartX - 5, y: cursorY - 12, width: 30, height: 35, fontSize: 40, color: themeColor, fontFamily: 'Playfair Display', fontWeight: 'bold', zIndex: 5 } as any;
           
           // Horizontal line from quote mark
           const lineTop = { id: `comp-tl-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'line', x: groupStartX + 20, y: cursorY + 5, width: tWidth * 0.5, height: 1.5, strokeWidth: 1.5, strokeColor: themeColor, zIndex: 5 } as any;
           
           // Vertical bracket line on the left
           const lineLeft = { id: `comp-tll-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'line', x: groupStartX - 2, y: cursorY + 12, width: 1, height: tHeight - 5, strokeWidth: 1.5, strokeColor: themeColor, zIndex: 5 } as any;
           
           // Theme text — fs=16 as per PDF
           const tText = { id: `comp-t-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'text', text: `Theme: ${cleanTheme}`, x: tX, y: cursorY + 10, width: tWidth, height: tHeight, fontSize: 16, color: themeColor, fontFamily: 'Playfair Display', fontStyle: 'italic', textAlign: 'left', lineHeight: 1.4, zIndex: 5 } as any;
           
           allAnnotations.push(qTop, lineTop, lineLeft, tText);
           currentPage.annotations.push(qTop, lineTop, lineLeft, tText);
           cursorY += tHeight + 30; // Tighter gap after theme
           continue;
        }

        if (role === 'message') {
           // Add a thin separator line above KEY MESSAGE
           const sepLine = { id: `comp-msep-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'line', x: colX + colWidth * 0.2, y: cursorY, width: colWidth * 0.6, height: 1, strokeWidth: 1, strokeColor: '#d0d0d0', zIndex: 5 } as any;
           allAnnotations.push(sepLine);
           currentPage.annotations.push(sepLine);
           cursorY += 12;

           const headingHeight = 24;
           if (cursorY + headingHeight + 40 > content.y + content.height) currentPage = newPage('body');
           const hText = { id: `comp-mh-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'text', text: 'KEY MESSAGE', x: colX, y: cursorY, width: colWidth, height: headingHeight, fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', fontFamily: 'Open Sans', textAlign: 'center', letterSpacing: 0.08, zIndex: 5 } as any;
           allAnnotations.push(hText);
           currentPage.annotations.push(hText);
           cursorY += headingHeight + 10;
           // DO NOT clear sectionRole — let it fall through to normal paragraph handler
           textBlock.sectionRole = undefined;
        }

        if (role === 'prayer') {
           const headingHeight = 30;
           const pStyle = { ...styleSheet.styles['body'], color: '#5a3d34', textAlign: 'center', fontSize: 11, fontFamily: 'Open Sans' } as ParagraphStyle;
           const pHeight = estimateTextHeight(textBlock.text, pStyle, colWidth) * 1.1;

           if (cursorY + headingHeight + pHeight + 30 > content.y + content.height) currentPage = newPage('body');
           
           const pHead = { id: `comp-ph-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'text', text: 'Prayers', x: colX, y: cursorY, width: colWidth, height: headingHeight, fontSize: 22, color: '#aa5c26', fontFamily: 'Playfair Display', textAlign: 'center', zIndex: 5 } as any;
           allAnnotations.push(pHead);
           currentPage.annotations.push(pHead);
           cursorY += headingHeight + 10;
           
           if (cursorY + pHeight + 40 > content.y + content.height) {
               // Fallback if it still overflows
               currentPage = newPage('body');
           }

           const pText = { id: `comp-p-${block.id}`, storyBlockId: block.id, pageIndex: currentPageIndex, type: 'text', text: textBlock.text, x: colX, y: cursorY, width: colWidth, height: pHeight, fontSize: 11, color: '#5a3d34', fontFamily: 'Open Sans', textAlign: 'center', lineHeight: 1.6, zIndex: 5 } as any;
           
           allAnnotations.push(pText);
           currentPage.annotations.push(pText);
           cursorY += pHeight + 20;
           continue;
        }
      }

      // Use body-first style for first paragraph after heading
      const prevBlock = i > 0 ? storyBlocks[i - 1] : null;
      const isFirstAfterHeading = prevBlock && (prevBlock.type === 'chapter' || prevBlock.type === 'heading');
      const styleKey = isFirstAfterHeading ? 'body-first' : block.type === 'quote' ? 'quote' : block.type === 'note' ? 'footnote' : 'body';
      const style = styleSheet.styles[styleKey] || styleSheet.styles['body'];

      const content = getContentArea(pageSpec, isRecto);
      const colWidth = getColumnWidth(content.width, pageSpec.columns, pageSpec.columnGapPt);

      // Body text — PDF shows NO extra padding, text goes to full column width
      const isDevotional = options.genre === 'devotional';
      const devPad = 0;  // PDF: body at x=42-48, same as margin — no extra padding
      
      const colX = getColumnX(content.x, currentColumn, colWidth, pageSpec.columnGapPt);
      const effectiveColWidth = colWidth - devPad;
      const effectiveColX = colX + (devPad / 2);

      const blockHeight = estimateTextHeight(textBlock.text, style, effectiveColWidth) * 1.1; // adding padding buffer to account for web rendering variations
      let remaining = getRemainingHeight();

      // If paragraph fits entirely, place it
      if (blockHeight <= remaining) {
        const annotation: TextAnnotation = {
          id: `comp-${block.id}`,
          storyBlockId: block.id,
          pageIndex: currentPageIndex,
          type: 'text',
          text: textBlock.text,
          x: effectiveColX,
          y: cursorY + style.marginTop,
          width: effectiveColWidth,
          height: blockHeight - style.marginTop - style.marginBottom,
          fontSize: style.fontSize,
          color: style.color,
          fontFamily: style.fontFamily as any,
          textAlign: style.textAlign,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          textAlignLast: style.textAlign === 'justify' ? 'left' : undefined,
          zIndex: 10,
        };

        allAnnotations.push(annotation);
        currentPage.annotations.push(annotation);
        cursorY += blockHeight;
      } else {
        // === TEXT OVERFLOW / CONTINUATION ===
        // The paragraph doesn't fit. We need to split it across pages.

        const lineHeightPt = style.fontSize * style.lineHeight;
        const totalLines = Math.ceil(blockHeight / lineHeightPt);
        const linesRemaining = Math.floor(remaining / lineHeightPt);

        // Widow/orphan check
        let linesToPlace = linesRemaining;
        if (linesToPlace < style.orphans && linesToPlace < totalLines) {
          // Too few lines would be orphaned — push entire block to next page
          linesToPlace = 0;
        }
        if (totalLines - linesToPlace < style.widows && linesToPlace > 0 && linesToPlace < totalLines) {
          // Too few lines would be widowed on next page — pull some back
          linesToPlace = Math.max(0, totalLines - style.widows);
        }

        if (linesToPlace > 0 && linesToPlace < totalLines) {
          // Place first portion
          const firstHeight = linesToPlace * lineHeightPt + style.marginTop;

          const annotation: TextAnnotation = {
            id: `comp-${block.id}`,
            storyBlockId: block.id,
            pageIndex: currentPageIndex,
            type: 'text',
            text: textBlock.text,
            x: effectiveColX,
            y: cursorY + style.marginTop,
            width: effectiveColWidth,
            height: firstHeight - style.marginTop,
            fontSize: style.fontSize,
            color: style.color,
            fontFamily: style.fontFamily as any,
            textAlign: style.textAlign,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            textAlignLast: style.textAlign === 'justify' ? 'left' : undefined,
            zIndex: 10,
          };

          allAnnotations.push(annotation);
          currentPage.annotations.push(annotation);

          // Continuation on next page
          currentPage = newPage('body');
          const newContent = getContentArea(pageSpec, isRecto);
          const newColXBase = getColumnX(newContent.x, 0, colWidth, pageSpec.columnGapPt);
          const newEffectiveColX = newColXBase + (devPad / 2);
          
          const continuationHeight = (totalLines - linesToPlace) * lineHeightPt + style.marginBottom;

          const continuation: TextAnnotation = {
            id: `comp-${block.id}-cont`,
            storyBlockId: block.id,
            pageIndex: currentPageIndex,
            type: 'text',
            text: textBlock.text,    // Full text — CSS overflow handles the split
            x: newEffectiveColX,
            y: cursorY,
            width: effectiveColWidth,
            height: continuationHeight,
            fontSize: style.fontSize,
            color: style.color,
            fontFamily: style.fontFamily as any,
            textAlign: style.textAlign,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            textAlignLast: style.textAlign === 'justify' ? 'left' : undefined,
            continuation: true,
            yOffset: linesToPlace * lineHeightPt,
            zIndex: 10,
          };

          allAnnotations.push(continuation);
          currentPage.annotations.push(continuation);
          cursorY += continuationHeight;
        } else {
          // Push entire block to next page
          currentPage = newPage('body');
          // Recurse — re-process this block on fresh page
          i--;
          continue;
        }
      }
      continue;
    }

    // === IMAGE BLOCK ===
    if (block.type === 'image') {
      const imgBlock = block as ImageStoryBlock;
      const content = getContentArea(pageSpec, isRecto);
      const colWidth = getColumnWidth(content.width, pageSpec.columns, pageSpec.columnGapPt);

      // Image dimensions
      const imgWidth = colWidth * (imgBlock.widthRatio || 0.8);
      const imgHeight = imgWidth * 0.6; // Default aspect ratio
      const remaining = getRemainingHeight();

      if (imgHeight > remaining) {
        currentPage = newPage('body');
      }

      const colX = getColumnX(getContentArea(pageSpec, isRecto).x, currentColumn, colWidth, pageSpec.columnGapPt);
      const imgX = colX + (colWidth - imgWidth) / 2; // centered

      const annotation: ImageAnnotation = {
        id: `comp-img-${block.id}`,
        storyBlockId: block.id,
        pageIndex: currentPageIndex,
        type: 'image',
        fileType: 'image/jpeg',
        imageBase64: imgBlock.url,
        x: imgX,
        y: cursorY + 6,
        width: imgWidth,
        height: imgHeight,
        zIndex: 5,
      };

      allAnnotations.push(annotation);
      currentPage.annotations.push(annotation);
      cursorY += imgHeight + 12;

      // Caption
      if (imgBlock.caption) {
        const capStyle = styleSheet.styles['caption'] || styleSheet.styles['body'];
        const capHeight = estimateTextHeight(imgBlock.caption, capStyle, colWidth);

        const capAnn: TextAnnotation = {
          id: `comp-cap-${block.id}`,
          storyBlockId: block.id,
          pageIndex: currentPageIndex,
          type: 'text',
          text: imgBlock.caption,
          x: colX,
          y: cursorY,
          width: colWidth,
          height: capHeight,
          fontSize: capStyle.fontSize,
          color: capStyle.color,
          fontFamily: capStyle.fontFamily as any,
          textAlign: 'center',
          lineHeight: capStyle.lineHeight,
          zIndex: 10,
        };

        allAnnotations.push(capAnn);
        currentPage.annotations.push(capAnn);
        cursorY += capHeight;
      }
      continue;
    }

    // === BREAK BLOCK ===
    if (block.type === 'break') {
      const breakBlock = block as BreakStoryBlock;
      if (breakBlock.breakType === 'page') {
        currentPage = newPage('body');
      } else if (breakBlock.breakType === 'column') {
        if (pageSpec.columns > 1 && currentColumn < pageSpec.columns - 1) {
          currentColumn++;
          cursorY = getContentArea(pageSpec, isRecto).y;
        } else {
          currentPage = newPage('body');
        }
      }
      continue;
    }
  }

  // === ADD PAGE NUMBERS ===
  // === ADD PAGE NUMBERS & DEVOTIONAL FOOTER ===
  if (options.showPageNumbers) {
    for (const page of pages) {
      if (page.numberingStyle === 'none') continue;

      const pnStyle = styleSheet.styles['page-number'] || styleSheet.styles['body'];
      const content = getContentArea(pageSpec, page.isRecto);

      if (options.genre === 'devotional') {
        // PDF: footer text at y=27 from bottom, page num at y=22 from bottom
        const footerTextY = pageSpec.heightPt - 27;
        const footerNumY = pageSpec.heightPt - 28;
        
        // Footer top line (separator)
        const fLine = {
          id: `comp-fline-${page.pageIndex}`,
          pageIndex: page.pageIndex,
          type: 'line',
          x: 0,
          y: footerTextY - 12,
          width: pageSpec.widthPt,
          height: 1,
          strokeWidth: 1,
          strokeColor: '#333333',
          zIndex: 10,
        } as any;
        
        // Left text — PDF: fs=6.2, x=92
        const fLeftText = {
          id: `comp-fltext-${page.pageIndex}`,
          pageIndex: page.pageIndex,
          type: 'text',
          text: 'PARCHMENTS OF TRUTH . | CHRISTIANMISSIONARIESASSEMBLY.ORG',
          x: 92,
          y: footerTextY,
          width: 260,
          height: 12,
          fontSize: 6.2,
          color: '#555555',
          fontFamily: 'Open Sans',
          textAlign: 'left',
          letterSpacing: 0.5,
          zIndex: 10,
        } as any;
        
        // Right text "Page X" — PDF: fs=12.1, x=351
        const fRightText = {
          id: `comp-fnum-${page.pageIndex}`,
          pageIndex: page.pageIndex,
          type: 'text',
          text: `Page ${page.pageNumber}`,
          x: 320,
          y: footerNumY,
          width: 80,
          height: 16,
          fontSize: 12.1,
          color: '#000000',
          fontFamily: 'Open Sans',
          textAlign: 'right',
          zIndex: 10,
        } as any;

        page.annotations.push(fLine, fLeftText, fRightText);
        allAnnotations.push(fLine, fLeftText, fRightText);
      } else {
        const pnAnn: TextAnnotation = {
          id: `pn-${page.pageIndex}`,
          storyBlockId: '__page-number__',
          pageIndex: page.pageIndex,
          type: 'text',
          text: page.pageNumber,
          x: page.isRecto ? content.x + content.width - 40 : content.x,
          y: pageSpec.heightPt - pageSpec.margins.bottom + 5,
          width: 40,
          height: 12,
          fontSize: pnStyle.fontSize,
          color: pnStyle.color || '#888888',
          fontFamily: pnStyle.fontFamily as any,
          textAlign: page.isRecto ? 'right' : 'left',
          lineHeight: 1,
          zIndex: 5,
        };

        allAnnotations.push(pnAnn);
        page.annotations.push(pnAnn);
      }
    }
  }

  // === ADD RUNNING HEADERS ===
  if (options.showRunningHeaders) {
    for (const page of pages) {
      // Skip first page of each chapter (which has the chapter title already)
      if (page.pageIndex === 0) continue;

      const rhStyle = styleSheet.styles['running-header'] || styleSheet.styles['body'];
      const content = getContentArea(pageSpec, page.isRecto);
      const headerText = page.isRecto ? page.runningHeaderRight : page.runningHeaderLeft;
      if (!headerText) continue;

      const rhAnn: TextAnnotation = {
        id: `rh-${page.pageIndex}`,
        storyBlockId: '__running-header__',
        pageIndex: page.pageIndex,
        type: 'text',
        text: headerText,
        x: content.x,
        y: pageSpec.margins.top - 18,
        width: content.width,
        height: 12,
        fontSize: rhStyle.fontSize,
        color: rhStyle.color || '#999999',
        fontFamily: rhStyle.fontFamily as any,
        textAlign: page.isRecto ? 'right' : 'left',
        lineHeight: 1,
        letterSpacing: rhStyle.letterSpacing,
        zIndex: 3,
      };

      allAnnotations.push(rhAnn);
      page.annotations.push(rhAnn);
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
// 🔢 ROMAN NUMERAL CONVERSION
// ═══════════════════════════════════════════════════════════════════════════════

function toRoman(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['m', 'cm', 'd', 'cd', 'c', 'xc', 'l', 'xl', 'x', 'ix', 'v', 'iv', 'i'];
  let result = '';
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  return result;
}
