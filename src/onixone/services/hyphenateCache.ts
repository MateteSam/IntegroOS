// Simple LRU cache for hyphenation results to speed up repeated calls
type HyphenResult = [string, string] | null;

class LRUCache {
  private _maxSize: number;
  private map: Map<string, HyphenResult>;
  // instrumentation
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 2000) {
    this._maxSize = maxSize;
    this.map = new Map();
  }

  get maxSize(): number { return this._maxSize; }
  set maxSize(n: number) { this._maxSize = n; }

  get(key: string): HyphenResult | undefined {
    const val = this.map.get(key);
    if (val === undefined) {
      this.misses++;
      return undefined;
    }
    this.hits++;
    // refresh order
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  set(key: string, value: HyphenResult) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this._maxSize) {
      // remove oldest
      const first = this.map.keys().next().value;
      if (first !== undefined) this.map.delete(first);
    }
  }

  clear() {
    this.map.clear();
  }

  stats() {
    return { size: this.map.size, hits: this.hits, misses: this.misses };
  }
}

const defaultCache = new LRUCache(4000);

// Persistence layer: localStorage in browser, fallback to Node fs
const PERSIST_KEY = 'onixone.hyphen.cache.v1';
const FS_PATH = '.hyphen_cache.json';

function loadPersisted(cache: LRUCache) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(PERSIST_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') {
          for (const k of Object.keys(obj)) cache.set(k, obj[k]);
        }
      }
      return;
    }
  } catch (e) {
    // ignore
  }
  try {
    // Node fallback
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    if (fs && fs.existsSync(FS_PATH)) {
      const raw = fs.readFileSync(FS_PATH, 'utf8');
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        for (const k of Object.keys(obj)) cache.set(k, obj[k]);
      }
    }
  } catch (e) {
    // ignore
  }
}

function savePersisted(cache: LRUCache) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Serialize map into object
      const obj: Record<string, HyphenResult> = {};
      for (const [k, v] of (cache as any).map.entries()) obj[k] = v;
      window.localStorage.setItem(PERSIST_KEY, JSON.stringify(obj));
      return;
    }
  } catch (e) {
    // ignore
  }
  try {
    const fs = require('fs');
    const obj: Record<string, HyphenResult> = {};
    for (const [k, v] of (cache as any).map.entries()) obj[k] = v;
    fs.writeFileSync(FS_PATH, JSON.stringify(obj), 'utf8');
  } catch (e) {
    // ignore
  }
}

// load persisted cache on module init
try {
  loadPersisted(defaultCache);
} catch (e) {
  // ignore
}

// periodic flush when running in Node or browser
let flushTimer: any = null;
function scheduleFlush() {
  try {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      try {
        savePersisted(defaultCache);
      } finally {
        flushTimer = null;
      }
    }, 2000);
  } catch (e) { }
}

export function cacheKey(word: string, fontSizePt: number, fontFamily: string) {
  return `${word}::${fontSizePt}::${fontFamily}`;
}

export function cacheStats() {
  scheduleFlush();
  return defaultCache.stats();
}

export function persistCacheImmediately() {
  savePersisted(defaultCache);
}

export function setCacheMaxSize(n: number) {
  try {
    if (typeof n !== 'number' || n < 64) return false;
    defaultCache.maxSize = n;
    scheduleFlush();
    return true;
  } catch (e) {
    return false;
  }
}

export function getCacheMaxSize() {
  try {
    return defaultCache.maxSize;
  } catch (e) {
    return 4000;
  }
}

export default defaultCache;
