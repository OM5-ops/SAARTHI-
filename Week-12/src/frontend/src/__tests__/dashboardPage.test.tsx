import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ActivityEntry,
  BuyerRisk,
  DashboardMetrics,
  Invoice,
  MonthlyFinancial,
  PurchaseOrder,
  Tender,
} from "@/types";
import { InvoiceStatus, OrderStatus, TenderStatus } from "@/types";

const getDashboardMetrics = vi.fn<() => Promise<DashboardMetrics>>();
const getMonthlyFinancials = vi.fn<() => Promise<MonthlyFinancial[]>>();
const listInvoices = vi.fn<() => Promise<Invoice[]>>();
const listOrders = vi.fn<() => Promise<PurchaseOrder[]>>();
const listTenders = vi.fn<() => Promise<Tender[]>>();
const listActivity = vi.fn<() => Promise<ActivityEntry[]>>();
const listBuyerRisks = vi.fn<() => Promise<BuyerRisk[]>>();

vi.mock("@/services/dataSource", () => ({
  dataSource: {
    getDashboardMetrics: () => getDashboardMetrics(),
    getMonthlyFinancials: () => getMonthlyFinancials(),
    listInvoices: () => listInvoices(),
    listOrders: () => listOrders(),
    listTenders: () => listTenders(),
    listActivity: () => listActivity(),
    listBuyerRisks: () => listBuyerRisks(),
  },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

import { DashboardPage } from "@/pages/DashboardPage";

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

function makeOrder(overrides: Partial<PurchaseOrder> = {}): PurchaseOrder {
  return {
    id: 1n,
    status: OrderStatus.placed,
    deliveryDeadline: "2026-06-01",
    documentIds: [],
    value: 1_250_000n,
    unit: "panels",
    linkedInvoiceIds: [],
    description: "Supply of 40 LT distribution panels",
    orderDate: "2026-01-01",
    quantity: 40n,
    buyer: "Bharat Heavy Electricals Ltd",
    orderNumber: "PO/BHEL/2026/0731",
    ...overrides,
  };
}

function makeTender(overrides: Partial<Tender> = {}): Tender {
  return {
    id: 1n,
    status: TenderStatus.open,
    applicationStage: "Not Started",
    title: "Supply of LT Control Panels",
    referenceNumber: "BHEL/PPU/LTCP/2026/0912",
    publishedDate: "2026-01-01",
    saved: false,
    eligibility: "Registered MSME",
    msmeEligible: true,
    submissionDeadline: "2026-06-01",
    estimatedValue: 4_800_000n,
    buyer: "Bharat Heavy Electricals Ltd",
    emdAmount: 96_000n,
    ...overrides,
  };
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <DashboardPage />
    </QueryClientProvider>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    getDashboardMetrics.mockReset();
    getMonthlyFinancials.mockReset();
    listInvoices.mockReset();
    listOrders.mockReset();
    listTenders.mockReset();
    listActivity.mockReset();
    listBuyerRisks.mockReset();

    getDashboardMetrics.mockResolvedValue({
      totalOrders: 4n,
      overdueInvoices: 1n,
      upcomingDeadlines: 2n,
      generatedAt: 1n,
      activeTenders: 2n,
      outstandingPayments: 5_000_000n,
      pendingDeliveries: 2n,
    });
    getMonthlyFinancials.mockResolvedValue([
      {
        month: "2026-01",
        invoiced: 1_000_000n,
        received: 400_000n,
        outstanding: 600_000n,
      },
    ]);
    listInvoices.mockResolvedValue([makeInvoice()]);
    listOrders.mockResolvedValue([makeOrder()]);
    listTenders.mockResolvedValue([makeTender()]);
    listActivity.mockResolvedValue([
      { id: 1n, kind: "invoice", message: "Invoice created", timestamp: 1n },
    ]);
    listBuyerRisks.mockResolvedValue([
      {
        buyer: "Indian Railways — Northern Zone",
        riskScore: 35n,
        overdueInvoices: 1n,
        averageDelayDays: 2n,
        notes: "Pays within terms.",
      },
    ]);
  });

  it("renders the six KPI cards from the metrics query", async () => {
    renderPage();

    expect(await screen.findByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Active Tenders")).toBeInTheDocument();
    expect(screen.getByText("Outstanding Payments")).toBeInTheDocument();
    expect(screen.getByText("Overdue Invoices")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Deadlines")).toBeInTheDocument();
    expect(screen.getByText("Pending Deliveries")).toBeInTheDocument();
  });

  it("renders the monthly financial and invoice status charts", async () => {
    renderPage();

    expect(await screen.findByText("Monthly Financials")).toBeInTheDocument();
    expect(screen.getByText("Invoice Status")).toBeInTheDocument();
    expect(
      screen.getByText("Highest Outstanding Invoices"),
    ).toBeInTheDocument();
  });

  it("shows an in-app alert for an overdue invoice", async () => {
    listInvoices.mockResolvedValue([
      makeInvoice({ status: InvoiceStatus.overdue }),
    ]);
    renderPage();

    expect(await screen.findByText("1 overdue invoice")).toBeInTheDocument();
  });

  it("shows the buyer risk indicator panel", async () => {
    renderPage();

    expect(
      await screen.findByText("Buyer Risk Indicators"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Indian Railways — Northern Zone"),
    ).toBeInTheDocument();
  });

  it("shows an error state when the metrics query fails", async () => {
    getDashboardMetrics.mockRejectedValue(new Error("network"));
    renderPage();

    expect(
      await screen.findByText(
        "We could not load your dashboard data. Check your connection and try again.",
      ),
    ).toBeInTheDocument();
  });
});
