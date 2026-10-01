"use client";

import { useState, type FormEvent } from "react";
import { Car, CircleAlert, Loader2, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { Vehicle } from "@/types/graphql";
import { NumberPlate } from "@/app/components/ui/NumberPlate";
import { useHouseholdStore } from "@/store/householdStore";
import { supabase } from "@/lib/supabase";
import { useVehicles } from "@/hooks/queries/useVehicles";
import { ConfirmDialog } from "@/app/components/ui/ConfirmationDialog";
import { ModalWrapper } from "@/app/components/ui/ModalWrapper";
import { BackButton } from "@/app/components/ui/BackButton";

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-control border border-border-strong px-4 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover";

const buttonGhost =
  "inline-flex h-11 items-center justify-center rounded-control px-4 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary";

const cardClass =
  "rounded-card border border-border-default bg-surface-secondary shadow-card";

const labelClass = "block text-sm font-medium text-content-secondary";

const inputClass =
  "h-11 w-full rounded-control border border-border-strong bg-surface-primary px-3.5 text-base text-content-primary placeholder:text-content-muted transition-colors focus-visible:outline-none focus:border-accent focus:ring-3 focus:ring-accent/25 aria-invalid:border-danger aria-invalid:focus:ring-danger/25 sm:text-sm";

// Same plate-style input as IssuePassModal
const plateInputClass =
  "h-14 w-full rounded-control border-2 border-black/80 bg-plate-yellow px-4 text-center font-plate text-2xl uppercase tracking-widest text-neutral-950 placeholder:text-neutral-950/35 focus-visible:outline-none focus:ring-3 focus:ring-accent";

const modalPanel =
  "relative mx-4 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-card border border-border-default bg-surface-secondary shadow-2xl shadow-black/50";

function VehicleRow({
  vehicle,
  onRemove,
}: {
  vehicle: Vehicle;
  onRemove: (vehicleId: string) => void;
}) {
  return (
    <li
      data-testid="vehicle-card"
      className="flex items-center gap-4 px-4 py-4 sm:px-5"
    >
      <NumberPlate registration={vehicle.registration} className="shrink-0" />
      <p
        className={`min-w-0 flex-1 truncate text-sm ${
          vehicle.nickname
            ? "font-medium text-content-primary"
            : "text-content-muted"
        }`}
      >
        {vehicle.nickname ?? "No nickname"}
      </p>
      <button
        type="button"
        onClick={() => onRemove(vehicle.id)}
        aria-label={`Remove ${vehicle.registration}`}
        className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-control text-content-muted transition-colors hover:bg-danger-subtle hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </li>
  );
}

function AddVehicleModal({ onClose }: { onClose: () => void }) {
  const [registration, setRegistration] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isValid = registration.trim().length > 0;

  const queryClient = useQueryClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;
    setIsLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Sign in again to continue.");
      setIsLoading(false);
      return;
    }

    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      setError("You need to set up a household before adding vehicles.");
      setIsLoading(false);
      return;
    }

    const { error: addVehicleError } = await supabase.from("vehicles").insert({
      nickname: nickname.trim() || null,
      registration: registration.trim(),
      user_id: user.id,
      household_id: membership.household_id,
    });

    if (addVehicleError) {
      setError(addVehicleError.message);
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-vehicle-title"
        className={`${modalPanel} max-w-md`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4 sm:px-6">
          <h2
            id="add-vehicle-title"
            className="text-lg font-semibold tracking-tight text-content-primary"
          >
            Add a vehicle
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

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-1.5">
            <label htmlFor="registration_plate" className={labelClass}>
              Registration
            </label>
            {/* The input is styled as the plate itself, so it doubles as the preview */}
            <input
              id="registration_plate"
              type="text"
              required
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="AB12 CDE"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "add-vehicle-error" : undefined}
              className={plateInputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nickname" className={labelClass}>
              Nickname{" "}
              <span className="font-normal text-content-muted">(optional)</span>
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="e.g. Mum's car or Work van"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <div
              id="add-vehicle-error"
              role="alert"
              className="flex gap-2.5 rounded-control bg-danger-subtle px-3.5 py-3 text-sm text-danger"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border-subtle bg-surface-secondary px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className={`${buttonGhost} cursor-pointer`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className={`${buttonPrimary} cursor-pointer`}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {isLoading ? "Saving…" : "Save vehicle"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export default function VehiclesPage() {
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useVehicles(HOUSEHOLD?.id ?? "");
  const queryClient = useQueryClient();
  const vehicles = data?.vehicles ?? [];

  const vehiclePendingRemoval = vehicles.find((v) => v.id === confirmDelete);

  const closeRemoveDialog = () => {
    setConfirmDelete(null);
    setRemoveError("");
  };

  const handleVehicleRemove = async (vehicleId: string) => {
    setIsRemoving(true);
    setRemoveError("");

    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId);

    setIsRemoving(false);

    if (error) {
      console.error("Error removing vehicle:", error);
      setRemoveError("We couldn't remove that vehicle. Please try again.");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    closeRemoveDialog();
  };

  return (
    <>
      <div className="mx-auto max-w-3xl pb-8">
        <BackButton />

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-control bg-plate-yellow/15 text-plate-yellow">
              <Car className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-content-primary">
                Vehicles
              </h1>
              <p className="text-sm text-content-secondary">
                Saved registrations make issuing passes quicker.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={`${buttonPrimary} w-full cursor-pointer sm:w-auto`}
          >
            <Plus className="size-4" aria-hidden />
            Add a vehicle
          </button>
        </header>

        {isLoading ? (
          <ul className={`${cardClass} divide-y divide-border-subtle`} aria-busy="true">
            {[0, 1].map((i) => (
              <li key={i} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                <div className="h-9 w-28 animate-pulse rounded-md bg-surface-elevated" />
                <div className="h-4 w-24 animate-pulse rounded bg-surface-elevated" />
              </li>
            ))}
          </ul>
        ) : vehicles.length === 0 ? (
          <div className={`${cardClass} flex flex-col items-center px-6 py-14 text-center`}>
            <span className="grid size-10 place-items-center rounded-full bg-plate-yellow/15">
              <Car className="size-5 text-plate-yellow" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium text-content-primary">
              No saved vehicles yet
            </p>
            <p className="mt-1 max-w-xs text-sm text-content-muted">
              Save the cars your visitors use most, then pick them in one tap
              when issuing a pass.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className={`${buttonSecondary} mt-5 cursor-pointer`}
            >
              <Plus className="size-4" aria-hidden />
              Add a vehicle
            </button>
          </div>
        ) : (
          <ul className={`${cardClass} divide-y divide-border-subtle`}>
            {vehicles.map((vehicle) => (
              <VehicleRow
                key={vehicle.id}
                vehicle={vehicle}
                onRemove={(id) => setConfirmDelete(id)}
              />
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {showModal && <AddVehicleModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title={
              vehiclePendingRemoval
                ? `Remove ${vehiclePendingRemoval.registration}?`
                : "Remove vehicle?"
            }
            message="It will no longer appear in your saved vehicles. Passes already issued to it won't be affected."
            confirmLabel="Remove"
            onConfirm={() => handleVehicleRemove(confirmDelete)}
            onCancel={closeRemoveDialog}
            isLoading={isRemoving}
            error={removeError}
          />
        )}
      </AnimatePresence>
    </>
  );
}