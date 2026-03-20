import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function getGroqKey(): string | null {
    // Check localStorage FIRST (where user/init-keys saves them)
    try {
        const key = localStorage.getItem('GROQ_API_KEY');
        if (key && key.length > 10) return key;
    } catch { }

    // Check environment variable as fallback
    if (import.meta.env.VITE_GROQ_API_KEY) {
        return import.meta.env.VITE_GROQ_API_KEY;
    }

    return null;
}

export function saveGroqKey(key: string): void {
    try {
        localStorage.setItem('GROQ_API_KEY', key);
        // Reset client to use new key
        groqClient = null;
    } catch (e) {
        console.error('Failed to save Groq API key:', e);
    }
}

export function getGroqClient(): Groq | null {
    const apiKey = getGroqKey();

    if (!apiKey) {
        console.warn('[Groq] No API key found');
        return null;
    }

    if (!groqClient) {
        groqClient = new Groq({
            apiKey,
            dangerouslyAllowBrowser: true // Required for client-side usage
        });
        console.log('[Groq] Client initialized');
    }

    return groqClient;
}

export interface GroqChatOptions {
    model?: 'llama-3.3-70b-versatile' | 'llama-3.1-70b-versatile' | 'mixtral-8x7b-32768';
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export async function generateGroqText(
    prompt: string,
    systemPrompt?: string,
    options: GroqChatOptions = {}
): Promise<{ text: string; model: string; tokensUsed: number }> {
    const client = getGroqClient();

    if (!client) {
        throw new Error('Groq client not available - API key missing');
    }

    const {
        model = 'llama-3.3-70b-versatile', // Default to latest Llama 3.3 70B
        temperature = 0.7,
        maxTokens = 4096,
        stream = false
    } = options;

    try {
        console.log(`[Groq] Generating with ${model}...`);
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
            max_tokens: maxTokens,
            stream: false // Explicitly disable streaming to get ChatCompletion type
        });

        const duration = Date.now() - startTime;
        const text = completion.choices[0]?.message?.content || '';
        const tokensUsed = completion.usage?.total_tokens || 0;

        console.log(`[Groq] ✓ Generated ${tokensUsed} tokens in ${duration}ms (${Math.round(tokensUsed / (duration / 1000))} tokens/sec)`);

        return {
            text,
            model,
            tokensUsed
        };
    } catch (error: any) {
        console.error('[Groq] Generation failed:', error.message);
        throw new Error(`Groq generation failed: ${error.message}`);
    }
}

export async function testGroqConnection(): Promise<{ success: boolean; message: string; model?: string }> {
    try {
        const result = await generateGroqText(
            'Say "Hello from Groq!" in exactly 3 words.',
            'You are a helpful assistant.',
            { maxTokens: 50 }
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
