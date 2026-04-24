"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import type { AppError } from "@/types";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passwordValid = password.length >= 6;
  const emailTouched = email.length > 0;
  const passwordTouched = password.length > 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      router.push("/login");
    } catch (err) {
      const appErr = err as AppError;
      setError(appErr?.message || "Registration failed");
      if (appErr?.fields?.length) {
        setFieldErrors(Object.fromEntries(appErr.fields.map((f) => [f.field, f.message])));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      <div className="relative w-full max-w-[400px] animate-fade-in space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size={40} withWordmark={false} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Start running quant backtests and ML training.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/80 p-6 shadow-pop">
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field
              label="Email"
              error={
                emailTouched && !emailValid
                  ? "Enter a valid email address."
                  : fieldErrors.email
              }
            >
              <Input
                autoComplete="email"
                invalid={emailTouched && (!emailValid || !!fieldErrors.email)}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                value={email}
              />
            </Field>

            <Field
              label="Password"
              hint="At least 6 characters."
              error={
                passwordTouched && !passwordValid
                  ? "Password must be at least 6 characters."
                  : fieldErrors.password
              }
            >
              <Input
                autoComplete="new-password"
                invalid={passwordTouched && (!passwordValid || !!fieldErrors.password)}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                value={password}
              />
            </Field>

            {error ? <ErrorBanner message={error} /> : null}

            <Button
              className="w-full"
              disabled={isSubmitting || !emailValid || !passwordValid}
              size="lg"
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Register"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-foreground-muted">
          Already have an account?{" "}
          <Link className="font-medium text-accent hover:text-accent-hover" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
