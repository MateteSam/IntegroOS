import html2canvas from 'html2canvas';
import { getGoogleKey, getGroqKey } from './core';

export interface ComputerAction {
    action: 'click' | 'type' | 'scroll' | 'wait' | 'navigate' | 'done';
    coordinate?: { x: number; y: number };
    text?: string;
    path?: string;
    reason: string;
}

export const captureScreenshot = async (): Promise<string> => {
    const canvas = await html2canvas(document.body, {
        useCORS: true,
        scale: 0.5, // Scale down for API efficiency
        logging: false,
    });
    return canvas.toDataURL('image/jpeg', 0.8);
};

export const captureDomSummary = (): string => {
    try {
        const clickable = Array.from(document.querySelectorAll('button, a, input, [onclick], [role="button"], .cursor-pointer'))
            .map(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return null;
                return {
                    text: el.textContent?.trim().slice(0, 30) || (el as HTMLInputElement).placeholder || (el as HTMLInputElement).value || 'element',
                    type: el.tagName.toLowerCase(),
                    x: Math.round(rect.left + rect.width / 2),
                    y: Math.round(rect.top + rect.height / 2)
                };
            })
            .filter(Boolean)
            .slice(0, 40);

        return JSON.stringify(clickable);
    } catch (e) {
        return "[]";
    }
};

export const executePilotAction = async (action: ComputerAction) => {
    console.log(`[Pilot] Executing: ${action.action}`, action);

    switch (action.action) {
        case 'click':
            if (action.coordinate) {
                // Visual Feedback
                const dot = document.createElement('div');
                dot.style.position = 'fixed';
                dot.style.left = `${action.coordinate.x - 20}px`;
                dot.style.top = `${action.coordinate.y - 20}px`;
                dot.style.width = '40px';
                dot.style.height = '40px';
                dot.style.borderRadius = '50%';
                dot.style.background = 'rgba(212, 175, 55, 0.4)';
                dot.style.border = '2px solid #D4AF37';
                dot.style.boxShadow = '0 0 15px #D4AF37';
                dot.style.zIndex = '99999';
                dot.style.pointerEvents = 'none';
                dot.style.transition = 'all 0.5s ease-out';
                document.body.appendChild(dot);
                setTimeout(() => {
                    dot.style.transform = 'scale(2)';
                    dot.style.opacity = '0';
                    setTimeout(() => dot.remove(), 500);
                }, 100);

                const el = document.elementFromPoint(action.coordinate.x, action.coordinate.y);
                if (el) {
                    (el as HTMLElement).click();
                    // Also dispatch mouse events for better compatibility
                    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: action.coordinate.x, clientY: action.coordinate.y }));
                    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: action.coordinate.x, clientY: action.coordinate.y }));
                }
            }
            break;
        case 'type':
            if (action.text) {
                const activeEl = document.activeElement;
                if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
                    activeEl.value = action.text;
                    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
                    activeEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            break;
        case 'navigate':
            if (action.path) {
                window.dispatchEvent(new CustomEvent('pilot-navigate', { detail: action.path }));
            }
            break;
        case 'scroll':
            window.scrollBy(0, 400);
            break;
        case 'wait':
            await new Promise(r => setTimeout(r, 1000));
            break;
    }
};

const COMPUTER_TOOLS = [
    {
        name: 'computer_action',
        description: 'Perform a UI action on the screen based on visual perception.',
        parameters: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['click', 'type', 'scroll', 'wait', 'navigate', 'done'] },
                coordinate: {
                    type: 'object',
                    properties: {
                        x: { type: 'number', description: 'Horizontal coordinate (0 to viewport width)' },
                        y: { type: 'number', description: 'Vertical coordinate (0 to viewport height)' }
                    }
                },
                text: { type: 'string', description: 'Text to type if action is "type"' },
                path: { type: 'string', description: 'Path to navigate to if action is "navigate"' },
                reason: { type: 'string', description: 'Reasoning for this specific action' }
            },
            required: ['action', 'reason']
        }
    }
];

export async function runPilotCycle(task: string, history: any[] = [], provider: 'google' | 'groq' = 'google'): Promise<ComputerAction> {
    const screenshot = await captureScreenshot();
    const domSummary = captureDomSummary();
    const googleKey = getGoogleKey();
    const groqKey = getGroqKey();

    if (provider === 'groq') {
        if (!groqKey) throw new Error('Groq API Key not found');

        const prompt = `
CURRENT TASK: ${task}
VIEWPORT: ${window.innerWidth}x${window.innerHeight}
DOM STATE (Clickable Elements): ${domSummary}

You are the Integro Command Pilot. You cannot see the screen directly (Groq mode), but you have the DOM state above.
Perform the NEXT step to complete the task by returning a tool call.
Use coordinates provided in the DOM state.
Available Paths: /os/nexus, /os/content, /os/media, /os/intelligence, /os/settings.
`;
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const body = {
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are a Neural OS Pilot. Use the provided DOM state to act.' },
                ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : h.role, content: h.parts?.[0]?.text })),
                { role: 'user', content: prompt }
            ],
            tools: [{ type: 'function', function: COMPUTER_TOOLS[0] }],
            tool_choice: 'required'
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error(`Groq Pilot Error: ${res.statusText}`);
        const data = await res.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0]?.function;
        if (toolCall) {
            const args = JSON.parse(toolCall.arguments);
            return args as ComputerAction;
        }
        return { action: 'done', reason: 'Task complete or no action found.' };
    }

    if (!googleKey) throw new Error('Google API Key not found');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(googleKey)}`;

    const prompt = `
CURRENT TASK: ${task}
VIEWPORT: ${window.innerWidth}x${window.innerHeight}

You are the Integro Command Pilot. You see the screen and must perform the NEXT step to complete the task.
Use coordinates based on the current window size provided.
If the task is complete, use action "done".

Available Paths:
- /os/nexus (Dashboard/Projects)
- /os/content (Devotionals/Writer)
- /os/media (Brand Studio/Images)
- /os/intelligence (Analytics/Market)
- /os/settings (System Config)

Return a single tool call for the next best action.
`;

    const body = {
        contents: [
            ...history,
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: screenshot.split(',')[1]
                        }
                    }
                ]
            }
        ],
        tools: [{ functionDeclarations: COMPUTER_TOOLS }],
        toolConfig: { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['computer_action'] } }
    };

    // Fallback logic for Gemini Pilot (handles quota issues by switching to text-only mode)
    let res;
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (e) {
        console.warn('Gemini vision failed, attempting DOM-sight fallback...');
    }

    if (!res || !res.ok) {
        // Attempt DOM-sight if vision fails
        const textPrompt = `VIEWPORT: ${window.innerWidth}x${window.innerHeight}\nTASK: ${task}\nDOM STATE: ${domSummary}\nAct based on DOM state.`;
        const textBody = { ...body, contents: [{ role: 'user', parts: [{ text: textPrompt }] }] };
        res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(textBody) });
    }

    if (!res.ok) {
        const err = await res.json();
        const message = err.error?.message || res.statusText;
        if (message.toLowerCase().includes('quota') || res.status === 429) {
            throw new Error(`Gemini Quota Exceeded. Please try switching to Groq for text-based tasks or wait a few minutes.`);
        }
        throw new Error(`Gemini Pilot Error: ${message}`);
    }

    const data = await res.json();
    const toolCall = data.candidates?.[0]?.content?.parts?.find((p: any) => p.functionCall);

    if (toolCall) {
        return toolCall.functionCall.args as ComputerAction;
    }

    return { action: 'done', reason: 'No tool call returned' };
}
