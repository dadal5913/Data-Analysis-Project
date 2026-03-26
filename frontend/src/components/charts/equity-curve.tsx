"use client";

import Plot from "react-plotly.js";

export function EquityCurve({ x, y }: { x: string[]; y: number[] }) {
  return <Plot data={[{ x, y, type: "scatter", mode: "lines", line: { color: "#4F8CFF" } }]} layout={{ paper_bgcolor: "#121A2B", plot_bgcolor: "#121A2B", font: { color: "#E5E7EB" } }} />;
}
