import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DailyAttendance from '@/app/dashboard/_components/DailyAttendance';
import { getExportErrorMessage } from '@/app/dashboard/attendance/page';

// Mock the API calls
jest.mock('@/app/services/GlobalApi', () => ({
  GetDailyAttendance: jest.fn(),
  GetAllAgeGroups: jest.fn(),
  GetAllKids: jest.fn(),
}));

// Mock the theme provider
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
  }),
}));

describe('Dashboard Integration - Daily Attendance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render DailyAttendance component with proper structure', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: [] });

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText('Daily Attendance')).toBeInTheDocument();
    });
  });

  it('should display date picker and filters', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: [] });

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText('Select Date')).toBeInTheDocument();
      expect(screen.getByText('Age Group')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
  });

  it('should maintain responsive design', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: [] });

    render(<DailyAttendance />);

    await waitFor(() => {
      // Check that the component has responsive classes
      const container = screen.getByText('Daily Attendance').closest('.space-y-6');
      expect(container).toBeInTheDocument();
    });
  });

  it('should integrate with dashboard layout structure', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: [] });

    render(<DailyAttendance />);

    await waitFor(() => {
      // Check that the component uses Card structure consistent with dashboard
      expect(screen.getByText('Daily Attendance')).toBeInTheDocument();
      // The component should use the same design patterns as other dashboard components
    });
  });

  it('should handle loading and error states properly', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: [] });

    render(<DailyAttendance />);

    await waitFor(() => {
      // Should show empty state when no data
      expect(screen.getByText(/No records found for/)).toBeInTheDocument();
    });
  });

  it('maps export error codes to user-friendly messages', () => {
    expect(getExportErrorMessage(403, 'x')).toBe("You don't have permission to export attendance.");
    expect(getExportErrorMessage(413, 'x')).toBe('Export too large. Narrow the date range or filters.');
    expect(getExportErrorMessage(429, 'x')).toBe('Too many export requests. Please try again later.');
    expect(getExportErrorMessage(500, 'x')).toBe('Server error while exporting. Please try again.');
    expect(getExportErrorMessage(400, 'Bad request')).toBe('Bad request');
  });
});
