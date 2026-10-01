// "use client";
// import { useState } from "react";
// import { Plus, Clock, OctagonX, XCircle } from "lucide-react";
// import { useLocationStore } from "@/store/locationStore";
// import { useActivePasses } from "@/hooks/queries/useActivePasses";
// import { IssuePassModal } from "@/app/components/permits/IssuePassModal";
// import { Pass } from "@/types/graphql";
// import { NumberPlate } from "@/app/components/ui/NumberPlate";
// import { useHouseholdStore } from "@/store/householdStore";
// import { usePasses } from "@/hooks/queries/usePasses";
// import { AnimatePresence } from "motion/react";
// import { BackButton } from "@/app/components/ui/BackButton";

// type Tab = "active" | "history";

// const statusConfig = {
//   ACTIVE: {
//     label: "Active",
//     icon: Clock,
//     className: "bg-green-50 text-green-700",
//   },
//   EXPIRED: {
//     label: "Expired",
//     icon: OctagonX,
//     className: "bg-surface-elevated text-content-muted",
//   },
//   CANCELLED: {
//     label: "Cancelled",
//     icon: XCircle,
//     className: "bg-red-50 text-red-600",
//   },
// };

// function PassRow({ pass }: { pass: Pass }) {
//   const status = statusConfig[pass.status];
//   const StatusIcon = status.icon;

//   return (
//     <li className="flex items-center justify-between py-4 gap-3">
//       <div className="flex items-center gap-3 min-w-0">
//         <NumberPlate
//           registration={pass.registration}
//           className="shrink-0"
//           size="sm"
//         />
//         <p className="text-xs text-content-muted truncate">
//           {new Date(pass.startTime).toLocaleTimeString("en-GB", {
//             hour: "2-digit",
//             minute: "2-digit",
//           })}
//           {" - "}
//           {new Date(pass.endTime).toLocaleTimeString("en-GB", {
//             hour: "2-digit",
//             minute: "2-digit",
//           })}
//           {" · "}
//           {new Date(pass.startTime).toLocaleDateString("en-GB", {
//             day: "numeric",
//             month: "short",
//           })}
//         </p>
//       </div>
//       <span
//         className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.className}`}
//       >
//         <StatusIcon className="w-3 h-3" />
//         <span className="hidden sm:inline">{status.label}</span>
//       </span>
//     </li>
//   );
// }

// export default function PermitsPage() {
//   const [activeTab, setActiveTab] = useState<Tab>("active");
//   const [showModal, setShowModal] = useState(false);
//   const { activeLocation } = useLocationStore();
//   const { household: HOUSEHOLD } = useHouseholdStore();

//   const { data: activePassesData, isLoading: isActivePassesLoading } =
//     useActivePasses(activeLocation?.id ?? "", HOUSEHOLD?.id ?? "");

//   const { data: passesData } = usePasses(
//     activeLocation?.id ?? "",
//     HOUSEHOLD?.id ?? "",
//   );

//   const activePasses = activePassesData?.activePasses ?? [];
//   const passes = passesData?.passes ?? [];

//   const historyPasses = passes.filter((p) => p.status !== "ACTIVE");

//   console.log("passes:", passes);
//   console.log("historyPasses:", historyPasses);

//   const tabs: { key: Tab; label: string; count?: number }[] = [
//     { key: "active", label: "Active", count: activePasses.length },
//     { key: "history", label: "History", count: historyPasses.length },
//   ];

//   return (
//     <>
//       <div className="max-w-3xl mx-auto">
//         <BackButton />
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <p className="text-xs text-content-muted mb-0.5">
//               {HOUSEHOLD?.name}
//             </p>
//             <h1 className="text-2xl font-semibold text-content-primary">
//               Permits
//             </h1>
//             <p className="text-sm text-content-muted mt-0.5">
//               {activeLocation?.nickname ??
//                 activeLocation?.addressLine1 ??
//                 "Select a location"}
//             </p>
//           </div>

