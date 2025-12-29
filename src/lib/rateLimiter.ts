/**
 * Client-side rate limiter for API calls
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  /**
   * Check if a request is allowed under rate limits
   * @param key - Unique identifier for the rate limit (e.g., 'generate-asset')
   * @param config - Rate limit configuration
   * @returns true if request is allowed, false if rate limited
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(
      timestamp => now - timestamp < config.windowMs
    );
    
    // Check if we're under the limit
    if (validRequests.length >= config.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  /**
   * Get time until next request is allowed
   * @param key - Unique identifier for the rate limit
   * @param config - Rate limit configuration
   * @returns milliseconds until next request is allowed
   */
  getWaitTime(key: string, config: RateLimitConfig): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const now = Date.now();
    const oldestRequest = requests[0];
    const timeSinceOldest = now - oldestRequest;
    
    if (timeSinceOldest >= config.windowMs) return 0;
    
    return config.windowMs - timeSinceOldest;
  }
  
  /**
   * Reset rate limit for a key
   * @param key - Unique identifier for the rate limit
   */
  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Default configurations
export const RATE_LIMITS = {
  AI_GENERATION: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  ASSET_GENERATION: { maxRequests: 5, windowMs: 30000 }, // 5 per 30 seconds
  FILE_UPLOAD: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  DATABASE_WRITE: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
};
