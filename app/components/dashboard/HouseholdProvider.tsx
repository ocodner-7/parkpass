"use client";
import { supabase } from "@/lib/supabase";
import { useHouseholdStore } from "@/store/householdStore";
import { useEffect } from "react";

export const HouseholdProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setHousehold } = useHouseholdStore();

  useEffect(() => {
    const fetchHousehold = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("user", user);
      if (!user) return;

      const { data: membership, error: membershipError } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("membership", membership);
      console.log("membershipError", membershipError);

      if (!membership) return;

      const { data: household } = await supabase
        .from("households")
        .select("*")
        .eq("id", membership.household_id)
        .single();

      if (household) {
        setHousehold({
          id: household.id,
          name: household.name,
          hoursBalance: household.hours_balance,
          monthlyQuota: household.monthly_quota,
          quotaUsedThisMonth: household.quota_used_this_month,
        });
      }
    };

    fetchHousehold();
  }, [setHousehold]);

  return <>{children}</>;
};
