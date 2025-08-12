import React, { useEffect, useState } from 'react';
import { getUniqueRecord, getUniqueRecordSafe } from '@/app/services/service';
import moment from 'moment';
import Card from '@/app/dashboard/_components/Card';
import { GraduationCap, TrendingDown, TrendingUp } from 'lucide-react';
import GlobalApi from '@/app/services/GlobalApi';
import { toast } from 'sonner';
import { AttendanceRecord } from '@/utils/schema';
import { Kid } from '@/utils/schema';

interface StatusListProps {
  kidList?: Kid[];
}

function StatusList({ kidList }: StatusListProps) {
  const [totalKid, setTotalKid] = useState(0);
  const [presentPerc, setPresentPerc] = useState(0);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('');

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6">
      <Card icon={<GraduationCap />} title="Total Kids" value={kidList?.length} />
      {/*
            <Card icon={<TrendingUp />} title='Total Present' value={Number(presentPerc.toFixed(1)) + '%'} />
            <Card icon={<TrendingDown />} title='Total Absent' value={(100 - Number(presentPerc)).toFixed(1) + '%'} />
            */}
    </div>
  );
}

export default StatusList;
