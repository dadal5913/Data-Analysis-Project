"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Watchlist } from "@/components/dashboard/watchlist";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiFetch } from "@/lib/api-client";
import type { BacktestResult } from "@/types";

export default function DashboardPage() {
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<BacktestResult[]>("/backtests");
        setBacktests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const latest = useMemo(() => (backtests.length > 0 ? backtests[0] : null), [backtests]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingSpinner label="Loading dashboard..." /> : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="Latest Total Return"
          value={latest ? `${((latest.metrics.total_return || 0) * 100).toFixed(2)}%` : "N/A"}
        />
        <KpiCard
          label="Latest Sharpe"
          value={latest ? (latest.metrics.sharpe_ratio || 0).toFixed(2) : "N/A"}
        />
        <KpiCard
          label="Latest Max DD"
          value={latest ? `${((latest.metrics.max_drawdown || 0) * 100).toFixed(2)}%` : "N/A"}
        />
        <KpiCard label="Backtests" value={String(backtests.length)} />
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-3 text-lg font-medium">Recent Backtests</h2>
        {backtests.length === 0 ? (
          <p className="text-sm text-gray-400">No backtests yet. Run one from the backtests page.</p>
        ) : (
          <div className="space-y-2">
            {backtests.slice(0, 5).map((b) => (
              <Link className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm hover:bg-[#0b1020]" href={`/dashboard/backtests/${b.id}`} key={b.id}>
                <span>{b.strategy_name}</span>
                <span>{((b.metrics.total_return || 0) * 100).toFixed(2)}%</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-medium">Live Watchlist</h2>
        <Watchlist />
      </div>
    </div>
  );
}
