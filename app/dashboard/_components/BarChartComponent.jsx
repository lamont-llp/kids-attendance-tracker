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

function BarChartComponent({ attendanceList, totalPresentData }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    formatAttendanceListCount();
  }, [attendanceList || totalPresentData]);
  const formatAttendanceListCount = () => {
    const totalKids = getUniqueRecordSafe(attendanceList);

    const result = totalPresentData?.map((item) => ({
      day: item.day,
      presentCount: item.presentCount,
      absentCount: Number(totalKids?.length) - Number(item.presentCount),
    }));

    //console.log(result);
    setData(result);
  };
  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart width={730} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="presentCount" fill="#8884d8" />
          <Bar dataKey="absentCount" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export default BarChartComponent;
