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
            </div>
            { user && user.picture ?(
                <div>
                    <Image src={user?.picture} width={35} height={35} alt='user' className='rounded-full' />
                </div>
            )  : null   }
        </div>
    )
}

export default Header
