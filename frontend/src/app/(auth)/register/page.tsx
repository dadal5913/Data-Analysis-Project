"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
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
    <main className="mx-auto mt-24 max-w-md rounded-lg border border-border bg-surface p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create Account</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        {!emailValid ? <p className="text-xs text-red-300">Enter a valid email address.</p> : null}
        {fieldErrors.email ? <p className="text-xs text-red-300">{fieldErrors.email}</p> : null}
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {!passwordValid ? <p className="text-xs text-red-300">Password must be at least 6 characters.</p> : null}
        {fieldErrors.password ? <p className="text-xs text-red-300">{fieldErrors.password}</p> : null}
        {error ? <ErrorBanner message={error} /> : null}
        <Button disabled={isSubmitting || !emailValid || !passwordValid} type="submit">
          {isSubmitting ? "Creating..." : "Register"}
        </Button>
      </form>
    </main>
  );
}
