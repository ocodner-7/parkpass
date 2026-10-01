// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";

// export default function ResetPasswordPage() {
//   const router = useRouter();
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const isValid = password.length >= 6 && password === confirmPassword;

//   const handleSubmit = async () => {
//     if (!isValid) return;
//     setError("");
//     setIsLoading(true);

//     const { error } = await supabase.auth.updateUser({ password });

//     if (error) {
//       setError(error.message);
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
//             ParkPass
//           </h1>
//           <p className="text-sm text-content-muted mt-1">
//             Choose a new password
//           </p>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label
//               htmlFor="new_password"
//               className="block text-xs font-medium text-content-secondary mb-1.5"
//             >
//               New password{" "}
//               <span className="text-content-muted">(min. 6 characters)</span>
//             </label>
//             <input
//               type="password"
//               id="new_password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               className="w-full px-3 py-2.5 text-sm bg-surface-elevated border border-border-default rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-content-primary placeholder:text-content-muted"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="confirm_new_password"
//               className="block text-xs font-medium text-content-secondary mb-1.5"
//             >
//               Confirm new password
//             </label>
//             <input
//               type="password"
//               id="confirm_new_password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="••••••••"
//               onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//               className="w-full px-3 py-2.5 text-sm bg-surface-elevated border border-border-default rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-content-primary placeholder:text-content-muted"
//             />
//           </div>

//           {confirmPassword && password !== confirmPassword && (
//             <p className="text-xs text-danger">{`Passwords don't match`}</p>
//           )}

//           {error && <p className="text-xs text-danger">{error}</p>}

//           <button
//             onClick={handleSubmit}
//             disabled={isLoading || !isValid}
//             className="w-full py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
//           >
//             {isLoading ? "Updating..." : "Update password"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Circle,
  CircleAlert,
  Eye,
  EyeOff,
  Loader2,
  Ticket,
} from "lucide-react";
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

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordLongEnough || password !== confirmPassword) return;
    setError("");
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

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
            Choose a new password
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            You&apos;ll use this to sign in from now on.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="new_password" className={labelClass}>
              New password
            </label>
            <div className="relative">
              <input
                id="new_password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-hint"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-1 my-auto grid size-9 place-items-center rounded-control text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            <p
              id="password-hint"
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                passwordLongEnough ? "text-success" : "text-content-muted"
              }`}
            >
              {passwordLongEnough ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Circle className="size-3.5" aria-hidden />
              )}
              At least {MIN_PASSWORD_LENGTH} characters
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm_new_password" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="confirm_new_password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={mismatch || undefined}
              aria-describedby={mismatch ? "match-hint" : undefined}
              className={inputClass}
            />
            {mismatch && (
              <p
                id="match-hint"
                className="flex items-center gap-1.5 text-sm text-danger"
              >
                <CircleAlert className="size-3.5" aria-hidden />
                Passwords don&apos;t match
              </p>
            )}
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

          <button
            type="submit"
            disabled={isLoading}
            className={`${buttonPrimary} w-full`}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {isLoading ? "Updating password…" : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}