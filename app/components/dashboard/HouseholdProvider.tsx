"use client";
import { supabase } from "@/lib/supabase";
import { useHouseholdStore } from "@/store/householdStore";
import { useLocationStore } from "@/store/locationStore";
import { useEffect } from "react";

export const HouseholdProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setHousehold } = useHouseholdStore();
  const { setActiveLocation, activeLocation } = useLocationStore();

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

      const { data: locations } = await supabase
        .from("locations")
        .select("*")
        .eq("household_id", membership.household_id)
        .eq("is_default", true)
        .maybeSingle();

      if (locations && !activeLocation) {
        setActiveLocation({
          id: locations.id,
          nickname: locations.nickname ?? null,
          addressLine1: locations.address_line_1,
          addressLine2: locations.address_line_2 ?? null,
          city: locations.city,
          postcode: locations.postcode,
          councilId: locations.council_id,
          householdId: locations.household_id,
          isDefault: locations.is_default,
          activePassCount: 0,
        });
      }

      if (household) {
        setHousehold({
          id: household.id,
          name: household.name,
          members: household.members,
          hoursBalance: household.hours_balance,
          monthlyQuota: household.monthly_quota,
          quotaUsedThisMonth: household.quota_used_this_month,
        });
      }
    };

    fetchHousehold();
  }, [activeLocation, setActiveLocation, setHousehold]);

  return <>{children}</>;
};