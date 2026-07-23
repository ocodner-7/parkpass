import { Sidebar } from "@/app/components/sidebar/Sidebar";
import { TopBar } from "@/app/components/topbar/TopBar";
import { BottomTabBar } from "@/app/components/ui/mobile/BottomTabBar";
import { HouseholdProvider } from "@/app/components/dashboard/HouseholdProvider";
import { motion } from "motion/react";
import { PageTransition } from "../components/ui/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HouseholdProvider>
      {/* h-screen: full viewport height */}
      {/* flex: horizontal layout on desktop */}
      <div className="h-screen flex overflow-hidden bg-surface-primary">
        {/* Sidebar — hidden on mobile, visible on desktop */}
        {/* hidden: display none by default (mobile) */}
        {/* lg:flex: becomes flex on large screens */}
        <div className="hidden sm:flex">
          <Sidebar />
        </div>

        {/* Main content area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />

          {/* Scrollable page content */}
          {/* pb-20: bottom padding on mobile to avoid content hiding behind tab bar */}
          {/* lg:pb-0: remove that padding on desktop since no tab bar */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>

        {/* Bottom tab bar — visible on mobile, hidden on desktop */}
        {/* This is a fixed bar at the bottom of the screen */}
        <BottomTabBar />
      </div>
    </HouseholdProvider>
  );
}
