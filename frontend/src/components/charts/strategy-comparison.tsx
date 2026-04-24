"use client";

import Plot from "react-plotly.js";

const palette = ["#5B8CFF", "#22C55E", "#F59E0B", "#EF4444", "#A78BFA", "#06B6D4"];

export function StrategyComparison({
  series
}: {
  series: { name: string; x: string[]; y: number[] }[];
}) {
  return (
    <Plot
      className="w-full"
      useResizeHandler
      style={{ width: "100%", height: "360px" }}
      data={series.map((s, i) => ({
        name: s.name,
        x: s.x,
        y: s.y,
        type: "scatter",
        mode: "lines",
        line: { color: palette[i % palette.length], width: 2 }
      }))}
      layout={{
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
          color: "#8892A6",
          family:
            "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          size: 11
        },
        margin: { l: 48, r: 16, t: 10, b: 40 },
        xaxis: {
          gridcolor: "rgba(42, 51, 70, 0.4)",
          linecolor: "rgba(42, 51, 70, 0.6)",
          zeroline: false
        },
        yaxis: {
          gridcolor: "rgba(42, 51, 70, 0.4)",
          linecolor: "rgba(42, 51, 70, 0.6)",
          zeroline: false
        },
        legend: {
          orientation: "h",
          y: -0.15,
          font: { color: "#8892A6" }
        }
      }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
}
