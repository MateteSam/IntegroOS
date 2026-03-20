
import JSZip from 'jszip';
import { StoryBlock, TextStoryBlock, ImageStoryBlock, BookMetadata, EPUBOptions, EnhancedTemplateStyle, ENHANCED_TEMPLATE_STYLES } from '../types';

// =====================================================
// EPUB 3.0 GENERATOR
// =====================================================

export const generateEPUB = async (
    storyBlocks: StoryBlock[],
    metadata: BookMetadata,
    coverImage: string | null,
    options: EPUBOptions,
    templateId?: string
): Promise<Blob> => {
    const zip = new JSZip();
    const template = ENHANCED_TEMPLATE_STYLES.find(t => t.id === templateId) || ENHANCED_TEMPLATE_STYLES[0];

    // Generate unique identifiers
    const bookId = `urn:uuid:${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();

    // =====================================================
    // 1. MIMETYPE (uncompressed, first file)
    // =====================================================
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // =====================================================
    // 2. META-INF/container.xml
    // =====================================================
    zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // =====================================================
    // 3. ORGANIZE CONTENT INTO CHAPTERS
    // =====================================================
    const chapters: { title: string; blocks: StoryBlock[]; id: string }[] = [];
    let currentChapter: { title: string; blocks: StoryBlock[]; id: string } | null = null;

    for (const block of storyBlocks) {
        if (block.type === 'chapter') {
            if (currentChapter) {
                chapters.push(currentChapter);
            }
            currentChapter = {
                title: (block as TextStoryBlock).text,
                blocks: [block],
                id: `chapter-${chapters.length + 1}`
            };
        } else if (currentChapter) {
            currentChapter.blocks.push(block);
        } else {
            // Content before first chapter - create a "prologue"
            currentChapter = {
                title: 'Prologue',
                blocks: [block],
                id: 'prologue'
            };
        }
    }
    if (currentChapter) {
        chapters.push(currentChapter);
    }

    // =====================================================
    // 4. GENERATE CSS
    // =====================================================
    const css = generateCSS(template);
    zip.file('OEBPS/styles/main.css', css);

    // =====================================================
    // 5. GENERATE COVER PAGE
    // =====================================================
    const manifestItems: string[] = [];
    const spineItems: string[] = [];

    if (coverImage && options.includeCover) {
        // Cover image
        const coverData = coverImage.split(',')[1];
        const coverMimeType = coverImage.includes('png') ? 'image/png' : 'image/jpeg';
        const coverExt = coverMimeType === 'image/png' ? 'png' : 'jpg';

        zip.file(`OEBPS/images/cover.${coverExt}`, coverData, { base64: true });
        manifestItems.push(`<item id="cover-image" href="images/cover.${coverExt}" media-type="${coverMimeType}" properties="cover-image"/>`);

        // Cover HTML
        const coverHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Cover</title>
  <link rel="stylesheet" type="text/css" href="styles/main.css"/>
</head>
<body class="cover">
  <div class="cover-container">
    <img src="images/cover.${coverExt}" alt="Cover"/>
  </div>
</body>
</html>`;

        zip.file('OEBPS/cover.xhtml', coverHtml);
        manifestItems.push('<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>');
        spineItems.push('<itemref idref="cover"/>');
    }

    // =====================================================
    // 6. GENERATE TITLE PAGE
    // =====================================================
    const titlePageHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${escapeXml(metadata.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles/main.css"/>
</head>
<body class="title-page">
  <div class="title-container">
    <h1 class="book-title">${escapeXml(metadata.title)}</h1>
    ${metadata.subtitle ? `<h2 class="book-subtitle">${escapeXml(metadata.subtitle)}</h2>` : ''}
    <p class="book-author">${escapeXml(metadata.authors.join(', '))}</p>
    ${metadata.publisher ? `<p class="book-publisher">${escapeXml(metadata.publisher)}</p>` : ''}
  </div>
</body>
</html>`;

    zip.file('OEBPS/title.xhtml', titlePageHtml);
    manifestItems.push('<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>');
    spineItems.push('<itemref idref="title"/>');

    // =====================================================
    // 7. GENERATE TABLE OF CONTENTS
    // =====================================================
    if (options.generateTOC && chapters.length > 1) {
        const tocHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="styles/main.css"/>
</head>
<body class="toc">
  <nav epub:type="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${chapters.map((ch, i) => `
      <li><a href="${ch.id}.xhtml">${escapeXml(ch.title)}</a></li>`).join('')}
    </ol>
  </nav>
</body>
</html>`;

        zip.file('OEBPS/toc.xhtml', tocHtml);
        manifestItems.push('<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>');
        spineItems.push('<itemref idref="toc"/>');
    }

    // =====================================================
    // 8. GENERATE CHAPTER FILES
    // =====================================================
    for (const chapter of chapters) {
        const chapterHtml = generateChapterHTML(chapter, template, options);
        zip.file(`OEBPS/${chapter.id}.xhtml`, chapterHtml);
        manifestItems.push(`<item id="${chapter.id}" href="${chapter.id}.xhtml" media-type="application/xhtml+xml"/>`);
        spineItems.push(`<itemref idref="${chapter.id}"/>`);
    }

    // Add CSS to manifest
    manifestItems.push('<item id="css" href="styles/main.css" media-type="text/css"/>');

    // =====================================================
    // 9. GENERATE content.opf
    // =====================================================
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${options.language || 'en'}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${bookId}</dc:identifier>
    <dc:title>${escapeXml(metadata.title)}</dc:title>
    ${metadata.authors.map(a => `<dc:creator>${escapeXml(a)}</dc:creator>`).join('\n    ')}
    <dc:language>${options.language || 'en'}</dc:language>
    ${metadata.publisher ? `<dc:publisher>${escapeXml(metadata.publisher)}</dc:publisher>` : ''}
    ${metadata.description ? `<dc:description>${escapeXml(metadata.description)}</dc:description>` : ''}
    ${metadata.isbn ? `<dc:identifier>${metadata.isbn}</dc:identifier>` : ''}
    <meta property="dcterms:modified">${timestamp.replace(/\.\d{3}/, '')}</meta>
    ${options.accessibility ? `
    <meta property="schema:accessibilityFeature">structuralNavigation</meta>
    <meta property="schema:accessibilityFeature">alternativeText</meta>
    <meta property="schema:accessibilityHazard">none</meta>
    <meta property="schema:accessMode">textual</meta>
    <meta property="schema:accessModeSufficient">textual</meta>` : ''}
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`;

    zip.file('OEBPS/content.opf', contentOpf);

    // =====================================================
    // 10. GENERATE NCX (for EPUB 2 compatibility)
    // =====================================================
    if (options.version === '2.0' || chapters.length > 0) {
        const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(metadata.title)}</text></docTitle>
  <navMap>
    ${chapters.map((ch, i) => `
    <navPoint id="navpoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(ch.title)}</text></navLabel>
      <content src="${ch.id}.xhtml"/>
    </navPoint>`).join('')}
  </navMap>
</ncx>`;

        zip.file('OEBPS/toc.ncx', ncx);
    }

    // =====================================================
    // 11. GENERATE EPUB BLOB
    // =====================================================
    return await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/epub+zip',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
    });
};

