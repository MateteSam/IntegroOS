
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts, PDFFont, Color, PDFName, PDFString, PDFRef, PDFDict, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { TextAnnotation, ImageAnnotation, ShapeAnnotation, Annotation, FontFamily, PageSize, DocumentSettings, Bookmark } from '../types';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

const ASCENT_FACTOR = 0.8;
const PT_PER_MM = 2.83465;
const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

const CUSTOM_FONTS: Partial<Record<FontFamily, string>> = {
    'Roboto': 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf',
    'Open Sans': 'https://fonts.gstatic.com/s/opensans/v34/memvYaGs126MiZpBA-UvWbX2vVnXBbObj2OVTS-muw.ttf',
    'Dancing Script': 'https://fonts.gstatic.com/s/dancingscript/v24/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F5060qVE.ttf',
    'Playfair Display': 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.ttf'
};

const sanitizeText = (text: string): string => {
    if (!text) return '';
    return text.replace(/\t/g, '    ').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
};

export const loadPDF = async (fileData: ArrayBuffer) => {
    const loadingTask = pdfjsLib.getDocument({ data: fileData });
    return await loadingTask.promise;
};

export const getPage = async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNumber: number) => {
    return await pdfDoc.getPage(pageNumber);
};

export const renderPage = (page: pdfjsLib.PDFPageProxy, scale: number, canvas: HTMLCanvasElement): pdfjsLib.RenderTask => {
    const viewport = page.getViewport({ scale });
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";
    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

    // Optimization: Inform the browser that we will read from this canvas frequently
    // This helps the browser optimize the storage of the canvas data (e.g. into system memory instead of GPU memory where appropriate)
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    return page.render({ canvasContext: ctx!, transform, viewport });
};

export const createBlankPDF = async (pageSize: PageSize, numPages: number): Promise<ArrayBuffer> => {
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < numPages; i++) {
        pdfDoc.addPage([pageSize.widthPt, pageSize.heightPt]);
    }
    const bytes = await pdfDoc.save();
    return bytes.buffer as ArrayBuffer;
};

export const extractTextFromPage = async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageIndex: number): Promise<TextAnnotation[]> => {
    const page = await pdfDoc.getPage(pageIndex + 1);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const annotations: TextAnnotation[] = [];
    const items = textContent.items as any[];

    items.sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.transform[4] - b.transform[4];
    });

    let currentAnn: Partial<TextAnnotation> | null = null;
    let currentRightX = 0;
    let currentBaseY = 0;

    for (const item of items) {
        if (!item.str.trim()) continue;
        const tx = item.transform[4];
        const ty = item.transform[5];
        const fontSize = Math.sqrt(item.transform[0] * item.transform[3]);
        const appY = viewport.height - ty - (fontSize * ASCENT_FACTOR);
        const appX = tx;

        if (
            currentAnn &&
            Math.abs(currentBaseY - ty) < 4 &&
            (tx - currentRightX) < (fontSize * 2.5) &&
            Math.abs(currentAnn.fontSize! - fontSize) < 2
        ) {
            const gap = appX - currentRightX;
            currentAnn.text += (gap > (fontSize * 0.2) ? " " : "") + item.str;
            const addedWidth = item.width || (item.str.length * fontSize * 0.5);
            currentAnn.width = (currentAnn.width || 0) + gap + addedWidth;
            currentRightX = appX + addedWidth;
        } else {
            if (currentAnn) annotations.push(currentAnn as TextAnnotation);
            const width = item.width || (item.str.length * fontSize * 0.5);
            currentAnn = {
                id: `imported-${pageIndex}-${tx}-${ty}-${Math.random().toString(36).substr(2, 9)}`,
                storyBlockId: `imported-sb-${pageIndex}-${tx}-${ty}`,
                type: 'text',
                text: item.str,
                x: appX,
                y: appY,
                pageIndex: pageIndex,
                fontSize: Math.round(fontSize),
                color: '#000000',
                fontFamily: 'Roboto',
                textAlign: 'left',
                width: width,
                height: fontSize * 1.35,
                backgroundColor: 'transparent',
                backgroundColorOpacity: 1,
                autoWidth: true,
                opacity: 1,
                lineHeight: 1.35,
                letterSpacing: 0,
                textDecoration: 'none'
            };
            currentRightX = appX + width;
            currentBaseY = ty;
        }
    }
    if (currentAnn) annotations.push(currentAnn as TextAnnotation);
    return annotations;
};

