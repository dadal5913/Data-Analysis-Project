import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import LoginPage from "../../src/app/(auth)/login/page";
import RegisterPage from "../../src/app/(auth)/register/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() })
}));

describe("Auth form validation", () => {
  it("shows login email/password validation hints", () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByDisplayValue("demo@quantlab.dev"), { target: { value: "bad" } });
    fireEvent.change(screen.getByDisplayValue("demo1234"), { target: { value: "123" } });
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
    expect(screen.getByText("Password must be at least 6 characters.")).toBeTruthy();
  });

  it("shows register email/password validation hints", () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "x" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123" } });
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
    expect(screen.getByText("Password must be at least 6 characters.")).toBeTruthy();
  });
});
