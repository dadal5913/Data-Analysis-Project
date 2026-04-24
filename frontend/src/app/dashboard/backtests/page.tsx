"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Field } from "@/components/ui/field";
import {
  IconLineChart,
  IconPlay
} from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
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

  const currentParamEntries = useMemo(() => Object.entries(params), [params]);

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
    <>
      <PageHeader
        eyebrow="Research"
        title="Backtests"
        description="Configure a strategy, run a simulation, and review performance metrics."
      />

      <Card>
        <CardHeader
          title="Run a new backtest"
          description="Pick a dataset and strategy, then tune execution parameters."
        />
        <form className="grid gap-3 lg:grid-cols-3" onSubmit={onSubmit}>
          <Field label="Dataset">
            <Select
              onValueChange={(value) => {
                // Radix Select briefly emits "" while items are being registered; ignore it.
                if (!value) return;
                setDatasetId(Number(value));
              }}
              value={datasetId ? String(datasetId) : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name} ({d.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Strategy">
            <Select
              onValueChange={(value) => {
                if (!value) return;
                onStrategyChange(value);
              }}
              value={strategyName}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a strategy" />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {currentParamEntries.map(([key, value]) => (
            <Field key={key} label={key.replace(/_/g, " ")} error={fieldErrors[key]}>
              <Input
                invalid={!!fieldErrors[key]}
                onChange={(e) => setParams((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                placeholder={key}
                value={String(value)}
              />
            </Field>
          ))}

          <Field label="Initial capital" error={fieldErrors.initial_capital}>
            <Input
              invalid={!!fieldErrors.initial_capital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              placeholder="Initial Capital"
              type="number"
              value={String(initialCapital)}
            />
          </Field>
          <Field label="Transaction cost (bps)" error={fieldErrors.transaction_cost_bps}>
            <Input
              invalid={!!fieldErrors.transaction_cost_bps}
              onChange={(e) => setTransactionCostBps(Number(e.target.value))}
              placeholder="Transaction Cost (bps)"
              type="number"
              value={String(transactionCostBps)}
            />
          </Field>
          <Field label="Slippage (bps)" error={fieldErrors.slippage_bps}>
            <Input
              invalid={!!fieldErrors.slippage_bps}
              onChange={(e) => setSlippageBps(Number(e.target.value))}
              placeholder="Slippage (bps)"
              type="number"
              value={String(slippageBps)}
            />
          </Field>
          <Field label="Position size (0 to 1)" error={fieldErrors.position_size}>
            <Input
              invalid={!!fieldErrors.position_size}
              onChange={(e) => setPositionSize(Number(e.target.value))}
              placeholder="Position Size (0-1)"
              step="0.1"
              type="number"
              value={String(positionSize)}
            />
          </Field>

          <div className="lg:col-span-3">
            <Button
              disabled={isSubmitting || !datasetId}
              leftIcon={<IconPlay size={14} />}
              type="submit"
            >
              {isSubmitting ? "Running..." : "Run Backtest"}
            </Button>
          </div>
        </form>
      </Card>

      {error ? <ErrorBanner message={error} messages={errorMessages} /> : null}
      {isLoading ? <LoadingSpinner label="Loading backtests..." /> : null}
      {!isLoading && backtests.length === 0 ? (
        <EmptyState
          icon={<IconLineChart size={16} />}
          title="No backtests yet"
          description="Run your first strategy simulation above."
        />
      ) : null}

      {backtests.length > 0 ? (
        <Card padded={false}>
          <div className="flex flex-col gap-3 border-b border-border/60 p-4 lg:grid lg:grid-cols-6">
            <TableSearch onChange={setSearch} placeholder="Search by id/strategy/dataset..." value={search} />
            <Select
              onValueChange={setStrategyFilter}
              value={strategyFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All strategies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All strategies</SelectItem>
                {[...new Set(backtests.map((b) => b.strategy_name))].map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select
              onValueChange={setDatasetFilter}
              value={datasetFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All datasets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All datasets</SelectItem>
                {[...new Set(backtests.map((b) => b.dataset_id))].map((id) => (
                  <SelectItem key={id} value={String(id)}>
                    Dataset #{id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setSortBy(value as "created" | "return" | "sharpe")
              }
              value={sortBy}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Sort: newest</SelectItem>
                <SelectItem value="return">Sort: total return</SelectItem>
                <SelectItem value="sharpe">Sort: sharpe</SelectItem>
              </SelectContent>
            </Select>
            <Input onChange={(e) => setDateFrom(e.target.value)} type="date" value={dateFrom} />
            <Input onChange={(e) => setDateTo(e.target.value)} type="date" value={dateTo} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-2xs uppercase tracking-wider text-foreground-subtle">
                  <th className="px-4 py-2.5 font-medium">ID</th>
                  <th className="px-4 py-2.5 font-medium">Strategy</th>
                  <th className="px-4 py-2.5 font-medium">Dataset</th>
                  <th className="px-4 py-2.5 font-medium">Total Return</th>
                  <th className="px-4 py-2.5 font-medium">Sharpe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paged.map((b) => {
                  const r = b.metrics.total_return || 0;
                  const sh = b.metrics.sharpe_ratio || 0;
                  return (
                    <tr
                      className="cursor-pointer transition-colors hover:bg-surface-hover"
                      key={b.id}
                      onClick={() => router.push(`/dashboard/backtests/${b.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-foreground-muted">#{b.id}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{b.strategy_name}</td>
                      <td className="px-4 py-3 text-foreground-muted">#{b.dataset_id}</td>
                      <td className={`px-4 py-3 font-mono tabular-nums ${r >= 0 ? "text-success" : "text-danger"}`}>
                        {r >= 0 ? "+" : ""}
                        {(r * 100).toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-foreground">
                        {sh.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
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
        </Card>
      ) : null}
    </>
  );
}
