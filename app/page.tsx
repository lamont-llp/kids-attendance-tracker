'use client';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import * as React from 'react';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export default function Home() {
  const loginAsGuest = () => {
    redirect('/kiosk');
  };
  const loginAsAdmin = () => {
    redirect('/admin');
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/background_img.jpeg')",
        backgroundPosition: 'center top -50px',
      }}
    >
      <div className="text-center z-10 pt-50">
        <h1 className="text-5xl font-bold mb-6 text-white">Welcome to EOM Kids</h1>
        <h2 className="text-3xl font-bold mb-4 text-white">Please Select your login type</h2>
        <div className="mb-4">
          <Button
            className="w-48 text-2xl py-2 rounded-md hover:animate-pulse bg-purple-600 text-white hover:bg-blue-700"
            onClick={loginAsGuest}
          >
            Guest
          </Button>
        </div>
        <div>
          <Button
            className="w-48 text-2xl py-2 rounded-md hover:animate-pulse bg-purple-600 text-white hover:bg-blue-700"
            onClick={loginAsAdmin}
          >
            Admin
          </Button>
        </div>
      </div>
      {/* Logo in Bottom Right */}
      <img
        src="/logo.jpeg"
        alt="EOM Kids Ministry Logo"
        className="absolute bottom-4 right-4 w-30 h-auto"
      />
    </div>
  );
}
