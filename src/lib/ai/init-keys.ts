// Initialize API keys immediately
import { saveGroqKey } from './groq-client';
import { saveOpenRouterKey } from './openrouter-client';

// Save the provided API keys
saveGroqKey('gsk_TxonAgjOIJdguYVvTy9iWGdyb3FYOJGRrwbhSTzgzY0Il6gTmFq');
saveOpenRouterKey('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');

console.log('[AI] API keys initialized and saved to localStorage');
