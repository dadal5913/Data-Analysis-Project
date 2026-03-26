"use client";

import Plot from "react-plotly.js";

export function ConfusionMatrix({ z }: { z: number[][] }) {
  return <Plot data={[{ z, type: "heatmap" }]} layout={{ paper_bgcolor: "#121A2B", plot_bgcolor: "#121A2B", font: { color: "#E5E7EB" } }} />;
}
