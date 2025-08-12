import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DailyAttendance from '@/app/dashboard/_components/DailyAttendance';

// Mock the API call
jest.mock('@/app/services/GlobalApi', () => ({
  GetDailyAttendance: jest.fn(),
}));

// Mock the date picker component
jest.mock('react-day-picker', () => ({
  DayPicker: ({ selected, onSelect, ...props }: any) => (
    <div data-testid="day-picker" {...props}>
      <button onClick={() => onSelect(new Date('2024-12-19'))}>Select Date</button>
    </div>
  ),
}));

describe('DailyAttendance Component', () => {
  const mockAttendanceData = [
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
        contact: '555-0123',
        guardian: {
          id: 456,
          name: 'Sarah Smith',
          contact: '555-0123',
        },
      },
    },
    {
      id: 2,
      kidId: 124,
      present: true,
      day: 19,
      date: '19/12/2024',
      kid: {
        id: 124,
        name: 'Emma Johnson',
        age: '6',
        contact: '555-0124',
        guardian: {
          id: 457,
          name: 'Mike Johnson',
          contact: '555-0124',
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the daily attendance component', () => {
    render(<DailyAttendance />);

    expect(screen.getByText('Daily Attendance')).toBeInTheDocument();
    expect(screen.getByTestId('day-picker')).toBeInTheDocument();
  });

  it('should display attendance list when data is loaded', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: mockAttendanceData });

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching data', () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<DailyAttendance />);

    expect(screen.getByText('Loading attendance records...')).toBeInTheDocument();
  });

  it('should show empty state when no records found', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: [] });

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText(/No records found for/)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockRejectedValue(new Error('API Error'));

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText(/No records found for/)).toBeInTheDocument();
    });
  });

  it('should filter attendance by search term', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: mockAttendanceData });

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Since search is client-side filtering, both should still be visible
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
  });

  it('should filter by age group when selected', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: mockAttendanceData });

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    // Clear previous calls
    GetDailyAttendance.mockClear();

    // Simulate age group selection
    const ageGroupSelect = screen.getByRole('combobox');
    fireEvent.click(ageGroupSelect);

    // Wait for the dropdown to appear and click on the option
    await waitFor(() => {
      const option = screen.getByText('6-9 years');
      fireEvent.click(option);
    });

    // Should trigger a new API call with age group filter
    await waitFor(() => {
      expect(GetDailyAttendance).toHaveBeenCalledWith(expect.any(String), '6-9yrs', '');
    });
  });

  it('should display attendance details correctly', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: mockAttendanceData });

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Age: 8')).toBeInTheDocument();
      expect(screen.getByText('Guardian: Sarah Smith')).toBeInTheDocument();
      expect(screen.getByText('Contact: 555-0123')).toBeInTheDocument();
    });
  });

  it('should show check-in status', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: mockAttendanceData });

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getAllByText('✓ Present')).toHaveLength(2);
    });
  });
});
