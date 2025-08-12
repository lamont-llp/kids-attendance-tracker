// SideNav.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LogoutLink, useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { LayoutIcon, GraduationCap, Hand, ClipboardCheck, X, User } from 'lucide-react';

function SideNav() {
  const { user } = useKindeBrowserClient();
  const menuList = [
    {
      id: 1,
      name: 'Dashboard',
      icon: LayoutIcon,
      path: '/dashboard',
    },
    {
      id: 2,
      name: 'Kids',
      icon: GraduationCap,
      path: '/dashboard/kids',
    },
    {
      id: 3,
      name: 'Attendance',
      icon: Hand,
      path: '/dashboard/attendance',
    },
    {
      id: 4,
      name: 'Check-in',
      icon: ClipboardCheck,
      path: '/kiosk',
    },
  ];
  const path = usePathname();

  const closeSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('opacity-0', 'pointer-events-none');
    }
  };

  return (
    <div className="bg-card h-full flex flex-col border-r">
      {/* Header with logo and close button */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <Image
            priority={true}
            src={'/logo.svg'}
            width={120}
            height={100}
            className="w-28 h-auto"
            alt="logo"
          />
          {/* Close button for mobile */}
          <button
            onClick={closeSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuList.map((menu) => (
            <Link key={menu.id} href={menu.path} onClick={closeSidebar}>
              <div
                className={`flex items-center gap-3 text-sm p-3
                                rounded-md
                                transition-colors
                                ${
                                  path === menu.path
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
              >
                <menu.icon className="w-4 h-4 flex-shrink-0" />
                <span>{menu.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* User profile section */}
      {user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt={user.given_name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.given_name} {user.family_name}
              </p>
              {/*
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
              */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SideNav;
