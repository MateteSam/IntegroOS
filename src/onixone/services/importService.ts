
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import { StoryBlock, TextStoryBlock, ImageStoryBlock, BookMetadata, ImportResult, ImportFormat } from '../types';
import { analyzeStructure, hasApiKey, parseBasicParagraphs } from './aiService';

// =====================================================
// FORMAT DETECTION
// =====================================================

export const detectFormat = (file: File): ImportFormat => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type.toLowerCase();

    if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
    if (extension === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (extension === 'doc' || mimeType === 'application/msword') return 'docx';
    if (extension === 'epub' || mimeType === 'application/epub+zip') return 'epub';
    if (extension === 'html' || extension === 'htm' || mimeType === 'text/html') return 'html';
    if (extension === 'md' || extension === 'markdown') return 'markdown';
    if (extension === 'rtf' || mimeType === 'application/rtf') return 'rtf';
    if (extension === 'txt' || mimeType === 'text/plain') return 'txt';

    return 'txt'; // Default fallback
};

// =====================================================
// MAIN IMPORT FUNCTION
// =====================================================

export const importDocument = async (file: File): Promise<ImportResult> => {
    const format = detectFormat(file);
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
        let storyBlocks: StoryBlock[] = [];
        let metadata: Partial<BookMetadata> | undefined;
        let pageCount: number | undefined;
        let wordCount = 0;

        switch (format) {
            case 'pdf':
                const pdfResult = await importPDF(file);
                storyBlocks = pdfResult.blocks;
                pageCount = pdfResult.pageCount;
                warnings.push(...pdfResult.warnings);
                break;

            case 'docx':
                const docxResult = await importDOCX(file);
                storyBlocks = docxResult.blocks;
                metadata = docxResult.metadata;
                break;

            case 'epub':
                const epubResult = await importEPUB(file);
                storyBlocks = epubResult.blocks;
                metadata = epubResult.metadata;
                break;

            case 'html':
                const htmlResult = await importHTML(file);
                storyBlocks = htmlResult.blocks;
                break;

            case 'markdown':
                const mdResult = await importMarkdown(file);
                storyBlocks = mdResult.blocks;
                metadata = mdResult.metadata;
                break;

            case 'rtf':
                const rtfResult = await importRTF(file);
                storyBlocks = rtfResult.blocks;
                break;

            case 'txt':
            default:
                const txtResult = await importTXT(file);
                storyBlocks = txtResult.blocks;
                break;
        }

        // Calculate word count
        wordCount = storyBlocks
            .filter((b): b is TextStoryBlock => 'text' in b)
            .reduce((sum, b) => sum + b.text.split(/\s+/).length, 0);

        return {
            success: true,
            storyBlocks,
            metadata,
            warnings,
            errors,
            originalFormat: format,
            pageCount,
            wordCount
        };
    } catch (error) {
        console.error('Import failed:', error);
        return {
            success: false,
            storyBlocks: [],
            warnings,
            errors: [error instanceof Error ? error.message : 'Unknown import error'],
            originalFormat: format
        };
    }
};

// =====================================================
// PDF IMPORT
// =====================================================

interface PDFImportResult {
    blocks: StoryBlock[];
    pageCount: number;
    warnings: string[];
}

export const importPDF = async (file: File): Promise<PDFImportResult> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const warnings: string[] = [];
    const allText: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .trim();

        if (pageText) {
            allText.push(pageText);
        }
    }

    // Use AI to structure the extracted text
    const fullText = allText.join('\n\n');
    let blocks: StoryBlock[];

    if (fullText.length > 100) {
        if (hasApiKey()) {
            try {
                blocks = await analyzeStructure(fullText);
            } catch {
                warnings.push('AI structure analysis failed, using basic paragraph detection');
                blocks = parseBasicParagraphs(fullText);
            }
        } else {
            warnings.push('No AI API key present — using basic paragraph detection');
            blocks = parseBasicParagraphs(fullText);
        }
    } else {
        blocks = parseBasicParagraphs(fullText);
    }

    return {
        blocks,
        pageCount: pdf.numPages,
        warnings
    };
};

// =====================================================
// DOCX IMPORT
// =====================================================

interface DOCXImportResult {
    blocks: StoryBlock[];
    metadata?: Partial<BookMetadata>;
}

export const importDOCX = async (file: File): Promise<DOCXImportResult> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    // Try AI structure analysis first when an API key is available
    let blocks: StoryBlock[];
    if (hasApiKey()) {
        try {
            blocks = await analyzeStructure(result.value);
        } catch {
            blocks = parseBasicParagraphs(result.value);
        }
    } else {
        blocks = parseBasicParagraphs(result.value);
    }

    // Extract title from first paragraph if it looks like a title
    let metadata: Partial<BookMetadata> | undefined;
    if (blocks.length > 0 && blocks[0].type === 'chapter') {
        metadata = {
            title: (blocks[0] as TextStoryBlock).text
        };
    }

    return { blocks, metadata };
};

