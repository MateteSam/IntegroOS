
export type FontFamily =
  | 'Helvetica'
  | 'Times-Roman'
  | 'Courier'
  | 'Roboto'
  | 'Open Sans'
  | 'Dancing Script'
  | 'Playfair Display'
  | 'Cinzel'
  | 'Cormorant Garamond'
  | 'Inter'
  | 'Merriweather'
  | 'EB Garamond'
  | 'Comic Neue'
  | 'Montserrat'
  | 'Oswald'
  | 'Raleway'
  | 'PT Serif'
  | 'Roboto Mono';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export type MainTab = 'jacket' | 'interior' | 'metadata' | 'check' | 'distribute' | 'analyze';

export type ProjectCategory = 'book' | 'slide' | 'newsletter' | 'report' | 'proposal' | 'devotional';

export type StoryBlockType = 'chapter' | 'heading' | 'paragraph' | 'quote' | 'image' | 'break' | 'note';

export interface BaseStoryBlock {
  id: string;
  type: StoryBlockType;
}

export interface TextStoryBlock extends BaseStoryBlock {
  type: 'chapter' | 'heading' | 'paragraph' | 'quote' | 'note';
  text: string;
  sectionRole?: 'day_num' | 'date' | 'bible_ref' | 'verse' | 'theme' | 'message' | 'prayer';
}

export interface ImageStoryBlock extends BaseStoryBlock {
  type: 'image';
  url: string; // Data URL or remote URL
  caption?: string;
  widthRatio?: number; // 0.1 to 1.0 (relative to content/column width)
  float?: 'none' | 'left' | 'right' | 'center'; // Text wrap positioning
  wrapMargin?: number; // Margin around image for text wrap in pt
}


export interface BreakStoryBlock extends BaseStoryBlock {
  type: 'break';
  breakType: 'page' | 'column';
}

export type StoryBlock = TextStoryBlock | ImageStoryBlock | BreakStoryBlock;

export interface Bookmark {
  title: string;
  pageIndex: number;
}

export interface BaseAnnotation {
  id: string;
  storyBlockId: string;
  groupId?: string;
  pageIndex: number;
  locked?: boolean;
  hidden?: boolean;
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  x: number;
  y: number;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  fontFamily?: FontFamily;
  textAlign?: TextAlign;
  verticalAlign?: VerticalAlign;
  autoWidth?: boolean;
  lineHeight?: number;
  letterSpacing?: number;
  textAlignLast?: 'left' | 'center' | 'right' | 'justify' | 'auto';
  width?: number;
  height?: number;
  backgroundColor?: string;
  backgroundColorOpacity?: number;
  textDecoration?: 'none' | 'underline';
  textGradient?: {
    start: string;
    end: string;
    angle: number;
  };
  continuation?: boolean;
  yOffset?: number; // Used for shifting continued text up
  rotation?: number;
}

export interface ImageAnnotation extends BaseAnnotation {
  type: 'image';
  fileType: 'image/png' | 'image/jpeg';
  imageBase64: string;
  width: number;
  height: number;
  borderRadius?: number;
  filter?: 'none' | 'grayscale' | 'sepia';
  // Canva-like enhancements
  objectFit?: 'cover' | 'contain' | 'fill';
  cropRect?: { x: number; y: number; width: number; height: number };
  shadow?: { offsetX: number; offsetY: number; blur: number; color: string };
  frameRotation?: number; // For rotated photo frames (gallery slides)
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'rect' | 'circle' | 'line';
  width: number;
  height: number;
  fillColor?: string;
  fillGradient?: {
    start: string;
    end: string;
    angle: number;
  };
  strokeColor?: string;
  strokeGradient?: {
    start: string;
    end: string;
    angle: number;
  };
  strokeWidth: number;
  borderRadius?: number;
}

export interface Asset {
  id: string;
  fileType: 'image/png' | 'image/jpeg';
  imageBase64: string;
  thumbnail: string;
  timestamp: number;
  isStock?: boolean;
}

export type Annotation = TextAnnotation | ImageAnnotation | ShapeAnnotation;

export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  pos: number;
}

export interface Contributor {
  name: string;
  role: string;
}

