"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { IconWorkflow } from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import { apiFetch } from "@/lib/api-client";
import type { StrategyConfig } from "@/types";

function describe(name: string) {
  switch (name) {
    case "ma_crossover":
      return "Trend-following: enter long when fast MA crosses above slow MA.";
    case "rsi_mean_reversion":
      return "Mean-reversion: buy oversold / sell overbought via the RSI oscillator.";
    case "buy_and_hold":
      return "Baseline: fully invested throughout the test window.";
    default:
      return "Custom strategy. Parameters are defined below.";
  }
}

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
    <>
      <PageHeader
        eyebrow="Research"
        title="Strategies"
        description="Strategies registered in the backtesting engine and their default parameters."
      />

      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingSpinner label="Loading strategies..." /> : null}

      {!isLoading && strategies.length === 0 ? (
        <EmptyState
          icon={<IconWorkflow size={16} />}
          title="No strategies registered"
          description="Strategies are loaded from the backend engine. Add one and it will appear here."
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {strategies.map((s) => {
          const paramEntries = Object.entries(s.params);
          return (
            <Card hoverable key={s.name}>
              <CardHeader
                title={<span className="font-mono">{s.name}</span>}
                description={describe(s.name)}
                action={<Badge variant="accent">{paramEntries.length} params</Badge>}
              />
              {paramEntries.length === 0 ? (
                <p className="text-xs text-foreground-muted">
                  No tunable parameters &mdash; this strategy runs with a fixed configuration.
                </p>
              ) : (
                <dl className="grid grid-cols-2 gap-2">
                  {paramEntries.map(([k, v]) => (
                    <div
                      className="flex items-center justify-between rounded-md border border-border bg-surface-elevated px-3 py-2"
                      key={k}
                    >
                      <dt className="text-2xs uppercase tracking-wider text-foreground-subtle">
                        {k}
                      </dt>
                      <dd className="font-mono text-sm tabular-nums text-foreground">
                        {String(v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