// =====================================================
// EPUB IMPORT
// =====================================================

interface EPUBImportResult {
    blocks: StoryBlock[];
    metadata?: Partial<BookMetadata>;
}

export const importEPUB = async (file: File): Promise<EPUBImportResult> => {
    // EPUB is a ZIP file containing XHTML content
    // We'll use JSZip to extract it
    const arrayBuffer = await file.arrayBuffer();

    try {
        // Dynamic import of JSZip
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(arrayBuffer);

        const blocks: StoryBlock[] = [];
        const metadata: Partial<BookMetadata> = {};

        // Find and parse content.opf for metadata
        const opfFile = Object.keys(zip.files).find(name => name.endsWith('.opf'));
        if (opfFile) {
            const opfContent = await zip.files[opfFile].async('string');
            const parser = new DOMParser();
            const doc = parser.parseFromString(opfContent, 'application/xml');

            const title = doc.querySelector('title')?.textContent;
            const creator = doc.querySelector('creator')?.textContent;
            const description = doc.querySelector('description')?.textContent;

            if (title) metadata.title = title;
            if (creator) metadata.authors = [creator];
            if (description) metadata.description = description;
        }

        // Find and parse XHTML content files
        const xhtmlFiles = Object.keys(zip.files)
            .filter(name => name.endsWith('.xhtml') || name.endsWith('.html'))
            .sort();

        for (const xhtmlFile of xhtmlFiles) {
            const content = await zip.files[xhtmlFile].async('string');
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');

            // Extract headings as chapters
            doc.querySelectorAll('h1, h2').forEach(heading => {
                blocks.push({
                    id: `epub-chapter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'chapter',
                    text: heading.textContent?.trim() || ''
                } as TextStoryBlock);
            });

            // Extract paragraphs
            doc.querySelectorAll('p').forEach(p => {
                const text = p.textContent?.trim();
                if (text && text.length > 0) {
                    blocks.push({
                        id: `epub-para-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'paragraph',
                        text
                    } as TextStoryBlock);
                }
            });
        }

        return { blocks, metadata };
    } catch (error) {
        console.error('EPUB import error:', error);
        // Fallback: treat as plain text
        const text = await file.text();
        return { blocks: parseBasicParagraphs(text) };
    }
};

// =====================================================
// HTML IMPORT
// =====================================================

interface HTMLImportResult {
    blocks: StoryBlock[];
}

export const importHTML = async (file: File): Promise<HTMLImportResult> => {
    const content = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const blocks: StoryBlock[] = [];

    // Process headings
    doc.querySelectorAll('h1').forEach(h => {
        blocks.push({
            id: `html-h1-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'chapter',
            text: h.textContent?.trim() || ''
        } as TextStoryBlock);
    });

    doc.querySelectorAll('h2, h3, h4, h5, h6').forEach(h => {
        blocks.push({
            id: `html-heading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'heading',
            text: h.textContent?.trim() || ''
        } as TextStoryBlock);
    });

    // Process paragraphs
    doc.querySelectorAll('p').forEach(p => {
        const text = p.textContent?.trim();
        if (text) {
            blocks.push({
                id: `html-para-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'paragraph',
                text
            } as TextStoryBlock);
        }
    });

    // Process blockquotes
    doc.querySelectorAll('blockquote').forEach(q => {
        const text = q.textContent?.trim();
        if (text) {
            blocks.push({
                id: `html-quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'quote',
                text
            } as TextStoryBlock);
        }
    });

    return { blocks };
};

// =====================================================
// MARKDOWN IMPORT
// =====================================================

interface MarkdownImportResult {
    blocks: StoryBlock[];
    metadata?: Partial<BookMetadata>;
}

