import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import BacktestsPage from "../../src/app/dashboard/backtests/page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("BacktestsPage", () => {
  it("renders filters, pagination controls, and submits new backtest", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          Array.from({ length: 12 }).map((_, i) => ({
            id: i + 1,
            dataset_id: 1,
            strategy_name: "buy_and_hold",
            metrics: { total_return: 0.1, sharpe_ratio: 1.2 },
            created_at: "2024-01-01T00:00:00"
          }))
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: "S&P 500 Demo", symbol: "SPX", timeframe: "1d", row_count: 200, start_date: "2024-01-01", end_date: "2024-12-31", created_at: "2024-01-01T00:00:00" }]
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ name: "buy_and_hold", params: {} }]
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 42, dataset_id: 1, strategy_name: "buy_and_hold", metrics: {}, created_at: "2024-01-01T00:00:00" })
      });

    vi.stubGlobal("fetch", fetchMock);
    render(<BacktestsPage />);

    await waitFor(() => expect(screen.getByText("Run Backtest")).toBeTruthy());
    expect(screen.getByText("Next")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("Search by id/strategy/dataset..."), { target: { value: "buy" } });
    fireEvent.click(screen.getByText("Run Backtest"));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard/backtests/42"));
  });
});
