"use client"

import {Button} from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import * as React from "react"
import {useEffect} from "react";
import {redirect} from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export default function Home() {
    const loginAsGuest = () => {
        redirect('/kiosk');
    }
    const loginAsAdmin = () => {
        redirect('/admin');
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <svg className="text-primary mr-3 size-5 animate-spin ..." viewBox="0 0 24 24">
                    {"<!-- ... -->"}
                </svg>
                <h2 className="text-3xl font-bold mb-4">Login as Guest or Admin</h2>
                <div className="mb-4">
                    <Button className={"text-2xl hover:animate-pulse"} onClick={loginAsGuest}>Guest</Button>
                </div>
                <div className="mb-5 text-2xl">
                    <Button onClick={loginAsAdmin} variant={"outline"}>Admin</Button>
                </div>

            </div>
        </div>
    );
}
