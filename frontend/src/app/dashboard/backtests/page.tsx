"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableSearch } from "@/components/ui/table-search";
import { apiFetch } from "@/lib/api-client";
import type { AppError, BacktestRequest, BacktestResult, Dataset, StrategyConfig } from "@/types";

const defaultParamsByStrategy: Record<string, Record<string, number>> = {
  ma_crossover: { fast_period: 20, slow_period: 50 },
  rsi_mean_reversion: { period: 14, lower: 30, upper: 70 },
  buy_and_hold: {}
};

export default function BacktestsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [strategies, setStrategies] = useState<StrategyConfig[]>([]);
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [datasetId, setDatasetId] = useState<number | null>(null);
  const [strategyName, setStrategyName] = useState("buy_and_hold");
  const [initialCapital, setInitialCapital] = useState(10000);
  const [transactionCostBps, setTransactionCostBps] = useState(5);
  const [slippageBps, setSlippageBps] = useState(1);
  const [positionSize, setPositionSize] = useState(1);
  const [params, setParams] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [datasetFilter, setDatasetFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "return" | "sharpe">("created");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const currentParamEntries = useMemo(
    () => Object.entries(params),
    [params]
  );

  const loadData = async () => {
    setError(null);
    setErrorMessages([]);
    try {
      const [bt, ds, st] = await Promise.all([
        apiFetch<BacktestResult[]>("/backtests"),
        apiFetch<Dataset[]>("/datasets"),
        apiFetch<StrategyConfig[]>("/strategies")
      ]);
      setBacktests(bt);
      setDatasets(ds);
      setStrategies(st);
      if (ds.length > 0 && !datasetId) setDatasetId(ds[0].id);
      if (st.length > 0) {
        setStrategyName(st[0].name);
        setParams(defaultParamsByStrategy[st[0].name] || {});
      }
    } catch (err) {
      const appErr = err as AppError;
      setError(appErr?.message || "Could not load backtests");
      setErrorMessages(appErr?.messages || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onStrategyChange = (name: string) => {
    setStrategyName(name);
    setParams(defaultParamsByStrategy[name] || {});
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!datasetId) return;
    const localErrors: Record<string, string> = {};
    if (initialCapital <= 0) localErrors.initial_capital = "Initial capital must be > 0";
    if (transactionCostBps < 0) localErrors.transaction_cost_bps = "Transaction cost cannot be negative";
    if (slippageBps < 0) localErrors.slippage_bps = "Slippage cannot be negative";
    if (positionSize <= 0 || positionSize > 1) localErrors.position_size = "Position size must be > 0 and <= 1";
    for (const [k, v] of Object.entries(params)) {
      if (Number.isNaN(v)) localErrors[k] = `${k} must be numeric`;
    }
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    setIsSubmitting(true);
    setError(null);
    setErrorMessages([]);
    try {
      const payload: BacktestRequest = {
        dataset_id: datasetId,
        strategy_name: strategyName,
        initial_capital: initialCapital,
        transaction_cost_bps: transactionCostBps,
        slippage_bps: slippageBps,
        position_size: positionSize,
        params
      };
      const created = await apiFetch<BacktestResult>("/backtests", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      router.push(`/dashboard/backtests/${created.id}`);
    } catch (err) {
      const appErr = err as AppError;
      setError(appErr?.message || "Backtest run failed");
      setErrorMessages(appErr?.messages || []);
      if (appErr?.fields?.length) {
        setFieldErrors((prev) => ({ ...prev, ...Object.fromEntries(appErr.fields.map((f) => [f.field, f.message])) }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = backtests.filter((b) => {
      const matchesQ = q
        ? `${b.strategy_name} ${b.dataset_id} ${b.id}`.toLowerCase().includes(q)
        : true;
      const matchesStrategy = strategyFilter === "all" ? true : b.strategy_name === strategyFilter;
      const matchesDataset = datasetFilter === "all" ? true : String(b.dataset_id) === datasetFilter;
      const ts = new Date(b.created_at).getTime();
      const fromOk = dateFrom ? ts >= new Date(`${dateFrom}T00:00:00`).getTime() : true;
      const toOk = dateTo ? ts <= new Date(`${dateTo}T23:59:59`).getTime() : true;
      return matchesQ && matchesStrategy && matchesDataset && fromOk && toOk;
    });
    return base.sort((a, b) => {
      if (sortBy === "return") return (b.metrics.total_return || 0) - (a.metrics.total_return || 0);
      if (sortBy === "sharpe") return (b.metrics.sharpe_ratio || 0) - (a.metrics.sharpe_ratio || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [backtests, search, strategyFilter, datasetFilter, dateFrom, dateTo, sortBy]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, strategyFilter, datasetFilter, dateFrom, dateTo, sortBy, pageSize]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Backtests</h1>

      <form className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-3" onSubmit={onSubmit}>
        <select
          className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
          onChange={(e) => setDatasetId(Number(e.target.value))}
          value={datasetId ?? ""}
        >
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.symbol})
            </option>
          ))}
        </select>

        <select
          className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
          onChange={(e) => onStrategyChange(e.target.value)}
          value={strategyName}
        >
          {strategies.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {currentParamEntries.map(([key, value]) => (
          <Input
            key={key}
            onChange={(e) => setParams((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
            placeholder={key}
            value={String(value)}
          />
        ))}
        <Input onChange={(e) => setInitialCapital(Number(e.target.value))} placeholder="Initial Capital" type="number" value={String(initialCapital)} />
        <Input onChange={(e) => setTransactionCostBps(Number(e.target.value))} placeholder="Transaction Cost (bps)" type="number" value={String(transactionCostBps)} />
        <Input onChange={(e) => setSlippageBps(Number(e.target.value))} placeholder="Slippage (bps)" type="number" value={String(slippageBps)} />
        <Input onChange={(e) => setPositionSize(Number(e.target.value))} placeholder="Position Size (0-1)" step="0.1" type="number" value={String(positionSize)} />

        <Button disabled={isSubmitting || !datasetId} type="submit">
          {isSubmitting ? "Running..." : "Run Backtest"}
        </Button>
        {Object.keys(fieldErrors).length > 0 ? (
          <ErrorBanner messages={Object.values(fieldErrors)} />
        ) : null}
      </form>

      {error ? <ErrorBanner message={error} messages={errorMessages} /> : null}
      {isLoading ? <LoadingSpinner label="Loading backtests..." /> : null}
      {!isLoading && backtests.length === 0 ? (
        <EmptyState title="No backtests yet" description="Run your first strategy simulation above." />
      ) : null}

      {backtests.length > 0 ? (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-6">
            <TableSearch onChange={setSearch} placeholder="Search by id/strategy/dataset..." value={search} />
            <select
              className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
              onChange={(e) => setStrategyFilter(e.target.value)}
              value={strategyFilter}
            >
              <option value="all">All strategies</option>
              {[...new Set(backtests.map((b) => b.strategy_name))].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
              onChange={(e) => setDatasetFilter(e.target.value)}
              value={datasetFilter}
            >
              <option value="all">All datasets</option>
              {[...new Set(backtests.map((b) => b.dataset_id))].map((id) => (
                <option key={id} value={String(id)}>
                  Dataset #{id}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
              onChange={(e) => setSortBy(e.target.value as "created" | "return" | "sharpe")}
              value={sortBy}
            >
              <option value="created">Sort: newest</option>
              <option value="return">Sort: total return</option>
              <option value="sharpe">Sort: sharpe</option>
            </select>
            <Input onChange={(e) => setDateFrom(e.target.value)} type="date" value={dateFrom} />
            <Input onChange={(e) => setDateTo(e.target.value)} type="date" value={dateTo} />
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Strategy</th>
                <th className="px-3 py-2">Dataset</th>
                <th className="px-3 py-2">Total Return</th>
                <th className="px-3 py-2">Sharpe</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((b) => (
                <tr className="cursor-pointer border-t border-border hover:bg-surface" key={b.id} onClick={() => router.push(`/dashboard/backtests/${b.id}`)}>
                  <td className="px-3 py-2">#{b.id}</td>
                  <td className="px-3 py-2">{b.strategy_name}</td>
                  <td className="px-3 py-2">{b.dataset_id}</td>
                  <td className="px-3 py-2">{((b.metrics.total_return || 0) * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2">{(b.metrics.sharpe_ratio || 0).toFixed(2)}</td>
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
            total={filtered.length}
          />
        </div>
      ) : null}
    </div>
  );
}
