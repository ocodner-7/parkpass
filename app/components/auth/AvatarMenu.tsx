"use client";
import { useState, useRef, useEffect } from "react";
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
  const { user } = useUser();
  const { clearHousehold } = useHouseholdStore();
  const { clearLocation } = useLocationStore();

  const avatar = user ? (
    `${user.user_metadata?.first_name?.[0]}${user.user_metadata?.last_name?.[0]}`
  ) : (
    <User size={16} />
  );

  // Close on outside click
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearHousehold();
    clearLocation();
    router.push("/login");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full bg-accent-subtle border border-accent flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <span className="text-xs font-medium text-accent">{avatar}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface-secondary border border-border-default rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle">
            <p className="text-sm font-medium text-content-primary truncate">
              {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
            </p>
            <p className="text-xs text-content-muted truncate mt-0.5">
              {user?.email}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-surface-elevated transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
