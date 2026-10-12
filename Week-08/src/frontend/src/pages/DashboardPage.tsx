import { KpiCard, type KpiTone } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import {
  ChartSkeleton,
  ErrorState,
  KpiSkeleton,
  TableSkeleton,
} from "@/components/StateViews";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  useActivity,
  useBuyerRisks,
  useDashboardMetrics,
  useInvoices,
  useMonthlyFinancials,
  useOrders,
  useTenders,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { INVOICE_STATUS_META, InvoiceStatus } from "@/types";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatRelative,
} from "@/utils/format";
import { toBigInt } from "@/utils/interest";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  IndianRupee,
  Package,
  Receipt,
  ShieldAlert,
  ShoppingCart,
} from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const areaConfig: ChartConfig = {
  invoiced: { label: "Invoiced", color: "oklch(var(--chart-1))" },
  received: { label: "Received", color: "oklch(var(--chart-3))" },
};

const donutConfig: ChartConfig = {
  paid: { label: "Paid", color: "oklch(var(--chart-3))" },
  issued: { label: "Issued", color: "oklch(var(--chart-1))" },
  overdue: { label: "Overdue", color: "oklch(var(--chart-4))" },
  partiallyPaid: { label: "Partially Paid", color: "oklch(var(--chart-2))" },
  draft: { label: "Draft", color: "oklch(var(--chart-5))" },
};

const ACTIVITY_ICONS: Record<string, typeof Bell> = {
  invoice: Receipt,
  order: ShoppingCart,
  tender: CalendarClock,
  payment: IndianRupee,
  document: Package,
  compliance: CheckCircle2,
  business: ShieldAlert,
};

