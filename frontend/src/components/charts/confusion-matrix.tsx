"use client";

import Plot from "react-plotly.js";

export function ConfusionMatrix({ z }: { z: number[][] }) {
  return (
    <Plot
      className="w-full"
      useResizeHandler
      style={{ width: "100%", height: "320px" }}
      data={[
        {
          z,
          type: "heatmap",
          colorscale: [
            [0, "#0F131C"],
            [0.5, "#1A2B5A"],
            [1, "#5B8CFF"]
          ],
          showscale: true,
          hovertemplate: "Actual %{y}<br>Predicted %{x}<br>Count: %{z}<extra></extra>"
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
          title: { text: "Predicted", font: { color: "#8892A6" } },
          gridcolor: "rgba(42, 51, 70, 0.4)",
          linecolor: "rgba(42, 51, 70, 0.6)",
          zeroline: false
        },
        yaxis: {
          title: { text: "Actual", font: { color: "#8892A6" } },
          gridcolor: "rgba(42, 51, 70, 0.4)",
          linecolor: "rgba(42, 51, 70, 0.6)",
          zeroline: false
        }
      }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
}
