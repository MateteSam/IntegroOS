
import { GoogleGenAI, Type } from "@google/genai";
import { StoryBlock, TextStoryBlock, DesignTheme, FontFamily, ContentIssue, ContentSuggestion, ManuscriptProfile, ManuscriptAnalysis, ENHANCED_TEMPLATE_STYLES, ProjectCategory, EnhancedTemplateStyle } from '../types';

export interface VisualPersonality {
    mood: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        bg: string;
    };
    fonts: {
        header: string;
        body: string;
    };
    imageryStyle: string;
    description: string;
}

const TEXT_MODEL_NAME = 'gemini-2.0-flash';
const IMAGE_MODEL_NAME = 'gemini-2.0-flash-exp';

declare const process: { env: { API_KEY?: string; GEMINI_API_KEY?: string } };

// Check if API key is available
export const hasApiKey = (): boolean => {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
    return !!apiKey && apiKey.length > 10;
};

const getAIClient = () => {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey || apiKey.length < 10) {
        throw new Error(
            "🔑 AI API Key Required! Please set VITE_GEMINI_API_KEY in your .env.local file."
        );
    }
    return new GoogleGenAI({ apiKey });
};

// Local fallback paragraph parser used when AI is unavailable
export const parseBasicParagraphs = (manuscript: string) => {
    return manuscript
        .split(/\n\s*\n/)
        .map((p, i) => ({ id: `local-${Date.now()}-${i}`, type: 'paragraph', text: p.trim() }))
        .filter(p => p.text.length > 0) as TextStoryBlock[];
};

// =====================================================
// STRUCTURE ANALYSIS
// =====================================================

