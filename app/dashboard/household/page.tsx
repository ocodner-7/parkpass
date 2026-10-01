"use client";

import { useState, type FormEvent } from "react";
import {
  CircleAlert,
  Crown,
  Loader2,
  Plus,
  User,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { useHousehold } from "@/hooks/queries/useHousehold";
import { User as UserType } from "@/types/graphql";
import { useHouseholdStore } from "@/store/householdStore";
import { supabase } from "@/lib/supabase";
import { ConfirmDialog } from "@/app/components/ui/ConfirmationDialog";
import { ModalWrapper } from "@/app/components/ui/ModalWrapper";
import { BackButton } from "@/app/components/ui/BackButton";

// Mirrors the capacity check in InviteMemberModal
const MAX_MEMBERS = 6;

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-60";

const buttonGhost =
  "inline-flex h-11 items-center justify-center rounded-control px-4 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary";

const cardClass =
  "rounded-card border border-border-default bg-surface-secondary shadow-card";

const labelClass = "block text-sm font-medium text-content-secondary";

const inputClass =
  "h-11 w-full rounded-control border border-border-strong bg-surface-primary px-3.5 text-base text-content-primary placeholder:text-content-muted transition-colors focus-visible:outline-none focus:border-accent focus:ring-3 focus:ring-accent/25 aria-invalid:border-danger aria-invalid:focus:ring-danger/25 sm:text-sm";

const modalPanel =
  "relative mx-4 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-card border border-border-default bg-surface-secondary shadow-2xl shadow-black/50";

const roleConfig = {
  OWNER: {
    label: "Owner",
    icon: Crown,
    className: "bg-household/15 text-household",
  },
  MEMBER: {
    label: "Member",
    icon: User,
    className: "bg-surface-elevated text-content-secondary",
  },
};

function MemberRow({
  member,
  onRemove,
}: {
  member: UserType;
  onRemove: (userId: string) => void;
}) {
  const role = roleConfig[member.role];
  const RoleIcon = role.icon;
  const isOwner = member.role === "OWNER";
  const fullName = `${member.firstName} ${member.lastName}`;

  return (
    <li className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-full bg-household/15 text-sm font-semibold text-household"
      >
        {member.firstName[0]}
        {member.lastName[0]}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-content-primary">
          {fullName}
        </p>
        <p className="truncate text-sm text-content-muted">{member.email}</p>
      </div>

      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${role.className}`}
      >
        <RoleIcon className="size-3.5" aria-hidden />
        <span className="sr-only sm:not-sr-only">{role.label}</span>
      </span>

      {/* Keeps rows aligned when the owner has no remove button */}
      {isOwner ? (
        <span className="size-10 shrink-0" aria-hidden />
      ) : (
        <button
          type="button"
          onClick={() => onRemove(member.id)}
          aria-label={`Remove ${fullName}`}
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-control text-content-muted transition-colors hover:bg-danger-subtle hover:text-danger"
        >
          <UserMinus className="size-4" aria-hidden />
        </button>
      )}
    </li>
  );
}

function InviteMemberModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const isValid = email.includes("@") && email.includes(".");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setIsLoading(true);

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

    const { data: members } = await supabase
      .from("household_members")
      .select("id")
      .eq("household_id", membership.household_id);

    if (members && members.length >= MAX_MEMBERS) {
      setError(`Your household is full. It can have up to ${MAX_MEMBERS} members.`);
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (!profile) {
      setError("No ParkPass account uses that email. Ask them to sign up first.");
      setIsLoading(false);
      return;
    }

    if (profile.id === user.id) {
      setError("That's your own email address.");
      setIsLoading(false);
      return;
    }

    const { data: existingMember } = await supabase
      .from("household_members")
      .select("id")
      .eq("user_id", profile.id)
      .eq("household_id", membership.household_id)
      .maybeSingle();

    if (existingMember) {
      setError("This person is already in your household.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.from("household_members").insert({
      household_id: membership.household_id,
      user_id: profile.id,
      role: "MEMBER",
    });

    if (error) {
      // 23505 = unique violation: they're already in another household
      setError(
        error.code === "23505"
          ? "This person already belongs to another household."
          : error.message,
      );
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["household"] });
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className={`${modalPanel} max-w-md`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4 sm:px-6">
          <h2
            id="invite-title"
            className="text-lg font-semibold tracking-tight text-content-primary"
          >
            Add a member
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
          <p className="text-sm text-content-secondary">
            They&apos;ll share your household&apos;s hours and can issue passes
            straight away. They need a ParkPass account first.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="invite_email" className={labelClass}>
              Email address
            </label>
            <input
              id="invite_email"
              type="email"
              inputMode="email"
              autoComplete="off"
              required
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "invite-error" : undefined}
              className={inputClass}
            />
          </div>

          {error && (
            <div
              id="invite-error"
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
            {isLoading ? "Adding…" : "Add member"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export default function HouseholdPage() {
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useHousehold(HOUSEHOLD?.id ?? "");
  const queryClient = useQueryClient();

  const household = data?.household;
  const members = household?.members ?? [];
  const isFull = members.length >= MAX_MEMBERS;
  const memberPendingRemoval = members.find((m) => m.id === confirmDelete);

  const closeRemoveDialog = () => {
    setConfirmDelete(null);
    setRemoveError("");
  };

  const handleRemoveMember = async (userId: string) => {
    setIsRemoving(true);
    setRemoveError("");

    const fail = (message: string) => {
      setRemoveError(message);
      setIsRemoving(false);
    };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return fail("Your session has expired. Sign in again to continue.");

    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) return fail("We couldn't find your household. Refresh and try again.");

    const { error } = await supabase
      .from("household_members")
      .delete()
      .eq("user_id", userId)
      .eq("household_id", membership.household_id);

    if (error) {
      console.error("Error removing member:", error);
      return fail("We couldn't remove them. Please try again.");
    }

    await queryClient.invalidateQueries({ queryKey: ["household"] });
    setIsRemoving(false);
    closeRemoveDialog();
  };

  return (
    <>
      <div className="mx-auto max-w-3xl pb-8">
        <BackButton />

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-control bg-household/15 text-household">
              <Users className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-content-primary">
                {household?.name ?? "Household"}
              </h1>
              <p className="text-sm text-content-secondary">
                {isLoading ? (
                  "Loading members…"
                ) : (
                  <>
                    <span className="tabular-nums">
                      {members.length} of {MAX_MEMBERS}
                    </span>{" "}
                    members{isFull && ", household is full"}
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={isFull}
            className={`${buttonPrimary} w-full cursor-pointer sm:w-auto`}
          >
            <Plus className="size-4" aria-hidden />
            Add a member
          </button>
        </header>

        {isLoading ? (
          <ul className={`${cardClass} divide-y divide-border-subtle`} aria-busy="true">
            {[0, 1].map((i) => (
              <li key={i} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                <div className="size-10 animate-pulse rounded-full bg-surface-elevated" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-elevated" />
                  <div className="h-3.5 w-44 animate-pulse rounded bg-surface-elevated" />
                </div>
              </li>
            ))}
          </ul>
        ) : members.length === 0 ? (
          <div className={`${cardClass} flex flex-col items-center px-6 py-14 text-center`}>
            <span className="grid size-10 place-items-center rounded-full bg-household/15">
              <Users className="size-5 text-household" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium text-content-primary">
              No members yet
            </p>
            <p className="mt-1 max-w-xs text-sm text-content-muted">
              Add people you live with so they can issue passes from your
              household&apos;s hours.
            </p>
          </div>
        ) : (
          <ul className={`${cardClass} divide-y divide-border-subtle`}>
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                onRemove={(id) => setConfirmDelete(id)}
              />
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {showModal && <InviteMemberModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title={
              memberPendingRemoval
                ? `Remove ${memberPendingRemoval.firstName}?`
                : "Remove member?"
            }
            message="They'll lose access to this household's hours and won't be able to issue passes. You can add them again later."
            confirmLabel="Remove"
            onConfirm={() => handleRemoveMember(confirmDelete)}
            onCancel={closeRemoveDialog}
            isLoading={isRemoving}
            error={removeError}
          />
        )}
      </AnimatePresence>
    </>
  );
}