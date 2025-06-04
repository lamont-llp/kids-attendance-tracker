"use client"

import React, {useEffect, useState} from 'react'
import {useTheme} from "next-themes";
import MonthSelection from "@/app/_components/MonthSelection";
import AgeGroupSelect from "@/app/_components/AgeGroupSelect";
import GlobalApi from "@/app/services/GlobalApi";
import moment from "moment";
import StatusList from "@/app/dashboard/_components/StatusList";
import BarChartComponent from "@/app/dashboard/_components/BarChartComponent";
import PieChartComponent from "@/app/dashboard/_components/PieChartComponent";

function Dashboard() {
    const { setTheme } = useTheme()
    const [selectedMonth, setSelectedMonth] = useState(moment(new Date()));
    const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("3-5yrs");
    const [attendanceList, setAttendanceList] = useState([])
    const [totalPresentData, setTotalPresentData] = useState([])

    useEffect(() => {
        setTheme('system')
        GetTotalPresentCountByDay();
        getKidAttendance();

    },[selectedMonth, selectedAgeGroup]);

    /**
     * Used to get Kid Attendance for given Month and Date
     */
    const getKidAttendance = () => {
        GlobalApi.GetAttendanceList(selectedAgeGroup, moment(selectedMonth).format('MM/yyyy'))
            .then(response => {
                //console.log('API Response:', response.data);
                //console.log('Is response.data an array?', Array.isArray(response.data));
                setAttendanceList(response.data || [])
            })
            .catch(error => {
                console.error('Error fetching attendance:', error);
                setAttendanceList([]);
            })
    }

    const GetTotalPresentCountByDay = () => {
        GlobalApi.TotalPresentCountByDay(moment(selectedMonth).format('MM/yyyy'), selectedAgeGroup).then(response  => {
            setTotalPresentData(response.data);
        })
    }

    return (
        <div className='p-10'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl'>Dashboard</h2>
                <div className='flex items-center gap-4'>
                    <MonthSelection selectedMonth={setSelectedMonth} />
                    <AgeGroupSelect selectedAgeGroup={setSelectedAgeGroup} />
                </div>
            </div>

            <StatusList attendanceList={attendanceList} />

            <div className='grid grid-cols-1  md:grid-cols-3 gap-5'>
                <div className='md:col-span-2'>
                    <BarChartComponent attendanceList={attendanceList} totalPresentData={totalPresentData} />
                </div>
                <div>
                    <PieChartComponent attendanceList={attendanceList} />
                </div>
            </div>
        </div>
    )
}
export default Dashboard
