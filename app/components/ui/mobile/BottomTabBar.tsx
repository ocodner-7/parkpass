"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Home, Ticket, Users, Wallet } from "lucide-react";

const tabs = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
    active: "text-content-primary",
    pill: "bg-surface-elevated",
  },
  {
    label: "Permits",
    icon: Ticket,
    href: "/dashboard/permits",
    active: "text-accent",
    pill: "bg-accent/15",
  },
  {
    label: "Vehicles",
    icon: Car,
    href: "/dashboard/vehicles",
    active: "text-plate-yellow",
    pill: "bg-plate-yellow/15",
  },
  {
    label: "Household",
    icon: Users,
    href: "/dashboard/household",
    active: "text-household",
    pill: "bg-household/15",
  },
  {
    label: "Top up",
    icon: Wallet,
    href: "/dashboard/topup",
    active: "text-content-primary",
    pill: "bg-surface-elevated",
  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-surface-secondary/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <ul className="flex h-16 items-stretch">
        {tabs.map(({ label, icon: Icon, href, active, pill }) => {
          // Exact match, or a nested route under the tab (except Home)
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-full cursor-pointer flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? active : "text-content-muted hover:text-content-primary"
                }`}
              >
                <span
                  className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${
                    isActive ? pill : ""
                  }`}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span
                  className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}