// Header.tsx
"use client"

import React from 'react'
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Image from "next/image";
import { ModeToggle } from '@/components/ModeToggle';
import { Menu } from 'lucide-react';

function Header() {
    const { user } = useKindeBrowserClient();

    const toggleSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && overlay) {
            const isOpen = !sidebar.classList.contains('-translate-x-full');
            if (isOpen) {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('opacity-0', 'pointer-events-none');
            } else {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('opacity-0', 'pointer-events-none');
            }
        }
    };

    return (
        <header className='sticky top-0 z-30 bg-white dark:bg-gray-900 border-b shadow-sm'>
            <div className='flex items-center justify-between p-3 sm:p-4'>
                {/* Left side - Mobile menu button and Mode Toggle */}
                <div className='flex items-center gap-2 sm:gap-4'>
                    {/* Mobile menu button */}
                    <button 
                        onClick={toggleSidebar}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    
                    {/* Mode Toggle */}
                    <ModeToggle />
                </div>

                {/* Right side - User Profile */}
                <div className='flex items-center gap-2 sm:gap-3'>
                    {/* User info for larger screens */}
                    <div className='hidden sm:block text-right'>
                        <p className='text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]'>
                            {user?.given_name || 'User'}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]'>
                            {user?.email || 'user@example.com'}
                        </p>
                    </div>
                    
                    {/* User Avatar */}
                    {user && user.picture ? (
                        <div className="relative">
                            <Image 
                                src={user?.picture} 
                                width={36} 
                                height={36} 
                                alt='user' 
                                className='rounded-full ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-primary transition-all cursor-pointer' 
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                        </div>
                    ) : (
                        <div className="w-[36px] h-[36px] bg-gray-300 dark:bg-gray-600 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {user?.given_name?.charAt(0) || 'U'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header