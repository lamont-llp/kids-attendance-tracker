"use client"

import React, {useState} from 'react'
import MonthSelection from "../../_components/MonthSelection";
import AgeGroupSelect from "../../_components/AgeGroupSelect";
import {Button} from "../../../components/ui/button";
import GlobalApi from "../../services/GlobalApi";
import moment from "moment";
import AttendanceGrid from "./_components/AttendanceGrid";

function Attendance() {
    const [selectedMonth, setSelectedMonth] = useState(moment(new Date()).format('MM/YYYY'))
    const [selectedAgeGroup, setSelectedAgeGroup] = useState("3-5yrs")
    const [attendanceList, setAttendanceList] = useState()

    /**
     * Used to fetch attendance list for given month and age group
     */
    const onSearchHandler = (event) => {
        console.log('selectedMonth:', selectedMonth, 'selectedAgeGroup:', selectedAgeGroup)

        // Add validation before proceeding
        if (!selectedMonth || !selectedAgeGroup) {
            console.log('Missing required values - Month or Age Group not selected')
            return;
        }

        const month = moment(selectedMonth).format('MM/YYYY')
        console.log('Formatted month:', month)

        GlobalApi.GetAttendanceList(selectedAgeGroup, month).then(response => {
            console.log('Raw API Response:', response)
            console.log('API Response Data:', response.data)
            console.log('Response data type:', typeof response.data)
            console.log('Response data is array:', Array.isArray(response.data))

            // Check if response.data exists and is an array
            if (response.data && Array.isArray(response.data)) {
                setAttendanceList(response.data)
            } else {
                console.error('Invalid data format received:', response.data)
                setAttendanceList([])
            }
        })
            .catch(error => {
                console.error('API Error:', error)
                setAttendanceList([])
            })
    }

    return (
        <div className='p-10'>
            <h2 className='text-2xl font-bold'>Attendance</h2>
            {/* Search option */}

            <div className='flex gap-5 my-5 p-5 border rounded-lg shadow-sm'>
                <div className='flex gap-2 items-center justify-center'>
                    <label>Select Month: </label>
                    <MonthSelection selectedMonth={(value)=>setSelectedMonth(value)} />
                </div>
                <div className='flex gap-2 items-center justify-center'>
                    <label>Select Age Group: </label>
                    <AgeGroupSelect selectedAgeGroup={(value)=>setSelectedAgeGroup(value)} />
                </div>
                <Button onClick={()=>onSearchHandler()}>
                    Search
                </Button>
            </div>

            {/* Kid Attendance Grid */}
            <AttendanceGrid attendanceList={attendanceList} selectedMonth={selectedMonth} />
        </div>
    )
}

export default Attendance
