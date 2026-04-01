"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
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
    <main className="mx-auto mt-24 max-w-md rounded-lg border border-border bg-surface p-6">
      <h1 className="mb-4 text-2xl font-semibold">QuantLab Login</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        {!emailValid ? <p className="text-xs text-red-300">Enter a valid email address.</p> : null}
        {fieldErrors.email ? <p className="text-xs text-red-300">{fieldErrors.email}</p> : null}
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {!passwordValid ? <p className="text-xs text-red-300">Password must be at least 6 characters.</p> : null}
        {fieldErrors.password ? <p className="text-xs text-red-300">{fieldErrors.password}</p> : null}
        {error ? <ErrorBanner message={error} /> : null}
        <Button disabled={isSubmitting || !emailValid || !passwordValid} type="submit">
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </main>
  );
}
