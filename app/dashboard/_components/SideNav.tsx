"use client"

import React, {useEffect} from 'react'
import Image from "next/image";
import {GraduationCap, Hand, LayoutIcon, Settings} from "lucide-react";
import {useKindeBrowserClient} from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import {usePathname} from "next/navigation";

function SideNav() {

    const {user} = useKindeBrowserClient();
    const menuList = [
        {
            id: 1,
            name:  "Dashboard",
            icon:LayoutIcon,
            path: "/dashboard",
        },
        {
            id: 2,
            name: "Kids",
            icon:GraduationCap,
            path: '/dashboard/kids',
        },
        {
            id: 3,
            name: "Attendance",
            icon:Hand,
            path: '/dashboard/attendance',
        },
        {
            id: 4,
            name: "Settings",
            icon:Settings,
            path: '/dashboard/settings',
        }
    ]
    const path = usePathname();
    useEffect(() => {
        console.log(path)
    }, [path]);

    return (
        <div className='border shadow-md h-screen p-5'>
            <Image priority={true} src={'/logo.svg'}
                   width={120}
                   height={100}
                   className='w-1/2 h-auto'
                   alt='logo' />

            <hr className='my-5'></hr>

            {menuList.map((menu, index) => (
                <Link key={menu.id} href={menu.path}>
                    <h2 className={`flex items-center gap-3 text-md p-4
                        text-slate-500 hover:bg-primary
                        hover:text-white
                        cursor-pointer
                        rounded-lg
                        my-2 ${path==menu.path&&'bg-primary text-white'}`}>
                        <menu.icon/>
                        {menu.name}
                    </h2>
                </Link>
            ))}

            <div className='flex gap-2 items-center bottom-5 fixed'>
                {user && user.picture ? (
                    <Image src={user?.picture} width={35} height={35} alt="user" className="rounded-full" />

                ) : (
                    // Optional fallback image or element
                    <div className="w-[35px] h-[35px] bg-gray-200 rounded-full"></div>
                )}
                <div>
                    <h2 className='text-sm font-bold'>{user?.given_name}</h2>
                    <h2 className='text-xs text-slate-400'>{user?.email}</h2>
                </div>
            </div>
        </div>
    )
}

export default SideNav
