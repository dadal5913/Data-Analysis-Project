"use client";

import Plot from "react-plotly.js";

export function FeatureImportance({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => a[1] - b[1]);
  return (
    <Plot
      className="w-full"
      useResizeHandler
      style={{ width: "100%", height: "360px" }}
      data={[
        {
          type: "bar",
          orientation: "h",
          x: entries.map((e) => e[1]),
          y: entries.map((e) => e[0]),
          marker: { color: "#5B8CFF" },
          hovertemplate: "<b>%{y}</b><br>Importance: %{x:.4f}<extra></extra>"
        }
      ]}
      layout={{
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
          color: "#8892A6",
          family:
            "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          size: 11
        },
        margin: { l: 120, r: 16, t: 10, b: 40 },
        xaxis: {
          gridcolor: "rgba(42, 51, 70, 0.4)",
          linecolor: "rgba(42, 51, 70, 0.6)",
          zeroline: false
        },
        yaxis: {
          gridcolor: "rgba(42, 51, 70, 0.4)",
          linecolor: "rgba(42, 51, 70, 0.6)",
          zeroline: false
        }
      }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
}
