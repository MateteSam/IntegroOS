import OpenAI from 'openai';

let openRouterClient: OpenAI | null = null;

export function getOpenRouterKey(): string | null {
    // Check environment variable first
    if (import.meta.env.VITE_OPENROUTER_API_KEY) {
        return import.meta.env.VITE_OPENROUTER_API_KEY;
    }

    // Check localStorage
    try {
        const key = localStorage.getItem('OPENROUTER_API_KEY');
        return key || null;
    } catch {
        return null;
    }
}

export function saveOpenRouterKey(key: string): void {
    try {
        localStorage.setItem('OPENROUTER_API_KEY', key);
        // Reset client to use new key
        openRouterClient = null;
    } catch (e) {
        console.error('Failed to save OpenRouter API key:', e);
    }
}

export function getOpenRouterClient(): OpenAI | null {
    const apiKey = getOpenRouterKey();

    if (!apiKey) {
        console.warn('[OpenRouter] No API key found');
        return null;
    }

    if (!openRouterClient) {
        openRouterClient = new OpenAI({
            apiKey,
            baseURL: 'https://openrouter.ai/api/v1',
            dangerouslyAllowBrowser: true,
            defaultHeaders: {
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Marketing Brain Command Center'
            }
        });
        console.log('[OpenRouter] Client initialized');
    }

    return openRouterClient;
}

export interface OpenRouterChatOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

// Free models available on OpenRouter
export const FREE_MODELS = {
    DEEPSEEK_V3: 'deepseek/deepseek-chat',
    DEEPSEEK_R1: 'deepseek/deepseek-r1',
    QWEN_32B: 'qwen/qwen-2.5-72b-instruct',
    MISTRAL_7B: 'mistralai/mistral-7b-instruct',
    GEMMA_2_9B: 'google/gemma-2-9b-it',
    LLAMA_3_8B: 'meta-llama/llama-3-8b-instruct'
};

export async function generateOpenRouterText(
    prompt: string,
    systemPrompt?: string,
    options: OpenRouterChatOptions = {}
): Promise<{ text: string; model: string; tokensUsed: number }> {
    const client = getOpenRouterClient();

    if (!client) {
        throw new Error('OpenRouter client not available - API key missing');
    }

    const {
        model = FREE_MODELS.DEEPSEEK_V3, // Default to DeepSeek V3 (free, powerful)
        temperature = 0.7,
        maxTokens = 4096
    } = options;

    try {
        console.log(`[OpenRouter] Generating with ${model}...`);
        const startTime = Date.now();

        const messages: any[] = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const completion = await client.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens: maxTokens
        });

        const duration = Date.now() - startTime;
        const text = completion.choices[0]?.message?.content || '';
        const tokensUsed = completion.usage?.total_tokens || 0;

        console.log(`[OpenRouter] ✓ Generated ${tokensUsed} tokens in ${duration}ms`);

        return {
            text,
            model,
            tokensUsed
        };
    } catch (error: any) {
        console.error('[OpenRouter] Generation failed:', error.message);
        throw new Error(`OpenRouter generation failed: ${error.message}`);
    }
}

export async function testOpenRouterConnection(): Promise<{ success: boolean; message: string; model?: string }> {
    try {
        const result = await generateOpenRouterText(
            'Say "Hello from OpenRouter!" in exactly 3 words.',
            'You are a helpful assistant.',
            { maxTokens: 50, model: FREE_MODELS.DEEPSEEK_V3 }
        );

        return {
            success: true,
            message: `Connected successfully! Response: "${result.text.trim()}"`,
            model: result.model
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Connection test failed'
        };
    }
}
