import { Disclaimer } from "@/components/Disclaimer";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInvoice } from "@/hooks/useQueries";
import { INVOICE_STATUS_META } from "@/types";
import { daysRemaining, overdueDays, todayIso } from "@/utils/dates";
import { formatCurrency, formatDateLong } from "@/utils/format";
import {
  DEFAULT_ANNUAL_RATE_PERCENT,
  DEFAULT_MSMED_CONFIG,
  INTEREST_ASSUMPTIONS,
  MSMED_ASSUMPTIONS,
  estimateInterest,
  msmedDueDate,
} from "@/utils/interest";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  IndianRupee,
  Receipt,
} from "lucide-react";

export function InvoiceDetailPage() {
  const { invoiceId } = useParams({ from: "/invoices/$invoiceId" });
  const id = invoiceId ? BigInt(invoiceId) : null;
  const { data, isLoading, isError, refetch } = useInvoice(id);

  if (isLoading) {
    return (
      <div data-ocid="invoice_detail.page" className="space-y-6">
        <LoadingState rows={6} label="Loading invoice details" />
      </div>
    );
  }

  if (isError) {
    return (
      <div data-ocid="invoice_detail.page" className="space-y-6">
        <ErrorState
          description="We could not load this invoice. The request failed."
          onRetry={() => void refetch()}
        />
        <Button type="button" variant="outline" asChild>
          <Link to="/invoices" data-ocid="invoice_detail.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Invoices
          </Link>
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div data-ocid="invoice_detail.page" className="space-y-6">
        <EmptyState
          title="Invoice not found"
          description="This invoice is no longer available in the ledger."
          icon={Receipt}
          action={
            <Button type="button" variant="outline" asChild>
              <Link to="/invoices" data-ocid="invoice_detail.back_link">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to Invoices
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const invoice = data;
  const meta = INVOICE_STATUS_META[invoice.status];
  const asOf = todayIso();
  const remaining = daysRemaining(invoice.dueDate, asOf);
  const overdue = overdueDays(invoice.dueDate, asOf);
  const msmedDue = msmedDueDate(invoice, DEFAULT_MSMED_CONFIG);
  const interest = estimateInterest(invoice, DEFAULT_ANNUAL_RATE_PERCENT, asOf);

  return (
    <div data-ocid="invoice_detail.page" className="space-y-6">
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/invoices" data-ocid="invoice_detail.back_link">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Invoices
        </Link>
      </Button>

      <Disclaimer />

      <Card className="shadow-subtle">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={meta.label} tone={meta.tone} />
            {invoice.msmedApplicable ? (
              <StatusBadge label="MSMED Applicable" tone="info" />
            ) : null}
          </div>
          <CardTitle className="mt-2 font-mono text-2xl">
            {invoice.invoiceNumber}
          </CardTitle>
          <CardDescription>{invoice.buyer}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Building2 className="size-3.5" aria-hidden="true" />
                Buyer
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {invoice.buyer}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <IndianRupee className="size-3.5" aria-hidden="true" />
                Invoice Amount
              </dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {formatCurrency(invoice.amount)}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <IndianRupee className="size-3.5" aria-hidden="true" />
                Balance Outstanding
              </dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {formatCurrency(invoice.balance)}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                Due Date
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {formatDateLong(invoice.dueDate)}
              </dd>
              {invoice.balance > 0n ? (
                <dd
                  className={
                    overdue > 0
                      ? "text-xs font-medium text-destructive"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {overdue > 0
                    ? `${overdue} day${overdue === 1 ? "" : "s"} overdue`
                    : `${remaining} day${remaining === 1 ? "" : "s"} remaining`}
                </dd>
              ) : null}
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Payment Details</CardTitle>
          <CardDescription>
            {invoice.msmedApplicable
              ? `MSMED reference window: ${formatDateLong(msmedDue)} (${DEFAULT_MSMED_CONFIG.monitoringDays} days from ${DEFAULT_MSMED_CONFIG.startFrom === "acceptanceDate" ? "acceptance date, or invoice date when none is recorded" : "invoice date"})`
              : "Standard commercial terms apply to this invoice."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Invoice Date
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {formatDateLong(invoice.invoiceDate)}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Payment Terms
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {invoice.paymentTermsDays.toString()} days
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Amount Paid
              </dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {formatCurrency(invoice.amountPaid)}
              </dd>
            </div>
          </dl>
          {invoice.msmedApplicable ? (
            <p
              data-ocid="invoice_detail.msmed_assumptions"
              className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground"
            >
              {MSMED_ASSUMPTIONS}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">
            Delayed-Payment Interest Estimate
          </CardTitle>
          <CardDescription>
            Estimate only — not a guaranteed recovery and not legal advice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Outstanding Balance
              </dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {formatCurrency(interest.principal)}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Days Overdue
              </dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {interest.daysOverdue}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estimated Interest ({interest.annualRatePercent}% p.a.)
              </dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {formatCurrency(interest.estimatedInterest)}
              </dd>
            </div>
          </dl>
          <p
            data-ocid="invoice_detail.interest_assumptions"
            className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground"
          >
            {INTEREST_ASSUMPTIONS}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
