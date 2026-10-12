import { Disclaimer } from "@/components/Disclaimer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useBuyerDelayReport,
  useInvoices,
  useMonthlyFinancials,
  useWorkingCapitalEstimate,
} from "@/hooks/useQueries";
import { downloadCsv, toCsv } from "@/utils/csv";
import { formatCurrency } from "@/utils/format";
import { toBigInt } from "@/utils/interest";
import {
  Download,
  IndianRupee,
  Landmark,
  Printer,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function ReportsPage() {
  const monthly = useMonthlyFinancials();
  const delays = useBuyerDelayReport();
  const invoices = useInvoices();

  const [expenses, setExpenses] = useState("150000");
  const [expenseQuery, setExpenseQuery] = useState(150_000n);
  const workingCapital = useWorkingCapitalEstimate(expenseQuery);

  const isLoading = monthly.isLoading || delays.isLoading;
  const isError = monthly.isError || delays.isError;

  const totals = useMemo(() => {
    const rows = monthly.data ?? [];
    return {
      invoiced: rows.reduce((sum, row) => sum + toBigInt(row.invoiced), 0n),
      received: rows.reduce((sum, row) => sum + toBigInt(row.received), 0n),
      outstanding: rows.reduce(
        (sum, row) => sum + toBigInt(row.outstanding),
        0n,
      ),
    };
  }, [monthly.data]);

  function handleExportMonthly() {
    const rows = (monthly.data ?? []).map((row) => [
      row.month,
      row.invoiced.toString(),
      row.received.toString(),
      row.outstanding.toString(),
    ]);
    downloadCsv(
      "sarrthi-monthly-financials.csv",
      toCsv(["Month", "Invoiced", "Received", "Outstanding"], rows),
    );
    toast.success("Monthly financials exported");
  }

  function handleExportDelays() {
    const rows = (delays.data ?? []).map((row) => [
      row.buyer,
      row.invoiceCount.toString(),
      row.averageDelayDays.toString(),
      row.oldestDueDate,
      row.totalOutstanding.toString(),
    ]);
    downloadCsv(
      "sarrthi-buyer-delays.csv",
      toCsv(
        [
          "Buyer",
          "Invoices",
          "Average Delay (days)",
          "Oldest Due",
          "Outstanding",
        ],
        rows,
      ),
    );
    toast.success("Buyer delay report exported");
  }

  function handleExportInvoices() {
    const rows = (invoices.data ?? []).map((invoice) => [
      invoice.invoiceNumber,
      invoice.buyer,
      invoice.amount.toString(),
      invoice.balance.toString(),
      invoice.dueDate,
      invoice.status,
    ]);
    downloadCsv(
      "sarrthi-invoices.csv",
      toCsv(
        ["Invoice", "Buyer", "Amount", "Balance", "Due Date", "Status"],
        rows,
      ),
    );
    toast.success("Invoice report exported");
  }

  function handlePrint() {
    window.print();
  }

  function handleEstimate() {
    const value = Number(expenses);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Enter a valid expense amount");
      return;
    }
    setExpenseQuery(BigInt(Math.round(value)));
  }

  return (
    <div data-ocid="reports.page" className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Review outstanding payments, buyer delays and working capital at a glance."
        actions={
          <Button
            type="button"
            variant="outline"
            data-ocid="reports.print_button"
            onClick={handlePrint}
          >
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Button>
        }
      />

      <Disclaimer />

      {isError ? (
        <ErrorState
          description="We could not load your reports. Check your connection and try again."
          onRetry={() => {
            void monthly.refetch();
            void delays.refetch();
          }}
        />
      ) : null}

      {isLoading ? (
        <LoadingState rows={6} label="Loading reports" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="shadow-subtle">
              <CardContent>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Total Invoiced
                </p>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                  {formatCurrency(totals.invoiced)}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardContent>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Total Received
                </p>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                  {formatCurrency(totals.received)}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardContent>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Outstanding
                </p>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                  {formatCurrency(totals.outstanding)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                Monthly Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(monthly.data ?? []).length === 0 ? (
                <EmptyState
                  title="No financial data"
                  description="Monthly financials will appear once invoices are recorded."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {(monthly.data ?? []).map((row) => (
                    <li
                      key={row.month}
                      data-ocid="reports.month_item"
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <span className="font-medium text-foreground">
                        {row.month}
                      </span>
                      <div className="flex items-center gap-6 font-mono text-sm tabular-nums">
                        <span className="text-muted-foreground">
                          Invoiced {formatCurrency(row.invoiced)}
                        </span>
                        <span className="text-success">
                          Received {formatCurrency(row.received)}
                        </span>
                        <span className="text-warning-foreground">
                          Outstanding {formatCurrency(row.outstanding)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="reports.export_monthly_button"
                onClick={handleExportMonthly}
              >
                <Download className="size-4" aria-hidden="true" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IndianRupee
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                Buyer Delay Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(delays.data ?? []).length === 0 ? (
                <EmptyState
                  title="No outstanding invoices"
                  description="No buyer currently has an outstanding balance."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {(delays.data ?? []).map((row) => (
                    <li
                      key={row.buyer}
                      data-ocid="reports.buyer_item"
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {row.buyer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {toBigInt(row.invoiceCount).toString()} invoice
                          {toBigInt(row.invoiceCount) === 1n ? "" : "s"} · avg
                          delay {toBigInt(row.averageDelayDays).toString()}d
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
                        {formatCurrency(row.totalOutstanding)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="reports.export_delays_button"
                onClick={handleExportDelays}
              >
                <Download className="size-4" aria-hidden="true" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="size-5 text-primary" aria-hidden="true" />
                Working-Capital Gap Estimate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-2 sm:w-64">
                  <Label htmlFor="expenses">Monthly expenses (₹)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    min="0"
                    value={expenses}
                    onChange={(event) => setExpenses(event.target.value)}
                    data-ocid="reports.expenses_input"
                  />
                </div>
                <Button
                  type="button"
                  data-ocid="reports.estimate_button"
                  onClick={handleEstimate}
                  disabled={workingCapital.isFetching}
                >
                  {workingCapital.isFetching ? "Estimating…" : "Estimate gap"}
                </Button>
              </div>
              {workingCapital.data ? (
                <dl
                  data-ocid="reports.working_capital"
                  className="grid gap-4 sm:grid-cols-3"
                >
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Unpaid Invoices
                    </dt>
                    <dd className="font-mono text-sm font-medium text-foreground">
                      {formatCurrency(workingCapital.data.unpaidInvoiceTotal)}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Entered Expenses
                    </dt>
                    <dd className="font-mono text-sm font-medium text-foreground">
                      {formatCurrency(workingCapital.data.enteredExpenses)}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Estimated Gap
                    </dt>
                    <dd className="font-mono text-sm font-medium text-foreground">
                      {formatCurrency(workingCapital.data.estimatedGap)}
                    </dd>
                  </div>
                </dl>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {workingCapital.data?.assumptions ??
                  "Estimate only. The gap is the unpaid invoice total minus your entered monthly expenses; it is not a lending offer."}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Landmark className="size-5 text-primary" aria-hidden="true" />
                TReDS & Financing Referrals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                TReDS (Trade Receivables Discounting System) platforms let MSMEs
                discount invoices accepted by large buyers. This academic build
                provides information and referral guidance only — there is no
                live financing integration and no loan approval.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Confirm buyer acceptance before listing an invoice.</li>
                <li>
                  Compare discount rates across registered TReDS platforms.
                </li>
                <li>
                  Keep delivery and acceptance documents ready as evidence.
                </li>
              </ul>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="reports.export_invoices_button"
                onClick={handleExportInvoices}
              >
                <Download className="size-4" aria-hidden="true" />
                Export invoices CSV
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
