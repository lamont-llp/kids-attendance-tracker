"use client"

import Image from "next/image";
import {Button} from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import * as React from "react"

import {useEffect} from "react";
import {redirect} from "next/navigation";



export default function Home() {
    useEffect(() => {
        redirect('/api/auth/login?post_login_redirect_url=/dashboard')
    }, []);
  return (
    <div>
        <ModeToggle />
      <h2>Hello World</h2>
      <Button>Click Here</Button>
    </div>
  );
}
