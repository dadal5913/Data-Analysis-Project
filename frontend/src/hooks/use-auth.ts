"use client";

import { useMemo } from "react";

import { authStore } from "@/lib/auth";

export function useAuth() {
  return useMemo(
    () => ({
      isAuthenticated: !!authStore.getToken(),
      logout: () => authStore.clear()
    }),
    []
  );
}
