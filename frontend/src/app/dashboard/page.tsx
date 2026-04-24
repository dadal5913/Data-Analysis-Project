"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Watchlist } from "@/components/dashboard/watchlist";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import {
  IconArrowUpRight,
  IconBolt,
  IconLineChart,
  IconSparkles,
  IconTrendingDown,
  IconTrendingUp
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import { apiFetch } from "@/lib/api-client";
import type { BacktestResult } from "@/types";

function fmtPct(n: number | undefined) {
  return `${((n || 0) * 100).toFixed(2)}%`;
}

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
  const latestReturn = latest?.metrics.total_return ?? 0;
  const latestSharpe = latest?.metrics.sharpe_ratio ?? 0;
  const latestDD = latest?.metrics.max_drawdown ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Research Dashboard"
        description="Snapshot of your latest simulations, model performance and live market state."
        actions={
          <>
            <Link href="/dashboard/backtests">
              <Button variant="secondary" size="sm" leftIcon={<IconLineChart size={14} />}>
                New backtest
              </Button>
            </Link>
            <Link href="/dashboard/ml">
              <Button size="sm" leftIcon={<IconSparkles size={14} />}>
                Train model
              </Button>
            </Link>
          </>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingSpinner label="Loading dashboard..." /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Latest Total Return"
          value={latest ? fmtPct(latestReturn) : "N/A"}
          icon={<IconTrendingUp size={14} />}
          tone={latestReturn >= 0 ? "success" : "danger"}
          delta={
            latest
              ? {
                  direction: latestReturn >= 0 ? "up" : "down",
                  value: fmtPct(latestReturn),
                  label: "on last run"
                }
              : undefined
          }
        />
        <KpiCard
          label="Latest Sharpe"
          value={latest ? latestSharpe.toFixed(2) : "N/A"}
          icon={<IconBolt size={14} />}
          tone={latestSharpe >= 1 ? "success" : latestSharpe >= 0 ? "accent" : "danger"}
          delta={
            latest
              ? {
                  direction: latestSharpe >= 1 ? "up" : latestSharpe >= 0 ? "flat" : "down",
                  value: latestSharpe.toFixed(2),
                  label: "risk-adj."
                }
              : undefined
          }
        />
        <KpiCard
          label="Latest Max DD"
          value={latest ? fmtPct(latestDD) : "N/A"}
          icon={<IconTrendingDown size={14} />}
          tone="danger"
        />
        <KpiCard
          label="Backtests"
          value={String(backtests.length)}
          icon={<IconLineChart size={14} />}
          tone="accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" padded={false}>
          <CardHeader
            className="px-5 pt-5"
            title="Recent Backtests"
            description="Click through to open an equity curve, drawdown and trade ledger."
            action={
              <Link href="/dashboard/backtests">
                <Button variant="ghost" size="sm" rightIcon={<IconArrowUpRight size={14} />}>
                  View all
                </Button>
              </Link>
            }
          />
          {backtests.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState
                icon={<IconLineChart size={16} />}
                title="No backtests yet"
                description="Run your first strategy simulation from the Backtests page."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {backtests.slice(0, 6).map((b) => {
                const r = b.metrics.total_return || 0;
                return (
                  <li key={b.id}>
                    <Link
                      className="group flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-surface-hover"
                      href={`/dashboard/backtests/${b.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-elevated font-mono text-xs text-foreground-muted">
                          #{b.id}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{b.strategy_name}</p>
                          <p className="text-2xs text-foreground-subtle">
                            Dataset #{b.dataset_id} &middot; {new Date(b.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono text-sm tabular-nums ${r >= 0 ? "text-success" : "text-danger"}`}
                        >
                          {r >= 0 ? "+" : ""}
                          {(r * 100).toFixed(2)}%
                        </span>
                        <IconArrowUpRight
                          size={14}
                          className="text-foreground-subtle group-hover:text-foreground"
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card padded={false} className="overflow-hidden">
          <CardHeader
            className="px-5 pt-5"
            title="Live Watchlist"
            description="Streaming ticks from the backend WebSocket."
          />
          <div className="px-5 pb-5">
            <Watchlist />
          </div>
        </Card>
      </div>
    </>
  );
}
