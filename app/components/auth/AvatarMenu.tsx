"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/utils/useUser";
import { useHouseholdStore } from "@/store/householdStore";
import { useLocationStore } from "@/store/locationStore";

export function AvatarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);      
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const { user } = useUser();
  const { clearHousehold } = useHouseholdStore();
  const { clearLocation } = useLocationStore();

  const firstName: string = user?.user_metadata?.first_name ?? "";
  const lastName: string = user?.user_metadata?.last_name ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  // Avoids rendering "undefinedundefined" when metadata is missing
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Escape closes and returns focus; moving focus into the menu on open
  useEffect(() => {
    if (!isOpen) return;
    firstItemRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearHousehold();
    clearLocation();
    router.push("/login");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="avatar-menu"
        aria-label={fullName ? `Account menu for ${fullName}` : "Account menu"}
        className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-household/15 text-sm font-semibold text-household ring-household/40 transition-shadow hover:ring-2 aria-expanded:ring-2"
      >
        {initials || <User className="size-4" aria-hidden />}
      </button>

      {isOpen && (
        <div
          id="avatar-menu"
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-card border border-border-default bg-surface-secondary p-1.5 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-3 px-2.5 pb-3 pt-2">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full bg-household/15 text-sm font-semibold text-household"
            >
              {initials || <User className="size-4" />}
            </span>
            <div className="min-w-0">
              {fullName && (
                <p className="truncate text-sm font-medium text-content-primary">
                  {fullName}
                </p>
              )}
              <p className="truncate text-sm text-content-muted">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-1.5">
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-control px-2.5 text-left text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary focus-visible:bg-surface-hover"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}