import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname } }),
  useNavigate: () => vi.fn(),
}));

import { AppLayout } from "@/layouts/AppLayout";
import { Sidebar } from "@/layouts/Sidebar";
import { TopNav } from "@/layouts/TopNav";

describe("Sidebar navigation", () => {
  beforeEach(() => {
    pathname = "/";
  });

  it("renders every primary navigation link", () => {
    render(<Sidebar />);

    for (const label of [
      "Dashboard",
      "Tenders",
      "Orders",
      "Invoices",
      "Documents",
      "Compliance",
      "Business",
      "Settings",
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("highlights the active route", () => {
    pathname = "/invoices";
    render(<Sidebar />);

    expect(screen.getByTestId("nav.invoices")).toHaveClass("bg-sidebar-accent");
    expect(screen.getByTestId("nav.orders")).not.toHaveClass(
      "bg-sidebar-accent",
    );
  });
});

describe("TopNav", () => {
  it("reports global search input changes", async () => {
    const onSearchChange = vi.fn();
    const user = userEvent.setup();
    render(<TopNav onSearchChange={onSearchChange} />);

    await user.type(screen.getByLabelText("Search"), "p");

    expect(onSearchChange).toHaveBeenCalledWith("p");
  });

  it("opens the notifications dropdown", async () => {
    const user = userEvent.setup();
    render(<TopNav />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));

    expect(
      await screen.findByText("Invoice SARR/2026/0151 is overdue"),
    ).toBeInTheDocument();
  });

  it("opens the profile menu with navigation actions", async () => {
    const user = userEvent.setup();
    render(<TopNav />);

    await user.click(screen.getByRole("button", { name: "Profile menu" }));

    expect(
      await screen.findByRole("menuitem", { name: "Business profile" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Settings" }),
    ).toBeInTheDocument();
  });
});

describe("AppLayout", () => {
  it("renders the persistent disclaimer in the footer", () => {
    render(
      <AppLayout>
        <div>content</div>
      </AppLayout>,
    );

    expect(screen.getByText("content")).toBeInTheDocument();
    expect(
      screen.getByText("Academic Project — Not an Official Government Portal."),
    ).toBeInTheDocument();
  });
});
