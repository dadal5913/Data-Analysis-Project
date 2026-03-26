"use client";

import Plot from "react-plotly.js";

export function FeatureImportance({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  return (
    <Plot
      data={[{ type: "bar", orientation: "h", x: entries.map((e) => e[1]), y: entries.map((e) => e[0]) }]}
      layout={{ paper_bgcolor: "#121A2B", plot_bgcolor: "#121A2B", font: { color: "#E5E7EB" } }}
    />
  );
}
