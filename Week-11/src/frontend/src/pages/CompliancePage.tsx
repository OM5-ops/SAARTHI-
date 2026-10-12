import { Disclaimer } from "@/components/Disclaimer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useBuyerDelayReport,
  useBuyerRisks,
  useChecklistItems,
  useSaveChecklistItems,
  useTenders,
} from "@/hooks/useQueries";
import type { ChecklistItem } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  AlertTriangle,
  ClipboardList,
  FileSearch,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const MSME_QUOTA_PERCENT = 25;

interface SpecRow {
  parameter: string;
  required: string;
  offered: string;
  status: "match" | "partial" | "gap";
}

const SPEC_COMPARISONS: SpecRow[] = [
  {
    parameter: "Panel rating",
    required: "Up to 630 A",
    offered: "Up to 630 A",
    status: "match",
  },
  {
    parameter: "IP protection",
    required: "IP 42 minimum",
    offered: "IP 42",
    status: "match",
  },
  {
    parameter: "Short-circuit withstand",
    required: "50 kA for 1 s",
    offered: "35 kA for 1 s",
    status: "partial",
  },
  {
    parameter: "Type test certificates",
    required: "Valid, less than 5 years",
    offered: "One certificate expired",
    status: "gap",
  },
];

const SPEC_TONE: Record<
  SpecRow["status"],
  "success" | "warning" | "destructive"
> = {
  match: "success",
  partial: "warning",
  gap: "destructive",
};

const SPEC_LABEL: Record<SpecRow["status"], string> = {
  match: "Match",
  partial: "Partial",
  gap: "Gap",
};

