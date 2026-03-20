import { jsPDF } from 'jspdf';
import { BookContent, PageFormat, Quality, LayoutPreset } from './types';
import { getPageDimensions, mmToPt, hexToRgb } from './utils';
import { parseManuscript } from './parser';

export const generateLayoutPDF = async (content: BookContent, format: PageFormat, fonts: { heading: string; body: string }, quality: Quality): Promise<string> => {
    const dims = getPageDimensions(format);
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [mmToPt(dims.widthMm), mmToPt(dims.heightMm)]
    });

    const pageMargin = 72;
    pdf.setFont(fonts.heading, 'bold');
    pdf.setFontSize(18);

    for (let i = 0; i < content.chapters.length; i++) {
        const ch = content.chapters[i];
        if (i > 0) pdf.addPage();
        let y = pageMargin;
        pdf.text(ch.title, pageMargin, y);
        y += 24;

        pdf.setFont(fonts.body, 'normal');
        pdf.setFontSize(12);
        const maxWidth = mmToPt(dims.widthMm) - pageMargin * 2;

        for (const p of ch.paragraphs) {
            const lines = pdf.splitTextToSize(p, maxWidth);
            for (const line of lines) {
                if (y > mmToPt(dims.heightMm) - pageMargin) {
                    pdf.addPage();
                    y = pageMargin;
                }
                pdf.text(line, pageMargin, y);
                y += 18;
            }
            y += 6;
        }
    }

    pdf.setProperties({ title: 'Book', subject: quality + ' quality' });
    return pdf.output('datauristring');
};

