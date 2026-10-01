"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { Car, MapPin, Search, Ticket } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useHouseholdStore } from "@/store/householdStore";
import { useLocationStore } from "@/store/locationStore";
import { Pass, Vehicle, Location } from "@/types/graphql";
import { NumberPlate } from "@/app/components/ui/NumberPlate";

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  registration?: string;
  location?: Location;
  type: "pass" | "vehicle" | "location";
  href: string;
}

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

// Section hues: passes = accent, vehicles = plate yellow, locations = neutral
const typeConfig = {
  pass: {
    heading: "Passes",
    icon: Ticket,
    chip: "bg-accent/15 text-accent",
  },
  vehicle: {
    heading: "Vehicles",
    icon: Car,
    chip: "bg-plate-yellow/15 text-plate-yellow",
  },
  location: {
    heading: "Locations",
    icon: MapPin,
    chip: "bg-surface-elevated text-content-secondary",
  },
} as const;

// The platform never changes, so there's nothing to subscribe to.
// The server snapshot assumes Mac; the client corrects it on hydration.
const noopSubscribe = () => () => {};
const getIsMac = () => /Mac|iPhone|iPad/.test(navigator.platform);
const getIsMacServer = () => true;

const passStatusText = (pass: Pass) => {
  const end = timeFormatter.format(new Date(pass.endTime));
  switch (pass.status) {
    case "ACTIVE":
      return `Active, ends ${end}`;
    case "CANCELLED":
      return "Cancelled";
    default:
      return `Expired at ${end}`;
  }
};

export function OmniSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMac = useSyncExternalStore(noopSubscribe, getIsMac, getIsMacServer);
  const queryClient = useQueryClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { activeLocation, setActiveLocation } = useLocationStore();

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

  // ⌘K / Ctrl+K focuses search from anywhere
  useEffect(() => {
    const handleShortcut = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
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
          registration: pass.registration,
          sublabel: passStatusText(pass),
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
          registration: vehicle.registration,
          sublabel: vehicle.nickname ? "Saved vehicle" : "No nickname",
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
          location,
          type: "location",
          href: "/dashboard",
        });
      }
    });
  }

  const groupedResults = (["pass", "vehicle", "location"] as const)
    .map((type) => ({
      type,
      items: results.filter((r) => r.type === type),
    }))
    .filter((g) => g.items.length > 0);

  // Flat order matches visual order, for arrow-key navigation
  const flatResults = groupedResults.flatMap((g) => g.items);
  const showDropdown = isOpen && query.trim().length > 0;

  const handleSelect = (result: SearchResult) => {
    if (result.location) setActiveLocation(result.location);
    router.push(result.href);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (query) {
        setQuery("");
      } else {
        inputRef.current?.blur();
      }
      setIsOpen(false);
      return;
    }
    if (!showDropdown || flatResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(flatResults[activeIndex]);
    }
  };

  const optionId = (index: number) => `omnisearch-option-${index}`;
  let runningIndex = -1;

  return (
    <div
      ref={containerRef}
      className="relative hidden max-w-md flex-1 sm:block"
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label="Search passes, vehicles and locations"
        aria-expanded={showDropdown}
        aria-controls="omnisearch-listbox"
        aria-autocomplete="list"
        aria-activedescendant={
          showDropdown && flatResults.length > 0
            ? optionId(activeIndex)
            : undefined
        }
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search passes, vehicles, locations"
        className="peer h-10 w-full rounded-control border border-border-default bg-surface-primary pl-9 pr-14 text-sm text-content-primary placeholder:text-content-muted transition-colors hover:border-border-strong focus-visible:outline-none focus:border-accent focus:ring-3 focus:ring-accent/25 [&::-webkit-search-cancel-button]:hidden"
      />
      {/* Shortcut hint, hidden once the field is in use */}
      {!query && (
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-border-default bg-surface-secondary px-1.5 py-0.5 font-sans text-xs font-medium text-content-muted peer-focus:hidden"
        >
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-card border border-border-default bg-surface-secondary p-1.5 shadow-2xl shadow-black/50">
          {flatResults.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-medium text-content-primary">
                No matches
              </p>
              <p className="mt-1 text-sm text-content-muted">
                Nothing found for &ldquo;{query}&rdquo;. Try a registration,
                nickname or postcode.
              </p>
            </div>
          ) : (
            <div id="omnisearch-listbox" role="listbox" aria-label="Search results">
              {groupedResults.map(({ type, items }) => {
                const config = typeConfig[type];
                const Icon = config.icon;
                return (
                  <div
                    key={type}
                    role="group"
                    aria-labelledby={`omnisearch-group-${type}`}
                    className="[&+&]:mt-1.5 [&+&]:border-t [&+&]:border-border-subtle [&+&]:pt-1.5"
                  >
                    <p
                      id={`omnisearch-group-${type}`}
                      className="px-2.5 pb-1 pt-1.5 text-xs font-semibold text-content-muted"
                    >
                      {config.heading}
                    </p>
                    {items.map((result) => {
                      runningIndex += 1;
                      const index = runningIndex;
                      const isActive = index === activeIndex;
                      return (
                        <div
                          key={`${result.type}-${result.id}`}
                          id={optionId(index)}
                          role="option"
                          aria-selected={isActive}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`flex cursor-pointer items-center gap-3 rounded-control px-2.5 py-2 transition-colors ${
                            isActive ? "bg-surface-hover" : ""
                          }`}
                        >
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-control ${config.chip}`}
                          >
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            {result.registration &&
                            (result.type === "pass" ||
                              result.label === result.registration) ? (
                              <NumberPlate
                                registration={result.registration}
                                size="sm"
                              />
                            ) : (
                              <p className="truncate text-sm font-medium text-content-primary">
                                {result.label}
                              </p>
                            )}
                            <p className="truncate text-sm text-content-muted">
                              {result.sublabel}
                            </p>
                          </div>
                          {result.type === "vehicle" &&
                            result.registration &&
                            result.label !== result.registration && (
                              <NumberPlate
                                registration={result.registration}
                                size="sm"
                                className="shrink-0"
                              />
                            )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};