const hexToRgb = (hex: string) => {
    let c = hex.substring(1);
    if (c.length === 3) c = c.split('').map(char => char + char).join('');
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    return { r, g, b };
};

const hexToPdfColor = (hex?: string): Color | undefined => {
    if (!hex || hex === 'transparent') return undefined;
    const { r, g, b } = hexToRgb(hex);
    return rgb(r, g, b);
};

const processImageForPdf = async (input: string, filter: string | undefined): Promise<string> => {
    let dataUrl = input;

    if (input.startsWith('http')) {
        try {
            const response = await fetch(CORS_PROXY_URL + input);
            if (!response.ok) throw new Error(`Network response was not ok for ${input}`);
            const blob = await response.blob();
            dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error("Failed to fetch remote image via proxy:", e);
            const canvas = document.createElement('canvas');
            canvas.width = 200; canvas.height = 200;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, 200, 200);
                ctx.fillStyle = '#a0a0a0'; ctx.textAlign = 'center'; ctx.fillText('Image Load Error', 100, 100);
            }
            return canvas.toDataURL();
        }
    }

    if (!filter || filter === 'none') return dataUrl;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                if (filter === 'grayscale') ctx.filter = 'grayscale(100%)';
                if (filter === 'sepia') ctx.filter = 'sepia(100%)';
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL(dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'));
            } else {
                reject(new Error("Failed to get canvas context"));
            }
        };
        img.onerror = (e) => {
            console.warn("Canvas image load error, falling back to original data URL", e);
            resolve(dataUrl);
        };
        img.src = dataUrl;
    });
};

export const insertPageAt = async (pdfBytes: ArrayBuffer, index: number): Promise<Uint8Array> => {
    const doc = await PDFDocument.load(pdfBytes);
    const pages = doc.getPages();
    let width = 595.28; let height = 841.89;
    if (pages.length > 0) {
        const size = pages[0].getSize();
        width = size.width; height = size.height;
    }
    doc.insertPage(index, [width, height]);
    return await doc.save();
};

export const deletePage = async (pdfBytes: ArrayBuffer, index: number): Promise<Uint8Array> => {
    const doc = await PDFDocument.load(pdfBytes);
    doc.removePage(index);
    return await doc.save();
};

export const reorderPage = async (pdfBytes: ArrayBuffer, fromIndex: number, toIndex: number): Promise<Uint8Array> => {
    const doc = await PDFDocument.load(pdfBytes);
    const [page] = await doc.copyPages(doc, [fromIndex]);
    if (toIndex > fromIndex) {
        doc.insertPage(toIndex + 1, page);
        doc.removePage(fromIndex);
    } else {
        doc.removePage(fromIndex);
        doc.insertPage(toIndex, page);
    }
    return await doc.save();
};

