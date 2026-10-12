import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Invoice, InvoiceInput, PaymentInput } from "@/types";
import { InvoiceStatus } from "@/types";

let invoices: Invoice[] = [];

const listInvoices = vi.fn(async () => invoices);
const createInvoice = vi.fn(async (input: InvoiceInput) => {
  const invoice: Invoice = {
    id: BigInt(invoices.length + 1),
    status: InvoiceStatus.issued,
    paymentTermsDays: input.paymentTermsDays,
    balance: input.amount,
    acceptanceDate: input.acceptanceDate ?? input.invoiceDate,
    dueDate: input.dueDate,
    amountPaid: 0n,
    msmedDueDate: input.dueDate,
    invoiceDate: input.invoiceDate,
    invoiceNumber: input.invoiceNumber,
    buyer: input.buyer,
    msmedApplicable: input.msmedApplicable,
    amount: input.amount,
  };
  invoices = [invoice, ...invoices];
  return invoice;
});
const deleteInvoice = vi.fn(async (id: bigint) => {
  invoices = invoices.filter((invoice) => invoice.id !== id);
});
const recordPayment = vi.fn(async (input: PaymentInput) => {
  invoices = invoices.map((invoice) =>
    invoice.id === input.invoiceId
      ? {
          ...invoice,
          amountPaid: invoice.amountPaid + input.amount,
          balance: invoice.balance - input.amount,
        }
      : invoice,
  );
});

vi.mock("@/services/dataSource", () => ({
  dataSource: {
    listInvoices: () => listInvoices(),
    createInvoice: (input: InvoiceInput) => createInvoice(input),
    deleteInvoice: (id: bigint) => deleteInvoice(id),
    recordPayment: (input: PaymentInput) => recordPayment(input),
  },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    params,
    ...props
  }: {
    children: React.ReactNode;
    params?: Record<string, string>;
  }) => (
    <a href={`/invoices/${params?.invoiceId ?? ""}`} {...props}>
      {children}
    </a>
  ),
}));

import { InvoicesPage } from "@/pages/InvoicesPage";

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
      <InvoicesPage />
    </QueryClientProvider>,
  );
}

describe("InvoicesPage journey", () => {
  beforeEach(() => {
    invoices = [makeInvoice()];
    listInvoices.mockClear();
    createInvoice.mockClear();
    deleteInvoice.mockClear();
    recordPayment.mockClear();
  });

  it("renders the invoice ledger and the persistent disclaimer", async () => {
    renderPage();

    expect(await screen.findByText("SARR/2026/0001")).toBeInTheDocument();
    expect(
      screen.getByText("Academic Project — Not an Official Government Portal."),
    ).toBeInTheDocument();
  });

  it("filters invoices by the search query", async () => {
    invoices = [
      makeInvoice(),
      makeInvoice({
        id: 2n,
        invoiceNumber: "SARR/2026/0002",
        buyer: "Steel Authority of India",
      }),
    ];
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("SARR/2026/0001");
    await user.type(screen.getByLabelText("Search invoices"), "Steel");

    await waitFor(() =>
      expect(screen.queryByText("SARR/2026/0001")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("SARR/2026/0002")).toBeInTheDocument();
  });

  it("sorts invoices by amount when the column header is clicked", async () => {
    invoices = [
      makeInvoice({
        id: 1n,
        invoiceNumber: "SARR/2026/0001",
        amount: 900_000n,
      }),
      makeInvoice({
        id: 2n,
        invoiceNumber: "SARR/2026/0002",
        amount: 100_000n,
      }),
    ];
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("SARR/2026/0001");
    await user.click(screen.getByRole("button", { name: /Amount/ }));

    const rows = screen.getAllByRole("row");
    // First data row (after header) should be the smaller amount ascending.
    expect(within(rows[1]).getByText("SARR/2026/0002")).toBeInTheDocument();
  });

  it("paginates the invoice table", async () => {
    invoices = Array.from({ length: 10 }, (_, index) =>
      makeInvoice({
        id: BigInt(index + 1),
        invoiceNumber: `SARR/2026/${String(index + 1).padStart(4, "0")}`,
      }),
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("SARR/2026/0001");
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("validates the add-invoice form before submitting", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("SARR/2026/0001");
    await user.click(screen.getByRole("button", { name: "Add Invoice" }));
    await user.click(screen.getByRole("button", { name: "Create invoice" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter an invoice number, buyer and a positive amount.",
    );
    expect(createInvoice).not.toHaveBeenCalled();
  });

  it("creates an invoice through the form", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("SARR/2026/0001");
    await user.click(screen.getByRole("button", { name: "Add Invoice" }));

    await user.type(screen.getByLabelText("Invoice number"), "SARR/2026/0170");
    await user.type(screen.getByLabelText("Buyer"), "Test Buyer Ltd");
    await user.type(screen.getByLabelText("Amount (₹)"), "1250000");
    await user.click(screen.getByRole("button", { name: "Create invoice" }));

    await waitFor(() => expect(createInvoice).toHaveBeenCalledTimes(1));
    expect(createInvoice.mock.calls[0][0]).toMatchObject({
      invoiceNumber: "SARR/2026/0170",
      buyer: "Test Buyer Ltd",
      amount: 1_250_000n,
    });
    expect(await screen.findByText("SARR/2026/0170")).toBeInTheDocument();
  });

  it("records a payment for an invoice", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("SARR/2026/0001");
    await user.click(
      screen.getByRole("button", { name: "Record payment for SARR/2026/0001" }),
    );
    await user.type(screen.getByLabelText("Amount (₹)"), "400000");
    await user.click(screen.getByRole("button", { name: "Record payment" }));

    await waitFor(() => expect(recordPayment).toHaveBeenCalledTimes(1));
    expect(recordPayment.mock.calls[0][0]).toMatchObject({
      invoiceId: 1n,
      amount: 400_000n,
    });
  });

  it("deletes an invoice after confirmation", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("SARR/2026/0001");
    await user.click(
      screen.getByRole("button", { name: "Delete SARR/2026/0001" }),
    );
    await user.click(screen.getByRole("button", { name: "Delete invoice" }));

    await waitFor(() => expect(deleteInvoice).toHaveBeenCalledWith(1n));
    await waitFor(() =>
      expect(screen.queryByText("SARR/2026/0001")).not.toBeInTheDocument(),
    );
  });

  it("shows the interest estimate dialog with stated assumptions", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("SARR/2026/0001");
    await user.click(
      screen.getByRole("button", { name: "Interest Calculator" }),
    );

    expect(
      await screen.findByText("Delayed-payment interest estimate"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Estimates only/)).toBeInTheDocument();
  });

  it("shows the configurable MSMED monitoring window", async () => {
    renderPage();

    expect(
      await screen.findByText("MSMED monitoring window"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/not a fixed 45 days added to every invoice date/),
    ).toBeInTheDocument();
  });
});
