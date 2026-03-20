import { useState, useEffect, useCallback, useRef } from 'react';
import { ProjectData, StoryBlock, TextStoryBlock, Annotation, DocumentSettings, PageSize, DesignTheme, JacketDesign, BookMetadata, ProjectCategory, Bookmark, TypographyStyle } from '../types';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import { ProjectHistoryService } from '../services/projectHistory';
import { compose, createCompositionOptions } from '../services/compositionEngine';
import { generateTocAnnotations } from '../services/tocEngine';
import { generateFrontMatter, generateBackMatter, DEFAULT_FRONT_MATTER, DEFAULT_BACK_MATTER } from '../services/frontBackMatter';
import { recommendVisualPersonality } from '../services/aiService';
import { generateDesignTheme } from '../services/enhancedAiService';
import { createPrintReadyPDF } from '../services/pdfService';
import { createBlankPDF } from '../services/pdfService';
import * as CoverAI from '../services/coverAI';

const MAX_HISTORY = 50;

interface HistorySnapshot {
  storyBlocks: StoryBlock[];
  customAnnotations: Annotation[];
}

export interface UseProjectReturn {
  pdfDoc: pdfjs.PDFDocumentProxy | undefined;
  numPages: number;
  storyBlocks: StoryBlock[];
  annotations: Annotation[];
  metadata: BookMetadata;
  docSettings: DocumentSettings;
  pageSize: PageSize;
  templateStyle: any; // Simplified
  jacketDesign: JacketDesign | null;
  designTheme: DesignTheme | null;
  variables: Record<string, string>;
  isLoading: boolean;
  isExporting: boolean;
  isGeneratingTheme: boolean;
  isGeneratingImages: boolean;
  selectedBlockId: string | null;
  inlineEditId: string | null;
  selectedJacketElement: any;
  activeJacketZone: 'front' | 'back' | 'spine';
  history: any[];
  historyStep: number;
  generatedImages: CoverAI.GeneratedCover[];
  bookHtml?: string;
  bookCss?: string;
  category: ProjectCategory;
  bookmarks: Bookmark[];
  customAnnotations: Annotation[];
  actions: {
    updateStoryBlocks: (update: (prev: StoryBlock[]) => StoryBlock[]) => void;
    updateVariables: (vars: Record<string, string>) => void;
    setSelectedBlockId: (id: string | null) => void;
    handleSaveProject: () => void;
    handleExport: () => void;
    undo: () => void;
    redo: () => void;
    setInlineEditId: (id: string | null) => void;
    handleGenerateTheme: () => void;
    handleAnalyzeManuscript: () => Promise<void>;
    handleGenerateImages: (options?: { zone?: 'front' | 'back' | 'spine', prompt?: string, useAnalysis?: boolean }) => void;
    setJacketDesign: (update: Partial<JacketDesign> | ((prev: JacketDesign | null) => JacketDesign | null)) => void;
    setActiveJacketZone: (zone: 'front' | 'back' | 'spine') => void;
    setSelectedJacketElement: (el: any) => void;
    updateJacketTypography: (el: any, style: any) => void;
    handleRecommendPersonality: () => void;
    setTotalPages: (pages: number) => void;
    addAnnotation: (ann: Annotation) => void;
    updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
    deleteAnnotation: (id: string) => void;
    setLayersOrder: (newOrder: string[]) => void;
  };
}

