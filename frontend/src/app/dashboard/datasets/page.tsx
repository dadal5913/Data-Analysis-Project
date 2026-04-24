"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Field } from "@/components/ui/field";
import {
  IconDatabase,
  IconFile,
  IconUpload
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
import type { AppError, Dataset } from "@/types";

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [name, setName] = useState("S&P 500 Import");
  const [symbol, setSymbol] = useState("SPX");
  const [timeframe, setTimeframe] = useState("1d");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"created" | "rows">("created");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadDatasets = async () => {
    setError(null);
    setErrorMessages([]);
    try {
      const data = await apiFetch<Dataset[]>("/datasets");
      setDatasets(data);
    } catch (err) {
      const appErr = err as AppError;
      setError(appErr?.message || "Could not load datasets");
      setErrorMessages(appErr?.messages || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const onUpload = async (e: FormEvent) => {
    e.preventDefault();
    const localErrors: Record<string, string> = {};
    if (!name.trim()) localErrors.name = "Name is required";
    if (!symbol.trim()) localErrors.symbol = "Symbol is required";
    if (!timeframe.trim()) localErrors.timeframe = "Timeframe is required";
    if (!file) localErrors.file = "CSV file is required";
    if (file && !file.name.toLowerCase().endsWith(".csv")) localErrors.file = "Only .csv files are supported";
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length > 0 || !file) return;

    setIsSubmitting(true);
    setError(null);
    setErrorMessages([]);
    const form = new FormData();
    form.append("file", file);
    form.append("name", name);
    form.append("symbol", symbol);
    form.append("timeframe", timeframe);
    try {
      await apiFetch<Dataset>("/datasets/upload", { method: "POST", body: form });
      setFile(null);
      await loadDatasets();
    } catch (err) {
      const appErr = err as AppError;
      setError(appErr?.message || "Upload failed");
      setErrorMessages(appErr?.messages || []);
      if (appErr?.fields?.length) {
        setFieldErrors((prev) => ({ ...prev, ...Object.fromEntries(appErr.fields.map((f) => [f.field, f.message])) }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return datasets
      .filter((d) => (timeframeFilter === "all" ? true : d.timeframe === timeframeFilter))
      .filter((d) => (q ? `${d.name} ${d.symbol}`.toLowerCase().includes(q) : true))
      .sort((a, b) =>
        sortBy === "rows"
          ? b.row_count - a.row_count
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [datasets, timeframeFilter, search, sortBy]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, timeframeFilter, sortBy, pageSize]);

  return (
    <>
      <PageHeader
        eyebrow="Data"
        title="Datasets"
        description="Upload OHLCV CSV files that feed backtests and ML training."
      />

      <Card>
        <CardHeader
          title="Upload dataset"
          description="CSV with date + OHLCV columns. Max 100 MB."
        />
        <form
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"
          onSubmit={onUpload}
        >
          <Field label="Name" error={fieldErrors.name}>
            <Input
              invalid={!!fieldErrors.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              value={name}
            />
          </Field>
          <Field label="Symbol" error={fieldErrors.symbol}>
            <Input
              invalid={!!fieldErrors.symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Symbol"
              value={symbol}
            />
          </Field>
          <Field label="Timeframe" error={fieldErrors.timeframe}>
            <Input
              invalid={!!fieldErrors.timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="Timeframe"
              value={timeframe}
            />
          </Field>
          <Field label="CSV file" error={fieldErrors.file} className="lg:col-span-2">
            <label
              className={`flex h-9 cursor-pointer items-center gap-2 rounded-md border border-dashed bg-surface/40 px-3 text-xs transition-colors hover:border-border-strong ${fieldErrors.file ? "border-danger/60 text-danger" : "border-border text-foreground-muted"}`}
            >
              <IconFile size={14} />
              <span className="truncate">
                {file ? file.name : "Click to select a CSV file"}
              </span>
              <input
                accept=".csv"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                type="file"
              />
            </label>
          </Field>

          <div className="md:col-span-2 lg:col-span-5">
            <Button
              disabled={isSubmitting || !file}
              leftIcon={<IconUpload size={14} />}
              type="submit"
            >
              {isSubmitting ? "Uploading..." : "Upload CSV"}
            </Button>
          </div>
        </form>
      </Card>

      {error ? <ErrorBanner message={error} messages={errorMessages} /> : null}
      {isLoading ? <LoadingSpinner label="Loading datasets..." /> : null}
      {!isLoading && datasets.length === 0 ? (
        <EmptyState
          icon={<IconDatabase size={16} />}
          title="No datasets yet"
          description="Upload your first OHLCV CSV to get started."
        />
      ) : null}

      {datasets.length > 0 ? (
        <Card padded={false}>
          <div className="flex flex-col gap-3 border-b border-border/60 p-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-sm flex-1">
              <TableSearch onChange={setSearch} placeholder="Search name or symbol..." value={search} />
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex md:w-auto">
              <Select
                onValueChange={setTimeframeFilter}
                value={timeframeFilter}
              >
                <SelectTrigger className="md:w-[180px]">
                  <SelectValue placeholder="All timeframes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All timeframes</SelectItem>
                  {[...new Set(datasets.map((d) => d.timeframe))].map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) =>
                  setSortBy(value as "created" | "rows")
                }
                value={sortBy}
              >
                <SelectTrigger className="md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Sort: newest</SelectItem>
                  <SelectItem value="rows">Sort: rows desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-2xs uppercase tracking-wider text-foreground-subtle">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Symbol</th>
                  <th className="px-4 py-2.5 font-medium">Timeframe</th>
                  <th className="px-4 py-2.5 font-medium">Rows</th>
                  <th className="px-4 py-2.5 font-medium">Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pageRows.map((d) => (
                  <tr className="transition-colors hover:bg-surface-hover" key={d.id}>
                    <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-foreground-muted">{d.symbol}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{d.timeframe}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-foreground">
                      {d.row_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground-muted">
                      {d.start_date} &rarr; {d.end_date}
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
            total={filtered.length}
          />
        </Card>
      ) : null}
    </>
  );
}