export const analyzeStructure = async (manuscript: string): Promise<StoryBlock[]> => {
    // If no API key is present, avoid calling the remote API and return a local fallback
    if (!hasApiKey()) {
        console.warn('AI API key not found — using local paragraph parsing for structure analysis.');
        return parseBasicParagraphs(manuscript);
    }

    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `Analyze the following manuscript text and convert it into a structured JSON array. Each element should be an object representing a content block. Identify types: 'chapter', 'heading', 'paragraph', 'quote'. A 'chapter' is a major section like "Chapter 1". A 'heading' is a title within a chapter. 'quote' is quoted text. Everything else is a 'paragraph'.

Manuscript:
---
${manuscript.substring(0, 30000)}
---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "Block type: 'chapter', 'heading', 'paragraph', or 'quote'." },
                            text: { type: Type.STRING, description: "The text content of the block." }
                        },
                        required: ['type', 'text']
                    }
                }
            }
        });

        const rawTxt = (response as any).text || '[]';
        const cleanTxt = rawTxt.replace(/^```json\s*|\s*```$/g, '').trim();
        const parsedResult = JSON.parse(cleanTxt);
        if (!Array.isArray(parsedResult)) throw new Error("AI response was not a valid array.");

        return parsedResult.map((item: any, index: number): StoryBlock | null => {
            const validTypes: TextStoryBlock['type'][] = ['chapter', 'heading', 'paragraph', 'quote'];
            if (item.text && validTypes.includes(item.type)) {
                return { id: `sb-${Date.now()}-${index}`, type: item.type, text: item.text } as TextStoryBlock;
            }
            return null;
        }).filter((block): block is StoryBlock => Boolean(block));

    } catch (error: any) {
        // If the AI indicates quota exhaustion or a 429, fall back quietly to local parsing
        const isQuotaError = !!(error?.status === 429 || (error?.error && error.error.status === 'RESOURCE_EXHAUSTED'));
        if (isQuotaError) {
            console.warn('Gemini API quota exceeded or rate-limited — falling back to local parsing.');
            return parseBasicParagraphs(manuscript);
        }

        console.error("Error analyzing text structure with Gemini:", error?.message || error);
        return parseBasicParagraphs(manuscript);
    }
};

// =====================================================
// JACKET GENERATION
// =====================================================

export const generateJacketDescription = async (
    title: string,
    author: string,
    genre: string = 'General',
    keywords: string[] = [],
    tone: string = 'engaging'
): Promise<string> => {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `Write a compelling back cover blurb for a book.
            
            Title: ${title}
            Author: ${author}
            Genre: ${genre}
            Keywords/Themes: ${keywords.join(', ')}
            Tone: ${tone}
            
            The description should be:
            - 150-250 words long
            - Hook the reader immediately
            - Highlight key conflicts or themes without giving away spoilers
            - Formatted with paragraphs for readability
            
            Return ONLY the description text.`,
        });

        return response.text?.trim() ?? '';
    } catch (error) {
        console.error("Error generating jacket description:", error);
        throw error;
    }
};

export const improveJacketDescription = async (
    currentText: string,
    tone: string = 'engaging'
): Promise<string> => {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `Improve the following book jacket description.
            
            Current Text: "${currentText}"
            Target Tone: ${tone}
            
            Guidelines:
            - Fix grammar and flow
            - Make it more punchy and engaging
            - Keep the same core meaning
            - Format with paragraphs
            
            Return ONLY the improved text.`,
        });

        return response.text?.trim() ?? currentText;
    } catch (error) {
        console.error("Error improving jacket description:", error);
        throw error;
    }
};

export const improveText = async (
    currentText: string,
    instruction: string
): Promise<string> => {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `Edit the following text based on the instruction.
            
            Text: "${currentText}"
            Instruction: ${instruction}
            
            Return ONLY the updated text.`,
        });

        return response.text?.trim() ?? currentText;
    } catch (error) {
        console.error("Error improving text:", error);
        throw error;
    }
};

// =====================================================
// MANUSCRIPT PROFILING
// =====================================================

export const detectManuscriptProfile = async (manuscript: string): Promise<ManuscriptProfile> => {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `Analyze this manuscript excerpt and determine its profile. Be specific about genre, tone, and audience.

Manuscript excerpt:
---
${manuscript.substring(0, 15000)}
---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        genre: { type: Type.STRING, description: "Primary genre (e.g., 'Literary Fiction', 'Science Fiction', 'Romance', 'Self-Help', 'Biography')" },
                        subGenre: { type: Type.STRING, description: "Sub-genre if applicable" },
                        tone: { type: Type.STRING, description: "Overall tone (e.g., 'serious', 'humorous', 'suspenseful', 'inspirational')" },
                        targetAudience: { type: Type.STRING, description: "Target reader demographic" },
                        readingLevel: { type: Type.STRING, description: "One of: 'children', 'young_adult', 'adult', 'academic'" },
                        pacing: { type: Type.STRING, description: "One of: 'fast', 'moderate', 'slow', 'varied'" },
                        narrativeStyle: { type: Type.STRING, description: "One of: 'first_person', 'third_person_limited', 'third_person_omniscient', 'second_person'" },
                        themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Main themes in the work" },
                        confidence: { type: Type.NUMBER, description: "Confidence score 0-1" }
                    },
                    required: ['genre', 'tone', 'targetAudience', 'readingLevel', 'pacing', 'narrativeStyle', 'themes', 'confidence']
                }
            }
        });

        return JSON.parse(response.text ?? '{}') as ManuscriptProfile;
    } catch (error) {
        console.error("Error detecting manuscript profile:", error);
        return {
            genre: 'General Fiction',
            tone: 'neutral',
            targetAudience: 'General readers',
            readingLevel: 'adult',
            pacing: 'moderate',
            narrativeStyle: 'third_person_limited',
            themes: [],
            confidence: 0.3
        };
    }
};

// =====================================================
// CONTENT QUALITY ANALYSIS
// =====================================================