export function CompliancePage() {
  const checklist = useChecklistItems();
  const risks = useBuyerRisks();
  const delays = useBuyerDelayReport();
  const tenders = useTenders();
  const saveChecklist = useSaveChecklistItems();

  const [bidValue, setBidValue] = useState("2500000");
  const [bidRisk, setBidRisk] = useState<number | null>(null);

  const isLoading = checklist.isLoading || risks.isLoading || delays.isLoading;
  const isError = checklist.isError || risks.isError || delays.isError;

  const checklistItems = checklist.data ?? [];
  const completedCount = checklistItems.filter((item) => item.completed).length;

  const tenderList = tenders.data ?? [];
  const msmeEligible = tenderList.filter((t) => t.msmeEligible).length;
  const quotaShare =
    tenderList.length > 0
      ? Math.round((msmeEligible / tenderList.length) * 100)
      : 0;

  const delayRows = delays.data ?? [];

  const riskScore = useMemo(() => {
    const value = Number(bidValue);
    if (!Number.isFinite(value) || value <= 0) return null;
    const checklistGap =
      checklistItems.length > 0
        ? 1 - completedCount / checklistItems.length
        : 0.5;
    const valueRisk = Math.min(1, value / 5_000_000);
    const buyerRisk =
      delayRows.length > 0
        ? Math.min(
            1,
            delayRows.reduce(
              (sum, row) => sum + Number(row.averageDelayDays),
              0,
            ) /
              (delayRows.length * 30),
          )
        : 0;
    return Math.round(
      (checklistGap * 0.4 + valueRisk * 0.3 + buyerRisk * 0.3) * 100,
    );
  }, [bidValue, checklistItems.length, completedCount, delayRows]);

  function handleToggle(item: ChecklistItem, completed: boolean) {
    const next = checklistItems.map((row) =>
      row.id === item.id ? { ...row, completed } : row,
    );
    saveChecklist.mutate(next, {
      onSuccess: () => {
        toast.success(completed ? "Item completed" : "Item reopened", {
          description: item.text,
        });
      },
      onError: () => {
        toast.error("Could not update checklist", {
          description: "The request failed. Please try again.",
        });
      },
    });
  }

  return (
    <div data-ocid="compliance.page" className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Compliance Intelligence"
        description="Track your MSME procurement quota, checklists, buyer delays and pre-bid risk."
      />

      <Disclaimer />

      <div className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Demo analytics — derived from illustrative sample data, not verified
          official government records.
        </p>
      </div>

      {isError ? (
        <ErrorState
          description="We could not load your compliance data. Check your connection and try again."
          onRetry={() => {
            void checklist.refetch();
            void risks.refetch();
            void delays.refetch();
          }}
        />
      ) : null}

      {isLoading ? (
        <LoadingState rows={6} label="Loading compliance data" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="shadow-subtle">
              <CardContent>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  MSME Quota
                </p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {MSME_QUOTA_PERCENT}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Illustrative procurement reservation
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardContent>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  MSME Eligible Tenders
                </p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {msmeEligible} / {tenderList.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {quotaShare}% of your tracked tenders
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardContent>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Checklist Progress
                </p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {completedCount} / {checklistItems.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Items completed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  MSME Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checklistItems.length === 0 ? (
                  <EmptyState
                    title="No checklist items"
                    description="Your compliance checklist is empty."
                  />
                ) : (
                  <ul className="space-y-3">
                    {checklistItems.map((item, index) => (
                      <li
                        key={item.id.toString()}
                        data-ocid={`compliance.checklist_item.${index + 1}`}
                        className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) =>
                            handleToggle(item, checked === true)
                          }
                          disabled={saveChecklist.isPending}
                          aria-label={item.text}
                          data-ocid={`compliance.checklist_checkbox.${index + 1}`}
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">{item.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.category}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  Payment-Delay Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {delayRows.length === 0 ? (
                  <EmptyState
                    title="No delay data"
                    description="No buyer currently has an outstanding balance."
                  />
                ) : (
                  <ul className="divide-y divide-border">
                    {delayRows.map((row, index) => (
                      <li
                        key={row.buyer}
                        data-ocid={`compliance.delay_item.${index + 1}`}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {row.buyer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {row.invoiceCount.toString()} invoice
                            {row.invoiceCount === 1n ? "" : "s"} · avg delay{" "}
                            {row.averageDelayDays.toString()}d · oldest{" "}
                            {formatDate(row.oldestDueDate)}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
                          {formatCurrency(row.totalOutstanding)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  Tender & Order Checklists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Udyam registration certificate is current",
                    "GSTIN returns filed for the last quarter",
                    "EMD instrument prepared for each bid",
                    "Delivery challan raised for every dispatch",
                    "Buyer acceptance recorded before invoicing",
                  ].map((text, index) => (
                    <li
                      key={text}
                      data-ocid={`compliance.tender_checklist.${index + 1}`}
                      className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3"
                    >
                      <span
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <p className="text-sm text-foreground">{text}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileSearch
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  Specification Comparisons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table data-ocid="compliance.spec_table">
                    <TableHeader className="bg-muted/60">
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Offered</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {SPEC_COMPARISONS.map((row, index) => (
                        <TableRow
                          key={row.parameter}
                          data-ocid={`compliance.spec_row.${index + 1}`}
                        >
                          <TableCell className="font-medium text-foreground">
                            {row.parameter}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.required}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.offered}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              label={SPEC_LABEL[row.status]}
                              tone={SPEC_TONE[row.status]}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle
                    className="size-5 text-destructive"
                    aria-hidden="true"
                  />
                  Pre-Bid Risk Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bid-value">Estimated bid value (₹)</Label>
                  <Input
                    id="bid-value"
                    type="number"
                    min="1"
                    value={bidValue}
                    onChange={(event) => {
                      setBidValue(event.target.value);
                      setBidRisk(null);
                    }}
                    data-ocid="compliance.bid_value_input"
                  />
                </div>
                <Button
                  type="button"
                  data-ocid="compliance.score_button"
                  onClick={() => setBidRisk(riskScore)}
                  disabled={riskScore === null}
                >
                  Calculate risk score
                </Button>
                {bidRisk !== null ? (
                  <div
                    data-ocid="compliance.risk_result"
                    className="rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Rule-based risk score
                      </span>
                      <StatusBadge
                        label={`${bidRisk}%`}
                        tone={
                          bidRisk >= 60
                            ? "destructive"
                            : bidRisk >= 35
                              ? "warning"
                              : "success"
                        }
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Transparent rule-based indicator combining checklist
                      completeness, bid value and buyer delay history. It is not
                      an official evaluation.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="text-lg">Buyer Risk Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                {(risks.data ?? []).length === 0 ? (
                  <EmptyState
                    title="No buyer risk data"
                    description="No buyer risk indicators are available yet."
                  />
                ) : (
                  <ul className="space-y-4">
                    {(risks.data ?? []).map((risk, index) => {
                      const score = Number(risk.riskScore);
                      const tone =
                        score >= 60
                          ? "destructive"
                          : score >= 35
                            ? "warning"
                            : "success";
                      return (
                        <li
                          key={risk.buyer}
                          data-ocid={`compliance.buyer_risk.${index + 1}`}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-medium text-foreground">
                              {risk.buyer}
                            </span>
                            <StatusBadge label={`${score}%`} tone={tone} />
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={
                                tone === "destructive"
                                  ? "h-full rounded-full bg-destructive"
                                  : tone === "warning"
                                    ? "h-full rounded-full bg-warning"
                                    : "h-full rounded-full bg-success"
                              }
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
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
