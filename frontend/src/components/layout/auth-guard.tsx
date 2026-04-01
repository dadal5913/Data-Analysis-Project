"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authStore } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = authStore.getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
      <div className="p-6">
        <LoadingSpinner label="Checking session..." />
      </div>
    );
  }

  return <>{children}</>;
}
