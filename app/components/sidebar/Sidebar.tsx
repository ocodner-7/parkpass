"use client";
import { useLocationStore } from "@/store/locationStore";
import { useLocations } from "@/hooks/queries/useLocations";
import { Location } from "@/types/graphql";
import Link from "next/link";
import { useHouseholdStore } from "@/store/householdStore";
import { useState } from "react";
import { AddLocationModal } from "./AddLocationModal";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/app/components/ui/ConfirmationDialog";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";

export const Sidebar = () => {
  const { activeLocation, setActiveLocation } = useLocationStore();
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useLocations(HOUSEHOLD?.id ?? "");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState<
    string | null
  >(null);

  const queryClient = useQueryClient();

  const handleRemoveLocation = async (locationId: string) => {
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", locationId);

    if (error) {
      console.error("Error removing location:", error);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["locations"] });
    setConfirmDeleteLocation(null);
  };

  const locations: Location[] = data?.locations ?? [];

  const { household } = useHouseholdStore();
  console.log("household in sidebar:", household);

  console.log("householdId passed to useLocations:", household?.id);
  return (
    <aside className="w-64 shrink-0 bg-surface-secondary border-r border-border-default flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border-default">
        <Link href="/dashboard">
          <p className="text-base font-semibold text-content-primary">
            ParkPass
          </p>
        </Link>
        <p className="text-xs text-content-muted mt-0.5">
          London parking permits
        </p>
      </div>

      <div className="px-5 py-3 ">
        <p className="text-xs font-semibold text-content-muted">Household</p>
        <p className="text-sm font-bold text-content-primary">
          {HOUSEHOLD?.name}
        </p>
      </div>

      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-content-muted tracking-wider">
          LOCATIONS
        </span>

        <button
          className="w-5 h-5 rounded flex items-center justify-center border border-border-default hover:bg-surface-elevated cursor-pointer transition-colors cursor-pointer"
          aria-label="Add location"
          onClick={() => setShowModal(true)}
        >
          <span className="text-content-muted text-sm leading-none">+</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <div className="space-y-2 mt-1">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-surface-elevated animate-pulse"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-1 mt-1">
            {locations.map((location) => {
              const isActive = activeLocation?.id === location.id;

              return (
                <li key={location.id}>
                  <div
                    className={`
    group w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors
    ${
      isActive
        ? "bg-accent-subtle border border-accent"
        : "hover:bg-surface-elevated border border-transparent"
    }
  `}
                  >
                    <button
                      onClick={() => setActiveLocation(location)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <p
                        className={`text-sm font-bold truncate ${isActive ? "text-accent" : "text-content-primary"}`}
                      >
                        {location.nickname ?? location.addressLine1}
                      </p>
                      <p
                        className={`text-xs font-semibold mt-0.5 ${isActive ? "text-blue-500" : "text-content-muted"}`}
                      >
                        {location.postcode}
                      </p>
                      {location.activePassCount > 0 ? (
                        <p className="text-xs mt-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                          <span className="text-green-500">
                            {location.activePassCount} active{" "}
                            {location.activePassCount === 1 ? "pass" : "passes"}
                          </span>
                        </p>
                      ) : null}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteLocation(location.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded cursor-pointer hover:bg-red-100 text-content-secondary hover:text-red-600 transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {showModal && <AddLocationModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteLocation && (
          <ConfirmDialog
            title="Remove location"
            message="Are you sure you want to remove this location? All passes for this location will also be deleted."
            confirmLabel="Remove"
            onConfirm={() => handleRemoveLocation(confirmDeleteLocation)}
            onCancel={() => setConfirmDeleteLocation(null)}
          />
        )}
      </AnimatePresence>
    </aside>
  );
};
