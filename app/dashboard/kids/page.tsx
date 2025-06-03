"use client"
import React, {useEffect, useState} from 'react'
import AddNewKid from "@/app/dashboard/kids/_components/AddNewKid";
import GlobalApi from "@/app/services/GlobalApi";
import KidListTable from "@/app/dashboard/kids/_components/KidListTable";


function Kid() {

    const [kidList, setKidList] = useState([]);

    useEffect(() => {
        GetAllKids();
    }, []);
    /**
     * Used to Get All Kids
     */
    const GetAllKids = () => {
      GlobalApi.GetAllKids().then(res => {
          setKidList(res.data);
          console.log(res.data);
      })
    }
    return (
        <div className='p-7'>
            <h2 className='font-bold text-2xl flex justify-between items-center'>Kids
                <AddNewKid refreshData={GetAllKids}/>
            </h2>

            <KidListTable kidList={kidList} refreshData={GetAllKids} />
        </div>
    )
}

export default Kid
