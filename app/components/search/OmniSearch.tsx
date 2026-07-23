"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Ticket, Car, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useHouseholdStore } from "@/store/householdStore";
import { useLocationStore } from "@/store/locationStore";
import { Pass, Vehicle, Location } from "@/types/graphql";

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  type: "pass" | "vehicle" | "location";
  href: string;
}

export function OmniSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { activeLocation } = useLocationStore();

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

  const results: SearchResult[] = [];

  if (query.trim().length > 0) {
    const q = query.toLowerCase();

    // Search passes from cache
    const passesData = queryClient.getQueryData<{ passes: Pass[] }>([
      "passes",
      activeLocation?.id ?? "",
      HOUSEHOLD?.id ?? "",
    ]);
    passesData?.passes?.forEach((pass) => {
      if (pass.registration.toLowerCase().includes(q)) {
        results.push({
          id: pass.id,
          label: pass.registration,
          sublabel: `${pass.status.charAt(0) + pass.status.slice(1).toLowerCase()} · ${new Date(pass.endTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
          type: "pass",
          href: "/dashboard/permits",
        });
      }
    });

    // Search vehicles from cache
    const vehiclesData = queryClient.getQueryData<{ vehicles: Vehicle[] }>([
      "vehicles",
      HOUSEHOLD?.id ?? "",
    ]);
    vehiclesData?.vehicles?.forEach((vehicle) => {
      if (
        vehicle.registration.toLowerCase().includes(q) ||
        vehicle.nickname?.toLowerCase().includes(q)
      ) {
        results.push({
          id: vehicle.id,
          label: vehicle.nickname ?? vehicle.registration,
          sublabel: vehicle.nickname ? vehicle.registration : "Vehicle",
          type: "vehicle",
          href: "/dashboard/vehicles",
        });
      }
    });

    // Search locations from cache
    const locationsData = queryClient.getQueryData<{ locations: Location[] }>([
      "locations",
      HOUSEHOLD?.id ?? "",
    ]);
    locationsData?.locations?.forEach((location) => {
      if (
        location.addressLine1.toLowerCase().includes(q) ||
        location.nickname?.toLowerCase().includes(q) ||
        location.postcode.toLowerCase().includes(q)
      ) {
        results.push({
          id: location.id,
          label: location.nickname ?? location.addressLine1,
          sublabel: location.postcode,
          type: "location",
          href: "/dashboard",
        });
      }
    });
  }

  const iconMap = {
    pass: Ticket,
    vehicle: Car,
    location: MapPin,
  };

  const labelMap = {
    pass: "Passes",
    vehicle: "Vehicles",
    location: "Locations",
  };

  const groupedResults = (["pass", "vehicle", "location"] as const)
    .map((type) => ({
      type,
      items: results.filter((r) => r.type === type),
    }))
    .filter((g) => g.items.length > 0);

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 max-w-md hidden sm:block"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted w-4 h-4" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search passes, vehicles..."
        className="w-full pl-9 pr-4 py-2 text-sm bg-surface-primary border border-border-default rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-content-primary placeholder:text-content-muted"
      />

      {/* Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-surface-secondary border border-border-default rounded-xl shadow-xl z-50 overflow-hidden">
          {groupedResults.length === 0 ? (
            <p className="px-4 py-3 text-sm text-content-muted">
              {`No results for "${query}"`}
            </p>
          ) : (
            <div className="py-2">
              {groupedResults.map(({ type, items }) => {
                const Icon = iconMap[type];
                return (
                  <div key={type}>
                    <p className="px-4 py-1.5 text-xs font-medium text-content-muted uppercase tracking-wider">
                      {labelMap[type]}
                    </p>
                    {items.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-elevated transition-colors cursor-pointer text-left"
                      >
                        <Icon className="w-4 h-4 text-content-muted shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-content-primary">
                            {result.label}
                          </p>
                          <p className="text-xs text-content-muted">
                            {result.sublabel}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
