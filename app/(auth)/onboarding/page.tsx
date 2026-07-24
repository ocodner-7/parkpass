"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const [householdName, setHouseholdName] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsChecking(false);
        return;
      }

      const { data: membership } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (membership) {
        router.push("/dashboard");
      } else {
        setIsChecking(false);
      }
    };
    check();
  }, [router]);

  if (isChecking)
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-border-default border-t-accent animate-spin" />
      </div>
    );

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) return;
    setIsLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
      return;
    }

    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({ name: householdName.trim() })
      .select()
      .single();

    if (householdError) {
      setError(householdError.message);
      setIsLoading(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("household_members")
      .insert({
        household_id: household.id,
        user_id: user.id,
        role: "OWNER",
      });

    if (memberError) {
      setError(memberError.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="bg-gray-900 border border-border-default rounded-2xl shadow-sm w-full max-w-sm p-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-content-primary">
            Welcome to ParkPass
          </h1>
          <p className="text-sm text-content-muted mt-1">
            {`First, let's set up your household. You can add members later.`}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-content-muted mb-1.5">
              Household name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g. The Williams Family, Flat 4B"
              className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleCreateHousehold()}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleCreateHousehold}
            disabled={isLoading || !householdName.trim()}
            className="w-full py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? "Setting up..." : "Set up household"}
          </button>
        </div>
      </div>
    </div>
  );
}
