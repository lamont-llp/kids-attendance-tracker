import React from 'react'
import AddNewKid from "@/app/dashboard/kids/_components/AddNewKid";

function Kid() {
    return (
        <div className='p-7'>
        <h2 className='font-bold text-2xl flex justify-between items-center'>Kids
            <AddNewKid/>
            </h2>
            </div>
    )
}

export default Kid
