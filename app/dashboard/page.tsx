"use client"

import React, {useEffect, useState} from 'react'
import {useTheme} from "next-themes";
import MonthSelection from "@/app/_components/MonthSelection";
import AgeGroupSelect from "@/app/_components/AgeGroupSelect";
import GlobalApi from "@/app/services/GlobalApi";
import moment from "moment";
import StatusList from "@/app/dashboard/_components/StatusList";

function Dashboard() {
    const { setTheme } = useTheme()
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("3-5yrs");
    const [attendanceList, setAttendanceList] = useState([])

    useEffect(() => {
        setTheme('system')
        getKidAttendance();
    },[selectedMonth, selectedAgeGroup]);

    /**
     * Used to get Kid Attendance for given Month and Date
     */
    const getKidAttendance = () => {
        GlobalApi.GetAttendanceList(selectedAgeGroup, moment(selectedMonth).format('MM/yyyy'))
            .then(response => {
                console.log('API Response:', response.data);
                console.log('Is response.data an array?', Array.isArray(response.data));
                setAttendanceList(response.data || [])
            })
            .catch(error => {
                console.error('Error fetching attendance:', error);
                setAttendanceList([]);
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
        </div>
    )
}
export default Dashboard