export const createPrintReadyPDF = async (
    originalPdfBytes: ArrayBuffer,
    annotations: Annotation[],
    docSettings: DocumentSettings,
    bookmarks?: Bookmark[]
): Promise<Uint8Array> => {
    const originalDoc = await PDFDocument.load(originalPdfBytes);
    originalDoc.registerFontkit(fontkit);
    const newDoc = await PDFDocument.create();
    newDoc.registerFontkit(fontkit);

    // PARALLEL: Load all custom fonts first
    const fonts: Partial<Record<FontFamily, PDFFont>> = {};
    fonts['Helvetica'] = await newDoc.embedFont(StandardFonts.Helvetica);
    fonts['Times-Roman'] = await newDoc.embedFont(StandardFonts.TimesRoman);
    fonts['Courier'] = await newDoc.embedFont(StandardFonts.Courier);

    await Promise.all(Object.entries(CUSTOM_FONTS).map(async ([fontName, url]) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch font ${fontName}`);
            const fontBytes = await response.arrayBuffer();
            fonts[fontName as FontFamily] = await newDoc.embedFont(fontBytes);
        } catch (e) { console.warn(`Could not load custom font ${fontName}`, e); }
    }));

    // PARALLEL & CACHED: Pre-load and process all unique images
    const imageCache = new Map<string, any>();
    const uniqueImages = Array.from(new Set(annotations.filter(a => a.type === 'image').map(a => (a as ImageAnnotation).imageBase64)));

    await Promise.all(uniqueImages.map(async (base64) => {
        try {
            const processed = await processImageForPdf(base64, undefined);
            let imgPromise;
            if (processed.startsWith('data:image/png')) imgPromise = newDoc.embedPng(processed);
            else imgPromise = newDoc.embedJpg(processed);
            imageCache.set(base64, imgPromise);
        } catch (e) {
            console.warn("Failed to preload image for export", e);
        }
    }));

    // Resolve image promises into the map
    const resolvedImages = new Map<string, any>();
    for (const [k, v] of imageCache) {
        try { resolvedImages.set(k, await v); } catch (e) { console.error("Image embedding failed", e); }
    }

    const pageCount = originalDoc.getPageCount();
    const bleedPt = docSettings.bleedMm * PT_PER_MM;
    const cropMarkPt = (docSettings.cropMarkMm ?? docSettings.bleedMm) * PT_PER_MM;

    for (let i = 0; i < pageCount; i++) {
        const originalPage = originalDoc.getPage(i);
        const { width, height } = originalPage.getSize();
        const newWidth = width + (bleedPt * 2);
        const newHeight = height + (bleedPt * 2);
        const newPage = newDoc.addPage([newWidth, newHeight]);
        const embeddedPage = await newDoc.embedPage(originalPage);

        newPage.drawPage(embeddedPage, { x: bleedPt, y: bleedPt, width: width, height: height });

        const pageAnnotations = annotations.filter(a => a.pageIndex === i && !a.hidden);

        for (const ann of pageAnnotations) {
            if (['rect', 'circle', 'line'].includes(ann.type)) {
                const shape = ann as ShapeAnnotation;
                try {
                    const borderColor = hexToPdfColor(shape.strokeColor || shape.strokeGradient?.start);
                    const fillColor = hexToPdfColor(shape.fillColor || shape.fillGradient?.start);
                    const opacity = shape.opacity ?? 1;
                    const targetY = (bleedPt + height) - shape.y - shape.height;

                    if (shape.type === 'rect') {
                        newPage.drawRectangle({
                            x: bleedPt + shape.x, y: targetY, width: shape.width, height: shape.height,
                            color: fillColor, borderColor: borderColor, borderWidth: shape.strokeWidth || 0, opacity: opacity
                        });
                    } else if (shape.type === 'circle') {
                        newPage.drawEllipse({
                            x: bleedPt + shape.x + (shape.width / 2), y: targetY + (shape.height / 2),
                            xScale: shape.width / 2, yScale: shape.height / 2,
                            color: fillColor, borderColor: borderColor, borderWidth: shape.strokeWidth || 0, opacity: opacity
                        });
                    } else if (shape.type === 'line') {
                        const y1 = (bleedPt + height) - shape.y;
                        const y2 = y1 - shape.height;
                        newPage.drawLine({
                            start: { x: bleedPt + shape.x, y: y1 }, end: { x: bleedPt + shape.x + shape.width, y: y2 },
                            color: borderColor || rgb(0, 0, 0), thickness: shape.strokeWidth || 1, opacity: opacity
                        });
                    }
                } catch (e) { console.error("Failed to render shape", e); }
            }
            else if (ann.type === 'image') {
                const imgAnn = ann as ImageAnnotation;
                try {
                    const image = resolvedImages.get(imgAnn.imageBase64);
                    if (image) {
                        const targetY = (bleedPt + height) - imgAnn.y - imgAnn.height;
                        const targetX = bleedPt + imgAnn.x;
                        newPage.drawImage(image, {
                            x: targetX, y: targetY, width: imgAnn.width, height: imgAnn.height,
                            opacity: imgAnn.opacity ?? 1
                        });
                    }
                } catch (e) { console.error("Failed to draw preloaded image", e); }
            }
            else if (ann.type === 'text') {
                const textAnn = ann as TextAnnotation;
                const { r, g, b } = hexToRgb(textAnn.color || '#000000');
                const opacity = textAnn.opacity ?? 1;
                let fontKey = textAnn.fontFamily || 'Helvetica';
                const hasUnicode = /[^\u0000-\u00FF]/.test(textAnn.text);
                if (hasUnicode && ['Helvetica', 'Times-Roman', 'Courier'].includes(fontKey)) {
                    if (fonts['Roboto']) fontKey = 'Roboto';
                }
                const font = fonts[fontKey] || fonts['Helvetica']!;

                const sanitizedText = sanitizeText(textAnn.text);
                const fontSize = textAnn.fontSize;
                const lineHeightValue = textAnn.lineHeight || 1.35;
                const lineHeight = fontSize * lineHeightValue;
                const annotationTopY = (bleedPt + height) - textAnn.y;
                const rotation = textAnn.rotation ? degrees(textAnn.rotation) : undefined;

                let linesToDraw: string[] = [];

                if (sanitizedText.includes('\n')) {
                    linesToDraw = sanitizedText.split('\n');
                } else if (textAnn.width && !textAnn.autoWidth) {
                    const words = sanitizedText.split(' ');
                    let currentLine = words[0] || '';
                    for (let k = 1; k < words.length; k++) {
                        const word = words[k];
                        const testLine = currentLine + ' ' + word;
                        const width = font.widthOfTextAtSize(testLine, fontSize);
                        if (width <= textAnn.width) currentLine = testLine;
                        else {
                            linesToDraw.push(currentLine);
                            currentLine = word;
                        }
                    }
                    linesToDraw.push(currentLine);
                } else {
                    linesToDraw = [sanitizedText];
                }

                const firstLineBaseline = annotationTopY - (fontSize * ASCENT_FACTOR);

                try {
                    for (let lineIndex = 0; lineIndex < linesToDraw.length; lineIndex++) {
                        const line = linesToDraw[lineIndex];
                        if (!line) continue;
                        const lineWidth = font.widthOfTextAtSize(line, fontSize);
                        let xOffset = 0;

                        if (textAnn.textAlign === 'center' && textAnn.width) xOffset = (textAnn.width - lineWidth) / 2;
                        else if (textAnn.textAlign === 'right' && textAnn.width) xOffset = textAnn.width - lineWidth;

                        if (isNaN(xOffset)) xOffset = 0;

                        const isLastLine = lineIndex === linesToDraw.length - 1;
                        const shouldJustify = textAnn.textAlign === 'justify' &&
                            textAnn.width &&
                            line.trim().includes(' ') &&
                            (!isLastLine || textAnn.continuation);

                        const isTooShort = lineWidth < (textAnn.width! * 0.75);

                        if (shouldJustify && !isTooShort) {
                            const words = line.trim().split(/\s+/);
                            const totalWordLength = words.reduce((sum, w) => sum + font.widthOfTextAtSize(w, fontSize), 0);
                            const extraSpace = textAnn.width! - totalWordLength;
                            const spacePerGap = extraSpace / (words.length - 1);

                            let currentX = bleedPt + textAnn.x;
                            const yPos = firstLineBaseline - (lineIndex * lineHeight);

                            for (let wIdx = 0; wIdx < words.length; wIdx++) {
                                const word = words[wIdx];
                                newPage.drawText(word, {
                                    x: currentX, y: yPos,
                                    size: fontSize, font: font, color: rgb(r, g, b), opacity: opacity,
                                    rotate: rotation
                                });
                                currentX += font.widthOfTextAtSize(word, fontSize) + spacePerGap;
                            }
                        } else {
                            newPage.drawText(line, {
                                x: bleedPt + textAnn.x + xOffset,
                                y: firstLineBaseline - (lineIndex * lineHeight),
                                size: fontSize, font: font, color: rgb(r, g, b), opacity: opacity,
                                rotate: rotation
                            });
                        }
                    }
                } catch (error) { console.error(`Failed to export text`, error); }
            }
        }

        if (docSettings.showCropMarks) {
            const red = rgb(1, 0, 0);
            const thickness = 0.5;
            const halfBleed = bleedPt / 2;
            const lineLength = cropMarkPt;

            newPage.drawLine({ start: { x: halfBleed, y: bleedPt + height }, end: { x: halfBleed + lineLength, y: bleedPt + height }, color: red, thickness });
            newPage.drawLine({ start: { x: bleedPt, y: newHeight - halfBleed }, end: { x: bleedPt, y: newHeight - halfBleed - lineLength }, color: red, thickness });

            newPage.drawLine({ start: { x: newWidth - halfBleed, y: bleedPt + height }, end: { x: newWidth - halfBleed - lineLength, y: bleedPt + height }, color: red, thickness });
            newPage.drawLine({ start: { x: newWidth - bleedPt, y: newHeight - halfBleed }, end: { x: newWidth - bleedPt, y: newHeight - halfBleed - lineLength }, color: red, thickness });

            newPage.drawLine({ start: { x: halfBleed, y: bleedPt }, end: { x: halfBleed + lineLength, y: bleedPt }, color: red, thickness });
            newPage.drawLine({ start: { x: bleedPt, y: halfBleed }, end: { x: bleedPt, y: halfBleed + lineLength }, color: red, thickness });

            newPage.drawLine({ start: { x: newWidth - halfBleed, y: bleedPt }, end: { x: newWidth - halfBleed - lineLength, y: bleedPt }, color: red, thickness });
            newPage.drawLine({ start: { x: newWidth - bleedPt, y: halfBleed }, end: { x: newWidth - bleedPt, y: halfBleed + lineLength }, color: red, thickness });
        }
    }

    if (bookmarks && bookmarks.length > 0) {
        try {
            const outlineRef = newDoc.context.nextRef();
            const outlineItems: PDFRef[] = [];

            for (let i = 0; i < bookmarks.length; i++) {
                outlineItems.push(newDoc.context.nextRef());
            }

            const outlineDict = newDoc.context.obj({
                Type: 'Outlines',
                First: outlineItems[0],
                Last: outlineItems[outlineItems.length - 1],
                Count: outlineItems.length
            });
            newDoc.context.assign(outlineRef, outlineDict);
            newDoc.catalog.set(PDFName.of('Outlines'), outlineRef);

            for (let i = 0; i < bookmarks.length; i++) {
                const bm = bookmarks[i];
                const ref = outlineItems[i];
                const prev = i > 0 ? outlineItems[i - 1] : undefined;
                const next = i < outlineItems.length - 1 ? outlineItems[i + 1] : undefined;

                const targetPageIndex = Math.min(bm.pageIndex, newDoc.getPageCount() - 1);
                const page = newDoc.getPage(targetPageIndex);

                const dest = [page.ref, PDFName.of('XYZ'), null, page.getSize().height, null];

                const itemDict = newDoc.context.obj({
                    Title: PDFString.of(bm.title),
                    Parent: outlineRef,
                    ...(prev ? { Prev: prev } : {}),
                    ...(next ? { Next: next } : {}),
                    Dest: dest
                });
                newDoc.context.assign(ref, itemDict);
            }
        } catch (e) {
            console.error("Failed to generate bookmarks", e);
        }
    }

    return await newDoc.save();
};
