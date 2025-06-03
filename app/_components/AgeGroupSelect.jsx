"use client"

import React, {useEffect, useState} from 'react'
import GlobalApi, {AgeGroup} from "../services/GlobalApi";

function AgeGroupSelect({selectedAgeGroup}) {
    const [ageGroups, setAgeGroups] = useState([])

    const GetAllAgeGroupsList = () => {
        GlobalApi.GetAllAgeGroups().then((response) => {
            setAgeGroups(response.data);
        })
    }

    useEffect(() => {
        GetAllAgeGroupsList()
    }, [])

    return (
        <div>
            <select
                className='p-2 border rounded-lg'
                onChange={(event) => {selectedAgeGroup(event.target.value)}}
                defaultValue=""
            >
                <option value="" disabled>Select Age Group</option>
                {ageGroups.map((item, index) => (
                    <option key={index} value={item.group}>{item.group}</option>
                ))}
            </select>
        </div>
    )
}

export default AgeGroupSelect