'use client';

import React, { useState, useEffect } from 'react';
import MonthSelection from '../../_components/MonthSelection';
import AgeGroupSelect from '../../_components/AgeGroupSelect';
import GlobalApi from '../../services/GlobalApi';
import moment from 'moment';
import { toast } from 'sonner';
import { AttendanceRecord } from '@/utils/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, UsersIcon, SearchIcon, Download } from 'lucide-react';
import AttendanceGrid from './_components/AttendanceGrid';

interface ApiResponse {
  data: AttendanceRecord[];
}

export function getExportErrorMessage(status: number, fallback: string): string {
  if (status === 403) return "You don't have permission to export attendance.";
  if (status === 413) return 'Export too large. Narrow the date range or filters.';
  if (status === 429) return 'Too many export requests. Please try again later.';
  if (status >= 500) return 'Server error while exporting. Please try again.';
  return fallback;
}

function AttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(moment(new Date()).format('MM/YYYY'));
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('2-5yrs');
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // Fetch available months on component mount
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
        const response = await GlobalApi.GetAvailableMonths();
        const months = response.data.availableMonths || [];
        setAvailableMonths(months);

        // If current month is not available, default to the latest available month
        if (months.length > 0 && !months.includes(selectedMonth)) {
          const latestMonth = months[months.length - 1];
          setSelectedMonth(latestMonth);
        }
      } catch (error) {
        console.error('Error fetching available months:', error);
      }
    };

    fetchAvailableMonths();
  }, []);

  const handleExport = async () => {
    if (!selectedMonth || !selectedAgeGroup) {
      toast.error('Please select both month and age group');
      return;
    }

    try {
      setIsExporting(true);
      const month = moment(selectedMonth).format('MM/YYYY');
      const response = await fetch(
        `/api/attendance/export?ageGroup=${encodeURIComponent(selectedAgeGroup)}&month=${encodeURIComponent(month)}`
      );

      if (!response.ok) {
        let errMsg = 'Failed to export data';
        try {
          const error = await response.json();
          errMsg = getExportErrorMessage(response.status, error.error || errMsg);
        } catch {
          errMsg = getExportErrorMessage(response.status, errMsg);
        }
        throw new Error(errMsg);
      }

      // Get the filename from the content-disposition header or generate one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `attendance-${month}-${selectedAgeGroup}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Export downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const onSearchHandler = (): void => {
    if (!selectedMonth || !selectedAgeGroup) {
      toast.error('Please select both month and age group');
      return;
    }

    setIsLoading(true);
    const month = moment(selectedMonth).format('MM/YYYY');

    GlobalApi.GetAttendanceList(selectedAgeGroup, month)
      .then((response: ApiResponse) => {
        if (response.data && Array.isArray(response.data)) {
          setAttendanceList(response.data);
        } else {
          console.error('Invalid data format received:', response.data);
          setAttendanceList([]);
          toast.error('No attendance data found');
        }
      })
      .catch((error: Error) => {
        console.error('API Error:', error);
        setAttendanceList([]);
        toast.error('Failed to fetch attendance data');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleMonthSelection = (value: string): void => {
    setSelectedMonth(value);
  };

  const handleAgeGroupSelection = (value: string): void => {
    setSelectedAgeGroup(value);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Manage and track student attendance records</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center gap-2">
            <SearchIcon className="h-4 w-4" />
            Search Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label className="text-sm font-medium">Month</label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <MonthSelection selectedMonth={handleMonthSelection} />
              </div>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label className="text-sm font-medium">Age Group</label>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <AgeGroupSelect age={undefined} selectedAgeGroup={handleAgeGroupSelection} />
              </div>
            </div>

            <Button onClick={onSearchHandler} disabled={isLoading} className="px-4 py-2">
              {isLoading ? 'Loading...' : 'Search'}
            </Button>
            {process.env.NEXT_PUBLIC_REPORTS_ATTENDANCE_CSV_EXPORT_ENABLED === 'true' && (
              <Button
                onClick={handleExport}
                disabled={isExporting || !selectedMonth || !selectedAgeGroup}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting…' : 'Export CSV'}
              </Button>
            )}
          </div>
        </CardContent>
        {availableMonths.length > 0 && (
          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Available months with data:</span>{' '}
              {availableMonths.join(', ')}
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AttendanceGrid attendanceList={attendanceList} selectedMonth={selectedMonth} />
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendancePage;
