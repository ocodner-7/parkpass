"use client";
import { X, MapPin, Plus, Check } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";
import { useLocations } from "@/hooks/queries/useLocations";
import { useHouseholdStore } from "@/store/householdStore";
import { motion } from "motion/react";

interface LocationDrawerProps {
  onClose: () => void;
  onAddLocation: () => void;
}

export function LocationDrawer({
  onClose,
  onAddLocation,
}: LocationDrawerProps) {
  const { activeLocation, setActiveLocation } = useLocationStore();
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useLocations(HOUSEHOLD?.id ?? "");
  const locations = data?.locations ?? [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Drawer — slides up from bottom */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-x-0 bottom-0 z-50 bg-surface-secondary rounded-t-2xl shadow-xl lg:hidden"
      >
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />

        {/* Drawer panel — slides up from bottom */}
        <div className="fixed inset-x-0 bottom-0 z-50 bg-surface-secondary rounded-t-2xl shadow-xl lg:hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-default-subtle">
            <h2 className="text-sm font-semibold text-content-primary">
              Your locations
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-content-muted" />
            </button>
          </div>

          {/* Location list */}
          <div className="px-4 py-3 max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-lg bg-surface-elevated animate-pulse"
                  />
                ))}
              </div>
            ) : locations.length === 0 ? (
              <p className="text-sm text-content-muted text-center py-4">
                No locations added yet
              </p>
            ) : (
              <ul className="space-y-1">
                {locations.map((location) => {
                  const isActive = activeLocation?.id === location.id;
                  return (
                    <li key={location.id}>
                      <button
                        onClick={() => {
                          setActiveLocation(location);
                          onClose();
                        }}
                        className={`w-full text-left flex items-center justify-between px-3 py-3 rounded-xl transition-colors cursor-pointer ${
                          isActive ? "bg-accent-subtle" : "hover:bg-surface-primary"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin
                            className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-500" : "text-content-muted"}`}
                          />
                          <div>
                            <p
                              className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-content-primary"}`}
                            >
                              {location.nickname ?? location.addressLine1}
                            </p>
                            <p
                              className={`text-xs mt-0.5 ${isActive ? "text-blue-500" : "text-content-muted"}`}
                            >
                              {location.postcode}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <Check className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Add location button */}
          <div className="px-4 pb-6 pt-2 border-t border-border-default-subtle">
            <button
              onClick={() => {
                onClose();
                onAddLocation();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 text-content-muted hover:border-blue-400 hover:text-blue-600 transition-colors text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add a location
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
