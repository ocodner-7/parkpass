"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Car,
  ChevronRight,
  MapPin,
  Plus,
  Ticket,
  TriangleAlert,
  Users,
} from "lucide-react";

import { NumberPlate } from "../components/ui/NumberPlate";
import { Card } from "../components/ui/Card";
import { useLocationStore } from "@/store/locationStore";
import { useHouseholdStore } from "@/store/householdStore";
import { useActivePasses } from "@/hooks/queries/useActivePasses";
import { useHousehold } from "@/hooks/queries/useHousehold";
import { useCouncil } from "@/hooks/queries/useCouncil";
import { usePasses } from "@/hooks/queries/usePasses";

// Point this straight at the issue flow if it has its own route
const ISSUE_PASS_HREF = "/dashboard/permits";

const LOW_BALANCE_RATIO = 0.2;
const ENDING_SOON_MS = 15 * 60 * 1000;

const manageLinks = [
  {
    label: "Permits",
    description: "Upcoming and past passes",
    icon: Ticket,
    href: "/dashboard/permits",
    chip: "bg-accent/15 text-accent",
  },
  {
    label: "Vehicles",
    description: "Saved registrations",
    icon: Car,
    href: "/dashboard/vehicles",
    chip: "bg-plate-yellow/15 text-plate-yellow",
  },
  {
    label: "Household",
    description: "Members and access",
    icon: Users,
    href: "/dashboard/household",
    chip: "bg-household/15 text-household",
  },
];

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-solid-hover";

const buttonSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-control border border-border-strong px-4 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover";

