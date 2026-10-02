"use client";

import { useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, Loader2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCouncils } from "@/hooks/queries/useCouncils";
import { ModalWrapper } from "../ui/ModalWrapper";

interface AddLocationModalProps {
  onClose: () => void;
}

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-60";

const buttonGhost =
  "inline-flex h-11 items-center justify-center rounded-control px-4 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary";

const labelClass = "block text-sm font-medium text-content-secondary";

const inputClass =
  "h-11 w-full rounded-control border border-border-strong bg-surface-primary px-3.5 text-base text-content-primary placeholder:text-content-muted transition-colors focus-visible:outline-none focus:border-accent focus:ring-3 focus:ring-accent/25 aria-invalid:border-danger aria-invalid:focus:ring-danger/25 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

const modalPanel =
  "relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-card border border-border-default bg-surface-secondary shadow-2xl shadow-black/50";

const optional = (
  <span className="font-normal text-content-muted">(optional)</span>
);

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
        setPostcodeError("We couldn't find that postcode. Check it and try again.");
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
        setPostcodeError(
          `${localAuthority} isn't supported yet. ParkPass covers London boroughs only.`,
        );
        setPostcodeLoading(false);
        return;
      }

      setCouncilId(matched.id);
      setCouncilName(matched.name);
    } catch {
      setPostcodeError("Couldn't check that postcode. Try again in a moment.");
    }

    setPostcodeLoading(false);
  };

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
      setError("We couldn't find your household. Refresh and try again.");
      setIsLoading(false);
      return;
    }

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

  const postcodeStatusId = "postcode-status";
  const showPostcodeStatus = postcodeError || (councilName && !postcodeLoading);

  return (
    <ModalWrapper onClose={onClose} titleId="add-location-title" size="md">
      <form onSubmit={handleSubmit} className={modalPanel}>
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4 sm:px-6">
          <h2
            id="add-location-title"
            className="text-lg font-semibold tracking-tight text-content-primary"
          >
            Add a location
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
          {/* Postcode first: it decides whether the address is supported at all */}
          <div className="space-y-1.5">
            <label htmlFor="postcode" className={labelClass}>
              Postcode
            </label>
            <div className="relative">
              <input
                id="postcode"
                type="text"
                required
                autoComplete="postal-code"
                autoCapitalize="characters"
                spellCheck={false}
                value={postcode}
                disabled={councils.length === 0}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                onBlur={(e) => lookupPostcode(e.target.value)}
                placeholder={councils.length === 0 ? "Loading…" : "E5 9RB"}
                aria-invalid={!!postcodeError || undefined}
                aria-describedby={
                  showPostcodeStatus ? postcodeStatusId : "postcode-hint"
                }
                className={`${inputClass} pr-11 tracking-wide`}
              />
              {postcodeLoading && (
                <Loader2
                  className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-content-muted"
                  aria-label="Checking postcode"
                />
              )}
              {councilId && !postcodeLoading && (
                <CircleCheck
                  className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-success"
                  aria-hidden
                />
              )}
            </div>

            <div aria-live="polite">
              {postcodeError ? (
                <p
                  id={postcodeStatusId}
                  className="flex gap-1.5 text-sm text-danger"
                >
                  <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {postcodeError}
                </p>
              ) : councilName && !postcodeLoading ? (
                <p
                  id={postcodeStatusId}
                  className="flex items-center gap-1.5 text-sm text-success"
                >
                  <CircleCheck className="size-3.5 shrink-0" aria-hidden />
                  Covered by{" "}
                  <span className="font-semibold">{councilName}</span>
                </p>
              ) : (
                <p id="postcode-hint" className="text-sm text-content-muted">
                  We&apos;ll use this to find your council&apos;s parking rules.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address_line_1" className={labelClass}>
              Address line 1
            </label>
            <input
              id="address_line_1"
              type="text"
              required
              autoComplete="address-line1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="15 Oak Avenue"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address_line_2" className={labelClass}>
              Address line 2 {optional}
            </label>
            <input
              id="address_line_2"
              type="text"
              autoComplete="address-line2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Flat 4B"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="city" className={labelClass}>
              Town or city
            </label>
            <input
              id="city"
              type="text"
              required
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="London"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nickname" className={labelClass}>
              Nickname {optional}
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Home or Mum's house"
              className={inputClass}
            />
          </div>

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
            {isLoading ? "Saving…" : "Save location"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}