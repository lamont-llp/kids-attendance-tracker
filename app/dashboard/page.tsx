// dashboard/page.tsx
"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from "next-themes";
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
    }, [selectedMonth, selectedAgeGroup]);

    /**
     * Used to get Kid Attendance for given Month and Date
     */
    const getKidAttendance = () => {
        GlobalApi.GetAttendanceList(selectedAgeGroup, moment(selectedMonth).format('MM/yyyy'))
            .then(response => {
                setAttendanceList(response.data || [])
            })
            .catch(error => {
                console.error('Error fetching attendance:', error);
                setAttendanceList([]);
            })
    }

    const GetTotalPresentCountByDay = () => {
        GlobalApi.TotalPresentCountByDay(moment(selectedMonth).format('MM/yyyy'), selectedAgeGroup).then(response => {
            setTotalPresentData(response.data);
        })
    }

    return (
        <div className='p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6'>
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                    <h1 className='font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white'>
                        Dashboard
                    </h1>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                        Welcome back! Here's your attendance overview.
                    </p>
                </div>
                
                {/* Controls */}
                <div className='flex flex-col xs:flex-row gap-2 sm:gap-4 w-full sm:w-auto'>
                    <div className="w-full xs:w-auto">
                        <MonthSelection selectedMonth={setSelectedMonth} />
                    </div>
                    <div className="w-full xs:w-auto">
                        <AgeGroupSelect selectedAgeGroup={setSelectedAgeGroup} />
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className="w-full">
                <StatusList attendanceList={attendanceList} />
            </div>

            {/* Charts Section */}
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6'>
                {/* Bar Chart - Takes 2 columns on xl screens */}
                <div className='xl:col-span-2'>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Attendance Trends
                        </h3>
                        <div className="h-[300px] sm:h-[400px]">
                            <BarChartComponent 
                                attendanceList={attendanceList} 
                                totalPresentData={totalPresentData} 
                            />
                        </div>
                    </div>
                </div>
                
                {/* Pie Chart - Takes 1 column */}
                <div className='xl:col-span-1'>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Attendance Distribution
                        </h3>
                        <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
                            <PieChartComponent attendanceList={attendanceList} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard