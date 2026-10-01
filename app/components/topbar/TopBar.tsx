"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useLocationStore } from "@/store/locationStore";
import { LocationDrawer } from "@/app/components/ui/mobile/LocationDrawer";
import { AddLocationModal } from "@/app/components/sidebar/AddLocationModal";
import { OmniSearch } from "../search/OmniSearch";
import { AvatarMenu } from "../auth/AvatarMenu";

export const TopBar = () => {
  const { activeLocation } = useLocationStore();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);

  const locationName =
    activeLocation?.nickname ?? activeLocation?.addressLine1 ?? null;

  return (
    <>
      {/* h-16 matches the sidebar's logo row so their bottom borders line up.
          box-content + safe-area padding keeps it clear of the status bar
          when installed as a PWA. */}
      <header className="box-content flex h-16 shrink-0 items-center gap-3 border-b border-border-default bg-surface-secondary px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:px-8">
        {/* Location switcher: replaces the sidebar below lg */}
        <button
          type="button"
          onClick={() => setShowDrawer(true)}
          aria-haspopup="dialog"
          aria-label={
            locationName
              ? `Current location: ${locationName}. Change location`
              : "Choose a location"
          }
          className="flex h-10 min-w-0 max-w-56 cursor-pointer items-center gap-2 rounded-control border border-border-default bg-surface-primary pl-2.5 pr-2 transition-colors hover:border-border-strong hover:bg-surface-hover lg:hidden"
        >
          <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
          <span
            className={`truncate text-sm font-medium ${
              locationName ? "text-content-primary" : "text-content-muted"
            }`}
          >
            {locationName ?? "Choose location"}
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-content-muted"
            aria-hidden
          />
        </button>

        <OmniSearch />

        <div className="ml-auto shrink-0">
          <AvatarMenu />
        </div>
      </header>

      <AnimatePresence>
        {showDrawer && (
          <LocationDrawer
            onClose={() => setShowDrawer(false)}
            onAddLocation={() => setShowAddLocation(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddLocation && (
          <AddLocationModal onClose={() => setShowAddLocation(false)} />
        )}
      </AnimatePresence>
    </>
  );
};