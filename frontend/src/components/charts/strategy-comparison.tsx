"use client";

import Plot from "react-plotly.js";

export function StrategyComparison({ series }: { series: { name: string; x: string[]; y: number[] }[] }) {
  return (
    <Plot
      data={series.map((s) => ({ name: s.name, x: s.x, y: s.y, type: "scatter", mode: "lines" }))}
      layout={{ paper_bgcolor: "#121A2B", plot_bgcolor: "#121A2B", font: { color: "#E5E7EB" } }}
    />
  );
}
