"use client";
import { useState } from "react";
import { Wallet, Check } from "lucide-react";
import { useHousehold } from "@/hooks/queries/useHousehold";
import { mockCouncils } from "@/graphql/mock-data";
import { useLocationStore } from "@/store/locationStore";
import { useHouseholdStore } from "@/store/householdStore";
import { useCouncil } from "@/hooks/queries/useCouncil";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { BackButton } from "@/app/components/ui/BackButton";

const HOUR_BUNDLES = [5, 10, 20, 50];

export default function TopUpPage() {
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);
  const [purchased, setPurchased] = useState(false);

  const { activeLocation } = useLocationStore();
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useHousehold(HOUSEHOLD?.id ?? "");
  const queryClient = useQueryClient();

  const household = data?.household;
  // const council = mockCouncils.find(c => c.id === activeLocation?.councilId)
  const { data: councilData } = useCouncil(activeLocation?.councilId ?? "");
  const pricePerHour = councilData?.council?.pricePerHour ?? 150; // pence
  const monthlyQuota = councilData?.council?.monthlyQuotaHours ?? 50;
  const quotaRemaining = monthlyQuota - (household?.quotaUsedThisMonth ?? 0);

  const handlePurchase = async () => {
    if (!selectedBundle) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) return;

    const { data: household } = await supabase
      .from("households")
      .select("hours_balance, quota_used_this_month")
      .eq("id", membership.household_id)
      .single();

    if (!household) return;

    const { error } = await supabase
      .from("households")
      .update({
        hours_balance: household.hours_balance + selectedBundle!,
        quota_used_this_month:
          household.quota_used_this_month + selectedBundle!,
      })
      .eq("id", membership.household_id);

    if (error) {
      console.error("Error topping up:", error);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["household"] });

    setPurchased(true);
    setTimeout(() => {
      setPurchased(false);
      setSelectedBundle(null);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton />
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-content-primary">Top up</h1>
        <p className="text-sm text-content-muted mt-0.5">
          Purchase hours for your household
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-secondary border border-border-default rounded-xl p-4">
          <p className="text-xs text-content-muted mb-1">Current balance</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-surface-secondary rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-content-primary">
                {household?.hoursBalance ?? 0}
              </span>
              <span className="text-xs text-content-muted">hrs</span>
            </div>
          )}
        </div>

        <div className="bg-surface-secondary border border-border-default rounded-xl p-4">
          <p className="text-xs text-content-muted mb-1">Quota remaining</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-surface-secondary rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-content-primary">
                {quotaRemaining}
              </span>
              <span className="text-xs text-content-muted">
                / {monthlyQuota} hrs
              </span>
            </div>
          )}
        </div>

        <div className="bg-surface-secondary border border-border-default rounded-xl p-4">
          <p className="text-xs text-content-muted mb-1">Price per hour</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-content-primary">
              £{(pricePerHour / 100).toFixed(2)}
            </span>
          </div>
          {councilData && (
            <p className="text-xs text-content-muted mt-1">
              {councilData.council.name}
            </p>
          )}
        </div>
      </div>

      <div className="bg-surface-secondary border border-border-default rounded-xl p-6 mb-4">
        <p className="text-sm font-medium text-content-secondary mb-4">
          Select hours to purchase
        </p>
        <div className="grid grid-cols-2 gap-3">
          {HOUR_BUNDLES.map((hours) => {
            const total = (hours * pricePerHour) / 100;
            const exceedsQuota = hours > quotaRemaining;
            const isSelected = selectedBundle === hours;

            return (
              <button
                key={hours}
                onClick={() => !exceedsQuota && setSelectedBundle(isSelected ? null : hours)}
                disabled={exceedsQuota}
                className={`relative p-4 rounded-xl border text-left transition-all ${
                  exceedsQuota
                    ? "border-border-subtle bg-danger-subtle opacity-80 cursor-not-allowed"
                    : isSelected
                      ? "border-accent bg-accent-subtle cursor-pointer"
                      : "border-border-default hover:border-accent hover:bg-accent-subtle cursor-pointer"
                }`} 
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <p
                  className={`text-xl font-semibold ${isSelected ? "text-accent" : "text-content-primary"}`}
                >
                  {hours} hrs
                </p>
                <p
                  className={`text-sm mt-0.5 ${isSelected ? "text-content-secondary" : "text-content-muted"}`}
                >
                  £{total.toFixed(2)}
                </p>
                {exceedsQuota && (
                  <p className="text-xs text-content-muted mt-1">
                    Exceeds monthly quota
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Purchase button */}
      <div className="flex items-center justify-between bg-surface-secondary border border-border-default rounded-xl px-6 py-4">
        <div>
          {selectedBundle ? (
            <p className="text-sm text-content-muted">
              <span className="font-medium text-content-primary">
                {selectedBundle} hrs
              </span>
              {" · "}
              <span className="font-medium text-content-primary">
                £{((selectedBundle * pricePerHour) / 100).toFixed(2)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-content-muted">Select a bundle</p>
          )}
        </div>
        <button
          onClick={handlePurchase}
          disabled={!selectedBundle || purchased}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all ${
            purchased
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
        >
          {purchased ? (
            <>
              <Check className="w-4 h-4" />
              Purchased!
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              Purchase
            </>
          )}
        </button>
      </div>
    </div>
  );
}
