"use client";

import { FormEvent, useEffect, useState } from "react";

import { ConfusionMatrix } from "@/components/charts/confusion-matrix";
import { FeatureImportance } from "@/components/charts/feature-importance";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Field } from "@/components/ui/field";
import { IconPlay, IconSparkles } from "@/components/ui/icons";
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
    <>
      <PageHeader
        eyebrow="Predictions"
        title="ML Studio"
        description="Train a classical classifier on an OHLCV dataset and review its diagnostics."
      />

      {error ? <ErrorBanner message={error} messages={errorMessages} /> : null}

      <Card>
        <CardHeader
          title="Train a model"
          description="Directional classifier: predict the sign of the next return."
        />
        <form className="grid gap-3 md:grid-cols-4" noValidate onSubmit={onTrain}>
          <Field label="Dataset" error={fieldErrors.dataset_id}>
            <Select
              onValueChange={(value) => {
                // Radix Select briefly emits "" while items are being registered; ignore it.
                if (!value) return;
                setDatasetId(Number(value));
              }}
              value={datasetId ? String(datasetId) : ""}
            >
              <SelectTrigger invalid={!!fieldErrors.dataset_id}>
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
          <Field label="Model">
            <Select onValueChange={setModelType} value={modelType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random_forest">random_forest</SelectItem>
                <SelectItem value="gradient_boosting">
                  gradient_boosting
                </SelectItem>
                <SelectItem value="logistic_regression">
                  logistic_regression
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Test size"
            hint="Between 0.1 and 0.5"
            error={fieldErrors.test_size}
          >
            <Input
              invalid={!!fieldErrors.test_size}
              max={0.5}
              min={0.1}
              onChange={(e) => setTestSize(Number(e.target.value))}
              step={0.05}
              type="number"
              value={testSize}
            />
          </Field>
          <div className="flex items-end">
            <Button
              className="w-full"
              disabled={!datasetId || isSubmitting}
              leftIcon={<IconPlay size={14} />}
              type="submit"
            >
              {isSubmitting ? "Training..." : "Train Model"}
            </Button>
          </div>
        </form>
      </Card>

      {isLoading ? <LoadingSpinner label="Loading ML page..." /> : null}
      {!isLoading && datasets.length === 0 ? (
        <EmptyState
          icon={<IconSparkles size={16} />}
          title="No datasets available"
          description="Upload a dataset before running ML training."
        />
      ) : null}

      {result ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
              label="Accuracy"
              value={((result.metrics.accuracy || 0) * 100).toFixed(2) + "%"}
              tone="accent"
            />
            <KpiCard
              label="Precision"
              value={((result.metrics.precision || 0) * 100).toFixed(2) + "%"}
              tone="success"
            />
            <KpiCard
              label="Recall"
              value={((result.metrics.recall || 0) * 100).toFixed(2) + "%"}
              tone="success"
            />
            <KpiCard
              label="F1"
              value={((result.metrics.f1 || 0) * 100).toFixed(2) + "%"}
              tone="accent"
            />
          </div>

          <Card>
            <CardHeader
              title="Confusion Matrix"
              description="Predicted vs actual class breakdown on the test split."
            />
            <ConfusionMatrix z={result.confusion_matrix} />
          </Card>

          {result.feature_importance ? (
            <Card>
              <CardHeader
                title="Feature Importance"
                description="Relative contribution of engineered features."
              />
              <FeatureImportance data={result.feature_importance} />
            </Card>
          ) : null}
        </>
      ) : null}
    </>
  );
}