//           <button
//             onClick={() => setShowModal(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
//           >
//             <Plus className="w-4 h-4" />
//             Issue pass
//           </button>
//         </div>

//         <div className="flex gap-1 border-b border-border-default mb-6">
//           {tabs.map((tab) => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium cursor-pointer border-b-2 -mb-px transition-colors ${
//                 activeTab === tab.key
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-content-muted hover:text-content-secondary"
//               }`}
//             >
//               {tab.label}
//               {tab.count !== undefined && tab.count > 0 && (
//                 <span
//                   className={`text-xs px-1.5 py-0.5 rounded-full ${
//                     activeTab === tab.key
//                       ? "bg-blue-100 text-blue-700"
//                       : "bg-surface-elevated text-content-muted"
//                   }`}
//                 >
//                   {tab.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         <div className="bg-surface-secondary border border-border-default rounded-xl">
//           {!activeLocation ? (
//             <p className="text-sm font-semibold text-content-muted text-center py-12">
//               Select a location to view passes
//             </p>
//           ) : isActivePassesLoading ? (
//             <div className="divide-y divide-gray-100 px-5">
//               {[1, 2, 3].map((i) => (
//                 <div key={i} className="py-4 flex items-center gap-4">
//                   <div className="w-10 h-10 rounded-lg bg-surface-elevated animate-pulse" />
//                   <div className="space-y-2 flex-1">
//                     <div className="h-4 w-32 bg-surface-elevated rounded animate-pulse" />
//                     <div className="h-3 w-48 bg-surface-elevated rounded animate-pulse" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : activeTab === "active" ? (
//             activePasses.length === 0 ? (
//               <div className="text-center py-12">
//                 <p className="text-sm text-content-muted">No active passes</p>
//                 <button
//                   onClick={() => setShowModal(true)}
//                   className="mt-3 text-sm text-blue-600 hover:underline"
//                 >
//                   Issue one now
//                 </button>
//               </div>
//             ) : (
//               <ul className="divide-y divide-gray-100 px-5">
//                 {activePasses.map((pass) => (
//                   <PassRow key={pass.id} pass={pass} />
//                 ))}
//               </ul>
//             )
//           ) : historyPasses.length === 0 ? (
//             <p className="text-sm text-content-muted text-center py-12">
//               No past passes for this location
//             </p>
//           ) : (
//             <ul className="divide-y divide-gray-100 px-5">
//               {historyPasses.map((pass) => (
//                 <PassRow key={pass.id} pass={pass} />
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>

//       <AnimatePresence>
//         {showModal && <IssuePassModal onClose={() => setShowModal(false)} />}
//       </AnimatePresence>
//     </>
//   );
// }
"use client";

import { useState } from "react";
import { Clock, History, OctagonX, Plus, Ticket, XCircle } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useLocationStore } from "@/store/locationStore";
import { useHouseholdStore } from "@/store/householdStore";
import { useActivePasses } from "@/hooks/queries/useActivePasses";
import { usePasses } from "@/hooks/queries/usePasses";
import { IssuePassModal } from "@/app/components/permits/IssuePassModal";
import { NumberPlate } from "@/app/components/ui/NumberPlate";
import { BackButton } from "@/app/components/ui/BackButton";
import { Pass } from "@/types/graphql";

type Tab = "active" | "history";

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-control border border-border-strong px-4 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover";

const cardClass =
  "rounded-card border border-border-default bg-surface-secondary shadow-card";