export function DashboardPage() {
  const metrics = useDashboardMetrics();
  const monthly = useMonthlyFinancials();
  const invoices = useInvoices();
  const orders = useOrders();
  const tenders = useTenders();
  const activity = useActivity();
  const buyerRisks = useBuyerRisks();

  const isLoading =
    metrics.isLoading ||
    monthly.isLoading ||
    invoices.isLoading ||
    orders.isLoading ||
    tenders.isLoading;

  const isError =
    metrics.isError ||
    monthly.isError ||
    invoices.isError ||
    orders.isError ||
    tenders.isError;

  const invoiceList = invoices.data ?? [];
  const orderList = orders.data ?? [];
  const tenderList = tenders.data ?? [];

  const donutData = useMemo(() => {
    const counts = new Map<InvoiceStatus, number>();
    for (const invoice of invoiceList) {
      counts.set(invoice.status, (counts.get(invoice.status) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([status, count]) => ({
      status,
      label: INVOICE_STATUS_META[status].label,
      value: count,
      fill: `var(--color-${status})`,
    }));
  }, [invoiceList]);

  const areaData = useMemo(
    () =>
      (monthly.data ?? []).map((month) => ({
        month: month.month,
        invoiced: Number(month.invoiced),
        received: Number(month.received),
      })),
    [monthly.data],
  );

  const alerts = useMemo(() => {
    const list: { id: string; tone: KpiTone; title: string; detail: string }[] =
      [];
    const overdue = invoiceList.filter(
      (invoice) => invoice.status === InvoiceStatus.overdue,
    );
    if (overdue.length > 0) {
      list.push({
        id: "overdue",
        tone: "destructive",
        title: `${overdue.length} overdue invoice${overdue.length > 1 ? "s" : ""}`,
        detail: `${formatCurrency(overdue.reduce((sum, i) => sum + toBigInt(i.balance), 0n))} outstanding beyond MSMED due date.`,
      });
    }
    const closingSoon = tenderList.filter(
      (tender) => tender.status === "closingSoon",
    );
    if (closingSoon.length > 0) {
      list.push({
        id: "tenders",
        tone: "warning",
        title: `${closingSoon.length} tender${closingSoon.length > 1 ? "s" : ""} closing soon`,
        detail: "Submission deadlines within the next 14 days.",
      });
    }
    const pending = orderList.filter(
      (order) => order.status === "placed" || order.status === "dispatched",
    );
    if (pending.length > 0) {
      list.push({
        id: "deliveries",
        tone: "primary",
        title: `${pending.length} pending deliver${pending.length > 1 ? "ies" : "y"}`,
        detail: "Orders placed or dispatched awaiting delivery.",
      });
    }
    return list;
  }, [invoiceList, tenderList, orderList]);

  const topInvoices = useMemo(
    () =>
      [...invoiceList]
        .sort((a, b) => (a.balance > b.balance ? -1 : 1))
        .slice(0, 5),
    [invoiceList],
  );

  const metricsData = metrics.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live snapshot of your tenders, orders, invoices and buyer risk."
        actions={
          <Button type="button" variant="outline" asChild>
            <Link to="/reports" data-ocid="dashboard.reports_link">
              View reports
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      {isError ? (
        <ErrorState
          description="We could not load your dashboard data. Check your connection and try again."
          onRetry={() => {
            void metrics.refetch();
            void monthly.refetch();
            void invoices.refetch();
            void orders.refetch();
            void tenders.refetch();
          }}
        />
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {["kpi-1", "kpi-2", "kpi-3", "kpi-4", "kpi-5", "kpi-6"].map((id) => (
            <KpiSkeleton key={id} />
          ))}
        </div>
      ) : metricsData ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            ocid="dashboard.kpi.orders"
            label="Total Orders"
            value={formatNumber(Number(metricsData.totalOrders))}
            hint="all purchase orders"
            tone="primary"
            icon={ShoppingCart}
          />
          <KpiCard
            ocid="dashboard.kpi.tenders"
            label="Active Tenders"
            value={formatNumber(Number(metricsData.activeTenders))}
            hint="open or closing soon"
            tone="primary"
            icon={CalendarClock}
          />
          <KpiCard
            ocid="dashboard.kpi.outstanding"
            label="Outstanding Payments"
            value={formatCompactCurrency(metricsData.outstandingPayments)}
            hint="unpaid balance"
            tone="warning"
            icon={IndianRupee}
          />
          <KpiCard
            ocid="dashboard.kpi.overdue"
            label="Overdue Invoices"
            value={formatNumber(Number(metricsData.overdueInvoices))}
            hint="past MSMED due date"
            tone="destructive"
            icon={AlertTriangle}
          />
          <KpiCard
            ocid="dashboard.kpi.deadlines"
            label="Upcoming Deadlines"
            value={formatNumber(Number(metricsData.upcomingDeadlines))}
            hint="unpaid invoices due today or later"
            tone="warning"
            icon={Clock}
          />
          <KpiCard
            ocid="dashboard.kpi.deliveries"
            label="Pending Deliveries"
            value={formatNumber(Number(metricsData.pendingDeliveries))}
            hint="placed or dispatched"
            tone="primary"
            icon={Package}
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {monthly.isLoading ? (
          <ChartSkeleton className="lg:col-span-2" />
        ) : (
          <Card
            data-ocid="dashboard.financial_chart"
            className="gap-4 rounded-lg border-border p-5 shadow-subtle lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-semibold text-foreground">
                  Monthly Financials
                </h2>
                <p className="text-xs text-muted-foreground">
                  Invoiced vs received, last 7 months
                </p>
              </div>
            </div>
            <ChartContainer config={areaConfig} className="h-64 w-full">
              <AreaChart data={areaData} margin={{ left: 4, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillInvoiced" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-invoiced)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-invoiced)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                  <linearGradient id="fillReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-received)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-received)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={56}
                  tickFormatter={(value: number) =>
                    formatCompactCurrency(BigInt(value))
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        formatCurrency(BigInt(Number(value)))
                      }
                    />
                  }
                />
                <Area
                  dataKey="invoiced"
                  type="monotone"
                  fill="url(#fillInvoiced)"
                  stroke="var(--color-invoiced)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="received"
                  type="monotone"
                  fill="url(#fillReceived)"
                  stroke="var(--color-received)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </Card>
        )}

        {invoices.isLoading ? (
          <ChartSkeleton />
        ) : (
          <Card
            data-ocid="dashboard.invoice_chart"
            className="gap-4 rounded-lg border-border p-5 shadow-subtle"
          >
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">
                Invoice Status
              </h2>
              <p className="text-xs text-muted-foreground">
                Distribution across {invoiceList.length} invoices
              </p>
            </div>
            <ChartContainer
              config={donutConfig}
              className="mx-auto h-52 w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="space-y-2">
              {donutData.map((entry) => (
                <li
                  key={entry.status}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    />
                    {entry.label}
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {entry.value}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          data-ocid="dashboard.alerts_panel"
          className="gap-4 rounded-lg border-border p-5 shadow-subtle"
        >
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-accent-foreground" />
            <h2 className="font-display text-base font-semibold text-foreground">
              In-App Alerts
            </h2>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No alerts. Your ledger is clear.
            </p>
          ) : (
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  data-ocid={`dashboard.alert.${alert.id}`}
                  className="rounded-md border border-border bg-muted/30 p-3"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {alert.detail}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          data-ocid="dashboard.activity_panel"
          className="gap-4 rounded-lg border-border p-5 shadow-subtle lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">
              Recent Activity
            </h2>
            <span className="text-xs text-muted-foreground">
              {activity.data?.length ?? 0} events
            </span>
          </div>
          {activity.isLoading ? (
            <div className="space-y-3">
              {["a-1", "a-2", "a-3", "a-4"].map((id) => (
                <div
                  key={id}
                  className="h-10 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          ) : (activity.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent activity yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {(activity.data ?? []).slice(0, 6).map((entry) => {
                const Icon = ACTIVITY_ICONS[entry.kind] ?? Bell;
                return (
                  <li
                    key={entry.id.toString()}
                    data-ocid="dashboard.activity_item"
                    className="flex items-start gap-3 rounded-md px-2 py-2.5 transition-smooth hover:bg-muted/40"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">
                        {entry.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(entry.timestamp)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {invoices.isLoading ? (
          <TableSkeleton />
        ) : (
          <Card
            data-ocid="dashboard.invoices_panel"
            className="gap-4 rounded-lg border-border p-5 shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-foreground">
                Highest Outstanding Invoices
              </h2>
              <Button type="button" variant="ghost" size="sm" asChild>
                <Link to="/invoices" data-ocid="dashboard.invoices_link">
                  View all
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {topInvoices.map((invoice) => {
                const meta = INVOICE_STATUS_META[invoice.status];
                return (
                  <li
                    key={invoice.id.toString()}
                    data-ocid="dashboard.invoice_item"
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {invoice.buyer}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {formatCurrency(invoice.balance)}
                      </span>
                      <StatusBadge label={meta.label} tone={meta.tone} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        <Card
          data-ocid="dashboard.buyer_risk_panel"
          className="gap-4 rounded-lg border-border p-5 shadow-subtle"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-destructive" />
            <h2 className="font-display text-base font-semibold text-foreground">
              Buyer Risk Indicators
            </h2>
          </div>
          {buyerRisks.isLoading ? (
            <div className="space-y-3">
              {["r-1", "r-2", "r-3"].map((id) => (
                <div
                  key={id}
                  className="h-12 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {(buyerRisks.data ?? []).map((risk) => {
                const score = Number(risk.riskScore);
                const tone: KpiTone =
                  score >= 60
                    ? "destructive"
                    : score >= 35
                      ? "warning"
                      : "success";
                return (
                  <li
                    key={risk.buyer}
                    data-ocid="dashboard.buyer_risk_item"
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium text-foreground">
                        {risk.buyer}
                      </span>
                      <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
                        {score}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          tone === "destructive" && "bg-destructive",
                          tone === "warning" && "bg-warning",
                          tone === "success" && "bg-success",
                        )}
                        style={{ width: `${Math.min(100, score)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {risk.notes}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
