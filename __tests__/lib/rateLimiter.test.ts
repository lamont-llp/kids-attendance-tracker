import { checkExportRateLimit, exportRateLimiter } from '@/lib/rateLimiter';

describe('ExportRateLimiter', () => {
  beforeEach(() => {
    // Reset rate limiter before each test
    exportRateLimiter.reset('test-user-1');
    exportRateLimiter.reset('test-user-2');
  });

  describe('checkExportRateLimit', () => {
    it('should allow first request', () => {
      const result = checkExportRateLimit('test-user-1');
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9); // 10 max - 1 used
      expect(result.retryAfter).toBeUndefined();
    });

    it('should track multiple requests for same user', () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const result = checkExportRateLimit('test-user-1');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(9 - i);
      }
    });

    it('should allow up to 10 requests', () => {
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        const result = checkExportRateLimit('test-user-1');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block 11th request', () => {
      // Make 10 allowed requests
      for (let i = 0; i < 10; i++) {
        checkExportRateLimit('test-user-1');
      }
      
      // 11th request should be blocked
      const result = checkExportRateLimit('test-user-1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track users independently', () => {
      // User 1 makes 10 requests
      for (let i = 0; i < 10; i++) {
        checkExportRateLimit('test-user-1');
      }
      
      // User 1 should be blocked
      const user1Result = checkExportRateLimit('test-user-1');
      expect(user1Result.allowed).toBe(false);
      
      // User 2 should still be allowed
      const user2Result = checkExportRateLimit('test-user-2');
      expect(user2Result.allowed).toBe(true);
      expect(user2Result.remaining).toBe(9);
    });

    it('should reset limit for specific user', () => {
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        checkExportRateLimit('test-user-1');
      }
      
      // Should be blocked
      let result = checkExportRateLimit('test-user-1');
      expect(result.allowed).toBe(false);
      
      // Reset the user
      exportRateLimiter.reset('test-user-1');
      
      // Should be allowed again
      result = checkExportRateLimit('test-user-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should provide retry-after time when rate limited', () => {
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        checkExportRateLimit('test-user-1');
      }
      
      // Get blocked result
      const result = checkExportRateLimit('test-user-1');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
      // Should be roughly 60 minutes (3600 seconds), give or take a few seconds
      expect(result.retryAfter).toBeLessThanOrEqual(3600);
      expect(result.retryAfter).toBeGreaterThan(3595);
    });
  });

  describe('getStats', () => {
    it('should return correct stats', () => {
      // Initially no users
      let stats = exportRateLimiter.getStats();
      expect(stats.totalUsers).toBe(0);
      expect(stats.activeUsers).toBe(0);
      
      // Make requests for two users
      checkExportRateLimit('test-user-1');
      checkExportRateLimit('test-user-2');
      
      stats = exportRateLimiter.getStats();
      expect(stats.totalUsers).toBe(2);
      expect(stats.activeUsers).toBe(2);
    });
  });
});
