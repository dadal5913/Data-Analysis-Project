"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
    if (Object.keys(localErrors).length > 0) return;

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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Datasets</h1>

      <form className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-5" onSubmit={onUpload}>
        <Input onChange={(e) => setName(e.target.value)} placeholder="Name" value={name} />
        {fieldErrors.name ? <p className="text-xs text-red-300">{fieldErrors.name}</p> : null}
        <Input onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol" value={symbol} />
        {fieldErrors.symbol ? <p className="text-xs text-red-300">{fieldErrors.symbol}</p> : null}
        <Input onChange={(e) => setTimeframe(e.target.value)} placeholder="Timeframe" value={timeframe} />
        {fieldErrors.timeframe ? <p className="text-xs text-red-300">{fieldErrors.timeframe}</p> : null}
        <Input onChange={(e) => setFile(e.target.files?.[0] || null)} type="file" />
        {fieldErrors.file ? <p className="text-xs text-red-300">{fieldErrors.file}</p> : null}
        <Button disabled={isSubmitting || !file} type="submit">
          {isSubmitting ? "Uploading..." : "Upload CSV"}
        </Button>
      </form>

      {error ? <ErrorBanner message={error} messages={errorMessages} /> : null}
      {isLoading ? <LoadingSpinner label="Loading datasets..." /> : null}
      {!isLoading && datasets.length === 0 ? (
        <EmptyState title="No datasets yet" description="Upload your first OHLCV CSV to get started." />
      ) : null}

      {datasets.length > 0 ? (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <TableSearch onChange={setSearch} placeholder="Search name or symbol..." value={search} />
            <select
              className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
              onChange={(e) => setTimeframeFilter(e.target.value)}
              value={timeframeFilter}
            >
              <option value="all">All timeframes</option>
              {[...new Set(datasets.map((d) => d.timeframe))].map((tf) => (
                <option key={tf} value={tf}>
                  {tf}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
              onChange={(e) => setSortBy(e.target.value as "created" | "rows")}
              value={sortBy}
            >
              <option value="created">Sort: newest</option>
              <option value="rows">Sort: rows desc</option>
            </select>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Symbol</th>
                <th className="px-3 py-2">Timeframe</th>
                <th className="px-3 py-2">Rows</th>
                <th className="px-3 py-2">Range</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((d) => (
                <tr className="border-t border-border" key={d.id}>
                  <td className="px-3 py-2">{d.name}</td>
                  <td className="px-3 py-2">{d.symbol}</td>
                  <td className="px-3 py-2">{d.timeframe}</td>
                  <td className="px-3 py-2">{d.row_count}</td>
                  <td className="px-3 py-2">
                    {d.start_date} - {d.end_date}
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
        </div>
      ) : null}
    </div>
  );
}
