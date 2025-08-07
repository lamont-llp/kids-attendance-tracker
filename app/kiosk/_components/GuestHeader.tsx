// Header.tsx
"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Moon, Sun, LogOut } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { redirect } from "next/navigation";

function GuestHeader() {
  const { theme, setTheme } = useTheme();

  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar && overlay) {
      sidebar.classList.toggle("-translate-x-full");
      overlay.classList.toggle("opacity-0");
      overlay.classList.toggle("pointer-events-none");
    }
  };

  return (
    <header className="h-16 border-b bg-card flex items-center px-4">
      <div className="flex items-center justify-between w-full">
      <div className="flex-1 min-w-0">
              <p className="text-md font-extrabold truncate">
                Guest User
              </p>
            </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 md:flex-initial"></div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => redirect("/")}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>

          {/*<Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5"/>
          </Button>*/}
        </div>
      </div>
    </header>
  );
}

export default GuestHeader;
