import { supabase } from "@/integrations/supabase/client";

export const getGoogleKey = () => {
    return import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('GOOGLE_API_KEY');
};

export const getGroqKey = () => {
    return import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('GROQ_API_KEY');
};

export const getOpenRouterKey = () => {
    return import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('OPENROUTER_API_KEY');
};

export const getAIProvider = (): AIProvider => {
    try {
        const store = localStorage.getItem('neural-os-store');
        if (store) {
            const state = JSON.parse(store).state;
            return state.aiProvider || 'google';
        }
    } catch (e) {
        console.warn('AI Provider retrieval failed, defaulting to google');
    }
    return 'google';
};

export type AIProvider = 'google' | 'groq' | 'openrouter';

export type AITextResponse = {
    text: string;
    provider?: AIProvider;
    latency?: number;
};

// Enhanced retry configuration
interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000
};

// Exponential backoff helper
async function withRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < config.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if it's a rate limit error
            if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
                const delay = Math.min(config.baseDelay * Math.pow(2, attempt), config.maxDelay);
                console.log(`[AI] Rate limited. Waiting ${delay}ms before retry ${attempt + 1}/${config.maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // For non-rate-limit errors, fail fast
                throw error;
            }
        }
    }

    throw lastError || new Error('Max retries exceeded');
}

// Timeout wrapper for fetch calls
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw error;
    }
}

export async function tryGoogleGemini(prompt: string, system?: string): Promise<AITextResponse | null> {
    const startTime = Date.now();
    try {
        const key = getGoogleKey();
        if (!key) {
            console.log('[AI] No Google API key configured');
            return null;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
        const body: any = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        };

        if (system) {
            body.systemInstruction = { role: 'system', parts: [{ text: system }] };
        }

        const res = await fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[AI] Gemini error:', res.status, errorText);
            return null;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!text) {
            console.warn('[AI] Gemini returned empty response');
            return null;
        }

        return {
            text,
            provider: 'google',
            latency: Date.now() - startTime
        };
    } catch (e) {
        console.error('[AI] Google Gemini API Error:', e);
        return null;
    }
}

export async function tryGroqLlama(prompt: string, system?: string): Promise<AITextResponse | null> {
    const startTime = Date.now();
    try {
        const key = getGroqKey();
        if (!key) {
            console.log('[AI] No Groq API key configured');
            return null;
        }

        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const body = {
            model: 'llama-3.3-70b-versatile',
            messages: [
                ...(system ? [{ role: 'system', content: system }] : []),
                { role: 'user', content: prompt }
            ],
            max_tokens: 2048,
            temperature: 0.7
        };

        const res = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[AI] Groq error:', res.status, errorText);
            return null;
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || '';

        if (!text) return null;

        return {
            text,
            provider: 'groq',
            latency: Date.now() - startTime
        };
    } catch (e) {
        console.error('[AI] Groq Llama API Error:', e);
        return null;
    }
}

export async function generateAIText(prompt: string, system?: string, provider?: AIProvider): Promise<AITextResponse> {
    console.log('[AI] Starting text generation with cascading fallback...');
    const providerOrder: (() => Promise<AITextResponse | null>)[] = [];

    // Build fallback order dynamically
    providerOrder.push(async () => {
        console.log('[AI] Trying Groq (fastest)...');
        try {
            const { generateGroqText } = await import('./groq-client');
            const result = await withRetry(async () => {
                return await generateGroqText(prompt, system, { maxTokens: 2048 });
            });
            console.log('[AI] ✓ Success via Groq');
            return { text: result.text, provider: 'groq' as AIProvider };
        } catch (e: any) {
            console.warn('[AI] Groq failed:', e.message);
            return null;
        }
    });

    providerOrder.push(async () => {
        console.log('[AI] Trying OpenRouter...');
        try {
            const { generateOpenRouterText } = await import('./openrouter-client');
            const result = await withRetry(async () => {
                return await generateOpenRouterText(prompt, system, { maxTokens: 2048 });
            });
            console.log('[AI] ✓ Success via OpenRouter');
            return { text: result.text, provider: 'openrouter' as AIProvider };
        } catch (e: any) {
            console.warn('[AI] OpenRouter failed:', e.message);
            return null;
        }
    });

    providerOrder.push(async () => {
        console.log('[AI] Trying Google Gemini (final fallback)...');
        const result = await withRetry(async () => {
            const geminiResult = await tryGoogleGemini(prompt, system);
            if (!geminiResult) throw new Error('Gemini returned null');
            return geminiResult;
        });
        console.log('[AI] ✓ Success via Gemini');
        return result;
    });

    // Execute providers in order
    for (const tryProvider of providerOrder) {
        try {
            const result = await tryProvider();
            if (result && result.text) {
                return result;
            }
        } catch (e) {
            // Continue to next provider
        }
    }

    // All providers failed - create a help request for Antigravity
    const helpRequest = {
        type: 'ai_failure',
        prompt: prompt.substring(0, 500),
        system: system?.substring(0, 200),
        timestamp: new Date().toISOString(),
        context: 'All AI providers failed during text generation'
    };

    try {
        const requests = JSON.parse(localStorage.getItem('antigravity-help-queue') || '[]');
        requests.unshift(helpRequest);
        localStorage.setItem('antigravity-help-queue', JSON.stringify(requests.slice(0, 10)));
    } catch (e) {
        console.warn('Failed to queue Antigravity help request:', e);
    }

    throw new Error('All AI providers failed. Help request queued for Antigravity. Please check your API keys and internet connection.');
}

export async function extractTextFromImage(imageDataUrl: string): Promise<AITextResponse> {
    try {
        const key = getGoogleKey();
        if (!key) return { text: '' };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
        const base64 = imageDataUrl.split(',')[1] || '';
        const body = {
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: base64 } },
                        { text: 'Extract all readable text from this image. Return plain text only.' }
                    ]
                }
            ]
        };

        const res = await fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) return { text: '' };
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') || '';
        return { text, provider: 'google' };
    } catch {
        return { text: '' };
    }
}

// Generate AI response specifically for agent profiles
export async function generateAgentProfile(agentConfig: {
    name: string;
    role: string;
    skills: string[];
    personality?: string;
}): Promise<AITextResponse> {
    const prompt = `Create a professional AI agent profile for:
Name: ${agentConfig.name}
Role: ${agentConfig.role}
Skills: ${agentConfig.skills.join(', ')}
${agentConfig.personality ? `Personality: ${agentConfig.personality}` : ''}

Generate:
1. A detailed description of this agent's capabilities
2. Key responsibilities and tasks it can perform
3. How it interacts with other agents in a workflow
4. Best practices for using this agent

Format the response as JSON with keys: description, responsibilities, interactions, bestPractices`;

    const system = "You are an expert AI systems architect specializing in designing agent personas and workflows. Provide detailed, practical, and professional agent profiles.";

    return generateAIText(prompt, system);
}
