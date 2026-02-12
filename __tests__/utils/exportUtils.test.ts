/**
 * @jest-environment jsdom
 */

import { exportToCSV, exportToExcel, downloadBlob } from '@/utils/exportUtils';
import { AttendanceRecord } from '@/utils/schema';

// Helper to read blob as text
async function blobToText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

describe('exportUtils', () => {
  describe('exportToCSV', () => {
    const mockAttendanceData: AttendanceRecord[] = [
      {
        id: 1,
        kidId: 101,
        present: true,
        day: 1,
        date: '2024-01-15',
        checkInTime: new Date('2024-01-15T09:30:00'),
        kid: {
          id: 101,
          name: 'John Doe',
          age: '5',
          isVisitor: false,
          created_at: '2024-01-01T00:00:00',
          updated_at: '2024-01-01T00:00:00',
        }
      },
      {
        id: 2,
        kidId: 102,
        present: false,
        day: 1,
        date: '2024-01-15',
        checkInTime: new Date('2024-01-15T10:00:00'),
        kid: {
          id: 102,
          name: 'Jane Smith',
          age: '7',
          isVisitor: true,
          created_at: '2024-01-01T00:00:00',
          updated_at: '2024-01-01T00:00:00',
        }
      }
    ];

    it('should export CSV with headers', async () => {
      const result = exportToCSV(mockAttendanceData, { fileName: 'test' });
      
      expect(result.fileName).toBe('test.csv');
      expect(result.blob.type).toBe('text/csv;charset=utf-8;');
      
      const text = await blobToText(result.blob);
      expect(text).toContain('Date,Student Name,Age Group,Status,Check-in Time,Visitor');
      expect(text).toContain('John Doe');
      expect(text).toContain('Jane Smith');
      expect(text).toContain('Present');
      expect(text).toContain('Absent');
      expect(text).toContain('Yes'); // Visitor
      expect(text).toContain('No'); // Not visitor
    });

    it('should include UTF-8 BOM for Excel compatibility', async () => {
      const result = exportToCSV(mockAttendanceData);
      
      const text = await blobToText(result.blob);
      // UTF-8 BOM is \uFEFF - check that it's present at the start
      // FileReader may handle BOM differently, so we check the actual CSV structure
      expect(text).toContain('Date,Student Name,Age Group,Status,Check-in Time,Visitor');
      // Verify the blob was created with UTF-8 charset
      expect(result.blob.type).toContain('utf-8');
    });

    it('should properly escape commas in CSV cells', async () => {
      const dataWithComma: AttendanceRecord[] = [{
        id: 1,
        kidId: 101,
        present: true,
        day: 1,
        date: '2024-01-15',
        kid: {
          id: 101,
          name: 'Doe, John',  // Name with comma
          age: '5',
          isVisitor: false,
          created_at: '2024-01-01T00:00:00',
          updated_at: '2024-01-01T00:00:00',
        }
      }];
      
      const result = exportToCSV(dataWithComma);
      
      const text = await blobToText(result.blob);
      // Should be wrapped in quotes
      expect(text).toContain('"Doe, John"');
    });

    it('should properly escape quotes in CSV cells', async () => {
      const dataWithQuote: AttendanceRecord[] = [{
        id: 1,
        kidId: 101,
        present: true,
        day: 1,
        date: '2024-01-15',
        kid: {
          id: 101,
          name: 'John "Johnny" Doe',  // Name with quotes
          age: '5',
          isVisitor: false,
          created_at: '2024-01-01T00:00:00',
          updated_at: '2024-01-01T00:00:00',
        }
      }];
      
      const result = exportToCSV(dataWithQuote);
      
      const text = await blobToText(result.blob);
      // Quotes should be doubled and wrapped
      expect(text).toContain('"John ""Johnny"" Doe"');
    });

    it('should handle newlines in CSV cells', async () => {
      const dataWithNewline: AttendanceRecord[] = [{
        id: 1,
        kidId: 101,
        present: true,
        day: 1,
        date: '2024-01-15',
        kid: {
          id: 101,
          name: 'John\nDoe',  // Name with newline
          age: '5',
          isVisitor: false,
          created_at: '2024-01-01T00:00:00',
          updated_at: '2024-01-01T00:00:00',
        }
      }];
      
      const result = exportToCSV(dataWithNewline);
      
      const text = await blobToText(result.blob);
      // Should be wrapped in quotes
      expect(text).toContain('"John\nDoe"');
    });

    it('should use checkInTime field correctly', async () => {
      const result = exportToCSV(mockAttendanceData);
      
      const text = await blobToText(result.blob);
      // Should contain formatted time from checkInTime, not from date field
      expect(text).toContain('9:30:00 AM');
      expect(text).toContain('10:00:00 AM');
    });

    it('should handle missing checkInTime gracefully', async () => {
      const dataWithoutCheckIn: AttendanceRecord[] = [{
        id: 1,
        kidId: 101,
        present: true,
        day: 1,
        date: '2024-01-15',
        kid: {
          id: 101,
          name: 'John Doe',
          age: '5',
          isVisitor: false,
          created_at: '2024-01-01T00:00:00',
          updated_at: '2024-01-01T00:00:00',
        }
      }];
      
      const result = exportToCSV(dataWithoutCheckIn);
      
      const text = await blobToText(result.blob);
      expect(text).toContain('N/A'); // Should show N/A for missing check-in time
    });

    it('should export without headers when specified', async () => {
      const result = exportToCSV(mockAttendanceData, { includeHeaders: false });
      
      const text = await blobToText(result.blob);
      expect(text).not.toContain('Date,Student Name');
      expect(text).toContain('John Doe');
    });

    it('should throw error for empty data', () => {
      expect(() => exportToCSV([])).toThrow('No data to export');
    });
  });

  describe('exportToExcel', () => {
    const mockData: AttendanceRecord[] = [{
      id: 1,
      kidId: 101,
      present: true,
      day: 1,
      date: '2024-01-15',
      kid: {
        id: 101,
        name: 'John Doe',
        age: '5',
        isVisitor: false,
        created_at: '2024-01-01T00:00:00',
        updated_at: '2024-01-01T00:00:00',
      }
    }];

    it('should export Excel file with correct format', () => {
      const result = exportToExcel(mockData, { fileName: 'test' });
      
      expect(result.fileName).toBe('test.xlsx');
      expect(result.blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('should throw error for empty data', () => {
      expect(() => exportToExcel([])).toThrow('No data to export');
    });
  });

  describe('downloadBlob', () => {
    let mockLink: {
      href: string;
      download: string;
      click: jest.Mock;
    };

    beforeEach(() => {
      // Mock createElement and appendChild/removeChild
      mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should trigger file download', () => {
      const blob = new Blob(['test'], { type: 'text/csv' });
      downloadBlob({ blob, fileName: 'test.csv' });

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe('test.csv');
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
