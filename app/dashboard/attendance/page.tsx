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
  data: AttendanceRecord[];
}

function AttendancePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('2-5yrs');
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
        if (response.data && Array.isArray(response.data)) {
          setAttendanceList(response.data);
        } else {
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

  const handleExport = async (format: ExportFormat) => {
    if (!attendanceList?.length) {
      toast.error('No data to export');
      return;
    }

    try {
      const dateRangeString = dateRange?.from && dateRange?.to
        ? `${moment(dateRange.from).format('YYYY-MM-DD')}_to_${moment(dateRange.to).format('YYYY-MM-DD')}`
        : 'all-dates';
      
      const fileName = `attendance_${selectedAgeGroup}_${dateRangeString}`;
      
      let exportResult;
      if (format === 'csv') {
        exportResult = exportToCSV(attendanceList, { fileName });
      } else {
        exportResult = exportToExcel(attendanceList, { fileName });
      }
      
      downloadBlob(exportResult);
      toast.success(`Successfully exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
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
            disabled={!attendanceList?.length}
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
                <AgeGroupSelect age={undefined} selectedAgeGroup={(value: React.SetStateAction<string>) => setSelectedAgeGroup(value)} />
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
              <AttendanceGrid 
                attendanceList={attendanceList} 
                dateRange={dateRange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium">Attendance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceStats attendanceList={attendanceList} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AttendancePage;
