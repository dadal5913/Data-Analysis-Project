"use client";

import { FormEvent, useEffect, useState } from "react";

import { ConfusionMatrix } from "@/components/charts/confusion-matrix";
import { FeatureImportance } from "@/components/charts/feature-importance";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiFetch } from "@/lib/api-client";
import type { AppError, Dataset, MLTrainResponse } from "@/types";

export default function MlPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [datasetId, setDatasetId] = useState<number | null>(null);
  const [modelType, setModelType] = useState("random_forest");
  const [testSize, setTestSize] = useState(0.2);
  const [result, setResult] = useState<MLTrainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<Dataset[]>("/datasets");
        setDatasets(data);
        if (data.length > 0) setDatasetId(data[0].id);
      } catch (err) {
        const appErr = err as AppError;
        setError(appErr?.message || "Could not load datasets");
        setErrorMessages(appErr?.messages || []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const onTrain = async (e: FormEvent) => {
    e.preventDefault();
    const localErrors: Record<string, string> = {};
    if (!datasetId) localErrors.dataset_id = "Dataset is required";
    if (testSize < 0.1 || testSize > 0.5) localErrors.test_size = "Test size must be between 0.1 and 0.5";
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    setIsSubmitting(true);
    setError(null);
    setErrorMessages([]);
    try {
      const trained = await apiFetch<MLTrainResponse>("/ml/train", {
        method: "POST",
        body: JSON.stringify({
          dataset_id: datasetId,
          model_type: modelType,
          test_size: testSize
        })
      });
      setResult(trained);
    } catch (err) {
      const appErr = err as AppError;
      setError(appErr?.message || "Training failed");
      setErrorMessages(appErr?.messages || []);
      if (appErr?.fields?.length) {
        setFieldErrors((prev) => ({ ...prev, ...Object.fromEntries(appErr.fields.map((f) => [f.field, f.message])) }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">ML Module</h1>
      {error ? <ErrorBanner message={error} messages={errorMessages} /> : null}

      <form className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-4" noValidate onSubmit={onTrain}>
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
        {fieldErrors.dataset_id ? <p className="text-xs text-red-300">{fieldErrors.dataset_id}</p> : null}
        <select
          className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
          onChange={(e) => setModelType(e.target.value)}
          value={modelType}
        >
          <option value="random_forest">random_forest</option>
          <option value="gradient_boosting">gradient_boosting</option>
          <option value="logistic_regression">logistic_regression</option>
        </select>
        <input
          className="rounded border border-border bg-[#0b1020] px-3 py-2 text-sm"
          max={0.5}
          min={0.1}
          onChange={(e) => {
            const nextValue = Number(e.target.value);
            setTestSize(nextValue);
          }}
          step={0.05}
          type="number"
          value={testSize}
        />
        {fieldErrors.test_size ? <p className="text-xs text-red-300">{fieldErrors.test_size}</p> : null}
        <Button disabled={!datasetId || isSubmitting} type="submit">
          {isSubmitting ? "Training..." : "Train Model"}
        </Button>
      </form>

      {isLoading ? <LoadingSpinner label="Loading ML page..." /> : null}
      {!isLoading && datasets.length === 0 ? (
        <EmptyState title="No datasets available" description="Upload a dataset before running ML training." />
      ) : null}
      {result ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard label="Accuracy" value={((result.metrics.accuracy || 0) * 100).toFixed(2) + "%"} />
            <KpiCard label="Precision" value={((result.metrics.precision || 0) * 100).toFixed(2) + "%"} />
            <KpiCard label="Recall" value={((result.metrics.recall || 0) * 100).toFixed(2) + "%"} />
            <KpiCard label="F1" value={((result.metrics.f1 || 0) * 100).toFixed(2) + "%"} />
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 text-lg font-medium">Confusion Matrix</h2>
            <ConfusionMatrix z={result.confusion_matrix} />
          </div>
          {result.feature_importance ? (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="mb-3 text-lg font-medium">Feature Importance</h2>
              <FeatureImportance data={result.feature_importance} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
