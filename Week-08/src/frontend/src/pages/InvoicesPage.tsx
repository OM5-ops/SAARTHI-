import { Disclaimer } from "@/components/Disclaimer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateInvoice,
  useDeleteInvoice,
  useInvoices,
  useRecordPayment,
} from "@/hooks/useQueries";
import { INVOICE_STATUS_META, InvoiceStatus } from "@/types";
import { daysRemaining, overdueDays, todayIso } from "@/utils/dates";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  DEFAULT_ANNUAL_RATE_PERCENT,
  DEFAULT_MSMED_CONFIG,
  INTEREST_ASSUMPTIONS,
  MSMED_ASSUMPTIONS,
  type MsmedConfig,
  estimateInterest,
  msmedDueDate,
  toBigInt,
} from "@/utils/interest";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calculator,
  IndianRupee,
  Plus,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type SortField = "invoiceNumber" | "buyer" | "amount" | "balance" | "dueDate";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

const INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.draft,
  InvoiceStatus.issued,
  InvoiceStatus.partiallyPaid,
  InvoiceStatus.paid,
  InvoiceStatus.overdue,
];

interface InvoiceFormState {
  invoiceNumber: string;
  buyer: string;
  amount: string;
  invoiceDate: string;
  dueDate: string;
  paymentTermsDays: string;
  acceptanceDate: string;
  msmedApplicable: boolean;
}

function emptyInvoiceForm(): InvoiceFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    invoiceNumber: "",
    buyer: "",
    amount: "",
    invoiceDate: today,
    dueDate: today,
    paymentTermsDays: "45",
    acceptanceDate: "",
    msmedApplicable: true,
  };
}

interface PaymentFormState {
  invoiceId: bigint | null;
  amount: string;
  paidDate: string;
  method: string;
  reference: string;
}

function emptyPaymentForm(): PaymentFormState {
  return {
    invoiceId: null,
    amount: "",
    paidDate: new Date().toISOString().slice(0, 10),
    method: "NEFT",
    reference: "",
  };
}

