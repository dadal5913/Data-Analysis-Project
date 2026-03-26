"use client";

import Plot from "react-plotly.js";

export function DrawdownChart({ x, y }: { x: string[]; y: number[] }) {
  return <Plot data={[{ x, y, type: "scatter", fill: "tozeroy", line: { color: "#E11D48" } }]} layout={{ paper_bgcolor: "#121A2B", plot_bgcolor: "#121A2B", font: { color: "#E5E7EB" } }} />;
}
