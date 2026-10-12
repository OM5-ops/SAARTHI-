import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Tender } from "@/types";
import { TenderStatus } from "@/types";

const listTenders = vi.fn<() => Promise<Tender[]>>();
const setTenderSaved = vi.fn<(id: bigint, saved: boolean) => Promise<Tender>>();

vi.mock("@/services/dataSource", () => ({
  dataSource: {
    listTenders: () => listTenders(),
    setTenderSaved: (id: bigint, saved: boolean) => setTenderSaved(id, saved),
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
    <a href={`/tenders/${params?.tenderId ?? ""}`} {...props}>
      {children}
    </a>
  ),
  getRouteApi: () => ({
    useSearch: () => ({}),
  }),
}));

import { TendersPage } from "@/pages/TendersPage";

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
      <TendersPage />
    </QueryClientProvider>,
  );
}

describe("TendersPage journey", () => {
  beforeEach(() => {
    listTenders.mockReset();
    setTenderSaved.mockReset();
  });

  it("renders sample tenders and the persistent disclaimer", async () => {
    listTenders.mockResolvedValue([
      makeTender(),
      makeTender({
        id: 2n,
        title: "Fabrication of Signalling Cable Harnesses",
        referenceNumber: "IR/NZ/CH/2026/4471",
        buyer: "Indian Railways — Northern Zone",
        msmeEligible: false,
      }),
    ]);

    renderPage();

    expect(
      await screen.findByText("Supply of LT Control Panels"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Fabrication of Signalling Cable Harnesses"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Academic Project — Not an Official Government Portal."),
    ).toBeInTheDocument();
  });

  it("filters tenders by the search query", async () => {
    listTenders.mockResolvedValue([
      makeTender(),
      makeTender({
        id: 2n,
        title: "Fabrication of Signalling Cable Harnesses",
        referenceNumber: "IR/NZ/CH/2026/4471",
        buyer: "Indian Railways — Northern Zone",
      }),
    ]);

    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Supply of LT Control Panels");
    await user.type(screen.getByLabelText("Search tenders"), "Railways");

    await waitFor(() =>
      expect(
        screen.queryByText("Supply of LT Control Panels"),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByText("Fabrication of Signalling Cable Harnesses"),
    ).toBeInTheDocument();
  });

  it("shows an empty state when no tender matches", async () => {
    listTenders.mockResolvedValue([makeTender()]);

    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Supply of LT Control Panels");
    await user.type(screen.getByLabelText("Search tenders"), "no-such-tender");

    expect(
      await screen.findByText("No tenders match your filters"),
    ).toBeInTheDocument();
  });

  it("toggles a tender as saved", async () => {
    const tender = makeTender();
    listTenders.mockResolvedValue([tender]);
    setTenderSaved.mockResolvedValue({ ...tender, saved: true });

    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Supply of LT Control Panels");
    await user.click(
      screen.getByRole("button", { name: "Save Supply of LT Control Panels" }),
    );

    await waitFor(() => expect(setTenderSaved).toHaveBeenCalledWith(1n, true));
  });
});