export interface BookMetadata {
  title: string;
  subtitle?: string;
  authors: string[];
  isbn?: string;
  issn?: string;
  publisher: string;
  imprint?: string;
  publicationDate?: string;
  bisacCodes: string[];
  keywords: string[];
  description?: string;
  language: string;
  copyrightYear?: string;
  pageCount?: number;
}

export interface DesignTheme {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    header: FontFamily;
    body: FontFamily;
  };
  imageryStyle: string;
}

export interface TypographyStyle {
  font: FontFamily;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  isUppercase: boolean;
  rotation?: number;
}

export interface JacketDesign {
  layoutTemplate: 'modern' | 'classic' | 'minimalist';

  title: TypographyStyle & { text: string };
  author: TypographyStyle & { text: string };
  subtitle?: TypographyStyle & { text: string };
  backCoverText?: TypographyStyle & { text: string };
  spineText?: TypographyStyle & { text: string };

  frontCoverUrl?: string;
  backCoverUrl?: string;
  spineUrl?: string;

  imageOptions?: {
    size?: 'cover' | 'contain';
    filter?: 'none' | 'grayscale' | 'sepia';
  };

  backgroundColor: string;
  overlayOpacity: number;
}

export interface ProjectData {
  version: number;
  pdfBase64: string;
  storyBlocks: StoryBlock[];
  annotations?: Annotation[];
  assets?: Asset[];
  guides?: Guide[];
  bookmarks?: Bookmark[];
  timestamp: number;
  settings?: DocumentSettings;
  metadata?: BookMetadata;
  designTheme?: DesignTheme;
  templateStyle?: TemplateStyle;
  jacketDesign?: JacketDesign;
  pageSize?: PageSize;
  category?: ProjectCategory;
  variables?: Record<string, string>;
}

export interface DocumentSettings {
  marginMm: number;
  bleedMm: number;
  cropMarkMm?: number;
  targetDpi: number;
  showCropMarks?: boolean;
  columnCount?: number;
  gutterMm?: number;
  columnRatios?: number[]; // e.g. [0.7, 0.3] for newsletters
}

export interface PreflightIssue {
  id: string;
  annotationId?: string;
  pageIndex: number;
  severity: 'error' | 'warning';
  message: string;
  type: 'margin' | 'dpi' | 'content' | 'contrast';
}

export interface PageSize {
  name: string;
  widthPt: number;
  heightPt: number;
  label: string;
}

export const PAGE_SIZES: PageSize[] = [
  { name: 'A4', widthPt: 595.28, heightPt: 841.89, label: 'A4 (210 x 297 mm)' },
  { name: 'Letter', widthPt: 612, heightPt: 792, label: 'Letter (8.5 x 11 in)' },
  { name: '6x9', widthPt: 432, heightPt: 648, label: 'Trade Novel (6 x 9 in)' },
  { name: 'A5', widthPt: 419.53, heightPt: 595.28, label: 'A5 (148 x 210 mm)' },
  { name: '5x8', widthPt: 360, heightPt: 576, label: 'Novel (5 x 8 in)' },
  { name: 'Slide_16_9', widthPt: 960, heightPt: 540, label: 'Presentation (16:9 HD)' },
  { name: 'Slide_4_3', widthPt: 720, heightPt: 540, label: 'Presentation (4:3 Standard)' },
];

export interface TemplateStyle {
  id: string;
  name: string;
  category: 'novel' | 'magazine' | 'academic' | 'children' | 'general' | 'devotional' | 'presentation';
  fontHeader: FontFamily;
  fontBody: FontFamily;
  fontSizeBody: number;
  lineHeight: number;
  columns: number;
  columnGapMm: number;
  marginMm: number;
  chapterStyle: 'simple' | 'sink' | 'line' | 'box';
  headerAlignment: 'left' | 'center' | 'right';
  description: string;
  thumbnailColor: string;
  generateTOC?: boolean;
  beginnerFriendly?: boolean;
  customizations?: string[]; // e.g., ['fontSize', 'colors', 'margins']
}



export interface LayoutTemplate {
  id: string;
  style: TemplateStyle;
  pageSize: PageSize;
}

