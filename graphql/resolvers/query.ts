import { Council, Household, Location, Pass, Purchase, Vehicle } from "@/types/graphql";
import { supabaseServer } from "@/lib/supabase.server";

export const queryResolvers = {
  locations: async (
    _: unknown,
    args: { householdId: string },
  ): Promise<Location[] | null> => {
    const { data: locations } = await supabaseServer
      .from("locations")
      .select("*")
      .eq("household_id", args.householdId);

    const locationIds = locations?.map((l) => l.id) ?? [];

    const { data: passes, error: passesError } = await supabaseServer
      .from("passes")
      .select("location_id")
      .in("location_id", locationIds)
      .eq("status", "ACTIVE")
      .gt("end_time", new Date().toISOString());

    console.log("passesError:", passesError);

    return (
      locations?.map((loc) => ({
        id: loc.id,
        nickname: loc.nickname ?? null,
        addressLine1: loc.address_line_1,
        addressLine2: loc.address_line_2 ?? null,
        city: loc.city,
        postcode: loc.postcode,
        councilId: loc.council_id,
        householdId: loc.household_id,
        activePassCount:
          passes?.filter((p) => p.location_id === loc.id).length ?? 0,
        isDefault: loc.is_default,
      })) ?? []
    );
  },
  location: async (
    _: unknown,
    args: { locationId: string },
  ): Promise<Location | null> => {
    const { data: location } = await supabaseServer
      .from("locations")
      .select("*")
      .eq("id", args.locationId)
      .single();

    if (!location) return null;

    const { data: passes } = await supabaseServer
      .from("passes")
      .select("location_id")
      .eq("location_id", args.locationId)
      .eq("status", "ACTIVE")
      .gt("end_time", new Date().toISOString());

    return {
      id: location.id,
      nickname: location.nickname,
      addressLine1: location.address_line_1,
      addressLine2: location.address_line_2,
      city: location.city,
      postcode: location.postcode,
      councilId: location.council_id,
      householdId: location.household_id,
      activePassCount: passes?.length ?? 0,
      isDefault: location.is_default,
    };
  },
  passes: async (
    _: unknown,
    args: { locationId: string; householdId: string },
  ): Promise<Pass[] | null> => {
    // trigger pass expiry in the DB
    await supabaseServer.rpc("expire_passes");

    const { data: passes } = await supabaseServer
      .from("passes")
      .select("*")
      .eq("location_id", args.locationId)
      .eq("household_id", args.householdId);

    return (
      passes?.map((p) => ({
        id: p.id,
        registration: p.registration,
        startTime: p.start_time,
        endTime: p.end_time,
        householdId: p.household_id,
        locationId: p.location_id,
        issuedBy: p.issued_by,
        status: new Date(p.end_time) < new Date() ? "EXPIRED" : p.status,
      })) ?? []
    );
  },
  activePasses: async (
    _: unknown,
    args: { locationId: string; householdId: string },
  ): Promise<Pass[] | null> => {
    // trigger pass expiry in the DB
    await supabaseServer.rpc("expire_passes");

    const { data: activePasses } = await supabaseServer
      .from("passes")
      .select("*")
      .eq("location_id", args.locationId)
      .eq("household_id", args.householdId)
      .eq("status", "ACTIVE")
      .gt("end_time", new Date().toISOString());

    return (
      activePasses?.map((ap) => ({
        id: ap.id,
        registration: ap.registration,
        startTime: ap.start_time,
        endTime: ap.end_time,
        householdId: ap.household_id,
        locationId: ap.location_id,
        issuedBy: ap.issued_by,
        status: new Date(ap.end_time) < new Date() ? "EXPIRED" : ap.status,
      })) ?? []
    );
  },
  household: async (
    _: unknown,
    args: { householdId: string },
  ): Promise<Household | null> => {
    const { data: household } = await supabaseServer
      .from("households")
      .select("*")
      .eq("id", args.householdId)
      .single();

    if (!household) return null;

    // Fetch memberships
    const { data: memberships } = await supabaseServer
      .from("household_members")
      .select("user_id, role")
      .eq("household_id", args.householdId);

    // Fetch profiles for each member
    const memberIds = memberships?.map((m) => m.user_id) ?? [];

    const { data: profiles } = await supabaseServer
      .from("profiles")
      .select("*")
      .in("id", memberIds);

    const members =
      memberships?.map((membership) => {
        const profile = profiles?.find((p) => p.id === membership.user_id);
        return {
          id: membership.user_id,
          firstName: profile?.first_name ?? "",
          lastName: profile?.last_name ?? "",
          email: profile?.email ?? "",
          householdId: args.householdId,
          role: membership.role as "OWNER" | "MEMBER",
        };
      }) ?? [];

    return {
      id: household.id,
      members: members,
      name: household.name,
      hoursBalance: household.hours_balance,
      monthlyQuota: household.monthly_quota,
      quotaUsedThisMonth: household.quota_used_this_month,
    };
  },
  vehicles: async (
    _: unknown,
    args: { householdId: string },
  ): Promise<Vehicle[] | null> => {
    const { data: vehicles } = await supabaseServer
      .from("vehicles")
      .select("*")
      .eq("household_id", args.householdId);

    return (
      vehicles?.map((vehicle) => ({
        id: vehicle.id,
        nickname: vehicle.nickname,
        registration: vehicle.registration,
        householdId: vehicle.household_id,
        userId: vehicle.user_id,
      })) ?? []
    );
  },
  councils: async (): Promise<Council[] | null> => {
    const { data: councils } = await supabaseServer
      .from("councils")
      .select("*");

    return (
      councils?.map((council) => ({
        id: council.id,
        name: council.name,
        availableDurations: council.available_durations,
        hoursRollOver: council.hours_roll_over,
        maxHoursPerPass: council.max_hours_per_pass,
        monthlyQuotaHours: council.monthly_quota_hours,
        operatingHoursStart: council.operating_hours_start,
        operatingHoursEnd: council.operating_hours_end,
        pricePerHour: council.price_per_hour,
        requiresVehicleReg: council.requires_vehicle_reg,
      })) ?? []
    );
  },
  council: async (
    _: unknown,
    args: { councilId: string },
  ): Promise<Council | null> => {
    const { data: council } = await supabaseServer
      .from("councils")
      .select("*")
      .eq("id", args.councilId)
      .single();

    return {
      id: council.id,
      name: council.name,
      availableDurations: council.available_durations,
      hoursRollOver: council.hours_roll_over,
      maxHoursPerPass: council.max_hours_per_pass,
      monthlyQuotaHours: council.monthly_quota_hours,
      operatingHoursStart: council.operating_hours_start,
      operatingHoursEnd: council.operating_hours_end,
      pricePerHour: council.price_per_hour,
      requiresVehicleReg: council.requires_vehicle_reg,
    };
  },
  purchases: async (
    _: unknown,
    args: { householdId: string },
  ): Promise<Purchase[]> => {
    await supabaseServer.rpc("expire_passes");

    const { data: purchases } = await supabaseServer
      .from("purchases")
      .select("*")
      .eq("household_id", args.householdId)
      .order("created_at", { ascending: false });

    return (
      purchases?.map((p) => ({
        id: p.id,
        householdId: p.household_id,
        hoursPurchased: p.hours_purchased,
        createdAt: p.created_at,
      })) ?? []
    );
  },
};
