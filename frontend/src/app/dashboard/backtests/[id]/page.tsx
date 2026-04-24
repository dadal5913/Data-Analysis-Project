"use client";

import { useEffect, useMemo, useState } from "react";

import { DrawdownChart } from "@/components/charts/drawdown-chart";
import { EquityCurve } from "@/components/charts/equity-curve";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import {
  IconBolt,
  IconLineChart,
  IconTrendingDown,
  IconTrendingUp
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { apiFetch } from "@/lib/api-client";
import type { BacktestResultDetail } from "@/types";

interface Props {
  params: { id: string };
}

export default function BacktestDetailPage({ params }: Props) {
  const [data, setData] = useState<BacktestResultDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signalFilter, setSignalFilter] = useState<"all" | "0" | "1">("all");
  const [pnlFilter, setPnlFilter] = useState<"all" | "positive" | "negative">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiFetch<BacktestResultDetail>(`/backtests/${params.id}`);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load backtest");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params.id]);

  useEffect(() => {
    setPage(1);
  }, [signalFilter, pnlFilter, pageSize]);

  const x = useMemo(() => data?.equity_curve.map((p) => p.date) || [], [data]);
  const y = useMemo(() => data?.equity_curve.map((p) => p.equity) || [], [data]);
  const dd = useMemo(() => {
    let runMax = -Infinity;
    return y.map((v) => {
      runMax = Math.max(runMax, v);
      return runMax > 0 ? (v / runMax - 1) * 100 : 0;
    });
  }, [y]);

  const filteredTrades = useMemo(() => {
    if (!data) return [];
    return data.trades.filter((t) => {
      const signalOk = signalFilter === "all" ? true : String(t.signal) === signalFilter;
      const pnlOk =
        pnlFilter === "all" ? true : pnlFilter === "positive" ? t.pnl > 0 : t.pnl < 0;
      return signalOk && pnlOk;
    });
  }, [data, signalFilter, pnlFilter]);

  const pagedTrades = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTrades.slice(start, start + pageSize);
  }, [filteredTrades, page, pageSize]);

  const tr = data?.metrics.total_return ?? 0;
  const ar = data?.metrics.annualized_return ?? 0;
  const sh = data?.metrics.sharpe_ratio ?? 0;
  const dd_ = data?.metrics.max_drawdown ?? 0;
  const wr = data?.metrics.win_rate ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={`Backtest #${params.id}`}
        title={data ? data.strategy_name : "Backtest"}
        description={
          data
            ? `Dataset #${data.dataset_id} · Ran ${new Date(data.created_at).toLocaleString()}`
            : "Loading backtest result..."
        }
      />

      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingSpinner label="Loading backtest detail..." /> : null}

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <KpiCard
              label="Total Return"
              value={`${(tr * 100).toFixed(2)}%`}
              icon={<IconTrendingUp size={14} />}
              tone={tr >= 0 ? "success" : "danger"}
            />
            <KpiCard
              label="Annualized Return"
              value={`${(ar * 100).toFixed(2)}%`}
              icon={<IconLineChart size={14} />}
              tone={ar >= 0 ? "success" : "danger"}
            />
            <KpiCard
              label="Sharpe Ratio"
              value={sh.toFixed(2)}
              icon={<IconBolt size={14} />}
              tone={sh >= 1 ? "success" : "accent"}
            />
            <KpiCard
              label="Max Drawdown"
              value={`${(dd_ * 100).toFixed(2)}%`}
              icon={<IconTrendingDown size={14} />}
              tone="danger"
            />
            <KpiCard
              label="Win Rate"
              value={`${(wr * 100).toFixed(2)}%`}
              tone="accent"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader title="Equity Curve" description="Portfolio value over time." />
              <EquityCurve x={x} y={y} />
            </Card>
            <Card>
              <CardHeader title="Drawdown (%)" description="Peak-to-trough erosion at each bar." />
              <DrawdownChart x={x} y={dd} />
            </Card>
          </div>

          <Card padded={false}>
            <div className="flex flex-col gap-3 border-b border-border/60 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Trades</h3>
                <p className="text-xs text-foreground-muted">
                  {filteredTrades.length.toLocaleString()} events after filtering.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:flex">
                <Select
                  onValueChange={(value) =>
                    setSignalFilter(value as "all" | "0" | "1")
                  }
                  value={signalFilter}
                >
                  <SelectTrigger className="md:w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All signals</SelectItem>
                    <SelectItem value="1">Signal 1</SelectItem>
                    <SelectItem value="0">Signal 0</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) =>
                    setPnlFilter(value as "all" | "positive" | "negative")
                  }
                  value={pnlFilter}
                >
                  <SelectTrigger className="md:w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All PnL</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-2xs uppercase tracking-wider text-foreground-subtle">
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Price</th>
                    <th className="px-4 py-2.5 font-medium">Signal</th>
                    <th className="px-4 py-2.5 font-medium">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {pagedTrades.map((t, idx) => (
                    <tr className="transition-colors hover:bg-surface-hover" key={`${t.date}-${idx}`}>
                      <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{t.date}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-foreground">
                        {t.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-medium ${
                            t.signal === 1
                              ? "border-accent/30 bg-accent-subtle text-accent"
                              : "border-border bg-surface-elevated text-foreground-muted"
                          }`}
                        >
                          {t.signal}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 font-mono tabular-nums ${
                          t.pnl >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {t.pnl >= 0 ? "+" : ""}
                        {(t.pnl * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              page={page}
              pageSize={pageSize}
              total={filteredTrades.length}
            />
          </Card>
        </>
      ) : null}
    </>
  );
}
