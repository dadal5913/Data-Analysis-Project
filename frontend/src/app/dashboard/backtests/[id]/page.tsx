"use client";

import { useEffect, useMemo, useState } from "react";

import { DrawdownChart } from "@/components/charts/drawdown-chart";
import { EquityCurve } from "@/components/charts/equity-curve";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Backtest #{params.id}</h1>
      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingSpinner label="Loading backtest detail..." /> : null}

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <KpiCard label="Total Return" value={`${((data.metrics.total_return || 0) * 100).toFixed(2)}%`} />
            <KpiCard label="Annualized Return" value={`${((data.metrics.annualized_return || 0) * 100).toFixed(2)}%`} />
            <KpiCard label="Sharpe Ratio" value={(data.metrics.sharpe_ratio || 0).toFixed(2)} />
            <KpiCard label="Max Drawdown" value={`${((data.metrics.max_drawdown || 0) * 100).toFixed(2)}%`} />
            <KpiCard label="Win Rate" value={`${((data.metrics.win_rate || 0) * 100).toFixed(2)}%`} />
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 text-lg font-medium">Equity Curve</h2>
            <EquityCurve x={x} y={y} />
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 text-lg font-medium">Drawdown (%)</h2>
            <DrawdownChart x={x} y={dd} />
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <select
                className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
                onChange={(e) => setSignalFilter(e.target.value as "all" | "0" | "1")}
                value={signalFilter}
              >
                <option value="all">All signals</option>
                <option value="1">Signal 1</option>
                <option value="0">Signal 0</option>
              </select>
              <select
                className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
                onChange={(e) => setPnlFilter(e.target.value as "all" | "positive" | "negative")}
                value={pnlFilter}
              >
                <option value="all">All PnL</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Signal</th>
                  <th className="px-3 py-2">PnL</th>
                </tr>
              </thead>
              <tbody>
                {pagedTrades.map((t, idx) => (
                  <tr className="border-t border-border" key={`${t.date}-${idx}`}>
                    <td className="px-3 py-2">{t.date}</td>
                    <td className="px-3 py-2">{t.price.toFixed(2)}</td>
                    <td className="px-3 py-2">{t.signal}</td>
                    <td className="px-3 py-2">{(t.pnl * 100).toFixed(2)}%</td>
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
          </div>
        </>
      ) : null}
    </div>
  );
}
