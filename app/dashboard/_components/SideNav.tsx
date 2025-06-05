// SideNav.tsx
"use client"

import React, { useEffect } from 'react'
import Image from "next/image";
import { GraduationCap, Hand, LayoutIcon, Settings, X } from "lucide-react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

function SideNav() {
    const { user } = useKindeBrowserClient();
    const menuList = [
        {
            id: 1,
            name: "Dashboard",
            icon: LayoutIcon,
            path: "/dashboard",
        },
        {
            id: 2,
            name: "Kids",
            icon: GraduationCap,
            path: '/dashboard/kids',
        },
        {
            id: 3,
            name: "Attendance",
            icon: Hand,
            path: '/dashboard/attendance',
        },
        {
            id: 4,
            name: "Settings",
            icon: Settings,
            path: '/dashboard/settings',
        }
    ]
    const path = usePathname();

    const closeSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('opacity-0', 'pointer-events-none');
        }
    };

    useEffect(() => {
        console.log(path)
    }, [path]);

    return (
        <div className='bg-white dark:bg-gray-900 border-r shadow-lg h-full flex flex-col'>
            {/* Header with logo and close button */}
            <div className="p-4 sm:p-5 border-b">
                <div className="flex items-center justify-between">
                    <Image 
                        priority={true} 
                        src={'/logo.svg'}
                        width={120}
                        height={100}
                        className='w-24 sm:w-28 h-auto'
                        alt='logo' 
                    />
                    {/* Close button for mobile */}
                    <button 
                        onClick={closeSidebar}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 sm:px-4 py-4 overflow-y-auto">
                {menuList.map((menu) => (
                    <Link key={menu.id} href={menu.path} onClick={closeSidebar}>
                        <div className={`flex items-center gap-3 text-sm sm:text-md p-3 sm:p-4
                            text-slate-500 dark:text-slate-400 hover:bg-primary
                            hover:text-white
                            cursor-pointer
                            rounded-lg
                            my-1 sm:my-2 transition-all duration-200
                            ${path === menu.path && 'bg-primary text-white shadow-md'}`}>
                            <menu.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span className="truncate">{menu.name}</span>
                        </div>
                    </Link>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className='p-4 border-t bg-gray-50 dark:bg-gray-800/50'>
                <div className='flex gap-3 items-center'>
                    {user && user.picture ? (
                        <Image 
                            src={user?.picture} 
                            width={40} 
                            height={40} 
                            alt="user" 
                            className="rounded-full flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700" 
                        />
                    ) : (
                        <div className="w-[40px] h-[40px] bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h2 className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                            {user?.given_name || 'User'}
                        </h2>
                        <h2 className='text-xs text-slate-500 dark:text-slate-400 truncate'>
                            {user?.email || 'user@example.com'}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideNav