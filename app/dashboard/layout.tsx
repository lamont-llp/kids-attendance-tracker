import React from 'react'
import SideNav from "@/app/dashboard/_components/SideNav";
import Header from "@/app/dashboard/_components/Header";

function layout({children}: {children: React.ReactNode}) {
    return (
        <div>
            <div className='md:w-64 fixed hidden md:block'>
            <SideNav/>
            </div>
            <div className='md:ml-64'>
        <Header/>
        {children}
        </div>
        </div>
)
}

export default layout
