"use client";

import { useState } from "react";
import {
  CalendarClock,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocationStore } from "@/store/locationStore";
import { useHouseholdStore } from "@/store/householdStore";
import { type StartTimeMode } from "@/types/general";
import { supabase } from "@/lib/supabase";
import { useVehicles } from "@/hooks/queries/useVehicles";
import { useCouncil } from "@/hooks/queries/useCouncil";
import { useHousehold } from "@/hooks/queries/useHousehold";
import { NumberPlate } from "../ui/NumberPlate";
import { ModalWrapper } from "../ui/ModalWrapper";

interface IssuePassModalProps {
  onClose: () => void;
}

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-60";

const inputClass =
  "h-11 w-full rounded-control border border-border-strong bg-surface-primary px-3.5 text-base text-content-primary placeholder:text-content-muted transition-colors focus-visible:outline-none focus:border-accent focus:ring-3 focus:ring-accent/25 aria-invalid:border-danger aria-invalid:focus:ring-danger/25 sm:text-sm";

// Same selectable-card treatment as the top up bundles
const optionBase =
  "relative cursor-pointer rounded-control border text-left transition-colors";
const optionIdle =
  "border-border-default bg-surface-secondary hover:border-border-strong hover:bg-surface-hover";
const optionSelected = "border-accent bg-accent-subtle ring-1 ring-accent";

// Segmented control for binary choices
const segmentGroup =
  "grid grid-cols-2 gap-1 rounded-control bg-surface-primary p-1";
const segmentBase =
  "h-9 cursor-pointer rounded-[calc(var(--radius-control)-4px)] text-sm font-medium transition-colors";
const segmentIdle = "text-content-muted hover:text-content-primary";
const segmentSelected = "bg-surface-elevated text-content-primary shadow-sm";

const VISIBLE_VEHICLES = 4;

