'use client';

import React, { useState } from 'react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import AgeGroupSelect from '../../_components/AgeGroupSelect';
import GlobalApi from '../../services/GlobalApi';
import moment from 'moment';
import { toast } from 'sonner';
import { AttendanceRecord } from '@/utils/schema';
import { ExportFormat, exportToCSV, exportToExcel, downloadBlob } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UsersIcon, 
  SearchIcon 
} from 'lucide-react';
import { ExportButton } from './_components/ExportButton';
import AttendanceGrid from './_components/AttendanceGrid';
import AttendanceStats from './_components/AttendanceStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApiResponse {
  data: {
    data: AttendanceRecord[];
  };
}

function AttendancePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('2-5yrs');
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [view, setView] = useState<'grid' | 'analytics'>('grid');

  const onSearchHandler = (): void => {
    if (!dateRange?.from || !dateRange?.to || !selectedAgeGroup) {
      toast.error('Please select date range and age group');
      return;
    }

    setIsLoading(true);
    const startDate = moment(dateRange.from).format('YYYY-MM-DD');
    const endDate = moment(dateRange.to).format('YYYY-MM-DD');

    GlobalApi.GetAttendanceListByDateRange(selectedAgeGroup, startDate, endDate)
      .then((response: ApiResponse) => {
        if (response.data.data && Array.isArray(response.data.data)) {
          setAttendanceList(response.data.data);
        } else {
          setAttendanceList([]);
          toast.error('No attendance data found');
        }
      })
      .catch((error: any) => {
        console.error('API Error:', error);
        setAttendanceList([]);
        
        // Handle specific HTTP error codes
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          
          switch (status) {
            case 400:
              toast.error(errorData?.error || 'Invalid search parameters');
              break;
            case 401:
              toast.error('Authentication required. Please log in.');
              break;
            case 404:
              toast.error('Attendance data not found');
              break;
            case 500:
              toast.error('Server error. Please try again later.');
              break;
            default:
              toast.error(`Failed to fetch: ${errorData?.error || 'Unknown error'}`);
          }
        } else {
          toast.error('Failed to fetch attendance data');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleExport = async (format: ExportFormat) => {
    if (!attendanceList?.length) {
      toast.error('No data to export');
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a date range');
      return;
    }

    setIsExporting(true);

    try {
      const startDate = moment(dateRange.from).format('YYYY-MM-DD');
      const endDate = moment(dateRange.to).format('YYYY-MM-DD');
      
      // For Excel format or small datasets, use client-side export
      // For CSV with large datasets, use server-side export
      const useClientExport = format === 'excel' || (attendanceList.length < 100);

      if (useClientExport) {
        // Client-side export (existing functionality)
        const dateRangeString = `${startDate}_to_${endDate}`;
        const fileName = `attendance_${selectedAgeGroup}_${dateRangeString}`;
        
        let exportResult;
        if (format === 'csv') {
          exportResult = exportToCSV(attendanceList, { fileName });
        } else {
          exportResult = exportToExcel(attendanceList, { fileName });
        }
        
        downloadBlob(exportResult);
        toast.success(`Successfully exported as ${format.toUpperCase()}`);
      } else {
        // Server-side CSV export with streaming
        const response = await GlobalApi.ExportAttendanceCSV(startDate, endDate, selectedAgeGroup);
        
        // Create blob from response
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        
        // Extract filename from Content-Disposition header or use default
        const contentDisposition = response.headers['content-disposition'];
        let filename = `attendance-export-${startDate}-to-${endDate}.csv`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }
        
        // Trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Successfully exported attendance data');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      
      // Handle specific HTTP error codes
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 400:
            toast.error(errorData?.error || 'Invalid export parameters');
            break;
          case 401:
            toast.error('Authentication required. Please log in.');
            break;
          case 403:
            toast.error('Export feature is not available');
            break;
          case 413:
            toast.error(`Dataset too large to export. ${errorData?.error || 'Please reduce your date range.'}`);
            break;
          case 429:
            toast.error('Too many export requests. Please try again later.');
            break;
          case 500:
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error(`Failed to export: ${errorData?.error || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to export data. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Track and analyze student attendance records</p>
        </div>
        
        <div className="flex gap-2">
          <ExportButton
            onExport={handleExport}
            disabled={!attendanceList?.length || isExporting}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center gap-2">
            <SearchIcon className="h-4 w-4" />
            Search Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label className="text-sm font-medium">Age Group</label>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <AgeGroupSelect selectedAgeGroup={setSelectedAgeGroup} />
              </div>
            </div>

            <Button onClick={onSearchHandler} disabled={isLoading} className="px-4 py-2">
              {isLoading ? 'Loading...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'analytics')}>
        <TabsList>
          <TabsTrigger value="grid">Attendance Grid</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium">Attendance Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading attendance records...</p>
                  </div>
                </div>
              ) : (
                <AttendanceGrid 
                  attendanceList={attendanceList} 
                  dateRange={dateRange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium">Attendance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading analytics...</p>
                  </div>
                </div>
              ) : (
                <AttendanceStats attendanceList={attendanceList} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AttendancePage;
