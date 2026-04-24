"use client";

import Plot from "react-plotly.js";

export function DrawdownChart({ x, y }: { x: string[]; y: number[] }) {
  return (
    <Plot
      className="w-full"
      useResizeHandler
      style={{ width: "100%", height: "320px" }}
      data={[
        {
          x,
          y,
          type: "scatter",
          mode: "lines",
          fill: "tozeroy",
          line: { color: "#EF4444", width: 2 },
          fillcolor: "rgba(239, 68, 68, 0.12)",
          hovertemplate: "<b>%{x}</b><br>Drawdown: %{y:.2f}%<extra></extra>"
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
        margin: { l: 48, r: 16, t: 10, b: 40 },
        xaxis: {
          gridcolor: "rgba(42, 51, 70, 0.4)",
          linecolor: "rgba(42, 51, 70, 0.6)",
          zeroline: false
        },
        yaxis: {
          gridcolor: "rgba(42, 51, 70, 0.4)",
          linecolor: "rgba(42, 51, 70, 0.6)",
          zeroline: true,
          zerolinecolor: "rgba(42, 51, 70, 0.8)",
          ticksuffix: "%"
        },
        hoverlabel: {
          bgcolor: "#141926",
          bordercolor: "#2A3346",
          font: { color: "#E7ECF3", family: "JetBrains Mono, ui-monospace, monospace" }
        }
      }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
}
