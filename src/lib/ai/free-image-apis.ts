/**
 * Free AI Image Generation APIs
 * Implements Pollinations AI (free, no key) and Together AI (free FLUX.1)
 */

// Pollinations AI - Version 4.4.0 (Text-Safe Hybrid Engine)
export async function generatePollinationsImage(prompt: string): Promise<{ imageUrl: string; method: string } | null> {
    const POLLINATIONS_VERSION = '4.4.0';
    console.log(`[Pollinations v${POLLINATIONS_VERSION}] Starting generation...`);

    // Priority: Local Storage > Environment > Direct Fallback
    const rawKey = localStorage.getItem('POLLINATIONS_API_KEY') ||
        import.meta.env.VITE_POLLINATIONS_API_KEY ||
        'sk_jzz6ODVFGSLza6v4ClJ8tWPchhMkPhoy';

    // For gen.pollinations.ai, secret keys starting with sk_ should likely be used as-is
    // only prepend plln_ if it's a completely bare key without sk_ or pk_
    const apiKey = rawKey && !rawKey.startsWith('sk_') && !rawKey.startsWith('pk_') && !rawKey.startsWith('plln_')
        ? `plln_${rawKey}` : rawKey;

    console.log(`[Pollinations] Authenticating with Bearer Token (v4.4.0)...`);

    // Create a precise, clean prompt for Flux
    const seed = Math.floor(Math.random() * 999999);
    // SMART HYBRID LOGIC: Force no-text to prevent garbled letters
    // We append these keywords to ensure the AI focuses on graphics/symbols only
    const hybridNegatives = "no text, no letters, no words, no signatures, watermark-free, clean graphic foundation";
    const cleanPrompt = `${prompt.replace(/[^\w\s]/g, ' ').trim().slice(0, 300)}, ${hybridNegatives}`;

    // Construct URL - We keep params but remove key from URL for security, use header instead
    const url = `https://gen.pollinations.ai/image/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true&enhance=false`;

    try {
        console.log('[Pollinations] Fetching image bytes with auth header...');
        const res = await fetch(url, {
            headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
            signal: AbortSignal.timeout(60000)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Pollinations API failed (${res.status}): ${err.slice(0, 100)}`);
        }

        const blob = await res.blob();
        if (blob.size < 1000) throw new Error('Generated image is too small (likely an error page)');

        const base64 = await blobToBase64(blob);
        console.log('[Pollinations] ✓ Successfully fetched and converted to base64');

        return {
            imageUrl: base64,
            method: 'pollinations'
        };
    } catch (e: any) {
        console.error('[Pollinations] Fetch failed:', e.message);

        // If fetch fails but we have a key, we'll try the direct URL with key as a last resort
        const fallbackUrl = apiKey ? `${url}&key=${apiKey}` : url;
        return {
            imageUrl: fallbackUrl,
            method: 'pollinations'
        };
    }
}

// Helper to convert blob to base64 data URL
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Together AI - Free FLUX.1 Schnell model (unlimited for 3 months)
export async function generateTogetherImage(prompt: string): Promise<{ imageUrl: string; method: string } | null> {
    try {
        const apiKey = localStorage.getItem('TOGETHER_API_KEY') || import.meta.env.VITE_TOGETHER_API_KEY;

        if (!apiKey) {
            console.warn('[Together] No API key found');
            throw new Error('Missing Together AI Key');
        }

        console.log('[Together] Generating image with FLUX.1 Schnell for:', prompt.slice(0, 50));

        const response = await fetch('https://api.together.xyz/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'black-forest-labs/FLUX.1-schnell-Free',
                prompt: `Professional brand logo design: ${prompt}. High quality, modern, clean design`,
                width: 1024,
                height: 1024,
                steps: 4, // FLUX.1 Schnell uses 4 steps
                n: 1,
                response_format: 'b64_json'
            }),
            signal: AbortSignal.timeout(60000) // 60s timeout
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Together] API Error:', response.status, error);
            throw new Error(`Together API ${response.status}: ${error.slice(0, 50)}`);
        }

        const data = await response.json();
        const imageObj = data.data?.[0];

        if (imageObj?.b64_json) {
            console.log('[Together] ✓ Image generated successfully with FLUX.1 (b64_json)');
            return {
                imageUrl: `data:image/png;base64,${imageObj.b64_json}`,
                method: 'together-flux'
            };
        } else if (imageObj?.url) {
            console.log('[Together] ✓ Image generated successfully with FLUX.1 (url)');
            return {
                imageUrl: imageObj.url,
                method: 'together-flux'
            };
        }

        console.warn('[Together] No image data in response:', data);
        return null;
    } catch (error: any) {
        console.error('[Together] Error:', error.message);
        return null;
    }
}

// OpenRouter Image Generation (using Gemini 2.0 Flash via chat/completions)
export async function generateOpenRouterImage(prompt: string): Promise<{ imageUrl: string; method: string } | null> {
    try {
        const apiKey = localStorage.getItem('OPENROUTER_API_KEY') || import.meta.env.VITE_OPENROUTER_API_KEY;

        if (!apiKey) {
            console.warn('[OpenRouter Image] No API key found');
            throw new Error('Missing OpenRouter API Key');
        }

        console.log('[OpenRouter Image] Generating with Gemini 2.0 Flash for:', prompt.slice(0, 50));

        // Use chat/completions with modalities for image generation
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Marketing Brain'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [
                    {
                        role: 'user',
                        content: `Generate a professional minimalist business logo image for: ${prompt}. 
Style: Modern, clean, high quality, vector style, white background.
Output only the image, no text explanation.`
                    }
                ],
                // CRITICAL: Request image output modality
                modalities: ['image', 'text'],
                max_tokens: 1024
            }),
            signal: AbortSignal.timeout(90000) // 90s timeout for image generation
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[OpenRouter Image] API Error:', response.status, errText);
            throw new Error(`OpenRouter ${response.status}: ${errText.slice(0, 100)}`);
        }

        const data = await response.json();
        console.log('[OpenRouter Image] Response received, parsing...');

        // Parse the response - look for image content in the message
        const content = data.choices?.[0]?.message?.content;

        // Handle array content (multimodal response)
        if (Array.isArray(content)) {
            for (const part of content) {
                if (part.type === 'image_url' && part.image_url?.url) {
                    console.log('[OpenRouter Image] ✓ Found image_url in response');
                    return {
                        imageUrl: part.image_url.url,
                        method: 'openrouter-gemini'
                    };
                }
                if (part.type === 'image' && part.image) {
                    console.log('[OpenRouter Image] ✓ Found base64 image in response');
                    return {
                        imageUrl: part.image.startsWith('data:') ? part.image : `data:image/png;base64,${part.image}`,
                        method: 'openrouter-gemini'
                    };
                }
            }
        }

        // Handle inline_data response format (Gemini style)
        if (data.choices?.[0]?.message?.content_parts) {
            for (const part of data.choices[0].message.content_parts) {
                if (part.inline_data?.data) {
                    console.log('[OpenRouter Image] ✓ Found inline_data in response');
                    return {
                        imageUrl: `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`,
                        method: 'openrouter-gemini'
                    };
                }
            }
        }

        console.warn('[OpenRouter Image] No image found in response:', JSON.stringify(data).slice(0, 200));
        return null;
    } catch (error: any) {
        console.error('[OpenRouter Image] Error:', error.message);
        return null;
    }
}

export function saveTogetherKey(key: string): void {
    try {
        localStorage.setItem('TOGETHER_API_KEY', key);
        console.log('[Together] API key saved');
    } catch (e) {
        console.error('Failed to save Together API key:', e);
    }
}

export function getTogetherKey(): string | null {
    return localStorage.getItem('TOGETHER_API_KEY') || import.meta.env.VITE_TOGETHER_API_KEY || null;
}
