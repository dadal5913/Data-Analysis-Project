import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import DatasetsPage from "../../src/app/dashboard/datasets/page";

describe("Datasets page validation", () => {
  it("blocks non-csv uploads", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });
    vi.stubGlobal("fetch", fetchMock);
    const view = render(<DatasetsPage />);
    await waitFor(() => expect(screen.getByText("Upload CSV")).toBeTruthy());
    const fileInput = view.container.querySelector("input[type='file']") as HTMLInputElement;
    const txt = new File(["x"], "bad.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [txt] } });
    fireEvent.click(screen.getByText("Upload CSV"));
    expect(screen.getByText("Only .csv files are supported")).toBeTruthy();
  });
});
