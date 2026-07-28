"use client";
import { useState } from "react";
import { Plus, X, Crown, User } from "lucide-react";
import { useHousehold } from "@/hooks/queries/useHousehold";
import { User as UserType } from "@/types/graphql";
import { useHouseholdStore } from "@/store/householdStore";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/app/components/ui/ConfirmationDialog";
import { ModalWrapper } from "@/app/components/ui/ModalWrapper";
import { AnimatePresence } from "motion/react";
import { BackButton } from "@/app/components/ui/BackButton";

const roleConfig = {
  OWNER: {
    label: "Owner",
    icon: Crown,
    className: "bg-yellow-50 text-yellow-700",
  },
  MEMBER: {
    label: "Member",
    icon: User,
    className: "bg-surface-elevated text-content-muted",
  },
};

function MemberCard({
  member,
  onRemove,
}: {
  member: UserType;
  onRemove: (userId: string) => void;
}) {
  const role = roleConfig[member.role];
  const RoleIcon = role.icon;
  const isOwner = member.role === "OWNER";

  return (
    <div className="bg-surface-secondary border border-border-default rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <span className="text-sm font-medium text-blue-700">
            {member.firstName[0]}
            {member.lastName[0]}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-content-primary">
            {member.firstName} {member.lastName}
          </p>
          <p className="text-xs text-content-muted mt-0.5">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${role.className}`}
        >
          <RoleIcon className="w-3 h-3" />
          {role.label}
        </span>
        <span
          className={`sm:hidden flex items-center justify-center w-6 h-6 rounded-full ${role.className}`}
        >
          <RoleIcon className="w-3 h-3" />
        </span>
        {!isOwner && (
          <button
            onClick={() => onRemove(member.id)}
            aria-label="Delete member"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-content-muted hover:text-red-500 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function InviteMemberModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const isValid = email.includes("@") && email.includes(".");

  const handleSubmit = async () => {
    if (!isValid) return;
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

    const { data: members } = await supabase
      .from("household_members")
      .select("id")
      .eq("household_id", membership.household_id);

    if (members && members.length >= 6) {
      setError("Household is at maximum capacity (6 members)");
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (!profile) {
      setError("No user found with that email");
      setIsLoading(false);
      return;
    }

    if (profile.id === user.id) {
      setError("You can't invite yourself");
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
      setError("This person is already in your household");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.from("household_members").insert({
      household_id: membership.household_id,
      user_id: profile.id,
      role: "MEMBER",
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["household"] });
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="relative bg-surface-secondary rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default-subtle">
          <h2 className="text-base font-semibold text-content-primary">
            Invite a member
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-content-muted" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-content-muted">
            {`They'll receive an email invite to join your household. Once accepted they'll be able to issue passes.`}
          </p>
          <div>
            <label className="block text-xs font-medium text-content-muted mb-1.5">
              Email address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-border-default-subtle flex justify-end gap-3 bg-surface-secondary">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-content hover:text-content-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !isValid}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? "Sending invite..." : "Send invite"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

export default function HouseholdPage() {
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { household: HOUSEHOLD } = useHouseholdStore();
  const { data, isLoading } = useHousehold(HOUSEHOLD?.id ?? "");
  const queryClient = useQueryClient();

  const household = data?.household;
  const members = household?.members ?? [];

  const handleRemoveMember = async (userId: string) => {
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

    const { error } = await supabase
      .from("household_members")
      .delete()
      .eq("user_id", userId)
      .eq("household_id", membership.household_id);

    if (error) {
      console.error("Error removing member:", error);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["household"] });
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-content-primary">
              Household
            </h1>
            <p className="text-sm text-content-muted mt-0.5">
              {members.length} {members.length === 1 ? "member" : "members"}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Invite member
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
        ) : members.length === 0 ? (
          <div className="bg-surface-primary border border-border-default rounded-xl p-12 text-center">
            <User className="w-8 h-8 text-content-secondary mx-auto mb-3" />
            <p className="text-sm text-content-muted">No members yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onRemove={(id) => setConfirmDelete(id)}
              />
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {showModal && <InviteMemberModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title="Remove member"
            message="Are you sure you want to remove this member? This can't be undone."
            confirmLabel="Remove"
            onConfirm={() => handleRemoveMember(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
