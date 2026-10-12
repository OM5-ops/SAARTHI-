import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const login = vi.fn();
const navigate = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isInitializing: false,
    principal: null,
    login,
    logout: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
  useNavigate: () => navigate,
}));

import { LoginPage } from "@/pages/LoginPage";

describe("LoginPage journey", () => {
  beforeEach(() => {
    login.mockClear();
    navigate.mockClear();
  });

  it("shows a validation error for an empty submission", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter your email and password to continue.",
    );
    expect(login).not.toHaveBeenCalled();
  });

  it("signs in and navigates home for a valid submission", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "owner@business.in");
    await user.type(screen.getByLabelText("Password"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });

  it("signs in through the demo login button", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Demo login" }));

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });

  it("links to the registration screen", () => {
    render(<LoginPage />);

    expect(screen.getByText("Create one")).toHaveAttribute("to", "/register");
  });
});