const legendClass =
  "mb-3 flex items-center gap-2 text-sm font-semibold text-content-primary";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors ${
        selected
          ? "border-accent bg-accent text-surface-primary"
          : "border-border-strong"
      }`}
    >
      {selected && <Check className="size-3" strokeWidth={3} />}
    </span>
  );
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

  const [showAllVehicles, setShowAllVehicles] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: councilData } = useCouncil(activeLocation?.councilId ?? "");
  const council = councilData?.council;

  const { data: householdData } = useHousehold(HOUSEHOLD?.id ?? "");
  const hoursBalance = householdData?.household?.hoursBalance ?? 0;

  const { data: vehiclesData } = useVehicles(HOUSEHOLD?.id ?? "");
  const householdVehicles = vehiclesData?.vehicles ?? [];

  const selectedVehicle = householdVehicles.find(
    (v) => v.id === selectedVehicleId,
  );

  // Collapsed list shows the first few, plus the selected vehicle if it sits further down
  const collapsedVehicles = householdVehicles.filter(
    (v, i) => i < VISIBLE_VEHICLES || v.id === selectedVehicleId,
  );
  const hiddenVehicleCount = householdVehicles.length - collapsedVehicles.length;
  const visibleVehicles = showAllVehicles ? householdVehicles : collapsedVehicles;
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
  const endTimeValid = endTime && !Number.isNaN(endTime.getTime());

  const isValid =
    finalRegistration &&
    selectedDuration &&
    (startTimeMode === "now" || (scheduledDate && scheduledTime));

  const formatDuration = (hours: number) =>
    hours === 24 ? "All day" : `${hours} hr${hours === 1 ? "" : "s"}`;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError("");

    const fail = (message: string) => {
      setError(message);
      setIsLoading(false);
    };

    const start =
      startTimeMode === "now"
        ? new Date()
        : new Date(`${scheduledDate}T${scheduledTime}`);

    // One transaction in the database: checks the balance, deducts the hours,
    // counts them towards this month's usage, and creates the pass
    const { error: issueError } = await supabase.rpc("issue_pass", {
      p_location_id: activeLocation?.id,
      p_registration: finalRegistration,
      p_start: start.toISOString(),
      p_hours: selectedDuration,
    });

    if (issueError) {
      console.error("Error issuing pass:", issueError);
      return fail(issueError.message);
    }

    await queryClient.invalidateQueries({ queryKey: ["active-passes"] });
    await queryClient.invalidateQueries({ queryKey: ["household"] });
    await queryClient.invalidateQueries({ queryKey: ["locations"] });
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose} titleId="issue-pass-title" size="lg">
      <div
        className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-card border border-border-default bg-surface-secondary shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4 sm:px-6">
          <h2
            id="issue-pass-title"
            className="text-lg font-semibold tracking-tight text-content-primary"
          >
            Issue a pass
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 grid size-9 cursor-pointer place-items-center rounded-control text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Vehicle */}
          <fieldset>
            <legend className={legendClass}>
              <Car className="size-4 text-content-muted" aria-hidden />
              Vehicle
            </legend>

            <div role="radiogroup" aria-label="Vehicle source" className={`${segmentGroup} mb-3`}>
              <button
                type="button"
                role="radio"
                aria-checked={!useNewVehicle}
                onClick={() => setUseNewVehicle(false)}
                className={`${segmentBase} ${!useNewVehicle ? segmentSelected : segmentIdle}`}
              >
                Saved vehicles
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={useNewVehicle}
                onClick={() => setUseNewVehicle(true)}
                className={`${segmentBase} ${useNewVehicle ? segmentSelected : segmentIdle}`}
              >
                Enter a reg
              </button>
            </div>

            {useNewVehicle ? (
              <div>
                <label htmlFor="registration" className="sr-only">
                  Registration number
                </label>
                {/* Styled as a UK rear plate so the reg reads the way it will on the car */}
                <input
                  id="registration"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="AB12 CDE"
                  value={registration}
                  onChange={(e) =>
                    setRegistration(e.target.value.toUpperCase())
                  }
                  className="h-14 w-full rounded-control border-2 border-black/80 bg-plate-yellow px-4 text-center font-plate text-2xl uppercase tracking-widest text-neutral-950 placeholder:text-neutral-950/35 focus-visible:outline-none focus:ring-3 focus:ring-accent"
                />
              </div>
            ) : householdVehicles.length === 0 ? (
              <div className="rounded-control border border-dashed border-border-default px-4 py-6 text-center">
                <p className="text-sm text-content-secondary">
                  No saved vehicles yet.
                </p>
                <button
                  type="button"
                  onClick={() => setUseNewVehicle(true)}
                  className="mt-1 cursor-pointer text-sm font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
                >
                  Enter a registration instead
                </button>
              </div>
            ) : (
              <>
              <div role="radiogroup" aria-label="Saved vehicles" className="space-y-2">
                {visibleVehicles.map((vehicle) => {
                  const selected = selectedVehicleId === vehicle.id;
                  return (
                    <button
                      key={vehicle.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      data-testid="vehicle-option"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`${optionBase} flex w-full items-center gap-3 px-3.5 py-3 ${
                        selected ? optionSelected : optionIdle
                      }`}
                    >
                      <NumberPlate
                        registration={vehicle.registration}
                        size="sm"
                        className="shrink-0"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-content-primary">
                        {vehicle.nickname}
                      </span>
                      <RadioDot selected={selected} />
                    </button>
                  );
                })}
              </div>
              {(hiddenVehicleCount > 0 || showAllVehicles) && householdVehicles.length > VISIBLE_VEHICLES && (
                <button
                  type="button"
                  onClick={() => setShowAllVehicles((v) => !v)}
                  aria-expanded={showAllVehicles}
                  className="mt-2 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-control text-sm font-medium text-accent transition-colors hover:bg-surface-hover hover:text-accent-hover"
                >
                  {showAllVehicles ? (
                    <>
                      <ChevronUp className="size-4" aria-hidden />
                      Show fewer
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-4" aria-hidden />
                      Show {hiddenVehicleCount} more
                    </>
                  )}
                </button>
              )}
              </>
            )}
          </fieldset>

          {/* Duration */}
          <fieldset>
            <legend className={legendClass}>
              <Clock className="size-4 text-content-muted" aria-hidden />
              Duration
            </legend>
            <div role="radiogroup" aria-label="Duration" className="grid grid-cols-3 gap-2">
              {(council?.availableDurations ?? [1, 2, 4, 8]).map((hours) => {
                const selected = selectedDuration === hours;
                const notEnoughHours = hours > hoursBalance;
                return (
                  <button
                    key={hours}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={notEnoughHours}
                    onClick={() => setSelectedDuration(hours)}
                    className={`${optionBase} px-3 py-3 text-center ${
                      notEnoughHours
                        ? "cursor-not-allowed border-dashed border-border-default opacity-50"
                        : selected
                          ? optionSelected
                          : optionIdle
                    }`}
                  >
                    <span className="block text-base font-semibold tabular-nums text-content-primary">
                      {formatDuration(hours)}
                    </span>
                    {council && (
                      <span className="mt-0.5 block text-sm tabular-nums text-content-secondary">
                        {gbp.format((council.pricePerHour * hours) / 100)}
                      </span>
                    )}
                    {notEnoughHours && (
                      <span className="mt-0.5 block text-xs text-content-muted">
                        Not enough hours
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Start time */}
          <fieldset>
            <legend className={legendClass}>
              <CalendarClock className="size-4 text-content-muted" aria-hidden />
              Start time
            </legend>
            <div role="radiogroup" aria-label="Start time" className={`${segmentGroup} mb-3`}>
              <button
                type="button"
                role="radio"
                aria-checked={startTimeMode === "now"}
                onClick={() => setStartTimeMode("now")}
                className={`${segmentBase} ${startTimeMode === "now" ? segmentSelected : segmentIdle}`}
              >
                Start now
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={startTimeMode === "scheduled"}
                onClick={() => setStartTimeMode("scheduled")}
                className={`${segmentBase} ${startTimeMode === "scheduled" ? segmentSelected : segmentIdle}`}
              >
                Schedule for later
              </button>
            </div>

            {startTimeMode === "scheduled" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="scheduled_date" className="block text-sm font-medium text-content-secondary">
                    Date
                  </label>
                  <input
                    id="scheduled_date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="scheduled_time" className="block text-sm font-medium text-content-secondary">
                    Time
                  </label>
                  <input
                    id="scheduled_time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {endTimeValid && (
              <p className="mt-3 flex items-center gap-2 rounded-control bg-surface-primary px-3.5 py-2.5 text-sm text-content-secondary">
                <Clock className="size-4 shrink-0 text-content-muted" aria-hidden />
                <span>
                  Ends at{" "}
                  <span className="font-semibold tabular-nums text-content-primary">
                    {timeFormatter.format(endTime)}
                  </span>
                  {startTimeMode === "scheduled" && (
                    <> on {dayFormatter.format(endTime)}</>
                  )}
                </span>
              </p>
            )}
          </fieldset>

          {error && (
            <div
              role="alert"
              className="flex gap-2.5 rounded-control bg-danger-subtle px-3.5 py-3 text-sm text-danger"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-border-subtle bg-surface-secondary px-5 py-4 sm:px-6">
          <div className="min-w-0 text-sm" aria-live="polite">
            {finalRegistration && selectedDuration ? (
              <>
                <p className="truncate font-semibold text-content-primary">
                  {finalRegistration}
                </p>
                <p className="tabular-nums text-content-secondary">
                  {formatDuration(selectedDuration)}
                  {council &&
                    ` for ${gbp.format((council.pricePerHour * selectedDuration) / 100)}`}
                </p>
              </>
            ) : (
              <p className="text-content-muted">
                Choose a vehicle and duration
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !isValid}
            className={`${buttonPrimary} shrink-0 cursor-pointer`}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {isLoading ? "Issuing…" : "Issue pass"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}