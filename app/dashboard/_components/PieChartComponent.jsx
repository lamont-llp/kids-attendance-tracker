import React, { useEffect, useState } from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { getUniqueRecord, getUniqueRecordSafe } from '@/app/services/service';
import moment from 'moment/moment';

function PieChartComponent({ attendanceList }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (attendanceList && Array.isArray(attendanceList) && attendanceList.length > 0) {
      const totalKids = getUniqueRecordSafe(attendanceList);
      const today = moment().format('D');
      const percentage = (attendanceList.length / (totalKids.length * Number(today))) * 100;

      setData([
        {
          name: 'Present',
          value: Number(percentage.toFixed(1)),
          fill: 'var(--chart-2)', // Using success green
          gradient: 'url(#presentGradient)',
        },
        {
          name: 'Absent',
          value: Number((100 - percentage).toFixed(1)),
          fill: 'var(--chart-3)', // Using warning orange
          gradient: 'url(#absentGradient)',
        },
      ]);
    }
  }, [attendanceList]);

  // Custom label function for better formatting
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold drop-shadow-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium">{data.name}</p>
          <p className="text-primary font-bold">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Main Chart Container */}
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width={'100%'} height={'100%'}>
          <PieChart>
            {/* Define gradients */}
            <defs>
              <linearGradient id="presentGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--success)" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="absentGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--warning)" stopOpacity={1} />
              </linearGradient>
            </defs>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              stroke="var(--background)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.gradient}
                  className="drop-shadow-sm hover:drop-shadow-md transition-all duration-300"
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              height={30}
              iconType="circle"
              wrapperStyle={{
                paddingTop: '10px',
                fontSize: '13px',
                fontWeight: '500',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Compact Summary Statistics */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/30">
        {data.map((item, index) => (
          <div key={index} className="text-center p-2 rounded-md bg-muted/20 dark:bg-accent/10">
            <div className="text-lg font-bold" style={{ color: item.fill }}>
              {item.value}%
            </div>
            <div className="text-xs text-muted-foreground font-medium">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PieChartComponent;
