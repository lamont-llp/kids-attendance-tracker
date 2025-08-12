import React from 'react';
import GuestHeader from './_components/GuestHeader';

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div>
        <GuestHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}

export default layout;
