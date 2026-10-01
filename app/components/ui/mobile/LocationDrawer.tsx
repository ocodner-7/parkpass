"use client";

import { useEffect } from "react";
import { Check, MapPin, Plus, Star, X } from "lucide-react";
import { motion } from "motion/react";
import { useLocationStore } from "@/store/locationStore";
import { useLocations } from "@/hooks/queries/useLocations";
import { useHouseholdStore } from "@/store/householdStore";

interface LocationDrawerProps {
  onClose: () => void;
  onAddLocation: () => void;
}

const buttonSecondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control border border-border-strong px-4 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover";

export function LocationDrawer({
  onClose,
  onAddLocation,
}: LocationDrawerProps) {
  const { activeLocation, setActiveLocation } = useLocationStore();
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useLocations(HOUSEHOLD?.id ?? "");
  const locations = data?.locations ?? [];

  // Default location first, matching the sidebar
  const sortedLocations = [...locations].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault),
  );

  // Escape closes the sheet
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-drawer-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 380 }}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-[1.25rem] border-t border-border-default bg-surface-secondary shadow-2xl shadow-black/60 lg:hidden"
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <h2
            id="location-drawer-title"
            className="text-lg font-semibold tracking-tight text-content-primary"
          >
            Your locations
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 grid size-10 cursor-pointer place-items-center rounded-control text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          {isLoading ? (
            <div className="space-y-1" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3.5">
                  <div className="size-10 animate-pulse rounded-control bg-surface-elevated" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-surface-elevated" />
                    <div className="h-3 w-16 animate-pulse rounded bg-surface-elevated" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedLocations.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <span className="grid size-10 place-items-center rounded-full bg-surface-elevated">
                <MapPin className="size-5 text-content-muted" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-medium text-content-primary">
                No locations yet
              </p>
              <p className="mt-1 max-w-xs text-sm text-content-muted">
                Add your address to start issuing visitor passes.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {sortedLocations.map((location) => {
                const isActive = activeLocation?.id === location.id;
                return (
                  <li key={location.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLocation(location);
                        onClose();
                      }}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-control px-3 py-3 text-left transition-colors ${
                        isActive ? "bg-accent-subtle" : "hover:bg-surface-hover"
                      }`}
                    >
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-control ${
                          isActive
                            ? "bg-accent/15 text-accent"
                            : "bg-surface-elevated text-content-secondary"
                        }`}
                      >
                        <MapPin className="size-5" aria-hidden />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-content-primary">
                            {location.nickname ?? location.addressLine1}
                          </span>
                          {location.isDefault && (
                            <Star
                              className="size-3.5 shrink-0 fill-current text-warning"
                              aria-label="Default location"
                            />
                          )}
                        </span>
                        <span
                          className={`block text-xs font-medium tracking-wide ${
                            isActive ? "text-accent" : "text-content-muted"
                          }`}
                        >
                          {location.postcode}
                        </span>
                        {location.activePassCount > 0 && (
                          <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-success">
                            <span
                              aria-hidden
                              className="size-1.5 rounded-full bg-success"
                            />
                            {location.activePassCount} active{" "}
                            {location.activePassCount === 1 ? "pass" : "passes"}
                          </span>
                        )}
                      </span>

                      {isActive && (
                        <Check
                          className="size-5 shrink-0 text-accent"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer clears the iPhone home indicator */}
        <div className="border-t border-border-subtle px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onAddLocation();
            }}
            className={`${buttonSecondary} w-full cursor-pointer`}
          >
            <Plus className="size-4" aria-hidden />
            Add a location
          </button>
        </div>
      </motion.div>
    </>
  );
}