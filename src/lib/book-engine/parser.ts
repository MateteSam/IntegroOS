import { BookContent } from './types';

export const parseManuscript = (text: string): BookContent => {
    const lines = text.split(/\r?\n/);
    const chapters: { title: string; paragraphs: string[] }[] = [];
    let currentTitle = '';
    let buffer: string[] = [];

    const flushChapter = () => {
        if (!currentTitle && buffer.length === 0) return;
        if (!currentTitle) currentTitle = 'Chapter';
        const paras = buffer.join('\n').split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
        if (paras.length) {
            chapters.push({ title: currentTitle, paragraphs: paras });
        }
        buffer = [];
    };

    for (const line of lines) {
        const t = line.trim();
        if (/^(#|##|###)\s+/.test(t) || /^chapter\b/i.test(t)) {
            flushChapter();
            currentTitle = t.replace(/^(#|##|###)\s+/, '') || t;
        } else {
            buffer.push(line);
        }
    }
    flushChapter();

    if (!chapters.length) {
        chapters.push({
            title: 'Manuscript',
            paragraphs: text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean)
        });
    }
    return { chapters };
};