const statusConfig = {
  ACTIVE: {
    label: "Active",
    icon: Clock,
    className: "bg-success-subtle text-success",
  },
  EXPIRED: {
    label: "Expired",
    icon: OctagonX,
    className: "bg-surface-elevated text-content-secondary",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-danger-subtle text-danger",
  },
};

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function PassRow({ pass }: { pass: Pass }) {
  const status = statusConfig[pass.status];
  const StatusIcon = status.icon;
  const start = new Date(pass.startTime);
  const end = new Date(pass.endTime);

  return (
    <li className="flex items-center gap-4 px-4 py-4 sm:px-5">
      <NumberPlate
        registration={pass.registration}
        className="shrink-0"
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium tabular-nums text-content-primary">
          {timeFormatter.format(start)}–{timeFormatter.format(end)}
        </p>
        <p className="truncate text-sm text-content-muted">
          {dayFormatter.format(start)}
        </p>
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
      >
        <StatusIcon className="size-3.5" aria-hidden />
        <span className="sr-only sm:not-sr-only">{status.label}</span>
      </span>
    </li>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y divide-border-subtle" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-4 px-4 py-4 sm:px-5">
          <div className="h-8 w-24 animate-pulse rounded-md bg-surface-elevated" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-elevated" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-surface-elevated" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-surface-elevated" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof Ticket;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-surface-elevated">
        <Icon className="size-5 text-content-muted" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-medium text-content-primary">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-content-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default function PermitsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [showModal, setShowModal] = useState(false);
  const { activeLocation } = useLocationStore();
  const { household: HOUSEHOLD } = useHouseholdStore();

  const { data: activePassesData, isLoading: isActivePassesLoading } =
    useActivePasses(activeLocation?.id ?? "", HOUSEHOLD?.id ?? "");

  const { data: passesData, isLoading: isPassesLoading } = usePasses(
    activeLocation?.id ?? "",
    HOUSEHOLD?.id ?? "",
  );

  const activePasses = activePassesData?.activePasses ?? [];
  const passes = passesData?.passes ?? [];
  const historyPasses = passes.filter((p) => p.status !== "ACTIVE");

  const isLoading =
    activeTab === "active" ? isActivePassesLoading : isPassesLoading;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "active", label: "Active", count: activePasses.length },
    { key: "history", label: "History", count: historyPasses.length },
  ];

  const locationName =
    activeLocation?.nickname ?? activeLocation?.addressLine1 ?? null;

  return (
    <>
      <div className="mx-auto max-w-3xl pb-8">
        <BackButton />

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-control bg-accent/15 text-accent">
              <Ticket className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-content-primary">
                Permits
              </h1>
              {locationName && (
                <p className="truncate text-sm text-content-secondary">
                  Visitor passes for {locationName}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={!activeLocation}
            className={`${buttonPrimary} w-full cursor-pointer sm:w-auto`}
          >
            <Plus className="size-4" aria-hidden />
            Issue a pass
          </button>
        </header>

        <div
          role="tablist"
          aria-label="Passes"
          className="mb-4 flex gap-1 border-b border-border-default"
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={selected}
                aria-controls="passes-panel"
                onClick={() => setActiveTab(tab.key)}
                className={`-mb-px flex h-11 cursor-pointer items-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors ${
                  selected
                    ? "border-accent text-content-primary"
                    : "border-transparent text-content-muted hover:text-content-primary"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                      selected
                        ? "bg-accent-subtle text-accent"
                        : "bg-surface-elevated text-content-secondary"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          id="passes-panel"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className={cardClass}
        >
          {!activeLocation ? (
            <EmptyState
              icon={Ticket}
              title="Choose a location"
              body="Pick an address from the location switcher to see its passes."
            />
          ) : isLoading ? (
            <ListSkeleton />
          ) : activeTab === "active" ? (
            activePasses.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No active passes"
                body="Passes you issue for this address will show here while they're running."
                action={
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className={`${buttonSecondary} cursor-pointer`}
                  >
                    <Plus className="size-4" aria-hidden />
                    Issue a pass
                  </button>
                }
              />
            ) : (
              <ul className="divide-y divide-border-subtle">
                {activePasses.map((pass) => (
                  <PassRow key={pass.id} pass={pass} />
                ))}
              </ul>
            )
          ) : historyPasses.length === 0 ? (
            <EmptyState
              icon={History}
              title="No past passes"
              body="Expired and cancelled passes for this address will be listed here."
            />
          ) : (
            <ul className="divide-y divide-border-subtle">
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