"use client";
import { useState } from "react";
import { X, Clock, Car, CalendarClock } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";
import { useHouseholdStore } from "@/store/householdStore";
import { type StartTimeMode } from "@/types/general";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useVehicles } from "@/hooks/queries/useVehicles";
import { NumberPlate } from "../ui/NumberPlate";
import { useCouncil } from "@/hooks/queries/useCouncil";
import { ModalWrapper } from "../ui/ModalWrapper";

interface IssuePassModalProps {
  onClose: () => void;
}

export function IssuePassModal({ onClose }: IssuePassModalProps) {
  const { activeLocation } = useLocationStore();
  const { household: HOUSEHOLD } = useHouseholdStore();
  const queryClient = useQueryClient();

  const [registration, setRegistration] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [useNewVehicle, setUseNewVehicle] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [startTimeMode, setStartTimeMode] = useState<StartTimeMode>("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const { data: councilData } = useCouncil(activeLocation?.councilId ?? "");
  const council = councilData?.council;

  const { data: vehiclesData } = useVehicles(HOUSEHOLD?.id ?? "");
  const householdVehicles = vehiclesData?.vehicles ?? [];

  const selectedVehicle = householdVehicles.find(
    (v) => v.id === selectedVehicleId,
  );
  const finalRegistration = useNewVehicle
    ? registration
    : (selectedVehicle?.registration ?? "");

  const startTime =
    startTimeMode === "now"
      ? new Date()
      : new Date(`${scheduledDate}T${scheduledTime}`);
  const endTime = selectedDuration
    ? new Date(startTime.getTime() + selectedDuration * 60 * 60 * 1000)
    : null;

  const isValid =
    finalRegistration &&
    selectedDuration &&
    (startTimeMode === "now" || (scheduledDate && scheduledTime));

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);

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

    const start =
      startTimeMode === "now"
        ? new Date()
        : new Date(`${scheduledDate}T${scheduledTime}`);

    const end = new Date(start.getTime() + selectedDuration! * 60 * 60 * 1000);

    const { error: passError } = await supabase.from("passes").insert({
      registration: finalRegistration,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "ACTIVE",
      location_id: activeLocation?.id,
      household_id: membership.household_id,
      issued_by: user.id,
    });

    if (passError) {
      console.error("Error issuing pass:", passError);
      setIsLoading(false);
      return;
    }

    const { error: balanceError } = await supabase
      .from("households")
      .update({
        hours_balance: household.hours_balance - selectedDuration!,
      })
      .eq("id", membership.household_id);

    if (balanceError) {
      console.error("Error deducting hours:", balanceError);
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["active-passes"] });
    await queryClient.invalidateQueries({ queryKey: ["household"] });
    await queryClient.invalidateQueries({ queryKey: ["locations"] });
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose}>
      {/* Modal panel */}
      <div className="relative bg-surface-secondary rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default-subtle">
          <h2 className="text-base font-semibold text-content-primary">
            Issue a pass
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-content-muted cursor-pointer" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Vehicle selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-4 h-4 text-content-muted" />
              <p className="text-sm font-medium text-content-secondary">
                Vehicle
              </p>
            </div>

            {/* Toggle: saved vs new */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setUseNewVehicle(false)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  !useNewVehicle
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "border-border-default text-content-muted hover:bg-surface-primary"
                }`}
              >
                Saved vehicles
              </button>
              <button
                onClick={() => setUseNewVehicle(true)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  useNewVehicle
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "border-border-default text-content-muted hover:bg-surface-primary"
                }`}
              >
                Enter reg manually
              </button>
            </div>

            {useNewVehicle ? (
              <input
                type="text"
                placeholder="e.g. AB12 CDE"
                value={registration}
                onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
            ) : (
              <div className="space-y-2">
                {householdVehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    data-testid="vehicle-option"
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedVehicleId === vehicle.id
                        ? "bg-blue-50 border-blue-200"
                        : "border-border-default hover:bg-surface-primary"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${selectedVehicleId === vehicle.id ? "text-blue-700" : "text-content-primary"}`}
                    >
                      {vehicle.nickname ?? vehicle.registration}
                    </p>
                    {vehicle.nickname && (
                      <p className="text-xs text-content-muted mt-0.5">
                        <NumberPlate registration={vehicle.registration} />
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-content-muted" />
              <p className="text-sm font-medium text-content-secondary">
                Duration
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(council?.availableDurations ?? [1, 2, 4, 8]).map((hours) => (
                <button
                  key={hours}
                  onClick={() => setSelectedDuration(hours)}
                  className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedDuration === hours
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "border-border-default text-content-secondary hover:bg-surface-primary"
                  }`}
                >
                  {hours === 24 ? "All day" : `${hours}h`}
                  {council && (
                    <span className="block text-xs font-normal text-content-muted mt-0.5">
                      £{((council.pricePerHour * hours) / 100).toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Start time */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-content-muted" />
              <p className="text-sm font-medium text-content-secondary">
                Start time
              </p>
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setStartTimeMode("now")}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  startTimeMode === "now"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "border-border-default text-content-muted hover:bg-surface-primary"
                }`}
              >
                Starting now
              </button>
              <button
                onClick={() => setStartTimeMode("scheduled")}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  startTimeMode === "scheduled"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "border-border-default text-content-muted hover:bg-surface-primary"
                }`}
              >
                Schedule
              </button>
            </div>

            {startTimeMode === "scheduled" && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Calculated end time */}
            {endTime && (
              <p className="text-xs text-content-muted mt-2">
                Pass ends at{" "}
                <span className="font-medium text-content-secondary">
                  {endTime.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {startTimeMode === "scheduled" &&
                    ` on ${endTime.toLocaleDateString("en-GB")}`}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default-subtle flex items-center justify-between bg-surface-secondary">
          <div>
            {finalRegistration && selectedDuration ? (
              <p className="text-xs text-content-muted">
                <span className="font-medium text-content-secondary">
                  {finalRegistration}
                </span>
                {" · "}
                {selectedDuration === 24 ? "All day" : `${selectedDuration}h`}
                {council &&
                  ` · £${((council.pricePerHour * selectedDuration) / 100).toFixed(2)}`}
              </p>
            ) : (
              <p className="text-xs text-content-muted">
                Fill in the details above
              </p>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !isValid}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? "Adding pass..." : "Add pass"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
