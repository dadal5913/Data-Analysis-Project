import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import MlPage from "../../src/app/dashboard/ml/page";

vi.mock("../../src/components/charts/confusion-matrix", () => ({
  ConfusionMatrix: () => null
}));

vi.mock("../../src/components/charts/feature-importance", () => ({
  FeatureImportance: () => null
}));

describe("ML page validation", () => {
  it("validates test size bounds", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          name: "S&P 500 Demo",
          symbol: "SPX",
          timeframe: "1d",
          row_count: 10,
          start_date: "2024-01-01",
          end_date: "2024-01-31",
          created_at: "2024-01-01T00:00:00"
        }
      ]
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<MlPage />);
    await waitFor(() => expect(screen.getByText("Train Model")).toBeTruthy());
    const input = screen.getByDisplayValue("0.2");
    fireEvent.change(input, { target: { value: "0.9" } });
    fireEvent.click(screen.getByText("Train Model"));
    expect(screen.getByText("Test size must be between 0.1 and 0.5")).toBeTruthy();
  });
});
