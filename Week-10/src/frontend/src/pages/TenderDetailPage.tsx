import type { Tender } from "@/backend";
import { Disclaimer } from "@/components/Disclaimer";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { StatusBadge, TenderStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSetTenderSaved, useTender } from "@/hooks/useTenders";
import { daysUntil, formatCurrency, formatDateLong } from "@/utils/format";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarClock,
  IndianRupee,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

const APPLICATION_STAGES = [
  "Not Started",
  "Documents Prepared",
  "Submitted",
  "Under Evaluation",
  "Result Awaited",
];

function stageIndex(stage: string): number {
  const idx = APPLICATION_STAGES.indexOf(stage);
  return idx === -1 ? 0 : idx;
}

export function TenderDetailPage() {
  const { tenderId } = useParams({ from: "/tenders/$tenderId" });
  const id = tenderId ? BigInt(tenderId) : null;
  const { data, isLoading, isError, refetch } = useTender(id);
  const setSaved = useSetTenderSaved();

  if (isLoading) {
    return (
      <div data-ocid="tender_detail.page" className="space-y-6">
        <LoadingState rows={6} label="Loading tender details" />
      </div>
    );
  }

  if (isError) {
    return (
      <div data-ocid="tender_detail.page" className="space-y-6">
        <ErrorState
          description="We could not load this tender. It may have been removed or the request failed."
          onRetry={() => void refetch()}
        />
        <Button type="button" variant="outline" asChild>
          <Link to="/tenders" data-ocid="tender_detail.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Tenders
          </Link>
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div data-ocid="tender_detail.page" className="space-y-6">
        <EmptyState
          title="Tender not found"
          description="This tender is no longer available in the sample dataset."
          action={
            <Button type="button" variant="outline" asChild>
              <Link to="/tenders" data-ocid="tender_detail.back_link">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to Tenders
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const tender: Tender = data;
  const days = daysUntil(tender.submissionDeadline);
  const currentStage = stageIndex(tender.applicationStage);

  function handleToggleSaved() {
    const next = !tender.saved;
    setSaved.mutate(
      { id: tender.id, saved: next },
      {
        onSuccess: () => {
          toast.success(next ? "Tender saved" : "Tender removed from saved");
        },
        onError: () => {
          toast.error("Could not update saved tender", {
            description: "The request failed. Please try again.",
          });
        },
      },
    );
  }

  return (
    <div data-ocid="tender_detail.page" className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/tenders" data-ocid="tender_detail.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Tenders
          </Link>
        </Button>
        <Button
          type="button"
          variant={tender.saved ? "default" : "outline"}
          size="sm"
          data-ocid="tender_detail.save_button"
          disabled={setSaved.isPending}
          onClick={handleToggleSaved}
        >
          {tender.saved ? (
            <BookmarkCheck className="size-4" aria-hidden="true" />
          ) : (
            <Bookmark className="size-4" aria-hidden="true" />
          )}
          {tender.saved ? "Saved" : "Save Tender"}
        </Button>
      </div>

      <Disclaimer />

      <Card className="shadow-subtle">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <TenderStatusBadge status={tender.status} />
            {tender.msmeEligible ? (
              <StatusBadge label="MSME Eligible" tone="success" />
            ) : (
              <StatusBadge label="Open to All" tone="neutral" />
            )}
          </div>
          <CardTitle className="mt-2 font-display text-2xl">
            {tender.title}
          </CardTitle>
          <CardDescription className="font-mono">
            {tender.referenceNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Building2 className="size-3.5" aria-hidden="true" />
                Buyer
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {tender.buyer}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <IndianRupee className="size-3.5" aria-hidden="true" />
                Estimated Value
              </dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {formatCurrency(tender.estimatedValue)}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Wallet className="size-3.5" aria-hidden="true" />
                EMD Amount
              </dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {formatCurrency(tender.emdAmount)}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                Submission Deadline
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {formatDateLong(tender.submissionDeadline)}
                {days !== null ? (
                  <span
                    className={
                      days < 0
                        ? "ml-2 text-destructive"
                        : days <= 7
                          ? "ml-2 text-warning-foreground"
                          : "ml-2 text-muted-foreground"
                    }
                  >
                    ({days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    )
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-subtle lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              Eligibility
            </CardTitle>
            <CardDescription>
              Confirm your business meets these criteria before applying.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground">{tender.eligibility}</p>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  MSME Reservation
                </span>
                <StatusBadge
                  label={tender.msmeEligible ? "Eligible" : "Not Reserved"}
                  tone={tender.msmeEligible ? "success" : "neutral"}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {tender.msmeEligible
                  ? "This tender reserves a quota for registered MSME suppliers. Keep your Udyam registration current."
                  : "This tender is open to all suppliers. MSME benefits may still apply to evaluation."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg">Application Tracking</CardTitle>
            <CardDescription>
              Current stage: {tender.applicationStage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {APPLICATION_STAGES.map((stage, index) => {
                const done = index <= currentStage;
                return (
                  <li
                    key={stage}
                    data-ocid={`tender_detail.stage.${index + 1}`}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={
                        done
                          ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                          : "flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {index + 1}
                    </span>
                    <span
                      className={
                        done
                          ? "text-sm font-medium text-foreground"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {stage}
                    </span>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
