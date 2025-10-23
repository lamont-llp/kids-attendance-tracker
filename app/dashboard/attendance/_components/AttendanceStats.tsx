// filepath: /app/dashboard/attendance/_components/AttendanceStats.tsx
import React from 'react';
import { AttendanceRecord } from '@/utils/schema';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface AttendanceStatsProps {
  attendanceList?: AttendanceRecord[];
}

export default function AttendanceStats({ attendanceList }: AttendanceStatsProps) {
  if (!attendanceList?.length) {
    return <div className="p-4 text-center">No data available</div>;
  }

  // Calculate statistics and prepare chart data here
  const stats = {
    totalDays: attendanceList.length,
    present: attendanceList.filter(r => r.present === true).length,
    absent: attendanceList.filter(r => r.present === false).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Days" value={stats.totalDays} />
        <StatCard title="Present" value={stats.present} />
        <StatCard title="Absent" value={stats.absent} />
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[stats]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="present" fill="#16a34a" />
            <Bar dataKey="absent" fill="#dc2626" />
            <Bar dataKey="late" fill="#eab308" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}