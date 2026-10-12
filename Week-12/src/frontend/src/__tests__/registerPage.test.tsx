import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const login = vi.fn();

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
  useNavigate: () => vi.fn(),
}));

import { RegisterPage } from "@/pages/RegisterPage";

describe("RegisterPage journey", () => {
  beforeEach(() => {
    login.mockClear();
  });

  it("shows a validation error for an empty submission", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole("button", { name: "Create workspace" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter your business name and email to register.",
    );
    expect(login).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 8 characters", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(
      screen.getByLabelText("Business name"),
      "Sarrthi Precision Components",
    );
    await user.type(screen.getByLabelText("Email"), "owner@business.in");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Create workspace" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a password of at least 8 characters.",
    );
    expect(login).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("logs in and clears the error for a valid submission", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(
      screen.getByLabelText("Business name"),
      "Sarrthi Precision Components",
    );
    await user.type(screen.getByLabelText("Email"), "owner@business.in");
    await user.type(screen.getByLabelText("Password"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Create workspace" }));

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
