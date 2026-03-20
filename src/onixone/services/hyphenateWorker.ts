// Background precompute worker for hyphenation
// Scans text, extracts words, and fills the cache using the Knuth hyphenator.

import hyphenateKnuth from './hyphenateKnuth';
import defaultCache, { cacheKey } from './hyphenateCache';

export async function precomputeHyphenationForText(
  text: string,
  fontSizePt: number,
  fontFamily: string
) {
  if (!text) return;
  const words = Array.from(new Set(
    text
      .replace(/[^A-Za-z\s'-]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(Boolean)
  ));

  for (const w of words) {
    const key = cacheKey(w, fontSizePt, fontFamily);
    if (defaultCache.get(key) !== undefined) continue;
    try {
      const res = await hyphenateKnuth(w, 99999, (t) => 0, fontSizePt, fontFamily);
      // hyphenateKnuth expects measure function; but for precompute we only need fragments
      defaultCache.set(key, res || null);
    } catch (e) {
      // ignore individual failures
    }
  }
}

export async function precomputeHyphenationForBlocks(blocks: any[], fontSizePt: number, fontFamily: string) {
  for (const b of blocks) {
    if (b.type === 'text' && b.text) {
      await precomputeHyphenationForText(b.text, fontSizePt, fontFamily);
    }
    if (b.type === 'note' && b.text) {
      await precomputeHyphenationForText(b.text, fontSizePt, fontFamily);
    }
  }
}

export default { precomputeHyphenationForText, precomputeHyphenationForBlocks };
