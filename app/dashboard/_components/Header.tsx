"use client"

import React from 'react'
import {useKindeBrowserClient} from "@kinde-oss/kinde-auth-nextjs";
import Image from "next/image";
import { ModeToggle } from '@/components/ModeToggle';

function Header() {
    const {user} = useKindeBrowserClient();
    return (
        <div className='p-4 shadow-sm border flex justify-between'>
            <div>
                <ModeToggle/>
                { user && user.picture ?(
                <div>
                    <Image src={user?.picture} width={35} height={35} alt='user' className='rounded-full' />
                </div>
            )  : (
                    // Optional fallback image or element
                    <div className="w-[35px] h-[35px] bg-gray-300 rounded-full"></div>
                ) }
            </div>
            
        </div>
    )
}

export default Header
