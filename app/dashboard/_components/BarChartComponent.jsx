import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getUniqueRecord, getUniqueRecordSafe } from "@/app/services/service";

// Fix: Properly destructure props
function BarChartComponent({ attendanceList, totalPresentData }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    formatAttendanceListCount();
    // Fix: Proper dependency array
  }, [attendanceList, totalPresentData]);

  const formatAttendanceListCount = () => {
    // Only proceed if both props are available
    if (!attendanceList || !totalPresentData) return;

    const totalKids = getUniqueRecordSafe(attendanceList);

    const result = totalPresentData.map((item) => ({
      day: item.day,
      presentCount: item.presentCount,
      absentCount: Number(totalKids?.length) - Number(item.presentCount),
    }));

    setData(result);
  };

  return (
    <div className="border p-5 rounded-lg bg-chart-1 dark:bg-secondary">
      <h2 className="font-bold text-lg text-primary-foreground dark:text-accent-foreground">Daily Attendance</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart width={730} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="presentCount" fill="#111111" />
          <Bar dataKey="absentCount" fill="#eeeeee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartComponent;
