// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { supabase } from "@/lib/supabase";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleRegister = async () => {
//     setError("");
//     setIsLoading(true);

//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           first_name: firstName,
//           last_name: lastName,
//         },
//       },
//     });

//     if (error) {
//       setError(error.message);
//       setIsLoading(false);
//       return;
//     }

//     router.push("/dashboard");
//   };

//   const isValid = firstName && lastName && email && password.length >= 6;

//   return (
//     <div className="min-h-screen bg-surface-primary flex items-center justify-center">
//       <div className="bg-surface-secondary border border-border-default rounded-2xl shadow-sm w-full max-w-sm p-8">
//         {/* Logo */}
//         <div className="mb-8">
//           <h1 className="text-xl font-semibold text-content-primary">
//             ParkPass
//           </h1>
//           <p className="text-sm text-content-muted mt-1">Create your account</p>
//         </div>

//         {/* Form */}
//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label htmlFor="first_name" className="block text-xs font-medium text-content-muted mb-1.5">
//                 First name
//               </label>
//               <input
//                 type="text"
//                 id="first_name"
//                 value={firstName}
//                 onChange={(e) => setFirstName(e.target.value)}
//                 placeholder="Jane"
//                 className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label htmlFor="last_name" className="block text-xs font-medium text-content-muted mb-1.5">
//                 Last name
//               </label>
//               <input
//                 type="text"
//                 id="last_name"
//                 value={lastName}
//                 onChange={(e) => setLastName(e.target.value)}
//                 placeholder="Smith"
//                 className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           <div>
//             <label htmlFor="email" className="block text-xs font-medium text-content-muted mb-1.5">
//               Email address
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@example.com"
//               className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-xs font-medium text-content-muted mb-1.5">
//               Password{" "}
//               <span className="text-content-muted">(min. 6 characters)</span>
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter password"
//               className="w-full px-3 py-2.5 text-sm border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           {error && <p className="text-xs text-red-500">{error}</p>}

//           <button
//             onClick={handleRegister}
//             disabled={isLoading || !isValid}
//             className="w-full py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
//           >
//             {isLoading ? "Creating account..." : "Create account"}
//           </button>
//         </div>

//         <p className="text-xs text-content-muted text-center mt-6">
//           Already have an account?{" "}
//           <Link href="/login" className="text-blue-600 hover:underline">
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

const textLink =
  "font-medium text-accent transition-colors hover:text-accent-hover hover:underline";

const MIN_PASSWORD_LENGTH = 6;

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
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
            Create an account
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            Issue visitor passes in seconds, straight from your phone.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="first_name" className={labelClass}>
                First name
              </label>
              <input
                id="first_name"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="last_name" className={labelClass}>
                Last name
              </label>
              <input
                id="last_name"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

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
              aria-describedby={error ? "register-error" : undefined}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error || undefined}
                aria-describedby={
                  error ? "password-hint register-error" : "password-hint"
                }
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
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

          {error && (
            <div
              id="register-error"
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
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-content-secondary">
          Already have an account?{" "}
          <Link href="/login" className={textLink}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};