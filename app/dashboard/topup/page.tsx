"use client";

import { useState } from "react";
import { Check, CircleAlert, Loader2, Receipt, Wallet } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useHousehold } from "@/hooks/queries/useHousehold";
import { useLocationStore } from "@/store/locationStore";
import { useHouseholdStore } from "@/store/householdStore";
import { useCouncil } from "@/hooks/queries/useCouncil";
import { usePurchases } from "@/hooks/queries/usePurchases";
import { supabase } from "@/lib/supabase";
import { BackButton } from "@/app/components/ui/BackButton";

const HOUR_BUNDLES = [5, 10, 20, 50];
const RECENT_PURCHASES = 5;

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-60";

const cardClass =
  "rounded-card border border-border-default bg-surface-secondary shadow-card";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const purchaseDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function TopUpPage() {
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [showAllPurchases, setShowAllPurchases] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const { activeLocation } = useLocationStore();
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useHousehold(HOUSEHOLD?.id ?? "");
  const queryClient = useQueryClient();

  const household = data?.household;
  const { data: councilData } = useCouncil(activeLocation?.councilId ?? "");
  const pricePerHour = councilData?.council?.pricePerHour ?? 150; // pence
  // The household's own allowance is the single source of truth; the
  // monthly reset job uses the same column
  const monthlyQuota = household?.monthlyQuota ?? 50;
  const usedThisMonth = household?.quotaUsedThisMonth ?? 0;

  const { data: purchasesData } = usePurchases(HOUSEHOLD?.id ?? "");
  const purchases = purchasesData?.purchases ?? [];
  const visiblePurchases = showAllPurchases
    ? purchases
    : purchases.slice(0, RECENT_PURCHASES);

  const handlePurchase = async () => {
    if (!selectedBundle || isPurchasing) return;
    setIsPurchasing(true);
    setPurchaseError("");

    try {
      // One transaction in the database: works out the price from the
      // council, adds the hours, and records what was actually paid
      const { error } = await supabase.rpc("purchase_hours", {
        p_location_id: activeLocation?.id,
        p_hours: selectedBundle,
      });

      if (error) {
        console.error("Error topping up:", error);
        setPurchaseError(error.message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["household"] });
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });

      setPurchased(true);
      setTimeout(() => {
        setPurchased(false);
        setSelectedBundle(null);
      }, 2000);
    } finally {
      setIsPurchasing(false);
    }
  };

  const selectedTotal = selectedBundle
    ? (selectedBundle * pricePerHour) / 100
    : 0;

  return (
    <div className="mx-auto max-w-5xl pb-8">
      <BackButton />

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-content-primary">
          Top up hours
        </h1>
        <p className="mt-1 text-sm text-content-secondary">
          Buy extra visitor hours for your household.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8">
        <div>
      {/* Summary strip */}
      <section
        aria-label="Your hours"
        className={`${cardClass} mb-8 grid grid-cols-3 divide-x divide-border-subtle`}
      >
        <div className="p-4 sm:p-5">
          <p className="text-sm text-content-secondary">Balance</p>
          {isLoading ? (
            <div className="mt-1 h-8 w-14 animate-pulse rounded-control bg-surface-elevated" />
          ) : (
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tabular-nums text-content-primary">
                {household?.hoursBalance ?? 0}
              </span>
              <span className="text-sm text-content-muted">hrs</span>
            </p>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-sm text-content-secondary">Used</p>
          {isLoading ? (
            <div className="mt-1 h-8 w-14 animate-pulse rounded-control bg-surface-elevated" />
          ) : (
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tabular-nums text-content-primary">
                {usedThisMonth}
              </span>
              <span className="text-sm text-content-muted">
                / {monthlyQuota}
              </span>
            </p>
          )}
        </div>

        <div className="min-w-0 p-4 sm:p-5">
          <p className="text-sm text-content-secondary">Per hour</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-content-primary">
            {gbp.format(pricePerHour / 100)}
          </p>
          {councilData && (
            <p className="mt-0.5 truncate text-sm text-content-muted">
              {councilData.council.name}
            </p>
          )}
        </div>
      </section>

      {/* Bundles */}
      <section aria-labelledby="bundles-heading" className="mb-6">
        <h2
          id="bundles-heading"
          className="mb-3 text-base font-semibold text-content-primary"
        >
          Choose a bundle
        </h2>
        <div
          role="radiogroup"
          aria-labelledby="bundles-heading"
          className="grid grid-cols-2 gap-3"
        >
          {HOUR_BUNDLES.map((hours) => {
            const total = (hours * pricePerHour) / 100;
            const isSelected = selectedBundle === hours;

            return (
              <button
                key={hours}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedBundle(isSelected ? null : hours)}
                className={`relative rounded-card border p-4 text-left transition-colors sm:p-5 ${
                  isSelected
                      ? "cursor-pointer border-accent bg-accent-subtle ring-1 ring-accent"
                      : "cursor-pointer border-border-default bg-surface-secondary hover:border-border-strong hover:bg-surface-hover"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute right-3 top-3 grid size-5 place-items-center rounded-full border transition-colors ${
                    isSelected
                      ? "border-accent bg-accent text-surface-primary"
                      : "border-border-strong"
                  }`}
                >
                  {isSelected && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="block text-2xl font-semibold tabular-nums text-content-primary">
                  {hours}
                  <span className="ml-1 text-base font-medium text-content-secondary">
                    hrs
                  </span>
                </span>
                <span className="mt-1 block text-sm tabular-nums text-content-secondary">
                  {gbp.format(total)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div
        className={`${cardClass} sticky bottom-4 z-10 flex items-center justify-between gap-4 px-4 py-3 sm:static sm:px-5 sm:py-4`}
      >
        <p className="min-w-0 text-sm text-content-secondary" aria-live="polite">
          {selectedBundle ? (
            <>
              <span className="font-semibold tabular-nums text-content-primary">
                {selectedBundle} hrs
              </span>{" "}
              for{" "}
              <span className="font-semibold tabular-nums text-content-primary">
                {gbp.format(selectedTotal)}
              </span>
            </>
          ) : (
            "Choose a bundle to continue"
          )}
        </p>
        <button
          type="button"
          onClick={handlePurchase}
          disabled={!selectedBundle || isPurchasing || purchased}
          className={
            purchased
              ? "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-success px-5 text-sm font-semibold text-surface-primary"
              : `${buttonPrimary} shrink-0`
          }
        >
          {purchased ? (
            <>
              <Check className="size-4" aria-hidden />
              Hours added
            </>
          ) : isPurchasing ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Buying…
            </>
          ) : (
            <>
              <Wallet className="size-4" aria-hidden />
              Buy hours
            </>
          )}
        </button>
      </div>

      {purchaseError && (
        <div
          role="alert"
          className="mt-3 flex gap-2.5 rounded-control bg-danger-subtle px-3.5 py-3 text-sm text-danger"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{purchaseError}</p>
        </div>
      )}

        </div>

        {/* History */}
        <section aria-labelledby="history-heading" className="mt-12 lg:mt-0">
          <h2
            id="history-heading"
            className="mb-3 text-base font-semibold text-content-primary"
          >
            Purchase history
          </h2>
          {purchases.length === 0 ? (
            <p className={`${cardClass} px-4 py-6 text-center text-sm text-content-muted sm:px-5`}>
              Hours you buy will show here.
            </p>
          ) : (
            <>
              <ul className={`${cardClass} divide-y divide-border-subtle`}>
                {visiblePurchases.map((purchase) => (
                  <li
                    key={purchase.id}
                    className="flex items-center gap-3 px-4 py-3 sm:px-5"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-control bg-surface-elevated text-content-secondary">
                      <Receipt className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-content-primary">
                        {purchase.hoursPurchased} hrs
                      </p>
                      <p className="text-sm text-content-muted">
                        {purchaseDateFormatter.format(new Date(purchase.createdAt))}
                      </p>
                    </div>
                    <p className="text-sm font-medium tabular-nums text-content-primary">
                      {gbp.format(
                        (purchase.pricePaidPence ??
                          purchase.hoursPurchased *
                            (councilData?.council?.pricePerHour ?? 0)) / 100,
                      )}
                    </p>
                  </li>
                ))}
              </ul>
              {purchases.length > RECENT_PURCHASES && (
                <button
                  type="button"
                  onClick={() => setShowAllPurchases((v) => !v)}
                  className="mt-2 inline-flex h-10 cursor-pointer items-center rounded-control px-2 -ml-2 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  {showAllPurchases
                    ? "Show recent only"
                    : `Show all ${purchases.length} purchases`}
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}