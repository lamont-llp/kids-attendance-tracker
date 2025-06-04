import React, {useEffect, useState} from 'react'
import {getUniqueRecord, getUniqueRecordSafe} from "@/app/services/service";
import moment from "moment";
import Card from "@/app/dashboard/_components/Card";
import {GraduationCap, TrendingDown, TrendingUp} from "lucide-react";

function StatusList({attendanceList}) {
    const [totalKid, setTotalKid] = useState(0);
    const [presentPerc, setPresentPerc] = useState(0);

    useEffect(() => {
        //console.log('StatusList - attendanceList:', attendanceList, 'Type:', typeof attendanceList, 'IsArray:', Array.isArray(attendanceList));

        if (attendanceList && Array.isArray(attendanceList) && attendanceList.length > 0) {
            const totalKids = getUniqueRecordSafe(attendanceList);
            setTotalKid(totalKids.length);

            const today = moment().format('D');
            const percentage = (attendanceList.length / (totalKids.length * Number(today)) * 100)
            //console.log(percentage)
            setPresentPerc(percentage)
        }
    }, [attendanceList])
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6'>
            <Card icon={<GraduationCap/>} title='Total Kids' value={totalKid} />
            <Card icon={<TrendingUp/>} title='Total Present' value={Number(presentPerc.toFixed(1))+'%'} />
            <Card icon={<TrendingDown/>} title='Total Absent' value={(100-Number(presentPerc)).toFixed(1)+'%'} />
        </div>
    )
}

export default StatusList
