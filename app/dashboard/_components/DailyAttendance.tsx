'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DayPicker } from 'react-day-picker';
import { Search, Users, Clock, CalendarIcon } from 'lucide-react';
import GlobalApi from '@/app/services/GlobalApi';
import { toast } from 'sonner';
import moment from 'moment';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceRecord } from '@/utils/schema';

const DailyAttendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('');

  // Format date for API
  const formatDateForAPI = (date: Date): string => {
    return moment(date).format('DD/MM/YYYY');
  };

  // Fetch attendance data
  const fetchAttendanceData = async (date: string, ageGroup?: string, search?: string) => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.GetDailyAttendance(date, ageGroup, search);
      setAttendanceData(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error('Error fetching daily attendance:', error);
      toast.error('Unable to load records, please try again');
      setAttendanceData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and date change
  useEffect(() => {
    const dateStr = formatDateForAPI(selectedDate);
    const ageGroup = selectedAgeGroup === 'all' ? undefined : selectedAgeGroup;
    fetchAttendanceData(dateStr, ageGroup, searchTerm);
  }, [selectedDate, selectedAgeGroup]);

  // Filter data when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(attendanceData);
    } else {
      const filtered = attendanceData.filter(
        (record) =>
          record.kid?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.kid?.guardian_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, attendanceData]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Handle age group change
  const handleAgeGroupChange = (value: string) => {
    setSelectedAgeGroup(value);
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daily Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Picker */}
            <div className="">
              <Label className="text-sm font-medium mb-2 block">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? moment(selectedDate).format('MMM D, YYYY') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Age Group Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Age Group</label>
                <Select value={selectedAgeGroup} onValueChange={handleAgeGroupChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Age Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Age Groups</SelectItem>
                    <SelectItem value="2-5yrs">2-5 years</SelectItem>
                    <SelectItem value="6-9yrs">6-9 years</SelectItem>
                    <SelectItem value="10-13yrs">10-13 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Loading attendance records...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && attendanceData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No records found for {moment(selectedDate).format('MMMM D, YYYY')}
              </p>
            </div>
          )}

          {/* Attendance List */}
          {!isLoading && filteredData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Attendance Records ({filteredData.length})
                </h3>
                <div className="text-sm text-muted-foreground">
                  {moment(selectedDate).format('MMMM D, YYYY')}
                </div>
              </div>

              <div className="grid gap-4">
                {filteredData.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{record.kid?.name}</h4>
                          {record.present && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Present
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>Age: {record.kid?.age}</div>
                          <div>Guardian: {record.kid?.guardian_name || 'No guardian assigned'}</div>
                          <div>Contact: {record.kid?.contact || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Checked in</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyAttendance;