// =====================================================
// PRESENTATION / SLIDE TYPES
// =====================================================

export interface SlideBackground {
  type: 'solid' | 'gradient' | 'image' | 'split';
  color?: string;
  gradient?: { start: string; end: string; angle: number };
  imageUrl?: string;
  imageBase64?: string;
  split?: { ratio: number; leftColor: string; rightColor: string };
  watermarkOpacity?: number;
  watermarkPattern?: 'none' | 'basotho' | 'geometric' | 'dots';
}

export interface SlideRegion {
  id: string;
  type: 'text' | 'image' | 'chart' | 'shape' | 'logo';
  x: number;
  y: number;
  width: number;
  height: number;
  placeholder?: string;   // "Title", "Body", "Image", "Logo"
  fontSize?: number;
  fontFamily?: FontFamily;
  color?: string;
  textAlign?: TextAlign;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  backgroundColor?: string;
  borderRadius?: number;
  rotation?: number;
}

export interface SlideLayout {
  id: string;
  name: string;            // "Title Split", "Two-Column", "Bar Chart", etc.
  regions: SlideRegion[];
  background: SlideBackground;
  brandLogo?: {            // Persistent brand logo placement
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    width: number;
    height: number;
    margin: number;
  };
}

export interface ChartDataset {
  label: string;
  data: number[];
  color: string;
}

export interface ChartData {
  type: 'bar' | 'donut' | 'stacked-bar' | 'line';
  title?: string;
  labels: string[];
  datasets: ChartDataset[];
  showLegend?: boolean;
  showDataLabels?: boolean;
}

// =====================================================
// CONTENT INTELLIGENCE TYPES
// =====================================================

export type ContentIssueSeverity = 'error' | 'warning' | 'info' | 'suggestion';
export type ContentIssueCategory =
  | 'grammar'
  | 'style'
  | 'consistency'
  | 'structure'
  | 'pacing'
  | 'voice'
  | 'formatting';

export interface ContentIssue {
  id: string;
  severity: ContentIssueSeverity;
  category: ContentIssueCategory;
  blockId?: string;
  pageIndex?: number;
  message: string;
  suggestion?: string;
  originalText?: string;
  suggestedText?: string;
  confidence: number; // 0-1
}

