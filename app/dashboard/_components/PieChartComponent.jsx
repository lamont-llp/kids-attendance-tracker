import React, {useEffect, useState} from 'react'
import {Pie, PieChart, ResponsiveContainer} from "recharts";
import {getUniqueRecord, getUniqueRecordSafe} from "@/app/services/service";
import moment from "moment/moment";

function PieChartComponent({attendanceList}) {

    const [data, setData] = useState([])
    useEffect(() => {
        //console.log('StatusList - attendanceList:', attendanceList, 'Type:', typeof attendanceList, 'IsArray:', Array.isArray(attendanceList));

        if (attendanceList && Array.isArray(attendanceList) && attendanceList.length > 0) {
            const totalKids = getUniqueRecordSafe(attendanceList);
            const today = moment().format('D');
            const percentage = (attendanceList.length / (totalKids.length * Number(today)) * 100)
            //console.log(percentage)
            setData([
                {
                    name: 'Total Present',
                    value: Number(percentage.toFixed(1)),
                    fill: 'var(--chart-1)'
                },
                {
                    name: 'Total Absent',
                    value: (100-Number(percentage)).toFixed(1),
                    fill: 'var(--primary-foreground)'
                },
            ])
        }
    }, [attendanceList])

    return (
        <div className='border p-5 rounded-lg bg-chart-1 dark:bg-accent'>
            <h2 className='font-bold text-lg text-primary-foreground dark:text-accent-foreground'>Monthly Attendance</h2>
            <ResponsiveContainer width={'100%'} height={300}>
                <PieChart width={730} height={250}>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

export default PieChartComponent
