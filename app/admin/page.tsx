'use client';

import { Button } from '@/components/ui/button';
import * as React from 'react';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export default function Admin() {
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
        <svg className="mr-3 size-5 animate-spin ..." viewBox="0 0 24 24">
          {'<!-- ... -->'}
        </svg>
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <Button disabled>Please wait</Button>
      </div>
    </div>
  );
}
