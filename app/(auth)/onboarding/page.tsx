// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";

// export default function OnboardingPage() {
//   const router = useRouter();
//   const [householdName, setHouseholdName] = useState("");
//   const [isChecking, setIsChecking] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const check = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!user) {
//         setIsChecking(false);
//         return;
//       }

//       const { data: membership } = await supabase
//         .from("household_members")
//         .select("household_id")
//         .eq("user_id", user.id)
//         .maybeSingle();

//       if (membership) {
//         router.push("/dashboard");
//       } else {
//         setIsChecking(false);
//       }
//     };
//     check();
//   }, [router]);

//   if (isChecking)
//     return (
//       <div className="min-h-screen bg-surface-primary flex items-center justify-center">
//         <div className="w-6 h-6 rounded-full border-2 border-border-default border-t-accent animate-spin" />
//       </div>
//     );

//   const handleCreateHousehold = async () => {
//     if (!householdName.trim()) return;
//     setIsLoading(true);
//     setError("");

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       setError("Something went wrong. Please try again.");
//       setIsLoading(false);
//       return;
//     }

//     const { data: household, error: householdError } = await supabase
//       .from("households")
//       .insert({ name: householdName.trim() })
//       .select()
//       .single();

//     if (householdError) {
//       setError(householdError.message);
//       setIsLoading(false);
//       return;
//     }

//     const { error: memberError } = await supabase
//       .from("household_members")
//       .insert({
//         household_id: household.id,
//         user_id: user.id,
//         role: "OWNER",
//       });

//     if (memberError) {
//       setError(memberError.message);
//       setIsLoading(false);
//       return;
//     }

//     router.push("/dashboard");
//   };

//   return (
//     <div className="min-h-screen bg-surface-primary flex items-center justify-center">
//       <div className="bg-surface-secondary border border-border-default rounded-2xl shadow-sm w-full max-w-sm p-8">
//         <div className="mb-8">
//           <h1 className="text-xl font-semibold text-content-primary">
//             Welcome to ParkPass
//           </h1>
//           <p className="text-sm text-content-muted mt-1">
//             {`First, let's set up your household. You can add members later.`}
//           </p>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-medium text-content-muted mb-1.5">
//               Household name <span className="text-red-400">*</span>
//             </label>
//             <input
//               type="text"
//               value={householdName}
//               onChange={(e) => setHouseholdName(e.target.value)}
//               placeholder="e.g. The Williams Family, Flat 4B"
//               className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               onKeyDown={(e) => e.key === "Enter" && handleCreateHousehold()}
//             />
//           </div>

//           {error && <p className="text-xs text-red-500">{error}</p>}

//           <button
//             onClick={handleCreateHousehold}
//             disabled={isLoading || !householdName.trim()}
//             className="w-full py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
//           >
//             {isLoading ? "Setting up..." : "Set up household"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Loader2, Ticket } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Shared auth styles: keep these strings identical across the auth pages
const authShell =
  "flex min-h-dvh items-center justify-center bg-surface-primary px-5 py-12";

const authCard =
  "w-full max-w-sm sm:rounded-card sm:border sm:border-border-default sm:bg-surface-secondary sm:p-8 sm:shadow-card";

const labelClass = "block text-sm font-medium text-content-secondary";

const inputClass =
  "h-11 w-full rounded-control border border-border-strong bg-surface-primary px-3.5 text-base text-content-primary placeholder:text-content-muted transition-colors focus-visible:outline-none focus:border-accent focus:ring-3 focus:ring-accent/25 aria-invalid:border-danger aria-invalid:focus:ring-danger/25 sm:text-sm";

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-60";

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
      <main className={authShell}>
        <Loader2
          className="size-6 animate-spin text-content-muted"
          aria-label="Loading"
        />
      </main>
    );

  const handleCreateHousehold = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!householdName.trim()) return;
    setIsLoading(true);
    setError("");

    const { error } = await supabase.rpc("create_household", {
      household_name: householdName.trim(),
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className={authShell}>
      <div className={authCard}>
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-control bg-sign-blue text-white">
              <Ticket className="size-5" aria-hidden />
            </span>
            <span className="text-base font-semibold text-content-primary">
              ParkPass
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-content-primary">
            Set up your household
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            Everyone in your household shares one pool of visitor hours. You
            can add members later.
          </p>
        </div>

        <form onSubmit={handleCreateHousehold} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="household_name" className={labelClass}>
              Household name
            </label>
            <input
              id="household_name"
              type="text"
              required
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g. The Williams Family or Flat 4B"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "onboarding-error" : undefined}
              className={inputClass}
            />
          </div>

          {error && (
            <div
              id="onboarding-error"
              role="alert"
              className="flex gap-2.5 rounded-control bg-danger-subtle px-3.5 py-3 text-sm text-danger"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`${buttonPrimary} w-full`}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {isLoading ? "Setting up…" : "Set up household"}
          </button>
        </form>
      </div>
    </main>
  );
}