export function InvoicesPage() {
  const { data, isLoading, isError, refetch } = useInvoices();
  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();
  const deleteInvoice = useDeleteInvoice();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] =
    useState<InvoiceFormState>(emptyInvoiceForm);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const [paymentForm, setPaymentForm] =
    useState<PaymentFormState>(emptyPaymentForm);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: bigint;
    invoiceNumber: string;
  } | null>(null);

  const [msmedConfig, setMsmedConfig] =
    useState<MsmedConfig>(DEFAULT_MSMED_CONFIG);
  const [annualRate, setAnnualRate] = useState(
    String(DEFAULT_ANNUAL_RATE_PERCENT),
  );
  const [interestOpen, setInterestOpen] = useState(false);

  const invoices = data ?? [];
  const asOf = todayIso();
  const parsedRate = Number(annualRate);
  const effectiveRate =
    Number.isFinite(parsedRate) && parsedRate > 0
      ? Math.round(parsedRate)
      : DEFAULT_ANNUAL_RATE_PERCENT;

  const interestRows = useMemo(
    () =>
      invoices
        .filter((invoice) => toBigInt(invoice.balance) > 0n)
        .map((invoice) => ({
          invoice,
          result: estimateInterest(invoice, effectiveRate, asOf),
        }))
        .sort((a, b) => b.result.daysOverdue - a.result.daysOverdue),
    [invoices, effectiveRate, asOf],
  );

  const totalEstimatedInterest = interestRows.reduce(
    (sum, row) => sum + row.result.estimatedInterest,
    0n,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = invoices.filter((invoice) => {
      if (status !== "all" && invoice.status !== status) return false;
      if (!q) return true;
      return (
        invoice.invoiceNumber.toLowerCase().includes(q) ||
        invoice.buyer.toLowerCase().includes(q)
      );
    });
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortField === "invoiceNumber")
        cmp = a.invoiceNumber.localeCompare(b.invoiceNumber);
      else if (sortField === "buyer") cmp = a.buyer.localeCompare(b.buyer);
      else if (sortField === "amount")
        cmp = Number(toBigInt(a.amount) - toBigInt(b.amount));
      else if (sortField === "balance")
        cmp = Number(toBigInt(a.balance) - toBigInt(b.balance));
      else cmp = a.dueDate.localeCompare(b.dueDate);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [invoices, query, status, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const outstanding = filtered.reduce(
    (sum, invoice) => sum + toBigInt(invoice.balance),
    0n,
  );

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3.5" aria-hidden="true" />
    ) : (
      <ArrowDown className="size-3.5" aria-hidden="true" />
    );
  }

  function handleCreateInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(invoiceForm.amount);
    const terms = Number(invoiceForm.paymentTermsDays);
    if (
      !invoiceForm.invoiceNumber.trim() ||
      !invoiceForm.buyer.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setInvoiceError("Enter an invoice number, buyer and a positive amount.");
      return;
    }
    setInvoiceError(null);
    createInvoice.mutate(
      {
        invoiceNumber: invoiceForm.invoiceNumber.trim(),
        buyer: invoiceForm.buyer.trim(),
        amount: BigInt(Math.round(amount)),
        invoiceDate: invoiceForm.invoiceDate,
        dueDate: invoiceForm.dueDate,
        paymentTermsDays: BigInt(
          Number.isFinite(terms) && terms > 0 ? Math.round(terms) : 45,
        ),
        acceptanceDate: invoiceForm.acceptanceDate || undefined,
        msmedApplicable: invoiceForm.msmedApplicable,
      },
      {
        onSuccess: () => {
          toast.success("Invoice created", {
            description: invoiceForm.invoiceNumber.trim(),
          });
          setInvoiceFormOpen(false);
          setInvoiceForm(emptyInvoiceForm());
        },
        onError: () => {
          toast.error("Could not create invoice", {
            description: "The request failed. Please try again.",
          });
        },
      },
    );
  }

  function handleRecordPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(paymentForm.amount);
    if (
      paymentForm.invoiceId === null ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setPaymentError("Choose an invoice and enter a positive amount.");
      return;
    }
    setPaymentError(null);
    recordPayment.mutate(
      {
        invoiceId: paymentForm.invoiceId,
        amount: BigInt(Math.round(amount)),
        paidDate: paymentForm.paidDate,
        method: paymentForm.method.trim() || "NEFT",
        reference: paymentForm.reference.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded", {
            description: formatCurrency(BigInt(Math.round(amount))),
          });
          setPaymentForm(emptyPaymentForm());
        },
        onError: () => {
          toast.error("Could not record payment", {
            description: "The request failed. Please try again.",
          });
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteInvoice.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Invoice deleted", {
          description: deleteTarget.invoiceNumber,
        });
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Could not delete invoice", {
          description: "The request failed. Please try again.",
        });
      },
    });
  }

  return (
    <div data-ocid="invoices.page" className="space-y-6">
      <PageHeader
        eyebrow="Payments"
        title="Invoices & Payments"
        description="Raise invoices, monitor MSMED due dates and track outstanding payments."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="invoices.interest_button"
              onClick={() => setInterestOpen(true)}
            >
              <Calculator className="size-4" aria-hidden="true" />
              Interest Calculator
            </Button>
            <Button
              type="button"
              data-ocid="invoices.add_button"
              onClick={() => {
                setInvoiceForm(emptyInvoiceForm());
                setInvoiceError(null);
                setInvoiceFormOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add Invoice
            </Button>
          </div>
        }
      />

      <Disclaimer />

      <Card className="shadow-subtle">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                MSMED monitoring window
              </h2>
              <p className="text-xs text-muted-foreground">
                Configurable reference window — not a fixed 45 days added to
                every invoice date.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="msmed-days">Monitoring window (days)</Label>
              <Input
                id="msmed-days"
                type="number"
                min="1"
                value={msmedConfig.monitoringDays}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setMsmedConfig((prev) => ({
                    ...prev,
                    monitoringDays:
                      Number.isFinite(next) && next > 0 ? next : 1,
                  }));
                }}
                data-ocid="invoices.msmed.days_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msmed-start">Measure from</Label>
              <Select
                value={msmedConfig.startFrom}
                onValueChange={(value) =>
                  setMsmedConfig((prev) => ({
                    ...prev,
                    startFrom: value as MsmedConfig["startFrom"],
                  }))
                }
              >
                <SelectTrigger
                  id="msmed-start"
                  aria-label="MSMED measurement start"
                  data-ocid="invoices.msmed.start_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acceptanceDate">
                    Acceptance date (fallback: invoice date)
                  </SelectItem>
                  <SelectItem value="invoiceDate">Invoice date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="msmed-covered">Covered buyers only</Label>
              <div className="flex h-10 items-center gap-2">
                <input
                  id="msmed-covered"
                  type="checkbox"
                  checked={msmedConfig.coveredBuyersOnly}
                  onChange={(event) =>
                    setMsmedConfig((prev) => ({
                      ...prev,
                      coveredBuyersOnly: event.target.checked,
                    }))
                  }
                  data-ocid="invoices.msmed.covered_checkbox"
                  className="size-4 rounded border-input"
                />
                <span className="text-sm text-muted-foreground">
                  Restrict to listed covered buyers
                </span>
              </div>
            </div>
          </div>
          {msmedConfig.coveredBuyersOnly ? (
            <div className="space-y-2">
              <Label htmlFor="msmed-buyers">Covered buyers</Label>
              <Input
                id="msmed-buyers"
                value={msmedConfig.coveredBuyers.join(", ")}
                onChange={(event) =>
                  setMsmedConfig((prev) => ({
                    ...prev,
                    coveredBuyers: event.target.value
                      .split(",")
                      .map((buyer) => buyer.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Bharat Heavy Electricals Ltd, Steel Authority of India"
                data-ocid="invoices.msmed.buyers_input"
              />
            </div>
          ) : null}
          <p
            data-ocid="invoices.msmed.assumptions"
            className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground"
          >
            {MSMED_ASSUMPTIONS}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by invoice number or buyer"
                aria-label="Search invoices"
                data-ocid="invoices.search_input"
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as InvoiceStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-full sm:w-52"
                aria-label="Filter by status"
                data-ocid="invoices.status.select"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {INVOICE_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {INVOICE_STATUS_META[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            Outstanding balance:{" "}
            <span className="font-mono font-semibold text-foreground">
              {formatCurrency(outstanding)}
            </span>
          </p>

          {isLoading ? (
            <LoadingState rows={6} label="Loading invoices" />
          ) : isError ? (
            <ErrorState
              description="We could not load your invoices. Check your connection and try again."
              onRetry={() => void refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No invoices found"
              description="No invoices match your current filters. Clear the search to see the full ledger."
              icon={Receipt}
              action={
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="invoices.clear_filters_button"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setPage(1);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table data-ocid="invoices.table">
                  <TableHeader className="sticky top-0 bg-muted/60">
                    <TableRow>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-medium"
                          onClick={() => toggleSort("invoiceNumber")}
                        >
                          Invoice <SortIcon field="invoiceNumber" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-medium"
                          onClick={() => toggleSort("buyer")}
                        >
                          Buyer <SortIcon field="buyer" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          className="ml-auto flex items-center gap-1.5 font-medium"
                          onClick={() => toggleSort("amount")}
                        >
                          Amount <SortIcon field="amount" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          className="ml-auto flex items-center gap-1.5 font-medium"
                          onClick={() => toggleSort("balance")}
                        >
                          Balance <SortIcon field="balance" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-medium"
                          onClick={() => toggleSort("dueDate")}
                        >
                          Due Date <SortIcon field="dueDate" />
                        </button>
                      </TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((invoice, index) => {
                      const meta = INVOICE_STATUS_META[invoice.status];
                      const remaining = daysRemaining(invoice.dueDate, asOf);
                      const overdue = overdueDays(invoice.dueDate, asOf);
                      const msmedDue = msmedDueDate(invoice, msmedConfig);
                      return (
                        <TableRow
                          key={invoice.id.toString()}
                          data-ocid={`invoices.row.${index + 1}`}
                        >
                          <TableCell>
                            <Link
                              to="/invoices/$invoiceId"
                              params={{ invoiceId: invoice.id.toString() }}
                              data-ocid={`invoices.link.${index + 1}`}
                              className="font-mono font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-[12rem] truncate">
                            {invoice.buyer}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatCurrency(invoice.balance)}
                          </TableCell>
                          <TableCell>
                            <span>{formatDate(invoice.dueDate)}</span>
                            {toBigInt(invoice.balance) > 0n ? (
                              <span
                                className={
                                  overdue > 0
                                    ? "mt-0.5 block text-xs font-medium text-destructive"
                                    : "mt-0.5 block text-xs text-muted-foreground"
                                }
                              >
                                {overdue > 0
                                  ? `${overdue} day${overdue === 1 ? "" : "s"} overdue`
                                  : `${remaining} day${remaining === 1 ? "" : "s"} remaining`}
                              </span>
                            ) : null}
                            {msmedDue ? (
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                MSMED ref: {formatDate(msmedDue)}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <StatusBadge label={meta.label} tone={meta.tone} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Record payment for ${invoice.invoiceNumber}`}
                                data-ocid={`invoices.payment_button.${index + 1}`}
                                onClick={() => {
                                  setPaymentForm({
                                    ...emptyPaymentForm(),
                                    invoiceId: invoice.id,
                                  });
                                  setPaymentError(null);
                                }}
                              >
                                <IndianRupee
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Delete ${invoice.invoiceNumber}`}
                                data-ocid={`invoices.delete_button.${index + 1}`}
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: invoice.id,
                                    invoiceNumber: invoice.invoiceNumber,
                                  })
                                }
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {filtered.length}
                  </span>{" "}
                  invoices
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="invoices.pagination_prev"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="invoices.pagination_next"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={invoiceFormOpen} onOpenChange={setInvoiceFormOpen}>
        <DialogContent
          data-ocid="invoices.form_dialog"
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Add invoice</DialogTitle>
            <DialogDescription>
              Raise a new invoice. MSMED monitoring applies when enabled.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateInvoice}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice number</Label>
                <Input
                  id="invoice-number"
                  value={invoiceForm.invoiceNumber}
                  onChange={(event) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      invoiceNumber: event.target.value,
                    }))
                  }
                  placeholder="SARR/2026/0170"
                  data-ocid="invoices.form.number_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-buyer">Buyer</Label>
                <Input
                  id="invoice-buyer"
                  value={invoiceForm.buyer}
                  onChange={(event) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      buyer: event.target.value,
                    }))
                  }
                  placeholder="Bharat Heavy Electricals Ltd"
                  data-ocid="invoices.form.buyer_input"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-amount">Amount (₹)</Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  min="1"
                  value={invoiceForm.amount}
                  onChange={(event) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="1250000"
                  data-ocid="invoices.form.amount_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-terms">Payment terms (days)</Label>
                <Input
                  id="invoice-terms"
                  type="number"
                  min="1"
                  value={invoiceForm.paymentTermsDays}
                  onChange={(event) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      paymentTermsDays: event.target.value,
                    }))
                  }
                  data-ocid="invoices.form.terms_input"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Invoice date</Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={invoiceForm.invoiceDate}
                  onChange={(event) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      invoiceDate: event.target.value,
                    }))
                  }
                  data-ocid="invoices.form.invoice_date_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-due">Due date</Label>
                <Input
                  id="invoice-due"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(event) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      dueDate: event.target.value,
                    }))
                  }
                  data-ocid="invoices.form.due_date_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-acceptance">Acceptance date</Label>
                <Input
                  id="invoice-acceptance"
                  type="date"
                  value={invoiceForm.acceptanceDate}
                  onChange={(event) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      acceptanceDate: event.target.value,
                    }))
                  }
                  data-ocid="invoices.form.acceptance_input"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="invoice-msmed"
                type="checkbox"
                checked={invoiceForm.msmedApplicable}
                onChange={(event) =>
                  setInvoiceForm((prev) => ({
                    ...prev,
                    msmedApplicable: event.target.checked,
                  }))
                }
                data-ocid="invoices.form.msmed_checkbox"
                className="size-4 rounded border-input"
              />
              <Label htmlFor="invoice-msmed">
                MSMED monitoring applies to this invoice
              </Label>
            </div>
            {invoiceError ? (
              <p
                data-ocid="invoices.form.error_state"
                role="alert"
                className="text-sm text-destructive"
              >
                {invoiceError}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="invoices.form.cancel_button"
                onClick={() => setInvoiceFormOpen(false)}
                disabled={createInvoice.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="invoices.form.submit_button"
                disabled={createInvoice.isPending}
              >
                {createInvoice.isPending ? "Creating…" : "Create invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={paymentForm.invoiceId !== null}
        onOpenChange={(open) => {
          if (!open) setPaymentForm(emptyPaymentForm());
        }}
      >
        <DialogContent
          data-ocid="invoices.payment_dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              {invoices.find((i) => i.id === paymentForm.invoiceId)
                ?.invoiceNumber ?? ""}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleRecordPayment}>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount (₹)</Label>
              <Input
                id="payment-amount"
                type="number"
                min="1"
                value={paymentForm.amount}
                onChange={(event) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    amount: event.target.value,
                  }))
                }
                placeholder="900000"
                data-ocid="invoices.payment.amount_input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-date">Paid date</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paymentForm.paidDate}
                  onChange={(event) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      paidDate: event.target.value,
                    }))
                  }
                  data-ocid="invoices.payment.date_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Method</Label>
                <Input
                  id="payment-method"
                  value={paymentForm.method}
                  onChange={(event) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      method: event.target.value,
                    }))
                  }
                  placeholder="NEFT"
                  data-ocid="invoices.payment.method_input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-reference">Reference</Label>
              <Input
                id="payment-reference"
                value={paymentForm.reference}
                onChange={(event) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    reference: event.target.value,
                  }))
                }
                placeholder="NEFT/BHEL/884213"
                data-ocid="invoices.payment.reference_input"
              />
            </div>
            {paymentError ? (
              <p
                data-ocid="invoices.payment.error_state"
                role="alert"
                className="text-sm text-destructive"
              >
                {paymentError}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="invoices.payment.cancel_button"
                onClick={() => setPaymentForm(emptyPaymentForm())}
                disabled={recordPayment.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="invoices.payment.submit_button"
                disabled={recordPayment.isPending}
              >
                {recordPayment.isPending ? "Saving…" : "Record payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent
          data-ocid="invoices.delete_dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Delete invoice</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.invoiceNumber}
              </span>{" "}
              from your ledger. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="invoices.delete_dialog.cancel_button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteInvoice.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-ocid="invoices.delete_dialog.confirm_button"
              onClick={handleDeleteConfirm}
              disabled={deleteInvoice.isPending}
            >
              {deleteInvoice.isPending ? "Deleting…" : "Delete invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={interestOpen} onOpenChange={setInterestOpen}>
        <DialogContent
          data-ocid="invoices.interest_dialog"
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>Delayed-payment interest estimate</DialogTitle>
            <DialogDescription>
              Estimates only — not a guaranteed recovery and not legal advice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interest-rate">Annual rate (%)</Label>
                <Input
                  id="interest-rate"
                  type="number"
                  min="1"
                  value={annualRate}
                  onChange={(event) => setAnnualRate(event.target.value)}
                  data-ocid="invoices.interest.rate_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest-asof">As-of date</Label>
                <Input
                  id="interest-asof"
                  type="date"
                  value={asOf}
                  readOnly
                  data-ocid="invoices.interest.asof_input"
                />
              </div>
            </div>
            <p
              data-ocid="invoices.interest.assumptions"
              className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground"
            >
              {INTEREST_ASSUMPTIONS}
            </p>
            {interestRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No invoices with an outstanding balance to estimate.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table data-ocid="invoices.interest.table">
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Days Overdue</TableHead>
                      <TableHead className="text-right">
                        Est. Interest
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interestRows.map((row, index) => (
                      <TableRow
                        key={row.invoice.id.toString()}
                        data-ocid={`invoices.interest.row.${index + 1}`}
                      >
                        <TableCell className="font-mono">
                          {row.invoice.invoiceNumber}
                        </TableCell>
                        <TableCell className="max-w-[10rem] truncate">
                          {row.invoice.buyer}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrency(row.result.principal)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {row.result.daysOverdue}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrency(row.result.estimatedInterest)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 p-3">
              <span className="text-sm font-medium text-foreground">
                Total estimated interest
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {formatCurrency(totalEstimatedInterest)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="invoices.interest.close_button"
              onClick={() => setInterestOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
