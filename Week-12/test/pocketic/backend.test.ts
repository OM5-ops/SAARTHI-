// PocketIC backend lane for the SARRTHI MSME procurement app.
//
// The frontend suite mocks the actor, so it passes unchanged against a canister
// whose public methods are unimplemented stubs. This file installs the app's own
// compiled wasm into the platform's PocketIC replica and calls the real public
// API, which is the only thing in the build that can see a trapping backend.
//
// The runner declines cleanly (`backend test lane skipped: no_backend_wasm`) when
// `src/backend/dist/backend.wasm` is absent, which is the state of a
// frontend-only build. Nothing here needs to tolerate a missing replica: the runner
// has already guaranteed a live one before this file runs.

import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listOrders()).resolves.toEqual([]);
  await expect(actor.listInvoices()).resolves.toEqual([]);
  await expect(actor.listTenders()).resolves.toEqual([]);
});

it("round-trips a purchase order through the real canister", async () => {
  const id = await actor.createOrder({
    orderNumber: "PO/LANE/2026/0001",
    buyer: "Lane Test Buyer Ltd",
    description: "Lane test order",
    value: 500_000n,
    quantity: 10n,
    unit: "units",
    orderDate: "2026-01-01",
    deliveryDeadline: "2026-02-01",
    status: { placed: null },
  });
  const orders = await actor.listOrders();
  expect(orders).toContainEqual(
    expect.objectContaining({ id, orderNumber: "PO/LANE/2026/0001" }),
  );
});

it("round-trips an invoice and records a payment", async () => {
  const id = await actor.createInvoice({
    invoiceNumber: "SARR/LANE/2026/0001",
    buyer: "Lane Test Buyer Ltd",
    amount: 750_000n,
    invoiceDate: "2026-01-01",
    dueDate: "2026-02-15",
    paymentTermsDays: 45n,
    acceptanceDate: ["2026-01-01"],
    msmedApplicable: true,
    linkedOrderId: [],
  });
  const invoices = await actor.listInvoices();
  expect(invoices).toContainEqual(
    expect.objectContaining({ id, invoiceNumber: "SARR/LANE/2026/0001" }),
  );

  await actor.recordPayment({
    invoiceId: id,
    amount: 400_000n,
    paidDate: "2026-01-20",
    method: "NEFT",
    reference: "NEFT/LANE/1",
  });
  const updated = (await actor.listInvoices()).find((i) => i.id === id);
  expect(updated?.amountPaid).toBe(400_000n);
  expect(updated?.balance).toBe(350_000n);
});

it("round-trips a tender through the real canister", async () => {
  await actor.saveTender({
    id: 1n,
    status: { open: null },
    applicationStage: "Not Started",
    title: "Lane test tender",
    referenceNumber: "LANE/TEST/2026/0001",
    publishedDate: "2026-01-01",
    saved: false,
    eligibility: "Registered MSME",
    msmeEligible: true,
    submissionDeadline: "2026-06-01",
    estimatedValue: 1_000_000n,
    buyer: "Lane Test Buyer Ltd",
    emdAmount: 20_000n,
  });
  const tenders = await actor.listTenders();
  expect(tenders).toContainEqual(
    expect.objectContaining({ referenceNumber: "LANE/TEST/2026/0001" }),
  );
});

it("computes dashboard metrics from the real canister", async () => {
  const metrics = await actor.getDashboardMetrics();
  expect(metrics.totalOrders).toBeGreaterThanOrEqual(0n);
  expect(metrics.outstandingPayments).toBeGreaterThanOrEqual(0n);
});
