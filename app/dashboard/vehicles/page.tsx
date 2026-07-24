"use client";
import { useState } from "react";
import { Plus, X, Car } from "lucide-react";
import { Vehicle } from "@/types/graphql";
import { NumberPlate } from "@/app/components/ui/NumberPlate";
import { useHouseholdStore } from "@/store/householdStore";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useVehicles } from "@/hooks/queries/useVehicles";
import { ConfirmDialog } from "@/app/components/ui/ConfirmationDialog";
import { ModalWrapper } from "@/app/components/ui/ModalWrapper";
import { AnimatePresence } from "motion/react";
import { BackButton } from "@/app/components/ui/BackButton";

function VehicleCard({
  vehicle,
  onRemove,
}: {
  vehicle: Vehicle;
  onRemove: (vehicleId: string) => void;
}) {
  return (
    <div data-testid="vehicle-card" className="bg-surface-secondary border border-border-default rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gray-900 border border-border-default flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 text-content-primary" />
        </div>
        <div className="flex gap-4 items-center">
          <NumberPlate registration={vehicle.registration} />
          {vehicle.nickname && (
            <p className="text-sm font-bold text-content-primary">
              {vehicle.nickname}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(vehicle.id)}
        aria-label="Delete vehicle"
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-content-muted hover:text-red-500 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function AddVehicleModal({ onClose }: { onClose: () => void }) {
  const [registration, setRegistration] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isValid = registration.trim().length > 0;

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!isValid) return;
    console.log("Adding vehicle:", { registration, nickname });
    setIsLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      setError("No household found");
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
      <div className="relative bg-surface-secondary rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default-subtle">
          <h2 className="text-base font-semibold text-content-primary">
            Add a vehicle
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-content-muted" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="registration_plate" className="block text-xs font-medium text-content-muted mb-1.5">
              Registration plate <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="registration_plate"
              placeholder="e.g. AB12 CDE"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            />
          </div>

          <div>
            <label htmlFor="nickname" className="block text-xs font-medium text-content-muted mb-1.5">
              Nickname <span className="text-content-muted">(optional)</span>
            </label>
            <input
              type="text"
              id="nickname"
              placeholder="e.g. Mum's car, Work van"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {registration && (
            <div className="pt-1">
              <p className="text-xs text-content-muted mb-2">Preview</p>
              <span
                style={{ fontFamily: "'UK Number Plate', sans-serif" }}
                className="inline-block px-3 py-1 bg-yellow-400 text-black text-sm rounded border-2 border-yellow-600 tracking-wider"
              >
                {registration}
              </span>
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-border-default-subtle flex justify-end gap-3 bg-surface-secondary">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-content-muted hover:text-content-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !isValid}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? "Saving vehicle..." : "Save vehicle"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

export default function VehiclesPage() {
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useVehicles(HOUSEHOLD?.id ?? "");
  const queryClient = useQueryClient();
  const vehicles = data?.vehicles ?? [];

  const handleVehicleRemove = async (vehicleId: string) => {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId);

    if (error) {
      console.log("Error removing vehicle:", error);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-content-primary">
              Vehicles
            </h1>
            <p className="text-sm text-content-muted mt-0.5">
              Saved vehicles for your household
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add vehicle
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-surface-elevated animate-pulse"
              />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-surface-secondary border border-border-default rounded-xl p-12 text-center">
            <Car className="w-8 h-8 text-content-secondary mx-auto mb-3" />
            <p className="text-sm text-content-muted">No vehicles saved yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Add your first vehicle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onRemove={(id) => setConfirmDelete(id)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <AddVehicleModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title="Remove vehicle"
            message="Are you sure you want to remove this vehicle? This can't be undone."
            confirmLabel="Remove"
            onConfirm={() => handleVehicleRemove(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
