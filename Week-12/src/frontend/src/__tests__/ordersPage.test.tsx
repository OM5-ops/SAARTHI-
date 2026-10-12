import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OrderInput, PurchaseOrder } from "@/types";
import { OrderStatus } from "@/types";

let orders: PurchaseOrder[] = [];

const listOrders = vi.fn(async () => orders);
const createOrder = vi.fn(async (input: OrderInput) => {
  const order: PurchaseOrder = {
    id: BigInt(orders.length + 1),
    status: input.status,
    deliveryDeadline: input.deliveryDeadline,
    documentIds: [],
    value: input.value,
    unit: input.unit,
    linkedInvoiceIds: [],
    description: input.description,
    orderDate: input.orderDate,
    quantity: input.quantity,
    buyer: input.buyer,
    orderNumber: input.orderNumber,
  };
  orders = [order, ...orders];
  return order;
});
const deleteOrder = vi.fn(async (id: bigint) => {
  orders = orders.filter((order) => order.id !== id);
});

vi.mock("@/services/dataSource", () => ({
  dataSource: {
    listOrders: () => listOrders(),
    createOrder: (input: OrderInput) => createOrder(input),
    deleteOrder: (id: bigint) => deleteOrder(id),
    setOrderStatus: vi.fn(),
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
    <a href={`/orders/${params?.orderId ?? ""}`} {...props}>
      {children}
    </a>
  ),
}));

import { OrdersPage } from "@/pages/OrdersPage";

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

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <OrdersPage />
    </QueryClientProvider>,
  );
}

describe("OrdersPage journey", () => {
  beforeEach(() => {
    orders = [makeOrder()];
    listOrders.mockClear();
    createOrder.mockClear();
    deleteOrder.mockClear();
  });

  it("renders the seeded order ledger", async () => {
    renderPage();

    expect(await screen.findByText("PO/BHEL/2026/0731")).toBeInTheDocument();
    expect(
      screen.getByText("Academic Project — Not an Official Government Portal."),
    ).toBeInTheDocument();
  });

  it("validates the add-order form before submitting", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("PO/BHEL/2026/0731");
    await user.click(screen.getByRole("button", { name: "Add Order" }));
    await user.click(screen.getByRole("button", { name: "Create order" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter an order number, buyer, description, a positive value and quantity, and a unit.",
    );
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("creates an order through the form", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("PO/BHEL/2026/0731");
    await user.click(screen.getByRole("button", { name: "Add Order" }));

    await user.type(screen.getByLabelText("Order number"), "PO/TEST/2026/9999");
    await user.type(screen.getByLabelText("Buyer"), "Test Buyer Ltd");
    await user.type(
      screen.getByLabelText("Description"),
      "Test order description",
    );
    await user.type(screen.getByLabelText("Value (₹)"), "500000");
    await user.type(screen.getByLabelText("Quantity"), "10");
    await user.type(screen.getByLabelText("Unit"), "units");
    await user.click(screen.getByRole("button", { name: "Create order" }));

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    expect(createOrder.mock.calls[0][0]).toMatchObject({
      orderNumber: "PO/TEST/2026/9999",
      buyer: "Test Buyer Ltd",
      value: 500_000n,
      quantity: 10n,
      unit: "units",
    });
    expect(await screen.findByText("PO/TEST/2026/9999")).toBeInTheDocument();
  });

  it("deletes an order after confirmation", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("PO/BHEL/2026/0731");
    await user.click(
      screen.getByRole("button", { name: "Delete PO/BHEL/2026/0731" }),
    );
    await user.click(screen.getByRole("button", { name: "Delete order" }));

    await waitFor(() => expect(deleteOrder).toHaveBeenCalledWith(1n));
    await waitFor(() =>
      expect(screen.queryByText("PO/BHEL/2026/0731")).not.toBeInTheDocument(),
    );
  });
});
