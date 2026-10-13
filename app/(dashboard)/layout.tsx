import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Opt dashboard segment out of instant-navigation validation because it relies on client auth state
export const instant = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F7F5F1] text-[#1F2937]">
        {/* Fixed Desktop/Tablet Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
          {/* Mobile Bottom Navigation Bar */}
          <BottomNav />
        </div>
      </div>
    </AuthGuard>
  );
}
