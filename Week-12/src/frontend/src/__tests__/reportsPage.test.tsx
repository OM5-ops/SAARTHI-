import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  BuyerDelayReport,
  Invoice,
  MonthlyFinancial,
  WorkingCapitalEstimate,
} from "@/types";
import { InvoiceStatus } from "@/types";

const getMonthlyFinancials = vi.fn<() => Promise<MonthlyFinancial[]>>();
const getBuyerDelayReport = vi.fn<() => Promise<BuyerDelayReport[]>>();
const listInvoices = vi.fn<() => Promise<Invoice[]>>();
const getWorkingCapitalEstimate =
  vi.fn<(expenses: bigint) => Promise<WorkingCapitalEstimate>>();

const downloadCsv = vi.fn();

vi.mock("@/services/dataSource", () => ({
  dataSource: {
    getMonthlyFinancials: () => getMonthlyFinancials(),
    getBuyerDelayReport: () => getBuyerDelayReport(),
    listInvoices: () => listInvoices(),
    getWorkingCapitalEstimate: (expenses: bigint) =>
      getWorkingCapitalEstimate(expenses),
  },
}));

vi.mock("@/utils/csv", () => ({
  toCsv: (headers: string[], rows: string[][]) =>
    [headers, ...rows].map((row) => row.join(",")).join("\n"),
  downloadCsv: (filename: string, content: string) =>
    downloadCsv(filename, content),
}));

import { ReportsPage } from "@/pages/ReportsPage";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 1n,
    status: InvoiceStatus.issued,
    paymentTermsDays: 45n,
    balance: 500_000n,
    acceptanceDate: "2026-01-01",
    dueDate: "2026-06-01",
    amountPaid: 0n,
    msmedDueDate: "2026-06-01",
    invoiceDate: "2026-01-01",
    invoiceNumber: "SARR/2026/0001",
    buyer: "Bharat Heavy Electricals Ltd",
    msmedApplicable: true,
    amount: 500_000n,
    ...overrides,
  };
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ReportsPage />
    </QueryClientProvider>,
  );
}

describe("ReportsPage journey", () => {
  beforeEach(() => {
    getMonthlyFinancials.mockReset();
    getBuyerDelayReport.mockReset();
    listInvoices.mockReset();
    getWorkingCapitalEstimate.mockReset();
    downloadCsv.mockReset();

    getMonthlyFinancials.mockResolvedValue([
      {
        month: "2026-01",
        invoiced: 1_000_000n,
        received: 400_000n,
        outstanding: 600_000n,
      },
    ]);
    getBuyerDelayReport.mockResolvedValue([
      {
        buyer: "Indian Railways — Northern Zone",
        invoiceCount: 2n,
        averageDelayDays: 5n,
        oldestDueDate: "2026-01-01",
        totalOutstanding: 900_000n,
      },
    ]);
    listInvoices.mockResolvedValue([makeInvoice()]);
    getWorkingCapitalEstimate.mockResolvedValue({
      unpaidInvoiceTotal: 500_000n,
      enteredExpenses: 150_000n,
      estimatedGap: 350_000n,
      generatedAt: 1n,
      assumptions: "Estimate only.",
    });
  });

  it("renders the monthly financials and buyer delay report", async () => {
    renderPage();

    expect(await screen.findByText("Monthly Financials")).toBeInTheDocument();
    expect(screen.getByText("Buyer Delay Report")).toBeInTheDocument();
    expect(
      screen.getByText("Indian Railways — Northern Zone"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Academic Project — Not an Official Government Portal."),
    ).toBeInTheDocument();
  });

  it("exports the monthly financials as CSV", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Monthly Financials");
    await user.click(screen.getByTestId("reports.export_monthly_button"));

    await waitFor(() => expect(downloadCsv).toHaveBeenCalledTimes(1));
    expect(downloadCsv.mock.calls[0][0]).toBe("sarrthi-monthly-financials.csv");
    expect(downloadCsv.mock.calls[0][1]).toContain("Month");
  });

  it("exports the buyer delay report as CSV", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Buyer Delay Report");
    await user.click(screen.getByTestId("reports.export_delays_button"));

    await waitFor(() => expect(downloadCsv).toHaveBeenCalledTimes(1));
    expect(downloadCsv.mock.calls[0][0]).toBe("sarrthi-buyer-delays.csv");
  });

  it("exports the invoice report as CSV", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("TReDS & Financing Referrals");
    await user.click(
      screen.getByRole("button", { name: "Export invoices CSV" }),
    );

    await waitFor(() => expect(downloadCsv).toHaveBeenCalledTimes(1));
    expect(downloadCsv.mock.calls[0][0]).toBe("sarrthi-invoices.csv");
  });

  it("invokes print for a print-friendly report", async () => {
    const print = vi.fn();
    vi.stubGlobal("print", print);
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Monthly Financials");
    await user.click(screen.getByRole("button", { name: "Print" }));

    expect(print).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("estimates the working-capital gap from entered expenses", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Working-Capital Gap Estimate");
    await user.click(screen.getByRole("button", { name: "Estimate gap" }));

    await waitFor(() =>
      expect(getWorkingCapitalEstimate).toHaveBeenCalledWith(150_000n),
    );
    expect(await screen.findByText("Estimated Gap")).toBeInTheDocument();
  });
});
