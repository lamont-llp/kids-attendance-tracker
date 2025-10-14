import { GET } from '@/app/api/attendance/export/route';
import { NextResponse } from 'next/server';

// Mock Kinde auth for permissions
jest.mock('@kinde-oss/kinde-auth-nextjs/server', () => ({
  getKindeServerSession: () => ({
    isAuthenticated: jest.fn(async () => true),
    getPermission: jest.fn(async (perm: string) => ({
      isGranted: perm === 'admin' || perm === 'export:attendance',
    })),
    getUser: jest.fn(async () => ({ id: 'user_1' })),
  }),
}));

// Mock DB
jest.mock('@/utils', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([
        { name: 'Alice', age: 10, present: true, day: 1, date: '2025-03-01' },
        { name: 'Alice', age: 10, present: false, day: 2, date: '2025-03-02' },
        { name: 'Bob', age: 12, present: true, day: 1, date: '2025-03-01' },
      ]),
    })),
  },
}));

describe('Attendance Export API', () => {
  beforeAll(() => {
    process.env.REPORTS_ATTENDANCE_CSV_EXPORT_ENABLED = 'true';
  });
  it('should return CSV with correct headers', async () => {
    const request = new Request('http://localhost/api/attendance/export?ageGroup=10-12&month=03/2025');
    const response = await GET(request);

    // Check headers
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toContain('attendance-03-2025');

    // Check body
    const text = await response.text();
    expect(text).toContain('Name,Age,2025-03-01,2025-03-02');
    expect(text).toContain('"Alice",10,Present,Absent');
    expect(text).toContain('"Bob",12,Present,');
  });

  it('should return 400 on invalid month format', async () => {
    const request = new Request('http://localhost/api/attendance/export?ageGroup=10-12&month=2025-03');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid month format. Please use MM/YYYY');
  });

  it('should return 404 when no data found', async () => {
    // Override chain to resolve empty for this call only
    (require('@/utils').db.select as jest.Mock).mockReturnValueOnce({
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValueOnce([]),
    });

    const request = new Request('http://localhost/api/attendance/export?ageGroup=10-12&month=03/2025');
    const response = await GET(request);

    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBe('No attendance data found');
  });

  it('should return 400 when month is missing', async () => {
    const request = new Request('http://localhost/api/attendance/export?ageGroup=10-12');
    const response = await GET(request);

    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe('Month parameter is required');
  });

  it('should return 403 when user lacks permission', async () => {
    // Override Kinde mock to deny permissions
    const kinde = require('@kinde-oss/kinde-auth-nextjs/server');
    kinde.getKindeServerSession = () => ({
      isAuthenticated: jest.fn(async () => true),
      getPermission: jest.fn(async () => ({ isGranted: false })),
      getUser: jest.fn(async () => ({ id: 'user_2' })),
    });

    const request = new Request('http://localhost/api/attendance/export?ageGroup=10-12&month=03/2025');
    const response = await GET(request);

    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBe('Forbidden');
  });

  it('returns 404 when feature flag is disabled', async () => {
    const prev = process.env.REPORTS_ATTENDANCE_CSV_EXPORT_ENABLED;
    process.env.REPORTS_ATTENDANCE_CSV_EXPORT_ENABLED = 'false';

    const request = new Request('http://localhost/api/attendance/export?ageGroup=10-12&month=03/2025');
    const response = await GET(request);

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Feature disabled');

    process.env.REPORTS_ATTENDANCE_CSV_EXPORT_ENABLED = prev || 'true';
  });

  it('applies per-user rate limiting and returns 429 on overflow', async () => {
    const prev = process.env.REPORTS_ATTENDANCE_CSV_EXPORT_ENABLED;
    process.env.REPORTS_ATTENDANCE_CSV_EXPORT_ENABLED = 'true';

    // Ensure Kinde returns a stable user id
    const kinde = require('@kinde-oss/kinde-auth-nextjs/server');
    kinde.getKindeServerSession = () => ({
      isAuthenticated: jest.fn(async () => true),
      getPermission: jest.fn(async () => ({ isGranted: true })),
      getUser: jest.fn(async () => ({ id: 'user_rate_test' })),
    });

    // Mock DB to avoid hitting real DB
    (require('@/utils').db.select().orderBy as jest.Mock).mockResolvedValue([
      { name: 'Alice', age: 10, present: true, day: 1, date: '2025-03-01' },
    ]);

    const reqFactory = () => new Request('http://localhost/api/attendance/export?ageGroup=10-12&month=03/2025');

    // Default limit is 5; make 5 allowed requests
    for (let i = 0; i < 5; i++) {
      const res = await GET(reqFactory());
      expect(res.status).toBe(200);
      await res.text();
    }
    // 6th should be rate limited
    const limited = await GET(reqFactory());
    expect(limited.status).toBe(429);
    const body = await limited.json();
    expect(body.error).toBe('Too many export requests');

    process.env.REPORTS_ATTENDANCE_CSV_EXPORT_ENABLED = prev;
  });
});
