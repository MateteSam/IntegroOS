
import { StoryBlock, TextStoryBlock, ImportResult, ProjectCategory } from '../types';
import { importDocument } from './importService';

export interface DevotionalDay {
    dayNumber: number;
    title: string;
    sections: {
        scripture?: string;
        message?: string;
        prayer?: string;
        actionPoint?: string;
    };
    originalBlocks: StoryBlock[];
}

/**
 * Parses a collection of files into a structured Daily Devotional
 */
export const parseDevotionalFolder = async (files: File[]): Promise<StoryBlock[]> => {
    // 1. Sort files by name to ensure correct day order
    const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const allBlocks: StoryBlock[] = [];

    for (let i = 0; i < sortedFiles.length; i++) {
        const file = sortedFiles[i];
        const result = await importDocument(file);

        if (result.success) {
            // Add a Page Break if it's not the first day
            if (i > 0) {
                allBlocks.push({
                    id: `break-day-${i}`,
                    type: 'break',
                    breakType: 'page'
                } as any);
            }

            // Extract Day Number from filename or title
            const dayNumber = i + 1;
            const dayTitle = file.name.replace(/\.[^/.]+$/, "").replace(/day\s*/i, "").trim() || `Day ${dayNumber}`;

            // Structure the content into sections (removed chapter heading)
            const structuredBlocks = structureDevotionalContent(result.storyBlocks);
            allBlocks.push(...structuredBlocks);
        }
    }

    return allBlocks;
};

// ---------------------------------------------------------------------------
// V2.0 PARSER ARCHITECTURE (Tokenizer + State Machine)
// ---------------------------------------------------------------------------

type TokenType = 'KEY_BIBLE_REF' | 'KEY_VERSE' | 'KEY_THEME' | 'KEY_MESSAGE' | 'KEY_PRAYER' | 'TEXT' | 'METADATA_SKIP' | 'METADATA_DATE';

interface Token {
    type: TokenType;
    value: string;
    originalBlock: StoryBlock;
}

const TOKEN_PATTERNS = [
    { type: 'KEY_BIBLE_REF', regex: /^bible\s*:/i },
    { type: 'KEY_VERSE', regex: /^(key\s*verse|scripture|reading)/i },
    { type: 'KEY_THEME', regex: /^(theme|topic)/i },
    { type: 'KEY_MESSAGE', regex: /^(message|devotion|reflection)/i },
    { type: 'KEY_PRAYER', regex: /^(prayer|confession|declaration)/i }
];

/**
 * Tokenizes a block of text, handling "run-on" keywords.
 * e.g. "MessageFor..." -> [KEY_MESSAGE, TEXT("For...")]
 */
const tokenizeBlock = (block: StoryBlock): Token[] => {
    if (block.type !== 'paragraph' && block.type !== 'heading' && block.type !== 'chapter') return [{ type: 'TEXT', value: '', originalBlock: block }];

    let text = (block as TextStoryBlock).text.trim();
    if (!text) return [];

    const lower = text.toLowerCase();

    // 1. Metadata detection (Pre-Tokenizer)
    if (lower.match(/^(the parchments|parchments of|by pastor|pastor \w+)/i)) {
        // Extract embedded date from metadata like "The Parchments of Truth by Pastor Alex Iheme 01 February 2026Bible: ..."
        const dateMatch = text.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
        const tokens: Token[] = [];
        if (dateMatch) {
            tokens.push({ type: 'METADATA_DATE', value: `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`, originalBlock: block });
            // Check if Bible reference is embedded after the date
            const afterDate = text.substring(text.indexOf(dateMatch[0]) + dateMatch[0].length);
            if (afterDate.match(/^\s*Bible\s*:/i)) {
                const bibleContent = afterDate.replace(/^\s*Bible\s*:\s*/i, '').trim();
                // Split at "Key Verse:" if present
                const kvMatch = bibleContent.match(/Key\s*Verse\s*:\s*(.*)/i);
                if (kvMatch) {
                    const bibleRef = bibleContent.substring(0, kvMatch.index).trim();
                    const verseContent = kvMatch[1].trim();
                    if (bibleRef) tokens.push({ type: 'KEY_BIBLE_REF', value: 'Bible', originalBlock: block }, { type: 'TEXT', value: bibleRef, originalBlock: block });
                    if (verseContent) tokens.push({ type: 'KEY_VERSE', value: 'Key Verse', originalBlock: block }, { type: 'TEXT', value: verseContent, originalBlock: block });
                } else {
                    tokens.push({ type: 'KEY_BIBLE_REF', value: 'Bible', originalBlock: block }, { type: 'TEXT', value: bibleContent, originalBlock: block });
                }
            }
        }
        return tokens.length > 0 ? tokens : [{ type: 'METADATA_SKIP', value: text, originalBlock: block }];
    }
    // Match standalone date lines
    if (lower.match(/^\d{1,2}(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i)) {
        return [{ type: 'METADATA_DATE', value: text, originalBlock: block }];
    }

    const tokens: Token[] = [];

    // 2. Keyword Detection
    let matchedKey = false;
    for (const pattern of TOKEN_PATTERNS) {
        const match = text.match(pattern.regex);
        if (match) {
            // Found a keyword at the start
            // Check what comes after. 
            // If "Message: content", separator is ": "
            // If "MessageFor", separator is ""
            const keyLen = match[0].length;
            const knownKeyType = pattern.type as TokenType;

            // Emit Keyword Token
            tokens.push({ type: knownKeyType, value: match[0], originalBlock: block });

            // Checks rest of the string
            let remainder = text.substring(keyLen);

            // Clean up leading separators (colon, dash, space)
            const cleanRemainder = remainder.replace(/^[\s:\-]+/, '');

            if (cleanRemainder.length > 0) {
                // Emit the valid content that followed the keyword
                tokens.push({ type: 'TEXT', value: cleanRemainder, originalBlock: block });
            }

            matchedKey = true;
            break;
        }
    }

    // 3. No keyword found, it's just text
    if (!matchedKey) {
        tokens.push({ type: 'TEXT', value: text, originalBlock: block });
    }

    return tokens;
};

/**
 * V2.0 State Machine Parser
 * Consumes tokens and sorts them into sections.
 */
const structureDevotionalContent = (blocks: StoryBlock[]): StoryBlock[] => {
    const output: StoryBlock[] = [];

    // Initial State
    let currentSection: TextStoryBlock['sectionRole'] = 'message';

    for (const block of blocks) {
        const tokens = tokenizeBlock(block);

        for (const token of tokens) {
            if (token.type === 'METADATA_SKIP') continue;

            if (token.type === 'METADATA_DATE') {
                output.push({
                    ...token.originalBlock,
                    id: token.originalBlock.id || `dev-date-${Math.random()}`,
                    text: token.value,
                    sectionRole: 'date'
                } as TextStoryBlock);
                continue;
            }

            if (token.type === 'KEY_BIBLE_REF') currentSection = 'bible_ref';
            else if (token.type === 'KEY_VERSE') currentSection = 'verse';
            else if (token.type === 'KEY_THEME') currentSection = 'theme';
            else if (token.type === 'KEY_MESSAGE') currentSection = 'message';
            else if (token.type === 'KEY_PRAYER') currentSection = 'prayer';

            else if (token.type === 'TEXT') {
                // Content token: assign to the active section state
                output.push({
                    ...token.originalBlock,
                    id: token.originalBlock.id || `dev-gen-${Math.random()}`,
                    text: token.value,
                    sectionRole: currentSection
                } as TextStoryBlock);
            }
        }
    }

    return output;
};
