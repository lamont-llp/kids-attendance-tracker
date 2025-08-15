// dashboard/layout.tsx
import React from 'react';
import SideNav from '@/app/dashboard/_components/SideNav';
import Header from '@/app/dashboard/_components/Header';

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-40 opacity-0 pointer-events-none transition-opacity duration-300"
        id="sidebar-overlay"
      ></div>

      {/* Side Navigation */}
      <div
        className="w-64 fixed left-0 top-0 h-full z-50 transform -translate-x-full transition-transform duration-300 ease-in-out md:translate-x-0 md:block"
        id="sidebar"
      >
        <SideNav />
      </div>

      {/* Main Content */}
      <div className="transition-all duration-300 ease-in-out md:ml-64">
        <Header />
        <main className="min-h-[calc(100vh-64px)] bg-muted/40">{children}</main>
      </div>
    </div>
  );
}

export default layout;
