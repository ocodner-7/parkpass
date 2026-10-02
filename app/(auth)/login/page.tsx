"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, Eye, EyeOff, Loader2, Ticket } from "lucide-react";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Registered but never clicked the confirmation link
      setError(
        error.code === "email_not_confirmed"
          ? "Confirm your email first. Check your inbox for the link we sent when you signed up."
          : error.message,
      );
      setIsLoading(false);
      return;
    }

    // Send people with a household straight to the dashboard, instead of
    // detouring through onboarding's spinner and redirect
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    router.push(membership ? "/dashboard" : "/onboarding");
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
            Sign in
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            Manage visitor parking for your household.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
              aria-describedby={error ? "login-error" : undefined}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <Link href="/forgot-password" className={`text-sm ${textLink}`}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? "login-error" : undefined}
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
          </div>

          {error && (
            <div
              id="login-error"
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
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-content-secondary">
          New to ParkPass?{" "}
          <Link href="/register" className={textLink}>
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}