// =====================================================
// HELPER: Generate CSS for template
// =====================================================

const generateCSS = (template: EnhancedTemplateStyle): string => {
    const fontStack = {
        'Playfair Display': '"Playfair Display", Georgia, serif',
        'Times-Roman': '"Times New Roman", Times, serif',
        'Roboto': 'Roboto, "Helvetica Neue", sans-serif',
        'Open Sans': '"Open Sans", Arial, sans-serif',
        'Helvetica': 'Helvetica, Arial, sans-serif',
        'Courier': '"Courier New", Courier, monospace',
        'Dancing Script': '"Dancing Script", cursive'
    };

    return `
/* EPUB Styles for ${template.name} */
@charset "UTF-8";

/* Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: ${fontStack[template.fontBody] || 'serif'};
  font-size: ${template.fontSizeBody}pt;
  line-height: ${template.lineHeight};
  color: #1a1a1a;
  text-align: ${template.justification};
  ${template.hyphenation ? 'hyphens: auto; -webkit-hyphens: auto;' : ''}
}

/* Cover */
.cover { text-align: center; height: 100vh; display: flex; align-items: center; justify-content: center; }
.cover-container { max-width: 100%; }
.cover img { max-width: 100%; max-height: 100vh; }

/* Title Page */
.title-page { text-align: center; padding: 20% 10%; }
.book-title { 
  font-family: ${fontStack[template.fontHeader] || 'serif'}; 
  font-size: 2.5em; 
  margin-bottom: 0.5em;
  ${template.chapterOpening.titleCase === 'uppercase' ? 'text-transform: uppercase;' : ''}
  letter-spacing: ${template.chapterOpening.titleSpacing}pt;
}
.book-subtitle { font-size: 1.2em; font-style: italic; margin-bottom: 2em; color: #666; }
.book-author { font-size: 1.1em; margin-bottom: 0.5em; }
.book-publisher { font-size: 0.9em; color: #888; margin-top: 3em; }

/* Table of Contents */
.toc { padding: 5%; }
.toc h1 { 
  font-family: ${fontStack[template.fontHeader] || 'serif'}; 
  font-size: 1.5em; 
  margin-bottom: 1.5em;
  text-align: center;
}
.toc ol { list-style: none; }
.toc li { margin: 0.75em 0; }
.toc a { color: #1a1a1a; text-decoration: none; border-bottom: 1px dotted #ccc; }

/* Chapters */
.chapter { padding: 5%; }
.chapter-title {
  font-family: ${fontStack[template.fontHeader] || 'serif'};
  font-size: 1.8em;
  text-align: ${template.headerAlignment};
  margin-bottom: 2em;
  ${template.chapterOpening.titleCase === 'uppercase' ? 'text-transform: uppercase;' : ''}
  letter-spacing: ${template.chapterOpening.titleSpacing}pt;
  ${template.chapterOpening.sinkDepth > 0 ? `margin-top: ${template.chapterOpening.sinkDepth}%;` : ''}
}

/* Drop Cap */
${template.chapterOpening.dropCapEnabled ? `
.first-para::first-letter {
  float: left;
  font-family: ${fontStack[template.chapterOpening.dropCapFont || template.fontHeader] || 'serif'};
  font-size: ${template.chapterOpening.dropCapLines + 0.5}em;
  line-height: 0.8;
  padding-right: 0.1em;
  margin-top: 0.1em;
}` : ''}

/* Paragraphs */
p {
  margin: ${template.paragraphSpacing}pt 0;
  ${template.paragraphIndent > 0 ? `text-indent: ${template.paragraphIndent}mm;` : ''}
}
p + p { margin-top: 0; }

/* Headings */
h2, h3, h4 {
  font-family: ${fontStack[template.fontHeader] || 'serif'};
  margin: 1.5em 0 0.75em;
  text-align: ${template.headerAlignment};
}
h2 { font-size: 1.4em; }
h3 { font-size: 1.2em; }
h4 { font-size: 1.1em; }

/* Blockquotes */
blockquote {
  margin: 1.5em ${template.blockQuote.indentLeft}mm 1.5em ${template.blockQuote.indentRight}mm;
  font-style: ${template.blockQuote.fontStyle};
  font-size: ${template.blockQuote.fontSize}em;
  ${template.blockQuote.borderLeft ? `
  padding-left: 1em;
  border-left: 3px solid ${template.blockQuote.borderColor || '#ccc'};` : ''}
}

/* Section Breaks */
.section-break {
  text-align: center;
  margin: 2em 0;
  font-size: 1.2em;
  color: #888;
}

/* Images */
figure { margin: 1.5em 0; text-align: center; }
figure img { max-width: 100%; }
figcaption { font-size: 0.9em; color: #666; margin-top: 0.5em; font-style: italic; }
`;
};

