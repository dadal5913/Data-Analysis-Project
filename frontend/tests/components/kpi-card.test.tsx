import { render, screen } from "@testing-library/react";

import { KpiCard } from "@/components/dashboard/kpi-card";

describe("KpiCard", () => {
  it("renders label and value", () => {
    render(<KpiCard label="Sharpe" value="1.20" />);
    expect(screen.getByText("Sharpe")).toBeTruthy();
    expect(screen.getByText("1.20")).toBeTruthy();
  });
});
