// import { Sidebar } from "@/app/components/sidebar/Sidebar";
// import { TopBar } from "@/app/components/topbar/TopBar";
// import { BottomTabBar } from "@/app/components/ui/mobile/BottomTabBar";
// import { HouseholdProvider } from "@/app/components/dashboard/HouseholdProvider";
// import { PageTransition } from "../components/ui/PageTransition";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <HouseholdProvider>
//       {/* h-screen: full viewport height */}
//       {/* flex: horizontal layout on desktop */}
//       <div className="h-dvh flex overflow-hidden bg-surface-primary">
//         {/* Sidebar — hidden on mobile, visible on desktop */}
//         {/* hidden: display none by default (mobile) */}
//         {/* lg:flex: becomes flex on large screens */}
//         <div className="hidden sm:flex">
//           <Sidebar />
//         </div>

//         {/* Main content area */}
//         <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
//           <TopBar />

//           {/* Scrollable page content */}
//           {/* pb-20: bottom padding on mobile to avoid content hiding behind tab bar */}
//           {/* lg:pb-0: remove that padding on desktop since no tab bar */}
//           <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6">
//             <PageTransition>{children}</PageTransition>
//           </div>
//         </main>

//         {/* Bottom tab bar — visible on mobile, hidden on desktop */}
//         {/* This is a fixed bar at the bottom of the screen */}
//         <BottomTabBar />
//       </div>
//     </HouseholdProvider>
//   );
// }
import { Sidebar } from "@/app/components/sidebar/Sidebar";
import { TopBar } from "@/app/components/topbar/TopBar";
import { BottomTabBar } from "@/app/components/ui/mobile/BottomTabBar";
import { HouseholdProvider } from "@/app/components/dashboard/HouseholdProvider";
import { PageTransition } from "../components/ui/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HouseholdProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-accent-solid focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <div className="flex h-dvh overflow-hidden bg-surface-primary">
        {/* Sidebar: desktop only. Below lg the bottom tab bar takes over. */}
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />

          {/* Only this region scrolls. scrollbar-gutter stops pages shifting
              sideways when moving between short and long pages.
              Bottom padding clears the tab bar and the iPhone home indicator;
              on desktop the pages supply their own pb-8. */}
          <main
            id="main-content"
            tabIndex={-1}
            className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] [scrollbar-gutter:stable] focus:outline-none sm:px-6 sm:pt-6 lg:px-8 lg:pb-0"
          >
            <PageTransition>{children}</PageTransition>
          </main>
        </div>

        <BottomTabBar />
      </div>
    </HouseholdProvider>
  );
}