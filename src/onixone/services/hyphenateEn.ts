// Lightweight English hyphenation helper
// Heuristic-based, fast, dependency-free. Intended as an upgrade
// over the inline hyphenation heuristic in layoutEngine. Can be
// replaced later with a dictionary/pattern-based implementation.

export function hyphenateEnglish(
  word: string,
  availPx: number,
  measureTextFn: (t: string, sizePt: number, font: string) => number,
  fontSizePt: number,
  fontFamily: string
): [string, string] | null {
  if (!word || word.length < 6) return null;

  try {
    // dynamic require to avoid static circular imports
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: defaultCache, cacheKey } = require('./hyphenateCache');
    const key = cacheKey(word, fontSizePt, fontFamily);
    const cached = defaultCache.get(key);
    if (cached !== undefined) return cached;
    const res = hyphenateEnglish_impl(word, availPx, measureTextFn, fontSizePt, fontFamily);
    defaultCache.set(key, res);
    return res;
  } catch (e) {
    return hyphenateEnglish_impl(word, availPx, measureTextFn, fontSizePt, fontFamily);
  }
}

export default hyphenateEnglish;

// Provide a promise-based shim that tries Knuth-Liang first (if available)
// and falls back to the heuristic above. This allows `layoutEngine` to
// synchronously call the simple hyphenator while offering a path to the
// async Knuth implementation if desired.

function hyphenateEnglish_impl(
  word: string,
  availPx: number,
  measureTextFn: (t: string, sizePt: number, font: string) => number,
  fontSizePt: number,
  fontFamily: string
): [string, string] | null {
  const vowels = 'aeiouy';

  const fits = (s: string) => measureTextFn(s + '-', fontSizePt, fontFamily) <= availPx;

  // Generate candidate break positions (leave at least 2 chars on both sides)
  const candidates: { pos: number; score: number }[] = [];
  for (let i = 2; i <= word.length - 3; i++) {
    const left = word[i - 1];
    const right = word[i];
    let score = 0;
    // Prefer consonant -> vowel boundaries
    if (!vowels.includes(left.toLowerCase()) && vowels.includes(right.toLowerCase())) score += 5;
    // Favor vowel -> consonant next
    if (vowels.includes(left.toLowerCase()) && !vowels.includes(right.toLowerCase())) score += 3;
    // Slight preference for later breaks (avoid too-short left fragment)
    score += Math.floor((i / word.length) * 2);
    if (score > 0) candidates.push({ pos: i, score });
  }

  // Sort candidates by score (desc), then by position (desc)
  candidates.sort((a, b) => b.score - a.score || b.pos - a.pos);

  for (const c of candidates) {
    const part1 = word.slice(0, c.pos) + '-';
    const part2 = word.slice(c.pos);
    if (part1.length >= 2 && part2.length >= 2 && fits(word.slice(0, c.pos))) {
      return [part1, part2];
    }
  }

  // Last-resort: try scanning for any vowel-based split (right-to-left)
  for (let i = word.length - 2; i > 2; i--) {
    if (vowels.includes(word[i].toLowerCase())) {
      const part1 = word.slice(0, i + 1) + '-';
      const part2 = word.slice(i + 1);
      if (part1.length >= 2 && part2.length >= 2 && fits(word.slice(0, i + 1))) {
        return [part1, part2];
      }
    }
  }

  return null;
}

