"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authStore } from "@/lib/auth";
import { apiFetch } from "@/lib/api-client";
import type { AppError, Token } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@quantlab.dev");
  const [password, setPassword] = useState("demo1234");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passwordValid = password.length >= 6;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const data = await apiFetch<Token>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      authStore.setToken(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      const appErr = err as AppError;
      setError(appErr?.message || "Login failed");
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
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Sign in to your QuantLab workspace.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/80 p-6 shadow-pop">
          <div className="mb-5 rounded-lg border border-accent/30 bg-accent-subtle px-3 py-2.5 text-xs text-foreground">
            <p className="font-medium text-accent">Demo account</p>
            <p className="mt-0.5 text-foreground-muted">
              Pre-filled below &middot; demo@quantlab.dev / demo1234
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <Field
              label="Email"
              error={
                !emailValid
                  ? "Enter a valid email address."
                  : fieldErrors.email
              }
            >
              <Input
                autoComplete="email"
                invalid={!emailValid || !!fieldErrors.email}
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </Field>

            <Field
              label="Password"
              error={
                !passwordValid
                  ? "Password must be at least 6 characters."
                  : fieldErrors.password
              }
            >
              <Input
                autoComplete="current-password"
                invalid={!passwordValid || !!fieldErrors.password}
                onChange={(e) => setPassword(e.target.value)}
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
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-foreground-muted">
          Don&apos;t have an account?{" "}
          <Link className="font-medium text-accent hover:text-accent-hover" href="/register">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
