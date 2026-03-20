// Knuth-Liang hyphenation via Hypher patterns (en-us)
// Uses Hypher + hyphenation.en-us to produce syllable fragments,
// then chooses a break that fits measured width.

import type { Hypher as HypherType } from 'hypher';
import defaultCache, { cacheKey } from './hyphenateCache';
// Patterns package doesn't always have types; we'll import dynamically
let Hypher: any = null;
let enPatterns: any = null;
let hypherInstance: any = null;

async function ensureHypher() {
  if (hypherInstance) return hypherInstance;
  try {
    if (!Hypher) {
      const hypherModuleName = 'hypher';
      // @vite-ignore
      const mod = await import(/* @vite-ignore */ hypherModuleName).catch(() => null);
      Hypher = mod ? (mod.default || mod) : null;
    }
    if (!enPatterns) {
      const patternsModuleName = 'hyphenation.en-us';
      // @vite-ignore
      const pat = await import(/* @vite-ignore */ patternsModuleName).catch(() => null);
      enPatterns = pat ? (pat.default || pat) : null;
    }
    if (Hypher && enPatterns) {
      hypherInstance = new Hypher(enPatterns);
    } else {
      hypherInstance = null;
    }
  } catch {
    hypherInstance = null;
  }
  return hypherInstance;
}

export async function hyphenateKnuth(
  word: string,
  availPx: number,
  measureTextFn: (t: string, sizePt: number, font: string) => number,
  fontSizePt: number,
  fontFamily: string
): Promise<[string, string] | null> {
  if (!word || word.length < 6) return null;
  const key = cacheKey(word, fontSizePt, fontFamily);
  const cached = defaultCache.get(key);
  if (cached !== undefined) return cached;
  const h = await ensureHypher();
  if (!h || typeof h.hyphenate !== 'function') return null;

  const fragments: string[] = h.hyphenate(word);
  // If hypher returns empty, fallback
  if (!fragments || fragments.length === 0) return null;

  // Reconstruct possible left parts by joining first N fragments
  const candidates: { left: string; right: string; pos: number }[] = [];
  for (let i = 1; i < fragments.length; i++) {
    const left = fragments.slice(0, i).join('');
    const right = fragments.slice(i).join('');
    if (left.length >= 2 && right.length >= 2) {
      candidates.push({ left: left + '-', right, pos: i });
    }
  }

  // Prefer later breaks (avoid too-small left), but ensure measured width fits
  for (let i = candidates.length - 1; i >= 0; i--) {
    const c = candidates[i];
    const w = measureTextFn(c.left, fontSizePt, fontFamily);
    if (w <= availPx) {
      defaultCache.set(key, [c.left, c.right]);
      return [c.left, c.right];
    }
  }

  defaultCache.set(key, null);
  return null;
}

export default hyphenateKnuth;