export interface ContentSuggestion {
  id: string;
  type: 'rewrite' | 'strengthen' | 'clarify' | 'expand' | 'condense' | 'restructure';
  blockId: string;
  originalText: string;
  suggestedText: string;
  rationale: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ManuscriptProfile {
  genre: string;
  subGenre?: string;
  tone: string;
  targetAudience: string;
  readingLevel: 'children' | 'young_adult' | 'adult' | 'academic';
  pacing: 'fast' | 'moderate' | 'slow' | 'varied';
  narrativeStyle: 'first_person' | 'third_person_limited' | 'third_person_omniscient' | 'second_person';
  themes: string[];
  confidence: number;
}

export interface ManuscriptAnalysis {
  profile: ManuscriptProfile;
  wordCount: number;
  chapterCount: number;
  estimatedReadingTime: number; // minutes
  averageWordsPerChapter: number;
  healthScore: number; // 0-100
  issues: ContentIssue[];
  suggestions: ContentSuggestion[];
  recommendedTemplates: string[];
}

// =====================================================
// ENHANCED TEMPLATE STYLING
// =====================================================

export interface ChapterOpeningStyle {
  sinkDepth: number; // percentage of page height (0-50)
  dropCapEnabled: boolean;
  dropCapLines: number; // 2-5
  dropCapFont?: FontFamily;
  ornamentBefore?: 'none' | 'line' | 'flourish' | 'diamond' | 'stars';
  ornamentAfter?: 'none' | 'line' | 'flourish' | 'diamond' | 'stars';
  titleCase: 'uppercase' | 'titlecase' | 'normal';
  titleSpacing: number; // letter-spacing in pt
}

export interface BlockQuoteStyle {
  indentLeft: number; // mm
  indentRight: number; // mm
  fontStyle: 'italic' | 'normal';
  fontSize: number; // relative to body (0.8-1.2)
  borderLeft: boolean;
  borderColor?: string;
}

export interface HeaderFooterStyle {
  showOnChapterPages: boolean;
  headerPosition: 'left' | 'center' | 'right' | 'alternating';
  headerContent: 'title' | 'author' | 'chapter' | 'none';
  footerPosition: 'left' | 'center' | 'right' | 'alternating';
  footerContent: 'page_number' | 'none';
  pageNumberStyle: 'arabic' | 'roman' | 'bracketed' | 'dash';
  font?: FontFamily;
  fontSize: number;
}

export interface SectionBreakStyle {
  type: 'blank_line' | 'asterisks' | 'ornament' | 'line';
  ornamentCharacter?: string;
  spacing: number; // lines before and after
}

export interface EnhancedTemplateStyle extends TemplateStyle {
  chapterOpening: ChapterOpeningStyle;
  blockQuote: BlockQuoteStyle;
  headerFooter: HeaderFooterStyle;
  sectionBreak: SectionBreakStyle;
  paragraphIndent: number; // first line indent in mm
  paragraphSpacing: number; // space between paragraphs in pt
  hyphenation: boolean;
  justification: 'left' | 'justify' | 'right' | 'center';
}

// =====================================================
// IMPORT/EXPORT TYPES
// =====================================================

export type ImportFormat = 'pdf' | 'docx' | 'epub' | 'html' | 'markdown' | 'rtf' | 'txt';
export type ExportFormat = 'pdf' | 'epub' | 'html' | 'docx' | 'onix';

export interface ImportResult {
  success: boolean;
  storyBlocks: StoryBlock[];
  metadata?: Partial<BookMetadata>;
  warnings: string[];
  errors: string[];
  originalFormat: ImportFormat;
  pageCount?: number;
  wordCount?: number;
}

export interface ExportOptions {
  format: ExportFormat;
  includeBleed: boolean;
  includeCropMarks: boolean;
  embedFonts: boolean;
  imageQuality: 'web' | 'print' | 'maximum';
  colorProfile: 'rgb' | 'cmyk';
}

export interface EPUBOptions {
  version: '2.0' | '3.0';
  reflowable: boolean;
  includeCover: boolean;
  generateTOC: boolean;
  embedFonts: boolean;
  accessibility: boolean;
  language: string;
}

// =====================================================
// ENHANCED TEMPLATE DEFINITIONS
// =====================================================

export const ENHANCED_TEMPLATE_STYLES: EnhancedTemplateStyle[] = [
  {
    id: 'novel-classic',
    name: 'Classic Novel',
    category: 'novel',
    description: 'Timeless serif typography with generous margins, elegant drop caps, and chapter sinks. Perfect for literary fiction, historical novels, and memoirs.',
    fontHeader: 'Playfair Display',
    fontBody: 'Times-Roman',
    fontSizeBody: 11.5,
    lineHeight: 1.5,
    columns: 1,
    columnGapMm: 0,
    marginMm: 22,
    chapterStyle: 'sink',
    headerAlignment: 'center',
    thumbnailColor: '#f3e8d2',
    generateTOC: true,
    chapterOpening: {
      sinkDepth: 33,
      dropCapEnabled: true,
      dropCapLines: 3,
      dropCapFont: 'Playfair Display',
      ornamentBefore: 'none',
      ornamentAfter: 'flourish',
      titleCase: 'uppercase',
      titleSpacing: 3
    },
    blockQuote: {
      indentLeft: 15,
      indentRight: 15,
      fontStyle: 'italic',
      fontSize: 1.0,
      borderLeft: false
    },
    headerFooter: {
      showOnChapterPages: false,
      headerPosition: 'alternating',
      headerContent: 'title',
      footerPosition: 'center',
      footerContent: 'page_number',
      pageNumberStyle: 'arabic',
      fontSize: 9
    },
    sectionBreak: {
      type: 'asterisks',
      ornamentCharacter: '* * *',
      spacing: 2
    },
    paragraphIndent: 5,
    paragraphSpacing: 0,
    hyphenation: true,
    justification: 'justify'
  },
  {
    id: 'magazine-modern',
    name: 'Modern Magazine',
    category: 'magazine',
    description: 'Bold headers, dual columns, and high contrast. Ideal for articles, anthologies, and mixed media content.',
    fontHeader: 'Roboto',
    fontBody: 'Open Sans',
    fontSizeBody: 10,
    lineHeight: 1.4,
    columns: 2,
    columnGapMm: 6,
    marginMm: 15,
    chapterStyle: 'line',
    headerAlignment: 'left',
    thumbnailColor: '#e0e7ff',
    generateTOC: true,
    chapterOpening: {
      sinkDepth: 0,
      dropCapEnabled: true,
      dropCapLines: 4,
      dropCapFont: 'Roboto',
      ornamentBefore: 'line',
      ornamentAfter: 'none',
      titleCase: 'uppercase',
      titleSpacing: 2
    },
    blockQuote: {
      indentLeft: 0,
      indentRight: 0,
      fontStyle: 'normal',
      fontSize: 1.2,
      borderLeft: true,
      borderColor: '#4f46e5'
    },
    headerFooter: {
      showOnChapterPages: true,
      headerPosition: 'left',
      headerContent: 'chapter',
      footerPosition: 'right',
      footerContent: 'page_number',
      pageNumberStyle: 'arabic',
      fontSize: 8
    },
    sectionBreak: {
      type: 'line',
      spacing: 1
    },
    paragraphIndent: 0,
    paragraphSpacing: 8,
    hyphenation: false,
    justification: 'left'
  },
  {
    id: 'poetry-elegant',
    name: 'Elegant Poetry',
    category: 'general',
    description: 'Airy, centered layout with delicate typography. Designed for anthologies, verse collections, and contemplative works.',
    fontHeader: 'Dancing Script',
    fontBody: 'Playfair Display',
    fontSizeBody: 12,
    lineHeight: 1.8,
    columns: 1,
    columnGapMm: 0,
    marginMm: 35,
    chapterStyle: 'simple',
    headerAlignment: 'center',
    thumbnailColor: '#fdf2f8',
    generateTOC: false,
    chapterOpening: {
      sinkDepth: 40,
      dropCapEnabled: false,
      dropCapLines: 0,
      ornamentBefore: 'flourish',
      ornamentAfter: 'none',
      titleCase: 'titlecase',
      titleSpacing: 1
    },
    blockQuote: {
      indentLeft: 20,
      indentRight: 20,
      fontStyle: 'italic',
      fontSize: 1.0,
      borderLeft: false
    },
    headerFooter: {
      showOnChapterPages: false,
      headerPosition: 'center',
      headerContent: 'none',
      footerPosition: 'center',
      footerContent: 'page_number',
      pageNumberStyle: 'roman',
      font: 'Dancing Script',
      fontSize: 10
    },
    sectionBreak: {
      type: 'ornament',
      ornamentCharacter: '❧',
      spacing: 3
    },
    paragraphIndent: 0,
    paragraphSpacing: 12,
    hyphenation: false,
    justification: 'left'
  },
  {
    id: 'scifi-terminal',
    name: 'Terminal / Sci-Fi',
    category: 'novel',
    description: 'Stark, monospaced headers with high-contrast positioning. For futuristic, dystopian, or tech-themed novels.',
    fontHeader: 'Courier',
    fontBody: 'Helvetica',
    fontSizeBody: 10.5,
    lineHeight: 1.45,
    columns: 1,
    columnGapMm: 0,
    marginMm: 18,
    chapterStyle: 'box',
    headerAlignment: 'right',
    thumbnailColor: '#1e293b',
    generateTOC: true,
    chapterOpening: {
      sinkDepth: 15,
      dropCapEnabled: false,
      dropCapLines: 0,
      ornamentBefore: 'none',
      ornamentAfter: 'line',
      titleCase: 'uppercase',
      titleSpacing: 4
    },
    blockQuote: {
      indentLeft: 10,
      indentRight: 0,
      fontStyle: 'normal',
      fontSize: 0.9,
      borderLeft: true,
      borderColor: '#22c55e'
    },
    headerFooter: {
      showOnChapterPages: true,
      headerPosition: 'right',
      headerContent: 'chapter',
      footerPosition: 'left',
      footerContent: 'page_number',
      pageNumberStyle: 'bracketed',
      font: 'Courier',
      fontSize: 9
    },
    sectionBreak: {
      type: 'line',
      spacing: 2
    },
    paragraphIndent: 0,
    paragraphSpacing: 6,
    hyphenation: false,
    justification: 'left'
  },
  {
    id: 'children-storybook',
    name: 'Storybook',
    category: 'children',
    description: 'Large, playful text with centered alignment. Designed for picture books, early readers, and children\'s stories.',
    fontHeader: 'Dancing Script',
    fontBody: 'Roboto',
    fontSizeBody: 16,
    lineHeight: 1.7,
    columns: 1,
    columnGapMm: 0,
    marginMm: 20,
    chapterStyle: 'box',
    headerAlignment: 'center',
    thumbnailColor: '#fce7f3',
    generateTOC: false,
    chapterOpening: {
      sinkDepth: 20,
      dropCapEnabled: true,
      dropCapLines: 2,
      dropCapFont: 'Dancing Script',
      ornamentBefore: 'stars',
      ornamentAfter: 'stars',
      titleCase: 'titlecase',
      titleSpacing: 0
    },
    blockQuote: {
      indentLeft: 10,
      indentRight: 10,
      fontStyle: 'italic',
      fontSize: 1.0,
      borderLeft: false
    },
    headerFooter: {
      showOnChapterPages: false,
      headerPosition: 'center',
      headerContent: 'none',
      footerPosition: 'center',
      footerContent: 'none',
      pageNumberStyle: 'arabic',
      fontSize: 12
    },
    sectionBreak: {
      type: 'ornament',
      ornamentCharacter: '✦',
      spacing: 2
    },
    paragraphIndent: 0,
    paragraphSpacing: 16,
    hyphenation: false,
    justification: 'left'
  },
  {
    id: 'academic-clean',
    name: 'Academic Paper',
    category: 'academic',
    description: 'Structured, clean layout with numbered sections. Best for textbooks, dissertations, and research papers.',
    fontHeader: 'Helvetica',
    fontBody: 'Times-Roman',
    fontSizeBody: 11,
    lineHeight: 1.5,
    columns: 1,
    columnGapMm: 0,
    marginMm: 25,
    chapterStyle: 'simple',
    headerAlignment: 'left',
    thumbnailColor: '#f1f5f9',
    generateTOC: true,
    chapterOpening: {
      sinkDepth: 0,
      dropCapEnabled: false,
      dropCapLines: 0,
      ornamentBefore: 'none',
      ornamentAfter: 'none',
      titleCase: 'normal',
      titleSpacing: 0
    },
    blockQuote: {
      indentLeft: 20,
      indentRight: 20,
      fontStyle: 'normal',
      fontSize: 0.95,
      borderLeft: false
    },
    headerFooter: {
      showOnChapterPages: true,
      headerPosition: 'alternating',
      headerContent: 'title',
      footerPosition: 'center',
      footerContent: 'page_number',
      pageNumberStyle: 'arabic',
      fontSize: 10
    },
    sectionBreak: {
      type: 'blank_line',
      spacing: 1
    },
    paragraphIndent: 8,
    paragraphSpacing: 0,
    hyphenation: true,
    justification: 'justify'
  },
  {
    id: 'business-modern',
    name: 'Modern Business',
    category: 'general',
    description: 'Clean, professional sans-serif design for non-fiction, manuals, self-help, and business guides.',
    fontHeader: 'Roboto',
    fontBody: 'Open Sans',
    fontSizeBody: 11,
    lineHeight: 1.55,
    columns: 1,
    columnGapMm: 0,
    marginMm: 22,
    chapterStyle: 'line',
    headerAlignment: 'left',
    thumbnailColor: '#dbeafe',
    generateTOC: true,
    chapterOpening: {
      sinkDepth: 25,
      dropCapEnabled: false,
      dropCapLines: 0,
      ornamentBefore: 'none',
      ornamentAfter: 'line',
      titleCase: 'titlecase',
      titleSpacing: 1
    },
    blockQuote: {
      indentLeft: 15,
      indentRight: 0,
      fontStyle: 'italic',
      fontSize: 1.0,
      borderLeft: true,
      borderColor: '#3b82f6'
    },
    headerFooter: {
      showOnChapterPages: false,
      headerPosition: 'left',
      headerContent: 'chapter',
      footerPosition: 'right',
      footerContent: 'page_number',
      pageNumberStyle: 'arabic',
      fontSize: 9
    },
    sectionBreak: {
      type: 'blank_line',
      spacing: 2
    },
    paragraphIndent: 0,
    paragraphSpacing: 10,
    hyphenation: false,
    justification: 'left'
  },
  {
    id: 'textbook-dense',
    name: 'Reference / Textbook',
    category: 'academic',
    description: 'Information-dense two-column layout with traditional serif fonts. For encyclopedias, reference guides, and technical documentation.',
    fontHeader: 'Times-Roman',
    fontBody: 'Times-Roman',
    fontSizeBody: 9.5,
    lineHeight: 1.3,
    columns: 2,
    columnGapMm: 5,
    marginMm: 12,
    chapterStyle: 'line',
    headerAlignment: 'left',
    thumbnailColor: '#fff7ed',
    generateTOC: true,
    chapterOpening: {
      sinkDepth: 0,
      dropCapEnabled: true,
      dropCapLines: 2,
      dropCapFont: 'Times-Roman',
      ornamentBefore: 'line',
      ornamentAfter: 'none',
      titleCase: 'uppercase',
      titleSpacing: 2
    },
    blockQuote: {
      indentLeft: 8,
      indentRight: 8,
      fontStyle: 'italic',
      fontSize: 0.9,
      borderLeft: false
    },
    headerFooter: {
      showOnChapterPages: true,
      headerPosition: 'alternating',
      headerContent: 'chapter',
      footerPosition: 'alternating',
      footerContent: 'page_number',
      pageNumberStyle: 'arabic',
      fontSize: 8
    },
    sectionBreak: {
      type: 'line',
      spacing: 1
    },
    paragraphIndent: 4,
    paragraphSpacing: 2,
    hyphenation: true,
    justification: 'justify'
  },
  {
    id: 'simple-novel',
    name: 'Simple Novel',
    category: 'novel',
    description: 'Beginner-friendly basic novel template with minimal styling and easy customizations.',
    fontHeader: 'Helvetica',
    fontBody: 'Times-Roman',
    fontSizeBody: 12,
    lineHeight: 1.5,
    columns: 1,
    columnGapMm: 0,
    marginMm: 20,
    chapterStyle: 'simple',
    headerAlignment: 'center',
    thumbnailColor: '#f0f0f0',
    generateTOC: true,
    beginnerFriendly: true,
    customizations: ['fontSize', 'margins'],
    chapterOpening: {
      sinkDepth: 0,
      dropCapEnabled: false,
      dropCapLines: 0,
      ornamentBefore: 'none',
      ornamentAfter: 'none',
      titleCase: 'titlecase',
      titleSpacing: 0
    },
    blockQuote: {
      indentLeft: 10,
      indentRight: 10,
      fontStyle: 'italic',
      fontSize: 1.0,
      borderLeft: false
    },
    headerFooter: {
      showOnChapterPages: false,
      headerPosition: 'center',
      headerContent: 'none',
      footerPosition: 'center',
      footerContent: 'page_number',
      pageNumberStyle: 'arabic',
      fontSize: 10
    },
    sectionBreak: {
      type: 'blank_line',
      spacing: 1
    },
    paragraphIndent: 5,
    paragraphSpacing: 0,
    hyphenation: true,
    justification: 'justify'
  },
  {
    id: 'picture-book',
    name: 'Picture Book',
    category: 'children',
    description: 'Beginner-friendly template optimized for illustrated stories with large images and simple text layouts.',
    fontHeader: 'Dancing Script',
    fontBody: 'Open Sans',
    fontSizeBody: 18,
    lineHeight: 1.8,
    columns: 1,
    columnGapMm: 0,
    marginMm: 25,
    chapterStyle: 'simple',
    headerAlignment: 'center',
    thumbnailColor: '#ffe4e6',
    generateTOC: false,
    beginnerFriendly: true,
    customizations: ['fontSize', 'colors', 'margins'],
    chapterOpening: {
      sinkDepth: 10,
      dropCapEnabled: true,
      dropCapLines: 2,
      ornamentBefore: 'stars',
      ornamentAfter: 'stars',
      titleCase: 'titlecase',
      titleSpacing: 0
    },
    blockQuote: {
      indentLeft: 15,
      indentRight: 15,
      fontStyle: 'italic',
      fontSize: 1.1,
      borderLeft: false
    },
    headerFooter: {
      showOnChapterPages: false,
      headerPosition: 'center',
      headerContent: 'none',
      footerPosition: 'center',
      footerContent: 'none',
      pageNumberStyle: 'arabic',
      fontSize: 12
    },
    sectionBreak: {
      type: 'ornament',
      ornamentCharacter: '✦',
      spacing: 3
    },
    paragraphIndent: 0,
    paragraphSpacing: 20,
    hyphenation: false,
    justification: 'center'
  },
  {
    id: 'blog-to-book',
    name: 'Blog to Book',
    category: 'general',
    description: 'Beginner-friendly template for converting blog posts to books, with prominent headings and flexible sections.',
    fontHeader: 'Roboto',
    fontBody: 'Open Sans',
    fontSizeBody: 11,
    lineHeight: 1.6,
    columns: 1,
    columnGapMm: 0,
    marginMm: 18,
    chapterStyle: 'line',
    headerAlignment: 'left',
    thumbnailColor: '#e0f2fe',
    generateTOC: true,
    beginnerFriendly: true,
    customizations: ['fontSize', 'colors'],
    chapterOpening: {
      sinkDepth: 15,
      dropCapEnabled: false,
      dropCapLines: 0,
      ornamentBefore: 'line',
      ornamentAfter: 'none',
      titleCase: 'uppercase',
      titleSpacing: 1
    },
    blockQuote: {
      indentLeft: 20,
      indentRight: 0,
      fontStyle: 'italic',
      fontSize: 1.0,
      borderLeft: true,
      borderColor: '#0ea5e9'
    },
    headerFooter: {
      showOnChapterPages: true,
      headerPosition: 'left',
      headerContent: 'chapter',
      footerPosition: 'right',
      footerContent: 'page_number',
      pageNumberStyle: 'arabic',
      fontSize: 9
    },
    sectionBreak: {
      type: 'blank_line',
      spacing: 2
    },
    paragraphIndent: 0,
    paragraphSpacing: 8,
    hyphenation: false,
    justification: 'left'
  },
  {
    id: 'sovereign-devotional',
    name: 'Sovereign Devotional',
    category: 'devotional',
    description: 'Luxurious, sacred design for daily devotionals and spiritual guides. Features elegant typography and golden fleurons.',
    fontHeader: 'Playfair Display',
    fontBody: 'Playfair Display',
    fontSizeBody: 11,
    lineHeight: 1.7,
    columns: 1,
    columnGapMm: 0,
    marginMm: 25,
    chapterStyle: 'simple',
    headerAlignment: 'center',
    thumbnailColor: '#fffcf5',
    generateTOC: true,
    chapterOpening: {
      sinkDepth: 20,
      dropCapEnabled: true,
      dropCapLines: 3,
      dropCapFont: 'Dancing Script',
      ornamentBefore: 'flourish',
      ornamentAfter: 'none',
      titleCase: 'uppercase',
      titleSpacing: 2
    },
    blockQuote: {
      indentLeft: 15,
      indentRight: 15,
      fontStyle: 'italic',
      fontSize: 1.1,
      borderLeft: false
    },
    headerFooter: {
      showOnChapterPages: true,
      headerPosition: 'center',
      headerContent: 'chapter',
      footerPosition: 'center',
      footerContent: 'page_number',
      pageNumberStyle: 'bracketed',
      fontSize: 9
    },
    sectionBreak: {
      type: 'ornament',
      ornamentCharacter: '✧ ✦ ✧',
      spacing: 4
    },
    paragraphIndent: 0,
    paragraphSpacing: 15,
    hyphenation: false,
    justification: 'justify'
  }
];

export const TEMPLATE_STYLES = ENHANCED_TEMPLATE_STYLES;
