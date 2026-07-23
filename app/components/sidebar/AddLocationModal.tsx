"use client";
import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useCouncils } from "@/hooks/queries/useCouncils";
import { ModalWrapper } from "../ui/ModalWrapper";

interface AddLocationModalProps {
  onClose: () => void;
}

export function AddLocationModal({ onClose }: AddLocationModalProps) {
  const queryClient = useQueryClient();
  const { data: councilsData } = useCouncils();
  const councils = councilsData?.councils ?? [];

  const [nickname, setNickname] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [councilId, setCouncilId] = useState("");
  const [councilName, setCouncilName] = useState("");
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [postcodeError, setPostcodeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    addressLine1.trim() && city.trim() && postcode.trim() && councilId;

  const lookupPostcode = async (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    if (cleaned.length < 5) return;

    setPostcodeLoading(true);
    setPostcodeError("");
    setCouncilId("");
    setCouncilName("");

    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${cleaned}`);
      const data = await res.json();

      if (!res.ok || data.status !== 200) {
        setPostcodeError("Invalid postcode — please check and try again");
        setPostcodeLoading(false);
        return;
      }

      const localAuthority = data.result.admin_district as string;

      // Try to match against our councils table
      const matched = councils.find(
        (c) =>
          c.name.toLowerCase().includes(localAuthority.toLowerCase()) ||
          localAuthority.toLowerCase().includes(c.name.toLowerCase()),
      );

      if (!matched) {
        setPostcodeError(`${localAuthority} is not a supported London borough`);
        setPostcodeLoading(false);
        return;
      }

      setCouncilId(matched.id);
      setCouncilName(matched.name);
    } catch {
      setPostcodeError("Failed to look up postcode — please try again");
    }

    setPostcodeLoading(false);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError("");

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

    const { error } = await supabase.from("locations").insert({
      nickname: nickname.trim() || null,
      address_line_1: addressLine1.trim(),
      address_line_2: addressLine2.trim() || null,
      city: city.trim(),
      postcode: postcode.trim().toUpperCase(),
      household_id: membership.household_id,
      council_id: councilId,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["locations"] });
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="relative bg-surface-secondary rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default-subtle">
          <h2 className="text-base font-semibold text-content-primary">
            Add a location
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
            <label className="block text-xs font-medium text-content-muted mb-1.5">
              Nickname <span className="text-content-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Home, Mum's house"
              className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-content-muted mb-1.5">
              Address line 1 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="e.g. 15 Oak Avenue"
              className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-content-muted mb-1.5">
              Address line 2 <span className="text-content-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="e.g. Flat 4B"
              className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-content-muted mb-1.5">
                City <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. London"
                className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-content-muted mb-1.5">
                Postcode <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  onBlur={(e) => lookupPostcode(e.target.value)}
                  placeholder="e.g. E5 9RB"
                  className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                />
                {postcodeLoading && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted animate-spin" />
                )}
                {councilId && !postcodeLoading && (
                  <CheckCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {postcodeError && (
            <p className="text-xs text-red-500">{postcodeError}</p>
          )}
          {councilName && !postcodeError && (
            <p className="text-xs text-green-600">
              ✓ Detected: <span className="font-medium">{councilName}</span>
            </p>
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
            {isLoading ? "Adding..." : "Add location"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
