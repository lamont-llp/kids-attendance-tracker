/**
 * Tests for the export API endpoint
 * @jest-environment node
 */

import { POST } from '@/app/api/attendance/export/route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@kinde-oss/kinde-auth-nextjs/server', () => ({
  getKindeServerSession: jest.fn()
}));

jest.mock('@/utils', () => ({
  db: {
    select: jest.fn()
  }
}));

jest.mock('@/lib/rateLimiter', () => ({
  checkExportRateLimit: jest.fn()
}));

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '@/utils';
import { checkExportRateLimit } from '@/lib/rateLimiter';

describe('Export API Route', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    (getKindeServerSession as jest.Mock).mockReturnValue({
      getUser: jest.fn().mockResolvedValue(mockUser)
    });
    
    (checkExportRateLimit as jest.Mock).mockReturnValue({
      allowed: true,
      remaining: 9
    });
    
    // Set feature flag enabled
    process.env.FEATURE_CSV_EXPORT_ENABLED = 'true';
  });

  const createMockRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/attendance/export', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getKindeServerSession as jest.Mock).mockReturnValue({
        getUser: jest.fn().mockResolvedValue(null)
      });

      const request = createMockRequest({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        ageGroup: 'all'
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 if rate limit exceeded', async () => {
      (checkExportRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        retryAfter: 3600,
        remaining: 0
      });

      const request = createMockRequest({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        ageGroup: 'all'
      });

      const response = await POST(request);
      expect(response.status).toBe(429);
      
      const data = await response.json();
      expect(data.error).toContain('Rate limit exceeded');
      expect(data.retryAfter).toBe(3600);
      
      // Check rate limit headers
      expect(response.headers.get('Retry-After')).toBe('3600');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });
  });

  describe('Feature Flag', () => {
    it('should return 403 if export feature is disabled', async () => {
      process.env.FEATURE_CSV_EXPORT_ENABLED = 'false';

      const request = createMockRequest({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        ageGroup: 'all'
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
      
      const data = await response.json();
      expect(data.error).toBe('Export feature is not enabled');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 if startDate is missing', async () => {
      const request = createMockRequest({
        endDate: '2024-01-31',
        ageGroup: 'all'
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Missing required parameters');
    });

    it('should return 400 if endDate is missing', async () => {
      const request = createMockRequest({
        startDate: '2024-01-01',
        ageGroup: 'all'
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Missing required parameters');
    });

    it('should return 400 for invalid date format', async () => {
      const request = createMockRequest({
        startDate: 'invalid-date',
        endDate: '2024-01-31',
        ageGroup: 'all'
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Invalid date format');
    });

    it('should return 400 if endDate is before startDate', async () => {
      const request = createMockRequest({
        startDate: '2024-01-31',
        endDate: '2024-01-01',
        ageGroup: 'all'
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('End date must be after start date');
    });

    it('should return 400 if date range exceeds 90 days', async () => {
      const request = createMockRequest({
        startDate: '2024-01-01',
        endDate: '2024-05-01', // More than 90 days
        ageGroup: 'all'
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Date range cannot exceed 90 days');
    });

    it('should return 400 for invalid age group', async () => {
      const request = createMockRequest({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        ageGroup: 'invalid-group'
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Invalid age group');
    });
  });

  describe('Dataset Size Limits', () => {
    it('should return 413 if dataset exceeds 50,000 records', async () => {
      // Mock count query to return large number
      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockLeftJoin = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockResolvedValue([{ count: 60000 }]);

      (db.select as jest.Mock).mockReturnValue({
        from: mockFrom.mockReturnValue({
          leftJoin: mockLeftJoin.mockReturnValue({
            where: mockWhere
          })
        })
      });

      const request = createMockRequest({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        ageGroup: 'all'
      });

      const response = await POST(request);
      expect(response.status).toBe(413);
      
      const data = await response.json();
      expect(data.error).toContain('Dataset too large');
      expect(data.totalRecords).toBe(60000);
      expect(data.maxRecords).toBe(50000);
    });
  });

  describe('Successful Export', () => {
    it('should return CSV stream with correct headers for valid request', async () => {
      // Mock count query
      const mockCountSelect = jest.fn().mockReturnThis();
      const mockCountFrom = jest.fn().mockReturnThis();
      const mockCountLeftJoin = jest.fn().mockReturnThis();
      const mockCountWhere = jest.fn().mockResolvedValue([{ count: 100 }]);

      // Mock data query
      const mockDataSelect = jest.fn().mockReturnThis();
      const mockDataFrom = jest.fn().mockReturnThis();
      const mockDataLeftJoin = jest.fn().mockReturnThis();
      const mockDataWhere = jest.fn().mockReturnThis();
      const mockDataOrderBy = jest.fn().mockReturnThis();
      const mockDataLimit = jest.fn().mockReturnThis();
      const mockDataOffset = jest.fn().mockResolvedValue([
        {
          id: 1,
          kidId: 101,
          present: true,
          date: '2024-01-15',
          checkInTime: new Date('2024-01-15T09:30:00'),
          kid_name: 'John Doe',
          kid_age: '5',
          kid_isVisitor: false
        }
      ]);

      let callCount = 0;
      (db.select as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call is for count
          return {
            from: mockCountFrom.mockReturnValue({
              leftJoin: mockCountLeftJoin.mockReturnValue({
                where: mockCountWhere
              })
            })
          };
        } else {
          // Subsequent calls are for data
          return {
            from: mockDataFrom.mockReturnValue({
              leftJoin: mockDataLeftJoin.mockReturnValue({
                where: mockDataWhere.mockReturnValue({
                  orderBy: mockDataOrderBy.mockReturnValue({
                    limit: mockDataLimit.mockReturnValue({
                      offset: mockDataOffset
                    })
                  })
                })
              })
            })
          };
        }
      });

      const request = createMockRequest({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        ageGroup: 'all'
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
      expect(response.headers.get('Content-Disposition')).toContain('attendance-export-2024-01-01-to-2024-01-31.csv');
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9');
    });

    it('should use default ageGroup value if not provided', async () => {
      // Mock queries
      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockLeftJoin = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockResolvedValue([{ count: 0 }]);

      (db.select as jest.Mock).mockReturnValue({
        from: mockFrom.mockReturnValue({
          leftJoin: mockLeftJoin.mockReturnValue({
            where: mockWhere
          })
        })
      });

      const request = createMockRequest({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
        // ageGroup not provided, should default to 'all'
      });

      const response = await POST(request);
      
      // Should succeed with default ageGroup
      expect(response.status).not.toBe(400);
    });
  });
});
