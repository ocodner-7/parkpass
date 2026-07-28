"use client";
import { useLocationStore } from "@/store/locationStore";
import { useActivePasses } from "@/hooks/queries/useActivePasses";
import { useHousehold } from "@/hooks/queries/useHousehold";
import Link from "next/link";
import { Ticket, Car, Users, Wallet, Plus } from "lucide-react";
import { NumberPlate } from "../components/ui/NumberPlate";
import { useHouseholdStore } from "@/store/householdStore";
import { motion } from "motion/react";
import { useCouncil } from "@/hooks/queries/useCouncil";
import { usePasses } from "@/hooks/queries/usePasses";

const quickActions = [
  {
    label: "Permits",
    description: "Issue and manage",
    icon: Ticket,
    href: "/dashboard/permits",
    iconClass: "text-blue-500",
  },
  {
    label: "Vehicles",
    description: "Saved registrations",
    icon: Car,
    href: "/dashboard/vehicles",
    iconClass: "text-red-500",
  },
  {
    label: "Household",
    description: "Manage members",
    icon: Users,
    href: "/dashboard/household",
    iconClass: "text-purple-500",
  },
  {
    label: "Top up",
    description: "Buy more hours",
    icon: Wallet,
    href: "/dashboard/topup",
    iconClass: "text-amber-500",
  },
];

export default function DashboardPage() {
  const { activeLocation } = useLocationStore();
  const { household: HOUSEHOLD } = useHouseholdStore();

  const { data: passesData } = usePasses(
    activeLocation?.id ?? "",
    HOUSEHOLD?.id ?? "",
  );

  const passesThisMonth = (passesData?.passes ?? []).filter((pass) => {
    const passDate = new Date(pass.startTime);
    const now = new Date();
    return (
      passDate.getMonth() === now.getMonth() &&
      passDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const { data: activePassesData, isLoading: passesLoading } = useActivePasses(
    activeLocation?.id ?? "",
    HOUSEHOLD?.id ?? "",
  );

  const { data: householdData, isLoading: householdLoading } = useHousehold(
    HOUSEHOLD?.id ?? "",
  );

  const { data: councilData } = useCouncil(activeLocation?.councilId ?? "");

  const activePasses = activePassesData?.activePasses ?? [];
  const household = householdData?.household;

  const balancePercentage =
    ((household?.hoursBalance ?? 0) / (household?.monthlyQuota ?? 1)) * 100;

  const today = new Date();
  const resetDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const resetLabel = resetDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const balanceColour =
    balancePercentage > 50
      ? "bg-green-500"
      : balancePercentage > 20
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <motion.div
      key={activeLocation?.id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-content-primary">
            {activeLocation?.nickname ??
              activeLocation?.addressLine1 ??
              "Select a location"}
          </h1>
          {activeLocation && (
            <p className="text-sm text-content-muted mt-0.5">
              {councilData?.council?.name} · {activeLocation?.postcode}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickActions.map(
            ({ label, description, icon: Icon, href, iconClass }) => (
              <Link
                key={label}
                href={href}
                className="bg-surface-secondary border border-border-default rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <Icon
                  className={`w-6 h-6 ${iconClass} group-hover:scale-110 transition-transform`}
                />
                <p className="text-sm font-medium text-content-primary mt-3">
                  {label}
                </p>
                <p className="text-xs text-content-muted mt-0.5">
                  {description}
                </p>
              </Link>
            ),
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-surface-secondary border border-border-default rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-content-primary">
                Active passes
              </h2>
              <Link
                href="/dashboard/permits"
                className="text-xs text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>

            {!activeLocation ? (
              <p className="text-sm text-content-muted py-4 text-center">
                Select a location to see active passes
              </p>
            ) : passesLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-lg bg-surface-elevated animate-pulse"
                  />
                ))}
              </div>
            ) : activePasses.length === 0 ? (
              <p className="text-sm text-content-muted py-4 text-center">
                No active passes for this location
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {activePasses.map((pass) => (
                  <li
                    key={pass.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <NumberPlate registration={pass.registration} />
                      <p className="text-xs text-content-muted mt-0.5">
                        Ends{" "}
                        {new Date(pass.endTime).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                      Active
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/dashboard/permits"
              className="mt-4 w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-content-secondary hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Issue a new pass
            </Link>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-surface-secondary border border-border-default rounded-xl p-5 flex-1">
              <p className="text-xs font-semibold text-content-secondary mb-1">
                Hours balance
              </p>
              {householdLoading ? (
                <div className="h-8 w-24 bg-surface-elevated rounded animate-pulse mt-1" />
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-content-primary">
                      {household?.hoursBalance ?? 0}
                    </span>
                    <span className="text-sm text-content-muted">hrs</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                    <div
                      className={`h-full rounded-full ${balanceColour}`}
                      style={{
                        width: `${((household?.hoursBalance ?? 0) / (household?.monthlyQuota ?? 1)) * 100}%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-surface-secondary border border-border-default rounded-xl p-5 flex-1">
              <p className="text-xs font-semibold text-content-secondary mb-1">
                Monthly quota
              </p>
              {householdLoading ? (
                <div className="h-8 w-24 bg-surface-elevated rounded animate-pulse mt-1" />
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-content-primary">
                      {household?.quotaUsedThisMonth ?? 0}
                    </span>
                    <span className="text-sm text-content-muted">
                      / {household?.monthlyQuota ?? 0} hrs
                    </span>
                  </div>
                  <p className="text-xs text-content-muted mt-1">
                    {`Resets ${resetLabel}`}
                  </p>
                </>
              )}
            </div>

            {/* Passes this month */}
            <div className="bg-surface-secondary border border-border-default rounded-xl p-5 flex-1">
              <p className="text-xs text-content-muted mb-1">
                Passes used this month
              </p>
              <span className="text-3xl font-semibold text-content-primary">
                {passesThisMonth}
              </span>
              {household && (
                <p className="text-xs text-content-muted mt-1">
                  {household.members.length} household members
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