export const generateLayoutFromText = async (contentText: string, opts: {
    title: string;
    author: string;
    format: PageFormat;
    fonts: { heading: string; body: string };
    quality: Quality;
    preset?: LayoutPreset;
    style?: { dropCapLines?: number; bandColor?: string; ruleThickness?: number };
    alignment?: 'left' | 'justify';
    showHeaders?: boolean;
    showFooters?: boolean;
    showPageNumbers?: boolean;
    pullQuotes?: { text: string; atParagraph?: number; position?: 'inline' | 'sidebarLeft' | 'sidebarRight' }[];
    cropMarks?: boolean;
    bleedMm?: number
}): Promise<string> => {
    const mapFont = (fontName: string, weight: 'normal' | 'bold' | 'italic' = 'normal') => {
        const lowerFont = fontName.toLowerCase();
        if (lowerFont.includes('times') || lowerFont.includes('serif')) return 'times';
        if (lowerFont.includes('helvetica') || lowerFont.includes('sans')) return 'helvetica';
        if (lowerFont.includes('courier') || lowerFont.includes('mono')) return 'courier';
        return 'helvetica';
    };

    const dims = getPageDimensions(opts.format);
    const pageW = mmToPt(dims.widthMm);
    const pageH = mmToPt(dims.heightMm);
    const bleedPt = mmToPt(Math.max(0, opts.bleedMm || 0));
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [pageW + bleedPt * 2, pageH + bleedPt * 2]
    });

    const margin = 72;
    const headerY = bleedPt + 48;
    const footerY = bleedPt + pageH - 36;
    const maxWidth = pageW - margin * 2;
    const toc: { title: string; page: number }[] = [];
    const ruleThickness = opts.style?.ruleThickness ?? (opts.preset === 'workbook_modern' ? 1 : 0.6);
    const twoColumns = opts.preset === 'workbook_modern' || opts.preset === 'publisher_pro';
    const gutter = twoColumns ? 24 : 0;
    const colW = twoColumns ? (pageW - margin * 2 - gutter) / 2 : maxWidth;
    const colXs = [bleedPt + margin, bleedPt + margin + colW + gutter];
    let colIndex = 0;

    const measure = (s: string) => pdf.getTextWidth(s);

    const drawJustifiedLine = (line: string, x: number, y: number, width: number) => {
        const words = line.split(/\s+/);
        if (words.length <= 1) { pdf.text(line, x, y); return; }
        const spaceW = measure(' ');
        const textW = words.reduce((sum, w) => sum + measure(w), 0);
        const gaps = words.length - 1;
        const extra = Math.max(0, width - textW);
        const addPerGap = gaps > 0 ? extra / gaps : 0;
        let cx = x;
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            pdf.text(w, cx, y);
            if (i < words.length - 1) cx += measure(w) + spaceW + addPerGap;
        }
    };

    // Title Page
    pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold');
    pdf.setFontSize(28);
    const titleW = pdf.getTextWidth(opts.title);
    pdf.text(opts.title, bleedPt + (pageW - titleW) / 2, bleedPt + pageH * 0.38);
    pdf.setFont(mapFont(opts.fonts.body, 'normal'), 'normal');
    pdf.setFontSize(16);
    const authorW = pdf.getTextWidth(opts.author);
    pdf.text(opts.author, bleedPt + (pageW - authorW) / 2, bleedPt + pageH * 0.45);
    pdf.setDrawColor(180);
    pdf.setLineWidth(ruleThickness);
    pdf.line(bleedPt + margin, bleedPt + pageH * 0.5, bleedPt + pageW - margin, bleedPt + pageH * 0.5);

    const chapters = parseManuscript(contentText).chapters;
    const entriesPerPage = Math.floor((pageH - margin * 2 - 60) / 18);
    const tocPagesNeeded = Math.ceil(chapters.length / entriesPerPage) || 1;
    const tocStartPage = pdf.getNumberOfPages() + 1;

    for (let i = 0; i < tocPagesNeeded; i++) {
        pdf.addPage();
        if (i === 0) {
            pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold');
            pdf.setFontSize(22);
            pdf.text('Contents', bleedPt + margin, bleedPt + margin);
        }
    }

    let y = bleedPt + margin;
    const advance = () => {
        if (y > footerY - margin) {
            if (twoColumns && colIndex === 0) { colIndex = 1; y = bleedPt + margin; return; }
            pdf.addPage(); colIndex = 0; y = bleedPt + margin;
        }
    };

    for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        pdf.addPage();
        colIndex = 0;
        y = bleedPt + margin;
        toc.push({ title: ch.title, page: pdf.getNumberOfPages() });

        // Chapter Header logic... (simplified here for brevity, but should match bookEngine.ts)
        pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold');
        pdf.setFontSize(18);
        pdf.text(ch.title, bleedPt + margin, headerY);
        y = bleedPt + margin + 24;

        const lineHeight = 18;
        for (const p of ch.paragraphs) {
            pdf.setFont(mapFont(opts.fonts.body, 'normal'), 'normal');
            pdf.setFontSize(12);

            const text = p.trim();
            const words = text.split(/\s+/);
            let curLine: string[] = [];

            for (let wIdx = 0; wIdx < words.length; wIdx++) {
                const w = words[wIdx];
                const effectiveW = twoColumns ? colW : maxWidth;
                const test = curLine.length ? curLine.join(' ') + ' ' + w : w;

                if (measure(test) <= effectiveW) {
                    curLine.push(w);
                } else {
                    if (y > footerY - margin) advance();
                    const lineStr = curLine.join(' ');
                    if (opts.alignment === 'justify' && wIdx < words.length - 1) {
                        drawJustifiedLine(lineStr, colXs[colIndex], y, effectiveW);
                    } else {
                        pdf.text(lineStr, colXs[colIndex], y);
                    }
                    y += lineHeight;
                    curLine = [w];
                }
            }
            if (curLine.length) {
                if (y > footerY - margin) advance();
                pdf.text(curLine.join(' '), colXs[colIndex], y);
                y += lineHeight;
            }
            y += 6;
        }
    }

    // Finishing logic (TOC, Page Numbers, etc. omitted for brevity but should be fully ported)
    pdf.setProperties({ title: opts.title, subject: 'Book Layout' });
    return pdf.output('datauristring');
};