/** Ticks on an interval so countdowns stay accurate between refetches. */
function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatRemaining(ms: number) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m left`;
  if (minutes === 0) return `${hours}h left`;
  return `${hours}h ${minutes}m left`;
}

export default function DashboardPage() {
  const { activeLocation } = useLocationStore();
  const { household: storedHousehold } = useHouseholdStore();

  const locationId = activeLocation?.id ?? "";
  const householdId = storedHousehold?.id ?? "";

  const { data: councilData } = useCouncil(activeLocation?.councilId ?? "");
  const { data: householdData, isLoading: householdLoading } =
    useHousehold(householdId);
  const { data: activePassesData, isLoading: activeLoading } =
    useActivePasses(locationId, householdId);
  const { data: passesData, isLoading: passesLoading } = usePasses(
    locationId,
    householdId,
  );

  const household = householdData?.household;

  const passesThisMonth = useMemo(() => {
    const now = new Date();
    return (passesData?.passes ?? []).filter((pass) => {
      const start = new Date(pass.startTime);
      return (
        start.getMonth() === now.getMonth() &&
        start.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [passesData]);

  if (!activeLocation) return <NoLocationState />;

  const subtitle = [councilData?.council?.name, activeLocation.postcode]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      key={activeLocation.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="mx-auto max-w-6xl"
    >
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-content-primary">
            {activeLocation.nickname ?? activeLocation.addressLine1}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-content-secondary">{subtitle}</p>
          )}
        </div>
        <Link href={ISSUE_PASS_HREF} className={`${buttonPrimary} w-full sm:w-auto`}>
          <Plus className="size-4" aria-hidden />
          Issue a pass
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <HoursCard
          className="lg:col-span-2"
          loading={householdLoading}
          balance={household?.hoursBalance ?? 0}
          quota={household?.monthlyQuota ?? 0}
          used={household?.quotaUsedThisMonth ?? 0}
          passesThisMonth={passesThisMonth}
          passesLoading={passesLoading}
        />
        <ActivePassesCard
          className="lg:col-span-3"
          loading={activeLoading}
          passes={activePassesData?.activePasses ?? []}
        />
      </div>

      <nav aria-labelledby="manage-heading" className="mt-8">
        <h2
          id="manage-heading"
          className="mb-3 text-sm font-semibold text-content-secondary"
        >
          Manage
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {manageLinks.map(({ label, description, icon: Icon, href, chip }) => (
            <li key={label}>
              <Link
                href={href}
                className="group flex items-center gap-3 rounded-card border border-border-default bg-surface-secondary p-4 transition-colors hover:border-border-strong hover:bg-surface-hover"
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-control ${chip}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-content-primary">
                    {label}
                  </span>
                  <span className="block truncate text-sm text-content-muted">
                    {description}
                  </span>
                </span>
                <ChevronRight className="size-4 text-content-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}

type HoursCardProps = {
  className?: string;
  loading: boolean;
  balance: number;
  quota: number;
  used: number;
  passesThisMonth: number;
  passesLoading: boolean;
};

function HoursCard({
  className = "",
  loading,
  balance,
  quota,
  used,
  passesThisMonth,
  passesLoading,
}: HoursCardProps) {
  const now = new Date();
  const resetLabel = shortDateFormatter.format(
    new Date(now.getFullYear(), now.getMonth() + 1, 1),
  );

  const usedRatio = quota > 0 ? Math.min(used / quota, 1) : 0;
  const isEmpty = balance <= 0;
  const isLow = !isEmpty && quota > 0 && balance / quota <= LOW_BALANCE_RATIO;

  // White fill reads cleanly on sign blue; amber takes over when hours are short
  const barColour = isLow || isEmpty ? "bg-warning" : "bg-white";

  return (
    <section
      aria-labelledby="hours-heading"
      className={`flex flex-col rounded-card bg-sign-blue p-5 text-white shadow-card ${className}`}
    >
      <h2 id="hours-heading" className="text-sm font-medium text-white/80">
        Hours available
      </h2>

      {loading ? (
        <div className="mt-3 space-y-4 pb-6" aria-busy="true">
          <div className="h-12 w-32 animate-pulse rounded-control bg-white/15" />
          <div className="h-2 animate-pulse rounded-full bg-white/15" />
        </div>
      ) : (
        <>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="text-6xl font-bold tracking-tight tabular-nums">
              {balance}
            </span>
            <span className="text-lg font-medium text-white/80">hrs</span>
          </p>

          {(isLow || isEmpty) && (
            <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-black/25 px-3 py-1 text-sm font-medium">
              <TriangleAlert className="size-4 text-warning" aria-hidden />
              {isEmpty ? "No hours left" : "Running low"}
            </p>
          )}

          <div className="mt-5 pb-6">
            <div
              role="progressbar"
              aria-label="Monthly allowance used"
              aria-valuemin={0}
              aria-valuemax={quota}
              aria-valuenow={used}
              className="h-2 overflow-hidden rounded-full bg-white/20"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${barColour}`}
                style={{ width: `${usedRatio * 100}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm text-white/80">
              <span className="tabular-nums">
                {used} of {quota} hrs used
              </span>
              <span>Resets {resetLabel}</span>
            </div>
          </div>
        </>
      )}

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/15 pt-4">
        <p className="text-sm text-white/80">
          {passesLoading ? (
            <span className="inline-block h-4 w-28 animate-pulse rounded bg-white/15 align-middle" />
          ) : (
            <>
              <span className="font-semibold tabular-nums text-white">
                {passesThisMonth}
              </span>{" "}
              {passesThisMonth === 1 ? "pass" : "passes"} this month
            </>
          )}
        </p>
        <Link
          href="/dashboard/topup"
          className="inline-flex h-10 items-center justify-center rounded-control bg-white px-4 text-sm font-semibold text-sign-blue transition-colors hover:bg-white/90"
        >
          Top up
        </Link>
      </div>
    </section>
  );
}

type ActivePass = {
  id: string;
  registration: string;
  startTime: string | number | Date;
  endTime: string | number | Date;
};

type ActivePassesCardProps = {
  className?: string;
  loading: boolean;
  passes: ActivePass[];
};

function ActivePassesCard({ className = "", loading, passes }: ActivePassesCardProps) {
  const now = useNow();

  // Hide passes that expired since the last fetch rather than showing "0m left"
  const live = passes.filter((pass) => new Date(pass.endTime).getTime() > now);

  return (
    <Card aria-labelledby="active-heading" className={`p-5 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 id="active-heading" className="text-base font-semibold text-content-primary">
            Active passes
          </h2>
          {!loading && live.length > 0 && (
            <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium tabular-nums text-content-secondary">
              {live.length}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/permits"
          className="-m-2 rounded-control p-2 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 pt-2" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-control bg-surface-elevated" />
          ))}
        </div>
      ) : live.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-surface-elevated">
            <Car className="size-5 text-content-muted" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-medium text-content-primary">
            No visitors parked right now
          </p>
          <p className="mt-1 max-w-xs text-sm text-content-muted">
            Passes you issue for this address will show here while they&apos;re running.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {live.map((pass) => {
            const start = new Date(pass.startTime).getTime();
            const end = new Date(pass.endTime).getTime();
            const remaining = end - now;
            const remainingRatio =
              end > start ? Math.min(Math.max(remaining / (end - start), 0), 1) : 0;
            const endingSoon = remaining <= ENDING_SOON_MS;
            const endLabel = timeFormatter.format(end);

            return (
              <li key={pass.id} className="flex items-center gap-4 py-3">
                <NumberPlate registration={pass.registration} />
                <div className="min-w-0 flex-1">
                  <div
                    aria-hidden
                    className="h-1 overflow-hidden rounded-full bg-surface-elevated"
                  >
                    <div
                      className={`h-full rounded-full ${endingSoon ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${remainingRatio * 100}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-sm text-content-muted">
                    {endingSoon ? `Ending soon, at ${endLabel}` : `Until ${endLabel}`}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-sm font-medium tabular-nums ${
                    endingSoon ? "text-warning" : "text-content-primary"
                  }`}
                >
                  {formatRemaining(remaining)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function NoLocationState() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-24 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-surface-elevated">
        <MapPin className="size-6 text-content-secondary" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-content-primary">
        Choose a location
      </h1>
      <p className="mt-2 text-sm text-content-muted">
        Pick an address from the location switcher to see its active passes and
        hours.
      </p>
    </div>
  );
}