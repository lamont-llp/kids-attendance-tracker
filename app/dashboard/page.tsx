"use client"

import React, {useEffect} from 'react'
import {useTheme} from "next-themes";

function Dashboard() {
    const { setTheme } = useTheme()

    useEffect(() => {
        setTheme('dark')
    })
    return (
        <div>Dashboard</div>
    )
}
export default Dashboard
