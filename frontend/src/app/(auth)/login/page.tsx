"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authStore } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@quantlab.dev");
  const [password, setPassword] = useState("demo1234");
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    authStore.setToken(data.access_token);
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto mt-24 max-w-md rounded-lg border border-border bg-surface p-6">
      <h1 className="mb-4 text-2xl font-semibold">QuantLab Login</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit">Sign In</Button>
      </form>
    </main>
  );
}
