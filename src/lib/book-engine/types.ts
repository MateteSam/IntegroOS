export type PageFormat = 'A4' | 'Letter' | 'A5' | 'SixByNine' | 'EightHalfByEleven' | 'Custom';
export type Quality = 'web' | 'print' | 'high-res';
export type LayoutPreset = 'arrow_chapter' | 'heritage_classic' | 'workbook_modern' | 'publisher_pro';

export type LayoutSuggestion = {
    preset?: LayoutPreset;
    pullQuotes?: { text: string }[]
};

export type CoverOptions = {
    title: string;
    subtitle?: string;
    author: string;
    colors: { primary: string; secondary: string; accent1?: string; accent2?: string };
    fonts: { title: string; body: string };
    template: 'minimal' | 'modern' | 'classic' | 'big_type' | 'split_band' | 'diagonal_mask' | 'Sovereign_Avant_Garde' | 'Clinical_Luxury';
    format: PageFormat;
    titleAlign?: 'left' | 'center';
    autoContrast?: boolean;
    guides?: boolean;
};

export type BookContent = {
    chapters: { title: string; paragraphs: string[] }[];
};

export type PageDimensions = {
    widthMm: number;
    heightMm: number;
    widthPx300: number;
    heightPx300: number;
};
