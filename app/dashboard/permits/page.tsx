"use client";
import { useState } from "react";
import { Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";
import { useActivePasses } from "@/hooks/queries/useActivePasses";
import { IssuePassModal } from "@/app/components/permits/IssuePassModal";
import { Pass } from "@/types/graphql";
import { NumberPlate } from "@/app/components/ui/NumberPlate";
import { useHouseholdStore } from "@/store/householdStore";
import { usePasses } from "@/hooks/queries/usePasses";
import { AnimatePresence } from "motion/react";
import { BackButton } from "@/app/components/ui/BackButton";

type Tab = "active" | "history";

const statusConfig = {
  ACTIVE: {
    label: "Active",
    icon: Clock,
    className: "bg-green-50 text-green-700",
  },
  EXPIRED: {
    label: "Expired",
    icon: CheckCircle,
    className: "bg-surface-elevated text-content-muted",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-600",
  },
};

function PassRow({ pass }: { pass: Pass }) {
  const status = statusConfig[pass.status];
  const StatusIcon = status.icon;

  return (
    <li className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <NumberPlate registration={pass.registration} />
        </div>
        <div>
          <p className="text-sm font-medium text-content-primary">
            {pass.registration}
          </p>
          <p className="text-xs text-content-muted mt-0.5">
            {new Date(pass.startTime).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" - "}
            {new Date(pass.endTime).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}
            {new Date(pass.startTime).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      </div>
      <span
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}
      >
        <StatusIcon className="w-3 h-3" />
        {status.label}
      </span>
    </li>
  );
}

export default function PermitsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [showModal, setShowModal] = useState(false);
  const { activeLocation } = useLocationStore();
  const { household: HOUSEHOLD } = useHouseholdStore();

  const { data: activePassesData, isLoading: isActivePassesLoading } =
    useActivePasses(activeLocation?.id ?? "", HOUSEHOLD?.id ?? "");

  const { data: passesData } = usePasses(
    activeLocation?.id ?? "",
    HOUSEHOLD?.id ?? "",
  );

  const activePasses = activePassesData?.activePasses ?? [];
  const passes = passesData?.passes ?? [];

  const historyPasses = passes.filter((p) => p.status !== "ACTIVE");

  console.log("passes:", passes);
  console.log("historyPasses:", historyPasses);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "active", label: "Active", count: activePasses.length },
    { key: "history", label: "History", count: historyPasses.length },
  ];

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-content-muted mb-0.5">
              {HOUSEHOLD?.name}
            </p>
            <h1 className="text-2xl font-semibold text-content-primary">
              Permits
            </h1>
            <p className="text-sm text-content-muted mt-0.5">
              {activeLocation?.nickname ??
                activeLocation?.addressLine1 ??
                "Select a location"}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Issue pass
          </button>
        </div>

        <div className="flex gap-1 border-b border-border-default mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium cursor-pointer border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-content-muted hover:text-content-secondary"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-700"
                      : "bg-surface-elevated text-content-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-surface-secondary border border-border-default rounded-xl">
          {!activeLocation ? (
            <p className="text-sm font-semibold text-content-muted text-center py-12">
              Select a location to view passes
            </p>
          ) : isActivePassesLoading ? (
            <div className="divide-y divide-gray-100 px-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-surface-elevated rounded animate-pulse" />
                    <div className="h-3 w-48 bg-surface-elevated rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "active" ? (
            activePasses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-content-muted">No active passes</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Issue one now
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 px-5">
                {activePasses.map((pass) => (
                  <PassRow key={pass.id} pass={pass} />
                ))}
              </ul>
            )
          ) : historyPasses.length === 0 ? (
            <p className="text-sm text-content-muted text-center py-12">
              No past passes for this location
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 px-5">
              {historyPasses.map((pass) => (
                <PassRow key={pass.id} pass={pass} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && <IssuePassModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
