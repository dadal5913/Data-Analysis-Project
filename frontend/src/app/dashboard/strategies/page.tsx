"use client";

import { useEffect, useState } from "react";

import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiFetch } from "@/lib/api-client";
import type { StrategyConfig } from "@/types";

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<StrategyConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<StrategyConfig[]>("/strategies");
        setStrategies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load strategies");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Strategies</h1>
      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingSpinner label="Loading strategies..." /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {strategies.map((s) => (
          <div className="rounded-lg border border-border bg-surface p-4" key={s.name}>
            <h2 className="text-lg font-medium">{s.name}</h2>
            <pre className="mt-2 overflow-x-auto text-xs text-gray-300">{JSON.stringify(s.params, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