export const importMarkdown = async (file: File): Promise<MarkdownImportResult> => {
    const content = await file.text();
    const blocks: StoryBlock[] = [];
    let metadata: Partial<BookMetadata> | undefined;

    // Parse YAML frontmatter if present
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let bodyContent = content;

    if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        bodyContent = content.slice(frontmatterMatch[0].length).trim();

        // Simple YAML parsing
        const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
        const authorMatch = frontmatter.match(/author:\s*["']?([^"'\n]+)["']?/);

        if (titleMatch || authorMatch) {
            metadata = {};
            if (titleMatch) metadata.title = titleMatch[1].trim();
            if (authorMatch) metadata.authors = [authorMatch[1].trim()];
        }
    }

    // Parse markdown content
    const lines = bodyContent.split('\n');
    let currentParagraph = '';

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Headers
        if (trimmedLine.startsWith('# ')) {
            if (currentParagraph) {
                blocks.push(createParagraphBlock(currentParagraph));
                currentParagraph = '';
            }
            blocks.push({
                id: `md-h1-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'chapter',
                text: trimmedLine.slice(2).trim()
            } as TextStoryBlock);
        } else if (trimmedLine.startsWith('## ') || trimmedLine.startsWith('### ')) {
            if (currentParagraph) {
                blocks.push(createParagraphBlock(currentParagraph));
                currentParagraph = '';
            }
            blocks.push({
                id: `md-heading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'heading',
                text: trimmedLine.replace(/^#+\s*/, '').trim()
            } as TextStoryBlock);
        } else if (trimmedLine.startsWith('> ')) {
            if (currentParagraph) {
                blocks.push(createParagraphBlock(currentParagraph));
                currentParagraph = '';
            }
            blocks.push({
                id: `md-quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'quote',
                text: trimmedLine.slice(2).trim()
            } as TextStoryBlock);
        } else if (trimmedLine === '') {
            if (currentParagraph) {
                blocks.push(createParagraphBlock(currentParagraph));
                currentParagraph = '';
            }
        } else {
            currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
        }
    }

    // Add any remaining paragraph
    if (currentParagraph) {
        blocks.push(createParagraphBlock(currentParagraph));
    }

    return { blocks, metadata };
};

// =====================================================
// RTF IMPORT
// =====================================================

interface RTFImportResult {
    blocks: StoryBlock[];
}

export const importRTF = async (file: File): Promise<RTFImportResult> => {
    const content = await file.text();

    // Basic RTF stripping - remove control words
    let plainText = content
        .replace(/\\[a-z]+\d*\s?/gi, '') // Remove control words
        .replace(/[{}]/g, '') // Remove braces
        .replace(/\\\*/g, '') // Remove escape sequences
        .trim();

    // Use AI or basic parsing
    let blocks: StoryBlock[];
    try {
        blocks = await analyzeStructure(plainText);
    } catch {
        blocks = parseBasicParagraphs(plainText);
    }

    return { blocks };
};

// =====================================================
// TXT IMPORT
// =====================================================

interface TXTImportResult {
    blocks: StoryBlock[];
}

export const importTXT = async (file: File): Promise<TXTImportResult> => {
    const content = await file.text();

    // Try AI structure analysis for longer texts
    let blocks: StoryBlock[];
    if (content.length > 500) {
        try {
            blocks = await analyzeStructure(content);
        } catch {
            blocks = parseBasicParagraphs(content);
        }
    } else {
        blocks = parseBasicParagraphs(content);
    }

    return { blocks };
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const parseBasicParagraphs = (text: string): StoryBlock[] => {
    // Split by single newlines for higher granularity, but keep non-empty lines
    const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);

    return lines.map((trimmed, index) => {
        // Detect chapters (lines with "Chapter" or all caps short lines)
        if (
            trimmed.toLowerCase().startsWith('chapter') ||
            (trimmed.length < 50 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed))
        ) {
            return {
                id: `block-${Date.now()}-${index}`,
                type: 'chapter',
                text: trimmed
            } as TextStoryBlock;
        }

        return {
            id: `block-${Date.now()}-${index}`,
            type: 'paragraph',
            text: trimmed
        } as TextStoryBlock;
    });
};

const createParagraphBlock = (text: string): TextStoryBlock => ({
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'paragraph',
    text: text.trim()
});

// =====================================================
// BOOK ANALYSIS (for completed books)
// =====================================================

export interface BookAnalysis {
    format: ImportFormat;
    pageCount?: number;
    wordCount: number;
    chapterCount: number;
    estimatedReadingTime: number;
    hasImages: boolean;
    hasTOC: boolean;
    issues: string[];
    recommendations: string[];
}

export const analyzeExistingBook = async (file: File): Promise<BookAnalysis> => {
    const result = await importDocument(file);

    const textBlocks = result.storyBlocks.filter((b): b is TextStoryBlock => 'text' in b);
    const wordCount = textBlocks.reduce((sum, b) => sum + b.text.split(/\s+/).length, 0);
    const chapterCount = result.storyBlocks.filter(b => b.type === 'chapter').length;
    const hasImages = result.storyBlocks.some(b => b.type === 'image');
    const hasTOC = chapterCount > 3;

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze for issues
    if (chapterCount === 0) {
        issues.push('No chapter markers detected');
        recommendations.push('Add chapter headings to improve navigation');
    }

    if (wordCount < 10000) {
        issues.push('Short manuscript (under 10,000 words)');
    }

    if (!hasImages && result.originalFormat !== 'txt') {
        recommendations.push('Consider adding images to enhance visual appeal');
    }

    if (result.warnings.length > 0) {
        issues.push(...result.warnings);
    }

    return {
        format: result.originalFormat,
        pageCount: result.pageCount,
        wordCount,
        chapterCount,
        estimatedReadingTime: Math.ceil(wordCount / 250),
        hasImages,
        hasTOC,
        issues,
        recommendations
    };
};