export const analyzeContentQuality = async (storyBlocks: StoryBlock[]): Promise<ContentIssue[]> => {
    try {
        const ai = getAIClient();
        const textContent = storyBlocks
            .filter((b): b is TextStoryBlock => 'text' in b)
            .map((b, i) => `[Block ${i}] ${b.text}`)
            .join('\n\n')
            .substring(0, 25000);

        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `You are a professional editor. Analyze this manuscript for quality issues. Look for:
1. Excessive passive voice usage
2. Repetitive words or phrases
3. Inconsistent character names or details
4. Pacing problems (too fast/slow)
5. Show vs tell issues
6. Dialogue attribution problems
7. Missing scene breaks
8. Tense inconsistencies
9. Overuse of adverbs

For each issue found, provide actionable feedback. Return a maximum of 20 most important issues.

Manuscript:
---
${textContent}
---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            severity: { type: Type.STRING, description: "One of: 'error', 'warning', 'info', 'suggestion'" },
                            category: { type: Type.STRING, description: "One of: 'grammar', 'style', 'consistency', 'structure', 'pacing', 'voice', 'formatting'" },
                            blockIndex: { type: Type.NUMBER, description: "Block index where issue was found, or -1 for general issues" },
                            message: { type: Type.STRING, description: "Clear description of the issue" },
                            suggestion: { type: Type.STRING, description: "How to fix it" },
                            originalText: { type: Type.STRING, description: "The problematic text snippet if applicable" },
                            suggestedText: { type: Type.STRING, description: "Suggested replacement if applicable" },
                            confidence: { type: Type.NUMBER, description: "Confidence 0-1" }
                        },
                        required: ['severity', 'category', 'message', 'confidence']
                    }
                }
            }
        });

        const issues = JSON.parse(response.text ?? '[]') as any[];
        return issues.map((issue, idx) => ({
            id: `issue-${Date.now()}-${idx}`,
            severity: issue.severity || 'info',
            category: issue.category || 'style',
            blockId: issue.blockIndex >= 0 ? storyBlocks[issue.blockIndex]?.id : undefined,
            message: issue.message,
            suggestion: issue.suggestion,
            originalText: issue.originalText,
            suggestedText: issue.suggestedText,
            confidence: issue.confidence || 0.7
        }));
    } catch (error) {
        console.error("Error analyzing content quality:", error);
        return [];
    }
};

// =====================================================
// IMPROVEMENT SUGGESTIONS
// =====================================================

export const generateImprovementSuggestions = async (
    storyBlocks: StoryBlock[],
    profile: ManuscriptProfile
): Promise<ContentSuggestion[]> => {
    try {
        const ai = getAIClient();
        const textContent = storyBlocks
            .filter((b): b is TextStoryBlock => 'text' in b)
            .slice(0, 10)
            .map((b, i) => `[Block ${i}: ${b.type}] ${b.text}`)
            .join('\n\n');

        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `You are a developmental editor specializing in ${profile.genre}. The target audience is ${profile.targetAudience}, expecting a ${profile.tone} tone.

Analyze these opening sections and provide 5-10 concrete improvement suggestions. Focus on:
1. Strengthening the opening hook
2. Improving character introductions
3. Enhancing descriptive passages
4. Tightening dialogue
5. Creating more tension or engagement

For each suggestion, provide both the original text and an improved version.

Content:
---
${textContent}
---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "One of: 'rewrite', 'strengthen', 'clarify', 'expand', 'condense', 'restructure'" },
                            blockIndex: { type: Type.NUMBER },
                            originalText: { type: Type.STRING },
                            suggestedText: { type: Type.STRING },
                            rationale: { type: Type.STRING, description: "Why this change improves the work" },
                            impact: { type: Type.STRING, description: "One of: 'high', 'medium', 'low'" }
                        },
                        required: ['type', 'blockIndex', 'originalText', 'suggestedText', 'rationale', 'impact']
                    }
                }
            }
        });

        const suggestions = JSON.parse(response.text ?? '[]') as any[];
        return suggestions.map((s, idx) => ({
            id: `suggestion-${Date.now()}-${idx}`,
            type: s.type || 'rewrite',
            blockId: storyBlocks[s.blockIndex]?.id || '',
            originalText: s.originalText,
            suggestedText: s.suggestedText,
            rationale: s.rationale,
            impact: s.impact || 'medium'
        }));
    } catch (error) {
        console.error("Error generating improvement suggestions:", error);
        return [];
    }
};

// =====================================================
// TEMPLATE RECOMMENDATION
// =====================================================

