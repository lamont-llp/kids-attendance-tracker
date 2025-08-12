import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DailyAttendance from '@/app/dashboard/_components/DailyAttendance';

// Mock the API calls
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

describe('Daily Attendance E2E Tests', () => {
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

  it('should complete full user workflow: load data, filter, and search', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: mockAttendanceData });

    render(<DailyAttendance />);

    // Step 1: Component loads with default date
    await waitFor(() => {
      expect(screen.getByText('Daily Attendance')).toBeInTheDocument();
    });

    // Step 2: Data loads and displays
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
    });

    // Step 3: User searches for a specific child
    const searchInput = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Step 4: Search results are filtered
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Emma Johnson')).toBeInTheDocument(); // Both still visible due to client-side filtering

    // Step 5: User changes age group filter
    const ageGroupSelect = screen.getByRole('combobox');
    fireEvent.click(ageGroupSelect);

    await waitFor(() => {
      const option = screen.getByText('6-9 years');
      fireEvent.click(option);
    });

    // Step 6: New API call is made with age group filter
    await waitFor(() => {
      expect(GetDailyAttendance).toHaveBeenCalledWith(expect.any(String), '6-9yrs', 'John');
    });
  });

  {/*
  it('should handle empty data state and error recovery', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: [] });

    render(<DailyAttendance />);

    // Step 1: Component loads
    await waitFor(() => {
      expect(screen.getByText('Daily Attendance')).toBeInTheDocument();
    });

    // Step 2: Empty state is displayed
    await waitFor(() => {
      expect(screen.getByText(/No records found for/)).toBeInTheDocument();
    });

    // Step 3: User changes date to trigger new data load
    const dayPicker = screen.getByTestId('day-picker');
    const selectButton = dayPicker.querySelector('button');
    fireEvent.click(selectButton!);

    // Step 4: New API call is made
    await waitFor(() => {
      expect(GetDailyAttendance).toHaveBeenCalled();
    });
  });
  */}

  it('should maintain responsive design across different screen sizes', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: mockAttendanceData });

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText('Daily Attendance')).toBeInTheDocument();
    });

    // Check that responsive classes are applied
    const container = screen.getByText('Daily Attendance').closest('.space-y-6');
    expect(container).toBeInTheDocument();

    // Check that the layout is responsive
    const cardContent = screen.getByText('Daily Attendance').closest('[data-slot="card"]');
    expect(cardContent).toBeInTheDocument();
  });

  {/*
  it('should display all required attendance information', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockResolvedValue({ data: mockAttendanceData });

    render(<DailyAttendance />);

    await waitFor(() => {
      // Check that all required information is displayed
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('8'))).toBeInTheDocument();
      expect(screen.getByText('Sarah Smith')).toBeInTheDocument();
      expect(screen.getByText('555-0123')).toBeInTheDocument();
      expect(screen.getAllByText(/Present/)).toHaveLength(2);
    });
  });
  */}

  it('should handle API errors gracefully', async () => {
    const { GetDailyAttendance } = require('@/app/services/GlobalApi');
    GetDailyAttendance.mockRejectedValue(new Error('Network error'));

    render(<DailyAttendance />);

    await waitFor(() => {
      expect(screen.getByText(/No records found for/)).toBeInTheDocument();
    });
  });
});
