"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus, Star, Ticket, Trash2, Users } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";
import { useLocations } from "@/hooks/queries/useLocations";
import { Location } from "@/types/graphql";
import { useSetDefaultLocation } from "@/hooks/utils/useSetDefaultLocation";
import { useHouseholdStore } from "@/store/householdStore";
import { ConfirmDialog } from "@/app/components/ui/ConfirmationDialog";
import { supabase } from "@/lib/supabase";
import { AddLocationModal } from "./AddLocationModal";

// Row actions appear on hover, on keyboard focus within the row,
// and always on touch devices where hover doesn't exist
const rowAction =
  "grid size-8 shrink-0 cursor-pointer place-items-center rounded-control transition-[opacity,background-color,color] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100";

export const Sidebar = () => {
  const { activeLocation, setActiveLocation } = useLocationStore();
  const { setDefaultLocation } = useSetDefaultLocation();
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useLocations(HOUSEHOLD?.id ?? "");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState<
    string | null
  >(null);

  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const queryClient = useQueryClient();

  const closeRemoveDialog = () => {
    setConfirmDeleteLocation(null);
    setRemoveError("");
  };

  const handleRemoveLocation = async (locationId: string) => {
    setIsRemoving(true);
    setRemoveError("");

    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", locationId);

    setIsRemoving(false);

    if (error) {
      console.error("Error removing location:", error);
      setRemoveError("We couldn't remove that location. Please try again.");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["locations"] });
    closeRemoveDialog();
  };

  const locations: Location[] = data?.locations ?? [];

  const sortedLocations = [...locations].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault),
  );

  const locationPendingRemoval = locations.find(
    (l) => l.id === confirmDeleteLocation,
  );

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border-default bg-surface-secondary">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border-subtle px-4">
        <Link
          href="/dashboard"
          aria-label="ParkPass dashboard"
          className="flex items-center gap-2.5 rounded-control"
        >
          <span className="grid size-9 place-items-center rounded-control bg-sign-blue text-white">
            <Ticket className="size-5" aria-hidden />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-content-primary">
              ParkPass
            </span>
            <span className="text-xs text-content-muted">
              London Parking Permits
            </span>
          </span>
        </Link>
      </div>

      {/* Locations */}
      <nav
        aria-labelledby="locations-heading"
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <h2
            id="locations-heading"
            className="text-sm font-semibold text-content-secondary"
          >
            Locations
          </h2>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            aria-label="Add a location"
            className="-mr-1.5 grid size-8 cursor-pointer place-items-center rounded-control text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {isLoading ? (
            <div className="space-y-1" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-2 rounded-control px-3 py-3">
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-elevated" />
                  <div className="h-3 w-16 animate-pulse rounded bg-surface-elevated" />
                </div>
              ))}
            </div>
          ) : sortedLocations.length === 0 ? (
            <div className="rounded-control border border-dashed border-border-default px-4 py-6 text-center">
              <p className="text-sm text-content-secondary">No locations yet</p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-1 cursor-pointer text-sm font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
              >
                Add your address
              </button>
            </div>
          ) : (
            <ul className="space-y-1">
              {sortedLocations.map((location) => {
                const isActive = activeLocation?.id === location.id;
                const name = location.nickname ?? location.addressLine1;

                return (
                  <li key={location.id}>
                    <div
                      className={`group relative flex items-center gap-1 rounded-control pr-1.5 transition-colors ${
                        isActive ? "bg-accent-subtle" : "hover:bg-surface-hover"
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => setActiveLocation(location)}
                        aria-current={isActive ? "true" : undefined}
                        className="min-w-0 flex-1 cursor-pointer rounded-control py-2.5 pl-3 text-left"
                      >
                        <p className="truncate text-sm font-medium text-content-primary">
                          {name}
                        </p>
                        <p
                          className={`text-xs font-medium tracking-wide ${
                            isActive ? "text-accent" : "text-content-muted"
                          }`}
                        >
                          {location.postcode}
                        </p>
                        {location.activePassCount > 0 && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-success">
                            <span
                              aria-hidden
                              className="size-1.5 rounded-full bg-success"
                            />
                            {location.activePassCount} active{" "}
                            {location.activePassCount === 1 ? "pass" : "passes"}
                          </p>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!location.isDefault) {
                            setDefaultLocation(
                              location.id,
                              HOUSEHOLD?.id ?? "",
                            );
                          }
                        }}
                        aria-pressed={location.isDefault}
                        aria-label={
                          location.isDefault
                            ? `${name} is your default location`
                            : `Make ${name} your default location`
                        }
                        title={
                          location.isDefault
                            ? "Default location"
                            : "Make default"
                        }
                        className={`${rowAction} ${
                          location.isDefault
                            ? "opacity-100 text-warning"
                            : "text-content-muted hover:bg-surface-elevated hover:text-warning"
                        }`}
                      >
                        <Star
                          className={`size-4 ${location.isDefault ? "fill-current" : ""}`}
                          aria-hidden
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteLocation(location.id)}
                        aria-label={`Remove ${name}`}
                        title="Remove location"
                        className={`${rowAction} text-content-muted hover:bg-danger-subtle hover:text-danger`}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* Household */}
      {HOUSEHOLD && (
        <div className="border-t border-border-subtle p-3">
          <Link
            href="/dashboard/household"
            className="group flex items-center gap-3 rounded-control px-2 py-2 transition-colors hover:bg-surface-hover"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-control bg-household/15 text-household">
              <Users className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-content-primary">
                {HOUSEHOLD.name}
              </span>
              <span className="block text-xs text-content-muted">
                Your household
              </span>
            </span>
            <ChevronRight
              className="size-4 text-content-muted transition-colors group-hover:text-content-primary"
              aria-hidden
            />
          </Link>
        </div>
      )}

      <AnimatePresence>
        {showModal && <AddLocationModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteLocation && (
          <ConfirmDialog
            title={
              locationPendingRemoval
                ? `Remove ${locationPendingRemoval.nickname ?? locationPendingRemoval.addressLine1}?`
                : "Remove location?"
            }
            message="All passes for this location, including any that are active, will be deleted too."
            confirmLabel="Remove location"
            onConfirm={() => handleRemoveLocation(confirmDeleteLocation)}
            onCancel={closeRemoveDialog}
            isLoading={isRemoving}
            error={removeError}
          />
        )}
      </AnimatePresence>
    </aside>
  );
};