export const recommendTemplate = async (profile: ManuscriptProfile): Promise<string[]> => {
    const recommendations: string[] = [];

    // Prioritize beginner-friendly templates
    if (profile.readingLevel === 'children' || profile.genre.toLowerCase().includes('picture book')) {
        recommendations.push('picture-book', 'children-storybook');
    }

    if (profile.genre.toLowerCase().includes('novel') && profile.readingLevel === 'adult') {
        recommendations.push('simple-novel', 'novel-classic');
    }

    if (profile.genre.toLowerCase().includes('blog') || profile.genre.toLowerCase().includes('articles')) {
        recommendations.push('blog-to-book', 'magazine-modern');
    }

    // Existing rules...
    if (profile.readingLevel === 'children') {
        recommendations.push('children-storybook');
    }

    if (profile.genre.toLowerCase().includes('science fiction') ||
        profile.genre.toLowerCase().includes('sci-fi') ||
        profile.genre.toLowerCase().includes('dystopian') ||
        profile.genre.toLowerCase().includes('cyberpunk')) {
        recommendations.push('scifi-terminal');
    }

    if (profile.genre.toLowerCase().includes('poetry') ||
        profile.genre.toLowerCase().includes('verse') ||
        profile.genre.toLowerCase().includes('anthology')) {
        recommendations.push('poetry-elegant');
    }

    if (profile.genre.toLowerCase().includes('academic') ||
        profile.genre.toLowerCase().includes('textbook') ||
        profile.genre.toLowerCase().includes('dissertation')) {
        recommendations.push('academic-clean');
        recommendations.push('textbook-dense');
    }

    if (profile.genre.toLowerCase().includes('business') ||
        profile.genre.toLowerCase().includes('self-help') ||
        profile.genre.toLowerCase().includes('non-fiction') ||
        profile.genre.toLowerCase().includes('how-to')) {
        recommendations.push('business-modern');
    }

    if (profile.genre.toLowerCase().includes('literary') ||
        profile.genre.toLowerCase().includes('historical') ||
        profile.genre.toLowerCase().includes('memoir') ||
        profile.tone === 'serious') {
        recommendations.push('novel-classic');
    }

    if (profile.genre.toLowerCase().includes('magazine') ||
        profile.genre.toLowerCase().includes('article') ||
        profile.pacing === 'fast') {
        recommendations.push('magazine-modern');
    }

    // Default fallback to beginner-friendly
    if (recommendations.length === 0) {
        recommendations.push('simple-novel', 'business-modern');
    }

    // Remove duplicates and return top 3, preferring beginnerFriendly
    return [...new Set(recommendations)].slice(0, 3);
};

// =====================================================
// FULL MANUSCRIPT ANALYSIS
// =====================================================

export const analyzeManuscript = async (storyBlocks: StoryBlock[]): Promise<ManuscriptAnalysis> => {
    const textBlocks = storyBlocks.filter((b): b is TextStoryBlock => 'text' in b);
    const fullText = textBlocks.map(b => b.text).join('\n\n');
    const wordCount = fullText.split(/\s+/).length;
    const chapterCount = storyBlocks.filter(b => b.type === 'chapter').length;

    // Run analyses in parallel
    const [profile, issues, suggestions] = await Promise.all([
        detectManuscriptProfile(fullText),
        analyzeContentQuality(storyBlocks),
        (async () => {
            const p = await detectManuscriptProfile(fullText);
            return generateImprovementSuggestions(storyBlocks, p);
        })()
    ]);

    const recommendedTemplates = await recommendTemplate(profile);

    // Calculate health score based on issues
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const healthScore = Math.max(0, Math.min(100, 100 - (errorCount * 10) - (warningCount * 3)));

    return {
        profile,
        wordCount,
        chapterCount,
        estimatedReadingTime: Math.ceil(wordCount / 250),
        averageWordsPerChapter: chapterCount > 0 ? Math.round(wordCount / chapterCount) : wordCount,
        healthScore,
        issues,
        suggestions,
        recommendedTemplates
    };
};

// =====================================================
// EXISTING FUNCTIONS (ENHANCED)
// =====================================================

export const summarizeText = async (manuscript: string): Promise<string> => {
    if (manuscript.length < 100) return manuscript;
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `Summarize the following manuscript in one short paragraph. Capture the main theme, tone, and genre.
---
${manuscript.substring(0, 10000)}
---`
        });
        return response.text ?? "A book about compelling ideas.";
    } catch (error) {
        console.error("Error summarizing text:", error);
        return "A book about compelling ideas.";
    }
};

