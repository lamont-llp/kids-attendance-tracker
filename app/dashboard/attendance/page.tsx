'use client';

import React, { useState } from 'react';
import MonthSelection from '../../_components/MonthSelection';
import AgeGroupSelect from '../../_components/AgeGroupSelect';
import GlobalApi from '../../services/GlobalApi';
import moment from 'moment';
import { toast } from 'sonner';
import { AttendanceRecord } from '@/utils/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, UsersIcon, SearchIcon, Search } from 'lucide-react';
import AttendanceGrid from './_components/AttendanceGrid';

interface ApiResponse {
  data: AttendanceRecord[];
}

function AttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(moment(new Date()).format('MM/YYYY'));
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('2-5yrs');
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
          </div>
        </CardContent>
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