export const useProject = (initialData: ProjectData): UseProjectReturn => {
  const safeInitial: ProjectData = initialData ?? {
    version: 1,
    pdfBase64: '',
    storyBlocks: [],
    annotations: [],
    timestamp: Date.now(),
    settings: {
      marginMm: 20,
      bleedMm: 3.175,
      targetDpi: 300,
      cropMarkMm: 3.175,
      showCropMarks: true,
      columnCount: 1,
      gutterMm: 5
    },
    metadata: {
      title: 'Untitled Project',
      authors: [],
      publisher: '',
      bisacCodes: [],
      keywords: [],
      language: 'eng'
    }
  } as any;
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy>();
  const [numPages, setNumPages] = useState(0);
  const [storyBlocks, setStoryBlocks] = useState<StoryBlock[]>(safeInitial.storyBlocks || []);
  const [annotations, setAnnotations] = useState<Annotation[]>(safeInitial.annotations || []);
  const [metadata, setMetadata] = useState<BookMetadata>(safeInitial.metadata as BookMetadata);
  const initialDoc: DocumentSettings = {
    marginMm: safeInitial.settings?.marginMm ?? 20,
    bleedMm: safeInitial.settings?.bleedMm ?? 3.175,
    cropMarkMm: safeInitial.settings?.cropMarkMm ?? 3.175,
    targetDpi: safeInitial.settings?.targetDpi ?? 300,
    showCropMarks: safeInitial.settings?.showCropMarks ?? true,
    columnCount: safeInitial.settings?.columnCount ?? 1,
    gutterMm: safeInitial.settings?.gutterMm ?? 5
  };
  if ((safeInitial as any).templateStyle) {
    const tpl = (safeInitial as any).templateStyle;
    initialDoc.marginMm = tpl.marginMm ?? initialDoc.marginMm;
    initialDoc.columnCount = tpl.columns ?? initialDoc.columnCount;
    initialDoc.gutterMm = Math.max(0, tpl.columnGapMm ?? initialDoc.gutterMm);
  }
  const [docSettings, setDocSettings] = useState<DocumentSettings>(initialDoc);
  const [pageSize, setPageSize] = useState<PageSize>(safeInitial.pageSize || { widthPt: 595.28, heightPt: 841.89 });
  const [jacketDesign, setJacketDesign] = useState<JacketDesign | null>(safeInitial.jacketDesign || null);
  const [designTheme, setDesignTheme] = useState<DesignTheme | null>(null);

  // NEW: HTML Engine State
  const [bookHtml, setBookHtml] = useState<string>('');
  const [bookCss, setBookCss] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>((safeInitial as any).variables || {});
  const [customAnnotations, setCustomAnnotations] = useState<Annotation[]>((safeInitial as any).customAnnotations || []);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [selectedJacketElement, setSelectedJacketElement] = useState<any>(null);
  const [activeJacketZone, setActiveJacketZone] = useState<'front' | 'back' | 'spine'>('front');
  const [generatedImages, setGeneratedImages] = useState<CoverAI.GeneratedCover[]>([]);

  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const isUndoRedo = useRef(false);

  // Track history snapshots whenever storyBlocks or customAnnotations change
  useEffect(() => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }
    const snapshot: HistorySnapshot = {
      storyBlocks: storyBlocks.map(b => ({ ...b })),
      customAnnotations: customAnnotations.map(a => ({ ...a }) as Annotation),
    };
    setHistory(prev => {
      const trimmed = prev.slice(0, historyStep + 1);
      const next = [...trimmed, snapshot];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setHistoryStep(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [storyBlocks, customAnnotations]);

  // Auto-initialize Default Jacket if missing
  useEffect(() => {
    if (!jacketDesign) {
      setJacketDesign({
        layoutTemplate: 'modern',
        title: {
          text: metadata.title || 'Untitled',
          font: 'Playfair Display' as any,
          fontSize: 48,
          color: '#ffffff',
          textAlign: 'center',
          letterSpacing: 0,
          lineHeight: 1.1,
          isUppercase: false
        },
        author: {
          text: (metadata.authors && metadata.authors[0]) || 'Author Name',
          font: 'Inter' as any,
          fontSize: 18,
          color: '#ffffff',
          textAlign: 'center',
          letterSpacing: 2,
          lineHeight: 1.2,
          isUppercase: true
        },
        backgroundColor: '#0f172a',
        overlayOpacity: 0.1,
        imageOptions: { size: 'cover', filter: 'none' }
      });
    }
  }, [jacketDesign, metadata]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 📐 COMPOSITION ENGINE — Smart Reflow
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    try {
      const category = (safeInitial as any).category || 'book';
      const compositionOpts = createCompositionOptions(pageSize, docSettings, metadata, category);

      // Compose: front matter + body + back matter
      const frontBlocks = compositionOpts.generateFrontMatter
        ? generateFrontMatter(metadata, DEFAULT_FRONT_MATTER)
        : [];
      const backBlocks = compositionOpts.generateBackMatter
        ? generateBackMatter(metadata, DEFAULT_BACK_MATTER)
        : [];

      const allBlocks = [...frontBlocks, ...storyBlocks, ...backBlocks];
      const result = compose(allBlocks, compositionOpts);

      // Merge compositor annotations with user custom annotations
      setAnnotations([...result.annotations, ...customAnnotations]);
      setNumPages(result.totalPages || 1);
      setBookmarks(result.bookmarks);
    } catch (err) {
      console.error('Composition failed:', err);
      setAnnotations(customAnnotations);
      setNumPages(1);
    }
  }, [storyBlocks, pageSize, jacketDesign, metadata, docSettings, designTheme, variables, customAnnotations]);
  const actions = {
    setNumPages: (n: number) => setNumPages(n),
    setTotalPages: (n: number) => setNumPages(n),
    updateStoryBlocks: setStoryBlocks,
    updateVariables: setVariables,
    setSelectedBlockId,
    handleSaveProject: async () => {
      await ProjectHistoryService.saveProject({ ...initialData, storyBlocks, annotations, metadata, settings: docSettings, pageSize, jacketDesign, designTheme });
    },
    handleExport: async () => {
      setIsExporting(true);
      try {
        // Generate a blank PDF as the base document
        const basePdf = await createBlankPDF(pageSize, numPages || 1);
        const pdfBytes = await createPrintReadyPDF(
          basePdf,
          annotations,
          docSettings,
          bookmarks
        );
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${metadata.title || 'Untitled'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Export failed:', e);
        alert('Export failed. Please check the console for details.');
      } finally {
        setIsExporting(false);
      }
    },
    undo: () => {
      if (historyStep <= 0) return;
      const prevStep = historyStep - 1;
      const snapshot = history[prevStep];
      if (!snapshot) return;
      isUndoRedo.current = true;
      setStoryBlocks(snapshot.storyBlocks);
      setCustomAnnotations(snapshot.customAnnotations);
      setHistoryStep(prevStep);
    },
    redo: () => {
      if (historyStep >= history.length - 1) return;
      const nextStep = historyStep + 1;
      const snapshot = history[nextStep];
      if (!snapshot) return;
      isUndoRedo.current = true;
      setStoryBlocks(snapshot.storyBlocks);
      setCustomAnnotations(snapshot.customAnnotations);
      setHistoryStep(nextStep);
    },
    setInlineEditId,
    handleGenerateTheme: async () => {
      setIsGeneratingTheme(true);
      try {
        const fullText = storyBlocks
          .filter((b): b is TextStoryBlock => 'text' in b)
          .map(b => b.text.replace(/<[^>]*>/g, ''))
          .join('\n')
          .slice(0, 5000);
        if (!fullText.trim()) {
          alert('Add some content to your manuscript first so the AI can analyze it.');
          return;
        }
        const theme = await generateDesignTheme(fullText);
        setDesignTheme(theme);
      } catch (e) {
        console.error('Theme generation failed:', e);
      } finally {
        setIsGeneratingTheme(false);
      }
    },
    handleAnalyzeManuscript: async () => {
      setIsGeneratingImages(true);
      try {
        const fullText = storyBlocks
          .filter((b): b is TextStoryBlock => 'text' in b)
          .map(b => b.text.replace(/<[^>]*>/g, ''))
          .join('\n')
          .slice(0, 10000);

        const analysis = await CoverAI.analyzeManuscript(fullText);

        // Update metadata and jacket genre if they are empty
        if (!metadata.title || metadata.title === 'Untitled Project') {
          // We don't overwrite title usually, but we could suggest
        }

        setJacketDesign(prev => ({
          ...prev!,
          genre: analysis.suggestedGenre as any,
          backCoverText: prev?.backCoverText ? { ...prev.backCoverText, text: analysis.synopsis } : undefined
        }));

        // Store analysis in variables for prompt enrichment
        setVariables(prev => ({
          ...prev,
          narrative_synopsis: analysis.synopsis,
          visual_pillars: analysis.visualPillars.join(', ')
        }));

      } catch (e) {
        console.error("Manuscript analysis failed:", e);
      } finally {
        setIsGeneratingImages(false);
      }
    },
    handleGenerateImages: async (options?: { zone?: 'front' | 'back' | 'spine', prompt?: string, useAnalysis?: boolean }) => {
      setIsGeneratingImages(true);
      try {
        const { zone = 'front', prompt, useAnalysis } = options || {};
        const title = metadata.title || 'Untitled';
        const author = (metadata.authors && metadata.authors[0]) || 'Author Name';

        let finalSynopsis = '';
        let pillars = '';

        if (useAnalysis && variables.narrative_synopsis) {
          finalSynopsis = variables.narrative_synopsis;
          pillars = variables.visual_pillars;
        } else {
          // Extract fallback synopsis from story blocks
          finalSynopsis = storyBlocks
            .filter((b): b is TextStoryBlock => 'text' in b && b.text.length > 50)
            .slice(0, 3)
            .map(b => b.text.replace(/<[^>]*>/g, '').slice(0, 200))
            .join(' ');
        }

        const covers = await CoverAI.generateCovers({
          title,
          author,
          genre: (jacketDesign as any)?.genre || 'literary',
          synopsis: pillars ? `${finalSynopsis} Visual Pillars: ${pillars}` : finalSynopsis,
          customPrompt: prompt,
          zone,
          count: 6
        });

        setGeneratedImages(covers);
      } catch (e) {
        console.error("Sidebar generation failed:", e);
      } finally {
        setIsGeneratingImages(false);
      }
    },
    setJacketDesign: (update: Partial<JacketDesign> | ((prev: JacketDesign | null) => JacketDesign | null)) => {
      if (typeof update === 'function') {
        setJacketDesign(update);
      } else {
        setJacketDesign(prev => ({ ...prev!, ...update }));
      }
    },
    setActiveJacketZone,
    setSelectedJacketElement,
    updateJacketTypography: (element: string, style: Partial<TypographyStyle & { text: string }>) => {
      if (!jacketDesign) return;
      setJacketDesign(prev => {
        if (!prev) return prev;
        const key = element as keyof JacketDesign;
        if (key === 'title' || key === 'author' || key === 'subtitle') {
          return { ...prev, [key]: { ...((prev as any)[key] || {}), ...style } };
        }
        return prev;
      });
    },
    handleRecommendPersonality: async () => {
      setIsLoading(true);
      try {
        const personality = await recommendVisualPersonality(storyBlocks, (safeInitial as any).category || 'book');
        if (designTheme) {
          const updated: DesignTheme = {
            ...designTheme,
            palette: {
              ...designTheme.palette,
              primary: personality.colors.primary,
              secondary: personality.colors.secondary,
              accent: personality.colors.accent,
              background: personality.colors.bg,
              text: personality.colors.text
            },
            fonts: {
              ...designTheme?.fonts,
              heading: personality.fonts.header,
              body: personality.fonts.body
            }
          };
          setDesignTheme(updated);
        }
      } catch (e) {
        console.error("Failed to recommend personality", e);
      } finally {
        setIsLoading(false);
      }
    },
    // Layer Actions
    addAnnotation: (ann: Annotation) => setCustomAnnotations(prev => [...prev, ann]),
    updateAnnotation: (id: string, updates: Partial<Annotation>) => {
      // First check if it's a custom annotation
      if (customAnnotations.some(a => a.id === id)) {
        setCustomAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } as Annotation : a));
      } else {
        // If it's a reflowed annotation, we can still "mock" update it locally for this session
        // or we add a "userOverride" system. For now, let's treat it as transient if not in custom.
        setAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } as Annotation : a));
      }
    },
    deleteAnnotation: (id: string) => {
      setCustomAnnotations(prev => prev.filter(a => a.id !== id));
      setAnnotations(prev => prev.filter(a => a.id !== id));
    },
    setLayersOrder: (newOrder: string[]) => {
      // This is complex because we have two arrays.
      // For now, let's just update Z-index
      setCustomAnnotations(prev => {
        return prev.map(a => ({ ...a, zIndex: newOrder.indexOf(a.id) }));
      });
      setAnnotations(prev => {
        return prev.map(a => ({ ...a, zIndex: newOrder.indexOf(a.id) }));
      });
    }
  };

  return {
    pdfDoc, numPages, storyBlocks, annotations, metadata, docSettings, pageSize, templateStyle: (safeInitial as any).templateStyle || {}, jacketDesign, designTheme,
    isLoading, isExporting, isGeneratingTheme, isGeneratingImages,
    selectedBlockId, inlineEditId, selectedJacketElement, activeJacketZone,
    history, historyStep, generatedImages,
    bookHtml,
    bookCss,
    bookmarks,
    customAnnotations,
    variables,
    category: (safeInitial as any).category || 'book',
    actions
  };
};
