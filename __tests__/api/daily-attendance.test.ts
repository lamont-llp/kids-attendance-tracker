import { NextRequest } from 'next/server';
import { GET } from '@/app/api/attendance/daily/route';
import { db } from '@/utils';
import { Attendance, Kids, Guardians } from '@/utils/schema';

// Mock the database
jest.mock('@/utils', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    eq: jest.fn(),
    and: jest.fn(),
    or: jest.fn(),
    between: jest.fn(),
    sql: jest.fn(),
  },
}));

// Mock the schema
jest.mock('@/utils/schema', () => ({
  Attendance: {
    id: 'attendance.id',
    kidId: 'attendance.kidId',
    present: 'attendance.present',
    day: 'attendance.day',
    date: 'attendance.date',
  },
  Kids: {
    id: 'kids.id',
    name: 'kids.name',
    age: 'kids.age',
    contact: 'kids.contact',
    guardian_id: 'kids.guardian_id',
  },
  Guardians: { id: 'guardians.id', name: 'guardians.name', contact: 'guardians.contact' },
}));

describe('Daily Attendance API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/attendance/daily', () => {
    it('should return daily attendance records for a specific date', async () => {
      const mockData = [
        {
          id: 1,
          kidId: 123,
          present: true,
          day: 19,
          date: '19/12/2024',
          checkInTime: '2024-12-19T09:30:00Z',
          kid: {
            id: 123,
            name: 'John Smith',
            age: '8',
            contact: '555-0123',
            guardian: {
              id: 456,
              name: 'Sarah Smith',
              contact: '555-0123',
            },
          },
        },
      ];

      // Mock the database query chain
      const mockWhere = jest.fn().mockResolvedValue(mockData);
      const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
      const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const req = new NextRequest('http://localhost:3000/api/attendance/daily?date=19/12/2024');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockData);
    });

    it('should return 400 when date parameter is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/attendance/daily');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required date parameter');
    });

    it('should return 400 when date format is invalid', async () => {
      const req = new NextRequest('http://localhost:3000/api/attendance/daily?date=invalid-date');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid date format. Use DD/MM/YYYY');
    });

    it('should filter by age group when provided', async () => {
      const mockData = [
        {
          id: 1,
          kidId: 123,
          present: true,
          day: 19,
          date: '19/12/2024',
          kid: {
            id: 123,
            name: 'John Smith',
            age: '8',
            guardian: {
              id: 456,
              name: 'Sarah Smith',
            },
          },
        },
      ];

      const mockWhere = jest.fn().mockResolvedValue(mockData);
      const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
      const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const req = new NextRequest(
        'http://localhost:3000/api/attendance/daily?date=19/12/2024&ageGroup=6-9yrs',
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockData);
    });

    it('should filter by search term when provided', async () => {
      const mockData = [
        {
          id: 1,
          kidId: 123,
          present: true,
          day: 19,
          date: '19/12/2024',
          kid: {
            id: 123,
            name: 'John Smith',
            age: '8',
            guardian: {
              id: 456,
              name: 'Sarah Smith',
            },
          },
        },
      ];

      const mockWhere = jest.fn().mockResolvedValue(mockData);
      const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
      const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const req = new NextRequest(
        'http://localhost:3000/api/attendance/daily?date=19/12/2024&search=John',
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockData);
    });

    it('should return empty array when no records found', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
      const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const req = new NextRequest('http://localhost:3000/api/attendance/daily?date=19/12/2024');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const mockWhere = jest.fn().mockRejectedValue(new Error('Database error'));
      const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
      const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const req = new NextRequest('http://localhost:3000/api/attendance/daily?date=19/12/2024');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch daily attendance records');
    });
  });
});