export const generateDesignTheme = async (summary: string): Promise<DesignTheme> => {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `Based on this book summary, generate a design theme as a JSON object.
- The color palette should have 5 hex codes: primary, secondary, accent, text, and background.
- The fonts should have a 'header' and 'body' font. Choose from: 'Playfair Display', 'Roboto', 'Open Sans', 'Times-Roman', 'Dancing Script'.
- The imageryStyle should be a short, descriptive phrase for finding stock photos (e.g., 'minimalist nature photography', 'dark academia aesthetic', 'vibrant abstract illustrations').

Summary: "${summary}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        palette: {
                            type: Type.OBJECT,
                            properties: {
                                primary: { type: Type.STRING }, secondary: { type: Type.STRING }, accent: { type: Type.STRING }, text: { type: Type.STRING }, background: { type: Type.STRING }
                            },
                            required: ["primary", "secondary", "accent", "text", "background"]
                        },
                        fonts: {
                            type: Type.OBJECT,
                            properties: { header: { type: Type.STRING }, body: { type: Type.STRING } },
                            required: ["header", "body"]
                        },
                        imageryStyle: { type: Type.STRING }
                    },
                    required: ["palette", "fonts", "imageryStyle"]
                }
            }
        });

        const theme = JSON.parse(response.text ?? '{}') as DesignTheme;
        const validFonts: FontFamily[] = ['Playfair Display', 'Roboto', 'Open Sans', 'Times-Roman', 'Dancing Script', 'Helvetica', 'Courier'];
        if (!validFonts.includes(theme.fonts.header)) theme.fonts.header = 'Playfair Display';
        if (!validFonts.includes(theme.fonts.body)) theme.fonts.body = 'Roboto';
        return theme;

    } catch (error) {
        console.error("Error generating design theme:", error);
        return {
            palette: { primary: '#312e81', secondary: '#cbd5e1', accent: '#4f46e5', text: '#0f172a', background: '#f8fafc' },
            fonts: { header: 'Playfair Display', body: 'Roboto' },
            imageryStyle: 'general abstract background'
        };
    }
};

// Consolidated with CoverAI for High-Fidelity V8 Synthesis
export const generateCoverImage = async (prompt: string, zone: 'front' | 'back' | 'spine' = 'front', numImages: number = 4): Promise<string[]> => {
    try {
        const { generateCovers } = await import('./coverAI');
        const covers = await generateCovers({
            title: prompt,
            author: 'Unknown',
            genre: 'Professional',
            synopsis: prompt,
            tone: 'vibrant',
            zone,
            count: numImages
        });
        return covers.map(c => c.layers.composite);
    } catch (e) {
        console.error("Consolidated generation failed", e);
        return [];
    }
};


export const generateBackCoverText = async (summary: string): Promise<string> => {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `Based on the following book summary, write a compelling, short back-cover blurb (2-3 paragraphs) to entice readers.
Summary: "${summary}"`
        });
        return response.text ?? "Discover a story that will change the way you see the world.";
    } catch (e) {
        console.error("Could not generate back cover text", e);
        return "Discover a story that will change the way you see the world. Inside, you'll find characters that come to life and a plot that will keep you on the edge of your seat.";
    }
}

// =====================================================
// VISUAL PERSONALITY RECOMMENDATION (X-FACTOR)
// =====================================================

export const recommendVisualPersonality = async (storyBlocks: StoryBlock[], category: ProjectCategory = 'book'): Promise<VisualPersonality> => {
    try {
        const ai = getAIClient();
        const textContent = storyBlocks
            .filter((b): b is TextStoryBlock => 'text' in b)
            .slice(0, 15)
            .map(b => b.text)
            .join('\n\n')
            .substring(0, 10000);

        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `You are a world-class creative director. Analyze this content for a ${category} and suggest a 'Visual Personality'.
            
            Content Excerpt:
            ---
            ${textContent}
            ---
            
            Task:
            1. Determine the 'Mood' (e.g., 'Cyberpunk High-Tech', 'Classic Academic', 'Swiss Modern', 'Ethereal Nature', 'Bold Financial').
            2. Choose a professional color palette (hex codes).
            3. Choose font pairings (Header and Body).
            4. Describe the imagery style.
            5. Provide a short description of WHY this design fits the content.
            
            Valid Fonts: 'Playfair Display', 'Roboto', 'Open Sans', 'Times-Roman', 'Dancing Script', 'Helvetica', 'Courier', 'Inter', 'Outfit', 'Montserrat'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mood: { type: Type.STRING },
                        colors: {
                            type: Type.OBJECT,
                            properties: {
                                primary: { type: Type.STRING },
                                secondary: { type: Type.STRING },
                                accent: { type: Type.STRING },
                                text: { type: Type.STRING },
                                bg: { type: Type.STRING }
                            },
                            required: ["primary", "secondary", "accent", "text", "bg"]
                        },
                        fonts: {
                            type: Type.OBJECT,
                            properties: {
                                header: { type: Type.STRING },
                                body: { type: Type.STRING }
                            },
                            required: ["header", "body"]
                        },
                        imageryStyle: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["mood", "colors", "fonts", "imageryStyle", "description"]
                }
            }
        });

        return JSON.parse(response.text ?? '{}') as VisualPersonality;

    } catch (error) {
        console.error("Error recommending visual personality:", error);
        return {
            mood: 'Modern Professional',
            colors: { primary: '#0f172a', secondary: '#64748b', accent: '#0ea5e9', text: '#f8fafc', bg: '#020617' },
            fonts: { header: 'Inter', body: 'Open Sans' },
            imageryStyle: 'geometric abstract patterns',
            description: 'A clean, modern look suitable for professional documents.'
        } as VisualPersonality;
    }
};

