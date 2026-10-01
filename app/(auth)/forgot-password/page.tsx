// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { supabase } from "@/lib/supabase";

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async () => {
//     setError("");
//     setIsLoading(true);

//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
//     });

//     if (error) {
//       setError(error.message);
//       setIsLoading(false);
//       return;
//     }

//     setSubmitted(true);
//     setIsLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-surface-primary flex items-center justify-center">
//       <div className="bg-surface-secondary border border-border-default rounded-2xl shadow-sm w-full max-w-sm p-8">
//         <div className="mb-8">
//           <h1 className="text-xl font-semibold text-content-primary">
//             ParkPass
//           </h1>
//           <p className="text-sm text-content-muted mt-1">Reset your password</p>
//         </div>

//         {submitted ? (
//           <div className="text-center">
//             <p className="text-sm text-content-primary font-medium mb-2">
//               Check your email
//             </p>
//             <p className="text-sm text-content-muted">
//               {`We've sent a password reset link to `}
//               <span className="text-content-primary">{email}</span>
//             </p>
//             <Link
//               href="/login"
//               className="mt-6 inline-block text-sm text-accent hover:underline cursor-pointer"
//             >
//               Back to sign in
//             </Link>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <p className="text-sm text-content-muted">
//               {`Enter your email address and we'll send you a link to reset your password.`}
//             </p>

//             <div>
//               <label htmlFor="email" className="block text-xs font-medium text-content-secondary mb-1.5">
//                 Email address
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="you@example.com"
//                 onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//                 className="w-full px-3 py-2.5 text-sm bg-surface-elevated border border-border-default rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-content-primary placeholder:text-content-muted"
//               />
//             </div>

//             {error && <p className="text-xs text-danger">{error}</p>}

//             <button
//               onClick={handleSubmit}
//               disabled={isLoading || !email}
//               className="w-full py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
//             >
//               {isLoading ? "Sending..." : "Send reset link"}
//             </button>

//             <p className="text-xs text-content-muted text-center">
//               <Link
//                 href="/login"
//                 className="text-accent hover:underline cursor-pointer"
//               >
//                 Back to sign in
//               </Link>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert, Loader2, MailCheck, Ticket } from "lucide-react";
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

const textLink =
  "font-medium text-accent transition-colors hover:text-accent-hover hover:underline";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSubmitted(true);
    setIsLoading(false);
  };

  return (
    <main className={authShell}>
      <div className={authCard}>
        <div className="mb-8 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-control bg-sign-blue text-white">
            <Ticket className="size-5" aria-hidden />
          </span>
          <span className="text-base font-semibold text-content-primary">
            ParkPass
          </span>
        </div>

        {submitted ? (
          <div role="status">
            <span className="grid size-12 place-items-center rounded-full bg-success-subtle">
              <MailCheck className="size-6 text-success" aria-hidden />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-content-primary">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-content-secondary">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-content-primary">{email}</span>.
              It may take a minute to arrive.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-control border border-border-strong px-4 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-content-primary">
                Reset your password
              </h1>
              <p className="mt-1 text-sm text-content-secondary">
                Enter your email and we&apos;ll send you a link to choose a new
                password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className={labelClass}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={!!error || undefined}
                  aria-describedby={error ? "forgot-error" : undefined}
                  className={inputClass}
                />
              </div>

              {error && (
                <div
                  id="forgot-error"
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
                {isLoading ? "Sending link…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-content-secondary">
              Remembered it?{" "}
              <Link href="/login" className={textLink}>
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}