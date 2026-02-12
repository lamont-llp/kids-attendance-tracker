/**
 * In-memory rate limiter for export requests
 * 
 * Note: For multi-server deployments, consider using Redis-based rate limiting
 * with libraries like 'rate-limiter-flexible' or 'ioredis'
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class ExportRateLimiter {
  private requests: Map<string, RateLimitRecord> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMinutes: number = 60) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMinutes * 60 * 1000;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if a user has exceeded their rate limit
   * @param userId - The user identifier
   * @returns Object with allowed status and retry info
   */
  checkLimit(userId: string): { allowed: boolean; retryAfter?: number; remaining?: number } {
    const now = Date.now();
    const record = this.requests.get(userId);

    // No previous requests or window expired
    if (!record || now > record.resetTime) {
      this.requests.set(userId, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }

    // Within rate limit
    if (record.count < this.maxRequests) {
      record.count++;
      this.requests.set(userId, record);
      return { allowed: true, remaining: this.maxRequests - record.count };
    }

    // Rate limit exceeded
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { 
      allowed: false, 
      retryAfter: retryAfterSeconds,
      remaining: 0
    };
  }

  /**
   * Reset rate limit for a specific user (admin override)
   * @param userId - The user identifier
   */
  reset(userId: string): void {
    this.requests.delete(userId);
  }

  /**
   * Clean up expired rate limit records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [userId, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(userId);
      }
    }
  }

  /**
   * Get current stats for monitoring
   */
  getStats(): { totalUsers: number; activeUsers: number } {
    const now = Date.now();
    let activeUsers = 0;
    
    for (const record of this.requests.values()) {
      if (now <= record.resetTime) {
        activeUsers++;
      }
    }
    
    return {
      totalUsers: this.requests.size,
      activeUsers
    };
  }
}

// Singleton instance
// Max 10 exports per hour per user
export const exportRateLimiter = new ExportRateLimiter(10, 60);

/**
 * Middleware function to check export rate limit
 * @param userId - The user identifier
 * @returns Rate limit check result
 */
export function checkExportRateLimit(userId: string) {
  return exportRateLimiter.checkLimit(userId);
}