// =====================================================
// LAYOUT STRATEGY (DNA)
// =====================================================

export const recommendLayoutStrategy = async (storyBlocks: StoryBlock[], profile: ManuscriptProfile): Promise<Partial<EnhancedTemplateStyle>> => {
    try {
        const ai = getAIClient();
        const textContent = storyBlocks
            .filter((b): b is TextStoryBlock => 'text' in b)
            .slice(0, 5)
            .map(b => b.text)
            .join(' ')
            .substring(0, 5000);

        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: `As a master text designer, analyze this ${profile.genre} manuscript (Tone: ${profile.tone}) and recommend a specific layout strategy.
            
            Text Sample: "${textContent}"

            Return a JSON object matching this schema:
            {
                "chapterOpening": {
                    "sinkDepth": number, // 0-50 (percentage of page height)
                    "dropCapEnabled": boolean,
                    "dropCapLines": number, // 2-4
                    "dropCapFont": string, // "Playfair Display", "Roboto", etc.
                    "ornamentAfter": string, // "none", "line", "flourish", "stars"
                    "titleCase": string // "uppercase", "titlecase"
                },
                "headerFooter": {
                    "headerContent": string, // "title", "chapter", "none"
                    "headerPosition": string, // "center", "alternating"
                    "footerContent": string, // "page_number"
                    "pageNumberStyle": string // "arabic", "roman"
                },
                "sectionBreak": {
                    "type": string, // "ornament", "line", "blank_line"
                    "ornamentCharacter": string // specific char like "*", "❧", "✦"
                },
                "justification": string // "justify" or "left"
            }`,
            config: {
                responseMimeType: "application/json"
            }
        });

        return JSON.parse(response.text ?? '{}') as Partial<EnhancedTemplateStyle>;

    } catch (error) {
        console.error("Error recommending layout strategy:", error);
        // Return a safe default based on genre
        if (profile.genre.toLowerCase().includes('fiction')) {
            return {
                chapterOpening: { sinkDepth: 30, dropCapEnabled: true, dropCapLines: 3, dropCapFont: 'Playfair Display', ornamentAfter: 'flourish', titleCase: 'uppercase' },
                headerFooter: { headerContent: 'title', headerPosition: 'alternating', footerContent: 'page_number', pageNumberStyle: 'arabic' },
                sectionBreak: { type: 'ornament', ornamentCharacter: '***' },
                justification: 'justify'
            } as any;
        }
        return {
            chapterOpening: { sinkDepth: 10, dropCapEnabled: false, dropCapLines: 2, dropCapFont: 'Roboto', ornamentAfter: 'line', titleCase: 'titlecase' },
            headerFooter: { headerContent: 'chapter', headerPosition: 'left', footerContent: 'page_number', pageNumberStyle: 'arabic' },
            sectionBreak: { type: 'line', ornamentCharacter: '' },
            justification: 'left'
        } as any;
    }
};
