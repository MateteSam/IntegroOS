/**
 * 📑 TOC Engine — WCCCS Publishing Engine
 *
 * Generates a professional Table of Contents with:
 * - Multi-level entries (Chapter → Section → Subsection)
 * - Live page numbers that update on every reflow
 * - Dot leaders between title and page number
 * - Styled output as annotations for the compositor
 */

import { TocEntry, PageSpec, ComposedPage } from './compositionEngine';
import { ParagraphStyle, StyleSheet } from './typographyEngine';
import { Annotation, TextAnnotation, Bookmark } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 TOC CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface TocOptions {
  title: string;            // "Contents", "Table of Contents", etc.
  maxLevel: number;         // Max nesting depth (1 = chapters only, 2 = +sections)
  dotLeaders: boolean;      // Show dot leaders between title and page number
  includePageNumbers: boolean;
  startOnNewPage: boolean;
  indentPerLevel: number;   // pt indent per nesting level
}

export const DEFAULT_TOC_OPTIONS: TocOptions = {
  title: 'Contents',
  maxLevel: 2,
  dotLeaders: true,
  includePageNumbers: true,
  startOnNewPage: true,
  indentPerLevel: 18,
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TOC GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate TOC annotations that can be placed on pages.
 * Returns an array of annotations representing the TOC.
 */
export function generateTocAnnotations(
  entries: TocEntry[],
  styleSheet: StyleSheet,
  pageSpec: PageSpec,
  tocPageIndex: number, // Which page the TOC starts on
  options: TocOptions = DEFAULT_TOC_OPTIONS,
): { annotations: TextAnnotation[]; pagesUsed: number } {
  const annotations: TextAnnotation[] = [];
  const filteredEntries = entries.filter(e => e.level <= options.maxLevel);

  if (filteredEntries.length === 0) {
    return { annotations: [], pagesUsed: 0 };
  }

  // Content area
  const isRecto = tocPageIndex % 2 === 0;
  const leftMargin = isRecto ? pageSpec.margins.inner : pageSpec.margins.outer;
  const rightMargin = isRecto ? pageSpec.margins.outer : pageSpec.margins.inner;
  const contentWidth = pageSpec.widthPt - leftMargin - rightMargin;
  const contentHeight = pageSpec.heightPt - pageSpec.margins.top - pageSpec.margins.bottom;

  // TOC Title
  const titleStyle = styleSheet.styles['toc-title'] || styleSheet.styles['heading-1'];
  const titleHeight = titleStyle.fontSize * titleStyle.lineHeight + titleStyle.marginTop + titleStyle.marginBottom;

  const titleAnn: TextAnnotation = {
    id: `toc-title`,
    storyBlockId: '__toc__',
    pageIndex: tocPageIndex,
    type: 'text',
    text: options.title,
    x: leftMargin,
    y: pageSpec.margins.top + titleStyle.marginTop,
    width: contentWidth,
    height: titleHeight - titleStyle.marginTop,
    fontSize: titleStyle.fontSize,
    color: titleStyle.color,
    fontFamily: titleStyle.fontFamily as any,
    lineHeight: titleStyle.lineHeight,
    zIndex: 10,
  };
  annotations.push(titleAnn as any);

  // TOC Entries
  const entryStyle = styleSheet.styles['toc-entry'] || styleSheet.styles['body'];
  const entryLineHeight = entryStyle.fontSize * entryStyle.lineHeight;

  let cursorY = pageSpec.margins.top + titleHeight + 12;
  let currentTocPage = tocPageIndex;
  let pagesUsed = 1;

  for (const entry of filteredEntries) {
    // Check if we need a new page
    if (cursorY + entryLineHeight > pageSpec.heightPt - pageSpec.margins.bottom) {
      currentTocPage++;
      pagesUsed++;
      cursorY = pageSpec.margins.top;
    }

    const indent = (entry.level - 1) * options.indentPerLevel;
    const pageNumWidth = 30;
    const entryWidth = contentWidth - indent - (options.includePageNumbers ? pageNumWidth : 0);

    // Build entry text
    let entryText = entry.title;
    if (options.dotLeaders && options.includePageNumbers) {
      // Dot leaders will be rendered via CSS or text styling — for now use plain format
      entryText = entry.title;
    }

    // Entry title
    const entryAnn: TextAnnotation = {
      id: `toc-entry-${entry.blockId}`,
      storyBlockId: entry.blockId,
      pageIndex: currentTocPage,
      type: 'text',
      text: entryText,
      x: leftMargin + indent,
      y: cursorY,
      width: entryWidth,
      height: entryLineHeight,
      fontSize: entry.level === 1 ? entryStyle.fontSize : entryStyle.fontSize - 1,
      color: entryStyle.color,
      fontFamily: entryStyle.fontFamily as any,
      lineHeight: entryStyle.lineHeight,
      zIndex: 10,
    };
    annotations.push(entryAnn as any);

    // Page number
    if (options.includePageNumbers) {
      const pageNumAnn: TextAnnotation = {
        id: `toc-pn-${entry.blockId}`,
        storyBlockId: entry.blockId,
        pageIndex: currentTocPage,
        type: 'text',
        text: entry.pageNumber,
        x: leftMargin + contentWidth - pageNumWidth,
        y: cursorY,
        width: pageNumWidth,
        height: entryLineHeight,
        fontSize: entryStyle.fontSize,
        color: entryStyle.color,
        fontFamily: entryStyle.fontFamily as any,
        textAlign: 'right',
        lineHeight: entryStyle.lineHeight,
        zIndex: 10,
      };
      annotations.push(pageNumAnn as any);
    }

    cursorY += entryLineHeight;
  }

  return { annotations, pagesUsed };
}

/**
 * Build bookmark list from TOC entries for PDF navigation.
 */
export function tocToBookmarks(entries: TocEntry[]): Bookmark[] {
  return entries.map(entry => ({
    title: entry.title.replace(/<[^>]*>/g, ''),
    pageIndex: entry.pageIndex,
  }));
}
