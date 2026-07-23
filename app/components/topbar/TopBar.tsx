"use client";
import { ChevronDown } from "lucide-react";
import { User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/utils/useUser";
import { useLocationStore } from "@/store/locationStore";
import { LocationDrawer } from "@/app/components/ui/mobile/LocationDrawer";
import { AddLocationModal } from "@/app/components/sidebar/AddLocationModal";
import { AnimatePresence } from "motion/react";
import { OmniSearch } from "../search/OmniSearch";

export const TopBar = () => {
  const { user } = useUser();
  const { activeLocation } = useLocationStore();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);

  const avatar = user ? (
    `${user.user_metadata?.first_name?.[0]}${user.user_metadata?.last_name?.[0]}`
  ) : (
    <UserIcon size={16} />
  );

  return (
    <>
      <div className="h-14 border-b border-border-default bg-surface-secondary flex items-center justify-between px-4 lg:px-6 gap-3">
        <button
          onClick={() => setShowDrawer(true)}
          className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-primary border border-border-default max-w-45 cursor-pointer"
        >
          <span className="text-sm font-medium text-content-primary truncate">
            {activeLocation?.nickname ??
              activeLocation?.addressLine1 ??
              "Select location"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-content-muted shrink-0" />
        </button>

        <OmniSearch />

        <div className="flex-1 lg:hidden" />

        <div className="w-8 h-8 rounded-full bg-blue-950 border border-border-subtle cursor-default flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-blue-300">{avatar}</span>
        </div>
      </div>

      {showDrawer && (
        <AnimatePresence>
          <LocationDrawer
            onClose={() => setShowDrawer(false)}
            onAddLocation={() => setShowAddLocation(true)}
          />
        </AnimatePresence>
      )}

      {showAddLocation && (
        <AddLocationModal onClose={() => setShowAddLocation(false)} />
      )}
    </>
  );
};
