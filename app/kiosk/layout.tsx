import React from "react";
import Header from "@/app/dashboard/_components/Header";

function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">

            {/* Main Content */}
            <div>
                <Header />
                <main>{children}</main>
            </div>
        </div>
    );
}

export default layout;