// =====================================================
// HELPER: Generate Chapter HTML
// =====================================================

const generateChapterHTML = (
    chapter: { title: string; blocks: StoryBlock[]; id: string },
    template: EnhancedTemplateStyle,
    options: EPUBOptions
): string => {
    let content = '';
    let isFirstParagraph = true;

    for (const block of chapter.blocks) {
        if (block.type === 'chapter') {
            content += `<h1 class="chapter-title">${escapeXml((block as TextStoryBlock).text)}</h1>\n`;
        } else if (block.type === 'heading') {
            content += `<h2>${escapeXml((block as TextStoryBlock).text)}</h2>\n`;
        } else if (block.type === 'paragraph') {
            const text = (block as TextStoryBlock).text;
            const className = isFirstParagraph && template.chapterOpening.dropCapEnabled ? 'first-para' : '';
            content += `<p${className ? ` class="${className}"` : ''}>${escapeXml(text)}</p>\n`;
            isFirstParagraph = false;
        } else if (block.type === 'quote') {
            content += `<blockquote>${escapeXml((block as TextStoryBlock).text)}</blockquote>\n`;
        } else if (block.type === 'image') {
            const imgBlock = block as ImageStoryBlock;
            content += `<figure>
  <img src="${imgBlock.url}" alt="${escapeXml(imgBlock.caption || 'Image')}"/>
  ${imgBlock.caption ? `<figcaption>${escapeXml(imgBlock.caption)}</figcaption>` : ''}
</figure>\n`;
        } else if (block.type === 'break') {
            content += `<p class="section-break">${template.sectionBreak.ornamentCharacter || '* * *'}</p>\n`;
        }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${options.language || 'en'}">
<head>
  <title>${escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles/main.css"/>
</head>
<body class="chapter">
${content}
</body>
</html>`;
};

// =====================================================
// HELPER: Escape XML special characters
// =====================================================

const escapeXml = (str: string): string => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

// =====================================================
// QUICK EXPORT FUNCTION
// =====================================================

export const quickExportEPUB = async (
    storyBlocks: StoryBlock[],
    metadata: BookMetadata,
    coverImage?: string,
    templateId?: string
): Promise<Blob> => {
    return generateEPUB(
        storyBlocks,
        metadata,
        coverImage || null,
        {
            version: '3.0',
            reflowable: true,
            includeCover: !!coverImage,
            generateTOC: true,
            embedFonts: false, // Font embedding requires additional licensing
            accessibility: true,
            language: metadata.language || 'en'
        },
        templateId
    );
};
