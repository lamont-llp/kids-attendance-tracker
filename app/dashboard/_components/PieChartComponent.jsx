import React, {useEffect, useState} from 'react'
import {Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip} from "recharts";
import {getUniqueRecord, getUniqueRecordSafe} from "@/app/services/service";
import moment from "moment/moment";

function PieChartComponent({attendanceList}) {
    const [data, setData] = useState([])

    useEffect(() => {
        if (attendanceList && Array.isArray(attendanceList) && attendanceList.length > 0) {
            const totalKids = getUniqueRecordSafe(attendanceList);
            const today = moment().format('D');
            const percentage = (attendanceList.length / (totalKids.length * Number(today)) * 100)

            setData([
                {
                    name: 'Present',
                    value: Number(percentage.toFixed(1)),
                    fill: 'var(--chart-2)', // Using success green
                    gradient: 'url(#presentGradient)'
                },
                {
                    name: 'Absent',
                    value: Number((100-percentage).toFixed(1)),
                    fill: 'var(--chart-3)', // Using warning orange
                    gradient: 'url(#absentGradient)'
                },
            ])
        }
    }, [attendanceList])

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
        <div className='relative overflow-hidden border border-border rounded-lg shadow-lg bg-gradient-to-br from-card via-card to-muted/20 dark:from-card dark:via-card dark:to-accent/10'>
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-primary/10 via-info/10 to-primary/10 px-6 py-4 border-b border-border/50">
                <h2 className='font-bold text-xl text-foreground flex items-center gap-2'>
                    <div className="w-2 h-6 bg-gradient-to-b from-chart-2 to-chart-3 rounded-full"></div>
                    Monthly Attendance Overview
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Current month attendance distribution</p>
            </div>

            {/* Chart container with enhanced styling */}
            <div className="p-6">
                <ResponsiveContainer width={'100%'} height={350}>
                    <PieChart>
                        {/* Define gradients */}
                        <defs>
                            <linearGradient id="presentGradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.9}/>
                                <stop offset="100%" stopColor="var(--success)" stopOpacity={1}/>
                            </linearGradient>
                            <linearGradient id="absentGradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.9}/>
                                <stop offset="100%" stopColor="var(--warning)" stopOpacity={1}/>
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
                            innerRadius={70}
                            outerRadius={120}
                            paddingAngle={2}
                            stroke="var(--background)"
                            strokeWidth={3}
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
                            height={36}
                            iconType="circle"
                            wrapperStyle={{
                                paddingTop: '20px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Summary statistics */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/50">
                    {data.map((item, index) => (
                        <div key={index} className="text-center p-3 rounded-lg bg-muted/30 dark:bg-accent/20">
                            <div className="text-2xl font-bold" style={{color: item.fill}}>
                                {item.value}%
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                                {item.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-info/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
        </div>
    )
}

export default PieChartComponent