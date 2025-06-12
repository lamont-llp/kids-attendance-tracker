"use client"

import {Button} from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import * as React from "react"
import {useEffect} from "react";
import {redirect} from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export default function Home() {
    const { user, isLoading } = useKindeBrowserClient();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            // If not authenticated, redirect to login
            redirect('/api/auth/login');
        } else {
            // User is authenticated, middleware will handle the redirection
            // based on permissions (to dashboard or kiosk)
            redirect('/dashboard');
        }
    }, [user, isLoading]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <ModeToggle />
                <h2 className="text-2xl font-bold mb-4">Loading...</h2>
                <Button disabled>Please wait</Button>
            </div>
        </div>
    );
}
